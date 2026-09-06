use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{Local, NaiveDateTime};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::report::*;
use crate::utils::remove_accents;

// --- 1. Product Search for Inventory Auditing (/api/inventory/products/search) ---
pub async fn search_inventory_products(
    State(pool): State<SqlitePool>,
    Query(params): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, AppError> {
    let search = params.get("search").cloned().unwrap_or_default();
    if search.trim().is_empty() {
        return Ok(Json(json!([])));
    }

    let s_norm = remove_accents(&search);
    let pattern = format!("%{}%", s_norm);

    let rows = sqlx::query(
        "SELECT id, name, code, unit, secondary_unit, CAST(multiplier AS REAL) as multiplier, \
                CAST(stock AS REAL) as stock, CAST(cost_price AS REAL) as cost_price, latest_audit \
         FROM product \
         WHERE is_active = 1 AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ?) \
         LIMIT 20"
    )
    .bind(&pattern)
    .bind(&pattern)
    .fetch_all(&pool)
    .await?;

    let mut results = Vec::new();
    for r in rows {
        let id: i64 = r.get("id");
        let name: String = r.get("name");
        let code: Option<String> = r.get("code");
        let unit: Option<String> = r.get("unit");
        let secondary_unit: Option<String> = r.get("secondary_unit");
        let multiplier: f64 = r.get("multiplier");
        let stock: f64 = r.get("stock");
        let cost_price: f64 = r.get("cost_price");
        let latest_audit: Option<NaiveDateTime> = r.get("latest_audit");

        results.push(json!({
            "id": id,
            "name": name,
            "code": code,
            "unit": unit,
            "secondary_unit": secondary_unit,
            "multiplier": multiplier,
            "stock": stock,
            "cost_price": cost_price,
            "latest_audit": latest_audit.map(|d| d.to_string())
        }));
    }

    Ok(Json(json!(results)))
}

// --- 2. Create Inventory Audit (/api/inventory/audit) ---
pub async fn create_inventory_audit(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateAuditDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = pool.begin().await?;
    let now = Local::now().naive_local();

    let status = payload.status.unwrap_or_else(|| "Completed".into());

    let audit_res = sqlx::query(
        "INSERT INTO inventory_audit (date, note, status) VALUES (?, ?, ?)"
    )
    .bind(now)
    .bind(&payload.note)
    .bind(&status)
    .execute(&mut *tx)
    .await?;

    let audit_id = audit_res.last_insert_rowid();

    for item in payload.items {
        let actual_stock = item.actual_stock;

        // Fetch current product info
        let prod_row = sqlx::query(
            "SELECT CAST(stock AS REAL) as stock, CAST(cost_price AS REAL) as cost_price \
             FROM product WHERE id = ?"
        )
        .bind(item.product_id)
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(p) = prod_row {
            let current_prod_stock: f64 = p.get("stock");
            let prod_cost_price: f64 = p.get("cost_price");
            let system_stock = item.system_stock.unwrap_or(current_prod_stock);
            let discrepancy = actual_stock - system_stock;

            sqlx::query(
                "INSERT INTO inventory_audit_detail (audit_id, product_id, system_stock, actual_stock, discrepancy) \
                 VALUES (?, ?, ?, ?, ?)"
            )
            .bind(audit_id)
            .bind(item.product_id)
            .bind(system_stock)
            .bind(actual_stock)
            .bind(discrepancy)
            .execute(&mut *tx)
            .await?;

            // Adjust StockBatch for FIFO
            if discrepancy > 0.0 {
                sqlx::query(
                    "INSERT INTO stock_batch (product_id, original_quantity, current_quantity, cost_price, created_at) \
                     VALUES (?, ?, ?, ?, ?)"
                )
                .bind(item.product_id)
                .bind(discrepancy)
                .bind(discrepancy)
                .bind(prod_cost_price)
                .bind(now)
                .execute(&mut *tx)
                .await?;
            } else if discrepancy < 0.0 {
                let mut rem = discrepancy.abs();
                let batches = sqlx::query(
                    "SELECT id, CAST(current_quantity AS REAL) as current_quantity \
                     FROM stock_batch \
                     WHERE product_id = ? AND current_quantity > 0 \
                     ORDER BY created_at ASC"
                )
                .bind(item.product_id)
                .fetch_all(&mut *tx)
                .await?;

                for b in batches {
                    if rem <= 0.0 {
                        break;
                    }
                    let b_id: i64 = b.get("id");
                    let b_qty: f64 = b.get("current_quantity");
                    let take = rem.min(b_qty);
                    let new_b_qty = b_qty - take;
                    rem -= take;

                    sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                        .bind(new_b_qty)
                        .bind(b_id)
                        .execute(&mut *tx)
                        .await?;
                }
            }

            // Update product stock and audit timestamp
            sqlx::query("UPDATE product SET stock = ?, latest_audit = ? WHERE id = ?")
                .bind(actual_stock)
                .bind(now)
                .bind(item.product_id)
                .execute(&mut *tx)
                .await?;
        }
    }

    tx.commit().await?;

    Ok(Json(json!({
        "id": audit_id,
        "date": now.to_string(),
        "note": payload.note,
        "status": status,
        "message": "Kiểm kê kho thành công"
    })))
}

// --- 3. Get Inventory Audits (/api/inventory/audits) ---
pub async fn get_inventory_audits(
    State(pool): State<SqlitePool>,
    Query(params): Query<InventoryAuditQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(20);

    let mut sql = String::from("SELECT id, date, note, status FROM inventory_audit WHERE 1=1");

    if let Some(s) = &params.start_date {
        sql.push_str(&format!(" AND date >= '{}'", s));
    }
    if let Some(e) = &params.end_date {
        if e.len() <= 10 {
            sql.push_str(&format!(" AND date <= '{} 23:59:59'", e));
        } else {
            sql.push_str(&format!(" AND date <= '{}'", e));
        }
    }
    if let Some(search) = &params.search {
        sql.push_str(&format!(" AND note LIKE '%{}%'", search));
    }

    let count_sql = format!("SELECT COUNT(*) FROM ({})", sql);
    let total: i64 = sqlx::query_scalar(&count_sql).fetch_one(&pool).await.unwrap_or(0);

    sql.push_str(&format!(
        " ORDER BY date DESC LIMIT {} OFFSET {}",
        limit,
        (page - 1) * limit
    ));

    let audit_rows = sqlx::query_as::<_, InventoryAudit>(&sql).fetch_all(&pool).await?;

    let mut items = Vec::new();
    for a in audit_rows {
        // Fetch details for each audit
        let detail_rows = sqlx::query(
            "SELECT ad.id, ad.audit_id, ad.product_id, \
                    CAST(ad.system_stock AS REAL) as system_stock, \
                    CAST(ad.actual_stock AS REAL) as actual_stock, \
                    CAST(ad.discrepancy AS REAL) as discrepancy, \
                    p.name as product_name, p.unit, p.secondary_unit, \
                    CAST(p.multiplier AS REAL) as multiplier \
             FROM inventory_audit_detail ad \
             LEFT JOIN product p ON p.id = ad.product_id \
             WHERE ad.audit_id = ?"
        )
        .bind(a.id)
        .fetch_all(&pool)
        .await?;

        let details: Vec<InventoryAuditDetailDto> = detail_rows
            .into_iter()
            .map(|r| {
                let p_name: Option<String> = r.get("product_name");
                let unit: Option<String> = r.get("unit");
                let secondary_unit: Option<String> = r.get("secondary_unit");
                let multiplier: Option<f64> = r.get("multiplier");

                InventoryAuditDetailDto {
                    id: r.get("id"),
                    audit_id: r.get("audit_id"),
                    product_id: r.get("product_id"),
                    product_name: p_name.unwrap_or_else(|| "Sản phẩm đã xóa".into()),
                    unit: unit.unwrap_or_default(),
                    secondary_unit,
                    multiplier: multiplier.unwrap_or(1.0),
                    system_stock: r.get("system_stock"),
                    actual_stock: r.get("actual_stock"),
                    discrepancy: r.get("discrepancy"),
                }
            })
            .collect();

        items.push(InventoryAuditResponseDto {
            id: a.id,
            date: a.date.map(|d| d.to_string()).unwrap_or_default(),
            note: a.note,
            status: a.status,
            details,
        });
    }

    Ok(Json(json!({
        "items": items,
        "total": total,
        "pages": (total + limit - 1) / limit,
        "current_page": page
    })))
}

// --- 4. Inventory Conversions (Chuyển đổi ĐVT / Xẻ lẻ) (/api/inventory/convert) ---
pub async fn convert_inventory(
    State(pool): State<SqlitePool>,
    Json(payload): Json<ConvertInventoryDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.source_qty <= 0.0 {
        return Err(AppError::BadRequest("Số lượng quy đổi không hợp lệ".into()));
    }

    let mut tx = pool.begin().await?;
    let now = Local::now().naive_local();

    // 1. Fetch source product
    let source_row = sqlx::query(
        "SELECT id, name, CAST(stock AS REAL) as stock, CAST(cost_price AS REAL) as cost_price \
         FROM product WHERE id = ?"
    )
    .bind(payload.source_product_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Sản phẩm nguồn không tồn tại".into()))?;

    let source_stock: f64 = source_row.get("stock");
    let source_cost: f64 = source_row.get("cost_price");
    let source_name: String = source_row.get("name");

    if source_stock < payload.source_qty {
        return Err(AppError::BadRequest(format!(
            "Sản phẩm nguồn '{}' không đủ tồn kho (Còn {})",
            source_name, source_stock
        )));
    }

    // 2. Fetch destination product
    let dest_row = sqlx::query(
        "SELECT id, name, CAST(stock AS REAL) as stock \
         FROM product WHERE id = ?"
    )
    .bind(payload.dest_product_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Sản phẩm đích không tồn tại".into()))?;

    let dest_stock: f64 = dest_row.get("stock");

    // 3. FIFO Deduct from source StockBatches
    let mut remaining_to_sub = payload.source_qty;
    let mut total_source_cost = 0.0;

    let batches = sqlx::query(
        "SELECT id, CAST(current_quantity AS REAL) as current_quantity, CAST(cost_price AS REAL) as cost_price \
         FROM stock_batch \
         WHERE product_id = ? AND current_quantity > 0 \
         ORDER BY created_at ASC"
    )
    .bind(payload.source_product_id)
    .fetch_all(&mut *tx)
    .await?;

    for b in batches {
        if remaining_to_sub <= 0.0 {
            break;
        }
        let b_id: i64 = b.get("id");
        let b_qty: f64 = b.get("current_quantity");
        let b_cost: f64 = b.get("cost_price");

        let sub_qty = remaining_to_sub.min(b_qty);
        total_source_cost += sub_qty * b_cost;
        let new_b_qty = b_qty - sub_qty;
        remaining_to_sub -= sub_qty;

        sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
            .bind(new_b_qty)
            .bind(b_id)
            .execute(&mut *tx)
            .await?;
    }

    if remaining_to_sub > 0.0 {
        let fallback_price = payload.cost_price_at_conversion.unwrap_or(source_cost);
        total_source_cost += remaining_to_sub * fallback_price;
    }

    if total_source_cost == 0.0 && payload.cost_price_at_conversion.is_some() {
        total_source_cost = payload.source_qty * payload.cost_price_at_conversion.unwrap();
    }

    // Update source stock
    let new_source_stock = source_stock - payload.source_qty;
    sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
        .bind(new_source_stock)
        .bind(payload.source_product_id)
        .execute(&mut *tx)
        .await?;

    // 4. Update destination stock & Add destination StockBatch
    let multiplier = payload.multiplier.unwrap_or(1.0);
    let dest_qty_expected = payload.source_qty * multiplier;
    let qty_for_cost = if payload.dest_qty_actual > 0.0 {
        payload.dest_qty_actual
    } else {
        dest_qty_expected
    };
    let new_dest_cost = if qty_for_cost > 0.0 {
        total_source_cost / qty_for_cost
    } else {
        0.0
    };

    let new_dest_stock = dest_stock + payload.dest_qty_actual;
    sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
        .bind(new_dest_stock)
        .bind(payload.dest_product_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "INSERT INTO stock_batch (product_id, original_quantity, current_quantity, cost_price, created_at) \
         VALUES (?, ?, ?, ?, ?)"
    )
    .bind(payload.dest_product_id)
    .bind(payload.dest_qty_actual)
    .bind(payload.dest_qty_actual)
    .bind(new_dest_cost)
    .bind(now)
    .execute(&mut *tx)
    .await?;

    // 5. Record Inventory Conversion
    let c_at_c = if payload.source_qty > 0.0 {
        total_source_cost / payload.source_qty
    } else {
        0.0
    };

    let conv_res = sqlx::query(
        "INSERT INTO inventory_conversion \
         (date, source_product_id, dest_product_id, source_qty, multiplier, dest_qty_expected, dest_qty_actual, cost_price_at_conversion, user_id, note) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(now)
    .bind(payload.source_product_id)
    .bind(payload.dest_product_id)
    .bind(payload.source_qty)
    .bind(multiplier)
    .bind(dest_qty_expected)
    .bind(payload.dest_qty_actual)
    .bind(c_at_c)
    .bind(payload.user_id)
    .bind(&payload.note)
    .execute(&mut *tx)
    .await?;

    let conv_id = conv_res.last_insert_rowid();

    tx.commit().await?;

    Ok(Json(json!({
        "message": "Xẻ lẻ thành công!",
        "conversion": {
            "id": conv_id,
            "date": now.to_string(),
            "source_product_id": payload.source_product_id,
            "dest_product_id": payload.dest_product_id,
            "source_qty": payload.source_qty,
            "multiplier": multiplier,
            "dest_qty_expected": dest_qty_expected,
            "dest_qty_actual": payload.dest_qty_actual,
            "cost_price_at_conversion": c_at_c,
            "note": payload.note
        },
        "source_stock": new_source_stock,
        "dest_stock": new_dest_stock
    })))
}

// --- 5. Get Inventory Conversions (/api/inventory/conversions) ---
pub async fn get_conversions(
    State(pool): State<SqlitePool>,
) -> Result<impl IntoResponse, AppError> {
    let rows = sqlx::query(
        "SELECT c.id, c.date, c.source_product_id, c.dest_product_id, \
                CAST(c.source_qty AS REAL) as source_qty, \
                CAST(c.multiplier AS REAL) as multiplier, \
                CAST(c.dest_qty_expected AS REAL) as dest_qty_expected, \
                CAST(c.dest_qty_actual AS REAL) as dest_qty_actual, \
                CAST(c.cost_price_at_conversion AS REAL) as cost_price_at_conversion, \
                c.note, \
                sp.name as source_product_name, \
                dp.name as dest_product_name, \
                u.display_name as user_display_name \
         FROM inventory_conversion c \
         LEFT JOIN product sp ON sp.id = c.source_product_id \
         LEFT JOIN product dp ON dp.id = c.dest_product_id \
         LEFT JOIN user u ON u.id = c.user_id \
         ORDER BY c.date DESC LIMIT 50"
    )
    .fetch_all(&pool)
    .await?;

    let mut results = Vec::new();
    for r in rows {
        let date: Option<NaiveDateTime> = r.get("date");
        let sp_name: Option<String> = r.get("source_product_name");
        let dp_name: Option<String> = r.get("dest_product_name");
        let u_name: Option<String> = r.get("user_display_name");

        results.push(InventoryConversionDto {
            id: r.get("id"),
            date: date.map(|d| d.to_string()).unwrap_or_default(),
            source_product_id: r.get("source_product_id"),
            source_product_name: sp_name.unwrap_or_else(|| "N/A".into()),
            dest_product_id: r.get("dest_product_id"),
            dest_product_name: dp_name.unwrap_or_else(|| "N/A".into()),
            source_qty: r.get("source_qty"),
            multiplier: r.get("multiplier"),
            dest_qty_expected: r.get("dest_qty_expected"),
            dest_qty_actual: r.get("dest_qty_actual"),
            cost_price_at_conversion: r.get("cost_price_at_conversion"),
            note: r.get("note"),
            user_display_name: u_name.unwrap_or_else(|| "Hệ thống".into()),
        });
    }

    Ok(Json(results))
}

// --- 6. Delete Inventory Conversion (/api/inventory/conversions/:id) ---
pub async fn delete_conversion(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let mut tx = pool.begin().await?;

    let conv = sqlx::query_as::<_, InventoryConversion>(
        "SELECT id, date, source_product_id, dest_product_id, \
                CAST(source_qty AS REAL) as source_qty, \
                CAST(multiplier AS REAL) as multiplier, \
                CAST(dest_qty_expected AS REAL) as dest_qty_expected, \
                CAST(dest_qty_actual AS REAL) as dest_qty_actual, \
                CAST(cost_price_at_conversion AS REAL) as cost_price_at_conversion, \
                user_id, note \
         FROM inventory_conversion WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or_else(|| AppError::NotFound("Bản ghi chuyển đổi không tồn tại".into()))?;

    // Reverse stocks
    sqlx::query("UPDATE product SET stock = stock + ? WHERE id = ?")
        .bind(conv.source_qty)
        .bind(conv.source_product_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE product SET stock = stock - ? WHERE id = ?")
        .bind(conv.dest_qty_actual)
        .bind(conv.dest_product_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM inventory_conversion WHERE id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(Json(json!({
        "message": "Đã xóa bản ghi và hoàn lại tồn kho thành công"
    })))
}
