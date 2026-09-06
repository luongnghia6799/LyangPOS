#[cfg(test)]
mod tests {
    use backend_rust::utils::{normalize_date_sqlite, remove_accents};

    #[test]
    fn test_remove_accents() {
        assert_eq!(remove_accents("Thuốc trừ sâu"), "thuoc tru sau");
        assert_eq!(remove_accents("LƯƠNG TRỌNG NGHĨA"), "luong trong nghia");
        assert_eq!(remove_accents("Đồng Tháp"), "dong thap");
        assert_eq!(remove_accents("CANXIBO GA3"), "canxibo ga3");
    }

    #[test]
    fn test_normalize_date() {
        assert_eq!(normalize_date_sqlite("26/02/2026"), "2026-02-26");
        assert_eq!(normalize_date_sqlite("5/3/26"), "2026-03-05");
        assert_eq!(normalize_date_sqlite("2026-05-10"), "2026-05-10");
        assert_eq!(normalize_date_sqlite(""), "9999-12-31");
    }

    #[test]
    fn test_fifo_profit_calculation_logic() {
        // Giả lập 2 lô hàng nhập: Lô 1 (10 cái giá 50k), Lô 2 (20 cái giá 60k)
        let mut batch1_qty: f64 = 10.0;
        let batch1_cost: f64 = 50_000.0;
        let mut batch2_qty: f64 = 20.0;
        let batch2_cost: f64 = 60_000.0;

        // Bán 15 cái giá 80k:
        // Cần lấy: 10 cái từ Lô 1 (cost 50k) + 5 cái từ Lô 2 (cost 60k)
        let sale_qty: f64 = 15.0;
        let sale_price: f64 = 80_000.0;

        let mut rem: f64 = sale_qty;
        let mut total_cost: f64 = 0.0;

        // Lấy từ batch 1
        let take1: f64 = rem.min(batch1_qty);
        batch1_qty -= take1;
        total_cost += take1 * batch1_cost;
        rem -= take1;

        // Lấy từ batch 2
        let take2: f64 = rem.min(batch2_qty);
        batch2_qty -= take2;
        total_cost += take2 * batch2_cost;
        rem -= take2;

        assert_eq!(rem, 0.0);
        assert_eq!(batch1_qty, 0.0);
        assert_eq!(batch2_qty, 15.0);

        // Tổng giá vốn: 10 * 50k + 5 * 60k = 500k + 300k = 800k
        assert_eq!(total_cost, 800_000.0);

        // Giá vốn bình quân đơn hàng: 800k / 15 = 53,333.33
        let avg_cost: f64 = total_cost / sale_qty;
        assert_eq!((avg_cost * 100.0).round() / 100.0, 53333.33);

        // Doanh thu: 15 * 80k = 1,200k
        let revenue: f64 = sale_qty * sale_price;
        assert_eq!(revenue, 1_200_000.0);

        // Lợi nhuận: 1,200k - 800k = 400k
        let profit: f64 = revenue - total_cost;
        assert_eq!(profit, 400_000.0);
    }

    #[test]
    fn test_inventory_conversion_unit_cost_calculation() {
        // Xẻ lẻ 1 bao phân 50kg (giá vốn bao = 500,000) thành 50 túi 1kg
        let source_qty: f64 = 1.0;
        let source_cost: f64 = 500_000.0;
        let dest_actual_qty: f64 = 48.0; // Hao hụt 2kg, thực nhận 48 túi

        let total_source_cost = source_qty * source_cost;
        assert_eq!(total_source_cost, 500_000.0);

        // Giá vốn mới của 1 túi lẻ sau hao hụt = 500,000 / 48 = 10,416.67
        let new_dest_cost = total_source_cost / dest_actual_qty;
        assert_eq!((new_dest_cost * 100.0).round() / 100.0, 10416.67);
    }

    #[test]
    fn test_inventory_audit_discrepancy_logic() {
        let system_stock: f64 = 100.0;
        let actual_stock_surplus: f64 = 105.0; // Thừa 5 cái
        let actual_stock_deficit: f64 = 92.0;  // Hụt 8 cái

        let discrepancy_surplus = actual_stock_surplus - system_stock;
        assert_eq!(discrepancy_surplus, 5.0);

        let discrepancy_deficit = actual_stock_deficit - system_stock;
        assert_eq!(discrepancy_deficit, -8.0);
    }

    #[test]
    fn test_remote_scan_queue_fifo_processing() {
        let mut queue: Vec<(&str, bool)> = vec![
            ("893001", false),
            ("893002", false),
            ("893003", false),
        ];

        // Pop earliest unprocessed scan
        let first_unprocessed = queue.iter_mut().find(|x| !x.1);
        assert!(first_unprocessed.is_some());
        let item = first_unprocessed.unwrap();
        assert_eq!(item.0, "893001");
        item.1 = true;

        // Pop next
        let second_unprocessed = queue.iter_mut().find(|x| !x.1);
        assert!(second_unprocessed.is_some());
        let item2 = second_unprocessed.unwrap();
        assert_eq!(item2.0, "893002");
        item2.1 = true;

        // Remaining
        let remaining: Vec<&str> = queue.iter().filter(|x| !x.1).map(|x| x.0).collect();
        assert_eq!(remaining, vec!["893003"]);
    }

    #[test]
    fn test_daily_invoices_uninvoiced_amount_calculation() {
        let total_item_amount: f64 = 1_500_000.0;
        let invoiced_quantity: f64 = 3.0;
        let total_quantity: f64 = 5.0;
        let unit_price: f64 = 300_000.0;

        let invoiced_amount: f64 = invoiced_quantity * unit_price;
        let uninvoiced_amount: f64 = (total_item_amount - invoiced_amount).max(0.0);

        assert_eq!(invoiced_amount, 900_000.0);
        assert_eq!(uninvoiced_amount, 600_000.0);
        let is_fully_invoiced = invoiced_quantity >= total_quantity;
        assert_eq!(is_fully_invoiced, false);
    }
}
