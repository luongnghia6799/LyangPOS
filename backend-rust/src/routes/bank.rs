use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::SqlitePool;
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::bank::{
    BankAccount, BankAccountResponse, BankTransaction, BankTransactionQueryDto,
    BankTransactionResponse, CreateBankAccountDto, CreateBankTransactionDto, UpdateBankAccountDto,
};
use crate::models::partner::Partner;
use crate::routes::partner::recalculate_partner_debt_internal;

pub async fn get_bank_accounts(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let accounts: Vec<BankAccount> = sqlx::query_as(
        "SELECT id, bank_name, account_number, account_holder, \
         CAST(balance AS REAL) as balance, created_at FROM bank_account ORDER BY id ASC"
    )
    .fetch_all(&pool)
    .await?;

    let response: Vec<BankAccountResponse> = accounts
        .into_iter()
        .map(|a| BankAccountResponse {
            id: a.id,
            bank_name: a.bank_name,
            account_number: a.account_number,
            account_holder: a.account_holder,
            balance: a.balance.unwrap_or(0.0),
            created_at: a.created_at.map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string()),
        })
        .collect();

    Ok(Json(response))
}

pub async fn create_bank_account(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateBankAccountDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.bank_name.trim().is_empty() || payload.account_number.trim().is_empty() {
        return Err(AppError::BadRequest("Tên ngân hàng và số tài khoản là bắt buộc".into()));
    }

    let balance = payload.balance.unwrap_or(0.0);

    let res = sqlx::query(
        "INSERT INTO bank_account (bank_name, account_number, account_holder, balance, created_at) \
         VALUES (?, ?, ?, ?, datetime('now', '+7 hours'))"
    )
    .bind(payload.bank_name.trim())
    .bind(payload.account_number.trim())
    .bind(payload.account_holder.as_deref())
    .bind(balance)
    .execute(&pool)
    .await?;

    let new_id = res.last_insert_rowid();

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "id": new_id,
            "bank_name": payload.bank_name,
            "account_number": payload.account_number,
            "account_holder": payload.account_holder,
            "balance": balance
        })),
    ))
}

pub async fn update_bank_account(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateBankAccountDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, BankAccount>(
        "SELECT id, bank_name, account_number, account_holder, CAST(balance AS REAL) as balance, created_at \
         FROM bank_account WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Tài khoản ngân hàng không tồn tại".into()))?;

    let bank_name = payload.bank_name.unwrap_or(existing.bank_name);
    let account_number = payload.account_number.unwrap_or(existing.account_number);
    let account_holder = payload.account_holder.or(existing.account_holder);
    let balance = payload.balance.or(existing.balance).unwrap_or(0.0);

    sqlx::query(
        "UPDATE bank_account SET bank_name = ?, account_number = ?, account_holder = ?, balance = ? WHERE id = ?"
    )
    .bind(bank_name.trim())
    .bind(account_number.trim())
    .bind(account_holder.as_deref())
    .bind(balance)
    .bind(id)
    .execute(&pool)
    .await?;

    Ok(Json(json!({
        "status": "success",
        "message": "Cập nhật tài khoản ngân hàng thành công"
    })))
}

pub async fn delete_bank_account(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("DELETE FROM bank_transaction WHERE account_id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    let res = sqlx::query("DELETE FROM bank_account WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Tài khoản ngân hàng không tồn tại".into()));
    }

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}

pub async fn get_bank_transactions(
    State(pool): State<SqlitePool>,
    Query(params): Query<BankTransactionQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let accounts: Vec<BankAccount> = sqlx::query_as(
        "SELECT id, bank_name, account_number, account_holder, CAST(balance AS REAL) as balance, created_at \
         FROM bank_account"
    )
    .fetch_all(&pool)
    .await?;
    let account_map: HashMap<i64, String> = accounts.into_iter().map(|a| (a.id, a.bank_name)).collect();

    let partners: Vec<Partner> = sqlx::query_as(
        "SELECT id, name, type, CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance FROM partner"
    )
    .fetch_all(&pool)
    .await?;
    let partner_map: HashMap<i64, String> = partners.into_iter().map(|p| (p.id, p.name)).collect();

    let txs: Vec<BankTransaction> = sqlx::query_as(
        "SELECT id, account_id, CAST(amount AS REAL) as amount, date, type, note, partner_id, order_id \
         FROM bank_transaction ORDER BY date DESC"
    )
    .fetch_all(&pool)
    .await?;

    let mut response_list = Vec::new();
    for t in txs {
        if let Some(acc_id) = params.account_id {
            if t.account_id != acc_id {
                continue;
            }
        }
        if let Some(p_id) = params.partner_id {
            if t.partner_id != Some(p_id) {
                continue;
            }
        }

        let b_name = account_map.get(&t.account_id).cloned().unwrap_or_else(|| "N/A".into());
        let p_name = t.partner_id.and_then(|pid| partner_map.get(&pid).cloned());
        let date_str = t.date
            .map(|dt| dt.format("%Y-%m-%dT%H:%M:%S").to_string())
            .unwrap_or_default();

        response_list.push(BankTransactionResponse {
            id: t.id,
            account_id: t.account_id,
            bank_name: b_name,
            amount: t.amount,
            date: date_str,
            r#type: t.r#type.unwrap_or_else(|| "Deposit".into()),
            note: t.note,
            partner_name: p_name,
            order_id: t.order_id,
        });
    }

    Ok(Json(response_list))
}

pub async fn create_bank_transaction(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateBankTransactionDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.amount <= 0.0 {
        return Err(AppError::BadRequest("Số tiền giao dịch phải lớn hơn 0".into()));
    }

    let mut tx = pool.begin().await?;

    let res = sqlx::query(
        "INSERT INTO bank_transaction (account_id, amount, type, note, partner_id, order_id, date) \
         VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+7 hours'))"
    )
    .bind(payload.account_id)
    .bind(payload.amount)
    .bind(&payload.r#type)
    .bind(payload.note.as_deref())
    .bind(payload.partner_id)
    .bind(payload.order_id)
    .execute(&mut *tx)
    .await?;

    let new_id = res.last_insert_rowid();

    // Update bank balance
    if payload.r#type == "Deposit" {
        sqlx::query("UPDATE bank_account SET balance = balance + ? WHERE id = ?")
            .bind(payload.amount)
            .bind(payload.account_id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE bank_account SET balance = balance - ? WHERE id = ?")
            .bind(payload.amount)
            .bind(payload.account_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await?;

    if let Some(pid) = payload.partner_id {
        recalculate_partner_debt_internal(&pool, pid).await?;
    }

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "id": new_id,
            "status": "success",
            "message": "Tạo giao dịch ngân hàng thành công"
        })),
    ))
}

pub async fn delete_bank_transaction(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, BankTransaction>(
        "SELECT id, account_id, CAST(amount AS REAL) as amount, date, type, note, partner_id, order_id \
         FROM bank_transaction WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Giao dịch không tồn tại".into()))?;

    let mut tx = pool.begin().await?;

    // Revert bank account balance
    let t_type = existing.r#type.as_deref().unwrap_or("Deposit");
    if t_type == "Deposit" {
        sqlx::query("UPDATE bank_account SET balance = balance - ? WHERE id = ?")
            .bind(existing.amount)
            .bind(existing.account_id)
            .execute(&mut *tx)
            .await?;
    } else {
        sqlx::query("UPDATE bank_account SET balance = balance + ? WHERE id = ?")
            .bind(existing.amount)
            .bind(existing.account_id)
            .execute(&mut *tx)
            .await?;
    }

    sqlx::query("DELETE FROM bank_transaction WHERE id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    if let Some(pid) = existing.partner_id {
        recalculate_partner_debt_internal(&pool, pid).await?;
    }

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}
