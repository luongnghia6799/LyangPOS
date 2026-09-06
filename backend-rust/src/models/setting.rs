use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AppSetting {
    pub id: i64,
    pub setting_key: String,
    pub setting_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PrintTemplate {
    pub id: i64,
    pub name: String,
    pub module: String,
    pub is_default: Option<bool>,
    pub config: Option<String>,
    pub content_config: Option<String>,
}
