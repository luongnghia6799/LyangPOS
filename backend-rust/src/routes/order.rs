use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::order::{
    CreateOrderDto, ImportConsignmentDto, Order, OrderDetail, OrderDetailResponse,
    OrderPartnerResponse, OrderQueryDto, OrderResponse, UpdateOrderDto,
    UpdateShippedQuantityDto, UpdateShippingStatusDto, UpdateStatusDto,
};
use crate::models::product::{ComboItemResponse, Product, StockBatch};
use crate::routes::partner::recalculate_partner_debt_internal;
use crate::routes::product::recalculate_product_cost_price;
use crate::utils::remove_accents;

pub fn get_vn_time() -> NaiveDateTime {
    Local::now().naive_local()
}

// Adjust negative stock backorder when purchase arrives
pub async fn adjust_negative_stock_backorder(
    pool: &SqlitePool,
    product_id: i64,
    incoming_qty: f64,
    purchase_price: f64,
) -> Result<f64, AppError> {
    let stock_opt: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(stock AS REAL) FROM product WHERE id = ?"
    )
    .bind(product_id)
    .fetch_optional(pool)
    .await?;

    let stock = stock_opt.unwrap_or(0.0);
    if stock >= 0.0 {
        return Ok(incoming_qty);
    }

    let neg_stock = stock.abs();
    let resolve_qty = neg_stock.min(incoming_qty);

    let details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT od.id, od.order_id, od.product_id, od.product_name_override, \
         CAST(od.quantity AS REAL) as quantity, \
         CAST(od.shipped_quantity AS REAL) as shipped_quantity, \
         CAST(od.price AS REAL) as price, \
         CAST(od.cost_price AS REAL) as cost_price, \
         CAST(od.is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(od.invoiced_quantity AS REAL) as invoiced_quantity, \
         od.invoice_no \
         FROM order_detail od \
         JOIN \"order\" o ON od.order_id = o.id \
         WHERE od.product_id = ? AND o.type = 'Sale' \
         ORDER BY o.date DESC"
    )
    .bind(product_id)
    .fetch_all(pool)
    .await?;

    let mut rem = resolve_qty;
    for detail in details {
        if rem <= 0.0 {
            break;
        }
        let qty = detail.quantity;
        let take = rem.min(qty);
        let old_cost = detail.cost_price.unwrap_or(0.0);
        let new_cost = if qty > 0.0 {
            (take * purchase_price + (qty - take) * old_cost) / qty
        } else {
            purchase_price
        };

        sqlx::query("UPDATE order_detail SET cost_price = ? WHERE id = ?")
            .bind(new_cost)
            .bind(detail.id)
            .execute(pool)
            .await?;

        rem -= take;
    }

    Ok(incoming_qty - resolve_qty)
}

pub async fn sync_order_amount_paid(pool: &SqlitePool, order_id: i64) -> Result<(), AppError> {
    let order_opt: Option<Order> = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(order_id)
    .fetch_optional(pool)
    .await?;

    let order = match order_opt {
        Some(o) => o,
        None => return Ok(()),
    };

    if order.payment_method.as_deref() == Some("Debt") {
        let vouchers = sqlx::query(
            "SELECT type, CAST(amount AS REAL) as amount FROM cash_voucher WHERE order_id = ?"
        )
        .bind(order_id)
        .fetch_all(pool)
        .await?;

        let bank_txs = sqlx::query(
            "SELECT type, CAST(amount AS REAL) as amount FROM bank_transaction WHERE order_id = ?"
        )
        .bind(order_id)
        .fetch_all(pool)
        .await?;

        let mut total_paid: f64 = 0.0;
        let is_sale = order.r#type.as_deref() == Some("Sale");

        for v in vouchers {
            let v_type: String = v.get("type");
            let v_amount: f64 = v.get("amount");
            if is_sale {
                if v_type == "Receipt" {
                    total_paid += v_amount;
                } else if v_type == "Payment" {
                    total_paid -= v_amount;
                }
            } else {
                if v_type == "Payment" {
                    total_paid += v_amount;
                } else if v_type == "Receipt" {
                    total_paid -= v_amount;
                }
            }
        }

        for t in bank_txs {
            let t_type: String = t.get("type");
            let t_amount: f64 = t.get("amount");
            if is_sale {
                if t_type == "Deposit" {
                    total_paid += t_amount;
                } else if t_type == "Withdrawal" {
                    total_paid -= t_amount;
                }
            } else {
                if t_type == "Withdrawal" {
                    total_paid += t_amount;
                } else if t_type == "Deposit" {
                    total_paid -= t_amount;
                }
            }
        }

        sqlx::query("UPDATE \"order\" SET amount_paid = ? WHERE id = ?")
            .bind(total_paid)
            .bind(order_id)
            .execute(pool)
            .await?;
    }

    Ok(())
}

async fn populate_order_details_response(
    pool: &SqlitePool,
    order: &Order,
) -> Result<OrderResponse, AppError> {
    // 1. Partner info
    let mut partner_res: Option<OrderPartnerResponse> = None;
    let mut partner_name = if order.r#type.as_deref() == Some("Purchase") {
        "Nhà cung cấp vãng lai".to_string()
    } else {
        "Khách Lẻ".to_string()
    };
    let mut partner_phone = String::new();
    let mut partner_address = String::new();

    if let Some(p_id) = order.partner_id {
        let p_row = sqlx::query(
            "SELECT id, name, phone, address, CAST(debt_balance AS REAL) as debt_balance FROM partner WHERE id = ?"
        )
        .bind(p_id)
        .fetch_optional(pool)
        .await?;

        if let Some(row) = p_row {
            let name: String = row.get("name");
            let phone: Option<String> = row.get("phone");
            let address: Option<String> = row.get("address");
            let debt: f64 = row.get("debt_balance");

            partner_name = name.clone();
            partner_phone = phone.clone().unwrap_or_default();
            partner_address = address.clone().unwrap_or_default();

            partner_res = Some(OrderPartnerResponse {
                id: p_id,
                name,
                phone,
                address,
                debt_balance: debt,
            });
        }
    }

    // 2. Order details
    let detail_rows: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(pool)
    .await?;

    let mut details_resp: Vec<OrderDetailResponse> = Vec::new();
    for d in detail_rows {
        if let Some(prod_id) = d.product_id {
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
            .bind(prod_id)
            .fetch_optional(pool)
            .await?;

            if let Some(p) = prod_opt {
                let mut combo_items_resp = Vec::new();
                if p.is_combo.unwrap_or(false) {
                    let items = sqlx::query(
                        "SELECT ci.id, ci.product_id, p.name as product_name, CAST(ci.quantity AS REAL) as quantity \
                         FROM combo_item ci \
                         JOIN product p ON ci.product_id = p.id \
                         WHERE ci.combo_id = ?"
                    )
                    .bind(p.id)
                    .fetch_all(pool)
                    .await?;

                    for item in items {
                        combo_items_resp.push(ComboItemResponse {
                            id: item.get("id"),
                            product_id: item.get("product_id"),
                            product_name: item.get("product_name"),
                            quantity: item.get("quantity"),
                        });
                    }
                }

                let p_name = d.product_name_override.unwrap_or(p.name);
                let cost = d.cost_price.unwrap_or(p.cost_price.unwrap_or(0.0));
                let qty = d.quantity;
                let price = d.price;

                details_resp.push(OrderDetailResponse {
                    id: d.id,
                    product_id: Some(p.id),
                    product_name: p_name,
                    product_code: p.code.unwrap_or_default(),
                    unit: p.unit.clone().unwrap_or_else(|| "ĐV".to_string()),
                    product_unit: p.unit.unwrap_or_else(|| "ĐV".to_string()),
                    secondary_unit: p.secondary_unit.unwrap_or_default(),
                    multiplier: p.multiplier.unwrap_or(1.0),
                    quantity: qty,
                    shipped_quantity: d.shipped_quantity.unwrap_or(0.0),
                    price,
                    unit_price: price,
                    total_price: qty * price,
                    cost_price: cost,
                    latest_cost_price: p.latest_cost_price.unwrap_or(0.0),
                    stock: p.stock.unwrap_or(0.0),
                    active_ingredient: p.active_ingredient.unwrap_or_default(),
                    specification: String::new(),
                    is_combo: p.is_combo.unwrap_or(false),
                    combo_items: combo_items_resp,
                    is_invoiced: d.is_invoiced.unwrap_or(false),
                    invoiced_quantity: d.invoiced_quantity.unwrap_or(if d.is_invoiced.unwrap_or(false) { qty } else { 0.0 }),
                    invoice_no: d.invoice_no.unwrap_or_default(),
                });
                continue;
            }
        }

        // Custom / Deleted product
        let qty = d.quantity;
        let price = d.price;
        details_resp.push(OrderDetailResponse {
            id: d.id,
            product_id: None,
            product_name: d.product_name_override.unwrap_or_else(|| "Sản phẩm tùy chỉnh".to_string()),
            product_code: String::new(),
            unit: "ĐV".to_string(),
            product_unit: "ĐV".to_string(),
            secondary_unit: String::new(),
            multiplier: 1.0,
            quantity: qty,
            shipped_quantity: d.shipped_quantity.unwrap_or(0.0),
            price,
            unit_price: price,
            total_price: qty * price,
            cost_price: d.cost_price.unwrap_or(0.0),
            latest_cost_price: 0.0,
            stock: 0.0,
            active_ingredient: String::new(),
            specification: String::new(),
            is_combo: false,
            combo_items: Vec::new(),
            is_invoiced: d.is_invoiced.unwrap_or(false),
            invoiced_quantity: d.invoiced_quantity.unwrap_or(0.0),
            invoice_no: d.invoice_no.unwrap_or_default(),
        });
    }

    Ok(OrderResponse {
        id: order.id,
        display_id: order.display_id.clone().unwrap_or_else(|| order.id.to_string()),
        date: order.date.map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string()).unwrap_or_default(),
        partner_id: order.partner_id,
        partner_name,
        partner_address,
        partner_phone,
        partner: partner_res,
        total_amount: order.total_amount.unwrap_or(0.0),
        amount_paid: order.amount_paid.unwrap_or(0.0),
        payment_method: order.payment_method.clone(),
        r#type: order.r#type.clone().unwrap_or_else(|| "Sale".to_string()),
        note: order.note.clone(),
        old_debt: order.old_debt,
        status: order.status.clone(),
        shipping_status: order.shipping_status.clone(),
        shipping_address: order.shipping_address.clone(),
        shipping_phone: order.shipping_phone.clone(),
        delivery_date: order.delivery_date.map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string()),
        cash_given: order.cash_given.unwrap_or(0.0),
        created_by: order.created_by.clone(),
        is_consignment: order.is_consignment.unwrap_or(false),
        is_invoiced: order.is_invoiced.unwrap_or(false),
        invoice_no: order.invoice_no.clone().unwrap_or_default(),
        invoice_date: order.invoice_date.map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string()),
        invoice_note: order.invoice_note.clone().unwrap_or_default(),
        details: details_resp,
    })
}

// GET /api/orders
pub async fn get_orders(
    State(pool): State<SqlitePool>,
    Query(params): Query<OrderQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = String::from(
        "SELECT DISTINCT o.id, o.date, o.partner_id, CAST(o.total_amount AS REAL) as total_amount, \
         o.payment_method, o.type, o.note, CAST(o.amount_paid AS REAL) as amount_paid, \
         CAST(o.old_debt AS REAL) as old_debt, o.display_id, o.status, o.shipping_status, \
         o.shipping_address, o.shipping_phone, o.delivery_date, CAST(o.cash_given AS REAL) as cash_given, \
         o.created_by, CAST(o.is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(o.is_consignment AS BOOLEAN) as is_consignment, \
         CAST(o.is_invoiced AS BOOLEAN) as is_invoiced, o.invoice_no, o.invoice_date, o.invoice_note \
         FROM \"order\" o \
         LEFT JOIN partner p ON o.partner_id = p.id \
         LEFT JOIN order_detail od ON o.id = od.order_id \
         LEFT JOIN product prod ON od.product_id = prod.id \
         WHERE 1=1"
    );

    let mut count_sql = String::from(
        "SELECT COUNT(DISTINCT o.id) \
         FROM \"order\" o \
         LEFT JOIN partner p ON o.partner_id = p.id \
         LEFT JOIN order_detail od ON o.id = od.order_id \
         LEFT JOIN product prod ON od.product_id = prod.id \
         WHERE 1=1"
    );

    let mut conditions = String::new();

    // General search across order ID, partner name/phone, product name/code
    if let Some(ref s) = params.search {
        if !s.trim().is_empty() {
            let norm = remove_accents(s.trim());
            conditions.push_str(&format!(
                " AND (o.display_id LIKE '%{s}%' OR CAST(o.id AS TEXT) LIKE '%{s}%' OR p.phone LIKE '%{s}%' \
                 OR od.product_name_override LIKE '%{s}%' \
                 OR lower(coalesce(p.name, 'KHÁCH LẺ')) LIKE '%{norm}%' \
                 OR lower(coalesce(prod.name, '')) LIKE '%{norm}%')"
            ));
        }
    }

    if let Some(ref ot) = params.r#type {
        conditions.push_str(&format!(" AND o.type = '{ot}'"));
    }

    if let Some(ref pm) = params.payment_method {
        conditions.push_str(&format!(" AND o.payment_method = '{pm}'"));
    }

    if let Some(p_id) = params.partner_id {
        if p_id == 0 {
            conditions.push_str(" AND o.partner_id IS NULL");
        } else {
            conditions.push_str(&format!(" AND o.partner_id = {p_id}"));
        }
    }

    if let Some(ref sp) = params.search_partner {
        if !sp.trim().is_empty() {
            let norm = remove_accents(sp.trim());
            conditions.push_str(&format!(
                " AND lower(coalesce(p.name, 'KHÁCH LẺ')) LIKE '%{norm}%'"
            ));
        }
    }

    if let Some(ref sid) = params.search_id {
        if !sid.trim().is_empty() {
            conditions.push_str(&format!(
                " AND (o.display_id LIKE '%{sid}%' OR CAST(o.id AS TEXT) LIKE '%{sid}%')"
            ));
        }
    }

    if let Some(ref sprod) = params.search_product {
        if !sprod.trim().is_empty() {
            let norm = remove_accents(sprod.trim());
            conditions.push_str(&format!(
                " AND (od.product_name_override LIKE '%{sprod}%' OR lower(coalesce(prod.name, '')) LIKE '%{norm}%')"
            ));
        }
    }

    if let Some(prod_id) = params.product_id {
        conditions.push_str(&format!(" AND od.product_id = {prod_id}"));
    }

    if let Some(ref min_p) = params.min_price {
        conditions.push_str(&format!(" AND o.total_amount >= {min_p}"));
    }

    if let Some(ref max_p) = params.max_price {
        conditions.push_str(&format!(" AND o.total_amount <= {max_p}"));
    }

    if let Some(ref ss) = params.shipping_status {
        if ss == "any" {
            conditions.push_str(" AND o.shipping_status IS NOT NULL");
        } else {
            conditions.push_str(&format!(" AND o.shipping_status = '{ss}'"));
        }
    }

    if let Some(ref is_c) = params.is_consignment {
        let is_c_bool = is_c.to_lowercase() == "true";
        conditions.push_str(&format!(" AND o.is_consignment = {}", if is_c_bool { 1 } else { 0 }));
    }

    // Date filters
    if let Some(ref start_d) = params.start_date {
        conditions.push_str(&format!(" AND o.date >= '{start_d}'"));
    }
    if let Some(ref end_d) = params.end_date {
        let end_val = if end_d.len() <= 10 {
            format!("{end_d}T23:59:59")
        } else {
            end_d.clone()
        };
        conditions.push_str(&format!(" AND o.date <= '{end_val}'"));
    }

    if let Some(ref y) = params.year {
        conditions.push_str(&format!(" AND strftime('%Y', o.date) = '{y}'"));
    }
    if let Some(ref m) = params.month {
        let m_pad = format!("{:02}", m.parse::<i32>().unwrap_or(1));
        conditions.push_str(&format!(" AND strftime('%m', o.date) = '{m_pad}'"));
    }
    if let Some(ref d) = params.day {
        let d_pad = format!("{:02}", d.parse::<i32>().unwrap_or(1));
        conditions.push_str(&format!(" AND strftime('%d', o.date) = '{d_pad}'"));
    }

    if let Some(q) = params.quarter {
        match q {
            1 => conditions.push_str(" AND strftime('%m', o.date) IN ('01', '02', '03')"),
            2 => conditions.push_str(" AND strftime('%m', o.date) IN ('04', '05', '06')"),
            3 => conditions.push_str(" AND strftime('%m', o.date) IN ('07', '08', '09')"),
            4 => conditions.push_str(" AND strftime('%m', o.date) IN ('10', '11', '12')"),
            _ => {}
        }
    }

    // Exclude opening balance #NODAU unless explicitly searching for partner opening
    if params.partner_id.is_none() && !params.search_id.as_deref().unwrap_or_default().to_uppercase().contains("NODAU") {
        conditions.push_str(" AND o.display_id NOT IN ('#NODAU', 'NODAU')");
    }

    sql.push_str(&conditions);
    count_sql.push_str(&conditions);

    // Sorting
    let sort_by = params.sort_by.as_deref().unwrap_or("date");
    let sort_order = params.sort_order.as_deref().unwrap_or("desc");
    let order_clause = match sort_by {
        "id" => format!(" ORDER BY o.display_id {sort_order}"),
        "partner_name" => format!(" ORDER BY coalesce(p.name, 'KHÁCH LẺ') {sort_order}"),
        "total_amount" => format!(" ORDER BY o.total_amount {sort_order}"),
        "payment_method" => format!(" ORDER BY o.payment_method {sort_order}"),
        _ => format!(" ORDER BY o.date {sort_order}"),
    };

    sql.push_str(&order_clause);

    // Pagination
    if let Some(limit) = params.limit {
        let total: i64 = sqlx::query_scalar(&count_sql).fetch_one(&pool).await?;
        let page = params.page.unwrap_or(1).max(1);
        let offset = (page - 1) * limit;
        let pages = (total as f64 / limit as f64).ceil() as i64;

        sql.push_str(&format!(" LIMIT {limit} OFFSET {offset}"));

        let orders: Vec<Order> = sqlx::query_as(&sql).fetch_all(&pool).await?;
        let mut items = Vec::new();
        for o in &orders {
            items.push(populate_order_details_response(&pool, o).await?);
        }

        return Ok(Json(json!({
            "items": items,
            "total": total,
            "pages": pages,
            "current_page": page
        })));
    }

    let orders: Vec<Order> = sqlx::query_as(&sql).fetch_all(&pool).await?;
    let mut items = Vec::new();
    for o in &orders {
        items.push(populate_order_details_response(&pool, o).await?);
    }

    Ok(Json(json!(items)))
}

// GET /api/orders/:id
pub async fn get_order(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let order: Option<Order> = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let order = match order {
        Some(o) => o,
        None => return Err(AppError::NotFound("Đơn hàng không tồn tại".into())),
    };

    let resp = populate_order_details_response(&pool, &order).await?;
    Ok(Json(resp))
}

// POST /api/orders
pub async fn create_order(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateOrderDto>,
) -> Result<impl IntoResponse, AppError> {
    let local_now = get_vn_time();
    let mut order_date = local_now;

    if let Some(ref d_str) = payload.date {
        if let Ok(dt) = NaiveDateTime::parse_from_str(d_str, "%Y-%m-%dT%H:%M:%S") {
            order_date = dt;
        } else if let Ok(d) = NaiveDate::parse_from_str(d_str, "%Y-%m-%d") {
            order_date = d.and_time(local_now.time());
        }
    }

    let today_str = order_date.format("%d/%m/%y").to_string();
    let start_of_day = order_date.date().and_time(NaiveTime::MIN);
    let end_of_day = order_date.date().and_time(NaiveTime::from_hms_micro_opt(23, 59, 59, 999_999).unwrap());

    let count_today: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM \"order\" WHERE date >= ? AND date <= ? AND type = ? AND display_id NOT IN ('#NODAU', 'NODAU')"
    )
    .bind(start_of_day)
    .bind(end_of_day)
    .bind(&payload.r#type)
    .fetch_one(&pool)
    .await?;

    let display_id = format!("{}.{}", count_today + 1, today_str);
    let is_consignment_order = payload.is_consignment.unwrap_or(false);

    // Start database transaction
    let mut tx = pool.begin().await?;

    // Create Order record first
    let insert_res = sqlx::query(
        "INSERT INTO \"order\" (date, partner_id, total_amount, payment_method, type, note, amount_paid, \
         display_id, status, shipping_status, shipping_address, shipping_phone, cash_given, created_by, is_consignment, is_duplicate_checked) \
         VALUES (?, ?, 0, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, 0)"
    )
    .bind(order_date)
    .bind(payload.partner_id)
    .bind(&payload.payment_method)
    .bind(&payload.r#type)
    .bind(&payload.note)
    .bind(payload.amount_paid.unwrap_or(0.0))
    .bind(&display_id)
    .bind(&payload.shipping_status)
    .bind(&payload.shipping_address)
    .bind(&payload.shipping_phone)
    .bind(payload.cash_given.unwrap_or(0.0))
    .bind(&payload.created_by)
    .bind(is_consignment_order)
    .execute(&mut *tx)
    .await?;

    let order_id = insert_res.last_insert_rowid();

    let mut total_amount: f64 = 0.0;
    let mut affected_product_ids: Vec<i64> = Vec::new();
    let mut created_batches: Vec<i64> = Vec::new();

    for item in &payload.details {
        let item_qty = item.quantity;
        let item_price = item.price;

        if item.product_id.is_none() {
            // Custom item
            let name_override = item.product_name.clone().or_else(|| item.name.clone());
            sqlx::query(
                "INSERT INTO order_detail (order_id, product_id, product_name_override, quantity, shipped_quantity, price, cost_price, is_invoiced, invoiced_quantity) \
                 VALUES (?, NULL, ?, ?, ?, ?, 0, 0, 0)"
            )
            .bind(order_id)
            .bind(name_override)
            .bind(item_qty)
            .bind(if is_consignment_order || payload.shipping_status.is_some() { 0.0 } else { item_qty })
            .bind(item_price)
            .execute(&mut *tx)
            .await?;

            total_amount += item_qty * item_price;
            continue;
        }

        let prod_id = item.product_id.unwrap();
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
        .bind(prod_id)
        .fetch_optional(&mut *tx)
        .await?;

        let prod = match prod_opt {
            Some(p) => p,
            None => return Err(AppError::BadRequest(format!("Không tìm thấy sản phẩm {prod_id}"))),
        };

        let mut avg_cost: f64 = 0.0;

        if payload.r#type == "Sale" {
            if item_qty < 0.0 {
                // Return transaction
                let new_stock = prod.stock.unwrap_or(0.0) - item_qty;
                sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
                    .bind(new_stock)
                    .bind(prod.id)
                    .execute(&mut *tx)
                    .await?;

                if prod.is_combo.unwrap_or(false) {
                    let mut total_combo_cost = 0.0;
                    let combo_items = sqlx::query(
                        "SELECT ci.product_id, CAST(ci.quantity AS REAL) as quantity, CAST(p.cost_price AS REAL) as child_cost \
                         FROM combo_item ci JOIN product p ON ci.product_id = p.id WHERE ci.combo_id = ?"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for ci in combo_items {
                        let c_qty: f64 = ci.get("quantity");
                        let c_cost: Option<f64> = ci.get("child_cost");
                        total_combo_cost += c_qty * c_cost.unwrap_or(0.0);
                    }
                    avg_cost = total_combo_cost;
                } else {
                    avg_cost = prod.cost_price.unwrap_or(0.0);
                }
            } else {
                // FIFO calculation for Profit Locking
                if prod.is_combo.unwrap_or(false) {
                    let mut total_combo_cost = 0.0;
                    let combo_items = sqlx::query(
                        "SELECT ci.product_id, CAST(ci.quantity AS REAL) as quantity, CAST(p.cost_price AS REAL) as child_cost, CAST(p.stock AS REAL) as stock \
                         FROM combo_item ci JOIN product p ON ci.product_id = p.id WHERE ci.combo_id = ?"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for ci in combo_items {
                        let child_id: i64 = ci.get("product_id");
                        let ci_qty: f64 = ci.get("quantity");
                        let child_cost_price: Option<f64> = ci.get("child_cost");
                        let child_stock: Option<f64> = ci.get("stock");

                        let needed_qty = item_qty * ci_qty;
                        let new_c_stock = child_stock.unwrap_or(0.0) - needed_qty;
                        sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
                            .bind(new_c_stock)
                            .bind(child_id)
                            .execute(&mut *tx)
                            .await?;

                        let mut child_cost = 0.0;
                        let mut remaining_needed = needed_qty;

                        let batches: Vec<StockBatch> = sqlx::query_as(
                            "SELECT id, product_id, purchase_order_id, \
                             CAST(original_quantity AS REAL) as original_quantity, \
                             CAST(current_quantity AS REAL) as current_quantity, \
                             CAST(cost_price AS REAL) as cost_price, created_at \
                             FROM stock_batch WHERE product_id = ? AND current_quantity > 0 \
                             ORDER BY created_at ASC, id ASC"
                        )
                        .bind(child_id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for mut b in batches {
                            if remaining_needed <= 0.0 {
                                break;
                            }
                            let take = remaining_needed.min(b.current_quantity);
                            b.current_quantity -= take;
                            child_cost += take * b.cost_price;
                            remaining_needed -= take;

                            sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                .bind(b.current_quantity)
                                .bind(b.id)
                                .execute(&mut *tx)
                                .await?;
                        }

                        if remaining_needed > 0.0 {
                            child_cost += remaining_needed * child_cost_price.unwrap_or(0.0);
                        }

                        total_combo_cost += child_cost;
                    }
                    avg_cost = if item_qty > 0.0 { total_combo_cost / item_qty } else { 0.0 };
                } else {
                    // Simple product FIFO
                    let new_stock = prod.stock.unwrap_or(0.0) - item_qty;
                    sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
                        .bind(new_stock)
                        .bind(prod.id)
                        .execute(&mut *tx)
                        .await?;

                    let mut total_sale_cost = 0.0;
                    let mut remaining_needed = item_qty;

                    let batches: Vec<StockBatch> = sqlx::query_as(
                        "SELECT id, product_id, purchase_order_id, \
                         CAST(original_quantity AS REAL) as original_quantity, \
                         CAST(current_quantity AS REAL) as current_quantity, \
                         CAST(cost_price AS REAL) as cost_price, created_at \
                         FROM stock_batch WHERE product_id = ? AND current_quantity > 0 \
                         ORDER BY created_at ASC, id ASC"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for mut b in batches {
                        if remaining_needed <= 0.0 {
                            break;
                        }
                        let take = remaining_needed.min(b.current_quantity);
                        b.current_quantity -= take;
                        total_sale_cost += take * b.cost_price;
                        remaining_needed -= take;

                        sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                            .bind(b.current_quantity)
                            .bind(b.id)
                            .execute(&mut *tx)
                            .await?;
                    }

                    if remaining_needed > 0.0 {
                        total_sale_cost += remaining_needed * prod.cost_price.unwrap_or(0.0);
                    }

                    avg_cost = if item_qty > 0.0 { total_sale_cost / item_qty } else { 0.0 };
                }
            }
        } else if payload.r#type == "Purchase" {
            if !is_consignment_order {
                if prod.is_combo.unwrap_or(false) {
                    let combo_items = sqlx::query(
                        "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for ci in combo_items {
                        let child_id: i64 = ci.get("product_id");
                        let ci_qty: f64 = ci.get("quantity");
                        let child_incoming = item_qty * ci_qty;
                        let child_cost = if ci_qty > 0.0 { item_price / ci_qty } else { 0.0 };

                        let b_res = sqlx::query(
                            "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                             VALUES (?, ?, ?, ?, ?, ?)"
                        )
                        .bind(child_id)
                        .bind(order_id)
                        .bind(child_incoming)
                        .bind(child_incoming)
                        .bind(child_cost)
                        .bind(order_date)
                        .execute(&mut *tx)
                        .await?;

                        created_batches.push(b_res.last_insert_rowid());
                        affected_product_ids.push(child_id);

                        sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                            .bind(child_incoming)
                            .bind(child_id)
                            .execute(&mut *tx)
                            .await?;
                    }
                } else {
                    let b_res = sqlx::query(
                        "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                         VALUES (?, ?, ?, ?, ?, ?)"
                    )
                    .bind(prod.id)
                    .bind(order_id)
                    .bind(item_qty)
                    .bind(item_qty)
                    .bind(item_price)
                    .bind(order_date)
                    .execute(&mut *tx)
                    .await?;

                    created_batches.push(b_res.last_insert_rowid());
                    affected_product_ids.push(prod.id);

                    sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                        .bind(item_qty)
                        .bind(prod.id)
                        .execute(&mut *tx)
                        .await?;
                }
            }
            avg_cost = item_price;
        }

        let name_override = item.product_name.clone().or_else(|| item.name.clone());
        let shipped_qty = if is_consignment_order || payload.shipping_status.is_some() {
            0.0
        } else {
            item_qty
        };

        sqlx::query(
            "INSERT INTO order_detail (order_id, product_id, product_name_override, quantity, shipped_quantity, price, cost_price, is_invoiced, invoiced_quantity) \
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)"
        )
        .bind(order_id)
        .bind(prod.id)
        .bind(name_override)
        .bind(item_qty)
        .bind(shipped_qty)
        .bind(item_price)
        .bind(if payload.r#type == "Sale" { avg_cost } else { item_price })
        .execute(&mut *tx)
        .await?;

        total_amount += item_qty * item_price;
    }

    // Update Order total_amount
    sqlx::query("UPDATE \"order\" SET total_amount = ? WHERE id = ?")
        .bind(total_amount)
        .bind(order_id)
        .execute(&mut *tx)
        .await?;

    // Debt Management & Partner Settlement Vouchers
    if let Some(p_id) = payload.partner_id {
        let p_debt: Option<f64> = sqlx::query_scalar(
            "SELECT CAST(debt_balance AS REAL) FROM partner WHERE id = ?"
        )
        .bind(p_id)
        .fetch_optional(&mut *tx)
        .await?;

        let old_debt = p_debt.unwrap_or(0.0);
        sqlx::query("UPDATE \"order\" SET old_debt = ? WHERE id = ?")
            .bind(old_debt)
            .bind(order_id)
            .execute(&mut *tx)
            .await?;

        if payload.payment_method == "Debt" {
            let upfront = payload.amount_paid.unwrap_or(0.0);
            if payload.r#type == "Sale" {
                let mut new_bal = old_debt + total_amount;
                if upfront > 0.0 {
                    let (v_type, v_note) = if total_amount >= 0.0 {
                        new_bal -= upfront;
                        ("Receipt", format!("Thanh toán trước cho đơn {display_id}"))
                    } else {
                        new_bal += upfront;
                        ("Payment", format!("Chi trả tiền hàng cho đơn trả {display_id}"))
                    };

                    sqlx::query(
                        "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
                         VALUES (?, ?, ?, ?, 'settlement', ?, ?)"
                    )
                    .bind(p_id)
                    .bind(upfront)
                    .bind(v_note)
                    .bind(v_type)
                    .bind(order_id)
                    .bind(order_date)
                    .execute(&mut *tx)
                    .await?;
                }

                sqlx::query("UPDATE partner SET debt_balance = ? WHERE id = ?")
                    .bind(new_bal)
                    .bind(p_id)
                    .execute(&mut *tx)
                    .await?;
            } else {
                // Purchase
                let mut new_bal = old_debt - total_amount;
                if upfront > 0.0 {
                    let (v_type, v_note) = if total_amount >= 0.0 {
                        new_bal += upfront;
                        ("Payment", format!("Thanh toán trước cho đơn nhập {display_id}"))
                    } else {
                        new_bal -= upfront;
                        ("Receipt", format!("Thu tiền hàng cho đơn nhập trả {display_id}"))
                    };

                    sqlx::query(
                        "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
                         VALUES (?, ?, ?, ?, 'settlement', ?, ?)"
                    )
                    .bind(p_id)
                    .bind(upfront)
                    .bind(v_note)
                    .bind(v_type)
                    .bind(order_id)
                    .bind(order_date)
                    .execute(&mut *tx)
                    .await?;
                }

                sqlx::query("UPDATE partner SET debt_balance = ? WHERE id = ?")
                    .bind(new_bal)
                    .bind(p_id)
                    .execute(&mut *tx)
                    .await?;
            }
        }
    }

    // Cash Payment (Sổ tiền mặt auto voucher)
    if payload.payment_method == "Cash" {
        let (v_type, v_note, v_amount) = if payload.r#type == "Sale" {
            if total_amount >= 0.0 {
                ("Receipt", format!("Thu tiền bán lẻ - Đơn {display_id}"), total_amount)
            } else {
                ("Payment", format!("Chi trả tiền hàng trả - Đơn {display_id}"), total_amount.abs())
            }
        } else {
            if total_amount >= 0.0 {
                ("Payment", format!("Chi tiền nhập hàng - Đơn {display_id}"), total_amount)
            } else {
                ("Receipt", format!("Thu tiền nhập hàng trả - Đơn {display_id}"), total_amount.abs())
            }
        };

        sqlx::query(
            "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
             VALUES (?, ?, ?, ?, 'auto', ?, ?)"
        )
        .bind(payload.partner_id)
        .bind(v_amount)
        .bind(v_note)
        .bind(v_type)
        .bind(order_id)
        .bind(order_date)
        .execute(&mut *tx)
        .await?;

        sqlx::query("UPDATE \"order\" SET amount_paid = ? WHERE id = ?")
            .bind(total_amount)
            .bind(order_id)
            .execute(&mut *tx)
            .await?;
    }

    // Bank Transfer
    if payload.payment_method == "Transfer" {
        if let Some(acc_id) = payload.bank_account_id {
            let upfront = payload.amount_paid.unwrap_or(total_amount);
            let upfront_val = if upfront == 0.0 { total_amount } else { upfront };

            let t_type = if payload.r#type == "Sale" {
                if total_amount < 0.0 { "Withdrawal" } else { "Deposit" }
            } else {
                if total_amount < 0.0 { "Deposit" } else { "Withdrawal" }
            };

            sqlx::query(
                "INSERT INTO bank_transaction (account_id, amount, type, note, partner_id, order_id, date) \
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            )
            .bind(acc_id)
            .bind(upfront_val.abs())
            .bind(t_type)
            .bind(format!("Thanh toán đơn {display_id}"))
            .bind(payload.partner_id)
            .bind(order_id)
            .bind(order_date)
            .execute(&mut *tx)
            .await?;

            if t_type == "Deposit" {
                sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) + ? WHERE id = ?")
                    .bind(upfront_val.abs())
                    .bind(acc_id)
                    .execute(&mut *tx)
                    .await?;
            } else {
                sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) - ? WHERE id = ?")
                    .bind(upfront_val.abs())
                    .bind(acc_id)
                    .execute(&mut *tx)
                    .await?;
            }

            sqlx::query("UPDATE \"order\" SET amount_paid = ? WHERE id = ?")
                .bind(upfront_val)
                .bind(order_id)
                .execute(&mut *tx)
                .await?;
        }
    }

    tx.commit().await?;

    // Post-transaction recalculations
    if payload.r#type == "Purchase" {
        for pid in affected_product_ids {
            let _ = recalculate_product_cost_price(&pool, pid).await;
        }
    }

    if let Some(p_id) = payload.partner_id {
        let _ = recalculate_partner_debt_internal(&pool, p_id).await;
    }

    // Fetch created order response
    let created_order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(order_id)
    .fetch_one(&pool)
    .await?;

    let resp = populate_order_details_response(&pool, &created_order).await?;
    Ok((StatusCode::CREATED, Json(resp)))
}

// DELETE /api/orders/:id
pub async fn delete_order(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let order_opt: Option<Order> = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let order = match order_opt {
        Some(o) => o,
        None => return Err(AppError::NotFound("Đơn hàng không tồn tại".into())),
    };

    let partner_id = order.partner_id;
    let mut affected_product_ids = Vec::new();

    let mut tx = pool.begin().await?;

    // 1. Reverse Inventory & FIFO Batches
    if order.r#type.as_deref() == Some("Purchase") {
        let batches: Vec<StockBatch> = sqlx::query_as(
            "SELECT id, product_id, purchase_order_id, \
             CAST(original_quantity AS REAL) as original_quantity, \
             CAST(current_quantity AS REAL) as current_quantity, \
             CAST(cost_price AS REAL) as cost_price, created_at \
             FROM stock_batch WHERE purchase_order_id = ?"
        )
        .bind(order.id)
        .fetch_all(&mut *tx)
        .await?;

        for b in batches {
            affected_product_ids.push(b.product_id);
            sqlx::query("DELETE FROM stock_batch WHERE id = ?")
                .bind(b.id)
                .execute(&mut *tx)
                .await?;
        }
    }

    let details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    for d in details {
        if let Some(prod_id) = d.product_id {
            affected_product_ids.push(prod_id);
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
            .bind(prod_id)
            .fetch_optional(&mut *tx)
            .await?;

            if let Some(prod) = prod_opt {
                let mut qty_to_restore = d.quantity;

                if order.r#type.as_deref() == Some("Sale") {
                    if prod.is_combo.unwrap_or(false) {
                        let combo_items = sqlx::query(
                            "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
                        )
                        .bind(prod.id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for ci in combo_items {
                            let child_id: i64 = ci.get("product_id");
                            let ci_qty: f64 = ci.get("quantity");
                            let mut child_needed = qty_to_restore * ci_qty;

                            sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                                .bind(child_needed)
                                .bind(child_id)
                                .execute(&mut *tx)
                                .await?;

                            let c_batches: Vec<StockBatch> = sqlx::query_as(
                                "SELECT id, product_id, purchase_order_id, \
                                 CAST(original_quantity AS REAL) as original_quantity, \
                                 CAST(current_quantity AS REAL) as current_quantity, \
                                 CAST(cost_price AS REAL) as cost_price, created_at \
                                 FROM stock_batch WHERE product_id = ? AND current_quantity < original_quantity \
                                 ORDER BY created_at DESC, id DESC"
                            )
                            .bind(child_id)
                            .fetch_all(&mut *tx)
                            .await?;

                            for mut cb in c_batches {
                                if child_needed <= 0.0 {
                                    break;
                                }
                                let can_add = cb.original_quantity - cb.current_quantity;
                                let take = child_needed.min(can_add);
                                cb.current_quantity += take;
                                child_needed -= take;

                                sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                    .bind(cb.current_quantity)
                                    .bind(cb.id)
                                    .execute(&mut *tx)
                                    .await?;
                            }
                        }
                    } else {
                        sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                            .bind(qty_to_restore)
                            .bind(prod.id)
                            .execute(&mut *tx)
                            .await?;

                        let p_batches: Vec<StockBatch> = sqlx::query_as(
                            "SELECT id, product_id, purchase_order_id, \
                             CAST(original_quantity AS REAL) as original_quantity, \
                             CAST(current_quantity AS REAL) as current_quantity, \
                             CAST(cost_price AS REAL) as cost_price, created_at \
                             FROM stock_batch WHERE product_id = ? AND current_quantity < original_quantity \
                             ORDER BY created_at DESC, id DESC"
                        )
                        .bind(prod.id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for mut pb in p_batches {
                            if qty_to_restore <= 0.0 {
                                break;
                            }
                            let can_add = pb.original_quantity - pb.current_quantity;
                            let take = qty_to_restore.min(can_add);
                            pb.current_quantity += take;
                            qty_to_restore -= take;

                            sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                .bind(pb.current_quantity)
                                .bind(pb.id)
                                .execute(&mut *tx)
                                .await?;
                        }
                    }
                } else if order.r#type.as_deref() == Some("Purchase") {
                    let qty_to_subtract = if order.is_consignment.unwrap_or(false) {
                        d.shipped_quantity.unwrap_or(0.0)
                    } else {
                        d.quantity
                    };

                    if prod.is_combo.unwrap_or(false) {
                        let combo_items = sqlx::query(
                            "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
                        )
                        .bind(prod.id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for ci in combo_items {
                            let child_id: i64 = ci.get("product_id");
                            let ci_qty: f64 = ci.get("quantity");
                            sqlx::query("UPDATE product SET stock = coalesce(stock, 0) - ? WHERE id = ?")
                                .bind(qty_to_subtract * ci_qty)
                                .bind(child_id)
                                .execute(&mut *tx)
                                .await?;
                        }
                    } else {
                        sqlx::query("UPDATE product SET stock = coalesce(stock, 0) - ? WHERE id = ?")
                            .bind(qty_to_subtract)
                            .bind(prod.id)
                            .execute(&mut *tx)
                            .await?;
                    }
                }
            }
        }
    }

    // 2. Cleanup linked settlement and auto vouchers
    sqlx::query("DELETE FROM cash_voucher WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    // 3. Cleanup linked bank transactions and restore bank balances
    let linked_bank_txs = sqlx::query(
        "SELECT account_id, type, CAST(amount AS REAL) as amount FROM bank_transaction WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    for bt in linked_bank_txs {
        let acc_id: i64 = bt.get("account_id");
        let t_type: String = bt.get("type");
        let amount: f64 = bt.get("amount");

        if t_type == "Deposit" {
            sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) - ? WHERE id = ?")
                .bind(amount)
                .bind(acc_id)
                .execute(&mut *tx)
                .await?;
        } else {
            sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) + ? WHERE id = ?")
                .bind(amount)
                .bind(acc_id)
                .execute(&mut *tx)
                .await?;
        }
    }

    sqlx::query("DELETE FROM bank_transaction WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    // 4. Delete Order and Details
    sqlx::query("DELETE FROM order_detail WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM \"order\" WHERE id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    // 5. Recalculate cost prices and partner debt
    if order.r#type.as_deref() == Some("Purchase") {
        for pid in affected_product_ids {
            let _ = recalculate_product_cost_price(&pool, pid).await;
        }
    }

    if let Some(p_id) = partner_id {
        let _ = recalculate_partner_debt_internal(&pool, p_id).await;
    }

    Ok(Json(json!({
        "message": "Order deleted and data reversed successfully"
    })))
}

// PUT /api/orders/:id
pub async fn update_order(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateOrderDto>,
) -> Result<impl IntoResponse, AppError> {
    let order_opt: Option<Order> = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let order = match order_opt {
        Some(o) => o,
        None => return Err(AppError::NotFound("Đơn hàng không tồn tại".into())),
    };

    // Special case for Opening Balance (#NODAU)
    if order.display_id.as_deref() == Some("#NODAU") || order.display_id.as_deref() == Some("NODAU") {
        let new_amount = payload.total_amount.unwrap_or(0.0).abs();
        let new_type = payload.r#type.unwrap_or_else(|| if payload.total_amount.unwrap_or(0.0) >= 0.0 { "Sale".into() } else { "Purchase".into() });

        sqlx::query("UPDATE \"order\" SET total_amount = ?, type = ?, note = ? WHERE id = ?")
            .bind(new_amount)
            .bind(new_type)
            .bind(&payload.note)
            .bind(order.id)
            .execute(&pool)
            .await?;

        if let Some(p_id) = order.partner_id {
            let _ = recalculate_partner_debt_internal(&pool, p_id).await;
        }

        let updated = sqlx::query_as::<_, Order>(
            "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
             payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
             CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
             shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
             created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
             CAST(is_consignment AS BOOLEAN) as is_consignment, \
             CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
             FROM \"order\" WHERE id = ?"
        )
        .bind(order.id)
        .fetch_one(&pool)
        .await?;

        return Ok(Json(populate_order_details_response(&pool, &updated).await?));
    }

    // For general order update: Safest approach is to reverse order stock & batches and reapply
    // Start transaction
    let mut tx = pool.begin().await?;

    // 1. Reverse Previous Inventory
    let old_details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    if order.r#type.as_deref() == Some("Sale") {
        for d in &old_details {
            if let Some(prod_id) = d.product_id {
                let mut qty_to_restore = d.quantity;
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
                .bind(prod_id)
                .fetch_optional(&mut *tx)
                .await?;

                if let Some(prod) = prod_opt {
                    if prod.is_combo.unwrap_or(false) {
                        let combo_items = sqlx::query(
                            "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
                        )
                        .bind(prod.id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for ci in combo_items {
                            let child_id: i64 = ci.get("product_id");
                            let ci_qty: f64 = ci.get("quantity");
                            let mut child_needed = qty_to_restore * ci_qty;

                            sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                                .bind(child_needed)
                                .bind(child_id)
                                .execute(&mut *tx)
                                .await?;

                            let c_batches: Vec<StockBatch> = sqlx::query_as(
                                "SELECT id, product_id, purchase_order_id, \
                                 CAST(original_quantity AS REAL) as original_quantity, \
                                 CAST(current_quantity AS REAL) as current_quantity, \
                                 CAST(cost_price AS REAL) as cost_price, created_at \
                                 FROM stock_batch WHERE product_id = ? AND current_quantity < original_quantity \
                                 ORDER BY created_at DESC, id DESC"
                            )
                            .bind(child_id)
                            .fetch_all(&mut *tx)
                            .await?;

                            for mut cb in c_batches {
                                if child_needed <= 0.0 {
                                    break;
                                }
                                let can_add = cb.original_quantity - cb.current_quantity;
                                let take = child_needed.min(can_add);
                                cb.current_quantity += take;
                                child_needed -= take;

                                sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                    .bind(cb.current_quantity)
                                    .bind(cb.id)
                                    .execute(&mut *tx)
                                    .await?;
                            }
                        }
                    } else {
                        sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                            .bind(qty_to_restore)
                            .bind(prod.id)
                            .execute(&mut *tx)
                            .await?;

                        let p_batches: Vec<StockBatch> = sqlx::query_as(
                            "SELECT id, product_id, purchase_order_id, \
                             CAST(original_quantity AS REAL) as original_quantity, \
                             CAST(current_quantity AS REAL) as current_quantity, \
                             CAST(cost_price AS REAL) as cost_price, created_at \
                             FROM stock_batch WHERE product_id = ? AND current_quantity < original_quantity \
                             ORDER BY created_at DESC, id DESC"
                        )
                        .bind(prod.id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for mut pb in p_batches {
                            if qty_to_restore <= 0.0 {
                                break;
                            }
                            let can_add = pb.original_quantity - pb.current_quantity;
                            let take = qty_to_restore.min(can_add);
                            pb.current_quantity += take;
                            qty_to_restore -= take;

                            sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                .bind(pb.current_quantity)
                                .bind(pb.id)
                                .execute(&mut *tx)
                                .await?;
                        }
                    }
                }
            }
        }
    } else if order.r#type.as_deref() == Some("Purchase") {
        // Delete batches created by this purchase and reverse stock
        let batches: Vec<StockBatch> = sqlx::query_as(
            "SELECT id, product_id, purchase_order_id, \
             CAST(original_quantity AS REAL) as original_quantity, \
             CAST(current_quantity AS REAL) as current_quantity, \
             CAST(cost_price AS REAL) as cost_price, created_at \
             FROM stock_batch WHERE purchase_order_id = ?"
        )
        .bind(order.id)
        .fetch_all(&mut *tx)
        .await?;

        for b in batches {
            sqlx::query("UPDATE product SET stock = coalesce(stock, 0) - ? WHERE id = ?")
                .bind(b.original_quantity)
                .bind(b.product_id)
                .execute(&mut *tx)
                .await?;

            sqlx::query("DELETE FROM stock_batch WHERE id = ?")
                .bind(b.id)
                .execute(&mut *tx)
                .await?;
        }
    }

    // Clean old linked vouchers and bank transactions
    sqlx::query("DELETE FROM cash_voucher WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    let old_bank_txs = sqlx::query(
        "SELECT account_id, type, CAST(amount AS REAL) as amount FROM bank_transaction WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    for bt in old_bank_txs {
        let acc_id: i64 = bt.get("account_id");
        let t_type: String = bt.get("type");
        let amount: f64 = bt.get("amount");
        if t_type == "Deposit" {
            sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) - ? WHERE id = ?")
                .bind(amount)
                .bind(acc_id)
                .execute(&mut *tx)
                .await?;
        } else {
            sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) + ? WHERE id = ?")
                .bind(amount)
                .bind(acc_id)
                .execute(&mut *tx)
                .await?;
        }
    }

    sqlx::query("DELETE FROM bank_transaction WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM order_detail WHERE order_id = ?")
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    // 2. Parse Date
    let mut order_date = order.date.unwrap_or_else(get_vn_time);
    if let Some(ref d_str) = payload.date {
        if let Ok(dt) = NaiveDateTime::parse_from_str(d_str, "%Y-%m-%dT%H:%M:%S") {
            order_date = dt;
        } else if let Ok(d) = NaiveDate::parse_from_str(d_str, "%Y-%m-%d") {
            order_date = d.and_time(order_date.time());
        }
    }

    let order_type = payload.r#type.as_deref().unwrap_or(order.r#type.as_deref().unwrap_or("Sale"));
    let is_consignment = payload.is_consignment.unwrap_or(order.is_consignment.unwrap_or(false));

    // 3. Re-apply Details and Stock FIFO
    let mut total_amount: f64 = 0.0;
    let mut affected_product_ids = Vec::new();

    for item in &payload.details {
        let item_qty = item.quantity;
        let item_price = item.price;

        if item.product_id.is_none() {
            let name_override = item.product_name.clone().or_else(|| item.name.clone());
            sqlx::query(
                "INSERT INTO order_detail (order_id, product_id, product_name_override, quantity, shipped_quantity, price, cost_price, is_invoiced, invoiced_quantity) \
                 VALUES (?, NULL, ?, ?, ?, ?, 0, 0, 0)"
            )
            .bind(order.id)
            .bind(name_override)
            .bind(item_qty)
            .bind(if is_consignment || payload.shipping_status.is_some() { 0.0 } else { item_qty })
            .bind(item_price)
            .execute(&mut *tx)
            .await?;

            total_amount += item_qty * item_price;
            continue;
        }

        let prod_id = item.product_id.unwrap();
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
        .bind(prod_id)
        .fetch_optional(&mut *tx)
        .await?;

        let prod = match prod_opt {
            Some(p) => p,
            None => return Err(AppError::BadRequest(format!("Không tìm thấy sản phẩm {prod_id}"))),
        };

        let mut avg_cost = 0.0;
        if order_type == "Sale" {
            if item_qty < 0.0 {
                sqlx::query("UPDATE product SET stock = coalesce(stock, 0) - ? WHERE id = ?")
                    .bind(item_qty)
                    .bind(prod.id)
                    .execute(&mut *tx)
                    .await?;
                avg_cost = prod.cost_price.unwrap_or(0.0);
            } else {
                if prod.is_combo.unwrap_or(false) {
                    let mut total_combo_cost = 0.0;
                    let combo_items = sqlx::query(
                        "SELECT ci.product_id, CAST(ci.quantity AS REAL) as quantity, CAST(p.cost_price AS REAL) as child_cost, CAST(p.stock AS REAL) as stock \
                         FROM combo_item ci JOIN product p ON ci.product_id = p.id WHERE ci.combo_id = ?"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for ci in combo_items {
                        let child_id: i64 = ci.get("product_id");
                        let ci_qty: f64 = ci.get("quantity");
                        let child_cost_price: Option<f64> = ci.get("child_cost");
                        let child_stock: Option<f64> = ci.get("stock");

                        let needed_qty = item_qty * ci_qty;
                        sqlx::query("UPDATE product SET stock = ? WHERE id = ?")
                            .bind(child_stock.unwrap_or(0.0) - needed_qty)
                            .bind(child_id)
                            .execute(&mut *tx)
                            .await?;

                        let mut child_cost = 0.0;
                        let mut remaining_needed = needed_qty;

                        let batches: Vec<StockBatch> = sqlx::query_as(
                            "SELECT id, product_id, purchase_order_id, \
                             CAST(original_quantity AS REAL) as original_quantity, \
                             CAST(current_quantity AS REAL) as current_quantity, \
                             CAST(cost_price AS REAL) as cost_price, created_at \
                             FROM stock_batch WHERE product_id = ? AND current_quantity > 0 \
                             ORDER BY created_at ASC, id ASC"
                        )
                        .bind(child_id)
                        .fetch_all(&mut *tx)
                        .await?;

                        for mut b in batches {
                            if remaining_needed <= 0.0 {
                                break;
                            }
                            let take = remaining_needed.min(b.current_quantity);
                            b.current_quantity -= take;
                            child_cost += take * b.cost_price;
                            remaining_needed -= take;

                            sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                                .bind(b.current_quantity)
                                .bind(b.id)
                                .execute(&mut *tx)
                                .await?;
                        }

                        if remaining_needed > 0.0 {
                            child_cost += remaining_needed * child_cost_price.unwrap_or(0.0);
                        }

                        total_combo_cost += child_cost;
                    }
                    avg_cost = if item_qty > 0.0 { total_combo_cost / item_qty } else { 0.0 };
                } else {
                    sqlx::query("UPDATE product SET stock = coalesce(stock, 0) - ? WHERE id = ?")
                        .bind(item_qty)
                        .bind(prod.id)
                        .execute(&mut *tx)
                        .await?;

                    let mut total_sale_cost = 0.0;
                    let mut remaining_needed = item_qty;

                    let batches: Vec<StockBatch> = sqlx::query_as(
                        "SELECT id, product_id, purchase_order_id, \
                         CAST(original_quantity AS REAL) as original_quantity, \
                         CAST(current_quantity AS REAL) as current_quantity, \
                         CAST(cost_price AS REAL) as cost_price, created_at \
                         FROM stock_batch WHERE product_id = ? AND current_quantity > 0 \
                         ORDER BY created_at ASC, id ASC"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for mut b in batches {
                        if remaining_needed <= 0.0 {
                            break;
                        }
                        let take = remaining_needed.min(b.current_quantity);
                        b.current_quantity -= take;
                        total_sale_cost += take * b.cost_price;
                        remaining_needed -= take;

                        sqlx::query("UPDATE stock_batch SET current_quantity = ? WHERE id = ?")
                            .bind(b.current_quantity)
                            .bind(b.id)
                            .execute(&mut *tx)
                            .await?;
                    }

                    if remaining_needed > 0.0 {
                        total_sale_cost += remaining_needed * prod.cost_price.unwrap_or(0.0);
                    }

                    avg_cost = if item_qty > 0.0 { total_sale_cost / item_qty } else { 0.0 };
                }
            }
        } else if order_type == "Purchase" {
            if !is_consignment {
                if prod.is_combo.unwrap_or(false) {
                    let combo_items = sqlx::query(
                        "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
                    )
                    .bind(prod.id)
                    .fetch_all(&mut *tx)
                    .await?;

                    for ci in combo_items {
                        let child_id: i64 = ci.get("product_id");
                        let ci_qty: f64 = ci.get("quantity");
                        let child_incoming = item_qty * ci_qty;
                        let child_cost = if ci_qty > 0.0 { item_price / ci_qty } else { 0.0 };

                        sqlx::query(
                            "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                             VALUES (?, ?, ?, ?, ?, ?)"
                        )
                        .bind(child_id)
                        .bind(order.id)
                        .bind(child_incoming)
                        .bind(child_incoming)
                        .bind(child_cost)
                        .bind(order_date)
                        .execute(&mut *tx)
                        .await?;

                        affected_product_ids.push(child_id);
                        sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                            .bind(child_incoming)
                            .bind(child_id)
                            .execute(&mut *tx)
                            .await?;
                    }
                } else {
                    sqlx::query(
                        "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                         VALUES (?, ?, ?, ?, ?, ?)"
                    )
                    .bind(prod.id)
                    .bind(order.id)
                    .bind(item_qty)
                    .bind(item_qty)
                    .bind(item_price)
                    .bind(order_date)
                    .execute(&mut *tx)
                    .await?;

                    affected_product_ids.push(prod.id);
                    sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                        .bind(item_qty)
                        .bind(prod.id)
                        .execute(&mut *tx)
                        .await?;
                }
            }
            avg_cost = item_price;
        }

        let name_override = item.product_name.clone().or_else(|| item.name.clone());
        let shipped_qty = if is_consignment || payload.shipping_status.is_some() {
            0.0
        } else {
            item_qty
        };

        sqlx::query(
            "INSERT INTO order_detail (order_id, product_id, product_name_override, quantity, shipped_quantity, price, cost_price, is_invoiced, invoiced_quantity) \
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)"
        )
        .bind(order.id)
        .bind(prod.id)
        .bind(name_override)
        .bind(item_qty)
        .bind(shipped_qty)
        .bind(item_price)
        .bind(if order_type == "Sale" { avg_cost } else { item_price })
        .execute(&mut *tx)
        .await?;

        total_amount += item_qty * item_price;
    }

    // Update main Order
    let display_id = order.display_id.clone().unwrap_or_else(|| order.id.to_string());
    sqlx::query(
        "UPDATE \"order\" SET date = ?, partner_id = ?, total_amount = ?, payment_method = ?, type = ?, \
         note = ?, amount_paid = ?, cash_given = ?, is_consignment = ?, shipping_status = ?, \
         shipping_address = ?, shipping_phone = ? WHERE id = ?"
    )
    .bind(order_date)
    .bind(payload.partner_id)
    .bind(total_amount)
    .bind(&payload.payment_method)
    .bind(order_type)
    .bind(&payload.note)
    .bind(payload.amount_paid.unwrap_or(0.0))
    .bind(payload.cash_given.unwrap_or(0.0))
    .bind(is_consignment)
    .bind(&payload.shipping_status)
    .bind(&payload.shipping_address)
    .bind(&payload.shipping_phone)
    .bind(order.id)
    .execute(&mut *tx)
    .await?;

    // Debt & Payment records
    if let Some(p_id) = payload.partner_id {
        if payload.payment_method == "Debt" {
            let upfront = payload.amount_paid.unwrap_or(0.0);
            if upfront > 0.0 {
                let v_type = if (order_type == "Sale" && total_amount >= 0.0) || (order_type == "Purchase" && total_amount < 0.0) {
                    "Receipt"
                } else {
                    "Payment"
                };

                sqlx::query(
                    "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
                     VALUES (?, ?, ?, ?, 'settlement', ?, ?)"
                )
                .bind(p_id)
                .bind(upfront)
                .bind(format!("Thanh toán cho đơn {display_id}"))
                .bind(v_type)
                .bind(order.id)
                .bind(order_date)
                .execute(&mut *tx)
                .await?;
            }
        }
    }

    if payload.payment_method == "Cash" {
        let (v_type, v_note, v_amount) = if order_type == "Sale" {
            if total_amount >= 0.0 {
                ("Receipt", format!("Thu tiền bán lẻ - Đơn {display_id}"), total_amount)
            } else {
                ("Payment", format!("Chi trả tiền hàng trả - Đơn {display_id}"), total_amount.abs())
            }
        } else {
            if total_amount >= 0.0 {
                ("Payment", format!("Chi tiền nhập hàng - Đơn {display_id}"), total_amount)
            } else {
                ("Receipt", format!("Thu tiền nhập hàng trả - Đơn {display_id}"), total_amount.abs())
            }
        };

        sqlx::query(
            "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
             VALUES (?, ?, ?, ?, 'auto', ?, ?)"
        )
        .bind(payload.partner_id)
        .bind(v_amount)
        .bind(v_note)
        .bind(v_type)
        .bind(order.id)
        .bind(order_date)
        .execute(&mut *tx)
        .await?;

        sqlx::query("UPDATE \"order\" SET amount_paid = ? WHERE id = ?")
            .bind(total_amount)
            .bind(order.id)
            .execute(&mut *tx)
            .await?;
    }

    if payload.payment_method == "Transfer" {
        if let Some(acc_id) = payload.bank_account_id {
            let upfront = payload.amount_paid.unwrap_or(total_amount);
            let upfront_val = if upfront == 0.0 { total_amount } else { upfront };

            let t_type = if order_type == "Sale" {
                if total_amount < 0.0 { "Withdrawal" } else { "Deposit" }
            } else {
                if total_amount < 0.0 { "Deposit" } else { "Withdrawal" }
            };

            sqlx::query(
                "INSERT INTO bank_transaction (account_id, amount, type, note, partner_id, order_id, date) \
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            )
            .bind(acc_id)
            .bind(upfront_val.abs())
            .bind(t_type)
            .bind(format!("Cập nhật đơn {display_id}"))
            .bind(payload.partner_id)
            .bind(order.id)
            .bind(order_date)
            .execute(&mut *tx)
            .await?;

            if t_type == "Deposit" {
                sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) + ? WHERE id = ?")
                    .bind(upfront_val.abs())
                    .bind(acc_id)
                    .execute(&mut *tx)
                    .await?;
            } else {
                sqlx::query("UPDATE bank_account SET balance = coalesce(balance, 0) - ? WHERE id = ?")
                    .bind(upfront_val.abs())
                    .bind(acc_id)
                    .execute(&mut *tx)
                    .await?;
            }

            sqlx::query("UPDATE \"order\" SET amount_paid = ? WHERE id = ?")
                .bind(upfront_val)
                .bind(order.id)
                .execute(&mut *tx)
                .await?;
        }
    }

    tx.commit().await?;

    if order_type == "Purchase" {
        for pid in affected_product_ids {
            let _ = recalculate_product_cost_price(&pool, pid).await;
        }
    }

    if let Some(p_id) = payload.partner_id {
        let _ = recalculate_partner_debt_internal(&pool, p_id).await;
    }
    if let Some(old_p_id) = order.partner_id {
        if payload.partner_id != Some(old_p_id) {
            let _ = recalculate_partner_debt_internal(&pool, old_p_id).await;
        }
    }

    let _ = sync_order_amount_paid(&pool, order.id).await;

    let updated_order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(order.id)
    .fetch_one(&pool)
    .await?;

    let resp = populate_order_details_response(&pool, &updated_order).await?;
    Ok(Json(resp))
}

// PATCH /api/orders/:id/status
pub async fn update_order_status(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateStatusDto>,
) -> Result<impl IntoResponse, AppError> {
    if let Some(ref status) = payload.status {
        sqlx::query("UPDATE \"order\" SET status = ? WHERE id = ?")
            .bind(status)
            .bind(id)
            .execute(&pool)
            .await?;
    }

    let order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let resp = populate_order_details_response(&pool, &order).await?;
    Ok(Json(resp))
}

// PATCH /api/orders/:id/shipping-status
pub async fn update_shipping_status(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateShippingStatusDto>,
) -> Result<impl IntoResponse, AppError> {
    let order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let mut delivery_date = order.delivery_date;
    if let Some(ref ss) = payload.shipping_status {
        if ss == "Delivered" && order.shipping_status.as_deref() != Some("Delivered") {
            delivery_date = Some(get_vn_time());
        } else if ss != "Delivered" {
            delivery_date = None;
        }

        if ss == "Shipping" {
            sqlx::query("UPDATE order_detail SET shipped_quantity = 0 WHERE order_id = ?")
                .bind(order.id)
                .execute(&pool)
                .await?;
        }

        sqlx::query("UPDATE \"order\" SET shipping_status = ?, delivery_date = ? WHERE id = ?")
            .bind(ss)
            .bind(delivery_date)
            .bind(order.id)
            .execute(&pool)
            .await?;
    }

    let updated: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let resp = populate_order_details_response(&pool, &updated).await?;
    Ok(Json(resp))
}

// PATCH /api/order-details/:id/shipped-quantity
pub async fn update_detail_shipped_quantity(
    State(pool): State<SqlitePool>,
    Path(detail_id): Path<i64>,
    Json(payload): Json<UpdateShippedQuantityDto>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("UPDATE order_detail SET shipped_quantity = ? WHERE id = ?")
        .bind(payload.shipped_quantity)
        .bind(detail_id)
        .execute(&pool)
        .await?;

    let detail: OrderDetail = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE id = ?"
    )
    .bind(detail_id)
    .fetch_one(&pool)
    .await?;

    // Check all details of this order
    let all_details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(detail.order_id)
    .fetch_all(&pool)
    .await?;

    let mut all_shipped = true;
    let mut any_shipped = false;

    for d in &all_details {
        if d.shipped_quantity.unwrap_or(0.0) < d.quantity {
            all_shipped = false;
        }
        if d.shipped_quantity.unwrap_or(0.0) > 0.0 {
            any_shipped = true;
        }
    }

    let mut order_shipping_status = None;
    if all_shipped {
        let now = get_vn_time();
        sqlx::query("UPDATE \"order\" SET shipping_status = 'Delivered', delivery_date = ? WHERE id = ?")
            .bind(now)
            .bind(detail.order_id)
            .execute(&pool)
            .await?;
        order_shipping_status = Some("Delivered".to_string());
    } else if any_shipped {
        sqlx::query("UPDATE \"order\" SET shipping_status = 'Shipping', delivery_date = NULL WHERE id = ?")
            .bind(detail.order_id)
            .execute(&pool)
            .await?;
        order_shipping_status = Some("Shipping".to_string());
    }

    Ok(Json(json!({
        "detail": {
            "id": detail.id,
            "order_id": detail.order_id,
            "product_id": detail.product_id,
            "shipped_quantity": detail.shipped_quantity
        },
        "order_shipping_status": order_shipping_status
    })))
}

// POST /api/orders/:id/import-consignment
pub async fn import_consignment(
    State(pool): State<SqlitePool>,
    Path(order_id): Path<i64>,
    Json(payload): Json<ImportConsignmentDto>,
) -> Result<impl IntoResponse, AppError> {
    let order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(order_id)
    .fetch_one(&pool)
    .await?;

    if order.r#type.as_deref() != Some("Purchase") {
        return Err(AppError::BadRequest("Đơn hàng không phải là đơn nhập hàng".into()));
    }

    if payload.details.is_empty() {
        return Err(AppError::BadRequest("Không có sản phẩm nào được chọn để nhập kho".into()));
    }

    let local_now = get_vn_time();
    let date_str = local_now.format("%d/%m/%Y %H:%M").to_string();
    let mut log_entries = Vec::new();
    let mut imported_product_ids = Vec::new();

    let mut tx = pool.begin().await?;

    let details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    for item in &payload.details {
        let qty_to_import = item.quantity;
        if qty_to_import <= 0.0 {
            continue;
        }

        let detail = match details.iter().find(|d| d.product_id == Some(item.product_id)) {
            Some(d) => d,
            None => continue,
        };

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
        .bind(item.product_id)
        .fetch_optional(&mut *tx)
        .await?;

        let prod = match prod_opt {
            Some(p) => p,
            None => continue,
        };

        let remaining = detail.quantity - detail.shipped_quantity.unwrap_or(0.0);
        if remaining <= 0.0 {
            continue;
        }

        let actual_import = qty_to_import.min(remaining);
        if actual_import <= 0.0 {
            continue;
        }

        let new_shipped = detail.shipped_quantity.unwrap_or(0.0) + actual_import;
        sqlx::query("UPDATE order_detail SET shipped_quantity = ? WHERE id = ?")
            .bind(new_shipped)
            .bind(detail.id)
            .execute(&mut *tx)
            .await?;

        imported_product_ids.push(prod.id);

        if prod.is_combo.unwrap_or(false) {
            let combo_items = sqlx::query(
                "SELECT product_id, CAST(quantity AS REAL) as quantity FROM combo_item WHERE combo_id = ?"
            )
            .bind(prod.id)
            .fetch_all(&mut *tx)
            .await?;

            for ci in combo_items {
                let child_id: i64 = ci.get("product_id");
                let ci_qty: f64 = ci.get("quantity");
                let child_import = actual_import * ci_qty;
                let child_cost = if ci_qty > 0.0 { detail.price / ci_qty } else { 0.0 };

                sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                    .bind(child_import)
                    .bind(child_id)
                    .execute(&mut *tx)
                    .await?;

                sqlx::query(
                    "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                     VALUES (?, ?, ?, ?, ?, ?)"
                )
                .bind(child_id)
                .bind(order.id)
                .bind(child_import)
                .bind(child_import)
                .bind(child_cost)
                .bind(local_now)
                .execute(&mut *tx)
                .await?;
            }
        } else {
            sqlx::query("UPDATE product SET stock = coalesce(stock, 0) + ? WHERE id = ?")
                .bind(actual_import)
                .bind(prod.id)
                .execute(&mut *tx)
                .await?;

            sqlx::query(
                "INSERT INTO stock_batch (product_id, purchase_order_id, original_quantity, current_quantity, cost_price, created_at) \
                 VALUES (?, ?, ?, ?, ?, ?)"
            )
            .bind(prod.id)
            .bind(order.id)
            .bind(actual_import)
            .bind(actual_import)
            .bind(detail.price)
            .bind(local_now)
            .execute(&mut *tx)
            .await?;
        }

        let unit_str = prod.unit.unwrap_or_else(|| "ĐV".into());
        log_entries.push(format!("Nhập {actual_import} {unit_str} {}", prod.name));
    }

    if log_entries.is_empty() {
        return Err(AppError::BadRequest("Không có sản phẩm hợp lệ nào được nhập".into()));
    }

    let log_text = format!("\n- [{date_str}] {}", log_entries.join(", "));
    let new_note = match order.note {
        Some(ref n) => format!("{n}{log_text}"),
        None => log_text.trim().to_string(),
    };

    // Check shipping status
    let updated_details: Vec<OrderDetail> = sqlx::query_as(
        "SELECT id, order_id, product_id, product_name_override, \
         CAST(quantity AS REAL) as quantity, \
         CAST(shipped_quantity AS REAL) as shipped_quantity, \
         CAST(price AS REAL) as price, \
         CAST(cost_price AS REAL) as cost_price, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, \
         CAST(invoiced_quantity AS REAL) as invoiced_quantity, \
         invoice_no \
         FROM order_detail WHERE order_id = ?"
    )
    .bind(order.id)
    .fetch_all(&mut *tx)
    .await?;

    let mut all_shipped = true;
    let mut any_shipped = false;
    for d in updated_details {
        if d.shipped_quantity.unwrap_or(0.0) < d.quantity {
            all_shipped = false;
        }
        if d.shipped_quantity.unwrap_or(0.0) > 0.0 {
            any_shipped = true;
        }
    }

    let (final_shipping_status, delivery_date) = if all_shipped {
        (Some("Delivered".to_string()), Some(local_now))
    } else if any_shipped {
        (Some("Shipping".to_string()), None)
    } else {
        (order.shipping_status, order.delivery_date)
    };

    sqlx::query("UPDATE \"order\" SET note = ?, shipping_status = ?, delivery_date = ? WHERE id = ?")
        .bind(new_note)
        .bind(final_shipping_status)
        .bind(delivery_date)
        .bind(order.id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    for pid in imported_product_ids {
        let _ = recalculate_product_cost_price(&pool, pid).await;
    }

    let updated_order: Order = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" WHERE id = ?"
    )
    .bind(order.id)
    .fetch_one(&pool)
    .await?;

    let resp = populate_order_details_response(&pool, &updated_order).await?;
    Ok(Json(json!({
        "message": "Đã nhập kho thành công!",
        "order": resp
    })))
}

// GET /api/orders/duplicates
pub async fn get_duplicate_orders(
    State(pool): State<SqlitePool>,
) -> Result<impl IntoResponse, AppError> {
    let local_now = get_vn_time();
    let start_of_day = local_now.date().and_time(NaiveTime::MIN);

    let orders: Vec<Order> = sqlx::query_as(
        "SELECT id, date, partner_id, CAST(total_amount AS REAL) as total_amount, \
         payment_method, type, note, CAST(amount_paid AS REAL) as amount_paid, \
         CAST(old_debt AS REAL) as old_debt, display_id, status, shipping_status, \
         shipping_address, shipping_phone, delivery_date, CAST(cash_given AS REAL) as cash_given, \
         created_by, CAST(is_duplicate_checked AS BOOLEAN) as is_duplicate_checked, \
         CAST(is_consignment AS BOOLEAN) as is_consignment, \
         CAST(is_invoiced AS BOOLEAN) as is_invoiced, invoice_no, invoice_date, invoice_note \
         FROM \"order\" \
         WHERE type = 'Sale' AND date >= ? AND display_id NOT IN ('#NODAU', 'NODAU') \
         AND (is_duplicate_checked = 0 OR is_duplicate_checked IS NULL)"
    )
    .bind(start_of_day)
    .fetch_all(&pool)
    .await?;

    let mut groups: HashMap<(String, i64), Vec<OrderResponse>> = HashMap::new();

    for o in orders {
        let resp = populate_order_details_response(&pool, &o).await?;
        if resp.details.is_empty() {
            continue;
        }

        let mut item_sigs: Vec<String> = resp
            .details
            .iter()
            .map(|d| format!("{}_{:.2}_{:.2}", d.product_id.unwrap_or(0), d.quantity, d.price))
            .collect();
        item_sigs.sort();
        let fingerprint = item_sigs.join("|");
        let amount_cents = (resp.total_amount * 100.0).round() as i64;

        groups.entry((fingerprint, amount_cents)).or_default().push(resp);
    }

    let mut duplicates: Vec<Vec<OrderResponse>> = Vec::new();
    for (_, list) in groups {
        if list.len() > 1 {
            let mut creators = std::collections::HashSet::new();
            for o in &list {
                creators.insert(o.created_by.clone().unwrap_or_default().to_lowercase());
            }
            if creators.len() > 1 {
                duplicates.push(list);
            }
        }
    }

    Ok(Json(duplicates))
}

// POST /api/orders/:id/check-duplicate
pub async fn check_duplicate_order(
    State(pool): State<SqlitePool>,
    Path(order_id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("UPDATE \"order\" SET is_duplicate_checked = 1 WHERE id = ?")
        .bind(order_id)
        .execute(&pool)
        .await?;

    Ok(Json(json!({
        "status": "success",
        "message": format!("Order {order_id} marked as checked")
    })))
}
