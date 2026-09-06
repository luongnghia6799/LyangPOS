use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

// In-memory global store for POS terminals
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PosTerminalInfo {
    pub terminal_id: String,
    pub terminal_name: String,
    pub user_name: String,
    pub ip_address: String,
    pub last_active: String,
    pub cart: serde_json::Value,
    pub partner: Option<serde_json::Value>,
    pub partner_name: String,
    pub payment_method: String,
    pub amount_paid: f64,
    pub cash_given: f64,
    pub note: String,
    pub total_amount: f64,
    pub total_items: f64,
    pub status: String,
    pub current_page: String,
    pub remote_updated: bool,
    pub action: Option<String>,
}

pub type PosTerminalsState = Arc<RwLock<HashMap<String, PosTerminalInfo>>>;
pub type PackingSyncState = Arc<RwLock<serde_json::Value>>;

pub fn init_pos_state() -> (PosTerminalsState, PackingSyncState) {
    let initial_packing = serde_json::json!({
        "state_id": chrono::Utc::now().timestamp_millis(),
        "type": "CLEAR",
        "orders": [],
        "heldInvoices": []
    });
    (
        Arc::new(RwLock::new(HashMap::new())),
        Arc::new(RwLock::new(initial_packing)),
    )
}

pub async fn get_pos_terminals(
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
) -> impl IntoResponse {
    let mut map = terminals_state.write().await;
    let now = Utc::now();
    let cutoff = now - chrono::Duration::minutes(3);

    // Clean stale
    map.retain(|_, v| {
        if let Ok(dt) = DateTime::parse_from_rfc3339(&v.last_active) {
            dt.with_timezone(&Utc) >= cutoff
        } else {
            true
        }
    });

    let mut list: Vec<PosTerminalInfo> = map.values().cloned().collect();
    list.sort_by(|a, b| b.last_active.cmp(&a.last_active));

    Json(serde_json::json!({
        "terminals": list,
        "count": list.len(),
        "request_ip": "127.0.0.1",
        "server_ips": ["127.0.0.1", "localhost"]
    }))
}

pub async fn delete_pos_terminal(
    Path(terminal_id): Path<String>,
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
) -> impl IntoResponse {
    let mut map = terminals_state.write().await;
    if map.remove(&terminal_id).is_some() {
        Json(serde_json::json!({"status": "ok", "message": format!("Terminal {} deleted", terminal_id)}))
            .into_response()
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"status": "not_found", "message": "Terminal not found"})),
        )
            .into_response()
    }
}

pub async fn clear_all_pos_terminals(
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
) -> impl IntoResponse {
    let mut map = terminals_state.write().await;
    map.clear();
    Json(serde_json::json!({"status": "ok", "message": "All terminals cleared"}))
}

pub async fn update_pos_terminal_state(
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
    Json(data): Json<serde_json::Value>,
) -> impl IntoResponse {
    let terminal_id = data
        .get("terminal_id")
        .and_then(|v| v.as_str())
        .unwrap_or("POS-DEFAULT")
        .to_string();

    let mut map = terminals_state.write().await;
    let now_str = Utc::now().to_rfc3339();

    if let Some(existing) = map.get_mut(&terminal_id) {
        if existing.remote_updated {
            existing.remote_updated = false;
            existing.last_active = now_str.clone();
            let action = existing.action.take();
            return Json(serde_json::json!({
                "status": "remote_sync",
                "action": action,
                "cart": existing.cart,
                "partner": existing.partner,
                "partner_name": existing.partner_name,
                "payment_method": existing.payment_method,
                "amount_paid": existing.amount_paid,
                "cash_given": existing.cash_given,
                "note": existing.note,
                "total_amount": existing.total_amount,
                "total_items": existing.total_items
            }));
        }
    }

    let terminal_name = data
        .get("terminal_name")
        .and_then(|v| v.as_str())
        .unwrap_or(&format!("Máy POS ({})", terminal_id))
        .to_string();

    let user_name = data
        .get("user_name")
        .and_then(|v| v.as_str())
        .unwrap_or("Thu ngân")
        .to_string();

    let cart = data.get("cart").cloned().unwrap_or(serde_json::json!([]));
    let partner = data.get("partner").cloned();
    let partner_name = data
        .get("partner_name")
        .and_then(|v| v.as_str())
        .unwrap_or("Khách lẻ")
        .to_string();

    let payment_method = data
        .get("payment_method")
        .and_then(|v| v.as_str())
        .unwrap_or("Cash")
        .to_string();

    let amount_paid = data.get("amount_paid").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let cash_given = data.get("cash_given").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let note = data.get("note").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let total_amount = data.get("total_amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let total_items = data.get("total_items").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let status = data.get("status").and_then(|v| v.as_str()).unwrap_or("active").to_string();
    let current_page = data.get("current_page").and_then(|v| v.as_str()).unwrap_or("POS").to_string();

    map.insert(
        terminal_id.clone(),
        PosTerminalInfo {
            terminal_id: terminal_id.clone(),
            terminal_name,
            user_name,
            ip_address: "127.0.0.1".to_string(),
            last_active: now_str,
            cart,
            partner,
            partner_name,
            payment_method,
            amount_paid,
            cash_given,
            note,
            total_amount,
            total_items,
            status,
            current_page,
            remote_updated: false,
            action: None,
        },
    );

    Json(serde_json::json!({"status": "ok", "terminal_id": terminal_id}))
}

pub async fn edit_pos_terminal_cart(
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
    Json(data): Json<serde_json::Value>,
) -> impl IntoResponse {
    let terminal_id = match data.get("terminal_id").and_then(|v| v.as_str()) {
        Some(id) => id,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({"error": "Missing terminal_id"})),
            )
                .into_response()
        }
    };

    let mut map = terminals_state.write().await;
    if let Some(term) = map.get_mut(terminal_id) {
        if let Some(cart) = data.get("cart") {
            term.cart = cart.clone();
            if let Some(arr) = cart.as_array() {
                let mut sum_qty = 0.0;
                let mut sum_amt = 0.0;
                for c in arr {
                    let q = c.get("quantity").and_then(|v| v.as_f64()).unwrap_or(1.0);
                    let p = c
                        .get("price")
                        .or_else(|| c.get("sale_price"))
                        .and_then(|v| v.as_f64())
                        .unwrap_or(0.0);
                    sum_qty += q;
                    sum_amt += q * p;
                }
                term.total_items = sum_qty;
                term.total_amount = sum_amt;
            }
        }
        if let Some(partner) = data.get("partner") {
            term.partner = Some(partner.clone());
        }
        if let Some(name) = data.get("partner_name").and_then(|v| v.as_str()) {
            term.partner_name = name.to_string();
        }
        if let Some(method) = data.get("payment_method").and_then(|v| v.as_str()) {
            term.payment_method = method.to_string();
        }
        if let Some(paid) = data.get("amount_paid").and_then(|v| v.as_f64()) {
            term.amount_paid = paid;
        }
        if let Some(cash) = data.get("cash_given").and_then(|v| v.as_f64()) {
            term.cash_given = cash;
        }
        if let Some(note) = data.get("note").and_then(|v| v.as_str()) {
            term.note = note.to_string();
        }
        term.remote_updated = true;
        Json(serde_json::json!({"status": "ok"})).into_response()
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Terminal not found"})),
        )
            .into_response()
    }
}

pub async fn trigger_pos_terminal_action(
    State((terminals_state, _)): State<(PosTerminalsState, PackingSyncState)>,
    Json(data): Json<serde_json::Value>,
) -> impl IntoResponse {
    let terminal_id = match data.get("terminal_id").and_then(|v| v.as_str()) {
        Some(id) => id,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({"error": "Missing terminal_id"})),
            )
                .into_response()
        }
    };

    let action = data.get("action").and_then(|v| v.as_str()).map(|s| s.to_string());

    let mut map = terminals_state.write().await;
    if let Some(term) = map.get_mut(terminal_id) {
        term.action = action;
        term.remote_updated = true;
        Json(serde_json::json!({"status": "ok"})).into_response()
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Terminal not found"})),
        )
            .into_response()
    }
}

pub async fn get_packing_sync(
    State((_, packing_state)): State<(PosTerminalsState, PackingSyncState)>,
) -> impl IntoResponse {
    let state = packing_state.read().await;
    Json(state.clone())
}

pub async fn update_packing_sync(
    State((_, packing_state)): State<(PosTerminalsState, PackingSyncState)>,
    Json(mut data): Json<serde_json::Value>,
) -> impl IntoResponse {
    let mut state = packing_state.write().await;
    if let Some(obj) = data.as_object_mut() {
        obj.insert(
            "state_id".to_string(),
            serde_json::json!(chrono::Utc::now().timestamp_millis()),
        );
    }
    *state = data.clone();
    Json(data)
}
