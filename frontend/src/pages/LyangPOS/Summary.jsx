import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomSelect from '../../components/CustomSelect';
import {
    Droplets, Wheat, Coins, Leaf, Sprout, BarChart3, Tag, ShoppingBag,
    Calendar, FileText, Search, RefreshCw, Printer, AlertCircle, Package,
    ArrowUpRight, ArrowDownRight, Filter, Download, ChevronLeft, ChevronRight,
    CreditCard, Users, X
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import OrderEditPopup from '../../components/OrderEditPopup';
import Toast from '../../components/Toast';
import Portal from '../../components/Portal';
import CustomDatePicker from '../../components/CustomDatePicker';

const getTodayStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden",
            active
                ? 'text-white'
                : 'text-[#8b6f47] dark:text-[#d4a574]/60 hover:text-[#2d5016] dark:hover:text-[#d4a574] hover:bg-primary/10'
        )}
    >
        {active && (
            <m.div
                layoutId="summaryTabIndicator"
                className="absolute inset-0 bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            {icon}
            {label}
        </span>
    </button>
);

const KPICard = ({ title, value, isMoney = true, icon }) => (
    <m.div
        whileHover={{ y: -1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
            "relative group overflow-hidden rounded-2xl px-3.5 py-2 border border-border/80 pos-card transition-all duration-300 bg-white/40 dark:bg-slate-900/40 flex items-center gap-2.5 shadow-sm"
        )}
    >
        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary shrink-0">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-[8.5px] font-black uppercase tracking-[0.12em] text-muted truncate leading-none mb-1">{title}</h3>
            <div className="text-sm font-black tracking-tight flex items-baseline gap-0.5 text-foreground leading-none truncate">
                {isMoney ? (Number(value) || 0).toLocaleString() : value}
                {isMoney && <span className="text-[9px] font-bold opacity-60">₫</span>}
            </div>
        </div>
    </m.div>
);


const Summary = () => {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('summary_activeTab') || 'transactions');
    const [editingOrder, setEditingOrder] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        localStorage.setItem('summary_activeTab', activeTab);
    }, [activeTab]);

    const handleEditOrder = async (item) => {
        if (!item) return;
        const idToCheck = item.display_id || item.ref_id || '';
        const isVoucher = item.isVoucher || item.category === 'Voucher' || (idToCheck.startsWith('PT-')) || (idToCheck.startsWith('PC-'));

        if (isVoucher) {
            setToast({ message: `Đây là phiếu thu/chi (${idToCheck}). Vui lòng xem chi tiết tại tab Sổ Quỹ.`, type: 'info' });
            return;
        }

        let orderToEdit = item;
        const displayId = idToCheck;

        if ((!item.details || !Array.isArray(item.details)) && displayId) {
            try {
                const searchId = displayId.replace('#', '');
                const res = await axios.get(`/api/orders`, { params: { search_id: searchId } });
                const found = Array.isArray(res.data) ? res.data.find(o => o.display_id === displayId) : (res.data.items || []).find(o => o.display_id === displayId);
                if (found) orderToEdit = found;
            } catch (err) {
                console.error("Error fetching order details:", err);
            }
        }
        if (orderToEdit) setEditingOrder(orderToEdit);
    };

    return (
        <div className="pt-2 px-4 pb-2 w-full transition-colors h-[calc(100vh-30px)] overflow-hidden flex flex-col font-sans relative">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="no-print space-y-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 relative z-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3 pt-2 pb-0.5 leading-relaxed">
                                <FileText className="text-primary" size={32} />
                                SỔ GIAO DỊCH & ĐỐI SOÁT
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg tracking-tighter">LyangPOS by Lyang</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Theo dõi dòng tiền, công nợ đối tác và nhật ký kho hàng</p>
                            </div>
                        </div>
                        <div className="flex p-1.5 bg-transparent border border-border rounded-2xl relative self-stretch xl:self-auto overflow-x-auto no-scrollbar">
                            <TabButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<FileText className="w-4 h-4" />} label="Nhật Ký Giao Dịch" />
                            <TabButton active={activeTab === 'partner'} onClick={() => setActiveTab('partner')} icon={<Sprout className="w-4 h-4" />} label="SỔ CÔNG NỢ ĐỐI TÁC" />
                            <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Wheat className="w-4 h-4" />} label="Nhật Ký Kho Hàng" />
                            <TabButton active={activeTab === 'product_movement'} onClick={() => setActiveTab('product_movement')} icon={<BarChart3 className="w-4 h-4" />} label="Biến Động Hàng Hóa" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative z-20">
                    <AnimatePresence mode="wait">
                        <m.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'linear' }}
                            className="h-full"
                        >
                            {activeTab === 'transactions' && <TransactionJournal onEditOrder={handleEditOrder} />}
                            {activeTab === 'partner' && <PartnerLedger onEditOrder={handleEditOrder} />}
                            {activeTab === 'inventory' && <InventoryJournal onEditOrder={handleEditOrder} />}
                            {activeTab === 'product_movement' && <ProductMovementReport onEditOrder={handleEditOrder} />}
                        </m.div>
                    </AnimatePresence>
                </div>
            </div>

            <Portal>
                <AnimatePresence>
                    {editingOrder && (
                        <OrderEditPopup order={editingOrder} onClose={() => setEditingOrder(null)} onSave={() => setEditingOrder(null)} />
                    )}
                </AnimatePresence>
            </Portal>
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-components ---

const TransactionJournal = ({ onEditOrder }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ revenue: 0, expense: 0, count: 0, customerDebt: 0, supplierDebt: 0 });

    const [startDate, setStartDate] = useState(() => {
        const saved = localStorage.getItem('summary_transactions_startDate');
        if (saved) return saved;
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(d.setDate(diff));
        return getTodayStr(monday);
    });

    const [endDate, setEndDate] = useState(() => localStorage.getItem('summary_transactions_endDate') || getTodayStr());
    const [type, setType] = useState(() => localStorage.getItem('summary_transactions_type') || 'All');
    const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('summary_transactions_searchTerm') || '');
    const [partnerTerm, setPartnerTerm] = useState(() => localStorage.getItem('summary_transactions_partnerTerm') || '');
    const [page, setPage] = useState(() => Number(localStorage.getItem('summary_transactions_page')) || 1);
    const [pageSize, setPageSize] = useState(() => Number(localStorage.getItem('summary_transactions_pageSize')) || 20);

    useEffect(() => {
        localStorage.setItem('summary_transactions_startDate', startDate);
        localStorage.setItem('summary_transactions_endDate', endDate);
        localStorage.setItem('summary_transactions_type', type);
        localStorage.setItem('summary_transactions_searchTerm', searchTerm);
        localStorage.setItem('summary_transactions_partnerTerm', partnerTerm);
        localStorage.setItem('summary_transactions_page', page.toString());
        localStorage.setItem('summary_transactions_pageSize', pageSize.toString());
    }, [startDate, endDate, type, searchTerm, partnerTerm, page, pageSize]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const orderParams = { start_date: startDate, end_date: endDate, type: type === 'All' ? null : type, search_id: searchTerm, search_partner: partnerTerm };
            const voucherParams = { start_date: startDate, end_date: endDate, search_partner: partnerTerm, search_id: searchTerm };

            const [resOrders, resVouchers, resStats] = await Promise.all([
                axios.get('/api/orders', { params: orderParams }),
                axios.get('/api/cash-vouchers', { params: voucherParams }),
                axios.get('/api/dashboard-stats')
            ]);

            const orders = Array.isArray(resOrders.data) ? resOrders.data : (resOrders.data.items || []);
            const vouchers = Array.isArray(resVouchers.data) ? resVouchers.data : (resVouchers.data.items || []);

            const combined = [
                ...orders.map(o => ({ ...o, isVoucher: false })),
                ...vouchers.map(v => ({
                    ...v,
                    isVoucher: true,
                    display_id: v.type === 'Receipt' ? `PT-${v.id}` : `PC-${v.id}`,
                    total_amount: v.amount,
                    partner_name: v.partner_name || 'Hệ thống'
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            // Client-side fallback filter if backend doesn't support it for some reason or for manual vouchers with no clear partner object (though backend filter is preferred)
            const filtered = partnerTerm
                ? combined.filter(t => (t.partner_name || '').toLowerCase().includes(partnerTerm.toLowerCase()))
                : combined;

            setTransactions(filtered);
            let rev = 0, exp = 0;
            combined.forEach(item => {
                if (item.isVoucher) {
                    if (item.type === 'Receipt') rev += item.total_amount;
                    else exp += item.total_amount;
                } else {
                    if (item.type === 'Sale') rev += item.amount_paid;
                    if (item.type === 'Purchase') exp += item.amount_paid;
                }
            });
            setKpis({
                revenue: rev,
                expense: exp,
                count: combined.length,
                customerDebt: resStats.data.customer_debt || 0,
                supplierDebt: resStats.data.supplier_debt || 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchData(); }, [startDate, endDate, type, searchTerm, partnerTerm]);

    const totalPages = Math.ceil(transactions.length / pageSize);
    const pagedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3 pt-1 px-1">
                <KPICard title="Tổng Thu Tiền" value={kpis.revenue} icon={<ArrowUpRight size={16} strokeWidth={3} />} />
                <KPICard title="Tổng Chi Tiền" value={kpis.expense} icon={<ArrowDownRight size={16} strokeWidth={3} />} />
                <KPICard title="Giao Dịch" value={kpis.count} isMoney={false} icon={<FileText size={16} strokeWidth={3} />} />
                <KPICard title="Tổng Phải Thu" value={kpis.customerDebt} icon={<Coins size={16} strokeWidth={3} />} />
                <KPICard title="Tổng Phải Trả" value={kpis.supplierDebt} icon={<CreditCard size={16} strokeWidth={3} />} />
            </div>

            <div className="bg-transparent p-4 rounded-2xl border border-border mb-4 flex flex-wrap gap-4 items-center shadow-none relative z-50">
                <div className="flex items-center gap-2">
                    <CustomDatePicker max={getTodayStr()} value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
                    <span className="text-gray-400 font-bold">→</span>
                    <CustomDatePicker max={getTodayStr()} value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
                </div>
                <CustomSelect
                    className="border-0 border-b border-border rounded-none px-0 py-1 min-w-[120px]"
                    value={type}
                    onChange={e => { setType(e.target.value); setPage(1); }}
                    options={[
                        { value: "All", label: "Tất cả loại" },
                        { value: "Sale", label: "Chỉ Bán Hàng" },
                        { value: "Purchase", label: "Chỉ Nhập Hàng" }
                    ]}
                />
                <div className="flex-1 min-w-[180px] relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Mã chứng từ..." className="w-full pl-9 pr-4 py-2 bg-transparent border border-border rounded-xl text-sm outline-none focus:ring-1 ring-primary/20 font-medium" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
                <div className="flex-1 min-w-[180px] relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Tên khách hàng..." className="w-full pl-9 pr-4 py-2 bg-transparent border border-border rounded-xl text-sm outline-none focus:ring-1 ring-primary/20 font-medium" value={partnerTerm} onChange={e => { setPartnerTerm(e.target.value); setPage(1); }} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted uppercase">Hiển thị:</span>
                    <CustomSelect
                        className="border-0 border-b border-border rounded-none px-0 py-1 min-w-[60px]"
                        value={pageSize}
                        onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }}
                        options={[
                            { value: 20, label: "20" },
                            { value: 50, label: "50" },
                            { value: 100, label: "100" }
                        ]}
                    />
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors border border-transparent hover:border-border">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 bg-transparent rounded-2xl border border-border overflow-hidden flex flex-col shadow-none">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-primary/5 border-b border-border sticky top-0 z-10 print:hidden text-[10px] font-black tracking-widest text-muted uppercase">
                            <tr className="border-none">
                                <th className="py-4 px-6 text-center border-r border-border">Ngày giờ</th>
                                <th className="py-4 px-6 text-center border-r border-border">Chứng Từ</th>
                                <th className="py-4 px-6 text-center border-r border-border">Loại</th>
                                <th className="py-4 px-6 text-center border-r border-border">Đối Tác</th>
                                <th className="py-4 px-6 text-center border-r border-border">Giá Trị</th>
                                <th className="py-4 px-6 text-center">Ghi Chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr className="animate-shimmer-fast"><td colSpan="6" className="text-center py-10 font-black opacity-50">Đang tải dữ liệu, vui lòng chờ...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-10">Không có dữ liệu</td></tr>
                            ) : (
                                pagedTransactions.map((item) => (
                                    <tr
                                        key={`${item.isVoucher ? 'v' : 'o'}-${item.id}`}
                                        className="hover:bg-primary/5 transition-colors border-b border-border cursor-pointer"
                                    >
                                        <td className="px-6 py-3 text-xs text-center">{new Date(item.date).toLocaleString('vi-VN')}</td>
                                        <td className="px-6 py-3 font-bold text-primary text-center hover:underline" onClick={() => onEditOrder(item)}>
                                            {item.display_id}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-black uppercase whitespace-nowrap shadow-sm border",
                                                item.type === 'Sale' && item.payment_method !== 'Debt' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                                item.type === 'Sale' && item.payment_method === 'Debt' && "bg-purple-100 text-purple-700 border-purple-200",
                                                item.type === 'Purchase' && item.is_consignment && "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400",
                                                item.type === 'Purchase' && !item.is_consignment && item.payment_method !== 'Debt' && "bg-amber-100 text-amber-700 border-amber-200",
                                                item.type === 'Purchase' && !item.is_consignment && item.payment_method === 'Debt' && "bg-orange-100 text-orange-700 border-orange-200",
                                                item.type === 'Receipt' && "bg-blue-100 text-blue-700 border-blue-200",
                                                item.type === 'Payment' && "bg-rose-100 text-rose-700 border-rose-200"
                                            )}>
                                                {item.isVoucher
                                                    ? (item.type === 'Receipt' ? 'Phiếu thu' : 'Phiếu chi')
                                                    : `${item.type === 'Sale' ? 'Bán hàng' : (item.is_consignment ? 'Hàng gửi kho' : 'Nhập hàng')} • ${item.payment_method === 'Debt' ? 'Ghi nợ' : (item.payment_method || 'Tiền mặt')}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-center">{item.partner_name}</td>
                                        <td className="px-6 py-3 text-center font-black">{(item.total_amount || 0).toLocaleString()} ₫</td>
                                        <td className="px-6 py-3 text-xs italic opacity-60 truncate max-w-xs text-center">{item.note}</td>
                                    </tr>
                                ))
                             )}
                        </tbody>
                    </table>
                </div>

                {transactions.length > 0 && (
                    <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-transparent">
                        <div className="text-xs font-bold text-muted">
                            Hiển thị <span className="text-primary">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, transactions.length)}</span> trên tổng số <span className="text-primary">{transactions.length}</span> giao dịch
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                            >
                                Trước
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                                const pNum = i + 1;
                                if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                                    return (
                                        <button
                                            key={pNum}
                                            onClick={() => setPage(pNum)}
                                            className={cn(
                                                "w-9 h-9 rounded-xl text-xs font-black transition-all",
                                                page === pNum
                                                    ? "bg-primary text-white border-0"
                                                    : "hover:bg-primary/10 text-muted border border-border"
                                            )}
                                        >
                                            {pNum}
                                        </button>
                                    );
                                }
                                if (pNum === page - 3 || pNum === page + 3) return <span key={pNum} className="px-1 text-muted">...</span>;
                                return null;
                            })}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PartnerLedger = ({ onEditOrder }) => {
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(() => {
        const saved = localStorage.getItem('summary_partner_selectedPartner');
        return saved ? JSON.parse(saved) : null;
    });
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(() => localStorage.getItem('summary_partner_search') || '');
    const [stats, setStats] = useState({ customerDebt: 0, supplierDebt: 0 });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        setPage(1);
    }, [selectedPartner?.id, startDate, endDate, filterType]);

    useEffect(() => {
        localStorage.setItem('summary_partner_search', search);
    }, [search]);

    useEffect(() => {
        localStorage.setItem('summary_partner_selectedPartner', JSON.stringify(selectedPartner));
    }, [selectedPartner]);

    useEffect(() => {
        axios.get('/api/dashboard-stats')
            .then(res => setStats({
                customerDebt: res.data.customer_debt || 0,
                supplierDebt: res.data.supplier_debt || 0
            }))
            .catch(console.error);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            axios.get('/api/partners', { params: { search: search.trim(), limit: 100 } })
                .then(res => {
                    const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
                    setPartners(list);
                })
                .catch(console.error);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    const selectPartner = async (p, start = startDate, end = endDate, type = filterType) => {
        if (!p) return;
        setSelectedPartner(p);
        setLoading(true);
        try {
            const params = {};
            if (start) params.start_date = start;
            if (end) params.end_date = end;
            if (type && type !== 'all') params.filter_type = type;
            const res = await axios.get(`/api/partners/${p.id}/ledger`, { params });
            setLedger(res.data.ledger || []);

            // Đồng bộ số dư nợ mới nhất từ sổ phụ
            if (res.data.current_balance !== undefined) {
                const latestBalance = res.data.current_balance;
                setSelectedPartner(prev => ({
                    ...(prev || p),
                    ...(res.data.partner || {}),
                    debt_balance: latestBalance
                }));
                setPartners(prev => prev.map(item => item.id === p.id ? { ...item, debt_balance: latestBalance } : item));
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedPartner) {
            selectPartner(selectedPartner, startDate, endDate, filterType);
        }
    }, [startDate, endDate, filterType, selectedPartner?.id]);

    const handleExport = async () => {
        if (!selectedPartner) return;
        try {
            const params = {
                filter_type: filterType
            };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            
            const res = await axios.get(`/api/partners/${selectedPartner.id}/ledger/export`, { params, responseType: 'blob' });
            const { saveOrOpenFile } = await import('../../utils/downloadHelper');
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            await saveOrOpenFile(res.data, `so_phu_${selectedPartner.name || selectedPartner.id}_${todayStr}.xlsx`);
        } catch (err) {
            console.error("Export Ledger Error:", err);
        }
    };

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-1 px-1">
                <KPICard title="Tổng Phải Thu" value={stats.customerDebt} icon={<Coins size={16} strokeWidth={3} />} />
                <KPICard title="Tổng Phải Trả" value={stats.supplierDebt} icon={<CreditCard size={16} strokeWidth={3} />} />
            </div>
            <div className="flex-1 flex gap-4 overflow-hidden">
                <div className="w-80 bg-transparent rounded-2xl border border-border flex flex-col overflow-hidden shadow-none">
                    <div className="p-3.5 border-b border-border">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input 
                                type="text" 
                                placeholder="Tìm đối tác theo tên, SĐT..." 
                                className="w-full pl-9 pr-8 py-2 bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl text-xs outline-none text-primary font-bold placeholder:text-gray-400 focus:border-primary transition-all" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                                    title="Xóa tìm kiếm"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {partners.length === 0 ? (
                            <div className="p-6 text-center text-xs font-bold text-gray-400">
                                Không tìm thấy đối tác phù hợp
                            </div>
                        ) : (
                            partners.map(p => {
                                const isSelected = selectedPartner?.id === p.id;
                                const debt = Number(p.debt_balance || 0);
                                return (
                                    <div 
                                        key={p.id} 
                                        onClick={() => selectPartner(p)} 
                                        className={cn(
                                            "p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-0.5 select-none",
                                            isSelected 
                                                ? "bg-primary text-white shadow-sm" 
                                                : "hover:bg-primary/10 text-slate-800 dark:text-slate-200 border border-transparent hover:border-primary/20"
                                        )}
                                    >
                                        <div className="font-black text-xs uppercase tracking-tight truncate">{p.name}</div>
                                        <div className="flex items-center justify-between text-[10px] font-black mt-0.5">
                                            <span className={cn(
                                                isSelected 
                                                    ? "text-white/90" 
                                                    : debt > 1000 
                                                        ? "text-blue-600 dark:text-blue-400" 
                                                        : debt < -1000 
                                                            ? "text-rose-600 dark:text-rose-400" 
                                                            : "text-slate-400"
                                            )}>
                                                NỢ: {debt.toLocaleString()} ₫
                                            </span>
                                            {p.phone && (
                                                <span className={cn("text-[9px] font-normal", isSelected ? "text-white/70" : "text-gray-400")}>
                                                    {p.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="flex-1 bg-transparent rounded-2xl border border-border overflow-hidden flex flex-col shadow-none">
                    {selectedPartner ? (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 bg-primary text-white">
                                <h2 className="text-xl font-black uppercase tracking-tight">{selectedPartner.name}</h2>
                                <p className="text-xs opacity-80 mt-1">DƯ NỢ HIỆN TẠI: {selectedPartner.debt_balance.toLocaleString()} ₫</p>
                            </div>
                            <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center bg-transparent">
                                <div className="flex items-center gap-2">
                                    <CustomDatePicker max={getTodayStr()} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    <span className="text-gray-400 font-bold">→</span>
                                    <CustomDatePicker max={getTodayStr()} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                                <CustomSelect
                                    className="border-0 border-b border-border rounded-none px-0 py-1 min-w-[140px]"
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value)}
                                    options={[
                                        { value: "all", label: "Tất cả giao dịch" },
                                        { value: "debt", label: "Ghi nợ (+)" },
                                        { value: "cash", label: "Thanh toán (-)" }
                                    ]}
                                />
                                <div className="flex-1" />
                                <button onClick={handleExport} className="px-3 py-1.5 hover:bg-primary/10 rounded-xl text-primary transition-colors border border-border flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <Download size={14} /> Xuất Excel
                                </button>
                                <button onClick={() => selectPartner(selectedPartner)} className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-colors border border-border">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-primary/5 border-b border-border text-[10px] font-black tracking-widest text-muted uppercase">
                                        <tr className="border-none">
                                            <th className="py-4 px-3 text-center border-r border-border">Ngày</th>
                                            <th className="py-4 px-3 text-center border-r border-border">Chứng từ</th>
                                            <th className="py-4 px-3 text-center border-r border-border">Diễn giải</th>
                                            <th className="py-4 px-3 text-center border-r border-border">Phát sinh</th>
                                            <th className="py-4 px-3 text-center">Dư nợ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {loading ? (
                                            <tr><td colSpan="5" className="text-center p-10 font-bold text-gray-400">Đang tải dữ liệu sổ nợ...</td></tr>
                                        ) : ledger.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center p-10 font-bold text-gray-400">Không có phát sinh giao dịch trong khoảng thời gian này</td></tr>
                                        ) : ledger.slice((page - 1) * pageSize, page * pageSize).map((row, i) => {
                                            const isIncrease = Number(row.increase || 0) > 0;
                                            const isDecrease = Number(row.decrease || 0) > 0;
                                            const isOpening = row.type === 'System';

                                            return (
                                                <tr key={i} className="border-b border-border hover:bg-primary/5 transition-colors">
                                                    <td className="p-3 text-xs text-center font-medium">
                                                        {row.date ? new Date(row.date).toLocaleDateString('vi-VN') : '-'}
                                                    </td>
                                                    <td 
                                                        className={cn(
                                                            "p-3 font-bold text-center",
                                                            row.type === 'Order' ? "text-primary cursor-pointer hover:underline" : "text-muted"
                                                        )} 
                                                        onClick={() => row.type === 'Order' && row.obj && onEditOrder(row.obj)}
                                                    >
                                                        {row.ref_id}
                                                    </td>
                                                    <td className="p-3 text-xs text-center font-medium text-slate-700 dark:text-slate-300">
                                                        {row.desc}
                                                    </td>
                                                    <td className="p-3 text-center font-bold">
                                                        {isIncrease ? (
                                                            <span className="text-blue-600 dark:text-blue-400 font-black">
                                                                +{Math.abs(Number(row.increase)).toLocaleString()} ₫
                                                            </span>
                                                        ) : isDecrease ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                                                -{Math.abs(Number(row.decrease)).toLocaleString()} ₫
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 font-bold text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className={cn(
                                                        "p-3 text-center font-black text-xs",
                                                        (row.running_balance || 0) > 1000 
                                                            ? "text-blue-600 dark:text-blue-400" 
                                                            : (row.running_balance || 0) < -1000 
                                                                ? "text-rose-600 dark:text-rose-400" 
                                                                : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {Number(row.running_balance || 0).toLocaleString()} ₫
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {ledger.length > 0 && (
                                <div className="px-6 py-3 border-t border-border flex justify-between items-center bg-transparent shrink-0">
                                    <div className="text-xs font-bold text-muted">
                                        Hiển thị <span className="text-primary">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, ledger.length)}</span> trên tổng số <span className="text-primary">{ledger.length}</span> giao dịch
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="px-3 py-1.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                                        >
                                            Trước
                                        </button>
                                        {(() => {
                                            const totalPages = Math.ceil(ledger.length / pageSize) || 1;
                                            return [...Array(totalPages)].map((_, i) => {
                                                const pNum = i + 1;
                                                if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                                                    return (
                                                        <button
                                                            key={pNum}
                                                            onClick={() => setPage(pNum)}
                                                            className={cn(
                                                                "w-8 h-8 rounded-xl text-xs font-black transition-all",
                                                                page === pNum
                                                                    ? "bg-primary text-white border-0"
                                                                    : "border border-border text-primary hover:bg-primary/10"
                                                            )}
                                                        >
                                                            {pNum}
                                                        </button>
                                                    );
                                                }
                                                if (pNum === page - 3 || pNum === page + 3) return <span key={pNum} className="px-1 text-muted">...</span>;
                                                return null;
                                            });
                                        })()}
                                        <button
                                            disabled={page === Math.ceil(ledger.length / pageSize) || ledger.length === 0}
                                            onClick={() => setPage(p => Math.min(Math.ceil(ledger.length / pageSize), p + 1))}
                                            className="px-3 py-1.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                            <Users size={64} className="opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-xs">Chọn đối tác để xem sổ phụ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InventoryJournal = ({ onEditOrder }) => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState(() => localStorage.getItem('summary_inventory_search') || '');
    const [selectedProduct, setSelectedProduct] = useState(() => {
        const saved = localStorage.getItem('summary_inventory_selectedProduct');
        return saved ? JSON.parse(saved) : null;
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        localStorage.setItem('summary_inventory_search', search);
    }, [search]);

    useEffect(() => {
        localStorage.setItem('summary_inventory_selectedProduct', JSON.stringify(selectedProduct));
    }, [selectedProduct]);

    useEffect(() => {
        setPage(1);
    }, [selectedProduct?.id, filterType, startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            axios.get('/api/products', { params: { search: search.trim(), limit: 100 } })
                .then(res => setProducts(Array.isArray(res.data) ? res.data : (res.data.items || [])))
                .catch(console.error);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    const selectProduct = async (p) => {
        if (!p) return;
        setSelectedProduct(p);
        setLoading(true);
        try {
            const res = await axios.get(`/api/products/${p.id}/history`);
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedProduct) {
            selectProduct(selectedProduct);
        }
    }, [selectedProduct?.id]);

    const filteredHistory = history.filter(item => {
        const change = Number(item.quantity_change || 0);
        const isReturn = item.type?.toLowerCase().includes('trả') || (item.type?.toLowerCase().includes('bán') && change > 0) || (item.type?.toLowerCase().includes('nhập') && change < 0);
        const isSale = !isReturn && (item.type?.toLowerCase().includes('bán') || change < 0);
        const isPurchase = !isReturn && (item.type?.toLowerCase().includes('nhập') || change > 0);

        if (filterType === 'sale' && !isSale) return false;
        if (filterType === 'purchase' && !isPurchase) return false;
        if (filterType === 'return' && !isReturn) return false;

        if (item.date) {
            const itemDate = item.date.slice(0, 10);
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
        }

        return true;
    });

    return (
        <div className="h-full flex gap-4 overflow-hidden">
            {/* Left Product List */}
            <div className="w-80 bg-transparent rounded-2xl border border-border flex flex-col overflow-hidden shadow-none">
                <div className="p-3.5 border-b border-border">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input 
                            type="text" 
                            placeholder="Tìm sản phẩm (tên, mã)..." 
                            className="w-full pl-9 pr-8 py-2 bg-white/40 dark:bg-slate-900/40 border border-border rounded-xl text-xs outline-none text-primary font-bold placeholder:text-gray-400 focus:border-primary transition-all" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                                title="Xóa tìm kiếm"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {products.length === 0 ? (
                        <div className="p-6 text-center text-xs font-bold text-gray-400">
                            Không tìm thấy sản phẩm phù hợp
                        </div>
                    ) : (
                        products.map(p => {
                            const isSelected = selectedProduct?.id === p.id;
                            const stock = Number(p.stock || 0);
                            return (
                                <div 
                                    key={p.id} 
                                    onClick={() => selectProduct(p)} 
                                    className={cn(
                                        "p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-0.5 select-none",
                                        isSelected 
                                            ? "bg-primary text-white shadow-sm" 
                                            : "hover:bg-primary/10 text-slate-800 dark:text-slate-200 border border-transparent hover:border-primary/20"
                                    )}
                                >
                                    <div className="font-black text-xs uppercase tracking-tight truncate">{p.name}</div>
                                    <div className="flex items-center justify-between text-[10px] font-black mt-0.5">
                                        <span className={cn(
                                            isSelected 
                                                ? "text-white/90" 
                                                : stock > 0 
                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                    : "text-rose-500 dark:text-rose-400"
                                        )}>
                                            TỒN KHO: {stock.toLocaleString()} {p.unit || ''}
                                        </span>
                                        {p.price > 0 && (
                                            <span className={cn("text-[9px] font-normal", isSelected ? "text-white/70" : "text-gray-400")}>
                                                {Number(p.price).toLocaleString()} ₫
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Product History Table */}
            <div className="flex-1 bg-transparent rounded-2xl border border-border overflow-hidden flex flex-col shadow-none">
                {selectedProduct ? (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-5 bg-primary text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight">{selectedProduct.name}</h2>
                                <p className="text-xs opacity-80 mt-0.5">
                                    TỒN HIỆN TẠI: <span className="font-black">{Number(selectedProduct.stock || 0).toLocaleString()} {selectedProduct.unit || ''}</span>
                                    {selectedProduct.price > 0 && <span> • GIÁ BÁN: <span className="font-black">{Number(selectedProduct.price).toLocaleString()} ₫</span></span>}
                                </p>
                            </div>
                            <button
                                onClick={() => selectProduct(selectedProduct)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/20"
                                title="Tải lại dữ liệu"
                            >
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="p-3.5 border-b border-border flex flex-wrap gap-4 items-center bg-transparent">
                            <div className="flex items-center gap-2">
                                <CustomDatePicker max={getTodayStr()} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <span className="text-gray-400 font-bold">→</span>
                                <CustomDatePicker max={getTodayStr()} value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                            <CustomSelect
                                className="border-0 border-b border-border rounded-none px-0 py-1 min-w-[160px]"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                options={[
                                    { value: "all", label: "Tất cả biến động" },
                                    { value: "sale", label: "Chỉ Bán Hàng (-)" },
                                    { value: "purchase", label: "Chỉ Nhập Hàng (+)" },
                                    { value: "return", label: "Chỉ Trả Hàng (Khách trả / Trả NCC)" }
                                ]}
                            />
                            <div className="flex-1" />
                            <div className="text-[11px] font-bold text-muted">
                                Tổng phát sinh: <span className="text-primary font-black">{filteredHistory.length}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary/5 border-b border-border text-[10px] font-black tracking-widest text-muted uppercase">
                                    <tr className="border-none">
                                        <th className="py-4 px-3 text-center border-r border-border">Ngày</th>
                                        <th className="py-4 px-3 text-center border-r border-border">Chứng từ</th>
                                        <th className="py-4 px-3 text-center border-r border-border">Đối tác</th>
                                        <th className="py-4 px-3 text-center border-r border-border">Loại</th>
                                        <th className="py-4 px-3 text-center">Thay đổi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center p-10 font-bold text-gray-400">Đang tải nhật ký kho...</td></tr>
                                    ) : filteredHistory.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center p-10 font-bold text-gray-400">Chưa có phát sinh nhập xuất phù hợp</td></tr>
                                    ) : filteredHistory.slice((page - 1) * pageSize, page * pageSize).map((item, i) => {
                                        const change = Number(item.quantity_change || 0);
                                        const isReturn = item.type?.toLowerCase().includes('trả') || (item.type?.toLowerCase().includes('bán') && change > 0) || (item.type?.toLowerCase().includes('nhập') && change < 0);
                                        const isSale = !isReturn && item.type?.toLowerCase().includes('bán');
                                        const isPurchase = !isReturn && item.type?.toLowerCase().includes('nhập');
                                        const displayType = isReturn
                                            ? (item.type?.toLowerCase().includes('bán') || (item.type?.toLowerCase().includes('trả') && item.type?.toLowerCase().includes('khách')) || change > 0 ? 'Khách trả hàng' : 'Trả hàng NCC')
                                            : (item.type || 'Giao dịch');

                                        return (
                                            <tr key={i} className="border-b border-border hover:bg-primary/5 transition-colors">
                                                <td className="p-3 text-xs text-center font-medium">
                                                    {item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                                <td 
                                                    className="p-3 font-bold text-primary text-center cursor-pointer hover:underline" 
                                                    onClick={() => onEditOrder && onEditOrder(item)}
                                                >
                                                    {item.display_id || item.order_id || '-'}
                                                </td>
                                                <td className="p-3 text-xs text-center font-medium text-slate-700 dark:text-slate-300">
                                                    {item.partner_name || '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                        isReturn
                                                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                                            : isSale 
                                                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                                                                : isPurchase 
                                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                                                                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                                                    )}>
                                                        {displayType}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center font-bold">
                                                    {change > 0 ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                                            +{Math.abs(change).toLocaleString()} {selectedProduct.unit || ''}
                                                        </span>
                                                    ) : change < 0 ? (
                                                        <span className="text-rose-600 dark:text-rose-400 font-black">
                                                            -{Math.abs(change).toLocaleString()} {selectedProduct.unit || ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-bold text-xs">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredHistory.length > 0 && (
                            <div className="px-6 py-3 border-t border-border flex justify-between items-center bg-transparent shrink-0">
                                <div className="text-xs font-bold text-muted">
                                    Hiển thị <span className="text-primary">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredHistory.length)}</span> trên tổng số <span className="text-primary">{filteredHistory.length}</span> biến động
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="px-3 py-1.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                                    >
                                        Trước
                                    </button>
                                    {(() => {
                                        const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
                                        return [...Array(totalPages)].map((_, i) => {
                                            const pNum = i + 1;
                                            if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                                                return (
                                                    <button
                                                        key={pNum}
                                                        onClick={() => setPage(pNum)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-xl text-xs font-black transition-all",
                                                            page === pNum
                                                                ? "bg-primary text-white border-0"
                                                                : "border border-border text-primary hover:bg-primary/10"
                                                        )}
                                                    >
                                                        {pNum}
                                                    </button>
                                                );
                                            }
                                            if (pNum === page - 3 || pNum === page + 3) return <span key={pNum} className="px-1 text-muted">...</span>;
                                            return null;
                                        });
                                    })()}
                                    <button
                                        disabled={page === Math.ceil(filteredHistory.length / pageSize) || filteredHistory.length === 0}
                                        onClick={() => setPage(p => Math.min(Math.ceil(filteredHistory.length / pageSize), p + 1))}
                                        className="px-3 py-1.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Package size={64} className="opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">Chọn sản phẩm để xem nhật ký kho</p>
                    </div>
                )}
            </div>
        </div>
    );
};
const ProductMovementReport = ({ onEditOrder }) => {
    const [movement, setMovement] = useState([]);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(() => {
        const saved = localStorage.getItem('summary_movement_selectedProducts');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedBrand, setSelectedBrand] = useState(() => localStorage.getItem('summary_movement_selectedBrand') || '');
    const [startDate, setStartDate] = useState(() => {
        const saved = localStorage.getItem('summary_movement_startDate');
        if (saved) return saved;
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return getTodayStr(d);
    });
    const [endDate, setEndDate] = useState(() => localStorage.getItem('summary_movement_endDate') || getTodayStr());
    const [searchProd, setSearchProd] = useState('');
    const [showProdList, setShowProdList] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(() => {
        const saved = localStorage.getItem('summary_movement_selectedPartner');
        return saved ? JSON.parse(saved) : null;
    });
    const [selectedType, setSelectedType] = useState(() => localStorage.getItem('summary_movement_selectedType') || ''); // '' (Tất cả), 'Sale' (Bán/Xuất), 'Purchase' (Nhập)
    const [partnerSearch, setPartnerSearch] = useState('');
    const [partnersList, setPartnersList] = useState([]);
    const [showPartnerList, setShowPartnerList] = useState(false);
    const [partnerActiveIndex, setPartnerActiveIndex] = useState(0);
    const [productActiveIndex, setProductActiveIndex] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(() => Number(localStorage.getItem('summary_movement_currentPage')) || 1);
    const [pageSize, setPageSize] = useState(() => Number(localStorage.getItem('summary_movement_pageSize')) || 50);

    useEffect(() => {
        localStorage.setItem('summary_movement_startDate', startDate);
        localStorage.setItem('summary_movement_endDate', endDate);
        localStorage.setItem('summary_movement_selectedBrand', selectedBrand);
        localStorage.setItem('summary_movement_selectedType', selectedType);
        localStorage.setItem('summary_movement_currentPage', currentPage.toString());
        localStorage.setItem('summary_movement_pageSize', pageSize.toString());
        localStorage.setItem('summary_movement_selectedProducts', JSON.stringify(selectedProducts));
        localStorage.setItem('summary_movement_selectedPartner', JSON.stringify(selectedPartner));
    }, [startDate, endDate, selectedBrand, selectedType, currentPage, pageSize, selectedProducts, selectedPartner]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (partnerSearch.length > 1) {
                axios.get('/api/partners', { params: { search: partnerSearch, limit: 10 } })
                    .then(res => setPartnersList(Array.isArray(res.data) ? res.data : (res.data.items || [])))
                    .catch(console.error);
            } else {
                setPartnersList([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [partnerSearch]);


    useEffect(() => {
        axios.get('/api/products/brands')
            .then(res => setBrands(res.data))
            .catch(err => console.error("Error fetching brands:", err));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchProd.length > 1) {
                axios.get('/api/products', { params: { search: searchProd, limit: 10 } })
                    .then(res => setProducts(Array.isArray(res.data) ? res.data : (res.data.items || [])))
                    .catch(console.error);
            } else {
                setProducts([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchProd]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
                brand: selectedBrand || null,
                product_ids: selectedProducts.map(p => p.id).join(','),
                partner_id: selectedPartner?.id || null,
                type: selectedType || null
            };
            const res = await axios.get('/api/reports/product-movement', { params });
            setMovement(res.data);
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Không thể tải dữ liệu báo cáo. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [startDate, endDate, selectedBrand, selectedProducts, selectedPartner, selectedType]);

    const setQuickDate = (days) => {
        const end = new Date();
        const start = new Date();
        if (days === 'month') {
            start.setDate(1); // First day of current month
        } else if (days === 'all') {
            start.setFullYear(2020);
        } else {
            start.setDate(end.getDate() - days);
        }
        setStartDate(getTodayStr(start));
        setEndDate(getTodayStr(end));
    };

    const addProduct = (p) => {
        if (!selectedProducts.find(x => x.id === p.id)) {
            setSelectedProducts([...selectedProducts, p]);
        }
        setSearchProd('');
        setShowProdList(false);
    };

    const removeProduct = (id) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    };

    const exportToExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (selectedBrand) params.append('brand', selectedBrand);
            if (selectedProducts.length > 0) params.append('product_ids', selectedProducts.map(p => p.id).join(','));
            if (selectedPartner?.id) params.append('partner_id', selectedPartner.id);
            if (selectedType) params.append('type', selectedType);
            
            const res = await axios.get(`/api/reports/product-movement?${params.toString()}`);
            const items = res.data || [];
            
            const XLSX = await import('xlsx');
            const excelRows = items.map(d => ({
                'Ngày': d.date || '',
                'Mã Đơn': d.display_id || '',
                'Sản Phẩm': d.product_name || '',
                'Hãng': d.brand || '',
                'Loại': d.type || '',
                'Đối Tác': d.partner_name || '',
                'Số Lượng': d.quantity || 0,
                'Đơn Vị': d.unit || '',
                'Đơn Giá': d.price || 0,
                'Thành Tiền': (d.quantity || 0) * (d.price || 0)
            }));

            const ws = XLSX.utils.json_to_sheet(excelRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "BienDongHangHoa");
            
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const { saveOrOpenFile } = await import('../../utils/downloadHelper');
            await saveOrOpenFile(blob, `bao_cao_bien_dong_${getTodayStr()}.xlsx`);
        } catch (err) {
            console.error("Export Error:", err);
        }
    };

    // Calculate totals
    const totals = movement.reduce((acc, curr) => {
        if (curr.type === 'Nhập') acc.qtyIn += curr.quantity;
        else acc.qtyOut += curr.quantity;
        acc.totalVal += curr.total;
        return acc;
    }, { qtyIn: 0, qtyOut: 0, totalVal: 0 });

    // Pagination logic
    const totalPages = Math.ceil(movement.length / pageSize);
    const paginatedMovement = movement.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Page totals
    const pageTotals = paginatedMovement.reduce((acc, curr) => {
        if (curr.type === 'Nhập') acc.qtyIn += curr.quantity;
        else acc.qtyOut += curr.quantity;
        acc.totalVal += curr.total;
        return acc;
    }, { qtyIn: 0, qtyOut: 0, totalVal: 0 });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Filters Header */}
            <div className="bg-transparent p-5 rounded-2xl border border-border mb-4 flex flex-col gap-4 relative z-[110] shadow-none">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <CustomDatePicker max={getTodayStr()} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            <span className="text-gray-400 font-bold">→</span>
                            <CustomDatePicker max={getTodayStr()} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="flex gap-1">
                            {[
                                { label: '7 ngày', value: 7 },
                                { label: 'Tháng này', value: 'month' },
                                { label: 'Tất cả', value: 'all' }
                            ].map(q => (
                                <button key={q.label} onClick={() => setQuickDate(q.value)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-transparent px-4 py-1.5 rounded-xl border border-border shadow-none focus-within:border-primary/50 transition-all">
                            <Tag size={16} className="text-muted shrink-0" />
                            <CustomSelect
                                className="border-0 p-0 min-w-[120px]"
                                value={selectedBrand}
                                onChange={e => setSelectedBrand(e.target.value)}
                                options={[
                                    { value: "", label: "Tất cả hãng" },
                                    ...brands.map(b => ({ value: b, label: b }))
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-transparent px-4 py-1.5 rounded-xl border border-border shadow-none focus-within:border-primary/50 transition-all">
                            <span className="text-[10px] font-black text-muted uppercase underline decoration-primary/30 decoration-2 shrink-0">LOẠI</span>
                            <CustomSelect
                                className="border-0 p-0 min-w-[150px]"
                                dropdownClassName="uppercase"
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                options={[
                                    { value: "", label: "TẤT CẢ BIẾN ĐỘNG" },
                                    { value: "Sale", label: "CHỈ BÁN HÀNG" },
                                    { value: "Purchase", label: "CHỈ NHẬP HÀNG" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="w-64 relative">
                        <div className="flex items-center gap-2 bg-transparent px-4 py-2 rounded-xl border border-border shadow-none focus-within:border-primary/50 transition-all">
                            <Users size={16} className="text-muted" />
                            <input
                                type="text"
                                placeholder={selectedPartner ? selectedPartner.name : "Lọc theo đối tác..."}
                                className="bg-transparent font-bold text-sm text-primary outline-none w-full"
                                value={selectedPartner ? "" : partnerSearch}
                                onChange={e => { setPartnerSearch(e.target.value); setShowPartnerList(true); setPartnerActiveIndex(0); }}
                                onFocus={() => setShowPartnerList(true)}
                                onKeyDown={e => {
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        setPartnerActiveIndex(prev => Math.min(prev + 1, partnersList.length - 1));
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        setPartnerActiveIndex(prev => Math.max(prev - 1, 0));
                                    } else if (e.key === 'Escape') {
                                        setShowPartnerList(false);
                                    } else if (e.key === 'Enter' && partnersList[partnerActiveIndex]) {
                                        e.preventDefault();
                                        setSelectedPartner(partnersList[partnerActiveIndex]);
                                        setShowPartnerList(false);
                                        setPartnerSearch('');
                                    }
                                }}
                            />
                            {selectedPartner && (
                                <button onClick={() => setSelectedPartner(null)} className="text-rose-500 font-black text-lg">×</button>
                            )}
                        </div>
                        <AnimatePresence>
                            {showPartnerList && (partnerSearch.length > 1 || partnersList.length > 0) && (
                                <m.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="dropdown-premium !z-[200] max-h-72 overflow-auto no-scrollbar bg-transparent border border-border"
                                >
                                    {partnersList.length === 0 ? (
                                        <div className="p-4 text-center text-xs font-bold text-gray-400 italic">Không tìm thấy đối tác</div>
                                    ) : partnersList.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => { setSelectedPartner(p); setShowPartnerList(false); setPartnerSearch(''); }}
                                            className={cn("dropdown-item flex flex-col gap-0.5", partnerActiveIndex === idx && "active")}
                                            onMouseEnter={() => setPartnerActiveIndex(idx)}
                                        >
                                            <div className="font-black text-sm">{p.name}</div>
                                            <div className="text-[10px] opacity-70 font-bold uppercase tracking-wider">
                                                {p.phone || 'Không có sđt'} • {p.type === 'Customer' ? 'Khách hàng' : 'Nhà cung cấp'}
                                            </div>
                                        </div>
                                    ))}
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 min-w-[300px] relative group">
                        <div className="flex flex-wrap gap-2 p-2.5 bg-transparent border border-border rounded-xl min-h-[46px] group-focus-within:border-primary/50 transition-all shadow-none">
                            {selectedProducts.map(p => (
                                <m.span
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={p.id}
                                    className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-2"
                                >
                                    {p.name}
                                    <button onClick={() => removeProduct(p.id)} className="hover:text-rose-300 transition-colors font-black text-xs">×</button>
                                </m.span>
                            ))}
                            <div className="flex-1 flex items-center relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-0" />
                                <input
                                    type="text"
                                    placeholder={selectedProducts.length === 0 ? "Chọn mặt hàng để theo dõi..." : ""}
                                    className="w-full bg-transparent pl-6 text-sm outline-none font-medium"
                                    value={searchProd}
                                    onChange={e => { setSearchProd(e.target.value); setShowProdList(true); setProductActiveIndex(0); }}
                                    onFocus={() => setShowProdList(true)}
                                    onKeyDown={e => {
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            setProductActiveIndex(prev => Math.min(prev + 1, products.length - 1));
                                        } else if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            setProductActiveIndex(prev => Math.max(prev - 1, 0));
                                        } else if (e.key === 'Escape') {
                                            setShowProdList(false);
                                        } else if (e.key === 'Enter' && products[productActiveIndex]) {
                                            e.preventDefault();
                                            addProduct(products[productActiveIndex]);
                                        }
                                    }}
                                />
                            </div>
                            {selectedProducts.length > 0 && (
                                <button onClick={() => setSelectedProducts([])} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 px-2 border-l border-gray-200">Xóa hết</button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showProdList && (searchProd.length > 1 || products.length > 0) && (
                                <m.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className="dropdown-premium !z-[200] max-h-80 overflow-auto no-scrollbar bg-transparent border border-border"
                                >
                                    {products.length === 0 ? (
                                        <div className="p-6 text-center text-xs font-bold text-gray-400 italic">Không tìm thấy sản phẩm phù hợp</div>
                                    ) : (
                                        products.map((p, idx) => (
                                            <div
                                                key={p.id}
                                                onClick={() => addProduct(p)}
                                                className={cn("dropdown-item flex justify-between items-center", productActiveIndex === idx && "active")}
                                                onMouseEnter={() => setProductActiveIndex(idx)}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black">{p.name}</span>
                                                    <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{p.brand || 'N/A'} • {p.unit}</span>
                                                </div>
                                                <div className={cn("p-2 rounded-lg transition-all scale-75 group-hover:scale-110", productActiveIndex === idx ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                                                    <RefreshCw size={14} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-transparent px-3 py-1 rounded-xl border border-border shadow-none transition-all focus-within:border-primary/50">
                            <span className="text-[10px] font-black text-muted uppercase">HIỆN</span>
                            <CustomSelect
                                className="border-0 p-0 min-w-[60px]"
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                options={[
                                    { value: 20, label: "20" },
                                    { value: 50, label: "50" },
                                    { value: 100, label: "100" },
                                    { value: 500, label: "500" }
                                ]}
                            />
                        </div>

                        <div className="flex items-center gap-1.5 ml-2">
                            <m.button
                                whileTap={{ scale: 0.9 }}
                                onClick={fetchData}
                                className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all border border-border"
                                title="Làm mới"
                            >
                                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </m.button>
                            <m.button
                                whileTap={{ scale: 0.9 }}
                                onClick={exportToExcel}
                                className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all border border-border"
                                title="Xuất báo cáo"
                            >
                                <Printer className="w-4 h-4" />
                            </m.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 bg-transparent rounded-3xl border border-border overflow-hidden flex flex-col relative transition-all shadow-none">
                {error && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
                        <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl shadow border border-rose-200 flex flex-col items-center gap-4">
                            <AlertCircle size={40} />
                            <p className="font-black text-center">{error}</p>
                            <button onClick={fetchData} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold">Thử lại</button>
                        </div>
                    </div>
                )}

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-primary/5 border-b border-border sticky top-0 z-10 print:hidden text-[10px] font-black tracking-widest text-muted uppercase">
                            <tr className="border-none">
                                <th className="py-4 px-6 text-center border-r border-border">Thời gian</th>
                                <th className="py-4 px-6 text-center border-r border-border">Chứng Tư</th>
                                <th className="py-4 px-6 text-left border-r border-border">Sản Phẩm</th>
                                <th className="py-4 px-6 text-center border-r border-border">Phân Loại</th>
                                <th className="py-4 px-6 text-center border-r border-border">Đối Tác</th>
                                <th className="py-4 px-6 text-center border-r border-border">SL Đổi</th>
                                <th className="py-4 px-6 text-center border-r border-border">Đơn Giá</th>
                                <th className="py-4 px-6 text-center">Thành Tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-white/30">
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-6 py-6"><div className="h-4 bg-gray-200/50 rounded-lg w-full"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : movement.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-24 text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-8 bg-primary/10 rounded-full">
                                                <ShoppingBag size={64} className="opacity-30 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-black uppercase tracking-widest text-xs text-muted">Chưa có dữ liệu biến động</span>
                                                <span className="text-[10px] opacity-60">Hãy thay đổi bộ lọc hoặc chọn mặt hàng khác</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedMovement.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-primary/5 transition-all group border-b border-border">
                                        <td className="px-6 py-4 text-xs font-bold text-muted whitespace-nowrap text-center">
                                            {new Date(item.date).toLocaleDateString('vi-VN')}
                                            <span className="block opacity-50 text-[10px] font-normal">{new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => onEditOrder({ display_id: item.display_id, id: item.order_id })}
                                                className="text-primary font-black hover:underline underline-offset-4 decoration-primary/30"
                                            >
                                                {item.display_id}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex flex-col items-start">
                                                <span className="font-black text-foreground">{item.product_name}</span>
                                                <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors uppercase tracking-tight">{item.brand || 'Không có hãng'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm border",
                                                item.type === 'Nhập' ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
                                            )}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                                                    {item.partner_name || 'Khách lẻ'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-center font-black text-sm",
                                            item.type === 'Nhập' ? "text-amber-600" : "text-emerald-600"
                                        )}>
                                            {item.type === 'Nhập' ? `+${Math.abs(Number(item.quantity || 0)).toLocaleString()}` : `-${Math.abs(Number(item.quantity || 0)).toLocaleString()}`}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-500 text-xs">
                                            {item.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center font-black text-foreground">
                                            {item.total.toLocaleString()} đ
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                        {!loading && movement.length > 0 && (
                            <tfoot className="sticky bottom-0 bg-card border-t border-border z-20 backdrop-blur-md">
                                <tr className="bg-transparent">
                                    <td colSpan="5" className="px-6 py-2 font-black text-[10px] uppercase text-muted text-right">Tổng trang ({paginatedMovement.length} dòng):</td>
                                    <td className="px-6 py-2 text-right">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-amber-600 font-black text-[10px]">+{pageTotals.qtyIn.toLocaleString()}</div>
                                            <div className="text-emerald-600 font-black text-[10px]">-{pageTotals.qtyOut.toLocaleString()}</div>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td className="px-6 py-2 text-right font-black text-xs text-primary">{pageTotals.totalVal.toLocaleString()} đ</td>
                                </tr>
                                <tr className="bg-primary/10">
                                    <td colSpan="5" className="px-6 py-4 font-black text-xs uppercase text-primary text-right tracking-widest">Toàn bộ danh sách:</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-amber-700 font-black text-xs">TỔNG NHẬP: {totals.qtyIn.toLocaleString()}</div>
                                            <div className="text-emerald-700 font-black text-xs">TỔNG XUẤT: {totals.qtyOut.toLocaleString()}</div>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td className="px-6 py-4 text-right font-black text-lg text-primary drop-shadow-none">{totals.totalVal.toLocaleString()} đ</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination Status & Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 bg-transparent border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-black uppercase text-muted tracking-[0.2em] bg-primary/5 px-3 py-1.5 rounded-lg border border-border">
                                Trang {currentPage} / {totalPages}
                            </div>
                            <div className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                Tổng {movement.length.toLocaleString()} bản ghi
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <m.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center bg-transparent border border-border rounded-2xl disabled:opacity-30 transition-all hover:bg-primary hover:text-white"
                            >
                                <ChevronLeft size={18} />
                            </m.button>

                            <div className="flex gap-1.5 px-2">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <m.button
                                            key={pageNum}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={cn(
                                                "w-10 h-10 rounded-2xl font-black text-xs transition-all border",
                                                currentPage === pageNum
                                                    ? "bg-primary text-white border-primary shadow-none scale-110"
                                                    : "bg-transparent border-border text-muted hover:border-primary"
                                            )}
                                        >
                                            {pageNum}
                                        </m.button>
                                    );
                                })}
                            </div>

                            <m.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center bg-transparent border border-border rounded-2xl disabled:opacity-30 transition-all hover:bg-primary hover:text-white"
                            >
                                <ChevronRight size={18} />
                            </m.button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Summary;
