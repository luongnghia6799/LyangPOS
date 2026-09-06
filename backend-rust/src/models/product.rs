use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub code: Option<String>,
    pub unit: Option<String>,
    pub secondary_unit: Option<String>,
    pub multiplier: Option<f64>,
    pub cost_price: Option<f64>,
    pub sale_price: Option<f64>,
    pub stock: Option<f64>,
    pub expiry_date: Option<String>,
    pub active_ingredient: Option<String>,
    pub brand: Option<String>,
    pub is_combo: Option<bool>,
    pub is_active: Option<bool>,
    pub latest_audit: Option<NaiveDateTime>,
    pub category_id: Option<i64>,
    pub accounting_price: Option<f64>,
    pub accounting_stock: Option<f64>,
    pub latest_cost_price: Option<f64>,
    pub bulk_quantity: Option<f64>,
    pub bulk_price: Option<f64>,
    pub alias: Option<String>,
    pub min_stock: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ComboItem {
    pub id: i64,
    pub combo_id: i64,
    pub product_id: i64,
    pub quantity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockBatch {
    pub id: i64,
    pub product_id: i64,
    pub purchase_order_id: Option<i64>,
    pub original_quantity: f64,
    pub current_quantity: f64,
    pub cost_price: f64,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComboItemResponse {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatestStockEntry {
    pub date: String,
    pub quantity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductResponse {
    pub id: i64,
    pub name: String,
    pub code: Option<String>,
    pub unit: Option<String>,
    pub secondary_unit: Option<String>,
    pub multiplier: f64,
    pub cost_price: f64,
    pub latest_cost_price: f64,
    pub sale_price: f64,
    pub stock: f64,
    pub current_stock: f64,
    pub min_stock: f64,
    pub expiry_date: Option<String>,
    pub active_ingredient: Option<String>,
    pub brand: Option<String>,
    pub is_combo: bool,
    pub is_active: bool,
    pub latest_audit: Option<String>,
    pub latest_stock_entry: Option<LatestStockEntry>,
    pub category_id: Option<i64>,
    pub category_name: String,
    pub category_icon: String,
    pub accounting_price: f64,
    pub accounting_stock: f64,
    pub bulk_quantity: Option<f64>,
    pub bulk_price: Option<f64>,
    pub alias: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub combo_items: Option<Vec<ComboItemResponse>>,
}

#[derive(Debug, Deserialize)]
pub struct ProductQueryDto {
    pub search: Option<String>,
    pub filterType: Option<String>,
    pub include_inactive: Option<String>,
    pub brand: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub category_id: Option<i64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub page: Option<u32>,
    #[serde(default, deserialize_with = "crate::utils::empty_string_as_none")]
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductDto {
    pub name: String,
    pub code: Option<String>,
    pub unit: Option<String>,
    pub secondary_unit: Option<String>,
    pub multiplier: Option<f64>,
    pub cost_price: Option<f64>,
    pub sale_price: Option<f64>,
    pub stock: Option<f64>,
    pub expiry_date: Option<String>,
    pub active_ingredient: Option<String>,
    pub brand: Option<String>,
    pub is_combo: Option<bool>,
    pub is_active: Option<bool>,
    pub category_id: Option<i64>,
    pub accounting_price: Option<f64>,
    pub accounting_stock: Option<f64>,
    pub bulk_quantity: Option<f64>,
    pub bulk_price: Option<f64>,
    pub alias: Option<String>,
    pub min_stock: Option<f64>,
    pub combo_items: Option<Vec<ComboItemInput>>,
}

#[derive(Debug, Deserialize)]
pub struct ComboItemInput {
    pub product_id: i64,
    pub quantity: f64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductDto {
    pub name: Option<String>,
    pub code: Option<String>,
    pub unit: Option<String>,
    pub secondary_unit: Option<String>,
    pub multiplier: Option<f64>,
    pub cost_price: Option<f64>,
    pub sale_price: Option<f64>,
    pub stock: Option<f64>,
    pub expiry_date: Option<String>,
    pub active_ingredient: Option<String>,
    pub brand: Option<String>,
    pub is_combo: Option<bool>,
    pub is_active: Option<bool>,
    pub category_id: Option<i64>,
    pub accounting_price: Option<f64>,
    pub accounting_stock: Option<f64>,
    pub bulk_quantity: Option<f64>,
    pub bulk_price: Option<f64>,
    pub alias: Option<String>,
    pub min_stock: Option<f64>,
    pub combo_items: Option<Vec<ComboItemInput>>,
}

#[derive(Debug, Deserialize)]
pub struct BulkUpdateDto {
    pub ids: Vec<i64>,
    pub category_id: Option<i64>,
    pub brand: Option<String>,
    pub is_active: Option<bool>,
    pub cost_price: Option<f64>,
    pub sale_price: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct BulkDeleteDto {
    pub ids: Vec<i64>,
}
