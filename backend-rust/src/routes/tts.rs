use axum::{
    extract::Query,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use md5::{Digest, Md5};
use serde::Deserialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Deserialize)]
pub struct TtsParams {
    pub text: Option<String>,
    pub voice: Option<String>,
    pub rate: Option<String>,
    pub pitch: Option<String>,
}

fn remove_accents(input: &str) -> String {
    let mut output = String::new();
    for c in input.chars() {
        let mapped = match c {
            'a' | 'á' | 'à' | 'ả' | 'ã' | 'ạ' | 'ă' | 'ắ' | 'ằ' | 'ẳ' | 'ẵ' | 'ặ' | 'â' | 'ấ' | 'ầ' | 'ẩ' | 'ẫ' | 'ậ' => 'a',
            'A' | 'Á' | 'À' | 'Ả' | 'Ã' | 'Ạ' | 'Ă' | 'Ắ' | 'Ằ' | 'Ẳ' | 'Ẵ' | 'Ặ' | 'Â' | 'Ấ' | 'Ầ' | 'Ẩ' | 'Ẫ' | 'Ậ' => 'a',
            'd' | 'đ' => 'd',
            'D' | 'Đ' => 'd',
            'e' | 'é' | 'è' | 'ẻ' | 'ẽ' | 'ẹ' | 'ê' | 'ế' | 'ề' | 'ể' | 'ễ' | 'ệ' => 'e',
            'E' | 'É' | 'È' | 'Ẻ' | 'Ẽ' | 'Ẹ' | 'Ê' | 'Ế' | 'Ề' | 'Ể' | 'Ễ' | 'Ệ' => 'e',
            'i' | 'í' | 'ì' | 'ỉ' | 'ĩ' | 'ị' => 'i',
            'I' | 'Í' | 'Ì' | 'Ỉ' | 'Ĩ' | 'Ị' => 'i',
            'o' | 'ó' | 'ò' | 'ỏ' | 'õ' | 'ọ' | 'ô' | 'ố' | 'ồ' | 'ổ' | 'ỗ' | 'ộ' | 'ơ' | 'ớ' | 'ờ' | 'ở' | 'ỡ' | 'ợ' => 'o',
            'O' | 'Ó' | 'Ò' | 'Ỏ' | 'Õ' | 'Ọ' | 'Ô' | 'Ố' | 'Ồ' | 'Ổ' | 'Ỗ' | 'Ộ' | 'Ơ' | 'Ớ' | 'Ờ' | 'Ở' | 'Ỡ' | 'Ợ' => 'o',
            'u' | 'ú' | 'ù' | 'ủ' | 'ũ' | 'ụ' | 'ư' | 'ứ' | 'ừ' | 'ử' | 'ữ' | 'ự' => 'u',
            'U' | 'Ú' | 'Ù' | 'Ủ' | 'Ũ' | 'Ụ' | 'Ư' | 'Ứ' | 'Ừ' | 'Ử' | 'Ữ' | 'Ự' => 'u',
            'y' | 'ý' | 'ỳ' | 'ỷ' | 'ỹ' | 'ỵ' => 'y',
            'Y' | 'Ý' | 'Ỳ' | 'Ỷ' | 'Ỹ' | 'Ỵ' => 'y',
            other => other,
        };
        output.push(mapped);
    }
    output
}

fn resolve_tts_dir() -> PathBuf {
    let mut dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    if dir.ends_with("backend-rust") {
        dir.pop();
    }
    dir.push("tts_cache");
    let _ = std::fs::create_dir_all(&dir);
    dir
}

pub async fn get_tts(Query(params): Query<TtsParams>) -> impl IntoResponse {
    let text = match params.text {
        Some(ref t) if !t.trim().is_empty() => t.trim(),
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({"error": "Text parameter is required"})),
            )
                .into_response()
        }
    };

    let voice_type = params.voice.unwrap_or_else(|| "edge-vi-female".to_string());
    let voice_suffix = if voice_type.to_lowercase().contains("male") && !voice_type.to_lowercase().contains("female") {
        "nam"
    } else {
        "nu"
    };

    let clean = remove_accents(text);
    let mut safe_slug = String::new();
    for c in clean.chars() {
        if c.is_alphanumeric() {
            safe_slug.push(c.to_ascii_lowercase());
        } else if !safe_slug.ends_with('_') {
            safe_slug.push('_');
        }
    }
    let safe_slug = safe_slug.trim_matches('_');
    let safe_slug = if safe_slug.is_empty() { "am_thanh" } else { safe_slug };
    let safe_slug = if safe_slug.len() > 50 { &safe_slug[..50] } else { safe_slug };

    let human_readable_name = format!("{}_{}.mp3", safe_slug, voice_suffix);

    let tts_dir = resolve_tts_dir();
    let cache_dirs = [
        tts_dir.clone(),
        PathBuf::from("tts_cache"),
        PathBuf::from("../tts_cache"),
        PathBuf::from("storage/tts_cache"),
        PathBuf::from("../storage/tts_cache"),
    ];

    let mut found_path: Option<PathBuf> = None;

    let mut hasher = Md5::new();
    hasher.update(format!("{}_{}", text, voice_suffix).as_bytes());
    let hash_primary = format!("{:x}", hasher.finalize());
    let hash_tts = format!("tts_{}_{}.mp3", hash_primary, voice_suffix);

    let candidates = [
        human_readable_name.clone(),
        format!("{}_{}.mp3", safe_slug, voice_suffix),
        format!("{}.mp3", safe_slug),
        hash_tts,
    ];

    for dir in &cache_dirs {
        for cand in &candidates {
            let p = dir.join(cand);
            if p.exists() && std::fs::metadata(&p).map(|m| m.len() >= 100).unwrap_or(false) {
                found_path = Some(p);
                break;
            }
        }
        if found_path.is_some() {
            break;
        }
    }

    if let Some(path) = found_path {
        match tokio::fs::read(&path).await {
            Ok(bytes) => {
                let mut headers = HeaderMap::new();
                headers.insert(header::CONTENT_TYPE, "audio/mpeg".parse().unwrap());
                headers.insert(header::CACHE_CONTROL, "public, max-age=86400".parse().unwrap());
                headers.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*".parse().unwrap());
                return (StatusCode::OK, headers, bytes).into_response();
            }
            Err(e) => {
                tracing::error!("Failed to read TTS audio cache file: {:?}", e);
            }
        }
    }

    let target_file = tts_dir.join(&human_readable_name);

    let edge_voice = if voice_suffix == "nam" {
        "vi-VN-NamMinhNeural"
    } else {
        "vi-VN-HoaiMyNeural"
    };

    let rate_str = params.rate.unwrap_or_else(|| "+0%".to_string());
    let pitch_str = params.pitch.unwrap_or_else(|| "+0Hz".to_string());

    // 1. Try Python edge-tts if installed in environment
    let python_candidates = [
        PathBuf::from(r"..\.venv\Scripts\python.exe"),
        PathBuf::from(r".venv\Scripts\python.exe"),
        PathBuf::from("python"),
    ];

    let py_cmd = format!(
        "import edge_tts, asyncio; asyncio.run(edge_tts.Communicate('''{}''', '{}', rate='{}', pitch='{}').save(r'{}'))",
        text.replace('\'', "\\'"),
        edge_voice,
        rate_str,
        pitch_str,
        target_file.display()
    );

    for py in &python_candidates {
        let output = tokio::process::Command::new(py)
            .args(["-c", &py_cmd])
            .output()
            .await;

        if let Ok(res) = output {
            if res.status.success() && target_file.exists() {
                if let Ok(bytes) = tokio::fs::read(&target_file).await {
                    let mut headers = HeaderMap::new();
                    headers.insert(header::CONTENT_TYPE, "audio/mpeg".parse().unwrap());
                    headers.insert(header::CACHE_CONTROL, "public, max-age=86400".parse().unwrap());
                    headers.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*".parse().unwrap());
                    return (StatusCode::OK, headers, bytes).into_response();
                }
            }
        }
    }

    // 2. Native Fallback directly in Rust: Google Translate TTS API (No Python required!)
    let google_url = format!(
        "https://translate.google.com/translate_tts?ie=UTF-8&q={}&tl=vi&client=tw-ob",
        urlencoding_encode(text)
    );

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build();

    if let Ok(client) = client {
        if let Ok(resp) = client.get(&google_url).send().await {
            if resp.status().is_success() {
                if let Ok(bytes) = resp.bytes().await {
                    if bytes.len() >= 100 {
                        let _ = tokio::fs::write(&target_file, &bytes).await;
                        let mut headers = HeaderMap::new();
                        headers.insert(header::CONTENT_TYPE, "audio/mpeg".parse().unwrap());
                        headers.insert(header::CACHE_CONTROL, "public, max-age=86400".parse().unwrap());
                        headers.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*".parse().unwrap());
                        return (StatusCode::OK, headers, bytes).into_response();
                    }
                }
            }
        }
    }

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "audio/mpeg")],
        vec![],
    )
        .into_response()
}

fn urlencoding_encode(s: &str) -> String {
    let mut out = String::new();
    for b in s.as_bytes() {
        match *b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(*b as char);
            }
            _ => {
                out.push_str(&format!("%{:02X}", b));
            }
        }
    }
    out
}
