use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::partner::{
    CreatePartnerDto, CustomPriceDto, CustomerPrice, Partner,
    PartnerQueryDto, PartnerResponse, UpdatePartnerDto,
};
use crate::utils::remove_accents;

pub async fn get_partners(
    State(pool): State<SqlitePool>,
    Query(params): Query<PartnerQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let raw_partners: Vec<Partner> = sqlx::query_as(
        "SELECT id, name, type, \
         CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, \
         cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance \
         FROM partner"
    )
    .fetch_all(&pool)
    .await?;

    // Fetch opening balance orders (#NODAU)
    let nodau_rows = sqlx::query(
        "SELECT partner_id, type, CAST(total_amount AS REAL) as total_amount \
         FROM \"order\" WHERE display_id IN ('#NODAU', 'NODAU') AND partner_id IS NOT NULL"
    )
    .fetch_all(&pool)
    .await?;

    let mut opening_balance_map: HashMap<i64, f64> = HashMap::new();
    for row in nodau_rows {
        let p_id: i64 = row.get("partner_id");
        let o_type: String = row.get("type");
        let amount: f64 = row.get("total_amount");
        let val = if o_type == "Sale" { amount } else { -amount };
        opening_balance_map.insert(p_id, val);
    }

    // Yearly revenue map
    let current_year = Local::now().format("%Y").to_string();
    let rev_rows = sqlx::query(
        "SELECT partner_id, CAST(SUM(total_amount) AS REAL) as revenue \
         FROM \"order\" WHERE type = 'Sale' AND strftime('%Y', date) = ? AND partner_id IS NOT NULL \
         GROUP BY partner_id"
    )
    .bind(&current_year)
    .fetch_all(&pool)
    .await?;

    let mut rev_map: HashMap<i64, f64> = HashMap::new();
    for row in rev_rows {
        let p_id: i64 = row.get("partner_id");
        let rev: Option<f64> = row.get("revenue");
        rev_map.insert(p_id, rev.unwrap_or(0.0));
    }

    let search_norm = params.search.as_deref().map(remove_accents).unwrap_or_default();
    let p_type = params.r#type.as_deref().unwrap_or("All");

    let mut mapped_partners: Vec<PartnerResponse> = Vec::new();

    for p in raw_partners {
        let is_cust = p.is_customer.unwrap_or(true);
        let is_supp = p.is_supplier.unwrap_or(false);

        // Filter Type
        if p_type == "Customer" && !is_cust {
            continue;
        }
        if p_type == "Supplier" && !is_supp {
            continue;
        }
        if p_type == "Both" && (!is_cust || !is_supp) {
            continue;
        }

        // Search
        if !search_norm.is_empty() {
            let name_norm = remove_accents(&p.name);
            let phone_norm = p.phone.as_deref().map(remove_accents).unwrap_or_default();
            if !name_norm.contains(&search_norm) && !phone_norm.contains(&search_norm) {
                continue;
            }
        }

        let opening_bal = opening_balance_map.get(&p.id).copied().unwrap_or(0.0);
        let y_rev = rev_map.get(&p.id).copied();

        mapped_partners.push(PartnerResponse {
            id: p.id,
            name: p.name,
            r#type: p.r#type,
            is_customer: is_cust,
            is_supplier: is_supp,
            cccd: p.cccd,
            phone: p.phone,
            address: p.address,
            debt_balance: p.debt_balance.unwrap_or(0.0),
            opening_balance: opening_bal,
            yearly_revenue: y_rev,
        });
    }

    // Sort
    let sort_by = params.sort_by.as_deref().unwrap_or("name");
    let sort_order = params.sort_order.as_deref().unwrap_or("asc");

    mapped_partners.sort_by(|a, b| {
        let ord = match sort_by {
            "id" => a.id.cmp(&b.id),
            "debt_balance" => a.debt_balance.partial_cmp(&b.debt_balance).unwrap(),
            "phone" => a.phone.cmp(&b.phone),
            _ => a.name.cmp(&b.name),
        };
        if sort_order.eq_ignore_ascii_case("desc") {
            ord.reverse()
        } else {
            ord
        }
    });

    if let (Some(page), Some(limit)) = (params.page, params.limit) {
        let total = mapped_partners.len();
        let pages = ((total as f64) / (limit as f64)).ceil() as u32;
        let start = ((page.saturating_sub(1)) * limit) as usize;
        let end = (start + limit as usize).min(total);

        let items = if start < total {
            mapped_partners[start..end].to_vec()
        } else {
            Vec::new()
        };

        Ok(Json(json!({
            "items": items,
            "total": total,
            "pages": pages,
            "current_page": page
        })))
    } else {
        Ok(Json(json!(mapped_partners)))
    }
}

pub async fn create_partner(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreatePartnerDto>,
) -> Result<impl IntoResponse, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Tên đối tác không được để trống".into()));
    }

    let is_customer = payload.is_customer.unwrap_or(true);
    let is_supplier = payload.is_supplier.unwrap_or(false);
    let p_type = if is_customer && is_supplier {
        "Both"
    } else if is_supplier {
        "Supplier"
    } else {
        "Customer"
    };

    let op_bal = payload.opening_balance.or(payload.debt_balance).unwrap_or(0.0);

    let mut tx = pool.begin().await?;

    let res = sqlx::query(
        "INSERT INTO partner (name, type, is_customer, is_supplier, cccd, phone, address, debt_balance) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(payload.name.trim())
    .bind(p_type)
    .bind(is_customer)
    .bind(is_supplier)
    .bind(payload.cccd.as_deref())
    .bind(payload.phone.as_deref())
    .bind(payload.address.as_deref())
    .bind(op_bal)
    .execute(&mut *tx)
    .await?;

    let new_id = res.last_insert_rowid();

    if op_bal != 0.0 {
        let is_positive = op_bal > 0.0;
        let o_type = if is_positive { "Sale" } else { "Purchase" };
        let abs_amount = op_bal.abs();

        sqlx::query(
            "INSERT INTO \"order\" (partner_id, type, payment_method, display_id, total_amount, note, amount_paid, date) \
             VALUES (?, ?, 'Debt', '#NODAU', ?, 'Nợ đầu kỳ', 0, datetime('now', '+7 hours'))"
        )
        .bind(new_id)
        .bind(o_type)
        .bind(abs_amount)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    let created = sqlx::query_as::<_, Partner>(
        "SELECT id, name, type, \
         CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, \
         cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance \
         FROM partner WHERE id = ?"
    )
    .bind(new_id)
    .fetch_one(&pool)
    .await?;

    Ok((StatusCode::CREATED, Json(created)))
}

pub async fn update_partner(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdatePartnerDto>,
) -> Result<impl IntoResponse, AppError> {
    let existing = sqlx::query_as::<_, Partner>(
        "SELECT id, name, type, \
         CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, \
         cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance \
         FROM partner WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    let existing = existing.ok_or_else(|| AppError::NotFound("Đối tác không tồn tại".into()))?;

    let name = payload.name.unwrap_or(existing.name);
    let is_customer = payload.is_customer.or(existing.is_customer).unwrap_or(true);
    let is_supplier = payload.is_supplier.or(existing.is_supplier).unwrap_or(false);
    let cccd = payload.cccd.or(existing.cccd);
    let phone = payload.phone.or(existing.phone);
    let address = payload.address.or(existing.address);
    let p_type = if is_customer && is_supplier {
        "Both"
    } else if is_supplier {
        "Supplier"
    } else {
        "Customer"
    };

    let mut tx = pool.begin().await?;

    sqlx::query(
        "UPDATE partner SET name = ?, type = ?, is_customer = ?, is_supplier = ?, \
         cccd = ?, phone = ?, address = ? WHERE id = ?"
    )
    .bind(name.trim())
    .bind(p_type)
    .bind(is_customer)
    .bind(is_supplier)
    .bind(cccd.as_deref())
    .bind(phone.as_deref())
    .bind(address.as_deref())
    .bind(id)
    .execute(&mut *tx)
    .await?;

    if let Some(new_opening) = payload.opening_balance.or(payload.debt_balance) {
        let existing_nodau = sqlx::query(
            "SELECT id FROM \"order\" WHERE partner_id = ? AND display_id IN ('#NODAU', 'NODAU')"
        )
        .bind(id)
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(nodau) = existing_nodau {
            let nodau_id: i64 = nodau.get("id");
            if new_opening == 0.0 {
                sqlx::query("DELETE FROM \"order\" WHERE id = ?")
                    .bind(nodau_id)
                    .execute(&mut *tx)
                    .await?;
            } else {
                let o_type = if new_opening >= 0.0 { "Sale" } else { "Purchase" };
                sqlx::query(
                    "UPDATE \"order\" SET type = ?, total_amount = ?, display_id = '#NODAU' WHERE id = ?"
                )
                .bind(o_type)
                .bind(new_opening.abs())
                .bind(nodau_id)
                .execute(&mut *tx)
                .await?;
            }
        } else if new_opening != 0.0 {
            let o_type = if new_opening >= 0.0 { "Sale" } else { "Purchase" };
            sqlx::query(
                "INSERT INTO \"order\" (partner_id, type, payment_method, display_id, total_amount, note, amount_paid, date) \
                 VALUES (?, ?, 'Debt', '#NODAU', ?, 'Nợ đầu kỳ', 0, datetime('now', '+7 hours'))"
            )
            .bind(id)
            .bind(o_type)
            .bind(new_opening.abs())
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;

    // Recalculate debt balance
    recalculate_partner_debt_internal(&pool, id).await?;

    let updated = sqlx::query_as::<_, Partner>(
        "SELECT id, name, type, \
         CAST(is_customer AS BOOLEAN) as is_customer, \
         CAST(is_supplier AS BOOLEAN) as is_supplier, \
         cccd, phone, address, \
         CAST(debt_balance AS REAL) as debt_balance \
         FROM partner WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(updated))
}

pub async fn delete_partner(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let order_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM \"order\" WHERE partner_id = ? AND display_id NOT IN ('#NODAU', 'NODAU')"
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    if order_count > 0 {
        return Err(AppError::BadRequest(format!(
            "Không thể xóa đối tác vì đã có {} hóa đơn giao dịch",
            order_count
        )));
    }

    let mut tx = pool.begin().await?;

    sqlx::query("DELETE FROM \"order\" WHERE partner_id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("DELETE FROM customer_price WHERE partner_id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    let res = sqlx::query("DELETE FROM partner WHERE id = ?")
        .bind(id)
        .execute(&mut *tx)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Đối tác không tồn tại".into()));
    }

    tx.commit().await?;

    Ok(Json(json!({
        "message": "Deleted successfully"
    })))
}

pub async fn get_custom_prices(
    State(pool): State<SqlitePool>,
    Path(partner_id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let prices = sqlx::query_as::<_, CustomerPrice>(
        "SELECT id, partner_id, product_id, CAST(price AS REAL) as price FROM customer_price WHERE partner_id = ?"
    )
    .bind(partner_id)
    .fetch_all(&pool)
    .await?;

    let mut price_map = HashMap::new();
    for cp in prices {
        price_map.insert(cp.product_id, cp.price);
    }

    Ok(Json(price_map))
}

pub async fn save_custom_price(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CustomPriceDto>,
) -> Result<impl IntoResponse, AppError> {
    sqlx::query(
        "INSERT INTO customer_price (partner_id, product_id, price) VALUES (?, ?, ?) \
         ON CONFLICT(partner_id, product_id) DO UPDATE SET price = excluded.price"
    )
    .bind(payload.partner_id)
    .bind(payload.product_id)
    .bind(payload.price)
    .execute(&pool)
    .await?;

    Ok(Json(json!({
        "status": "success",
        "message": "Đã lưu giá riêng thành công"
    })))
}

pub async fn recalculate_partner_debt_internal(pool: &SqlitePool, partner_id: i64) -> anyhow::Result<()> {
    // 1. Debt from Orders
    let sale_debt: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(total_amount) AS REAL) FROM \"order\" WHERE partner_id = ? AND payment_method = 'Debt' AND type = 'Sale'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    let purchase_debt: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(total_amount) AS REAL) FROM \"order\" WHERE partner_id = ? AND payment_method = 'Debt' AND type = 'Purchase'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    // 2. Debt from Cash Vouchers (non-auto)
    let receipts: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount) AS REAL) FROM cash_voucher WHERE partner_id = ? AND type = 'Receipt' AND source != 'auto'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    let payments: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount) AS REAL) FROM cash_voucher WHERE partner_id = ? AND type = 'Payment' AND source != 'auto'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    let debt_increases: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount) AS REAL) FROM cash_voucher WHERE partner_id = ? AND type = 'DebtIncrease'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    // 3. Bank Transactions
    let bank_deposits: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount) AS REAL) FROM bank_transaction WHERE partner_id = ? AND type = 'Deposit'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    let bank_withdrawals: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount) AS REAL) FROM bank_transaction WHERE partner_id = ? AND type = 'Withdrawal'"
    )
    .bind(partner_id)
    .fetch_one(pool)
    .await?;

    let total_balance = (sale_debt.unwrap_or(0.0) - purchase_debt.unwrap_or(0.0))
        - (receipts.unwrap_or(0.0) - payments.unwrap_or(0.0))
        + debt_increases.unwrap_or(0.0)
        - (bank_deposits.unwrap_or(0.0) - bank_withdrawals.unwrap_or(0.0));

    sqlx::query("UPDATE partner SET debt_balance = ? WHERE id = ?")
        .bind(total_balance)
        .bind(partner_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn quick_debt(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    let amount = payload.get("amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
    let note = payload.get("note").and_then(|v| v.as_str()).unwrap_or("Ghi nợ nhanh (Sổ tay)");
    let date_str = payload.get("date").and_then(|v| v.as_str());

    let now = if let Some(ds) = date_str {
        NaiveDate::parse_from_str(ds, "%Y-%m-%d")
            .map(|d| NaiveDateTime::new(d, NaiveTime::from_hms_opt(12, 0, 0).unwrap()))
            .unwrap_or_else(|_| Local::now().naive_local())
    } else {
        Local::now().naive_local()
    };

    let mut tx = pool.begin().await?;

    sqlx::query(
        "INSERT INTO cash_voucher (partner_id, amount, note, type, source, date) \
         VALUES (?, ?, ?, 'DebtIncrease', 'quick_debt', ?)"
    )
    .bind(id)
    .bind(amount)
    .bind(note)
    .bind(now)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    recalculate_partner_debt_internal(&pool, id).await?;

    let partner = sqlx::query_as::<_, Partner>("SELECT * FROM partner WHERE id = ?")
        .bind(id)
        .fetch_one(&pool)
        .await?;

    Ok(Json(partner))
}

pub async fn recalculate_partner_debt(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    recalculate_partner_debt_internal(&pool, id).await?;

    let balance: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(debt_balance AS REAL) FROM partner WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    Ok(Json(json!({
        "message": "Recalculated successfully",
        "new_balance": balance.unwrap_or(0.0)
    })))
}

pub async fn get_partner_debt_cycles(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let mut timeline = Vec::new();

    // Orders
    let orders = sqlx::query(
        "SELECT date, type, payment_method, CAST(total_amount AS REAL) as total_amount \
         FROM \"order\" WHERE partner_id = ?"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    for o in orders {
        let date: Option<NaiveDateTime> = o.get("date");
        let o_type: String = o.get("type");
        let pm: Option<String> = o.get("payment_method");
        let total: f64 = o.get("total_amount");

        if pm.as_deref() == Some("Debt") {
            if let Some(d) = date {
                timeline.push((d, "order", o_type, total));
            }
        }
    }

    // Cash vouchers
    let vouchers = sqlx::query(
        "SELECT date, type, CAST(amount AS REAL) as amount \
         FROM cash_voucher WHERE partner_id = ? AND source != 'auto'"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    for v in vouchers {
        let date: Option<NaiveDateTime> = v.get("date");
        let v_type: String = v.get("type");
        let amount: f64 = v.get("amount");

        if let Some(d) = date {
            timeline.push((d, "voucher", v_type, amount));
        }
    }

    timeline.sort_by_key(|t| t.0);

    let mut cycles = Vec::new();
    let mut current_cycle: Option<serde_json::Value> = None;
    let mut balance = 0.0;
    let mut cycle_count = 0;

    for (date, kind, sub_type, amount) in timeline {
        let prev_balance = balance;

        if kind == "order" {
            if sub_type == "Sale" {
                balance += amount;
            } else {
                balance -= amount;
            }
        } else if kind == "voucher" {
            if sub_type == "Receipt" {
                balance -= amount;
            } else {
                balance += amount;
            }
        }

        if prev_balance.abs() < 1.0 && balance.abs() >= 1.0 && current_cycle.is_none() {
            cycle_count += 1;
            current_cycle = Some(json!({
                "id": cycle_count,
                "label": format!("Chu kỳ {} (Từ {})", cycle_count, date.format("%d/%m/%y")),
                "start_date": date.to_string(),
                "end_date": serde_json::Value::Null,
                "status": "Đang nợ"
            }));
        }

        if let Some(mut c) = current_cycle.take() {
            if balance.abs() < 1.0 {
                c["end_date"] = json!(date.to_string());
                c["status"] = json!("Đã tất toán");
                cycles.push(c);
            } else {
                current_cycle = Some(c);
            }
        }
    }

    if let Some(c) = current_cycle {
        cycles.push(c);
    }

    cycles.reverse();
    Ok(Json(cycles))
}

pub async fn get_partner_ledger(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<impl IntoResponse, AppError> {
    let partner = sqlx::query_as::<_, Partner>("SELECT * FROM partner WHERE id = ?")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| AppError::NotFound("Đối tác không tồn tại".into()))?;

    // Fetch timeline
    let orders = sqlx::query(
        "SELECT id, display_id, date, type, payment_method, CAST(total_amount AS REAL) as total_amount \
         FROM \"order\" WHERE partner_id = ? ORDER BY date ASC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let vouchers = sqlx::query(
        "SELECT id, date, type, note, CAST(amount AS REAL) as amount \
         FROM cash_voucher WHERE partner_id = ? AND source != 'auto' ORDER BY date ASC"
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let mut ledger = Vec::new();
    let mut balance = 0.0;

    for o in orders {
        let o_id: i64 = o.get("id");
        let display_id: Option<String> = o.get("display_id");
        let date: Option<NaiveDateTime> = o.get("date");
        let o_type: String = o.get("type");
        let pm: Option<String> = o.get("payment_method");
        let total: f64 = o.get("total_amount");

        let is_debt = pm.as_deref() == Some("Debt");
        let inc = if is_debt && o_type == "Sale" { total } else { 0.0 };
        let dec = if is_debt && o_type == "Purchase" { total } else { 0.0 };

        if is_debt {
            balance += inc - dec;
        }

        let ref_id = display_id.unwrap_or_else(|| format!("ORD-{}", o_id));
        let desc = if o_type == "Sale" {
            format!("Bán hàng - #{}", ref_id)
        } else {
            format!("Nhập hàng - #{}", ref_id)
        };

        ledger.push(json!({
            "id": o_id,
            "date": date.map(|d| d.to_string()).unwrap_or_default(),
            "ref_id": ref_id,
            "desc": desc,
            "type": "Order",
            "payment_method": pm.unwrap_or_else(|| "Cash".into()),
            "increase": inc,
            "decrease": dec,
            "running_balance": balance,
            "details": [],
            "user_name": "Hệ thống"
        }));
    }

    for v in vouchers {
        let v_id: i64 = v.get("id");
        let date: Option<NaiveDateTime> = v.get("date");
        let v_type: String = v.get("type");
        let note: Option<String> = v.get("note");
        let amount: f64 = v.get("amount");

        let inc = if v_type == "Payment" || v_type == "DebtIncrease" { amount } else { 0.0 };
        let dec = if v_type == "Receipt" { amount } else { 0.0 };

        balance += inc - dec;

        let desc = note.unwrap_or_else(|| if v_type == "Receipt" { "Phiếu thu".into() } else { "Phiếu chi".into() });

        ledger.push(json!({
            "id": v_id,
            "date": date.map(|d| d.to_string()).unwrap_or_default(),
            "ref_id": format!("VOU-{}", v_id),
            "desc": desc,
            "type": "Voucher",
            "payment_method": "Cash",
            "increase": inc,
            "decrease": dec,
            "running_balance": balance,
            "details": [],
            "user_name": "Hệ thống"
        }));
    }

    ledger.reverse();

    Ok(Json(json!({
        "partner": partner,
        "ledger": ledger,
        "current_balance": balance
    })))
}

pub async fn save_custom_prices_bulk(
    State(pool): State<SqlitePool>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    if let Some(arr) = payload.as_array() {
        for item in arr {
            let pid = item.get("partner_id").and_then(|v| v.as_i64());
            let prid = item.get("product_id").and_then(|v| v.as_i64());
            let price = item.get("price").and_then(|v| v.as_f64()).unwrap_or(0.0);
            if let (Some(p), Some(pr)) = (pid, prid) {
                let _ = sqlx::query(
                    "INSERT INTO customer_price (partner_id, product_id, price) VALUES (?, ?, ?) \
                     ON CONFLICT(partner_id, product_id) DO UPDATE SET price = excluded.price"
                )
                .bind(p)
                .bind(pr)
                .bind(price)
                .execute(&pool)
                .await;
            }
        }
    }
    Ok(Json(json!({"message": "Đã lưu bảng giá riêng thành công!"})))
}

pub async fn cleanup_custom_prices(
    State(pool): State<SqlitePool>,
) -> Result<impl IntoResponse, AppError> {
    let _ = sqlx::query("DELETE FROM customer_price WHERE price <= 0").execute(&pool).await;
    Ok(Json(json!({"message": "Đã dọn dẹp giá riêng!"})))
}

pub async fn fix_opening_balance(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<serde_json::Value>,
) -> Result<impl IntoResponse, AppError> {
    let amount = payload.get("amount").and_then(|v| v.as_f64()).unwrap_or(0.0);
    if amount == 0.0 {
        return Err(AppError::BadRequest("Amount is required".into()));
    }

    let is_pos = amount > 0.0;
    let o_type = if is_pos { "Sale" } else { "Purchase" };
    let abs_amount = amount.abs();

    let existing: Option<i64> = sqlx::query_scalar(
        "SELECT id FROM \"order\" WHERE partner_id = ? AND display_id IN ('#NODAU', 'NODAU') LIMIT 1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?;

    if let Some(oid) = existing {
        sqlx::query("UPDATE \"order\" SET type = ?, total_amount = ?, display_id = '#NODAU' WHERE id = ?")
            .bind(o_type)
            .bind(abs_amount)
            .bind(oid)
            .execute(&pool)
            .await?;
    } else {
        sqlx::query(
            "INSERT INTO \"order\" (partner_id, type, payment_method, display_id, total_amount, note, amount_paid, date) \
             VALUES (?, ?, 'Debt', '#NODAU', ?, 'Nợ đầu kỳ', 0, datetime('now', '+7 hours'))"
        )
        .bind(id)
        .bind(o_type)
        .bind(abs_amount)
        .execute(&pool)
        .await?;
    }

    Ok(Json(json!({"message": "Đã ghi nhận nợ đầu kỳ thành công!"})))
}


