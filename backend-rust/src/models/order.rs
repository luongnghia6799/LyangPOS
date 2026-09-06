use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::models::product::ComboItemResponse;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Order {
    pub id: i64,
    pub date: Option<NaiveDateTime>,
    pub partner_id: Option<i64>,
    pub total_amount: Option<f64>,
    pub payment_method: Option<String>,
    pub r#type: Option<String>,
    pub note: Option<String>,
    pub amount_paid: Option<f64>,
    pub old_debt: Option<f64>,
    pub display_id: Option<String>,
    pub status: Option<String>,
    pub shipping_status: Option<String>,
    pub shipping_address: Option<String>,
    pub shipping_phone: Option<String>,
    pub delivery_date: Option<NaiveDateTime>,
    pub cash_given: Option<f64>,
    pub created_by: Option<String>,
    pub is_duplicate_checked: Option<bool>,
    pub is_consignment: Option<bool>,
    pub is_invoiced: Option<bool>,
    pub invoice_no: Option<String>,
    pub invoice_date: Option<NaiveDateTime>,
    pub invoice_note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OrderDetail {
    pub id: i64,
    pub order_id: i64,
    pub product_id: Option<i64>,
    pub product_name_override: Option<String>,
    pub quantity: f64,
    pub shipped_quantity: Option<f64>,
    pub price: f64,
    pub cost_price: Option<f64>,
    pub is_invoiced: Option<bool>,
    pub invoiced_quantity: Option<f64>,
    pub invoice_no: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderPartnerResponse {
    pub id: i64,
    pub name: String,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub debt_balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderDetailResponse {
    pub id: i64,
    pub product_id: Option<i64>,
    pub product_name: String,
    pub product_code: String,
    pub unit: String,
    pub product_unit: String,
    pub secondary_unit: String,
    pub multiplier: f64,
    pub quantity: f64,
    pub shipped_quantity: f64,
    pub price: f64,
    pub unit_price: f64,
    pub total_price: f64,
    pub cost_price: f64,
    pub latest_cost_price: f64,
    pub stock: f64,
    pub active_ingredient: String,
    pub specification: String,
    pub is_combo: bool,
    pub combo_items: Vec<ComboItemResponse>,
    pub is_invoiced: bool,
    pub invoiced_quantity: f64,
    pub invoice_no: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderResponse {
    pub id: i64,
    pub display_id: String,
    pub date: String,
    pub partner_id: Option<i64>,
    pub partner_name: String,
    pub partner_address: String,
    pub partner_phone: String,
    pub partner: Option<OrderPartnerResponse>,
    pub total_amount: f64,
    pub amount_paid: f64,
    pub payment_method: Option<String>,
    pub r#type: String,
    pub note: Option<String>,
    pub old_debt: Option<f64>,
    pub status: Option<String>,
    pub shipping_status: Option<String>,
    pub shipping_address: Option<String>,
    pub shipping_phone: Option<String>,
    pub delivery_date: Option<String>,
    pub cash_given: f64,
    pub created_by: Option<String>,
    pub is_consignment: bool,
    pub is_invoiced: bool,
    pub invoice_no: String,
    pub invoice_date: Option<String>,
    pub invoice_note: String,
    pub details: Vec<OrderDetailResponse>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateOrderDetailDto {
    pub product_id: Option<i64>,
    pub product_name: Option<String>,
    pub name: Option<String>,
    pub quantity: f64,
    pub price: f64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateOrderDto {
    pub partner_id: Option<i64>,
    pub r#type: String, // 'Sale' or 'Purchase'
    pub payment_method: String, // 'Cash', 'Debt', 'Transfer'
    pub date: Option<String>,
    pub note: Option<String>,
    pub amount_paid: Option<f64>,
    pub cash_given: Option<f64>,
    pub shipping_status: Option<String>,
    pub shipping_address: Option<String>,
    pub shipping_phone: Option<String>,
    pub created_by: Option<String>,
    pub is_consignment: Option<bool>,
    pub bank_account_id: Option<i64>,
    pub details: Vec<CreateOrderDetailDto>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOrderDto {
    pub partner_id: Option<i64>,
    pub r#type: Option<String>,
    pub payment_method: String,
    pub date: Option<String>,
    pub note: Option<String>,
    pub amount_paid: Option<f64>,
    pub cash_given: Option<f64>,
    pub shipping_status: Option<String>,
    pub shipping_address: Option<String>,
    pub shipping_phone: Option<String>,
    pub is_consignment: Option<bool>,
    pub bank_account_id: Option<i64>,
    pub details: Vec<CreateOrderDetailDto>,
    pub total_amount: Option<f64>, // For #NODAU updates
}

#[derive(Debug, Clone, Deserialize)]
pub struct OrderQueryDto {
    pub r#type: Option<String>,
    pub year: Option<String>,
    pub month: Option<String>,
    pub day: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub quarter: Option<i32>,
    pub search: Option<String>,
    pub search_partner: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub partner_id: Option<i64>,
    pub payment_method: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub debt_cycle: Option<bool>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub product_id: Option<i64>,
    pub search_id: Option<String>,
    pub search_product: Option<String>,
    #[serde(rename = "minPrice", default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub min_price: Option<f64>,
    #[serde(rename = "maxPrice", default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub max_price: Option<f64>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub page: Option<i64>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub limit: Option<i64>,
    pub shipping_status: Option<String>,
    pub delivered_year: Option<String>,
    pub delivered_month: Option<String>,
    pub delivered_day: Option<String>,
    pub is_consignment: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ImportConsignmentItemDto {
    pub product_id: i64,
    pub quantity: f64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ImportConsignmentDto {
    pub details: Vec<ImportConsignmentItemDto>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateStatusDto {
    pub status: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateShippingStatusDto {
    pub shipping_status: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateShippedQuantityDto {
    pub shipped_quantity: f64,
}
