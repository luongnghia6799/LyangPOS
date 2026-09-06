use axum::{
    body::Body,
    extract::{Multipart, State},
    http::{header, Response, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::Local;
use serde_json::json;
use sqlx::SqlitePool;
use std::path::PathBuf;
use tokio::fs;

use crate::error::AppError;

fn get_base_dir() -> PathBuf {
    if let Ok(mut exe_path) = std::env::current_exe() {
        exe_path.pop(); // remove binary name -> D:\LyangPOS
        if exe_path.ends_with("target\\release") || exe_path.ends_with("target\\debug") {
            exe_path.pop(); // pop release/debug
            exe_path.pop(); // pop target
            exe_path.pop(); // pop backend-rust
        }
        return exe_path;
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

fn resolve_db_path() -> PathBuf {
    get_base_dir().join("easypos.db")
}

pub fn resolve_backup_dir() -> PathBuf {
    let dir = get_base_dir().join("backups");
    let _ = std::fs::create_dir_all(&dir);
    dir
}

/// Tự động sao lưu database mỗi 5 phút nếu có thay đổi dữ liệu (Rolling backup lưu 5 bản gần nhất)
pub fn start_auto_backup_task(pool: SqlitePool) {
    tokio::spawn(async move {
        let backup_dir = resolve_backup_dir();
        let db_path = resolve_db_path();
        let mut last_mtime: Option<std::time::SystemTime> = None;

        if let Ok(meta) = std::fs::metadata(&db_path) {
            last_mtime = meta.modified().ok();
        }

        tracing::info!("Auto-backup background service started. Backup dir: {:?}", backup_dir);

        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(300)).await; // Mỗi 5 phút

            if db_path.exists() {
                let current_mtime = std::fs::metadata(&db_path)
                    .ok()
                    .and_then(|m| m.modified().ok());

                if let Some(curr) = current_mtime {
                    let should_backup = match last_mtime {
                        Some(prev) => curr > prev,
                        None => true,
                    };

                    if should_backup {
                        // 1. Checkpoint WAL
                        let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);")
                            .execute(&pool)
                            .await;

                        // 2. Tạo bản sao lưu
                        let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
                        let backup_file = backup_dir.join(format!("lyangpos_backup_{}.db", timestamp));

                        if let Ok(_) = tokio::fs::copy(&db_path, &backup_file).await {
                            tracing::info!("Auto-backup created: {:?}", backup_file.file_name());
                            last_mtime = Some(curr);

                            // 3. Giữ lại tối đa 5 bản sao lưu mới nhất, xóa các bản cũ hơn
                            if let Ok(mut entries) = tokio::fs::read_dir(&backup_dir).await {
                                let mut files = Vec::new();
                                while let Ok(Some(entry)) = entries.next_entry().await {
                                    let path = entry.path();
                                    if path.is_file() {
                                        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                                            if name.starts_with("lyangpos_backup_") && name.ends_with(".db") {
                                                if let Ok(meta) = entry.metadata().await {
                                                    if let Ok(mod_time) = meta.modified() {
                                                        files.push((path, mod_time));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                files.sort_by_key(|k| k.1);
                                if files.len() > 5 {
                                    let count_to_delete = files.len() - 5;
                                    for (old_file, _) in files.into_iter().take(count_to_delete) {
                                        let _ = tokio::fs::remove_file(&old_file).await;
                                        tracing::info!("Removed old auto-backup: {:?}", old_file.file_name());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}


pub async fn download_backup(State(pool): State<SqlitePool>) -> Result<Response<Body>, AppError> {
    // 1. Flush WAL checkpoint to ensure all data is in the main sqlite db file
    let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);")
        .execute(&pool)
        .await;

    // 2. Identify db path
    let db_path = resolve_db_path();
    if !db_path.exists() {
        return Err(AppError::NotFound("Không tìm thấy file database easypos.db".into()));
    }

    let file_bytes = fs::read(&db_path)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Không thể đọc file db: {}", e)))?;

    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let filename = format!("easypos_local_backup_{}.db", timestamp);

    let response = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/x-sqlite3")
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename),
        )
        .body(Body::from(file_bytes))
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

    Ok(response)
}

pub async fn restore_backup(
    State(pool): State<SqlitePool>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    let mut file_data: Option<Vec<u8>> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Lỗi multipart field: {}", e)))?
    {
        let name = field.name().unwrap_or("").to_string();
        if name == "file" {
            let data = field
                .bytes()
                .await
                .map_err(|e| AppError::BadRequest(format!("Lỗi đọc file bytes: {}", e)))?;
            file_data = Some(data.to_vec());
            break;
        }
    }

    let data = file_data.ok_or_else(|| AppError::BadRequest("Vui lòng chọn file .db để khôi phục".into()))?;
    if data.is_empty() {
        return Err(AppError::BadRequest("File khôi phục rỗng".into()));
    }

    // 1. Lưu file backup tạm thời
    let temp_restore_path = resolve_backup_dir().join("_restore_temp.db");
    fs::write(&temp_restore_path, &data)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Lỗi lưu file tạm: {}", e)))?;

    // 2. Chuyển đổi trạng thái database sang WAL Checkpoint
    let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(&pool).await;

    // 3. Khôi phục dữ liệu bằng cách ghi đè trực tiếp vào easypos.db
    let db_path = resolve_db_path();
    
    // Đảm bảo ghi đè an toàn vào easypos.db
    if let Err(e) = fs::write(&db_path, &data).await {
        let _ = fs::remove_file(&temp_restore_path).await;
        return Err(AppError::Internal(anyhow::anyhow!("Lỗi ghi file database: {}", e)));
    }

    // Xóa file tạm
    let _ = fs::remove_file(&temp_restore_path).await;

    // Xóa cache WAL và SHM cũ nếu có để SQLite nạp lại file mới 100%
    let wal_path = db_path.with_extension("db-wal");
    let shm_path = db_path.with_extension("db-shm");
    let _ = fs::remove_file(wal_path).await;
    let _ = fs::remove_file(shm_path).await;

    // 4. Nạp lại schema và tối ưu database
    let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(&pool).await;
    let _ = sqlx::query("PRAGMA optimize;").execute(&pool).await;

    Ok(Json(json!({
        "message": "Dữ liệu đã được khôi phục thành công! Toàn bộ file database đã được cập nhật."
    })))
}


#[derive(serde::Deserialize)]
pub struct ResetDatabaseDto {
    pub password: Option<String>,
}

pub async fn reset_database(
    State(pool): State<SqlitePool>,
    Json(payload): Json<ResetDatabaseDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.password.as_deref() != Some("admin.reset") {
        return Err(AppError::Unauthorized("Sai mật khẩu xác nhận xóa!".into()));
    }

    let mut tx = pool.begin().await?;

    // 1. Transactions, vouchers & audits
    sqlx::query("DELETE FROM bank_transaction").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM cash_voucher").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM event_log").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM inventory_audit_detail").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM inventory_audit").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM inventory_conversion").execute(&mut *tx).await?;

    // 2. Order details & Stock batches
    sqlx::query("DELETE FROM stock_batch").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM order_detail").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM \"order\"").execute(&mut *tx).await?;

    // 3. Product dependencies
    sqlx::query("DELETE FROM combo_item").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM customer_price").execute(&mut *tx).await?;

    // 4. Core Entities
    sqlx::query("DELETE FROM product").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM partner").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM bank_account").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM print_template").execute(&mut *tx).await?;
    sqlx::query("DELETE FROM event").execute(&mut *tx).await?;

    tx.commit().await?;

    Ok(Json(json!({
        "message": "Đã xóa toàn bộ dữ liệu thành công!"
    })))
}
