use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::SqlitePool;

use crate::error::AppError;
use crate::models::user::{LoginDto, RegisterDto, UpdateUserDto, User};

pub async fn get_users(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let users = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, display_name, role, created_at FROM user ORDER BY id ASC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(users))
}

fn verify_password(password: &str, stored_hash: &str) -> bool {
    if stored_hash.starts_with("$2") {
        return bcrypt::verify(password, stored_hash).unwrap_or(false);
    }
    
    // Werkzeug format: scrypt:32768:8:1$salt$hash or scrypt:n:r:p$salt$hash
    if stored_hash.starts_with("scrypt:") {
        let parts: Vec<&str> = stored_hash.split('$').collect();
        if parts.len() == 3 {
            let config_part = parts[0];
            let salt = parts[1];
            let expected_hex = parts[2];

            let subparts: Vec<&str> = config_part.split(':').collect();
            if subparts.len() == 4 {
                let n: u32 = subparts[1].parse().unwrap_or(32768);
                let r: u32 = subparts[2].parse().unwrap_or(8);
                let p: u32 = subparts[3].parse().unwrap_or(1);

                // log2(n)
                let log_n = (n as f64).log2().round() as u8;
                if let Ok(params) = scrypt::Params::new(log_n, r, p, 64) {
                    let mut output = [0u8; 64];
                    if scrypt::scrypt(password.as_bytes(), salt.as_bytes(), &params, &mut output).is_ok() {
                        let calculated_hex = hex::encode(output);
                        return calculated_hex.eq_ignore_ascii_case(expected_hex);
                    }
                }
            }
        }
    }

    // Fallback unhashed / plain match
    stored_hash == password
}

pub async fn login(
    State(pool): State<SqlitePool>,
    Json(payload): Json<LoginDto>,
) -> Result<impl IntoResponse, AppError> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, display_name, role, created_at FROM user WHERE username = ?"
    )
    .bind(&payload.username)
    .fetch_optional(&pool)
    .await?;

    let user = user.ok_or_else(|| AppError::Unauthorized("Sai tên đăng nhập hoặc mật khẩu".into()))?;

    let valid = verify_password(&payload.password, &user.password_hash);

    if !valid {
        return Err(AppError::Unauthorized("Sai tên đăng nhập hoặc mật khẩu".into()));
    }

    Ok(Json(json!({
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "role": user.role
        }
    })))
}

pub async fn register(
    State(pool): State<SqlitePool>,
    Json(payload): Json<RegisterDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.username.trim().is_empty() || payload.password.trim().is_empty() {
        return Err(AppError::BadRequest("Tên đăng nhập và mật khẩu không được để trống".into()));
    }

    let hashed = bcrypt::hash(&payload.password, 4).map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    let role = payload.role.unwrap_or_else(|| "User".to_string());
    let display_name = payload.display_name.unwrap_or_else(|| payload.username.clone());

    let result = sqlx::query(
        "INSERT INTO user (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)"
    )
    .bind(&payload.username)
    .bind(&hashed)
    .bind(&display_name)
    .bind(&role)
    .execute(&pool)
    .await;

    match result {
        Ok(res) => {
            let user_id = res.last_insert_rowid();
            Ok((
                StatusCode::CREATED,
                Json(json!({
                    "status": "success",
                    "user": {
                        "id": user_id,
                        "username": payload.username,
                        "display_name": display_name,
                        "role": role
                    }
                })),
            ))
        }
        Err(e) => {
            if e.to_string().contains("UNIQUE") {
                Err(AppError::BadRequest("Tên người dùng đã tồn tại".into()))
            } else {
                Err(AppError::Database(e))
            }
        }
    }
}

pub async fn update_user(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateUserDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, User>(
        "SELECT id, username, password_hash, display_name, role, created_at FROM user WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Người dùng không tồn tại".into()))?;

    let display_name = payload.display_name.unwrap_or(existing.display_name.unwrap_or_default());
    let role = payload.role.unwrap_or(existing.role.unwrap_or_else(|| "User".to_string()));

    if let Some(new_pass) = payload.password {
        if !new_pass.trim().is_empty() {
            let hashed = bcrypt::hash(&new_pass, 4).map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
            sqlx::query("UPDATE user SET display_name = ?, role = ?, password_hash = ? WHERE id = ?")
                .bind(&display_name)
                .bind(&role)
                .bind(&hashed)
                .bind(id)
                .execute(&pool)
                .await?;
        }
    } else {
        sqlx::query("UPDATE user SET display_name = ?, role = ? WHERE id = ?")
            .bind(&display_name)
            .bind(&role)
            .bind(id)
            .execute(&pool)
            .await?;
    }

    Ok(Json(json!({
        "status": "success",
        "message": "Cập nhật thông tin thành công"
    })))
}

pub async fn delete_user(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let result = sqlx::query("DELETE FROM user WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Người dùng không tồn tại".into()));
    }

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}
