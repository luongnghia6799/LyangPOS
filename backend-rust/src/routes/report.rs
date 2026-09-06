use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{Datelike, Local, NaiveDate, NaiveDateTime, NaiveTime};
use serde_json::json;
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

use crate::error::AppError;
use crate::models::report::*;
use crate::utils::remove_accents;

async fn fetch_range_stats(pool: &SqlitePool, s: NaiveDateTime, e: NaiveDateTime) -> (f64, f64, f64) {
    let rev: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(total_amount) AS REAL) FROM \"order\" \
         WHERE type = 'Sale' AND date >= ? AND date < ? AND display_id NOT IN ('NODAU', '#NODAU')"
    )
    .bind(s)
    .bind(e)
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0.0));

    let cash_rev: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(amount_paid) AS REAL) FROM \"order\" \
         WHERE type = 'Sale' AND date >= ? AND date < ? AND display_id NOT IN ('NODAU', '#NODAU')"
    )
    .bind(s)
    .bind(e)
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0.0));

    let cost: Option<f64> = sqlx::query_scalar(
        "SELECT CAST(SUM(od.quantity * COALESCE(od.cost_price, p.cost_price, od.price)) AS REAL) \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         WHERE o.type = 'Sale' AND o.date >= ? AND o.date < ? AND o.display_id NOT IN ('NODAU', '#NODAU')"
    )
    .bind(s)
    .bind(e)
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0.0));

    let r = rev.unwrap_or(0.0);
    let cr = cash_rev.unwrap_or(0.0);
    let c = cost.unwrap_or(0.0);
    (r, cr, r - c)
}

// --- 1. Dashboard Stats (/api/dashboard-stats) ---
pub async fn get_dashboard_stats(
    State(pool): State<SqlitePool>,
    Query(params): Query<DashboardFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let now = Local::now();
    let today = now.date_naive();

    let (filter_year, filter_month, filter_day) = match (&params.year, &params.month, &params.day) {
        (None, None, None) => (
            Some(today.year().to_string()),
            Some(format!("{:02}", today.month())),
            Some(format!("{:02}", today.day())),
        ),
        (y, m, d) => (y.clone(), m.clone(), d.clone()),
    };

    // Calculate start/end date for current and previous period
    let (current_start, current_end, prev_start, prev_end) = if let (Some(y), Some(m), Some(d)) =
        (&filter_year, &filter_month, &filter_day)
    {
        let yr: i32 = y.parse().unwrap_or(today.year());
        let mo: u32 = m.parse().unwrap_or(today.month());
        let dy: u32 = d.parse().unwrap_or(today.day());
        let start_date = NaiveDate::from_ymd_opt(yr, mo, dy).unwrap_or(today);
        let start = NaiveDateTime::new(start_date, NaiveTime::from_hms_opt(0, 0, 0).unwrap());
        let end = start + chrono::Duration::days(1);
        let p_start = start - chrono::Duration::days(1);
        let p_end = start;
        (start, end, p_start, p_end)
    } else if let (Some(y), Some(m)) = (&filter_year, &filter_month) {
        let yr: i32 = y.parse().unwrap_or(today.year());
        let mo: u32 = m.parse().unwrap_or(today.month());
        let start_date = NaiveDate::from_ymd_opt(yr, mo, 1).unwrap_or(today);
        let start = NaiveDateTime::new(start_date, NaiveTime::from_hms_opt(0, 0, 0).unwrap());
        let next_month_date = if mo == 12 {
            NaiveDate::from_ymd_opt(yr + 1, 1, 1).unwrap()
        } else {
            NaiveDate::from_ymd_opt(yr, mo + 1, 1).unwrap()
        };
        let end = NaiveDateTime::new(next_month_date, NaiveTime::from_hms_opt(0, 0, 0).unwrap());

        let prev_month_date = if mo == 1 {
            NaiveDate::from_ymd_opt(yr - 1, 12, 1).unwrap()
        } else {
            NaiveDate::from_ymd_opt(yr, mo - 1, 1).unwrap()
        };
        let p_start = NaiveDateTime::new(prev_month_date, NaiveTime::from_hms_opt(0, 0, 0).unwrap());
        let p_end = start;
        (start, end, p_start, p_end)
    } else if let Some(y) = &filter_year {
        let yr: i32 = y.parse().unwrap_or(today.year());
        let start = NaiveDateTime::new(
            NaiveDate::from_ymd_opt(yr, 1, 1).unwrap(),
            NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
        );
        let end = NaiveDateTime::new(
            NaiveDate::from_ymd_opt(yr + 1, 1, 1).unwrap(),
            NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
        );
        let p_start = NaiveDateTime::new(
            NaiveDate::from_ymd_opt(yr - 1, 1, 1).unwrap(),
            NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
        );
        let p_end = start;
        (start, end, p_start, p_end)
    } else {
        let start = NaiveDateTime::new(today, NaiveTime::from_hms_opt(0, 0, 0).unwrap());
        let end = start + chrono::Duration::days(1);
        let p_start = start - chrono::Duration::days(1);
        let p_end = start;
        (start, end, p_start, p_end)
    };

    let (revenue, cash_revenue, profit) = fetch_range_stats(&pool, current_start, current_end).await;
    let debt_revenue = revenue - cash_revenue;
    let (prev_rev, _, prev_profit) = fetch_range_stats(&pool, prev_start, prev_end).await;

    let revenue_trend = if prev_rev > 0.0 {
        (((revenue - prev_rev) / prev_rev) * 100.0).round() as i64
    } else if revenue > 0.0 {
        100
    } else {
        0
    };

    let profit_trend = if prev_profit > 0.0 {
        (((profit - prev_profit) / prev_profit) * 100.0).round() as i64
    } else if profit > 0.0 {
        100
    } else {
        0
    };

    // 2. Debt Balances (All Time)
    let partner_rows = sqlx::query(
        "SELECT id, name, is_customer, is_supplier, CAST(debt_balance AS REAL) as debt_balance \
         FROM partner WHERE debt_balance != 0"
    )
    .fetch_all(&pool)
    .await?;

    let mut total_customer_debt = 0.0;
    let mut total_supplier_debt = 0.0;
    let mut customers_with_debt: Vec<PartnerDebtItemDto> = Vec::new();
    let mut suppliers_with_debt: Vec<PartnerDebtItemDto> = Vec::new();

    for r in partner_rows {
        let id: i64 = r.get("id");
        let name: String = r.get("name");
        let is_customer: bool = r.get("is_customer");
        let is_supplier: bool = r.get("is_supplier");
        let balance: f64 = r.get("debt_balance");

        if is_customer && balance > 0.0 {
            total_customer_debt += balance;
            customers_with_debt.push(PartnerDebtItemDto {
                id,
                name: name.clone(),
                balance,
            });
        }
        if is_supplier && balance < 0.0 {
            total_supplier_debt += balance.abs();
            suppliers_with_debt.push(PartnerDebtItemDto {
                id,
                name,
                balance,
            });
        }
    }

    customers_with_debt.sort_by(|a, b| b.balance.partial_cmp(&a.balance).unwrap());
    customers_with_debt.truncate(10);

    suppliers_with_debt.sort_by(|a, b| a.balance.abs().partial_cmp(&b.balance.abs()).unwrap().reverse());
    suppliers_with_debt.truncate(10);

    // 3. 7-Day Revenue & Profit Chart
    let seven_days_ago = NaiveDateTime::new(
        today - chrono::Duration::days(7),
        NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
    );

    let rev_chart_rows = sqlx::query(
        "SELECT strftime('%Y-%m-%d', date) as day, CAST(SUM(total_amount) AS REAL) as rev \
         FROM \"order\" \
         WHERE type = 'Sale' AND date >= ? AND display_id NOT IN ('NODAU', '#NODAU') \
         GROUP BY strftime('%Y-%m-%d', date)"
    )
    .bind(seven_days_ago)
    .fetch_all(&pool)
    .await?;

    let mut rev_map: HashMap<String, f64> = HashMap::new();
    for r in rev_chart_rows {
        let day: String = r.get("day");
        let rev: f64 = r.get("rev");
        rev_map.insert(day, rev);
    }

    let cost_chart_rows = sqlx::query(
        "SELECT strftime('%Y-%m-%d', o.date) as day, \
         CAST(SUM(od.quantity * COALESCE(od.cost_price, p.cost_price, od.price)) AS REAL) as cost \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         WHERE o.type = 'Sale' AND o.date >= ? AND o.display_id NOT IN ('NODAU', '#NODAU') \
         GROUP BY strftime('%Y-%m-%d', o.date)"
    )
    .bind(seven_days_ago)
    .fetch_all(&pool)
    .await?;

    let mut cost_map: HashMap<String, f64> = HashMap::new();
    for r in cost_chart_rows {
        let day: String = r.get("day");
        let cost: f64 = r.get("cost");
        cost_map.insert(day, cost);
    }

    let mut chart_labels = Vec::new();
    let mut chart_data = Vec::new();
    let mut chart_profit_data = Vec::new();

    for i in (0..=6).rev() {
        let d = today - chrono::Duration::days(i);
        let day_str = d.format("%Y-%m-%d").to_string();
        let label_str = d.format("%d/%m").to_string();
        let r = *rev_map.get(&day_str).unwrap_or(&0.0);
        let c = *cost_map.get(&day_str).unwrap_or(&0.0);

        chart_labels.push(label_str);
        chart_data.push(r);
        chart_profit_data.push(r - c);
    }

    // 4. Product Warnings
    let low_stock_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM product WHERE is_active = 1 AND stock > 0 AND stock <= multiplier"
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(0);

    let expiry_rows = sqlx::query(
        "SELECT expiry_date FROM product WHERE expiry_date IS NOT NULL AND expiry_date != '' AND is_active = 1"
    )
    .fetch_all(&pool)
    .await?;

    let mut near_expiry_count = 0;
    let mut expired_count = 0;

    for r in expiry_rows {
        let exp_str: Option<String> = r.get("expiry_date");
        if let Some(s) = exp_str {
            let clean = s.trim();
            let parsed_date = NaiveDate::parse_from_str(clean, "%d/%m/%Y")
                .or_else(|_| NaiveDate::parse_from_str(clean, "%Y-%m-%d"))
                .or_else(|_| NaiveDate::parse_from_str(clean, "%d-%m-%Y"));

            if let Ok(d) = parsed_date {
                let diff = (d - today).num_days();
                if diff < 0 {
                    expired_count += 1;
                } else if diff <= 60 {
                    near_expiry_count += 1;
                }
            }
        }
    }

    let res = DashboardStatsDto {
        revenue,
        cash_revenue,
        debt_revenue,
        profit,
        revenue_trend,
        profit_trend,
        customer_debt: total_customer_debt,
        supplier_debt: total_supplier_debt,
        customer_debt_list: customers_with_debt,
        supplier_debt_list: suppliers_with_debt,
        chart: DashboardChartDto {
            labels: chart_labels,
            data: chart_data,
            profit_data: chart_profit_data,
        },
        expiry: ExpiryWarningDto {
            near: near_expiry_count,
            expired: expired_count,
        },
        low_stock: low_stock_count,
    };

    Ok(Json(res))
}

// --- 2. Report Products (/api/reports/products) ---
pub async fn report_products(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportProductsQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = String::from(
        "SELECT od.id as detail_id, od.product_id, od.product_name_override, \
                CAST(od.quantity AS REAL) as quantity, CAST(od.price AS REAL) as price, \
                CAST(od.cost_price AS REAL) as cost_price, \
                p.name as product_name, p.unit as product_unit, p.brand as product_brand, \
                CAST(p.cost_price AS REAL) as default_cost_price \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         WHERE o.type = 'Sale'"
    );

    if let Some(y) = &params.year {
        sql.push_str(&format!(" AND strftime('%Y', o.date) = '{}'", y));
    }
    if let Some(m) = &params.month {
        let padded = format!("{:0>2}", m);
        sql.push_str(&format!(" AND strftime('%m', o.date) = '{}'", padded));
    }
    if let Some(d) = &params.day {
        let padded = format!("{:0>2}", d);
        sql.push_str(&format!(" AND strftime('%d', o.date) = '{}'", padded));
    }
    if let Some(q) = &params.quarter {
        let (s, e) = match q.as_str() {
            "1" => ("01", "03"),
            "2" => ("04", "06"),
            "3" => ("07", "09"),
            "4" => ("10", "12"),
            _ => ("01", "12"),
        };
        sql.push_str(&format!(" AND strftime('%m', o.date) BETWEEN '{}' AND '{}'", s, e));
    }
    if let Some(b) = &params.brand {
        if !b.is_empty() {
            sql.push_str(&format!(" AND p.brand = '{}'", b));
        }
    }

    let rows = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut map: HashMap<String, ProductReportItemDto> = HashMap::new();

    for r in rows {
        let product_id: Option<i64> = r.get("product_id");
        let product_name_override: Option<String> = r.get("product_name_override");
        let p_name: Option<String> = r.get("product_name");
        let p_unit: Option<String> = r.get("product_unit");
        let qty: f64 = r.get("quantity");
        let price: f64 = r.get("price");
        let detail_cost: Option<f64> = r.get("cost_price");
        let default_cost: Option<f64> = r.get("default_cost_price");

        let key = if let Some(pid) = product_id {
            pid.to_string()
        } else {
            format!("custom_{}", product_name_override.clone().unwrap_or_default())
        };

        let unit_cost = detail_cost.or(default_cost).unwrap_or(price);
        let name = product_name_override
            .or(p_name)
            .unwrap_or_else(|| "Sản phẩm đã xóa".into());
        let unit = p_unit.unwrap_or_else(|| "ĐV".into());

        let id_val = if let Some(pid) = product_id {
            json!(pid)
        } else {
            json!(key)
        };

        let entry = map.entry(key).or_insert_with(|| ProductReportItemDto {
            id: id_val,
            name,
            unit,
            quantity: 0.0,
            revenue: 0.0,
            cost: 0.0,
            profit: 0.0,
        });

        entry.quantity += qty;
        entry.revenue += qty * price;
        entry.cost += qty * unit_cost;
        entry.profit = entry.revenue - entry.cost;
    }

    let mut report_list: Vec<ProductReportItemDto> = map.into_values().collect();

    // Search
    if let Some(s) = &params.search {
        let s_norm = remove_accents(s);
        report_list.retain(|i| remove_accents(&i.name).contains(&s_norm));
    }

    // Sort
    let sort_by = params.sort_by.as_deref().unwrap_or("revenue");
    let is_desc = params.sort_order.as_deref().unwrap_or("desc") == "desc";

    report_list.sort_by(|a, b| {
        let cmp = match sort_by {
            "quantity" => a.quantity.partial_cmp(&b.quantity).unwrap_or(std::cmp::Ordering::Equal),
            "cost" => a.cost.partial_cmp(&b.cost).unwrap_or(std::cmp::Ordering::Equal),
            "profit" => a.profit.partial_cmp(&b.profit).unwrap_or(std::cmp::Ordering::Equal),
            "name" => a.name.cmp(&b.name),
            _ => a.revenue.partial_cmp(&b.revenue).unwrap_or(std::cmp::Ordering::Equal),
        };
        if is_desc {
            cmp.reverse()
        } else {
            cmp
        }
    });

    let total = report_list.len() as i64;
    if let (Some(page), Some(limit)) = (params.page, params.limit) {
        if limit > 0 {
            let start = ((page - 1) * limit) as usize;
            let end = (start + limit as usize).min(report_list.len());
            let items = if start < report_list.len() {
                report_list[start..end].to_vec()
            } else {
                Vec::new()
            };

            return Ok(Json(json!({
                "items": items,
                "total": total,
                "pages": (total + limit - 1) / limit,
                "current_page": page
            })));
        }
    }

    Ok(Json(json!(report_list)))
}

// --- 3. Report Partners (/api/reports/partners) ---
pub async fn report_partners(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportPartnersQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let p_type = params.r#type.as_deref().unwrap_or("Customer");
    let o_type = if p_type == "Customer" { "Sale" } else { "Purchase" };

    let mut sql = format!(
        "SELECT o.id, o.partner_id, CAST(o.total_amount AS REAL) as total_amount, \
                p.name as partner_name \
         FROM \"order\" o \
         LEFT JOIN partner p ON p.id = o.partner_id \
         WHERE o.type = '{}' AND o.display_id NOT IN ('NODAU', '#NODAU')",
        o_type
    );

    if let Some(y) = &params.year {
        sql.push_str(&format!(" AND strftime('%Y', o.date) = '{}'", y));
    }
    if let Some(m) = &params.month {
        let padded = format!("{:0>2}", m);
        sql.push_str(&format!(" AND strftime('%m', o.date) = '{}'", padded));
    }
    if let Some(d) = &params.day {
        let padded = format!("{:0>2}", d);
        sql.push_str(&format!(" AND strftime('%d', o.date) = '{}'", padded));
    }
    if let Some(q) = &params.quarter {
        let (s, e) = match q.as_str() {
            "1" => ("01", "03"),
            "2" => ("04", "06"),
            "3" => ("07", "09"),
            "4" => ("10", "12"),
            _ => ("01", "12"),
        };
        sql.push_str(&format!(" AND strftime('%m', o.date) BETWEEN '{}' AND '{}'", s, e));
    }

    let orders = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut map: HashMap<i64, PartnerReportItemDto> = HashMap::new();

    for r in orders {
        let partner_id: Option<i64> = r.get("partner_id");
        let pid = partner_id.unwrap_or(0);
        let p_name: Option<String> = r.get("partner_name");
        let name = p_name.unwrap_or_else(|| {
            if p_type == "Customer" {
                "KHÁCH LẺ".into()
            } else {
                "NCC VÃNG LAI".into()
            }
        });
        let total_amount: f64 = r.get("total_amount");

        let entry = map.entry(pid).or_insert_with(|| PartnerReportItemDto {
            id: pid,
            name,
            count: 0,
            total_amount: 0.0,
            profit: 0.0,
        });

        entry.count += 1;
        entry.total_amount += total_amount;
    }

    let mut report_list: Vec<PartnerReportItemDto> = map.into_values().collect();

    // Search
    if let Some(s) = &params.search {
        let s_norm = remove_accents(s);
        report_list.retain(|i| remove_accents(&i.name).contains(&s_norm));
    }

    // Sort
    let sort_by = params.sort_by.as_deref().unwrap_or("total_amount");
    let is_desc = params.sort_order.as_deref().unwrap_or("desc") == "desc";

    report_list.sort_by(|a, b| {
        let cmp = match sort_by {
            "count" => a.count.cmp(&b.count),
            "name" => a.name.cmp(&b.name),
            _ => a.total_amount.partial_cmp(&b.total_amount).unwrap_or(std::cmp::Ordering::Equal),
        };
        if is_desc {
            cmp.reverse()
        } else {
            cmp
        }
    });

    let total = report_list.len() as i64;
    if let (Some(page), Some(limit)) = (params.page, params.limit) {
        if limit > 0 {
            let start = ((page - 1) * limit) as usize;
            let end = (start + limit as usize).min(report_list.len());
            let items = if start < report_list.len() {
                report_list[start..end].to_vec()
            } else {
                Vec::new()
            };

            return Ok(Json(json!({
                "items": items,
                "total": total,
                "pages": (total + limit - 1) / limit,
                "current_page": page
            })));
        }
    }

    Ok(Json(json!(report_list)))
}

// --- 4. Report Product Movement (/api/reports/product-movement) ---
pub async fn report_product_movement(
    State(pool): State<SqlitePool>,
    Query(params): Query<ProductMovementQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = String::from(
        "SELECT o.id as order_id, o.display_id, o.date, o.type as order_type, \
                CAST(od.quantity AS REAL) as quantity, CAST(od.price AS REAL) as price, od.product_name_override, \
                p.name as product_name, p.brand as product_brand, p.unit as product_unit, \
                part.name as partner_name \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         LEFT JOIN partner part ON part.id = o.partner_id \
         WHERE 1=1"
    );

    if let Some(s) = &params.start_date {
        sql.push_str(&format!(" AND o.date >= '{}'", s));
    }
    if let Some(e) = &params.end_date {
        if e.len() <= 10 {
            sql.push_str(&format!(" AND o.date <= '{} 23:59:59'", e));
        } else {
            sql.push_str(&format!(" AND o.date <= '{}'", e));
        }
    }
    if let Some(pids) = &params.product_ids {
        let clean_ids: Vec<String> = pids
            .split(',')
            .filter_map(|x| x.trim().parse::<i64>().ok().map(|n| n.to_string()))
            .collect();
        if !clean_ids.is_empty() {
            sql.push_str(&format!(" AND od.product_id IN ({})", clean_ids.join(",")));
        }
    }
    if let Some(b) = &params.brand {
        if !b.is_empty() {
            sql.push_str(&format!(" AND p.brand = '{}'", b));
        }
    }
    if let Some(pid) = params.partner_id {
        sql.push_str(&format!(" AND o.partner_id = {}", pid));
    }
    if let Some(t) = &params.r#type {
        sql.push_str(&format!(" AND o.type = '{}'", t));
    }

    sql.push_str(" ORDER BY o.date DESC");

    let rows = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut results = Vec::new();
    for r in rows {
        let order_id: i64 = r.get("order_id");
        let display_id: Option<String> = r.get("display_id");
        let date: Option<NaiveDateTime> = r.get("date");
        let order_type: String = r.get("order_type");
        let quantity: f64 = r.get("quantity");
        let price: f64 = r.get("price");
        let p_name_override: Option<String> = r.get("product_name_override");
        let p_name: Option<String> = r.get("product_name");
        let brand: Option<String> = r.get("product_brand");
        let unit: Option<String> = r.get("product_unit");
        let partner_name: Option<String> = r.get("partner_name");

        let move_type = if order_type == "Sale" { "Xuất" } else { "Nhập" };
        let default_partner = if order_type == "Sale" { "KHÁCH LẺ" } else { "NCC VÃNG LAI" };

        results.push(ProductMovementItemDto {
            date: date.map(|d| d.to_string()).unwrap_or_default(),
            display_id: display_id.unwrap_or_else(|| order_id.to_string()),
            order_id,
            product_name: p_name_override.or(p_name).unwrap_or_else(|| "Sản phẩm đã xóa".into()),
            brand: brand.unwrap_or_default(),
            r#type: move_type.into(),
            quantity,
            price,
            total: quantity * price,
            partner_name: partner_name.unwrap_or_else(|| default_partner.into()),
            unit: unit.unwrap_or_default(),
        });
    }

    Ok(Json(results))
}

// --- 5. Report Synthesis (/api/reports/synthesis) ---
pub async fn report_synthesis(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportSynthesisQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let r_type = params.r#type.as_deref().unwrap_or("Sale");
    let group_by_brand = params.group_by_brand.as_deref() == Some("true");

    let mut sql = if group_by_brand {
        format!(
            "SELECT COALESCE(part.name, '{}') as partner_name, \
                    part.phone as partner_phone, \
                    MAX(p.brand) as brand, \
                    CAST(SUM(od.quantity) AS REAL) as total_qty, \
                    CAST(SUM(od.quantity * od.price) AS REAL) as total_val, \
                    o.partner_id \
             FROM order_detail od \
             JOIN \"order\" o ON o.id = od.order_id \
             JOIN product p ON p.id = od.product_id \
             LEFT JOIN partner part ON part.id = o.partner_id \
             WHERE o.type = '{}'",
            if r_type == "Sale" { "KHÁCH LẺ" } else { "NCC VÃNG LAI" },
            r_type
        )
    } else {
        format!(
            "SELECT COALESCE(part.name, '{}') as partner_name, \
                    part.phone as partner_phone, \
                    p.name as product_name, \
                    p.brand, \
                    p.unit, \
                    CAST(SUM(od.quantity) AS REAL) as total_qty, \
                    CAST(SUM(od.quantity * od.price) AS REAL) as total_val, \
                    o.partner_id, \
                    od.product_id \
             FROM order_detail od \
             JOIN \"order\" o ON o.id = od.order_id \
             JOIN product p ON p.id = od.product_id \
             LEFT JOIN partner part ON part.id = o.partner_id \
             WHERE o.type = '{}'",
            if r_type == "Sale" { "KHÁCH LẺ" } else { "NCC VÃNG LAI" },
            r_type
        )
    };

    if let (Some(s), Some(e)) = (&params.start_date, &params.end_date) {
        sql.push_str(&format!(" AND o.date >= '{}' AND o.date <= '{}'", s, e));
    } else {
        if let Some(y) = &params.year {
            sql.push_str(&format!(" AND strftime('%Y', o.date) = '{}'", y));
        }
        if let Some(m) = &params.month {
            let padded = format!("{:0>2}", m);
            sql.push_str(&format!(" AND strftime('%m', o.date) = '{}'", padded));
        }
        if let Some(d) = &params.day {
            let padded = format!("{:0>2}", d);
            sql.push_str(&format!(" AND strftime('%d', o.date) = '{}'", padded));
        }
        if let Some(q) = &params.quarter {
            let (s, e) = match q.as_str() {
                "1" => ("01", "03"),
                "2" => ("04", "06"),
                "3" => ("07", "09"),
                "4" => ("10", "12"),
                _ => ("01", "12"),
            };
            sql.push_str(&format!(" AND strftime('%m', o.date) BETWEEN '{}' AND '{}'", s, e));
        }
    }

    if let Some(pid) = params.partner_id {
        if pid == 0 {
            sql.push_str(" AND o.partner_id IS NULL");
        } else {
            sql.push_str(&format!(" AND o.partner_id = {}", pid));
        }
    }
    if let Some(prod_id) = params.product_id {
        if !group_by_brand {
            sql.push_str(&format!(" AND od.product_id = {}", prod_id));
        }
    }
    if let Some(b) = &params.brand {
        if !b.is_empty() {
            sql.push_str(&format!(" AND p.brand = '{}'", b));
        }
    }

    if group_by_brand {
        sql.push_str(" GROUP BY o.partner_id, COALESCE(part.name, 'KHÁCH LẺ')");
    } else {
        sql.push_str(" GROUP BY o.partner_id, od.product_id, COALESCE(part.name, 'KHÁCH LẺ'), p.name, p.brand, p.unit");
    }

    let rows = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut results = Vec::new();
    if group_by_brand {
        for r in rows {
            let p_name: String = r.get("partner_name");
            let p_phone: Option<String> = r.get("partner_phone");
            let p_brand: Option<String> = r.get("brand");
            let qty: f64 = r.get("total_qty");
            let val: f64 = r.get("total_val");
            let pid: Option<i64> = r.get("partner_id");

            let brand_name = p_brand.unwrap_or_default();
            results.push(SynthesisReportItemDto {
                partner_name: p_name,
                partner_phone: p_phone,
                product_name: format!("TỔNG DOANH THU HÃNG: {}", if brand_name.is_empty() { "KHO" } else { &brand_name }),
                brand: brand_name,
                unit: "".into(),
                quantity: qty,
                revenue: val,
                partner_id: pid,
                product_id: None,
                is_from_combo: None,
                original_combo: None,
            });
        }
    } else {
        for r in rows {
            let p_name: String = r.get("partner_name");
            let p_phone: Option<String> = r.get("partner_phone");
            let prod_name: String = r.get("product_name");
            let p_brand: Option<String> = r.get("brand");
            let unit: Option<String> = r.get("unit");
            let qty: f64 = r.get("total_qty");
            let val: f64 = r.get("total_val");
            let pid: Option<i64> = r.get("partner_id");
            let prod_id: Option<i64> = r.get("product_id");

            results.push(SynthesisReportItemDto {
                partner_name: p_name,
                partner_phone: p_phone,
                product_name: prod_name,
                brand: p_brand.unwrap_or_default(),
                unit: unit.unwrap_or_default(),
                quantity: qty,
                revenue: val,
                partner_id: pid,
                product_id: prod_id,
                is_from_combo: None,
                original_combo: None,
            });
        }
    }

    // Sort
    let sort_by = params.sort_by.as_deref().unwrap_or("revenue");
    let is_desc = params.sort_order.as_deref().unwrap_or("desc") == "desc";

    results.sort_by(|a, b| {
        let cmp = match sort_by {
            "quantity" => a.quantity.partial_cmp(&b.quantity).unwrap_or(std::cmp::Ordering::Equal),
            "partner_name" => a.partner_name.cmp(&b.partner_name),
            "product_name" => a.product_name.cmp(&b.product_name),
            _ => a.revenue.partial_cmp(&b.revenue).unwrap_or(std::cmp::Ordering::Equal),
        };
        if is_desc {
            cmp.reverse()
        } else {
            cmp
        }
    });

    let total = results.len() as i64;
    if let (Some(page), Some(limit)) = (params.page, params.limit) {
        if limit > 0 {
            let start = ((page - 1) * limit) as usize;
            let end = (start + limit as usize).min(results.len());
            let items = if start < results.len() {
                results[start..end].to_vec()
            } else {
                Vec::new()
            };

            return Ok(Json(json!({
                "items": items,
                "total": total,
                "pages": (total + limit - 1) / limit,
                "current_page": page
            })));
        }
    }

    Ok(Json(json!(results)))
}

// --- 6. Report Unsold (/api/reports/unsold) ---
pub async fn report_unsold(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportUnsoldQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let now = Local::now().date_naive();

    let sql = "SELECT p.id, p.code, p.name, CAST(p.stock AS REAL) as stock, p.unit, \
                      CAST(p.multiplier AS REAL) as multiplier, CAST(p.cost_price AS REAL) as cost_price, \
                      subq.last_sold_date \
               FROM product p \
               LEFT JOIN ( \
                   SELECT od.product_id, MAX(o.date) as last_sold_date \
                   FROM order_detail od \
                   JOIN \"order\" o ON o.id = od.order_id \
                   WHERE o.type = 'Sale' \
                   GROUP BY od.product_id \
               ) subq ON subq.product_id = p.id \
               WHERE p.is_active = 1 AND p.stock > 0 \
               ORDER BY subq.last_sold_date ASC NULLS FIRST, p.id ASC";

    let rows = sqlx::query(sql).fetch_all(&pool).await?;

    let mut unsold_list = Vec::new();
    for r in rows {
        let id: i64 = r.get("id");
        let code: Option<String> = r.get("code");
        let name: String = r.get("name");
        let stock: f64 = r.get("stock");
        let unit: Option<String> = r.get("unit");
        let multiplier: Option<f64> = r.get("multiplier");
        let cost_price: Option<f64> = r.get("cost_price");
        let last_date: Option<NaiveDateTime> = r.get("last_sold_date");

        let days_unsold = if let Some(ld) = last_date {
            (now - ld.date()).num_days()
        } else {
            999999
        };

        let cp = cost_price.unwrap_or(0.0);
        unsold_list.push(UnsoldProductItemDto {
            id,
            code,
            name,
            stock,
            unit,
            multiplier,
            cost_price,
            last_sold_date: last_date.map(|d| d.format("%Y-%m-%d").to_string()),
            days_unsold,
            total_value: stock * cp,
        });
    }

    if let Some(s) = &params.search {
        let s_norm = remove_accents(s);
        unsold_list.retain(|i| {
            remove_accents(&i.name).contains(&s_norm)
                || i.code.as_deref().unwrap_or_default().to_lowercase().contains(&s_norm)
        });
    }

    let total = unsold_list.len() as i64;
    let limit = params.limit.unwrap_or(20);
    let page = params.page.unwrap_or(1);

    if limit > 0 {
        let start = ((page - 1) * limit) as usize;
        let end = (start + limit as usize).min(unsold_list.len());
        let items = if start < unsold_list.len() {
            unsold_list[start..end].to_vec()
        } else {
            Vec::new()
        };

        return Ok(Json(json!({
            "items": items,
            "total": total,
            "pages": (total + limit - 1) / limit,
            "current_page": page
        })));
    }

    Ok(Json(json!({
        "items": unsold_list,
        "total": total,
        "pages": 1
    })))
}

// --- 7. Report Flattened Products (/api/reports/flattened-products) ---
pub async fn report_flattened_products(
    State(pool): State<SqlitePool>,
    Query(params): Query<FlattenedProductsQueryDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql = String::from(
        "SELECT o.display_id, o.date as order_date, \
                CAST(od.quantity AS REAL) as quantity, CAST(od.price AS REAL) as sale_price, \
                p.id as product_id, p.code, p.name as product_name, p.brand, p.unit, \
                CAST(p.accounting_price AS REAL) as accounting_price, \
                c.name as category_name \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         LEFT JOIN category c ON c.id = p.category_id \
         WHERE o.type = 'Sale'"
    );

    if let Some(s) = &params.start_date {
        sql.push_str(&format!(" AND o.date >= '{}'", s));
    }
    if let Some(e) = &params.end_date {
        sql.push_str(&format!(" AND o.date <= '{}'", e));
    }

    sql.push_str(" ORDER BY o.date DESC");

    let rows = sqlx::query(&sql).fetch_all(&pool).await?;

    let mut raw_results = Vec::new();
    let price_mode = params.price_mode.as_deref().unwrap_or("sale");
    let target_profit = params.target_profit.unwrap_or(0.0);
    let profit_variance = params.profit_variance.unwrap_or(0.0);

    for r in rows {
        let display_id: Option<String> = r.get("display_id");
        let date: Option<NaiveDateTime> = r.get("order_date");
        let quantity: f64 = r.get("quantity");
        let sale_price: f64 = r.get("sale_price");
        let code: Option<String> = r.get("code");
        let p_name: Option<String> = r.get("product_name");
        let brand: Option<String> = r.get("brand");
        let unit: Option<String> = r.get("unit");
        let accounting_price: Option<f64> = r.get("accounting_price");
        let cat_name: Option<String> = r.get("category_name");

        let acc_price = accounting_price.unwrap_or(0.0);
        let display_price = if price_mode == "accounting" {
            acc_price
        } else {
            sale_price
        };

        // Deterministic price estimation
        let gen_price = (acc_price * (1.0 + (target_profit + profit_variance * 0.5) / 100.0)).round();

        let date_str = date.map(|d| d.format("%d/%m/%Y %H:%M").to_string()).unwrap_or_default();
        let date_iso = date.map(|d| d.to_string()).unwrap_or_default();

        raw_results.push(FlattenedProductItemDto {
            order_id: display_id.unwrap_or_default(),
            time: date_str,
            date_iso,
            code: code.unwrap_or_default(),
            product_name: p_name.unwrap_or_default(),
            brand: brand.unwrap_or_default(),
            category_name: cat_name.unwrap_or_else(|| "Chưa phân loại".into()),
            quantity,
            retail_price: display_price,
            generated_price: gen_price,
            total: quantity * (if price_mode == "accounting" { gen_price } else { display_price }),
            unit: unit.unwrap_or_default(),
            accounting_price: acc_price,
        });
    }

    let group_by = params.group_by_product.as_deref() == Some("true");
    let mut final_results = if group_by {
        let mut agg: HashMap<(String, String, String), FlattenedProductItemDto> = HashMap::new();
        for item in raw_results {
            let key = (item.code.clone(), item.product_name.clone(), item.unit.clone());
            let entry = agg.entry(key).or_insert_with(|| FlattenedProductItemDto {
                order_id: "".into(),
                time: "".into(),
                date_iso: "".into(),
                code: item.code.clone(),
                product_name: item.product_name.clone(),
                brand: item.brand.clone(),
                category_name: item.category_name.clone(),
                quantity: 0.0,
                retail_price: item.retail_price,
                generated_price: item.generated_price,
                total: 0.0,
                unit: item.unit.clone(),
                accounting_price: item.accounting_price,
            });
            entry.quantity += item.quantity;
            entry.total += item.total;
        }
        let mut res: Vec<FlattenedProductItemDto> = agg.into_values().collect();
        res.sort_by(|a, b| b.total.partial_cmp(&a.total).unwrap_or(std::cmp::Ordering::Equal));
        res
    } else {
        raw_results
    };

    let total_count = final_results.len() as i64;
    let overall_qty: f64 = final_results.iter().map(|i| i.quantity).sum();
    let overall_total: f64 = final_results.iter().map(|i| i.total).sum();

    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(50);
    let start = ((page - 1) * limit) as usize;
    let end = (start + limit as usize).min(final_results.len());

    let paginated = if start < final_results.len() {
        final_results[start..end].to_vec()
    } else {
        Vec::new()
    };

    Ok(Json(json!({
        "items": paginated,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) / limit,
        "overall_totals": {
            "quantity": overall_qty,
            "total": overall_total
        }
    })))
}

// --- 7. Aggregated Report KPIs (/api/reports/kpis) ---
#[derive(Debug, serde::Deserialize)]
pub struct ReportCommonFilterDto {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub brand: Option<String>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub limit: Option<i64>,
}

pub async fn get_report_kpis(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let brand = params.brand.unwrap_or_else(|| "All".into());
    let mut sql_orders = "SELECT id, total_amount FROM \"order\" WHERE type = 'Sale' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();

    if let Some(ref s) = params.start_date {
        if !s.is_empty() {
            sql_orders.push_str(&format!(" AND date >= '{}'", s));
        }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let (total_revenue, order_count): (f64, i64) = if brand != "All" {
        let q = format!(
            "SELECT CAST(COALESCE(SUM(od.price * od.quantity), 0) AS REAL), COUNT(DISTINCT o.id) \
             FROM order_detail od \
             JOIN \"order\" o ON o.id = od.order_id \
             JOIN product p ON p.id = od.product_id \
             WHERE o.id IN (SELECT id FROM ({}) sub) AND p.brand = ?",
            sql_orders
        );
        let row = sqlx::query(&q).bind(&brand).fetch_one(&pool).await?;
        (row.try_get(0).unwrap_or(0.0), row.try_get(1).unwrap_or(0))
    } else {
        let q = format!(
            "SELECT CAST(COALESCE(SUM(total_amount), 0) AS REAL), COUNT(id) FROM ({}) sub",
            sql_orders
        );
        let row = sqlx::query(&q).fetch_one(&pool).await?;
        (row.try_get(0).unwrap_or(0.0), row.try_get(1).unwrap_or(0))
    };

    let profit_query = if brand != "All" {
        format!(
            "SELECT CAST(COALESCE(SUM((od.price - COALESCE(od.cost_price, p.cost_price, 0)) * od.quantity), 0) AS REAL), \
             COUNT(DISTINCT od.product_id), CAST(COALESCE(SUM(od.quantity), 0) AS REAL) \
             FROM order_detail od \
             JOIN \"order\" o ON o.id = od.order_id \
             JOIN product p ON p.id = od.product_id \
             WHERE o.id IN (SELECT id FROM ({}) sub) AND p.brand = ?",
            sql_orders
        )
    } else {
        format!(
            "SELECT CAST(COALESCE(SUM((od.price - COALESCE(od.cost_price, p.cost_price, 0)) * od.quantity), 0) AS REAL), \
             COUNT(DISTINCT od.product_id), CAST(COALESCE(SUM(od.quantity), 0) AS REAL) \
             FROM order_detail od \
             JOIN \"order\" o ON o.id = od.order_id \
             LEFT JOIN product p ON p.id = od.product_id \
             WHERE o.id IN (SELECT id FROM ({}) sub)",
            sql_orders
        )
    };

    let profit_row = if brand != "All" {
        sqlx::query(&profit_query).bind(&brand).fetch_one(&pool).await?
    } else {
        sqlx::query(&profit_query).fetch_one(&pool).await?
    };

    let total_profit: f64 = profit_row.try_get(0).unwrap_or(0.0);
    let product_count: i64 = profit_row.try_get(1).unwrap_or(0);
    let total_qty: f64 = profit_row.try_get(2).unwrap_or(0.0);

    Ok(Json(json!({
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "order_count": order_count,
        "product_count": product_count,
        "total_qty": total_qty
    })))
}

// --- 8. Sales Chart (/api/reports/sales-chart) ---
pub async fn get_report_sales_chart(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id, date, total_amount FROM \"order\" WHERE type = 'Sale' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let rev_q = format!(
        "SELECT strftime('%Y-%m-%d', date) as day, CAST(SUM(total_amount) AS REAL) as rev \
         FROM ({}) sub GROUP BY day ORDER BY day",
        sql_orders
    );
    let rev_rows = sqlx::query(&rev_q).fetch_all(&pool).await?;

    let profit_q = format!(
        "SELECT strftime('%Y-%m-%d', o.date) as day, \
         CAST(SUM((od.price - COALESCE(od.cost_price, p.cost_price, 0)) * od.quantity) AS REAL) as profit \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         WHERE o.id IN (SELECT id FROM ({}) sub) \
         GROUP BY day",
        sql_orders
    );
    let profit_rows = sqlx::query(&profit_q).fetch_all(&pool).await?;
    let mut profit_map: HashMap<String, f64> = HashMap::new();
    for r in profit_rows {
        let d: Option<String> = r.try_get("day").ok();
        let p: Option<f64> = r.try_get("profit").ok();
        if let (Some(day), Some(val)) = (d, p) {
            profit_map.insert(day, val);
        }
    }

    let mut result = Vec::new();
    for r in rev_rows {
        let day: String = r.try_get("day").unwrap_or_default();
        let rev: f64 = r.try_get("rev").unwrap_or(0.0);
        let prof: f64 = *profit_map.get(&day).unwrap_or(&0.0);
        result.push(json!({
            "date": day,
            "revenue": rev,
            "profit": prof
        }));
    }

    Ok(Json(result))
}

// --- 9. Purchase Chart (/api/reports/purchase-chart) ---
pub async fn get_report_purchase_chart(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id, date, total_amount FROM \"order\" WHERE type = 'Purchase' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let q = format!(
        "SELECT strftime('%Y-%m-%d', date) as day, CAST(SUM(total_amount) AS REAL) as spending \
         FROM ({}) sub GROUP BY day ORDER BY day",
        sql_orders
    );
    let rows = sqlx::query(&q).fetch_all(&pool).await?;
    let mut result = Vec::new();
    for r in rows {
        let day: String = r.try_get("day").unwrap_or_default();
        let spending: f64 = r.try_get("spending").unwrap_or(0.0);
        result.push(json!({
            "date": day,
            "spending": spending
        }));
    }

    Ok(Json(result))
}

// --- 10. Product Sales Breakdown (/api/reports/product-sales) ---
pub async fn get_report_product_sales(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id FROM \"order\" WHERE type = 'Sale' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let brand = params.brand.unwrap_or_else(|| "All".into());
    let mut brand_clause = String::new();
    if brand != "All" {
        brand_clause = format!(" AND p.brand = '{}'", brand.replace('\'', "''"));
    }

    let q = format!(
        "SELECT od.product_id, \
         COALESCE(MAX(od.product_name_override), MAX(p.name), 'Sản phẩm') as name, \
         COALESCE(MAX(p.code), '') as code, \
         COALESCE(MAX(p.unit), '') as unit, \
         CAST(SUM(od.quantity) AS REAL) as qty, \
         CAST(SUM(od.price * od.quantity) AS REAL) as revenue, \
         CAST(SUM((od.price - COALESCE(od.cost_price, p.cost_price, 0)) * od.quantity) AS REAL) as profit \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product p ON p.id = od.product_id \
         WHERE o.id IN ({}) {} \
         GROUP BY od.product_id",
        sql_orders, brand_clause
    );

    let rows = sqlx::query(&q).fetch_all(&pool).await?;
    let mut results = Vec::new();
    for r in rows {
        let p_id: Option<i64> = r.try_get("product_id").ok();
        let name: String = r.try_get("name").unwrap_or_default();
        let code: String = r.try_get("code").unwrap_or_default();
        let unit: String = r.try_get("unit").unwrap_or_default();
        let qty: f64 = r.try_get("qty").unwrap_or(0.0);
        let revenue: f64 = r.try_get("revenue").unwrap_or(0.0);
        let profit: f64 = r.try_get("profit").unwrap_or(0.0);

        if let Some(ref s) = params.search {
            if !s.is_empty() {
                let norm = remove_accents(s);
                if !remove_accents(&name).contains(&norm) && !code.to_lowercase().contains(&s.to_lowercase()) {
                    continue;
                }
            }
        }

        results.push(json!({
            "id": p_id,
            "name": name,
            "code": code,
            "unit": unit,
            "qty": qty,
            "revenue": revenue,
            "profit": profit
        }));
    }

    let sort_by = params.sort_by.unwrap_or_else(|| "revenue".into());
    let sort_order = params.sort_order.unwrap_or_else(|| "desc".into());
    let is_desc = sort_order == "desc";

    results.sort_by(|a, b| {
        let val_a = a.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        let val_b = b.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        if is_desc { val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal) }
        else { val_a.partial_cmp(&val_b).unwrap_or(std::cmp::Ordering::Equal) }
    });

    let limit = params.limit.unwrap_or(100) as usize;
    if results.len() > limit {
        results.truncate(limit);
    }

    Ok(Json(results))
}

// --- 11. Partner Sales Breakdown (/api/reports/partner-sales) ---
pub async fn get_report_partner_sales(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id, partner_id, total_amount, amount_paid, payment_method FROM \"order\" WHERE type = 'Sale' AND display_id NOT IN ('NODAU', '#NODAU') AND partner_id IS NOT NULL".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let q = format!(
        "SELECT o.partner_id, p.name as partner_name, p.phone as partner_phone, p.debt_balance, \
         COUNT(o.id) as order_count, \
         CAST(SUM(o.total_amount) AS REAL) as total_revenue, \
         CAST(SUM(CASE WHEN o.payment_method = 'Debt' THEN (o.total_amount - COALESCE(o.amount_paid, 0)) ELSE 0 END) AS REAL) as debt_increase \
         FROM ({}) o \
         JOIN partner p ON p.id = o.partner_id \
         GROUP BY o.partner_id",
        sql_orders
    );

    let rows = sqlx::query(&q).fetch_all(&pool).await?;

    let profit_q = format!(
        "SELECT o.partner_id, \
         CAST(SUM((od.price - COALESCE(od.cost_price, pr.cost_price, 0)) * od.quantity) AS REAL) as total_profit \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         LEFT JOIN product pr ON pr.id = od.product_id \
         WHERE o.id IN (SELECT id FROM ({}) sub) \
         GROUP BY o.partner_id",
        sql_orders
    );
    let profit_rows = sqlx::query(&profit_q).fetch_all(&pool).await?;
    let mut profit_map: HashMap<i64, f64> = HashMap::new();
    for pr in profit_rows {
        if let (Ok(pid), Ok(prof)) = (pr.try_get::<i64, _>("partner_id"), pr.try_get::<f64, _>("total_profit")) {
            profit_map.insert(pid, prof);
        }
    }

    let mut results = Vec::new();
    for r in rows {
        let pid: i64 = r.try_get("partner_id").unwrap_or(0);
        let name: String = r.try_get("partner_name").unwrap_or_default();
        let phone: String = r.try_get("partner_phone").unwrap_or_default();
        let debt_bal: f64 = r.try_get("debt_balance").unwrap_or(0.0);
        let order_count: i64 = r.try_get("order_count").unwrap_or(0);
        let total_revenue: f64 = r.try_get("total_revenue").unwrap_or(0.0);
        let debt_increase: f64 = r.try_get("debt_increase").unwrap_or(0.0);
        let total_profit: f64 = *profit_map.get(&pid).unwrap_or(&0.0);

        if let Some(ref s) = params.search {
            if !s.is_empty() {
                let norm = remove_accents(s);
                if !remove_accents(&name).contains(&norm) && !phone.contains(s) {
                    continue;
                }
            }
        }

        results.push(json!({
            "id": pid,
            "name": name,
            "phone": phone,
            "orderCount": order_count,
            "order_count": order_count,
            "totalRevenue": total_revenue,
            "total_revenue": total_revenue,
            "totalProfit": total_profit,
            "debtIncrease": debt_increase,
            "debt_increase": debt_increase,
            "totalDebt": debt_bal
        }));
    }

    let sort_by = params.sort_by.unwrap_or_else(|| "totalRevenue".into());
    let is_desc = params.sort_order.as_deref() != Some("asc");

    results.sort_by(|a, b| {
        let val_a = a.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        let val_b = b.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        if is_desc { val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal) }
        else { val_a.partial_cmp(&val_b).unwrap_or(std::cmp::Ordering::Equal) }
    });

    Ok(Json(results))
}

// --- 12. Inventory Flow (/api/reports/inventory-flow) ---
pub async fn get_report_inventory_flow(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id, type FROM \"order\" WHERE display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let imp_q = format!(
        "SELECT od.product_id, CAST(SUM(od.quantity) AS REAL) as qty, CAST(SUM(od.price * od.quantity) AS REAL) as val \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         WHERE o.id IN (SELECT id FROM ({}) sub WHERE type = 'Purchase') \
         GROUP BY od.product_id",
        sql_orders
    );
    let exp_q = format!(
        "SELECT od.product_id, CAST(SUM(od.quantity) AS REAL) as qty, CAST(SUM(od.price * od.quantity) AS REAL) as val \
         FROM order_detail od \
         JOIN \"order\" o ON o.id = od.order_id \
         WHERE o.id IN (SELECT id FROM ({}) sub WHERE type = 'Sale') \
         GROUP BY od.product_id",
        sql_orders
    );

    let imp_rows = sqlx::query(&imp_q).fetch_all(&pool).await?;
    let exp_rows = sqlx::query(&exp_q).fetch_all(&pool).await?;

    let mut imp_map: HashMap<i64, (f64, f64)> = HashMap::new();
    for r in imp_rows {
        if let Ok(pid) = r.try_get::<i64, _>("product_id") {
            imp_map.insert(pid, (r.try_get("qty").unwrap_or(0.0), r.try_get("val").unwrap_or(0.0)));
        }
    }

    let mut exp_map: HashMap<i64, (f64, f64)> = HashMap::new();
    for r in exp_rows {
        if let Ok(pid) = r.try_get::<i64, _>("product_id") {
            exp_map.insert(pid, (r.try_get("qty").unwrap_or(0.0), r.try_get("val").unwrap_or(0.0)));
        }
    }

    let brand = params.brand.unwrap_or_else(|| "All".into());
    let mut prod_q = "SELECT id, code, name, unit, stock, brand FROM product WHERE 1=1".to_string();
    if brand != "All" {
        prod_q.push_str(&format!(" AND brand = '{}'", brand.replace('\'', "''")));
    }
    let prods = sqlx::query(&prod_q).fetch_all(&pool).await?;

    let mut results = Vec::new();
    for p in prods {
        let pid: i64 = p.try_get("id").unwrap_or(0);
        let code: String = p.try_get("code").unwrap_or_default();
        let name: String = p.try_get("name").unwrap_or_default();
        let unit: String = p.try_get("unit").unwrap_or_default();
        let stock: f64 = p.try_get("stock").unwrap_or(0.0);

        let (im_qty, im_val) = *imp_map.get(&pid).unwrap_or(&(0.0, 0.0));
        let (ex_qty, ex_val) = *exp_map.get(&pid).unwrap_or(&(0.0, 0.0));

        if im_qty == 0.0 && ex_qty == 0.0 && stock == 0.0 {
            continue;
        }

        if let Some(ref s) = params.search {
            if !s.is_empty() {
                let norm = remove_accents(s);
                if !remove_accents(&name).contains(&norm) && !code.to_lowercase().contains(&s.to_lowercase()) {
                    continue;
                }
            }
        }

        results.push(json!({
            "id": pid,
            "code": code,
            "name": name,
            "unit": unit,
            "currentStock": stock,
            "importQty": im_qty,
            "exportQty": ex_qty,
            "importVal": im_val,
            "exportVal": ex_val,
            "openingStock": stock - im_qty + ex_qty
        }));
    }

    let sort_by = params.sort_by.unwrap_or_else(|| "exportQty".into());
    let is_desc = params.sort_order.as_deref() != Some("asc");

    results.sort_by(|a, b| {
        let val_a = a.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        let val_b = b.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        if is_desc { val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal) }
        else { val_a.partial_cmp(&val_b).unwrap_or(std::cmp::Ordering::Equal) }
    });

    Ok(Json(results))
}

// --- 13. Brand Sales Breakdown (/api/reports/brands) ---
pub async fn get_report_brands(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id FROM \"order\" WHERE type = 'Sale' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let q = format!(
        "SELECT COALESCE(p.brand, 'Khác') as brand, \
         CAST(SUM(od.price * od.quantity) AS REAL) as revenue, \
         CAST(SUM((od.price - COALESCE(od.cost_price, p.cost_price, 0)) * od.quantity) AS REAL) as profit, \
         CAST(SUM(od.quantity) AS REAL) as qty \
         FROM order_detail od \
         JOIN product p ON p.id = od.product_id \
         JOIN \"order\" o ON o.id = od.order_id \
         WHERE o.id IN ({}) \
         GROUP BY p.brand",
        sql_orders
    );

    let rows = sqlx::query(&q).fetch_all(&pool).await?;
    let mut results = Vec::new();
    for r in rows {
        let brand: String = r.try_get("brand").unwrap_or_else(|_| "Khác".into());
        let rev: f64 = r.try_get("revenue").unwrap_or(0.0);
        let prof: f64 = r.try_get("profit").unwrap_or(0.0);
        let qty: f64 = r.try_get("qty").unwrap_or(0.0);
        results.push(json!({
            "name": brand,
            "revenue": rev,
            "profit": prof,
            "qty": qty
        }));
    }

    let sort_by = params.sort_by.unwrap_or_else(|| "revenue".into());
    let is_desc = params.sort_order.as_deref() != Some("asc");

    results.sort_by(|a, b| {
        let val_a = a.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        let val_b = b.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        if is_desc { val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal) }
        else { val_a.partial_cmp(&val_b).unwrap_or(std::cmp::Ordering::Equal) }
    });

    Ok(Json(results))
}

// --- 14. Purchase Sales Supplier Breakdown (/api/reports/purchase-sales) ---
pub async fn get_report_purchase_sales(
    State(pool): State<SqlitePool>,
    Query(params): Query<ReportCommonFilterDto>,
) -> Result<impl IntoResponse, AppError> {
    let mut sql_orders = "SELECT id, partner_id, total_amount FROM \"order\" WHERE type = 'Purchase' AND display_id NOT IN ('NODAU', '#NODAU')".to_string();
    if let Some(ref s) = params.start_date {
        if !s.is_empty() { sql_orders.push_str(&format!(" AND date >= '{}'", s)); }
    }
    if let Some(ref e) = params.end_date {
        if !e.is_empty() {
            let e_clean = if e.len() <= 10 { format!("{} 23:59:59", e) } else { e.clone() };
            sql_orders.push_str(&format!(" AND date <= '{}'", e_clean));
        }
    }

    let q = format!(
        "SELECT o.partner_id, COALESCE(p.name, 'Nhà cung cấp vãng lai') as name, COALESCE(p.phone, '') as phone, \
         COUNT(o.id) as importCount, \
         CAST(SUM(o.total_amount) AS REAL) as totalImport \
         FROM ({}) o \
         LEFT JOIN partner p ON p.id = o.partner_id \
         GROUP BY o.partner_id",
        sql_orders
    );

    let rows = sqlx::query(&q).fetch_all(&pool).await?;
    let mut results = Vec::new();
    for r in rows {
        let pid: Option<i64> = r.try_get("partner_id").ok();
        let name: String = r.try_get("name").unwrap_or_default();
        let phone: String = r.try_get("phone").unwrap_or_default();
        let imp_count: i64 = r.try_get("importCount").unwrap_or(0);
        let total_imp: f64 = r.try_get("totalImport").unwrap_or(0.0);

        results.push(json!({
            "id": pid,
            "name": name,
            "phone": phone,
            "importCount": imp_count,
            "totalImport": total_imp
        }));
    }

    let sort_by = params.sort_by.unwrap_or_else(|| "totalImport".into());
    let is_desc = params.sort_order.as_deref() != Some("asc");

    results.sort_by(|a, b| {
        let val_a = a.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        let val_b = b.get(&sort_by).and_then(|v| v.as_f64()).unwrap_or(0.0);
        if is_desc { val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal) }
        else { val_a.partial_cmp(&val_b).unwrap_or(std::cmp::Ordering::Equal) }
    });

    Ok(Json(results))
}

