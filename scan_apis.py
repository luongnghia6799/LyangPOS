import glob
import re

frontend_files = glob.glob('frontend/src/**/*.jsx', recursive=True) + glob.glob('frontend/src/**/*.js', recursive=True)
api_calls = set()
for f in frontend_files:
    with open(f, encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
        matches = re.findall(r'[\'\`\"](/api/[a-zA-Z0-9_\-\/\:\?=\&]+)[\'\`\"]', content)
        for m in matches:
            clean = m.split('?')[0].split('${')[0]
            clean = re.sub(r'/[0-9]+', '/:id', clean)
            clean = clean.rstrip('/')
            if len(clean) > 5:
                api_calls.add(clean)

with open('backend-rust/src/main.rs', encoding='utf-8') as fp:
    rust_main = fp.read()

rust_routes = set(re.findall(r'\.route\("(/api/[^"]+)"', rust_main))

print("=== FRONTEND API ENDPOINTS ===")
missing = []
for ep in sorted(api_calls):
    # Check if matched or parameterized match
    pattern_matched = False
    for rr in rust_routes:
        if ep == rr or ep.startswith(rr.split('/:')[0]):
            pattern_matched = True
            break
    status = "OK" if pattern_matched else "MISSING IN RUST"
    if not pattern_matched:
        missing.append(ep)
    print(f"{status:15} {ep}")

print("\n=== SUMMARY ===")
print(f"Total frontend endpoints: {len(api_calls)}")
print(f"Missing in Rust: {len(missing)}")
for m in missing:
    print(f" - {m}")
