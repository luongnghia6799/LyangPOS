use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use serde_json::{json, Value};
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::setting::PrintTemplate;

pub async fn get_settings(State(pool): State<SqlitePool>) -> Result<impl IntoResponse, AppError> {
    let rows = sqlx::query("SELECT setting_key, setting_value FROM app_setting")
        .fetch_all(&pool)
        .await?;

    let mut settings_map = HashMap::new();
    for row in rows {
        let key: String = row.get("setting_key");
        let val_opt: Option<String> = row.get("setting_value");

        if let Some(val) = val_opt {
            // Try parsing as JSON value, otherwise string
            if let Ok(parsed) = serde_json::from_str::<Value>(&val) {
                settings_map.insert(key, parsed);
            } else {
                settings_map.insert(key, Value::String(val));
            }
        }
    }

    Ok(Json(settings_map))
}

pub async fn save_settings(
    State(pool): State<SqlitePool>,
    Json(payload): Json<HashMap<String, Value>>,
) -> Result<impl IntoResponse, AppError> {
    for (key, val) in payload {
        let val_str = match val {
            Value::String(s) => s,
            _ => val.to_string(),
        };

        sqlx::query(
            "INSERT INTO app_setting (setting_key, setting_value) VALUES (?, ?) \
             ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value"
        )
        .bind(&key)
        .bind(&val_str)
        .execute(&pool)
        .await?;
    }

    Ok(Json(json!({
        "status": "success",
        "message": "Settings saved successfully"
    })))
}

#[derive(serde::Deserialize)]
pub struct PrintTemplateQuery {
    pub module: Option<String>,
}

pub async fn get_print_templates(
    State(pool): State<SqlitePool>,
    axum::extract::Query(query): axum::extract::Query<PrintTemplateQuery>,
) -> Result<impl IntoResponse, AppError> {
    let templates = if let Some(ref m) = query.module {
        sqlx::query_as::<_, PrintTemplate>(
            "SELECT id, name, module, is_default, config, content_config FROM print_template WHERE module = ? ORDER BY id ASC"
        )
        .bind(m)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, PrintTemplate>(
            "SELECT id, name, module, is_default, config, content_config FROM print_template ORDER BY id ASC"
        )
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(templates))
}

pub async fn create_print_template(
    State(pool): State<SqlitePool>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    let name = payload.get("name").and_then(|v| v.as_str()).unwrap_or("Mẫu in mới");
    let module = payload.get("module").and_then(|v| v.as_str()).unwrap_or("Sale");
    let is_default = payload.get("is_default").and_then(|v| v.as_bool()).unwrap_or(false);
    let config = payload.get("config").map(|v| match v {
        Value::String(s) => s.clone(),
        _ => v.to_string(),
    }).unwrap_or_else(|| "{}".to_string());
    let content_config = payload.get("content_config").map(|v| match v {
        Value::String(s) => s.clone(),
        _ => v.to_string(),
    }).unwrap_or_else(|| "{}".to_string());

    if is_default {
        sqlx::query("UPDATE print_template SET is_default = 0 WHERE module = ?")
            .bind(module)
            .execute(&pool)
            .await?;
    }

    let res = sqlx::query(
        "INSERT INTO print_template (name, module, is_default, config, content_config) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(name)
    .bind(module)
    .bind(is_default)
    .bind(&config)
    .bind(&content_config)
    .execute(&pool)
    .await?;

    let new_id = res.last_insert_rowid();

    let template = sqlx::query_as::<_, PrintTemplate>(
        "SELECT id, name, module, is_default, config, content_config FROM print_template WHERE id = ?"
    )
    .bind(new_id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(template))
}

pub async fn update_print_template(
    State(pool): State<SqlitePool>,
    axum::extract::Path(id): axum::extract::Path<i64>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    let current = sqlx::query_as::<_, PrintTemplate>(
        "SELECT id, name, module, is_default, config, content_config FROM print_template WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Print template with ID {} not found", id)))?;

    let name = payload.get("name").and_then(|v| v.as_str()).unwrap_or(&current.name);
    let module = payload.get("module").and_then(|v| v.as_str()).unwrap_or(&current.module);
    let is_default = payload.get("is_default").and_then(|v| v.as_bool()).unwrap_or(current.is_default.unwrap_or(false));
    
    let config = if let Some(v) = payload.get("config") {
        match v {
            Value::String(s) => s.clone(),
            _ => v.to_string(),
        }
    } else {
        current.config.unwrap_or_else(|| "{}".to_string())
    };

    let content_config = if let Some(v) = payload.get("content_config") {
        match v {
            Value::String(s) => s.clone(),
            _ => v.to_string(),
        }
    } else {
        current.content_config.unwrap_or_else(|| "{}".to_string())
    };

    if is_default {
        sqlx::query("UPDATE print_template SET is_default = 0 WHERE module = ?")
            .bind(module)
            .execute(&pool)
            .await?;
    }

    sqlx::query(
        "UPDATE print_template SET name = ?, module = ?, is_default = ?, config = ?, content_config = ? WHERE id = ?"
    )
    .bind(name)
    .bind(module)
    .bind(is_default)
    .bind(&config)
    .bind(&content_config)
    .bind(id)
    .execute(&pool)
    .await?;

    let template = sqlx::query_as::<_, PrintTemplate>(
        "SELECT id, name, module, is_default, config, content_config FROM print_template WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(template))
}


pub async fn delete_print_template(
    State(pool): State<SqlitePool>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let current = sqlx::query_as::<_, PrintTemplate>(
        "SELECT id, name, module, is_default, config, content_config FROM print_template WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    if let Some(tpl) = current {
        sqlx::query("DELETE FROM print_template WHERE id = ?")
            .bind(id)
            .execute(&pool)
            .await?;

        if tpl.is_default.unwrap_or(false) {
            let first_rem = sqlx::query_scalar::<_, i64>(
                "SELECT id FROM print_template WHERE module = ? LIMIT 1"
            )
            .bind(&tpl.module)
            .fetch_optional(&pool)
            .await?;

            if let Some(rem_id) = first_rem {
                sqlx::query("UPDATE print_template SET is_default = 1 WHERE id = ?")
                    .bind(rem_id)
                    .execute(&pool)
                    .await?;
            }
        }
    }

    Ok(Json(json!({ "message": "Template deleted successfully" })))
}
