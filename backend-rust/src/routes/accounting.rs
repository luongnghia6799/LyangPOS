use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Local;
use serde_json::json;
use sqlx::SqlitePool;

use crate::error::AppError;
use crate::models::accounting::{
    AccountingMapping, AccountingTemplate, BulkBatchInvoiceDto, DailyInvoicesQueryDto,
    SaveAccountingConfigDto, UpdateOrderDetailInvoiceStatusDto, UpdateOrderInvoiceStatusDto,
    UpdatePartnerItemsInvoiceDto,
};

pub async fn get_accounting_source_fields() -> Result<impl IntoResponse, AppError> {
    let fields = json!([
        { "id": "index", "name": "Số thứ tự", "type": "index" },
        { "id": "code", "name": "Mã hàng", "type": "field" },
        { "id": "name", "name": "Tên sản phẩm", "type": "field" },
        { "id": "brand", "name": "Hãng", "type": "field" },
        { "id": "category", "name": "Phân loại", "type": "field" },
        { "id": "unit", "name": "ĐVT", "type": "field" },
        { "id": "quantity", "name": "Số lượng", "type": "field" },
        { "id": "price", "name": "Đơn giá", "type": "field" },
        { "id": "total", "name": "Thành tiền", "type": "field" },
        { "id": "display_id", "name": "Thống kê: Mã đơn (Hệ thống)", "type": "field" },
        { "id": "time", "name": "Thống kê: Thời gian (Hệ thống)", "type": "field" },
        { "id": "manual_id", "name": "Nhập tay: Số hóa đơn", "type": "field" },
        { "id": "manual_date", "name": "Nhập tay: Ngày hóa đơn", "type": "field" },
        { "id": "generated_price", "name": "Giá bán (Tự động tính theo LN mục tiêu)", "type": "field" },
        { "id": "static", "name": "Dữ liệu mẫu / Cố định", "type": "static" },
        { "id": "static_first", "name": "Cố định (Chỉ dòng đầu)", "type": "static_first" },
        { "id": "skip", "name": "Bỏ qua (Không ghi dữ liệu)", "type": "skip" }
    ]);

    Ok(Json(fields))
}

pub async fn get_accounting_templates(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let templates = sqlx::query_as::<_, AccountingTemplate>(
        "SELECT id, name, file_path, start_row, is_active, created_at FROM accounting_template ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(templates))
}

pub async fn handle_accounting_config_get(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let template = sqlx::query_as::<_, AccountingTemplate>(
        "SELECT id, name, file_path, start_row, is_active, created_at FROM accounting_template WHERE is_active = 1 LIMIT 1"
    )
    .fetch_optional(&pool)
    .await?;

    let template = template.ok_or_else(|| AppError::NotFound("Chưa có phôi hóa đơn kích hoạt".into()))?;
    
    let mappings = sqlx::query_as::<_, AccountingMapping>(
        "SELECT id, template_id, column_letter, source_type, source_value, header_name FROM accounting_mapping WHERE template_id = ?"
    )
    .bind(template.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(json!({
        "id": template.id,
        "name": template.name,
        "file_path": template.file_path,
        "start_row": template.start_row,
        "is_active": template.is_active,
        "mappings": mappings
    })))
}

pub async fn handle_accounting_config_post(
    State(pool): State<SqlitePool>,
    Json(payload): Json<SaveAccountingConfigDto>,
) -> Result<impl IntoResponse, AppError> {
    let template = sqlx::query_as::<_, AccountingTemplate>(
        "SELECT id, name, file_path, start_row, is_active, created_at FROM accounting_template WHERE is_active = 1 LIMIT 1"
    )
    .fetch_optional(&pool)
    .await?;

    let template = template.ok_or_else(|| AppError::BadRequest("Vui lòng tải lên phôi mẫu trước".into()))?;

    if let Some(start_row) = payload.start_row {
        sqlx::query("UPDATE accounting_template SET start_row = ? WHERE id = ?")
            .bind(start_row)
            .bind(template.id)
            .execute(&pool)
            .await?;
    }

    if let Some(mappings_map) = payload.mappings {
        sqlx::query("DELETE FROM accounting_mapping WHERE template_id = ?")
            .bind(template.id)
            .execute(&pool)
            .await?;

        for (col, config) in mappings_map {
            sqlx::query(
                "INSERT INTO accounting_mapping (template_id, column_letter, source_type, source_value, header_name) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(template.id)
            .bind(col.to_uppercase())
            .bind(config.source_type)
            .bind(config.source_value)
            .bind(config.header_name)
            .execute(&pool)
            .await?;
        }
    }

    handle_accounting_config_get(State(pool)).await
}

// -------------------------------------------------------------
// Daily & Pending Invoices Tracking
// -------------------------------------------------------------

#[derive(serde::Serialize)]
pub struct PartnerInvoiceGroup {
    pub partner_id: Option<i64>,
    pub partner_name: String,
    pub partner_phone: String,
    pub total_amount: f64,
    pub invoiced_amount: f64,
    pub uninvoiced_amount: f64,
    pub is_fully_invoiced: bool,
    pub orders: Vec<serde_json::Value>,
    pub items: Vec<serde_json::Value>,
}

pub async fn get_daily_invoices(
    State(pool): State<SqlitePool>,
    Query(query): Query<DailyInvoicesQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let scope = query.scope.unwrap_or_else(|| "daily".to_string());
    let date_str = query.date.unwrap_or_else(|| Local::now().format("%Y-%m-%d").to_string());
    let search = query.search.unwrap_or_default().trim().to_lowercase();
    let filter_status = query.status.unwrap_or_else(|| "all".to_string());

    let mut sql = r#"
        SELECT 
            o.id as order_id, o.display_id, o.date, o.total_amount, o.amount_paid,
            o.is_invoiced, o.invoice_no, o.invoice_note, o.invoice_date,
            o.partner_id, p.name as partner_name, p.phone as partner_phone,
            d.id as detail_id, d.product_id, pr.code as product_code, pr.name as product_name,
            d.quantity, d.price, d.is_invoiced as detail_is_invoiced,
            d.invoiced_quantity, d.invoice_no as detail_invoice_no
        FROM "order" o
        LEFT JOIN partner p ON o.partner_id = p.id
        JOIN order_detail d ON o.id = d.order_id
        LEFT JOIN product pr ON d.product_id = pr.id
        WHERE o.type = 'Sale' AND o.display_id NOT IN ('NODAU', '#NODAU')
    "#.to_string();

    if scope == "daily" {
        sql.push_str(&format!(" AND date(o.date) = '{}'", date_str));
    } else if scope == "pending" {
        sql.push_str(" AND (o.is_invoiced = 0 OR o.is_invoiced IS NULL)");
    } else if scope == "completed" {
        sql.push_str(" AND o.is_invoiced = 1");
        if !date_str.is_empty() {
            sql.push_str(&format!(" AND date(o.date) = '{}'", date_str));
        }
    }

    sql.push_str(" ORDER BY o.date DESC, o.id DESC");

    let rows = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut partners_map: std::collections::HashMap<i64, PartnerInvoiceGroup> = std::collections::HashMap::new();

    for row in rows {
        use sqlx::Row;
        let p_id: Option<i64> = row.try_get("partner_id").ok();
        let key = p_id.unwrap_or(0);

        let entry = partners_map.entry(key).or_insert_with(|| {
            let p_name: Option<String> = row.try_get("partner_name").ok();
            let p_phone: Option<String> = row.try_get("partner_phone").ok();
            PartnerInvoiceGroup {
                partner_id: p_id,
                partner_name: p_name.unwrap_or_else(|| "KHÁCH LẺ".to_string()),
                partner_phone: p_phone.unwrap_or_default(),
                total_amount: 0.0,
                invoiced_amount: 0.0,
                uninvoiced_amount: 0.0,
                is_fully_invoiced: true,
                orders: Vec::new(),
                items: Vec::new(),
            }
        });

        let detail_id: i64 = row.try_get("detail_id").unwrap_or(0);
        let qty: f64 = row.try_get("quantity").unwrap_or(0.0);
        let price: f64 = row.try_get("price").unwrap_or(0.0);
        let item_total = qty * price;
        let d_inv: bool = row.try_get::<i64, _>("detail_is_invoiced").map(|v| v != 0).unwrap_or(false);
        let d_inv_qty: f64 = row.try_get("invoiced_quantity").unwrap_or(if d_inv { qty } else { 0.0 });

        entry.total_amount += item_total;
        let inv_val = d_inv_qty * price;
        entry.invoiced_amount += inv_val;
        entry.uninvoiced_amount += (item_total - inv_val).max(0.0);

        if !d_inv {
            entry.is_fully_invoiced = false;
        }

        entry.items.push(json!({
            "detail_id": detail_id,
            "order_id": row.try_get::<i64, _>("order_id").unwrap_or(0),
            "product_id": row.try_get::<Option<i64>, _>("product_id").ok().flatten(),
            "product_code": row.try_get::<Option<String>, _>("product_code").ok().flatten().unwrap_or_default(),
            "product_name": row.try_get::<Option<String>, _>("product_name").ok().flatten().unwrap_or_default(),
            "quantity": qty,
            "price": price,
            "total": item_total,
            "is_invoiced": d_inv,
            "invoiced_quantity": d_inv_qty,
            "invoice_no": row.try_get::<Option<String>, _>("detail_invoice_no").ok().flatten().unwrap_or_default()
        }));
    }

    let mut partners_list: Vec<PartnerInvoiceGroup> = Vec::new();
    let mut total_sales = 0.0;
    let mut total_inv = 0.0;
    let mut total_uninv = 0.0;

    for (_, p) in partners_map {
        total_sales += p.total_amount;
        total_inv += p.invoiced_amount;
        total_uninv += p.uninvoiced_amount;

        if !search.is_empty() {
            let matches_name = p.partner_name.to_lowercase().contains(&search);
            let matches_phone = p.partner_phone.to_lowercase().contains(&search);
            let matches_item = p.items.iter().any(|it| {
                it["product_name"].as_str().unwrap_or("").to_lowercase().contains(&search)
                    || it["product_code"].as_str().unwrap_or("").to_lowercase().contains(&search)
            });
            if !matches_name && !matches_phone && !matches_item {
                continue;
            }
        }

        if filter_status == "invoiced" && !p.is_fully_invoiced {
            continue;
        }
        if filter_status == "uninvoiced" && p.is_fully_invoiced {
            continue;
        }

        partners_list.push(p);
    }

    partners_list.sort_by(|a, b| {
        a.is_fully_invoiced
            .cmp(&b.is_fully_invoiced)
            .then_with(|| b.total_amount.partial_cmp(&a.total_amount).unwrap_or(std::cmp::Ordering::Equal))
    });

    let total_count = partners_list.len();
    let invoiced_count = partners_list.iter().filter(|p| p.is_fully_invoiced).count();

    Ok(Json(json!({
        "scope": scope,
        "date": date_str,
        "summary": {
            "total_partners_count": total_count,
            "invoiced_partners_count": invoiced_count,
            "uninvoiced_partners_count": total_count.saturating_sub(invoiced_count),
            "total_sales_amount": total_sales,
            "invoiced_amount": total_inv,
            "uninvoiced_amount": total_uninv,
        },
        "partners": partners_list
    })))
}

pub async fn update_order_invoice_status(
    State(pool): State<SqlitePool>,
    Path(order_id): Path<i64>,
    Json(payload): Json<UpdateOrderInvoiceStatusDto>,
) -> Result<impl IntoResponse, AppError> {
    let is_inv = payload.is_invoiced.unwrap_or(true);
    let invoice_no = payload.invoice_no.unwrap_or_default();
    let invoice_note = payload.invoice_note.unwrap_or_default();
    let now = Local::now().naive_local();

    let mut tx = pool.begin().await?;

    if is_inv {
        sqlx::query(
            "UPDATE \"order\" SET is_invoiced = 1, invoice_no = ?, invoice_note = ?, invoice_date = ? WHERE id = ?"
        )
        .bind(&invoice_no)
        .bind(&invoice_note)
        .bind(now)
        .bind(order_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "UPDATE order_detail SET is_invoiced = 1, invoiced_quantity = quantity, invoice_no = ? WHERE order_id = ?"
        )
        .bind(&invoice_no)
        .bind(order_id)
        .execute(&mut *tx)
        .await?;
    } else {
        sqlx::query(
            "UPDATE \"order\" SET is_invoiced = 0, invoice_no = '', invoice_note = '', invoice_date = NULL WHERE id = ?"
        )
        .bind(order_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            "UPDATE order_detail SET is_invoiced = 0, invoiced_quantity = 0.0, invoice_no = '' WHERE order_id = ?"
        )
        .bind(order_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(Json(json!({ "message": "Cập nhật trạng thái hóa đơn thành công!" })))
}

pub async fn update_order_detail_invoice_status(
    State(pool): State<SqlitePool>,
    Path(detail_id): Path<i64>,
    Json(payload): Json<UpdateOrderDetailInvoiceStatusDto>,
) -> Result<impl IntoResponse, AppError> {
    let is_inv = payload.is_invoiced.unwrap_or(true);
    let inv_qty = payload.invoiced_quantity.unwrap_or(0.0);
    let invoice_no = payload.invoice_no.unwrap_or_default();

    let mut tx = pool.begin().await?;

    sqlx::query(
        "UPDATE order_detail SET is_invoiced = ?, invoiced_quantity = ?, invoice_no = ? WHERE id = ?"
    )
    .bind(if is_inv { 1 } else { 0 })
    .bind(inv_qty)
    .bind(&invoice_no)
    .bind(detail_id)
    .execute(&mut *tx)
    .await?;

    // Check parent order
    let row = sqlx::query("SELECT order_id FROM order_detail WHERE id = ?")
        .bind(detail_id)
        .fetch_optional(&mut *tx)
        .await?;

    if let Some(r) = row {
        use sqlx::Row;
        let ord_id: i64 = r.try_get("order_id").unwrap_or(0);
        let all_details = sqlx::query("SELECT is_invoiced FROM order_detail WHERE order_id = ?")
            .bind(ord_id)
            .fetch_all(&mut *tx)
            .await?;

        let all_done = !all_details.is_empty() && all_details.iter().all(|d| d.try_get::<i64, _>("is_invoiced").unwrap_or(0) == 1);
        if all_done {
            sqlx::query("UPDATE \"order\" SET is_invoiced = 1, invoice_date = ? WHERE id = ? AND is_invoiced = 0")
                .bind(Local::now().naive_local())
                .bind(ord_id)
                .execute(&mut *tx)
                .await?;
        }
    }

    tx.commit().await?;
    Ok(Json(json!({ "message": "Cập nhật món thành công!" })))
}

pub async fn bulk_batch_invoice_partners(
    State(pool): State<SqlitePool>,
    Json(payload): Json<BulkBatchInvoiceDto>,
) -> Result<impl IntoResponse, AppError> {
    let partner_ids = payload.partner_ids.unwrap_or_default();
    if partner_ids.is_empty() {
        return Ok(Json(json!({ "message": "Không có khách hàng nào được chọn", "updated_count": 0 })));
    }

    let is_inv = payload.is_invoiced.unwrap_or(true);
    let invoice_no = payload.invoice_no.unwrap_or_default();
    let invoice_note = payload.invoice_note.unwrap_or_default();
    let now = Local::now().naive_local();

    let mut tx = pool.begin().await?;
    let mut updated_count = 0;

    for pid_val in partner_ids {
        let mut sql_ord = "UPDATE \"order\" SET is_invoiced = ?, invoice_no = ?, invoice_note = ?, invoice_date = ? WHERE type = 'Sale'".to_string();
        if let Some(p_num) = pid_val.as_i64() {
            if p_num > 0 {
                sql_ord.push_str(&format!(" AND partner_id = {}", p_num));
            } else {
                sql_ord.push_str(" AND partner_id IS NULL");
            }
        } else {
            sql_ord.push_str(" AND partner_id IS NULL");
        }

        if let Some(ref d) = payload.date {
            sql_ord.push_str(&format!(" AND date(date) = '{}'", d));
        }

        let res = sqlx::query(&sql_ord)
            .bind(if is_inv { 1 } else { 0 })
            .bind(&invoice_no)
            .bind(&invoice_note)
            .bind(if is_inv { Some(now) } else { None })
            .execute(&mut *tx)
            .await?;

        updated_count += res.rows_affected();
    }

    tx.commit().await?;
    Ok(Json(json!({
        "message": format!("Đã xuất hóa đơn cho {} đơn hàng!", updated_count),
        "updated_count": updated_count
    })))
}

pub async fn update_partner_items_invoice(
    State(pool): State<SqlitePool>,
    Path(_partner_id): Path<i64>,
    Json(payload): Json<UpdatePartnerItemsInvoiceDto>,
) -> Result<impl IntoResponse, AppError> {
    let items = payload.items.unwrap_or_default();
    let mut tx = pool.begin().await?;

    for item in items {
        let is_inv = item.is_invoiced.unwrap_or(true);
        let inv_qty = item.invoiced_quantity.unwrap_or(0.0);
        let inv_no = item.invoice_no.unwrap_or_default();

        sqlx::query(
            "UPDATE order_detail SET is_invoiced = ?, invoiced_quantity = ?, invoice_no = ? WHERE id = ?"
        )
        .bind(if is_inv { 1 } else { 0 })
        .bind(inv_qty)
        .bind(&inv_no)
        .bind(item.detail_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(Json(json!({ "message": "Đã cập nhật trạng thái các món thành công!" })))
}
