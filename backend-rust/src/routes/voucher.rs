use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::partner::Partner;
use crate::models::voucher::{CashVoucher, CashVoucherResponse, CreateVoucherDto, UpdateVoucherDto, VoucherQueryDto};
use crate::routes::partner::recalculate_partner_debt_internal;

pub async fn get_vouchers(
    State(pool): State<SqlitePool>,
    Query(params): Query<VoucherQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let partners: Vec<Partner> = sqlx::query_as(
        "SELECT id, name, type, \
         CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, \
         cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance FROM partner"
    )
    .fetch_all(&pool)
    .await?;

    let partner_map: HashMap<i64, String> = partners.into_iter().map(|p| (p.id, p.name)).collect();

    // Fetch orders display_id map
    let orders_rows = sqlx::query("SELECT id, display_id FROM \"order\"")
        .fetch_all(&pool)
        .await?;

    let mut order_map: HashMap<i64, String> = HashMap::new();
    for row in orders_rows {
        let oid: i64 = row.get("id");
        let disp: Option<String> = row.get("display_id");
        order_map.insert(oid, disp.unwrap_or_else(|| oid.to_string()));
    }

    let vouchers: Vec<CashVoucher> = sqlx::query_as(
        "SELECT id, partner_id, CAST(amount AS REAL) as amount, date, note, type, source, order_id \
         FROM cash_voucher ORDER BY date DESC"
    )
    .fetch_all(&pool)
    .await?;

    let mut response_list = Vec::new();

    for v in vouchers {
        // Filter partner
        if let Some(p_id) = params.partner_id {
            if p_id == 0 {
                if v.partner_id.is_some() {
                    continue;
                }
            } else if v.partner_id != Some(p_id) {
                continue;
            }
        }

        // Filter source
        if let Some(ref src) = params.source {
            if v.source.as_deref() != Some(src) {
                continue;
            }
        }

        let partner_name = if let Some(pid) = v.partner_id {
            partner_map.get(&pid).cloned().unwrap_or_else(|| "Khác".into())
        } else {
            "Khác".into()
        };

        let order_disp = v.order_id.and_then(|oid| order_map.get(&oid).cloned());

        let date_str = v.date
            .map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string())
            .unwrap_or_default();

        response_list.push(CashVoucherResponse {
            id: v.id,
            partner_id: v.partner_id,
            partner_name,
            amount: v.amount,
            date: date_str,
            note: v.note,
            r#type: v.r#type.unwrap_or_else(|| "Payment".into()),
            source: v.source.unwrap_or_else(|| "manual".into()),
            order_id: v.order_id,
            order_display_id: order_disp,
        });
    }

    Ok(Json(response_list))
}

pub async fn create_voucher(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateVoucherDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.amount <= 0.0 {
        return Err(AppError::BadRequest("Số tiền phải lớn hơn 0".into()));
    }

    let v_type = payload.r#type.unwrap_or_else(|| "Payment".to_string());
    let source = payload.source.unwrap_or_else(|| "manual".to_string());

    let res = sqlx::query(
        "INSERT INTO cash_voucher (partner_id, amount, note, type, source, order_id, date) \
         VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 hours'))"
    )
    .bind(payload.partner_id)
    .bind(payload.amount)
    .bind(payload.note.as_deref())
    .bind(&v_type)
    .bind(&source)
    .bind(payload.order_id)
    .execute(&pool)
    .await?;

    let new_id = res.last_insert_rowid();

    if let Some(pid) = payload.partner_id {
        recalculate_partner_debt_internal(&pool, pid).await?;
    }

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "id": new_id,
            "status": "success",
            "message": "Tạo phiếu thu/chi thành công"
        })),
    ))
}

pub async fn update_voucher(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateVoucherDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, CashVoucher>(
        "SELECT id, partner_id, CAST(amount AS REAL) as amount, date, note, type, source, order_id \
         FROM cash_voucher WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Phiếu không tồn tại".into()))?;

    let amount = payload.amount.unwrap_or(existing.amount);
    let note = payload.note.or(existing.note);
    let v_type = payload.r#type.or(existing.r#type).unwrap_or_else(|| "Payment".into());

    sqlx::query("UPDATE cash_voucher SET amount = ?, note = ?, type = ? WHERE id = ?")
        .bind(amount)
        .bind(note.as_deref())
        .bind(&v_type)
        .bind(id)
        .execute(&pool)
        .await?;

    if let Some(pid) = existing.partner_id {
        recalculate_partner_debt_internal(&pool, pid).await?;
    }

    Ok(Json(json!({
        "status": "success",
        "message": "Cập nhật phiếu thành công"
    })))
}

pub async fn delete_voucher(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, CashVoucher>(
        "SELECT id, partner_id, CAST(amount AS REAL) as amount, date, note, type, source, order_id \
         FROM cash_voucher WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Phiếu không tồn tại".into()))?;

    sqlx::query("DELETE FROM cash_voucher WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    if let Some(pid) = existing.partner_id {
        recalculate_partner_debt_internal(&pool, pid).await?;
    }

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}
