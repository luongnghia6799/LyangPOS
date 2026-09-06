use axum::{
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Local, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};

use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub last_seen: DateTime<Utc>,
    pub user_agent: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveDeviceItem {
    pub ip: String,
    pub last_seen: String,
    pub label: String,
    pub is_host: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteScanItem {
    pub id: i64,
    pub barcode: String,
    pub is_processed: bool,
    pub created_at: String,
}

// Thread-safe in-memory Active Devices Registry
pub struct LanState {
    pub devices: Mutex<HashMap<String, DeviceInfo>>,
    pub scan_queue: Mutex<Vec<RemoteScanItem>>,
}

impl Default for LanState {
    fn default() -> Self {
        Self {
            devices: Mutex::new(HashMap::new()),
            scan_queue: Mutex::new(Vec::new()),
        }
    }
}

static LAN_STATE: OnceLock<Arc<LanState>> = OnceLock::new();

pub fn get_lan_state() -> Arc<LanState> {
    LAN_STATE.get_or_init(|| Arc::new(LanState::default())).clone()
}

pub fn get_local_ip() -> String {
    if let Ok(socket) = std::net::UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(local_addr) = socket.local_addr() {
                let ip = local_addr.ip().to_string();
                if !ip.starts_with("127.") {
                    return ip;
                }
            }
        }
    }
    "127.0.0.1".to_string()
}

pub fn record_active_device(ip: String, user_agent: String) {
    let state = get_lan_state();
    let mut label = "Thiết bị Máy trạm".to_string();
    if user_agent.contains("Tauri") {
        label = "Ứng dụng Tauri (Client)".to_string();
    } else if user_agent.contains("Windows") {
        label = "Máy tính Windows".to_string();
    } else if user_agent.contains("Android") {
        label = "Điện thoại Android".to_string();
    } else if user_agent.contains("iPhone") || user_agent.contains("iPad") {
        label = "Thiết bị iOS".to_string();
    } else if user_agent.contains("Macintosh") {
        label = "Máy tính Mac".to_string();
    }

    if let Ok(mut map) = state.devices.lock() {
        map.insert(
            ip,
            DeviceInfo {
                last_seen: Utc::now(),
                user_agent,
                label,
            },
        );
    };
}

pub async fn get_active_devices() -> Result<impl IntoResponse, AppError> {
    let state = get_lan_state();
    let now = Utc::now();
    let server_ip = get_local_ip();
    let mut active_list = Vec::new();

    if let Ok(mut map) = state.devices.lock() {
        map.retain(|ip, info| {
            let duration = now.signed_duration_since(info.last_seen);
            if duration.num_minutes() < 2 {
                let is_host = ip == "127.0.0.1" || ip == "localhost" || ip == &server_ip;
                active_list.push(ActiveDeviceItem {
                    ip: ip.clone(),
                    last_seen: info.last_seen.to_rfc3339(),
                    label: if is_host {
                        "Máy chủ chính (Host)".to_string()
                    } else {
                        info.label.clone()
                    },
                    is_host,
                });
                true
            } else {
                false
            }
        });
    }

    let has_host = active_list.iter().any(|d| d.is_host);
    if !has_host {
        active_list.insert(
            0,
            ActiveDeviceItem {
                ip: server_ip.clone(),
                last_seen: now.to_rfc3339(),
                label: "Máy chủ chính (Host)".to_string(),
                is_host: true,
            },
        );
    }

    Ok(Json(active_list))
}

pub async fn get_ip_info() -> Result<impl IntoResponse, AppError> {
    let ip = get_local_ip();
    let hostname = std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .unwrap_or_else(|_| "localhost".to_string());

    Ok(Json(json!({
        "ip": ip,
        "port": 3588,
        "hostname": hostname
    })))
}

pub async fn unlock_firewall() -> Result<impl IntoResponse, AppError> {
    #[cfg(target_os = "windows")]
    {
        let port = 3588;
        let rule_name = format!("LyangPOS LAN Access ({})", port);
        let script = format!(
            "netsh advfirewall firewall delete rule name=\"{}\" 2>$null; netsh advfirewall firewall add rule name=\"{}\" dir=in action=allow protocol=TCP localport={}",
            rule_name, rule_name, port
        );

        let ps_cmd = format!(
            "Start-Process powershell -ArgumentList \"-NoProfile -ExecutionPolicy Bypass -Command {}\" -Verb RunAs -WindowStyle Hidden",
            script
        );

        let _ = std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", &ps_cmd])
            .spawn();

        return Ok(Json(json!({
            "success": true,
            "message": "Đã gửi yêu cầu mở Tường lửa. Vui lòng nhấn 'Yes' nếu xuất hiện hộp thoại UAC của Windows."
        })));
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(Json(json!({
            "success": false,
            "message": "Tính năng mở khóa Firewall chỉ áp dụng trên hệ điều hành Windows."
        })))
    }
}

#[derive(Deserialize)]
pub struct AddRemoteScanDto {
    pub barcode: String,
}

pub async fn add_remote_scan(Json(payload): Json<AddRemoteScanDto>) -> Result<impl IntoResponse, AppError> {
    if payload.barcode.trim().is_empty() {
        return Err(AppError::BadRequest("Barcode không được để trống".into()));
    }

    let state = get_lan_state();
    let now = Local::now().to_rfc3339();
    let item = RemoteScanItem {
        id: Local::now().timestamp_millis(),
        barcode: payload.barcode.trim().to_string(),
        is_processed: false,
        created_at: now,
    };

    if let Ok(mut q) = state.scan_queue.lock() {
        q.push(item.clone());
    }

    Ok((axum::http::StatusCode::CREATED, Json(item)))
}

pub async fn pop_remote_scan() -> Result<impl IntoResponse, AppError> {
    let state = get_lan_state();
    if let Ok(mut q) = state.scan_queue.lock() {
        if let Some(pos) = q.iter().position(|x| !x.is_processed) {
            let item = &mut q[pos];
            item.is_processed = true;
            return Ok(Json(Some(item.clone())));
        }
    }

    Ok(Json(None::<RemoteScanItem>))
}
