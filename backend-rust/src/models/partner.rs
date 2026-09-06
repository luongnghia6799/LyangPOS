use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Partner {
    pub id: i64,
    pub name: String,
    pub r#type: String,
    pub is_customer: Option<bool>,
    pub is_supplier: Option<bool>,
    pub cccd: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub debt_balance: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CustomerPrice {
    pub id: i64,
    pub partner_id: i64,
    pub product_id: i64,
    pub price: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerResponse {
    pub id: i64,
    pub name: String,
    pub r#type: String,
    pub is_customer: bool,
    pub is_supplier: bool,
    pub cccd: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub debt_balance: f64,
    pub opening_balance: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub yearly_revenue: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct PartnerQueryDto {
    pub search: Option<String>,
    pub r#type: Option<String>,
    pub brand: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub page: Option<u32>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePartnerDto {
    pub name: String,
    pub is_customer: Option<bool>,
    pub is_supplier: Option<bool>,
    pub cccd: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub opening_balance: Option<f64>,
    pub debt_balance: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePartnerDto {
    pub name: Option<String>,
    pub is_customer: Option<bool>,
    pub is_supplier: Option<bool>,
    pub cccd: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub opening_balance: Option<f64>,
    pub debt_balance: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct CustomPriceDto {
    pub partner_id: i64,
    pub product_id: i64,
    pub price: f64,
}

#[derive(Debug, Deserialize)]
pub struct BulkCustomPricesDto {
    pub partner_id: i64,
    pub prices: std::collections::HashMap<String, f64>,
}
