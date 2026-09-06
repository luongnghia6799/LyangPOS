use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// --- Dashboard Stats Models ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStatsDto {
    pub revenue: f64,
    pub cash_revenue: f64,
    pub debt_revenue: f64,
    pub profit: f64,
    pub revenue_trend: i64,
    pub profit_trend: i64,
    pub customer_debt: f64,
    pub supplier_debt: f64,
    pub customer_debt_list: Vec<PartnerDebtItemDto>,
    pub supplier_debt_list: Vec<PartnerDebtItemDto>,
    pub chart: DashboardChartDto,
    pub expiry: ExpiryWarningDto,
    pub low_stock: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerDebtItemDto {
    pub id: i64,
    pub name: String,
    pub balance: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardChartDto {
    pub labels: Vec<String>,
    pub data: Vec<f64>,
    pub profit_data: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpiryWarningDto {
    pub near: i64,
    pub expired: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardFilterDto {
    pub year: Option<String>,
    pub month: Option<String>,
    pub day: Option<String>,
}

// --- Report Products & Partners ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportProductsQueryDto {
    pub year: Option<String>,
    pub month: Option<String>,
    pub day: Option<String>,
    pub quarter: Option<String>,
    pub search: Option<String>,
    pub brand: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductReportItemDto {
    pub id: serde_json::Value,
    pub name: String,
    pub unit: String,
    pub quantity: f64,
    pub revenue: f64,
    pub cost: f64,
    pub profit: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartnerReportItemDto {
    pub id: i64,
    pub name: String,
    pub count: i64,
    pub total_amount: f64,
    pub profit: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportPartnersQueryDto {
    pub r#type: Option<String>,
    pub year: Option<String>,
    pub month: Option<String>,
    pub day: Option<String>,
    pub quarter: Option<String>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

// --- Product Movement Report ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductMovementQueryDto {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub product_ids: Option<String>,
    pub brand: Option<String>,
    pub partner_id: Option<i64>,
    pub r#type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductMovementItemDto {
    pub date: String,
    pub display_id: String,
    pub order_id: i64,
    pub product_name: String,
    pub brand: String,
    pub r#type: String,
    pub quantity: f64,
    pub price: f64,
    pub total: f64,
    pub partner_name: String,
    pub unit: String,
}

// --- Report Synthesis ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportSynthesisQueryDto {
    pub r#type: Option<String>,
    pub year: Option<String>,
    pub month: Option<String>,
    pub day: Option<String>,
    pub quarter: Option<String>,
    pub partner_id: Option<i64>,
    pub product_id: Option<i64>,
    pub brand: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub group_by_brand: Option<String>,
    pub flatten: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynthesisReportItemDto {
    pub partner_name: String,
    pub partner_phone: Option<String>,
    pub product_name: String,
    pub brand: String,
    pub unit: String,
    pub quantity: f64,
    pub revenue: f64,
    pub partner_id: Option<i64>,
    pub product_id: Option<i64>,
    pub is_from_combo: Option<bool>,
    pub original_combo: Option<String>,
}

// --- Flattened Products Report ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlattenedProductsQueryDto {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub brands: Option<String>,
    pub categories: Option<String>,
    pub products: Option<String>,
    pub group_by_product: Option<String>,
    pub price_mode: Option<String>,
    pub has_code: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub target_profit: Option<f64>,
    pub profit_variance: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlattenedProductItemDto {
    pub order_id: String,
    pub time: String,
    pub date_iso: String,
    pub code: String,
    pub product_name: String,
    pub brand: String,
    pub category_name: String,
    pub quantity: f64,
    pub retail_price: f64,
    pub generated_price: f64,
    pub total: f64,
    pub unit: String,
    pub accounting_price: f64,
}

// --- Report Unsold ---
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportUnsoldQueryDto {
    pub search: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnsoldProductItemDto {
    pub id: i64,
    pub code: Option<String>,
    pub name: String,
    pub stock: f64,
    pub unit: Option<String>,
    pub multiplier: Option<f64>,
    pub cost_price: Option<f64>,
    pub last_sold_date: Option<String>,
    pub days_unsold: i64,
    pub total_value: f64,
}

// --- Inventory Audit Models ---
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InventoryAudit {
    pub id: i64,
    pub date: Option<NaiveDateTime>,
    pub note: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InventoryAuditDetail {
    pub id: i64,
    pub audit_id: i64,
    pub product_id: i64,
    pub system_stock: f64,
    pub actual_stock: f64,
    pub discrepancy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryAuditDetailDto {
    pub id: i64,
    pub audit_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub unit: String,
    pub secondary_unit: Option<String>,
    pub multiplier: f64,
    pub system_stock: f64,
    pub actual_stock: f64,
    pub discrepancy: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryAuditResponseDto {
    pub id: i64,
    pub date: String,
    pub note: Option<String>,
    pub status: Option<String>,
    pub details: Vec<InventoryAuditDetailDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAuditItemDto {
    pub product_id: i64,
    pub actual_stock: f64,
    pub system_stock: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAuditDto {
    pub note: Option<String>,
    pub status: Option<String>,
    pub items: Vec<CreateAuditItemDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryAuditQueryDto {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub search: Option<String>,
}

// --- Inventory Conversion Models ---
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct InventoryConversion {
    pub id: i64,
    pub date: Option<NaiveDateTime>,
    pub source_product_id: i64,
    pub dest_product_id: i64,
    pub source_qty: f64,
    pub multiplier: f64,
    pub dest_qty_expected: f64,
    pub dest_qty_actual: f64,
    pub cost_price_at_conversion: Option<f64>,
    pub user_id: Option<i64>,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryConversionDto {
    pub id: i64,
    pub date: String,
    pub source_product_id: i64,
    pub source_product_name: String,
    pub dest_product_id: i64,
    pub dest_product_name: String,
    pub source_qty: f64,
    pub multiplier: f64,
    pub dest_qty_expected: f64,
    pub dest_qty_actual: f64,
    pub cost_price_at_conversion: Option<f64>,
    pub note: Option<String>,
    pub user_display_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConvertInventoryDto {
    pub source_product_id: i64,
    pub dest_product_id: i64,
    pub source_qty: f64,
    pub multiplier: Option<f64>,
    pub dest_qty_actual: f64,
    pub note: Option<String>,
    pub user_id: Option<i64>,
    pub cost_price_at_conversion: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInventoryConversionDto {
    pub source_qty: Option<f64>,
    pub multiplier: Option<f64>,
    pub dest_qty_actual: Option<f64>,
    pub note: Option<String>,
    pub cost_price_at_conversion: Option<f64>,
}
