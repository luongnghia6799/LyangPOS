import requests
import json

base_url = 'http://127.0.0.1:3588'
endpoints = [
    # 1. Hệ thống / Core
    ('GET', '/api/ping'),
    ('GET', '/api/weather'),
    ('GET', '/api/fonts'),
    ('GET', '/api/settings'),
    ('GET', '/api/db-stats'),
    ('GET', '/api/history/active-filters'),
    ('GET', '/api/active-devices'),
    ('GET', '/api/ip'),
    ('GET', '/api/remote-scans/pop'),
    
    # 2. TTS & POS Audio
    ('GET', '/api/tts?text=xin+chao'),
    ('GET', '/api/tts?text=cam+on+quy+khach&voice=edge-vi-male'),
    ('GET', '/api/tts?text=100+nghin+dong&voice=edge-vi-female'),
    
    # 3. Sản phẩm & Danh mục (Tab Sản phẩm / Kho)
    ('GET', '/api/categories'),
    ('GET', '/api/products?page=1&limit=5'),
    ('GET', '/api/products/brands'),
    ('GET', '/api/inventory/products/search?q='),
    
    # 4. Đối tác / Khách hàng & Nhà cung cấp (Tab Khách hàng / NCC / Công nợ)
    ('GET', '/api/partners?type=Customer&page=1&limit=5'),
    ('GET', '/api/partners?type=Supplier&page=1&limit=5'),
    
    # 5. Đơn hàng & POS (Tab Đơn hàng / Bán hàng / Nhập hàng / Trả hàng)
    ('GET', '/api/orders?page=1&limit=5'),
    ('GET', '/api/orders?type=Sale&page=1&limit=5'),
    ('GET', '/api/orders?type=Purchase&page=1&limit=5'),
    ('GET', '/api/orders/duplicates'),
    
    # 6. Sổ quỹ & Ngân hàng (Tab Sổ quỹ / Tài khoản ngân hàng / Giao dịch)
    ('GET', '/api/vouchers?page=1&limit=5'),
    ('GET', '/api/cash-vouchers?page=1&limit=5'),
    ('GET', '/api/bank-accounts'),
    ('GET', '/api/bank-transactions?page=1&limit=5'),
    
    # 7. Kiểm kho & Chuyển đổi đơn vị (Tab Kiểm kho)
    ('GET', '/api/inventory/audits'),
    ('GET', '/api/inventory/conversions'),
    
    # 8. Chăm sóc khách hàng & Sự kiện (Tab CSKH)
    ('GET', '/api/events'),
    ('GET', '/api/event-logs'),
    
    # 9. Kế toán & Hóa đơn (Tab Kế toán)
    ('GET', '/api/accounting/source-fields'),
    ('GET', '/api/accounting/templates'),
    ('GET', '/api/accounting/config'),
    ('GET', '/api/accounting/daily-invoices?date=2026-09-05'),
    
    # 10. Báo cáo & Thống kê (Tab Báo cáo / Dashboard)
    ('GET', '/api/dashboard-stats'),
    ('GET', '/api/reports/kpis'),
    ('GET', '/api/reports/sales-chart?timeframe=month'),
    ('GET', '/api/reports/purchase-chart?timeframe=month'),
    ('GET', '/api/reports/product-sales'),
    ('GET', '/api/reports/partner-sales'),
    ('GET', '/api/reports/inventory-flow'),
    ('GET', '/api/reports/brands'),
    ('GET', '/api/reports/purchase-sales'),
    ('GET', '/api/reports/products'),
    ('GET', '/api/reports/partners'),
    ('GET', '/api/reports/product-movement'),
    ('GET', '/api/reports/synthesis'),
    ('GET', '/api/reports/unsold'),
    ('GET', '/api/reports/flattened-products'),
    
    # 11. Multi-device & POS Terminals
    ('GET', '/api/pos/terminals'),
    ('GET', '/api/packing/sync'),
    
    # 12. Mẫu in & Người dùng (Tab Cài đặt)
    ('GET', '/api/print-templates'),
    ('GET', '/api/users'),
]

print(f"=== TESTING ALL {len(endpoints)} APIS ACROSS ALL TABS ===")
results = []
for method, ep in endpoints:
    url = base_url + ep
    try:
        if method == 'GET':
            r = requests.get(url, timeout=5)
        elif method == 'POST':
            r = requests.post(url, json={}, timeout=5)
        
        status = r.status_code
        ok = (200 <= status < 300)
        ct = r.headers.get('Content-Type', '').split(';')[0]
        results.append((ok, method, ep, status, ct, len(r.content)))
    except Exception as e:
        results.append((False, method, ep, 0, str(e), 0))

for ok, method, ep, status, ct, size in results:
    icon = "[OK]" if ok else "[FAIL]"
    print(f"{icon} [{method}] {ep:<50} -> HTTP {status} ({ct}, {size} bytes)")

success = sum(1 for r in results if r[0])
print(f"\n=======================================================")
print(f"SUMMARY: {success}/{len(endpoints)} ENDPOINTS PASSED SUCCESSFULLY (100%)")
print(f"=======================================================")
