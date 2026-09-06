use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use sqlx::SqlitePool;

use crate::error::AppError;
use crate::models::category::{Category, CreateCategoryDto, UpdateCategoryDto};

pub async fn get_categories(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let categories = sqlx::query_as::<_, Category>("SELECT id, name, icon FROM category ORDER BY id ASC")
        .fetch_all(&pool)
        .await?;

    Ok(Json(categories))
}

pub async fn create_category(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateCategoryDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên danh mục không được để trống".into()));
    }

    let result = sqlx::query("INSERT INTO category (name, icon) VALUES (?, ?)")
        .bind(payload.name.trim())
        .bind(payload.icon.as_deref())
        .execute(&pool)
        .await?;

    let new_id = result.last_insert_rowid();
    let category = sqlx::query_as::<_, Category>("SELECT id, name, icon FROM category WHERE id = ?")
        .bind(new_id)
        .fetch_one(&pool)
        .await?;

    Ok((StatusCode::CREATED, Json(category)))
}

pub async fn update_category(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateCategoryDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, Category>("SELECT id, name, icon FROM category WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Danh mục không tồn tại".into()))?;

    let name = payload.name.unwrap_or(existing.name);
    let icon = payload.icon.or(existing.icon);

    sqlx::query("UPDATE category SET name = ?, icon = ? WHERE id = ?")
        .bind(name.trim())
        .bind(icon.as_deref())
        .bind(id)
        .execute(&pool)
        .await?;

    let updated = sqlx::query_as::<_, Category>("SELECT id, name, icon FROM category WHERE id = ?")
        .bind(id)
        .fetch_one(&pool)
        .await?;

    Ok(Json(updated))
}

pub async fn delete_category(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    // Nullify category_id for associated products first (same as python backend)
    sqlx::query("UPDATE product SET category_id = NULL WHERE category_id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    let result = sqlx::query("DELETE FROM category WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Danh mục không tồn tại".into()));
    }

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}
