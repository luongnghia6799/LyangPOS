use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Local;
use serde_json::json;
use sqlx::SqlitePool;

use crate::error::AppError;
use crate::models::event::{CreateEventDto, Event, EventLog, EventLogQueryDto, ToggleEventLogDto, UpdateEventDto};

pub async fn get_events(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let events = sqlx::query_as::<_, Event>(
        "SELECT id, name, date, is_active, gift_types, icon FROM event WHERE is_active = 1 ORDER BY date DESC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(events))
}

pub async fn create_event(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateEventDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên sự kiện không được để trống".into()));
    }

    let now = Local::now().naive_local();
    let result = sqlx::query(
        "INSERT INTO event (name, date, is_active, gift_types, icon) VALUES (?, ?, 1, ?, ?)"
    )
    .bind(&payload.name)
    .bind(now)
    .bind(&payload.gift_types)
    .bind(&payload.icon)
    .execute(&pool)
    .await?;

    let event_id = result.last_insert_rowid();
    let event = sqlx::query_as::<_, Event>(
        "SELECT id, name, date, is_active, gift_types, icon FROM event WHERE id = ?"
    )
    .bind(event_id)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(event)))
}

pub async fn update_event(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateEventDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, Event>(
        "SELECT id, name, date, is_active, gift_types, icon FROM event WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Không tìm thấy sự kiện".into()))?;

    let name = payload.name.unwrap_or(existing.name);
    let is_active = payload.is_active.unwrap_or(existing.is_active.unwrap_or(true));
    let gift_types = payload.gift_types.or(existing.gift_types);
    let icon = payload.icon.or(existing.icon);

    sqlx::query(
        "UPDATE event SET name = ?, is_active = ?, gift_types = ?, icon = ? WHERE id = ?"
    )
    .bind(&name)
    .bind(is_active)
    .bind(&gift_types)
    .bind(&icon)
    .bind(id)
    .execute(&pool)
    .await?;

    let updated = sqlx::query_as::<_, Event>(
        "SELECT id, name, date, is_active, gift_types, icon FROM event WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(updated))
}

pub async fn delete_event(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query("DELETE FROM event_log WHERE event_id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    let result = sqlx::query("DELETE FROM event WHERE id = ?")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy sự kiện để xóa".into()));
    }

    Ok(Json(json!({ "message": "Deleted successfully" })))
}

pub async fn get_event_logs(
    State(pool): State<SqlitePool>,
    Query(query): Query<EventLogQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = "SELECT id, event_id, partner_id, completed_at, note, gift_type FROM event_log WHERE 1=1".to_string();
    if query.event_id.is_some() {
        sql.push_str(" AND event_id = ?");
    }
    if query.partner_id.is_some() {
        sql.push_str(" AND partner_id = ?");
    }
    sql.push_str(" ORDER BY completed_at DESC");

    let mut q = sqlx::query_as::<_, EventLog>(&sql);
    if let Some(eid) = query.event_id {
        q = q.bind(eid);
    }
    if let Some(pid) = query.partner_id {
        q = q.bind(pid);
    }

    let logs = q.fetch_all(&pool).await?;
    Ok(Json(logs))
}

pub async fn toggle_event_log(
    State(pool): State<SqlitePool>,
    Json(payload): Json<ToggleEventLogDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, EventLog>(
        "SELECT id, event_id, partner_id, completed_at, note, gift_type FROM event_log WHERE event_id = ? AND partner_id = ?"
    )
    .bind(payload.event_id)
    .bind(payload.partner_id)
    .fetch_optional(&pool)
    .await?;

    let status: bool;
    if let Some(log) = existing {
        if let Some(ref gift_type) = payload.gift_type {
            if log.gift_type.as_ref() != Some(gift_type) {
                sqlx::query("UPDATE event_log SET gift_type = ? WHERE id = ?")
                    .bind(gift_type)
                    .bind(log.id)
                    .execute(&pool)
                    .await?;
                status = true;
            } else {
                sqlx::query("DELETE FROM event_log WHERE id = ?")
                    .bind(log.id)
                    .execute(&pool)
                    .await?;
                status = false;
            }
        } else {
            sqlx::query("DELETE FROM event_log WHERE id = ?")
                .bind(log.id)
                .execute(&pool)
                .await?;
            status = false;
        }
    } else {
        let now = Local::now().naive_local();
        sqlx::query(
            "INSERT INTO event_log (event_id, partner_id, completed_at, note, gift_type) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(payload.event_id)
        .bind(payload.partner_id)
        .bind(now)
        .bind("")
        .bind(&payload.gift_type)
        .execute(&pool)
        .await?;
        status = true;
    }

    Ok(Json(json!({
        "status": status,
        "message": "Toggled successfully"
    })))
}
