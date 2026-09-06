use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Event {
    pub id: i64,
    pub name: String,
    pub date: Option<NaiveDateTime>,
    pub is_active: Option<bool>,
    pub gift_types: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateEventDto {
    pub name: String,
    pub gift_types: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateEventDto {
    pub name: Option<String>,
    pub is_active: Option<bool>,
    pub gift_types: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct EventLog {
    pub id: i64,
    pub event_id: i64,
    pub partner_id: i64,
    pub completed_at: Option<NaiveDateTime>,
    pub note: Option<String>,
    pub gift_type: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct EventLogQueryDto {
    pub event_id: Option<i64>,
    pub partner_id: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ToggleEventLogDto {
    pub event_id: i64,
    pub partner_id: i64,
    pub gift_type: Option<String>,
}
