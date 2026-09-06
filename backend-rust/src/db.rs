use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{Row, SqlitePool};
use std::str::FromStr;
use std::time::Duration;

pub async fn create_pool(database_url: &str) -> anyhow::Result<SqlitePool> {
    let options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .busy_timeout(Duration::from_secs(10));

    let pool = SqlitePoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(15))
        .idle_timeout(Duration::from_secs(60))
        .connect_with(options)
        .await?;

    ensure_schema(&pool).await?;

    tracing::info!("SQLite connection pool initialized successfully (WAL mode enabled)");
    Ok(pool)
}


async fn ensure_schema(pool: &SqlitePool) -> anyhow::Result<()> {
    // 1. Product table
    let pragma_cols = sqlx::query("PRAGMA table_info(product)").fetch_all(pool).await?;
    let existing_cols: Vec<String> = pragma_cols.into_iter().map(|r| r.get::<String, _>("name").to_lowercase()).collect();
    let product_columns = [
        ("code", "TEXT DEFAULT NULL"),
        ("unit", "VARCHAR(20) DEFAULT 'Cái'"),
        ("secondary_unit", "VARCHAR(20) DEFAULT NULL"),
        ("multiplier", "FLOAT DEFAULT 1"),
        ("cost_price", "FLOAT DEFAULT 0"),
        ("sale_price", "FLOAT DEFAULT 0"),
        ("stock", "FLOAT DEFAULT 0"),
        ("expiry_date", "VARCHAR(50) DEFAULT NULL"),
        ("active_ingredient", "VARCHAR(255) DEFAULT NULL"),
        ("brand", "VARCHAR(100) DEFAULT NULL"),
        ("is_combo", "BOOLEAN DEFAULT 0"),
        ("is_active", "BOOLEAN DEFAULT 1"),
        ("latest_audit", "DATETIME DEFAULT NULL"),
        ("category_id", "INTEGER DEFAULT NULL"),
        ("accounting_price", "FLOAT DEFAULT 0"),
        ("accounting_stock", "FLOAT DEFAULT 0"),
        ("latest_cost_price", "FLOAT DEFAULT 0"),
        ("bulk_quantity", "FLOAT DEFAULT NULL"),
        ("bulk_price", "FLOAT DEFAULT NULL"),
        ("alias", "VARCHAR(100) DEFAULT NULL"),
        ("min_stock", "FLOAT DEFAULT 0"),
    ];
    for (col_name, col_def) in product_columns {
        if !existing_cols.contains(&col_name.to_lowercase()) {
            let sql = format!("ALTER TABLE product ADD COLUMN {} {}", col_name, col_def);
            tracing::info!("Auto-migrating DB: {}", sql);
            let _ = sqlx::query(&sql).execute(pool).await;
        }
    }

    // 2. Order table
    let pragma_order = sqlx::query("PRAGMA table_info(\"order\")").fetch_all(pool).await?;
    let existing_order_cols: Vec<String> = pragma_order.into_iter().map(|r| r.get::<String, _>("name").to_lowercase()).collect();
    let order_columns = [
        ("display_id", "VARCHAR(50) DEFAULT NULL"),
        ("status", "VARCHAR(20) DEFAULT 'Pending'"),
        ("shipping_status", "VARCHAR(20) DEFAULT NULL"),
        ("shipping_address", "VARCHAR(500) DEFAULT NULL"),
        ("shipping_phone", "VARCHAR(50) DEFAULT NULL"),
        ("delivery_date", "DATETIME DEFAULT NULL"),
        ("cash_given", "FLOAT DEFAULT 0"),
        ("amount_paid", "FLOAT DEFAULT 0"),
        ("old_debt", "FLOAT DEFAULT 0"),
        ("created_by", "VARCHAR(100) DEFAULT NULL"),
        ("is_duplicate_checked", "BOOLEAN DEFAULT 0"),
        ("is_consignment", "BOOLEAN DEFAULT 0"),
        ("is_invoiced", "BOOLEAN DEFAULT 0"),
        ("invoice_no", "VARCHAR(100) DEFAULT NULL"),
        ("invoice_date", "DATETIME DEFAULT NULL"),
        ("invoice_note", "VARCHAR(500) DEFAULT NULL"),
    ];
    for (col_name, col_def) in order_columns {
        if !existing_order_cols.contains(&col_name.to_lowercase()) {
            let sql = format!("ALTER TABLE \"order\" ADD COLUMN {} {}", col_name, col_def);
            tracing::info!("Auto-migrating DB: {}", sql);
            let _ = sqlx::query(&sql).execute(pool).await;
        }
    }

    // 3. Order detail table
    let pragma_od = sqlx::query("PRAGMA table_info(order_detail)").fetch_all(pool).await?;
    let existing_od_cols: Vec<String> = pragma_od.into_iter().map(|r| r.get::<String, _>("name").to_lowercase()).collect();
    let od_columns = [
        ("product_name_override", "VARCHAR(200) DEFAULT NULL"),
        ("shipped_quantity", "FLOAT DEFAULT 0"),
        ("cost_price", "FLOAT DEFAULT NULL"),
        ("is_invoiced", "BOOLEAN DEFAULT 0"),
        ("invoiced_quantity", "FLOAT DEFAULT 0"),
        ("invoice_no", "VARCHAR(100) DEFAULT NULL"),
    ];
    for (col_name, col_def) in od_columns {
        if !existing_od_cols.contains(&col_name.to_lowercase()) {
            let sql = format!("ALTER TABLE order_detail ADD COLUMN {} {}", col_name, col_def);
            tracing::info!("Auto-migrating DB: {}", sql);
            let _ = sqlx::query(&sql).execute(pool).await;
        }
    }

    // 4. Cash voucher table
    let pragma_cv = sqlx::query("PRAGMA table_info(cash_voucher)").fetch_all(pool).await?;
    let existing_cv_cols: Vec<String> = pragma_cv.into_iter().map(|r| r.get::<String, _>("name").to_lowercase()).collect();
    let cv_columns = [
        ("source", "VARCHAR(50) DEFAULT 'manual'"),
        ("order_id", "INTEGER DEFAULT NULL"),
        ("type", "VARCHAR(50) DEFAULT 'Payment'"),
    ];
    for (col_name, col_def) in cv_columns {
        if !existing_cv_cols.contains(&col_name.to_lowercase()) {
            let sql = format!("ALTER TABLE cash_voucher ADD COLUMN {} {}", col_name, col_def);
            tracing::info!("Auto-migrating DB: {}", sql);
            let _ = sqlx::query(&sql).execute(pool).await;
        }
    }

    // 5. Inventory Audit tables
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS inventory_audit (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            note TEXT,
            status VARCHAR(20) DEFAULT 'Completed'
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS inventory_audit_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audit_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            system_stock FLOAT DEFAULT 0,
            actual_stock FLOAT DEFAULT 0,
            discrepancy FLOAT DEFAULT 0,
            FOREIGN KEY (audit_id) REFERENCES inventory_audit(id) ON DELETE CASCADE
        )"
    ).execute(pool).await?;

    // 6. Inventory Conversion table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS inventory_conversion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            source_product_id INTEGER NOT NULL,
            dest_product_id INTEGER NOT NULL,
            source_qty FLOAT NOT NULL,
            multiplier FLOAT NOT NULL,
            dest_qty_expected FLOAT NOT NULL,
            dest_qty_actual FLOAT NOT NULL,
            cost_price_at_conversion FLOAT DEFAULT NULL,
            user_id INTEGER DEFAULT NULL,
            note TEXT
        )"
    ).execute(pool).await?;

    Ok(())
}
