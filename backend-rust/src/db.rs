use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{Row, SqlitePool};
use std::str::FromStr;
use std::time::Duration;

pub async fn create_pool(database_url: &str) -> anyhow::Result<SqlitePool> {
    let options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .busy_timeout(Duration::from_secs(10))
        .pragma("wal_autocheckpoint", "100")
        .pragma("temp_store", "MEMORY")
        .pragma("cache_size", "-20000");

    let pool = SqlitePoolOptions::new()
        .max_connections(50)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(15))
        .idle_timeout(Duration::from_secs(60))
        .connect_with(options)
        .await?;

    ensure_schema(&pool).await?;

    tracing::info!("SQLite connection pool initialized successfully (WAL mode optimized, low threshold checkpoint)");
    Ok(pool)
}


async fn ensure_schema(pool: &SqlitePool) -> anyhow::Result<()> {
    // 0. Tạo tất cả các bảng cốt lõi nếu là database mới tinh
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            display_name VARCHAR(100),
            role VARCHAR(20) DEFAULT 'User',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            icon VARCHAR(50)
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50),
            unit VARCHAR(20),
            secondary_unit VARCHAR(20),
            multiplier FLOAT DEFAULT 1,
            cost_price FLOAT DEFAULT 0,
            sale_price FLOAT DEFAULT 0,
            stock FLOAT DEFAULT 0,
            expiry_date VARCHAR(50),
            active_ingredient VARCHAR(255),
            brand VARCHAR(100),
            is_combo BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            latest_audit DATETIME,
            category_id INTEGER,
            accounting_price FLOAT DEFAULT 0,
            accounting_stock FLOAT DEFAULT 0,
            latest_cost_price FLOAT DEFAULT 0,
            bulk_quantity FLOAT,
            bulk_price FLOAT,
            alias VARCHAR(100),
            min_stock FLOAT DEFAULT 0
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS combo_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            combo_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity FLOAT NOT NULL
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS partner (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) DEFAULT 'Customer',
            is_customer BOOLEAN DEFAULT 1,
            is_supplier BOOLEAN DEFAULT 0,
            cccd VARCHAR(20),
            phone VARCHAR(20),
            address VARCHAR(200),
            debt_balance FLOAT DEFAULT 0
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS cash_voucher (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            partner_id INTEGER,
            amount FLOAT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            note VARCHAR(500),
            type VARCHAR(50) DEFAULT 'Payment',
            source VARCHAR(50) DEFAULT 'manual',
            order_id INTEGER
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS \"order\" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            partner_id INTEGER,
            total_amount FLOAT DEFAULT 0,
            payment_method VARCHAR(50),
            type VARCHAR(20),
            note VARCHAR(500),
            amount_paid FLOAT DEFAULT 0,
            old_debt FLOAT DEFAULT 0,
            display_id VARCHAR(50),
            status VARCHAR(20) DEFAULT 'Pending',
            shipping_status VARCHAR(20),
            shipping_address VARCHAR(500),
            shipping_phone VARCHAR(50),
            delivery_date DATETIME,
            cash_given FLOAT DEFAULT 0,
            created_by VARCHAR(100),
            is_duplicate_checked BOOLEAN DEFAULT 0,
            is_consignment BOOLEAN DEFAULT 0,
            is_invoiced BOOLEAN DEFAULT 0,
            invoice_no VARCHAR(100),
            invoice_date DATETIME,
            invoice_note VARCHAR(500)
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS order_detail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity FLOAT NOT NULL,
            price FLOAT NOT NULL,
            product_name_override VARCHAR(200),
            shipped_quantity FLOAT DEFAULT 0,
            cost_price FLOAT,
            is_invoiced BOOLEAN DEFAULT 0,
            invoiced_quantity FLOAT DEFAULT 0,
            invoice_no VARCHAR(100)
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS bank_account (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bank_name VARCHAR(100) NOT NULL,
            account_number VARCHAR(50) NOT NULL,
            account_holder VARCHAR(100) NOT NULL,
            current_balance FLOAT DEFAULT 0,
            is_active BOOLEAN DEFAULT 1
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS bank_transaction (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            transaction_type VARCHAR(20) NOT NULL,
            amount FLOAT NOT NULL,
            balance_after FLOAT DEFAULT 0,
            transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            reference_type VARCHAR(50),
            reference_id INTEGER,
            note TEXT
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS setting (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(100) UNIQUE NOT NULL,
            value TEXT NOT NULL
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS print_template (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            module VARCHAR(50) DEFAULT 'Sale',
            paper_size VARCHAR(20) DEFAULT 'K80',
            content TEXT NOT NULL,
            is_default BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            event_type VARCHAR(50) DEFAULT 'General',
            scheduled_date DATETIME,
            status VARCHAR(20) DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS event_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            partner_id INTEGER,
            status VARCHAR(20) DEFAULT 'Pending',
            note TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ).execute(pool).await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS custom_price (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            partner_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            custom_price FLOAT NOT NULL
        )"
    ).execute(pool).await?;

    // Tự tạo tài khoản Admin mặc định nếu chưa có tài khoản nào
    let user_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM user")
        .fetch_one(pool)
        .await
        .unwrap_or(0);
    if user_count == 0 {
        let default_hash = bcrypt::hash("123456", 4).unwrap_or_else(|_| "$2b$04$default".to_string());
        let _ = sqlx::query(
            "INSERT INTO user (username, password_hash, display_name, role) VALUES ('admin', ?, 'Quản Trị Viên', 'Admin')"
        )
        .bind(&default_hash)
        .execute(pool)
        .await;
        tracing::info!("Created default admin account (username: admin, pass: 123456)");
    }

    // 1. Product table migration
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
