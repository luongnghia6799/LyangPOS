#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(non_snake_case)]

mod config;
mod db;
mod error;
mod models;
mod routes;
mod utils;


use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize structured logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend_rust=debug,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::AppConfig::load();
    tracing::info!("Starting LyangPOS Rust Backend on {}:{}", config.host, config.port);
    tracing::info!("Target database: {}", config.database_url);

    // Initialize Database Pool
    let pool = db::create_pool(&config.database_url).await?;

    // Start auto-backup background service (Rolling 5 latest backups)
    routes::backup::start_auto_backup_task(pool.clone());

    // Configure CORS for local UI and remote mobile devices
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Ensure uploads & backups directories exist
    if !config.uploads_dir.exists() {
        let _ = std::fs::create_dir_all(&config.uploads_dir);
    }
    let _ = routes::backup::resolve_backup_dir();


    // Initialize In-Memory States for POS Mirror & Packing
    let (pos_terminals_state, packing_sync_state) = routes::pos::init_pos_state();

    let pos_router = Router::new()
        .route("/api/pos/terminals", get(routes::pos::get_pos_terminals))
        .route("/api/pos/terminals/:terminal_id", axum::routing::delete(routes::pos::delete_pos_terminal))
        .route("/api/pos/terminals/clear", post(routes::pos::clear_all_pos_terminals).delete(routes::pos::clear_all_pos_terminals))
        .route("/api/pos/terminal-state", post(routes::pos::update_pos_terminal_state))
        .route("/api/pos/terminal-state/edit-cart", post(routes::pos::edit_pos_terminal_cart))
        .route("/api/pos/terminal-state/action", post(routes::pos::trigger_pos_terminal_action))
        .route("/api/packing/sync", get(routes::pos::get_packing_sync).post(routes::pos::update_packing_sync))
        .with_state((pos_terminals_state, packing_sync_state));

    // Build application router
    let app = Router::new()
        // TTS Text-to-Speech Endpoint
        .route("/api/tts", get(routes::tts::get_tts))
        // System & Maintenance endpoints
        .route("/api/ping", get(routes::system::ping))
        .route("/api/heartbeat", post(routes::system::heartbeat))
        .route("/api/db-stats", get(routes::system::db_stats))
        .route("/api/optimize-db", post(routes::system::optimize_db))
        .route("/api/clean-ram", post(routes::system::clean_ram))
        .route("/api/settings/repair-backend", post(routes::system::repair_backend))
        .route("/api/shutdown", post(routes::system::shutdown))
        .route("/api/weather", get(routes::system::get_weather))
        .route("/api/fonts", get(routes::system::list_fonts))
        .route("/api/upload-logo", post(routes::system::upload_logo).layer(DefaultBodyLimit::max(50 * 1024 * 1024)))
        .route("/api/normalize-uom", post(routes::system::normalize_uom_endpoint))
        .route("/api/history/active-filters", get(routes::system::get_history_active_filters))
        .route("/api/tauri/save-and-open", post(routes::system::save_and_open_tauri))
        .route("/api/open-external-chrome", post(routes::system::open_external_chrome))
        .route("/api/purchase/scan-invoice", post(routes::system::scan_purchase_invoice))
        // Backup, Restore & Reset Database
        .route("/api/backup", get(routes::backup::download_backup))
        .route(
            "/api/restore",
            post(routes::backup::restore_backup).layer(DefaultBodyLimit::max(500 * 1024 * 1024)),
        )
        .route("/api/reset-database", post(routes::backup::reset_database))
        // LAN Multi-device & Remote Scans
        .route("/api/active-devices", get(routes::lan::get_active_devices))
        .route("/api/ip", get(routes::lan::get_ip_info))
        .route("/api/network/unlock-firewall", post(routes::lan::unlock_firewall))
        .route("/api/remote-scans", post(routes::lan::add_remote_scan))
        .route("/api/remote-scans/pop", get(routes::lan::pop_remote_scan))
        // Customer Care Events & Logs
        .route("/api/events", get(routes::event::get_events).post(routes::event::create_event))
        .route(
            "/api/events/:id",
            axum::routing::put(routes::event::update_event).delete(routes::event::delete_event),
        )
        .route("/api/event-logs", get(routes::event::get_event_logs))
        .route("/api/event-logs/toggle", post(routes::event::toggle_event_log))
        // Accounting Invoices & Config
        .route("/api/accounting/source-fields", get(routes::accounting::get_accounting_source_fields))
        .route("/api/accounting/templates", get(routes::accounting::get_accounting_templates))
        .route(
            "/api/accounting/config",
            get(routes::accounting::handle_accounting_config_get)
                .post(routes::accounting::handle_accounting_config_post),
        )
        .route("/api/accounting/daily-invoices", get(routes::accounting::get_daily_invoices))
        .route(
            "/api/accounting/orders/:id/invoice-status",
            post(routes::accounting::update_order_invoice_status),
        )
        .route(
            "/api/accounting/order-details/:id/invoice-status",
            post(routes::accounting::update_order_detail_invoice_status),
        )
        .route(
            "/api/accounting/partners/bulk-batch-invoice",
            post(routes::accounting::bulk_batch_invoice_partners),
        )
        .route(
            "/api/accounting/partners/:id/update-items-invoice",
            post(routes::accounting::update_partner_items_invoice),
        )
        // Reports & Dashboard KPIs & Analytics
        .route("/api/dashboard-stats", get(routes::report::get_dashboard_stats))
        .route("/api/reports/kpis", get(routes::report::get_report_kpis))
        .route("/api/reports/sales-chart", get(routes::report::get_report_sales_chart))
        .route("/api/reports/purchase-chart", get(routes::report::get_report_purchase_chart))
        .route("/api/reports/product-sales", get(routes::report::get_report_product_sales))
        .route("/api/reports/partner-sales", get(routes::report::get_report_partner_sales))
        .route("/api/reports/inventory-flow", get(routes::report::get_report_inventory_flow))
        .route("/api/reports/brands", get(routes::report::get_report_brands))
        .route("/api/reports/purchase-sales", get(routes::report::get_report_purchase_sales))
        .route("/api/reports/products", get(routes::report::report_products))
        .route("/api/reports/partners", get(routes::report::report_partners))
        .route("/api/reports/product-movement", get(routes::report::report_product_movement))
        .route("/api/reports/synthesis", get(routes::report::report_synthesis))
        .route("/api/reports/unsold", get(routes::report::report_unsold))
        .route("/api/reports/flattened-products", get(routes::report::report_flattened_products))
        // Inventory Audits & Conversions
        .route("/api/inventory/products/search", get(routes::inventory::search_inventory_products))
        .route(
            "/api/inventory/audit",
            post(routes::inventory::create_inventory_audit),
        )
        .route(
            "/api/inventory/audits",
            get(routes::inventory::get_inventory_audits),
        )
        .route(
            "/api/inventory/convert",
            post(routes::inventory::convert_inventory),
        )
        .route(
            "/api/inventory/conversions",
            get(routes::inventory::get_conversions),
        )
        .route(
            "/api/inventory/conversions/:id",
            axum::routing::delete(routes::inventory::delete_conversion),
        )
        // Product extra routes
        .route(
            "/api/products/:id/orders",
            get(routes::product::get_product_orders),
        )
        .route(
            "/api/products/:id/history",
            get(routes::product::get_product_history),
        )
        // Partner extra routes
        .route(
            "/api/partners/:id/quick-debt",
            post(routes::partner::quick_debt),
        )
        .route(
            "/api/partners/:id/recalculate-debt",
            post(routes::partner::recalculate_partner_debt),
        )
        .route(
            "/api/partners/:id/debt-cycles",
            get(routes::partner::get_partner_debt_cycles),
        )
        .route(
            "/api/partners/:id/ledger",
            get(routes::partner::get_partner_ledger),
        )
        // Category endpoints
        .route(
            "/api/categories",
            get(routes::category::get_categories).post(routes::category::create_category),
        )
        .route(
            "/api/categories/:id",
            axum::routing::put(routes::category::update_category)
                .delete(routes::category::delete_category),
        )
        // Product endpoints
        .route(
            "/api/products",
            get(routes::product::get_products).post(routes::product::create_product),
        )
        .route(
            "/api/products/:id",
            axum::routing::put(routes::product::update_product)
                .delete(routes::product::delete_product),
        )
        .route(
            "/api/products/bulk-update",
            post(routes::product::bulk_update_products),
        )
        .route(
            "/api/products/bulk-delete",
            post(routes::product::bulk_delete_products),
        )
        .route("/api/products/brands", get(routes::product::get_brands))
        .route("/api/products/summary", get(routes::product::get_product_summary))
        .route(
            "/api/combos/:id/items",
            get(routes::product::get_combo_items).post(routes::product::set_combo_items),
        )
        // Partner endpoints
        .route(
            "/api/partners",
            get(routes::partner::get_partners).post(routes::partner::create_partner),
        )
        .route(
            "/api/partners/:id",
            axum::routing::put(routes::partner::update_partner)
                .delete(routes::partner::delete_partner),
        )
        .route(
            "/api/partners/:id/fix-opening-balance",
            post(routes::partner::fix_opening_balance),
        )
        .route(
            "/api/custom-prices/:partner_id",
            get(routes::partner::get_custom_prices),
        )
        .route("/api/custom-prices", post(routes::partner::save_custom_price))
        .route("/api/custom-prices/bulk", post(routes::partner::save_custom_prices_bulk))
        .route("/api/custom-prices/cleanup", post(routes::partner::cleanup_custom_prices))
        // Cash Voucher endpoints & Alias
        .route(
            "/api/vouchers",
            get(routes::voucher::get_vouchers).post(routes::voucher::create_voucher),
        )
        .route(
            "/api/cash-vouchers",
            get(routes::voucher::get_vouchers).post(routes::voucher::create_voucher),
        )
        // Order endpoints (POS & Orders)
        .route(
            "/api/orders",
            get(routes::order::get_orders).post(routes::order::create_order),
        )
        .route(
            "/api/orders/duplicates",
            get(routes::order::get_duplicate_orders),
        )
        .route(
            "/api/orders/:id/check-duplicate",
            post(routes::order::check_duplicate_order),
        )
        .route(
            "/api/orders/:id",
            get(routes::order::get_order)
                .put(routes::order::update_order)
                .delete(routes::order::delete_order),
        )
        .route(
            "/api/orders/:id/status",
            axum::routing::patch(routes::order::update_order_status),
        )
        .route(
            "/api/orders/:id/shipping-status",
            axum::routing::patch(routes::order::update_shipping_status),
        )
        .route(
            "/api/order-details/:id/shipped-quantity",
            axum::routing::patch(routes::order::update_detail_shipped_quantity),
        )
        .route(
            "/api/orders/:id/import-consignment",
            post(routes::order::import_consignment),
        )
        .route(
            "/api/vouchers/:id",
            axum::routing::put(routes::voucher::update_voucher)
                .patch(routes::voucher::update_voucher)
                .delete(routes::voucher::delete_voucher),
        )
        // Bank Account & Transaction endpoints
        .route(
            "/api/bank-accounts",
            get(routes::bank::get_bank_accounts).post(routes::bank::create_bank_account),
        )
        .route(
            "/api/bank-accounts/:id",
            axum::routing::put(routes::bank::update_bank_account)
                .delete(routes::bank::delete_bank_account),
        )
        .route(
            "/api/bank-transactions",
            get(routes::bank::get_bank_transactions).post(routes::bank::create_bank_transaction),
        )
        .route(
            "/api/bank-transactions/:id",
            axum::routing::delete(routes::bank::delete_bank_transaction),
        )
        // Settings & Print templates
        .route(
            "/api/settings",
            get(routes::setting::get_settings).post(routes::setting::save_settings),
        )
        .route(
            "/api/print-templates",
            get(routes::setting::get_print_templates).post(routes::setting::create_print_template),
        )
        .route(
            "/api/print-templates/:id",
            axum::routing::put(routes::setting::update_print_template)
                .delete(routes::setting::delete_print_template),
        )
        // Auth / User endpoints
        .route("/api/login", post(routes::auth::login))
        .route("/api/register", post(routes::auth::register))
        .route("/api/users", get(routes::auth::get_users))
        .route(
            "/api/users/:id",
            axum::routing::patch(routes::auth::update_user).delete(routes::auth::delete_user),
        )
        // Serve static uploads
        .nest_service("/uploads", ServeDir::new(&config.uploads_dir))
        .with_state(pool.clone())
        .merge(pos_router)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    tracing::info!("🚀 LyangPOS Rust Backend is actively listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    let pool_shutdown = pool.clone();

    axum::serve(listener, app)
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            tracing::info!("Shutdown signal received. Running WAL checkpoint truncate...");
            let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(&pool_shutdown).await;
            let _ = sqlx::query("PRAGMA optimize;").execute(&pool_shutdown).await;
            tracing::info!("WAL checkpoint completed. Clean exit.");
        })
        .await?;

    // Đảm bảo chạy checkpoint khi kết thúc
    let _ = sqlx::query("PRAGMA wal_checkpoint(TRUNCATE);").execute(&pool).await;

    Ok(())
}

