use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AccountingTemplate {
    pub id: i64,
    pub name: String,
    pub file_path: String,
    pub start_row: i32,
    pub is_active: Option<bool>,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AccountingMapping {
    pub id: i64,
    pub template_id: i64,
    pub column_letter: String,
    pub source_type: String, // index, field, static, static_first, skip
    pub source_value: Option<String>,
    pub header_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MappingConfigDto {
    pub source_type: String,
    pub source_value: Option<String>,
    pub header_name: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SaveAccountingConfigDto {
    pub start_row: Option<i32>,
    pub mappings: Option<std::collections::HashMap<String, MappingConfigDto>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DailyInvoicesQueryDto {
    pub scope: Option<String>, // daily, pending, completed
    pub date: Option<String>,
    pub search: Option<String>,
    pub status: Option<String>, // all, invoiced, uninvoiced
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOrderInvoiceStatusDto {
    pub is_invoiced: Option<bool>,
    pub invoice_no: Option<String>,
    pub invoice_note: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateOrderDetailInvoiceStatusDto {
    pub is_invoiced: Option<bool>,
    pub invoiced_quantity: Option<f64>,
    pub invoice_no: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct BulkBatchInvoiceDto {
    pub partner_ids: Option<Vec<serde_json::Value>>,
    pub date: Option<String>,
    pub is_invoiced: Option<bool>,
    pub invoice_no: Option<String>,
    pub invoice_note: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateItemInvoiceEntryDto {
    pub detail_id: i64,
    pub is_invoiced: Option<bool>,
    pub invoiced_quantity: Option<f64>,
    pub invoice_no: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdatePartnerItemsInvoiceDto {
    pub items: Option<Vec<UpdateItemInvoiceEntryDto>>,
    pub invoice_no: Option<String>,
}
