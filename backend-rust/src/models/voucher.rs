use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CashVoucher {
    pub id: i64,
    pub partner_id: Option<i64>,
    pub amount: f64,
    pub date: Option<NaiveDateTime>,
    pub note: Option<String>,
    pub r#type: Option<String>,
    pub source: Option<String>,
    pub order_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CashVoucherResponse {
    pub id: i64,
    pub partner_id: Option<i64>,
    pub partner_name: String,
    pub amount: f64,
    pub date: String,
    pub note: Option<String>,
    pub r#type: String,
    pub source: String,
    pub order_id: Option<i64>,
    pub order_display_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VoucherQueryDto {
    pub partner_id: Option<i64>,
    pub source: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub year: Option<i32>,
    pub month: Option<u32>,
    pub day: Option<u32>,
    pub quarter: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateVoucherDto {
    pub partner_id: Option<i64>,
    pub amount: f64,
    pub note: Option<String>,
    pub r#type: Option<String>,
    pub source: Option<String>,
    pub order_id: Option<i64>,
    pub date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVoucherDto {
    pub amount: Option<f64>,
    pub note: Option<String>,
    pub r#type: Option<String>,
    pub date: Option<String>,
}
