import os
import re
import json

frontend_dir = r"e:\vibe\LyangPOS\LyangPOS - Copy\frontend\src"
api_regex = re.compile(r"['\"`](/api/[a-zA-Z0-9_\-/:?&=%]+)['\"`]")

endpoints = {}

for root, _, files in os.walk(frontend_dir):
    for f in files:
        if f.endswith(('.jsx', '.js', '.vue', '.ts', '.tsx')):
            filepath = os.path.join(root, f)
            relpath = os.path.relpath(filepath, frontend_dir)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                matches = api_regex.findall(content)
                for m in matches:
                    clean_m = m.split('?')[0] # remove query params
                    # normalize dynamic ids like /api/orders/123 -> /api/orders/:id
                    if clean_m not in endpoints:
                        endpoints[clean_m] = []
                    endpoints[clean_m].append(relpath)

rust_main = r"e:\vibe\LyangPOS\LyangPOS - Copy\backend-rust\src\main.rs"
with open(rust_main, 'r', encoding='utf-8') as f:
    rust_content = f.read()

# Also scan all route files in backend-rust/src/routes/
rust_routes_dir = r"e:\vibe\LyangPOS\LyangPOS - Copy\backend-rust\src\routes"
all_rust_code = rust_content
for root, _, files in os.walk(rust_routes_dir):
    for f in files:
        if f.endswith('.rs'):
            with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as rf:
                all_rust_code += "\n" + rf.read()

missing = []
found = []

for ep in sorted(endpoints.keys()):
    files = sorted(list(set(endpoints[ep])))
    # Check if exact path or subpath exists in rust router
    # e.g., /api/products or products
    last_seg = ep.replace("/api/", "")
    is_in_rust = False
    if f'"{ep}"' in all_rust_code or f'"{last_seg}"' in all_rust_code or f'"/{last_seg}"' in all_rust_code:
        is_in_rust = True
    elif ep.startswith("/api/orders/") or ep.startswith("/api/products/") or ep.startswith("/api/partners/") or ep.startswith("/api/categories/"):
        is_in_rust = True
    
    if is_in_rust:
        found.append((ep, files))
    else:
        missing.append((ep, files))

print(f"=== TONG HOP SCAN: {len(endpoints)} APIS FRONTEND GOI ===")
print(f"--> DA CO TRONG RUST: {len(found)}")
print(f"--> CHUA CO HOAC THIEU ROUTE CHINH XAC TRONG RUST: {len(missing)}\n")

print("================= DANH SACH API CHUA CO / CON THIEU TRONG RUST =================")
for ep, flist in missing:
    print(f"[-] {ep}")
    print(f"    Goi tu: {', '.join(flist[:3])}")
