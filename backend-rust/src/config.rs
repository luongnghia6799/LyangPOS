use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub port: u16,
    pub host: String,
    pub database_url: String,
    pub uploads_dir: PathBuf,
}

impl AppConfig {
    pub fn load() -> Self {
        dotenvy::dotenv().ok();

        let args: Vec<String> = std::env::args().collect();
        
        // 1. Resolve Port: --port <num> or LYANG_PORT or PORT or Default 3579
        let mut cli_port = None;
        let mut cli_db = None;
        let mut i = 0;
        while i < args.len() {
            if args[i] == "--port" && i + 1 < args.len() {
                cli_port = args[i + 1].parse::<u16>().ok();
                i += 1;
            } else if args[i] == "--db" && i + 1 < args.len() {
                cli_db = Some(args[i + 1].clone());
                i += 1;
            }
            i += 1;
        }

        let port = cli_port
            .or_else(|| std::env::var("LYANG_PORT").ok().and_then(|p| p.parse().ok()))
            .or_else(|| std::env::var("PORT").ok().and_then(|p| p.parse().ok()))
            .unwrap_or(3579);

        let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());

        // 2. Resolve Database: --db <name> or DATABASE_URL or LYANG_DB or easypos.db
        let database_url = if let Some(db_name) = cli_db {
            let mut db_path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            if db_path.ends_with("backend-rust") {
                db_path.pop();
            }
            db_path.push(db_name);
            format!("sqlite://{}", db_path.display())
        } else if let Ok(url) = std::env::var("DATABASE_URL") {
            url
        } else {
            let db_name = std::env::var("LYANG_DB").unwrap_or_else(|_| "easypos.db".to_string());
            let mut db_path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            if db_path.ends_with("backend-rust") {
                db_path.pop();
            }
            db_path.push(db_name);
            format!("sqlite://{}", db_path.display())
        };

        let mut uploads_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        if uploads_dir.ends_with("backend-rust") {
            uploads_dir.pop();
        }
        uploads_dir.push("uploads");

        Self {
            port,
            host,
            database_url,
            uploads_dir,
        }
    }
}

