import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

import re
import json

backend_python = r"e:\vibe\LyangPOS\LyangPOS - Copy\backend\app.py"
frontend_dir = r"e:\vibe\LyangPOS\LyangPOS - Copy\frontend\src"
backend_rust_dir = r"e:\vibe\LyangPOS\LyangPOS - Copy\backend-rust\src"

# 1. Quét tất cả routes được định nghĩa trong app.py (Python Backend)
python_routes = []
with open(backend_python, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        match = re.search(r"@app\.route\(\s*['\"]([^'\"]+)['\"](?:,\s*methods=\[([^\]]+)\])?", line)
        if match:
            endpoint = match.group(1)
            methods = match.group(2).replace("'", "").replace('"', '').replace(' ', '') if match.group(2) else "GET"
            python_routes.append((endpoint, methods))

# 2. Quét tất cả API fetch/axios trong Frontend
frontend_calls = set()
api_regex = re.compile(r"['\"`](/api/[a-zA-Z0-9_\-/:?&=%]+)['\"`]")
for root, _, files in os.walk(frontend_dir):
    for f in files:
        if f.endswith(('.jsx', '.js', '.vue', '.ts', '.tsx')):
            with open(os.path.join(root, f), "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                matches = api_regex.findall(content)
                for m in matches:
                    clean_m = m.split('?')[0]
                    frontend_calls.add(clean_m)

# 3. Quét tất cả routes trong Backend Rust
rust_code = ""
for root, _, files in os.walk(backend_rust_dir):
    for f in files:
        if f.endswith('.rs'):
            with open(os.path.join(root, f), "r", encoding="utf-8", errors="ignore") as rf:
                rust_code += "\n" + rf.read()

# Match axum .route("/path", ...)
rust_routes = set(re.findall(r'\.route\(\s*["\']([^"\']+)["\']', rust_code))

print("=========================================================")
print(f"1. TỔNG SỐ ROUTES TRONG PYTHON BACKEND: {len(python_routes)}")
print(f"2. TỔNG SỐ ĐƯỜNG DẪN /api FRONTEND GỌI: {len(frontend_calls)}")
print(f"3. TỔNG SỐ ROUTES ĐÃ ĐĂNG KÝ TRONG RUST: {len(rust_routes)}")
print("=========================================================\n")

# Phân loại:
# A. Routes Frontend CÓ gọi nhưng Rust CHƯA có
missing_in_rust = []
for call in sorted(frontend_calls):
    # normalize dynamic parameters e.g. /api/orders/123 -> matches /api/orders/:id or starts with
    found = False
    for rr in rust_routes:
        # Check matching
        base_rr = re.sub(r':\w+', '[^/]+', rr)
        if re.fullmatch(base_rr, call) or rr == call:
            found = True
            break
        # Also check if it's handled via prefix / sub-routes
        if call.startswith(rr.rstrip('/')) and len(rr) > 5:
            found = True
            break
    if not found:
        missing_in_rust.append(call)

print("A. DANH SÁCH ENDPOINTS FRONTEND GỌI NHƯNG RUST CHƯA KHAI BÁO:")
for ep in missing_in_rust:
    print(f"  ❌ {ep}")

print("\nB. DANH SÁCH TÍNH NĂNG PYTHON CÓ NHƯNG RUST CHƯA PORT:")
python_missing = []
for ep, methods in python_routes:
    found = False
    for rr in rust_routes:
        base_rr = re.sub(r':\w+', '[^/]+', rr)
        base_py = re.sub(r'<[^>]+>', '[^/]+', ep)
        if re.fullmatch(base_rr, ep) or ep == rr or re.fullmatch(base_py, rr):
            found = True
            break
    if not found:
        python_missing.append((ep, methods))

for ep, methods in python_missing:
    print(f"  ⚠️ [{methods}] {ep}")
