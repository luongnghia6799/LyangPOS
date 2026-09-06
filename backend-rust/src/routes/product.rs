use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Local, NaiveDateTime};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::category::Category;
use crate::models::product::{
    BulkDeleteDto, BulkUpdateDto, ComboItem, ComboItemResponse, CreateProductDto,
    LatestStockEntry, Product, ProductQueryDto, ProductResponse, StockBatch, UpdateProductDto,
};
use crate::utils::{normalize_date_sqlite, remove_accents};

pub async fn get_products(
    State(pool): State<SqlitePool>,
    Query(params): Query<ProductQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    // 1. Fetch categories for lookup
    let categories: Vec<Category> = sqlx::query_as("SELECT id, name, icon FROM category")
        .fetch_all(&pool)
        .await?;
    let category_map: HashMap<i64, (String, String)> = categories
        .into_iter()
        .map(|c| (c.id, (c.name, c.icon.unwrap_or_else(|| "Package".into()))))
        .collect();

    // 2. Fetch all products with explicit CAST to handle both INTEGER and REAL in SQLite
    let raw_products: Vec<Product> = sqlx::query_as(
        "SELECT id, name, code, unit, secondary_unit, \
         CAST(multiplier AS REAL) as multiplier, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(sale_price AS REAL) as sale_price, \
         CAST(stock AS REAL) as stock, \
         expiry_date, active_ingredient, brand, \
         CAST(is_combo AS BOOLEAN) as is_combo, \
         CAST(is_active AS BOOLEAN) as is_active, \
         latest_audit, category_id, \
         CAST(accounting_price AS REAL) as accounting_price, \
         CAST(accounting_stock AS REAL) as accounting_stock, \
         CAST(latest_cost_price AS REAL) as latest_cost_price, \
         CAST(bulk_quantity AS REAL) as bulk_quantity, \
         CAST(bulk_price AS REAL) as bulk_price, \
         alias, \
         CAST(min_stock AS REAL) as min_stock \
         FROM product"
    )
    .fetch_all(&pool)
    .await?;

    // 3. Fetch all active stock batches
    let batches: Vec<StockBatch> = sqlx::query_as(
        "SELECT id, product_id, purchase_order_id, \
         CAST(original_quantity AS REAL) as original_quantity, \
         CAST(current_quantity AS REAL) as current_quantity, \
         CAST(cost_price AS REAL) as cost_price, \
         created_at FROM stock_batch ORDER BY created_at ASC"
    )
    .fetch_all(&pool)
    .await?;

    let mut batches_map: HashMap<i64, Vec<StockBatch>> = HashMap::new();
    for b in batches {
        batches_map.entry(b.product_id).or_default().push(b);
    }

    // 4. Fetch all combo items
    let combo_items_raw: Vec<ComboItem> = sqlx::query_as(
        "SELECT id, combo_id, product_id, CAST(quantity AS REAL) as quantity FROM combo_item"
    )
    .fetch_all(&pool)
    .await?;

    let mut combo_map: HashMap<i64, Vec<ComboItem>> = HashMap::new();
    for ci in combo_items_raw {
        combo_map.entry(ci.combo_id).or_default().push(ci);
    }

    let product_lookup: HashMap<i64, Product> = raw_products
        .iter()
        .map(|p| (p.id, p.clone()))
        .collect();

    let search_norm = params.search.as_deref().map(remove_accents).unwrap_or_default();
    let filter_type = params.filterType.as_deref().unwrap_or("all");
    let include_inactive = params
        .include_inactive
        .as_deref()
        .map(|v| v.eq_ignore_ascii_case("true"))
        .unwrap_or(false);

    let today = Local::now().date_naive();
    let today_str = today.format("%Y-%m-%d").to_string();
    let near_expiry_date = today + chrono::Duration::days(60);
    let near_expiry_str = near_expiry_date.format("%Y-%m-%d").to_string();

    let mut mapped_products: Vec<ProductResponse> = Vec::new();

    for p in raw_products {
        let is_active = p.is_active.unwrap_or(true);
        let is_combo = p.is_combo.unwrap_or(false);

        // Filter: Active / Inactive
        if filter_type == "inactive" {
            if is_active {
                continue;
            }
        } else if !include_inactive && !is_active {
            continue;
        }

        // Filter: Brand
        if let Some(ref b) = params.brand {
            if p.brand.as_deref() != Some(b) {
                continue;
            }
        }

        // Filter: Category
        if let Some(cat_id) = params.category_id {
            if p.category_id != Some(cat_id) {
                continue;
            }
        }

        // Filter: Search
        if !search_norm.is_empty() {
            let name_norm = remove_accents(&p.name);
            let code_norm = p.code.as_deref().map(remove_accents).unwrap_or_default();
            let act_norm = p.active_ingredient.as_deref().map(remove_accents).unwrap_or_default();
            let brand_norm = p.brand.as_deref().map(remove_accents).unwrap_or_default();
            let alias_norm = p.alias.as_deref().map(remove_accents).unwrap_or_default();

            let matches = name_norm.contains(&search_norm)
                || code_norm.contains(&search_norm)
                || act_norm.contains(&search_norm)
                || brand_norm.contains(&search_norm)
                || alias_norm.contains(&search_norm);

            if !matches {
                continue;
            }
        }

        // Calculate Cost Price & Latest Cost Price from Batches
        let mut ui_cost_price = p.cost_price.unwrap_or(0.0);
        let mut latest_cost = p.latest_cost_price.unwrap_or(0.0);
        let mut latest_entry: Option<LatestStockEntry> = None;

        if let Some(prod_batches) = batches_map.get(&p.id) {
            let active_batches: Vec<&StockBatch> =
                prod_batches.iter().filter(|b| b.current_quantity > 0.0).collect();
            if !active_batches.is_empty() {
                let total_qty: f64 = active_batches.iter().map(|b| b.current_quantity).sum();
                if total_qty > 0.0 {
                    ui_cost_price = active_batches
                        .iter()
                        .map(|b| b.current_quantity * b.cost_price)
                        .sum::<f64>()
                        / total_qty;
                }
            }

            if let Some(last_batch) = prod_batches.last() {
                if last_batch.cost_price > 0.0 || latest_cost == 0.0 {
                    latest_cost = last_batch.cost_price;
                }
                if let Some(created_at) = last_batch.created_at {
                    latest_entry = Some(LatestStockEntry {
                        date: created_at.format("%d/%m/%Y").to_string(),
                        quantity: last_batch.original_quantity,
                    });
                }
            }
        }

        if latest_cost == 0.0 {
            latest_cost = ui_cost_price;
        }
        if latest_cost == 0.0 {
            latest_cost = p.cost_price.unwrap_or(0.0);
        }

        let mut final_stock = p.stock.unwrap_or(0.0);
        let mut combo_items_resp: Option<Vec<ComboItemResponse>> = None;

        if is_combo {
            if let Some(c_items) = combo_map.get(&p.id) {
                let mut total_combo_cost = 0.0;
                let mut total_combo_latest_cost = 0.0;
                let mut max_combo_stocks = Vec::new();
                let mut c_resp = Vec::new();

                for item in c_items {
                    if let Some(ing) = product_lookup.get(&item.product_id) {
                        let c_cost = ing.cost_price.unwrap_or(0.0);
                        let ing_stock = ing.stock.unwrap_or(0.0);

                        total_combo_cost += c_cost * item.quantity;
                        total_combo_latest_cost += ing.latest_cost_price.unwrap_or(c_cost) * item.quantity;

                        if item.quantity > 0.0 {
                            max_combo_stocks.push((ing_stock / item.quantity).floor());
                        }

                        c_resp.push(ComboItemResponse {
                            id: item.id,
                            product_id: item.product_id,
                            product_name: ing.name.clone(),
                            quantity: item.quantity,
                        });
                    }
                }

                ui_cost_price = total_combo_cost;
                latest_cost = total_combo_latest_cost;
                final_stock = max_combo_stocks.into_iter().fold(f64::INFINITY, f64::min);
                if final_stock.is_infinite() {
                    final_stock = 0.0;
                }
                combo_items_resp = Some(c_resp);
            }
        }

        // Special filterTypes
        let sale_price = p.sale_price.unwrap_or(0.0);
        let min_stock = p.min_stock.unwrap_or(0.0);
        let multiplier = p.multiplier.unwrap_or(1.0);

        if filter_type == "out_of_stock" && final_stock > 0.0 {
            continue;
        }
        if filter_type == "warning" {
            let threshold = if min_stock > 0.0 { min_stock } else { multiplier };
            if final_stock <= 0.0 || final_stock > threshold {
                continue;
            }
        }
        if filter_type == "loss" && (sale_price >= ui_cost_price || is_combo) {
            continue;
        }
        if filter_type == "expired" {
            let exp_norm = p.expiry_date.as_deref().map(normalize_date_sqlite).unwrap_or_default();
            if exp_norm.is_empty() || exp_norm > today_str {
                continue;
            }
        }
        if filter_type == "near_expiry" {
            let exp_norm = p.expiry_date.as_deref().map(normalize_date_sqlite).unwrap_or_default();
            if exp_norm.is_empty() || exp_norm <= today_str || exp_norm > near_expiry_str {
                continue;
            }
        }

        let (category_name, category_icon) = if let Some(cat_id) = p.category_id {
            category_map
                .get(&cat_id)
                .cloned()
                .unwrap_or_else(|| ("Chưa phân loại".into(), "Package".into()))
        } else {
            ("Chưa phân loại".into(), "Package".into())
        };

        mapped_products.push(ProductResponse {
            id: p.id,
            name: p.name,
            code: p.code,
            unit: p.unit,
            secondary_unit: p.secondary_unit,
            multiplier,
            cost_price: ui_cost_price,
            latest_cost_price: latest_cost,
            sale_price,
            stock: final_stock,
            current_stock: final_stock,
            min_stock,
            expiry_date: p.expiry_date,
            active_ingredient: p.active_ingredient,
            brand: p.brand,
            is_combo,
            is_active,
            latest_audit: p.latest_audit.map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string()),
            latest_stock_entry: latest_entry,
            category_id: p.category_id,
            category_name,
            category_icon,
            accounting_price: p.accounting_price.unwrap_or(0.0),
            accounting_stock: p.accounting_stock.unwrap_or(0.0),
            bulk_quantity: p.bulk_quantity,
            bulk_price: p.bulk_price,
            alias: p.alias,
            combo_items: combo_items_resp,
        });
    }

    // Sort products
    let sort_by = params.sort_by.as_deref().unwrap_or("name");
    let sort_order = params.sort_order.as_deref().unwrap_or("asc");

    mapped_products.sort_by(|a, b| {
        let ord = match sort_by {
            "id" => a.id.cmp(&b.id),
            "code" => a.code.cmp(&b.code),
            "unit" => a.unit.cmp(&b.unit),
            "cost_price" => a.cost_price.partial_cmp(&b.cost_price).unwrap_or(std::cmp::Ordering::Equal),
            "sale_price" => a.sale_price.partial_cmp(&b.sale_price).unwrap_or(std::cmp::Ordering::Equal),
            "stock" => a.stock.partial_cmp(&b.stock).unwrap_or(std::cmp::Ordering::Equal),
            "expiry_date" => a.expiry_date.cmp(&b.expiry_date),
            _ => a.name.cmp(&b.name),
        };
        if sort_order.eq_ignore_ascii_case("desc") {
            ord.reverse()
        } else {
            ord
        }
    });

    // Pagination
    if let (Some(page), Some(limit)) = (params.page, params.limit) {
        let total = mapped_products.len();
        let pages = ((total as f64) / (limit as f64)).ceil() as u32;
        let start = ((page.saturating_sub(1)) * limit) as usize;
        let end = (start + limit as usize).min(total);

        let items = if start < total {
            mapped_products[start..end].to_vec()
        } else {
            Vec::new()
        };

        Ok(Json(json!({
            "items": items,
            "total": total,
            "pages": pages,
            "current_page": page
        })))
    } else {
        Ok(Json(json!(mapped_products)))
    }
}

pub async fn create_product(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateProductDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên sản phẩm không được để trống".into()));
    }

    let multiplier = payload.multiplier.unwrap_or(1.0);
    let cost_price = payload.cost_price.unwrap_or(0.0);
    let sale_price = payload.sale_price.unwrap_or(0.0);
    let stock = payload.stock.unwrap_or(0.0);
    let is_combo = payload.is_combo.unwrap_or(false);
    let is_active = payload.is_active.unwrap_or(true);
    let min_stock = payload.min_stock.unwrap_or(0.0);
    let accounting_price = payload.accounting_price.unwrap_or(0.0);
    let accounting_stock = payload.accounting_stock.unwrap_or(0.0);

    let mut tx = pool.begin().await?;

    let res = sqlx::query(
        "INSERT INTO product (name, code, unit, secondary_unit, multiplier, cost_price, sale_price, \
         stock, expiry_date, active_ingredient, brand, is_combo, is_active, category_id, \
         accounting_price, accounting_stock, bulk_quantity, bulk_price, alias, min_stock) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(payload.name.trim())
    .bind(payload.code.as_deref())
    .bind(payload.unit.as_deref())
    .bind(payload.secondary_unit.as_deref())
    .bind(multiplier)
    .bind(cost_price)
    .bind(sale_price)
    .bind(stock)
    .bind(payload.expiry_date.as_deref())
    .bind(payload.active_ingredient.as_deref())
    .bind(payload.brand.as_deref())
    .bind(is_combo)
    .bind(is_active)
    .bind(payload.category_id)
    .bind(accounting_price)
    .bind(accounting_stock)
    .bind(payload.bulk_quantity)
    .bind(payload.bulk_price)
    .bind(payload.alias.as_deref())
    .bind(min_stock)
    .execute(&mut *tx)
    .await?;

    let new_id = res.last_insert_rowid();

    // Initial stock batch for FIFO
    if stock > 0.0 && !is_combo {
        sqlx::query(
            "INSERT INTO stock_batch (product_id, original_quantity, current_quantity, cost_price) \
             VALUES (?, ?, ?, ?)"
        )
        .bind(new_id)
        .bind(stock)
        .bind(stock)
        .bind(cost_price)
        .execute(&mut *tx)
        .await?;
    }

    // Handle combo items if applicable
    if is_combo {
        if let Some(items) = payload.combo_items {
            for item in items {
                sqlx::query(
                    "INSERT INTO combo_item (combo_id, product_id, quantity) VALUES (?, ?, ?)"
                )
                .bind(new_id)
                .bind(item.product_id)
                .bind(item.quantity)
                .execute(&mut *tx)
                .await?;
            }
        }
    }

    tx.commit().await?;

    Ok((StatusCode::CREATED, Json(json!({
        "id": new_id,
        "message": "Tạo sản phẩm thành công"
    }))))
}

pub async fn update_product(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateProductDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, Product>("SELECT * FROM product WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Sản phẩm không tồn tại".into()))?;

    let name = payload.name.unwrap_or(existing.name);
    let code = payload.code.or(existing.code);
    let unit = payload.unit.or(existing.unit);
    let secondary_unit = payload.secondary_unit.or(existing.secondary_unit);
    let multiplier = payload.multiplier.or(existing.multiplier).unwrap_or(1.0);
    let cost_price = payload.cost_price.or(existing.cost_price).unwrap_or(0.0);
    let sale_price = payload.sale_price.or(existing.sale_price).unwrap_or(0.0);
    let stock = payload.stock.or(existing.stock).unwrap_or(0.0);
    let expiry_date = payload.expiry_date.or(existing.expiry_date);
    let active_ingredient = payload.active_ingredient.or(existing.active_ingredient);
    let brand = payload.brand.or(existing.brand);
    let is_combo = payload.is_combo.or(existing.is_combo).unwrap_or(false);
    let is_active = payload.is_active.or(existing.is_active).unwrap_or(true);
    let category_id = payload.category_id.or(existing.category_id);
    let min_stock = payload.min_stock.or(existing.min_stock).unwrap_or(0.0);
    let alias = payload.alias.or(existing.alias);
    let bulk_quantity = payload.bulk_quantity.or(existing.bulk_quantity);
    let bulk_price = payload.bulk_price.or(existing.bulk_price);
    let accounting_price = payload.accounting_price.or(existing.accounting_price).unwrap_or(0.0);
    let accounting_stock = payload.accounting_stock.or(existing.accounting_stock).unwrap_or(0.0);

    let mut tx = pool.begin().await?;

    sqlx::query(
        "UPDATE product SET name = ?, code = ?, unit = ?, secondary_unit = ?, multiplier = ?, \
         cost_price = ?, sale_price = ?, stock = ?, expiry_date = ?, active_ingredient = ?, \
         brand = ?, is_combo = ?, is_active = ?, category_id = ?, accounting_price = ?, \
         accounting_stock = ?, bulk_quantity = ?, bulk_price = ?, alias = ?, min_stock = ? \
         WHERE id = ?"
    )
    .bind(name.trim())
    .bind(code.as_deref())
    .bind(unit.as_deref())
    .bind(secondary_unit.as_deref())
    .bind(multiplier)
    .bind(cost_price)
    .bind(sale_price)
    .bind(stock)
    .bind(expiry_date.as_deref())
    .bind(active_ingredient.as_deref())
    .bind(brand.as_deref())
    .bind(is_combo)
    .bind(is_active)
    .bind(category_id)
    .bind(accounting_price)
    .bind(accounting_stock)
    .bind(bulk_quantity)
    .bind(bulk_price)
    .bind(alias.as_deref())
    .bind(min_stock)
    .bind(id)
    .execute(&mut *tx)
    .await?;

    if let Some(items) = payload.combo_items {
        sqlx::query("DELETE FROM combo_item WHERE combo_id = ?")
            .bind(id)
            .execute(&mut *tx)
            .await?;

        for item in items {
            sqlx::query(
                "INSERT INTO combo_item (combo_id, product_id, quantity) VALUES (?, ?, ?)"
            )
            .bind(id)
            .bind(item.product_id)
            .bind(item.quantity)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;

    Ok(Json(json!({
        "status": "success",
        "message": "Cập nhật sản phẩm thành công"
    })))
}

pub async fn delete_product(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM combo_item WHERE combo_id = ? OR product_id = ?")
        .bind(id)
        .bind(id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM stock_batch WHERE product_id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    let res = sqlx::query("DELETE FROM product WHERE id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Sản phẩm không tồn tại".into()));
    }

    tx.commit().await?;

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}

pub async fn bulk_update_products(
    State(pool): State<SqlitePool>,
    Json(payload): Json<BulkUpdateDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.ids.is_empty() {
        return Err(AppError::BadRequest("Không có sản phẩm nào được chọn".into()));
    }

    for id in &payload.ids {
        if let Some(cat_id) = payload.category_id {
            sqlx::query("UPDATE product SET category_id = ? WHERE id = ?")
                .bind(cat_id)
                .bind(id)
                .execute(&pool)
                .await?;
        }
        if let Some(ref brand) = payload.brand {
            sqlx::query("UPDATE product SET brand = ? WHERE id = ?")
                .bind(brand)
                .bind(id)
                .execute(&pool)
                .await?;
        }
        if let Some(is_active) = payload.is_active {
            sqlx::query("UPDATE product SET is_active = ? WHERE id = ?")
                .bind(is_active)
                .bind(id)
                .execute(&pool)
                .await?;
        }
    }

    Ok(Json(json!({
        "message": format!("Đã cập nhật {} sản phẩm thành công", payload.ids.len())
    })))
}

pub async fn bulk_delete_products(
    State(pool): State<SqlitePool>,
    Json(payload): Json<BulkDeleteDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.ids.is_empty() {
        return Err(AppError::BadRequest("Không có sản phẩm nào được chọn".into()));
    }

    for id in &payload.ids {
        sqlx::query("DELETE FROM combo_item WHERE combo_id = ? OR product_id = ?")
            .bind(id)
            .bind(id)
            .execute(&pool)
            .await?;
        sqlx::query("DELETE FROM stock_batch WHERE product_id = ?")
            .bind(id)
            .execute(&pool)
            .await?;
        sqlx::query("DELETE FROM product WHERE id = ?")
            .bind(id)
            .execute(&pool)
            .await?;
    }

    Ok(Json(json!({
        "message": format!("Đã xóa {} sản phẩm thành công", payload.ids.len())
    })))
}

pub async fn get_brands(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let rows = sqlx::query("SELECT DISTINCT brand FROM product WHERE brand IS NOT NULL AND brand != '' ORDER BY brand ASC")
        .fetch_all(&pool)
        .await?;

    let brands: Vec<String> = rows.into_iter().map(|r| r.get("brand")).collect();
    Ok(Json(brands))
}

pub async fn recalculate_product_cost_price(pool: &SqlitePool, product_id: i64) -> Result<(), AppError> {
    let prod_opt: Option<Product> = sqlx::query_as(
        "SELECT id, name, code, unit, secondary_unit, \
         CAST(multiplier AS REAL) as multiplier, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(sale_price AS REAL) as sale_price, \
         CAST(stock AS REAL) as stock, \
         expiry_date, active_ingredient, brand, \
         CAST(is_combo AS BOOLEAN) as is_combo, \
         CAST(is_active AS BOOLEAN) as is_active, \
         latest_audit, category_id, \
         CAST(accounting_price AS REAL) as accounting_price, \
         CAST(accounting_stock AS REAL) as accounting_stock, \
         CAST(latest_cost_price AS REAL) as latest_cost_price, \
         CAST(bulk_quantity AS REAL) as bulk_quantity, \
         CAST(bulk_price AS REAL) as bulk_price, \
         alias, CAST(min_stock AS REAL) as min_stock \
         FROM product WHERE id = ?"
    )
    .bind(product_id)
    .fetch_optional(pool)
    .await?;

    let prod = match prod_opt {
        Some(p) => p,
        None => return Ok(()),
    };

    if prod.is_combo.unwrap_or(false) {
        return Ok(());
    }

    // 1. Calculate Average Cost from ACTIVE batches
    let active_batches: Vec<StockBatch> = sqlx::query_as(
        "SELECT id, product_id, purchase_order_id, \
         CAST(original_quantity AS REAL) as original_quantity, \
         CAST(current_quantity AS REAL) as current_quantity, \
         CAST(cost_price AS REAL) as cost_price, created_at \
         FROM stock_batch WHERE product_id = ? AND current_quantity > 0"
    )
    .bind(product_id)
    .fetch_all(pool)
    .await?;

    let mut calculated_avg = 0.0;
    if !active_batches.is_empty() {
        let total_qty: f64 = active_batches.iter().map(|b| b.current_quantity).sum();
        if total_qty > 0.0 {
            let total_value: f64 = active_batches.iter().map(|b| b.current_quantity * b.cost_price).sum();
            calculated_avg = total_value / total_qty;
        }
    }

    let mut new_cost_price = prod.cost_price.unwrap_or(0.0);
    if calculated_avg == 0.0 {
        if new_cost_price <= 0.0 {
            let latest_nonzero: Option<f64> = sqlx::query_scalar(
                "SELECT CAST(cost_price AS REAL) FROM stock_batch WHERE product_id = ? AND cost_price > 0 ORDER BY created_at DESC, id DESC LIMIT 1"
            )
            .bind(product_id)
            .fetch_optional(pool)
            .await?;

            if let Some(c) = latest_nonzero {
                new_cost_price = c;
            }
        }
    } else {
        new_cost_price = calculated_avg;
    }

    // 2. Latest purchase price
    let latest_batch_cost: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(cost_price AS REAL) FROM stock_batch WHERE product_id = ? ORDER BY created_at DESC, id DESC LIMIT 1"
    )
    .bind(product_id)
    .fetch_optional(pool)
    .await?;

    let mut new_latest_cost = prod.latest_cost_price.unwrap_or(0.0);
    if let Some(c) = latest_batch_cost {
        if c > 0.0 {
            new_latest_cost = c;
        }
    }

    sqlx::query("UPDATE product SET cost_price = ?, latest_cost_price = ? WHERE id = ?")
        .bind(new_cost_price)
        .bind(new_latest_cost)
        .bind(product_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn get_product_orders(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = String::from(
        "SELECT DISTINCT o.id, o.display_id, o.date, o.type, o.payment_method, \
                CAST(o.total_amount AS REAL) as total_amount, \
                CAST(o.amount_paid AS REAL) as amount_paid, \
                o.partner_id, p.name as partner_name \
         FROM \"order\" o \
         JOIN order_detail od ON od.order_id = o.id \
         LEFT JOIN partner p ON p.id = o.partner_id \
         WHERE od.product_id = ?"
    );

    if let Some(y) = params.get("year") {
        sql.push_str(&format!(" AND strftime('%Y', o.date) = '{}'", y));
    }
    if let Some(m) = params.get("month") {
        let padded = format!("{:0>2}", m);
        sql.push_str(&format!(" AND strftime('%m', o.date) = '{}'", padded));
    }
    if let Some(d) = params.get("day") {
        let padded = format!("{:0>2}", d);
        sql.push_str(&format!(" AND strftime('%d', o.date) = '{}'", padded));
    }

    sql.push_str(" ORDER BY o.date DESC");

    let rows = sqlx::query(&sql).bind(id).fetch_all(&pool).await?;

    let mut results = Vec::new();
    for r in rows {
        let o_id: i64 = r.get("id");
        let display_id: Option<String> = r.get("display_id");
        let date: Option<NaiveDateTime> = r.get("date");
        let o_type: String = r.get("type");
        let payment_method: Option<String> = r.get("payment_method");
        let total_amount: f64 = r.get("total_amount");
        let amount_paid: f64 = r.get("amount_paid");
        let partner_id: Option<i64> = r.get("partner_id");
        let partner_name: Option<String> = r.get("partner_name");

        results.push(json!({
            "id": o_id,
            "display_id": display_id.unwrap_or_else(|| o_id.to_string()),
            "date": date.map(|d| d.to_string()).unwrap_or_default(),
            "type": o_type,
            "payment_method": payment_method.unwrap_or_else(|| "Cash".into()),
            "total_amount": total_amount,
            "amount_paid": amount_paid,
            "partner_id": partner_id,
            "partner_name": partner_name.unwrap_or_else(|| "Khách Lẻ".into())
        }));
    }

    Ok(Json(results))
}

pub async fn get_product_history(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let rows = sqlx::query(
        "SELECT CAST(od.quantity AS REAL) as quantity, CAST(od.price AS REAL) as price, \
                o.id as order_id, o.display_id, o.date, o.type as order_type, \
                p.name as partner_name \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN partner p ON p.id = o.partner_id \
         WHERE od.product_id = ? \
         ORDER BY o.date DESC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let mut history = Vec::new();
    for r in rows {
        let qty: f64 = r.get("quantity");
        let price: f64 = r.get("price");
        let order_id: i64 = r.get("order_id");
        let display_id: Option<String> = r.get("display_id");
        let date: Option<NaiveDateTime> = r.get("date");
        let order_type: String = r.get("order_type");
        let partner_name: Option<String> = r.get("partner_name");

        let (change_qty, type_label) = if order_type == "Sale" {
            if qty < 0.0 {
                (qty.abs(), "Khách trả hàng")
            } else {
                (-qty, "Bán hàng")
            }
        } else {
            if qty < 0.0 {
                (qty, "Trả hàng NCC")
            } else {
                (qty, "Nhập hàng")
            }
        };

        history.push(json!({
            "date": date.map(|d| d.to_string()).unwrap_or_default(),
            "display_id": display_id.unwrap_or_else(|| order_id.to_string()),
            "order_id": order_id,
            "partner_name": partner_name.unwrap_or_else(|| if order_type == "Sale" { "Khách Lẻ".into() } else { "NCC Vãng Lai".into() }),
            "type": type_label,
            "quantity_change": change_qty,
            "price": price
        }));
    }

    Ok(Json(history))
}

pub async fn get_combo_items(
    State(pool): State<SqlitePool>,
    Path(combo_id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let items = sqlx::query(
        "SELECT ci.id, ci.combo_id, ci.product_id, CAST(ci.quantity AS REAL) as quantity, \
         p.name as product_name, p.code as product_code, p.unit as product_unit, \
         CAST(p.cost_price AS REAL) as cost_price, CAST(p.sale_price AS REAL) as sale_price \
         FROM combo_item ci \
         JOIN product p ON p.id = ci.product_id \
         WHERE ci.combo_id = ?"
    )
    .bind(combo_id)
    .fetch_all(&pool)
    .await?;

    let mut list = Vec::new();
    for r in items {
        list.push(json!({
            "id": r.get::<i64, _>("id"),
            "combo_id": r.get::<i64, _>("combo_id"),
            "product_id": r.get::<i64, _>("product_id"),
            "quantity": r.get::<f64, _>("quantity"),
            "product": {
                "id": r.get::<i64, _>("product_id"),
                "name": r.get::<String, _>("product_name"),
                "code": r.get::<Option<String>, _>("product_code"),
                "unit": r.get::<Option<String>, _>("product_unit"),
                "cost_price": r.get::<f64, _>("cost_price"),
                "sale_price": r.get::<f64, _>("sale_price"),
            }
        }));
    }

    Ok(Json(list))
}

pub async fn set_combo_items(
    State(pool): State<SqlitePool>,
    Path(combo_id): Path<i64>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = pool.begin().await?;
    sqlx::query("DELETE FROM combo_item WHERE combo_id = ?").bind(combo_id).execute(&mut *tx).await?;

    if let Some(arr) = payload.as_array() {
        for item in arr {
            let pid = item.get("product_id").and_then(|v| v.as_i64());
            let qty = item.get("quantity").and_then(|v| v.as_f64()).unwrap_or(1.0);
            if let Some(p) = pid {
                sqlx::query("INSERT INTO combo_item (combo_id, product_id, quantity) VALUES (?, ?, ?)")
                    .bind(combo_id)
                    .bind(p)
                    .bind(qty)
                    .execute(&mut *tx)
                    .await?;
            }
        }
    }

    tx.commit().await?;
    Ok(Json(json!({"message": "Cập nhật thành phần combo thành công!"})))
}

pub async fn get_product_summary(
    State(pool): State<SqlitePool>,
) -> Result<impl IntoResponse, AppError> {
    let now = Local::now().naive_local();
    let today_str = now.format("%Y-%m-%d").to_string();
    let thirty_days_later = (now + chrono::Duration::days(30)).format("%Y-%m-%d").to_string();

    let total_products: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM product WHERE is_active = 1"
    )
    .fetch_one(&pool)
    .await?;

    let out_of_stock: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM product WHERE is_active = 1 AND stock <= 0"
    )
    .fetch_one(&pool)
    .await?;

    let low_stock: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM product WHERE is_active = 1 AND stock > 0 AND stock <= CASE WHEN min_stock > 0 THEN min_stock ELSE COALESCE(multiplier, 1) END"
    )
    .fetch_one(&pool)
    .await?;

    let near_expiry: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM product WHERE is_active = 1 AND expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date >= ? AND expiry_date <= ?"
    )
    .bind(&today_str)
    .bind(&thirty_days_later)
    .fetch_one(&pool)
    .await?;

    Ok(Json(json!({
        "total_products": total_products,
        "out_of_stock": out_of_stock,
        "low_stock": low_stock,
        "near_expiry": near_expiry
    })))
}


