use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BankAccount {
    pub id: i64,
    pub bank_name: String,
    pub account_number: String,
    pub account_holder: Option<String>,
    pub balance: Option<f64>,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BankTransaction {
    pub id: i64,
    pub account_id: i64,
    pub amount: f64,
    pub date: Option<NaiveDateTime>,
    pub r#type: Option<String>,
    pub note: Option<String>,
    pub partner_id: Option<i64>,
    pub order_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankAccountResponse {
    pub id: i64,
    pub bank_name: String,
    pub account_number: String,
    pub account_holder: Option<String>,
    pub balance: f64,
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankTransactionResponse {
    pub id: i64,
    pub account_id: i64,
    pub bank_name: String,
    pub amount: f64,
    pub date: String,
    pub r#type: String,
    pub note: Option<String>,
    pub partner_name: Option<String>,
    pub order_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBankAccountDto {
    pub bank_name: String,
    pub account_number: String,
    pub account_holder: Option<String>,
    pub balance: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBankAccountDto {
    pub bank_name: Option<String>,
    pub account_number: Option<String>,
    pub account_holder: Option<String>,
    pub balance: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBankTransactionDto {
    pub account_id: i64,
    pub amount: f64,
    pub r#type: String,
    pub note: Option<String>,
    pub partner_id: Option<i64>,
    pub order_id: Option<i64>,
    pub date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BankTransactionQueryDto {
    pub account_id: Option<i64>,
    pub partner_id: Option<i64>,
    pub year: Option<i32>,
    pub month: Option<u32>,
    pub day: Option<u32>,
    pub quarter: Option<u32>,
}
