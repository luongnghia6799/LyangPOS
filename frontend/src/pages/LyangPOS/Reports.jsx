import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { m, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, Package, Truck, Calendar, Download, RefreshCcw, Search, ChevronUp, ChevronDown, ArrowUpDown, Wheat, Droplets, Leaf, Sprout, Coins, BarChart3, X, ExternalLink, PieChart, List, Timer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber, cn } from '../../lib/utils';
import OrderEditPopup from '../../components/OrderEditPopup';
import SearchableSelect from '../../components/SearchableSelect';
import Portal from '../../components/Portal';

const StatCard = ({ label, value, color, icon: Icon }) => (
    <m.div
        whileHover={{ y: -4, scale: 1.01 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden p-6 rounded-2xl border border-border pos-card bg-transparent shadow-none group transition-all duration-300"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full -mr-8 -mt-8`} />
        <div className="flex items-center justify-between">
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
                <Icon size={22} />
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black text-muted uppercase tracking-[0.15em]">{label}</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight mt-1">{value}</h3>
            </div>
        </div>
    </m.div>
);

export default function Reports() {
    const navigate = useNavigate();
    
    const getAbsoluteUrl = (path) => {
        const savedIp = localStorage.getItem('server_ip');
        const baseUrl = axios.defaults.baseURL;
        return `${baseUrl}${path}`;
    };
    const [tab, setTab] = useState('products');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [quarter, setQuarter] = useState("");
    const [day, setDay] = useState(new Date().getDate());
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showClosing, setShowClosing] = useState(false);

    // Pagination & Sorting state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(30);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState(tab === 'products' ? 'revenue' : 'total_amount');
    const [sortOrder, setSortOrder] = useState('desc');
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemOrders, setItemOrders] = useState([]);
    const [showItemOrders, setShowItemOrders] = useState(false);
    const [itemOrdersPage, setItemOrdersPage] = useState(1);
    const [itemOrdersTotalPages, setItemOrdersTotalPages] = useState(1);
    const [itemOrdersLimit] = useState(20);
    const [editingOrder, setEditingOrder] = useState(null);
    const [synthesisType, setSynthesisType] = useState('Sale'); // 'Sale' | 'Purchase'
    const [groupByBrand, setGroupByBrand] = useState(false);
    const [synthesisBaseData, setSynthesisBaseData] = useState([]);

    const partnerOptions = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        synthesisBaseData.forEach(item => {
            const pid = item.partner_id !== undefined && item.partner_id !== null ? String(item.partner_id) : '0';
            if (!seen.has(pid)) {
                seen.add(pid);
                unique.push({
                    id: pid,
                    name: item.partner_name || (synthesisType === 'Sale' ? 'KHÁCH LẺ' : 'NCC VÃNG LAI')
                });
            }
        });
        return unique.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }, [synthesisBaseData, synthesisType]);

    const productOptions = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        synthesisBaseData.forEach(item => {
            const prodId = item.product_id ? String(item.product_id) : '';
            if (prodId && !seen.has(prodId)) {
                seen.add(prodId);
                unique.push({
                    id: prodId,
                    name: item.product_name
                });
            }
        });
        return unique.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }, [synthesisBaseData]);

    // Synthesis Filters
    const [synthesisStartDate, setSynthesisStartDate] = useState('');
    const [synthesisEndDate, setSynthesisEndDate] = useState('');
    const [synthesisPartnerId, setSynthesisPartnerId] = useState('');
    const [synthesisProductId, setSynthesisProductId] = useState('');

    // Data lists for filters
    const [allPartners, setAllPartners] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const years = [];
    for (let i = 2023; i <= new Date().getFullYear() + 1; i++) years.push(i);

    useEffect(() => {
        setPage(1);
        setSortBy(tab === 'products' ? 'revenue' : 'total_amount');
        setSortOrder('desc');
    }, [tab]);

    useEffect(() => {
        fetchData();
    }, [tab, year, month, day, quarter, page, limit, sortBy, sortOrder, searchTerm, selectedBrand, synthesisType, synthesisStartDate, synthesisEndDate, synthesisPartnerId, synthesisProductId, groupByBrand]);

    useEffect(() => {
        if (!selectedBrand) {
            setGroupByBrand(false);
        }
        setSynthesisProductId('');
        setSynthesisPartnerId('');
    }, [selectedBrand]);

    useEffect(() => {
        const fetchBaseData = async () => {
            if (tab !== 'synthesis') return;
            try {
                const params = new URLSearchParams({
                    year, month, day, quarter,
                    search: searchTerm,
                    brand: selectedBrand,
                    type: synthesisType,
                    flatten: 'true'
                });
                if (synthesisStartDate) params.append('start_date', synthesisStartDate);
                if (synthesisEndDate) params.append('end_date', synthesisEndDate);
                
                const res = await axios.get(`/api/reports/synthesis?${params.toString()}`);
                const fullData = res.data.items || res.data;
                setSynthesisBaseData(fullData);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBaseData();
    }, [tab, year, month, day, quarter, searchTerm, selectedBrand, synthesisType, synthesisStartDate, synthesisEndDate]);

    useEffect(() => {
        const fetchAllPartners = async () => {
            if (tab === 'customers' || tab === 'suppliers') {
                try {
                    const res = await axios.get(`/api/partners?type=${tab === 'customers' ? 'Customer' : 'Supplier'}`);
                    setAllPartners(res.data);
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchAllPartners();
    }, [tab]);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await axios.get('/api/products/brands');
            setBrands(res.data);

            const prodRes = await axios.get('/api/products');
            setAllProducts(prodRes.data);

            const catRes = await axios.get('/api/categories');
            setAllCategories(catRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowClosing(false);
                setShowItemOrders(false);
                setEditingOrder(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        if (showClosing || showItemOrders || editingOrder || loading) {
            document.body.style.overflow = 'hidden';
            const mainContent = document.getElementById('main-content');
            if (mainContent) mainContent.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            const mainContent = document.getElementById('main-content');
            if (mainContent) mainContent.style.overflow = 'auto';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            const mainContent = document.getElementById('main-content');
            if (mainContent) mainContent.style.overflow = 'auto';
        };
    }, [showClosing, showItemOrders, editingOrder, loading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            const params = new URLSearchParams({
                year,
                month,
                day,
                quarter,
                page,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
                search: searchTerm,
                brand: selectedBrand
            });

            if (tab === 'products') {
                res = await axios.get(`/api/reports/products?${params.toString()}`);
            } else if (tab === 'customers') {
                params.append('type', 'Customer');
                res = await axios.get(`/api/reports/partners?${params.toString()}`);
            } else if (tab === 'suppliers') {
                params.append('type', 'Supplier');
                res = await axios.get(`/api/reports/partners?${params.toString()}`);
            } else if (tab === 'unsold') {
                res = await axios.get(`/api/reports/unsold?${params.toString()}`);
            } else if (tab === 'synthesis') {
                params.append('type', synthesisType);
                params.append('flatten', 'true');
                if (synthesisStartDate) params.append('start_date', synthesisStartDate);
                if (synthesisEndDate) params.append('end_date', synthesisEndDate);
                if (synthesisPartnerId) params.append('partner_id', synthesisPartnerId);
                if (synthesisProductId) params.append('product_id', synthesisProductId);
                if (groupByBrand) params.append('group_by_brand', 'true');

                res = await axios.get(`/api/reports/synthesis?${params.toString()}`);
            }

            if (res.data.items) {
                setData(res.data.items);
                setTotalItems(res.data.total);
                setTotalPages(res.data.pages);
            } else {
                setData(res.data);
                setTotalItems(res.data.length);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Lỗi tải báo cáo:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <ArrowUpDown size={14} className="ml-1 opacity-20 group-hover:opacity-50 transition-all" />;
        return sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1 text-[#4a7c59]" /> : <ChevronDown size={14} className="ml-1 text-[#4a7c59]" />;
    };

    const [overallTotals, setOverallTotals] = useState({ revenue: 0, profit: 0, count: 0 });

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const params = new URLSearchParams({ year, month, day, quarter, search: searchTerm, brand: selectedBrand });
                let res;
                if (tab === 'products') {
                    res = await axios.get(`/api/reports/products?${params.toString()}`);
                } else if (tab === 'synthesis') {
                    params.append('type', synthesisType);
                    params.append('flatten', 'true');
                    if (synthesisStartDate) params.append('start_date', synthesisStartDate);
                    if (synthesisEndDate) params.append('end_date', synthesisEndDate);
                    if (synthesisPartnerId) params.append('partner_id', synthesisPartnerId);
                    if (synthesisProductId) params.append('product_id', synthesisProductId);
                    if (groupByBrand) params.append('group_by_brand', 'true');
                    res = await axios.get(`/api/reports/synthesis?${params.toString()}`);
                } else {
                    params.append('type', tab === 'customers' ? 'Customer' : 'Supplier');
                    res = await axios.get(`/api/reports/partners?${params.toString()}`);
                }
                const fullData = res.data.items || res.data;
                let rev = 0, prof = 0, cnt = 0, stock = 0, value = 0, items_count = 0;
                if (tab === 'unsold') {
                    items_count = fullData.length;
                    stock = fullData.reduce((s, i) => s + (i.stock || 0), 0);
                    value = fullData.reduce((s, i) => s + (i.total_value || 0), 0);
                } else {
                    rev = (tab === 'synthesis') ? 0 : fullData.reduce((sum, item) => sum + (item.revenue || item.total_amount || item.total || 0), 0);
                    prof = (tab === 'products' || tab === 'customers') ? fullData.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                    if (tab === 'synthesis') {
                        cnt = fullData.reduce((s, i) => s + (i.quantity || 0), 0);
                    } else {
                        cnt = tab === 'products' ? fullData.length : fullData.reduce((s, i) => s + (i.count || 0), 0);
                    }
                }
                setOverallTotals({ revenue: rev, profit: prof, count: cnt, stock, value, items_count });
            } catch (e) { console.error(e); }
        };
        fetchTotals();
    }, [tab, year, month, day, quarter, searchTerm, selectedBrand, synthesisType, synthesisStartDate, synthesisEndDate, synthesisPartnerId, synthesisProductId, groupByBrand]);

    const viewItemOrders = async (item, pageNum = 1) => {
        setSelectedItem(item);
        setItemOrdersPage(pageNum);
        setLoading(true);
        try {
            const params = new URLSearchParams({
                year, month, day, quarter,
                page: pageNum,
                limit: itemOrdersLimit
            });
            if (tab === 'products') {
                params.append('product_id', item.id);
                params.append('type', 'Sale');
            } else if (tab === 'synthesis') {
                params.append('type', synthesisType);
                if (item.product_id) params.append('product_id', item.product_id);
                if (item.partner_id !== undefined && item.partner_id !== null) {
                    params.append('partner_id', item.partner_id);
                } else {
                    params.append('partner_id', '0');
                }

                if (synthesisStartDate) params.append('start_date', synthesisStartDate);
                if (synthesisEndDate) params.append('end_date', synthesisEndDate);

            } else {
                params.append('partner_id', item.id);
                params.append('type', tab === 'customers' ? 'Sale' : 'Purchase');
            }
            const res = await axios.get(`/api/orders?${params.toString()}`);
            if (res.data.items) {
                setItemOrders(res.data.items);
                setItemOrdersTotalPages(res.data.pages);
            } else {
                setItemOrders(res.data);
                setItemOrdersTotalPages(1);
            }
            setShowItemOrders(true);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handlePrintSummary = () => {
        const modal = document.getElementById('summary-modal-content');
        if (!modal) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Báo cáo vụ mùa</title>
                    <style>
                        @page { size: auto; margin: 15mm; }
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        h2 { text-transform: uppercase; color: #065f46; border-bottom: 2px solid #065f46; padding-bottom: 10px; }
                        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                        .stat-item { border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; }
                        .stat-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
                        .stat-value { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 5px; }
                        .no-print { display: none !important; }
                    </style>
                </head>
                <body>
                    ${modal.innerHTML}
                </body>
            </html>
        `);
        doc.close();

        const headStyles = document.querySelectorAll('style');
        headStyles.forEach(style => {
            const newStyle = doc.createElement('style');
            newStyle.textContent = style.textContent;
            doc.head.appendChild(newStyle);
        });

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 300);
    };

    const handleExportSynthesis = async () => {
        try {
            const params = new URLSearchParams();
            params.append('type', synthesisType);
            params.append('flatten', 'true');
            if (synthesisStartDate) params.append('start_date', synthesisStartDate);
            if (synthesisEndDate) params.append('end_date', synthesisEndDate);
            if (synthesisPartnerId) params.append('partner_id', synthesisPartnerId);
            if (synthesisProductId) params.append('product_id', synthesisProductId);
            if (selectedBrand) params.append('brand', selectedBrand);
            if (groupByBrand) params.append('group_by_brand', 'true');
            
            const res = await axios.get(`/api/reports/synthesis?${params.toString()}`);
            const items = res.data.items || res.data || [];
            
            const XLSX = await import('xlsx');
            const excelRows = items.map(r => ({
                'Đối Tác': r.partner_name || (synthesisType === 'Sale' ? 'KHÁCH LẺ' : 'NCC VÃNG LAI'),
                'Số Điện Thoại': r.partner_phone || '',
                'Sản Phẩm': r.product_name || '',
                'Hãng': r.brand || '',
                'ĐVT': r.unit || '',
                'Số Lượng': r.quantity || 0,
                'Doanh Thu': r.revenue || 0,
                'Ghi Chú': r.is_from_combo ? `Từ Combo: ${r.original_combo}` : ''
            }));

            const ws = XLSX.utils.json_to_sheet(excelRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "BaoCaoTongHop");
            
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            const { saveOrOpenFile } = await import('../../utils/downloadHelper');
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            await saveOrOpenFile(blob, `bao_cao_tong_hop_${synthesisType}_${todayStr}.xlsx`);
        } catch (err) {
            console.error("Export Synthesis Error:", err);
        }
    };

    return (
        <div className="pt-2 px-4 pb-20 w-full transition-colors duration-300">
            <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#2d5016] dark:text-[#4a7c59] uppercase tracking-tight flex items-center gap-3 pt-2 pb-0.5 leading-relaxed">
                        <FileText className="text-[#2d5016] dark:text-[#4a7c59]" size={32} />
                        BÁO CÁO KINH DOANH
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg tracking-tighter">LyangPOS by Lyang</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Số liệu doanh thu và hiệu quả kinh doanh</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pos-card bg-transparent border border-border p-2 rounded-2xl shadow-none">
                    <Calendar size={20} className="ml-2 text-primary" />
                    <select value={day} onChange={(e) => { setDay(e.target.value); setPage(1); }} className="bg-transparent border-none outline-none font-black text-sm text-primary cursor-pointer uppercase"><option value="">Ngày: Tất cả</option>{[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <select value={month} onChange={(e) => { setMonth(e.target.value); setQuarter(""); setPage(1); }} className="bg-transparent border-none outline-none font-black text-sm text-primary cursor-pointer uppercase"><option value="">Tháng: Tất cả</option>{[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <select value={quarter} onChange={(e) => { setQuarter(e.target.value); setMonth(""); setDay(""); setPage(1); }} className="bg-transparent border-none outline-none font-black text-sm text-primary cursor-pointer uppercase"><option value="">Quý: Tất cả</option><option value="1">Quý 1</option><option value="2">Quý 2</option><option value="3">Quý 3</option><option value="4">Quý 4</option></select>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <select value={year} onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }} className="bg-transparent border-none outline-none font-black text-sm text-primary cursor-pointer pr-4 uppercase">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => fetchData()} className="p-3 bg-transparent hover:bg-primary/10 rounded-2xl border border-border text-primary hover:border-border transition-all active:scale-95 shadow-none" title="Tải lại dữ liệu"><RefreshCcw size={20} /></button>
                    <button onClick={() => setShowClosing(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-black active:scale-95 transition-all shadow-none"><Download size={20} /> XUẤT BÁO CÁO</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard label={tab === 'synthesis' ? "Tổng số lượng hàng" : tab === 'unsold' ? "Tổng tồn kho ế" : "Tổng doanh thu"} value={tab === 'synthesis' ? formatNumber(overallTotals.count) : tab === 'unsold' ? formatNumber(overallTotals.stock) : formatCurrency(overallTotals.revenue)} color="bg-primary" icon={tab === 'synthesis' ? Package : tab === 'unsold' ? Package : Coins} />
                <StatCard label={tab === 'synthesis' ? "Loại báo cáo" : tab === 'unsold' ? "Tổng giá trị tồn" : "Tổng lợi nhuận"} value={tab === 'synthesis' ? (synthesisType === 'Sale' ? 'Hàng Bán' : 'Hàng Nhập') : tab === 'unsold' ? formatCurrency(overallTotals.value) : formatCurrency(overallTotals.profit)} color="bg-primary" icon={TrendingUp} />
                <StatCard label={tab === 'unsold' ? "Số lượng mặt hàng" : "Số lượng giao dịch"} value={tab === 'synthesis' ? "-" : tab === 'unsold' ? formatNumber(overallTotals.items_count) : overallTotals.count} color="bg-primary" icon={Sprout} />
            </div>

            <div className="pos-card bg-transparent border border-border rounded-3xl overflow-hidden shadow-none flex flex-col">
                <div className="flex p-1.5 bg-transparent gap-2 relative border-b border-border">
                    <button
                        onClick={() => setTab('products')}
                        className={cn(
                            "relative z-10 flex-1 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all rounded-xl",
                            tab === 'products' ? 'text-white' : 'text-[#8b6f47] hover:bg-[#d4a574]/10'
                        )}
                    >
                        <Wheat size={18} /> SẢN PHẨM
                        {tab === 'products' && (
                            <m.div
                                layoutId="reportsTabIndicator"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setTab('customers')}
                        className={cn(
                            "relative z-10 flex-1 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all rounded-xl",
                            tab === 'customers' ? 'text-white' : 'text-[#8b6f47] hover:bg-[#d4a574]/10'
                        )}
                    >
                        <Users size={18} /> KHÁCH HÀNG
                        {tab === 'customers' && (
                            <m.div
                                layoutId="reportsTabIndicator"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setTab('suppliers')}
                        className={cn(
                            "relative z-10 flex-1 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all rounded-xl",
                            tab === 'suppliers' ? 'text-white' : 'text-[#8b6f47] hover:bg-[#d4a574]/10'
                        )}
                    >
                        <Truck size={18} /> NHÀ CUNG CẤP
                        {tab === 'suppliers' && (
                            <m.div
                                layoutId="reportsTabIndicator"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setTab('synthesis')}
                        className={cn(
                            "relative z-10 flex-1 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all rounded-xl",
                            tab === 'synthesis' ? 'text-white' : 'text-[#8b6f47] hover:bg-[#d4a574]/10'
                        )}
                    >
                        <PieChart size={18} /> TỔNG HỢP
                        {tab === 'synthesis' && (
                            <m.div
                                layoutId="reportsTabIndicator"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setTab('unsold')}
                        className={cn(
                            "relative z-10 flex-1 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all rounded-xl",
                            tab === 'unsold' ? 'text-white' : 'text-[#8b6f47] hover:bg-[#d4a574]/10'
                        )}
                    >
                        <Timer size={18} /> HÀNG TỒN LÂU
                        {tab === 'unsold' && (
                            <m.div
                                layoutId="reportsTabIndicator"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                </div>

                <div className="p-4 bg-transparent border-b border-border flex flex-wrap items-center justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                        <input type="text" placeholder={`Tìm kiếm trong vụ mùa...`} className="w-full pl-12 pr-4 py-2.5 bg-transparent border border-border rounded-xl outline-none focus:border-primary font-bold text-sm text-primary transition-all shadow-none" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
                    </div>
                    <div className="flex items-center gap-4">
                        {tab === 'synthesis' && (
                            <button
                                onClick={handleExportSynthesis}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-none active:scale-95 transition-all group"
                            >
                                <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                                XUẤT EXCEL
                            </button>
                        )}
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-black uppercase text-primary/60">Dòng:</span>
                            <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} className="bg-transparent border-b border-border px-3 py-1.5 text-xs font-black outline-none text-primary cursor-pointer">
                                <option value={10}>10</option><option value={30}>30</option><option value={50}>50</option><option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>

                {tab === 'synthesis' && (
                    <div className="p-4 bg-primary/5 border-b border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Loại giao dịch</span>
                            <select value={synthesisType} onChange={e => { setSynthesisType(e.target.value); setPage(1); }} className="w-full bg-transparent border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-primary cursor-pointer focus:border-primary">
                                <option value="Sale">Hàng Bán</option>
                                <option value="Purchase">Hàng Nhập</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Từ ngày - Đến ngày</span>
                            <div className="flex items-center gap-1 border border-border rounded-xl px-2 py-1.5 bg-transparent">
                                <input type="date" value={synthesisStartDate} onChange={(e) => { setSynthesisStartDate(e.target.value); setPage(1); }} className="bg-transparent border-none outline-none font-bold text-[11px] text-primary uppercase w-full" />
                                <span className="text-muted text-xs font-bold">-</span>
                                <input type="date" value={synthesisEndDate} onChange={(e) => { setSynthesisEndDate(e.target.value); setPage(1); }} className="bg-transparent border-none outline-none font-bold text-[11px] text-primary uppercase w-full" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Đối tác</span>
                            <SearchableSelect
                                placeholder="Tất cả đối tác"
                                options={partnerOptions}
                                value={synthesisPartnerId}
                                onChange={(val) => { setSynthesisPartnerId(val); setPage(1); }}
                                displayValue="name"
                                valueKey="id"
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Hàng hóa</span>
                            <SearchableSelect
                                placeholder="Tất cả hàng hóa"
                                options={productOptions}
                                value={synthesisProductId}
                                onChange={(val) => { setSynthesisProductId(val); setPage(1); }}
                                displayValue="name"
                                valueKey="id"
                                className="w-full text-xs"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Hãng</span>
                            <SearchableSelect
                                placeholder="Tất cả hãng"
                                options={brands}
                                value={selectedBrand}
                                onChange={(val) => { setSelectedBrand(val); setPage(1); }}
                                displayValue={item => item}
                                valueKey={null}
                                className="w-full text-xs"
                            />
                        </div>

                        {selectedBrand && (
                            <div className="flex flex-col gap-1.5 justify-end">
                                <button
                                    onClick={() => { setGroupByBrand(!groupByBrand); setPage(1); }}
                                    className={cn(
                                        "w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 border",
                                        groupByBrand
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                                            : "bg-transparent text-primary border-primary/30 hover:bg-primary/5"
                                    )}
                                >
                                    {groupByBrand ? "✓ Đã gộp hãng" : "Gộp theo hãng"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 overflow-x-auto no-scrollbar min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <m.div
                            key={tab + page}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-border text-[10px] font-black tracking-widest text-muted uppercase">
                                        {tab === 'synthesis' ? (
                                            <>
                                                <th onClick={() => handleSort('partner_name')} className="p-4 cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center gap-1">ĐỐI TÁC <SortIcon field="partner_name" /></div></th>
                                                <th onClick={() => handleSort('product_name')} className="p-4 cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center gap-1">SẢN PHẨM <SortIcon field="product_name" /></div></th>
                                                <th onClick={() => handleSort('brand')} className="p-4 cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center gap-1">HÃNG <SortIcon field="brand" /></div></th>
                                                <th className="p-4 text-center border-b border-border"><div className="flex items-center justify-center">ĐVT</div></th>
                                                <th onClick={() => handleSort('quantity')} className="p-4 text-center cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center justify-center gap-1">SỐ LƯỢNG <SortIcon field="quantity" /></div></th>
                                                <th onClick={() => handleSort('revenue')} className="p-4 text-right cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center justify-end gap-1">THÀNH TIỀN <SortIcon field="revenue" /></div></th>
                                            </>
                                        ) : tab === 'unsold' ? (
                                            <>
                                                <th className="p-4 border-b border-border text-left">SẢN PHẨM</th>
                                                <th className="p-4 text-center border-b border-border">ĐVT</th>
                                                <th className="p-4 text-center border-b border-border">TỒN KHO</th>
                                                <th className="p-4 text-right border-b border-border">VỐN TỒN KHO</th>
                                                <th className="p-4 text-right border-b border-border">LẦN BÁN CUỐI</th>
                                                <th className="p-4 text-right border-b border-border">SỐ NGÀY Ế</th>
                                            </>
                                        ) : (
                                            <>
                                                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center">TÊN {tab === 'products' ? 'SẢN PHẨM' : 'ĐỐI TÁC'} <SortIcon field="name" /></div></th>
                                                {tab === 'products' && <th className="p-4 text-center border-b border-border">ĐVT</th>}
                                                <th onClick={() => handleSort(tab === 'products' ? 'quantity' : 'count')} className="p-4 text-center cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center justify-center">{tab === 'products' ? 'SỐ LƯỢNG' : 'SỐ ĐƠN'} <SortIcon field={tab === 'products' ? 'quantity' : 'count'} /></div></th>
                                                <th onClick={() => handleSort(tab === 'products' ? 'revenue' : 'total_amount')} className="p-4 text-right cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center justify-end">DOANH THU <SortIcon field={tab === 'products' ? 'revenue' : 'total_amount'} /></div></th>
                                                {tab !== 'suppliers' && <th onClick={() => handleSort('profit')} className="p-4 text-right cursor-pointer hover:text-primary transition-colors group border-b border-border"><div className="flex items-center justify-end">LỢI NHUẬN <SortIcon field="profit" /></div></th>}
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.length > 0 ? (
                                        data.map((item, idx) => (
                                            <tr key={idx} onClick={() => viewItemOrders(item)} className="hover:bg-primary/5 border-b border-border transition-all group cursor-pointer">
                                                {tab === 'synthesis' ? (
                                                    <>
                                                        <td className="p-4 font-black text-foreground text-xs">{item.partner_name}</td>
                                                        <td className="p-4 font-bold text-foreground text-xs">{item.product_name}</td>
                                                        <td className="p-4 font-bold text-muted text-[10px] uppercase">{item.brand}</td>
                                                        <td className="p-4 text-center font-bold text-muted text-xs">{item.unit}</td>
                                                    </>
                                                ) : tab === 'unsold' ? (
                                                    <td className="p-4">
                                                        <div className="font-black text-foreground uppercase text-xs tracking-tight">{item.name}</div>
                                                        <div className="text-[9px] text-muted font-bold uppercase">{item.code}</div>
                                                    </td>
                                                ) : (
                                                    <td className="p-4">
                                                        <div className="font-black text-foreground uppercase text-xs tracking-tight group-hover:text-primary transition-colors">{item.name}</div>
                                                        {tab === 'products' && item.brand && <div className="text-[9px] text-muted font-bold uppercase">{item.brand}</div>}
                                                    </td>
                                                )}
                                                {tab === 'products' && tab !== 'synthesis' && <td className="p-4 text-center font-bold text-muted text-xs">{item.unit}</td>}
                                                {tab === 'unsold' && <td className="p-4 text-center font-bold text-muted text-xs">{item.unit}</td>}
                                                
                                                {tab === 'unsold' ? (
                                                    <>
                                                        <td className="p-4 text-center"><span className="bg-primary/10 px-3 py-1 rounded-lg font-black text-primary text-xs">{formatNumber(item.stock)}</span></td>
                                                        <td className="p-4 text-right font-black text-primary text-base">{formatCurrency(item.total_value)}</td>
                                                        <td className="p-4 text-right font-bold text-muted text-xs">{item.last_sold_date ? item.last_sold_date : 'Chưa từng bán'}</td>
                                                        <td className="p-4 text-right">
                                                            <span className={cn("px-2 py-1 rounded-lg font-black text-xs", item.days_unsold > 90 ? "bg-rose-100 text-rose-600" : item.days_unsold > 30 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600")}>
                                                                {item.days_unsold === 999999 ? '∞' : `${item.days_unsold} ngày`}
                                                            </span>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-4 text-center"><span className="bg-primary/10 px-3 py-1 rounded-lg font-black text-primary text-xs">{formatNumber(item.quantity || item.count)}</span></td>
                                                        {(tab !== 'products' || tab === 'synthesis') && <td className="p-4 text-right font-black text-primary text-base">{formatNumber(item.revenue || item.total_amount || item.total)}</td>}
                                                        {tab === 'products' && <td className="p-4 text-right font-black text-primary text-base">{formatNumber(item.revenue)}</td>}
        
                                                        {tab !== 'suppliers' && tab !== 'synthesis' && (
                                                            <td className="p-4 text-right">
                                                                <div className={cn("font-black text-sm", item.profit > 0 ? "text-primary" : "text-rose-600")}>{formatNumber(item.profit)}</div>
                                                                <div className="text-[9px] text-muted font-black uppercase">{(item.revenue || item.total_amount) > 0 ? ((item.profit / (item.revenue || item.total_amount)) * 100).toFixed(1) : 0}% LÃI</div>
                                                            </td>
                                                        )}
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="p-20 text-center text-primary/30 font-black uppercase tracking-widest text-xs">Không có dữ liệu thu hoạch</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </m.div>
                    </AnimatePresence>
                </div>
 
                <div className="px-6 py-4 bg-transparent border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest">Hiển thị <span className="text-primary">{(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)}</span> trên <span className="text-primary">{totalItems}</span> kết quả</div>
                    <div className="flex items-center gap-1.5">
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary">Trước</button>
                        {[...Array(totalPages)].map((_, i) => {
                            const pNum = i + 1;
                            if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                                return <button key={pNum} onClick={() => setPage(pNum)} className={cn("w-9 h-9 rounded-xl text-xs font-black transition-all", page === pNum ? "bg-primary text-white border-0" : "hover:bg-primary/10 text-muted border border-border")}>{pNum}</button>;
                            }
                            if (pNum === page - 3 || pNum === page + 3) return <span key={pNum} className="px-1 text-muted">...</span>;
                            return null;
                        })}
                        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-primary/10 transition-all text-primary">Sau</button>
                    </div>
                </div>
            </div>

            <Portal>
                <AnimatePresence>
                    {showClosing && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/20 backdrop-blur-md" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0"
                                onClick={() => setShowClosing(false)}
                            />
                            <m.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="modal-premium w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border relative z-10"
                            >
                                <div id="summary-modal-content">
                                    <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
                                        <div>
                                            <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Báo cáo kết sổ vụ mùa</h2>
                                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">{day && `Ngày ${day} `}{month && `Tháng ${month} `}{quarter && `Quý ${quarter} `} Năm {year}</p>
                                        </div>
                                        <button onClick={() => setShowClosing(false)} className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-primary no-print"><RefreshCcw size={20} /></button>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Doanh thu</p>
                                                <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(overallTotals.revenue)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Lợi nhuận</p>
                                                <p className="text-3xl font-black text-[#d4a574] tracking-tighter">{formatCurrency(overallTotals.profit)}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-primary/5 rounded-2xl border border-border">
                                            <h4 className="text-[10px] font-black text-primary uppercase mb-4 tracking-[0.3em]">Chi tiết vụ mùa</h4>
                                            <div className="space-y-4">
                                                <div className="justify-between flex items-center"><span className="text-xs font-bold text-muted uppercase">Đối tượng báo cáo:</span><span className="font-black text-primary text-sm uppercase">{formatNumber(totalItems)} {tab === 'products' ? 'Sản phẩm' : 'Đối tác'}</span></div>
                                                <div className="justify-between flex items-center"><span className="text-xs font-bold text-muted uppercase">Tỷ suất sinh lời:</span><span className="font-black text-[#d4a574] text-sm uppercase">{overallTotals.revenue > 0 ? ((overallTotals.profit / overallTotals.revenue) * 100).toFixed(1) : 0}% LÃI ròng</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 pt-0 flex gap-4">
                                    <button onClick={handlePrintSummary} className="flex-1 bg-primary text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary-hover transition-all active:scale-95 no-print">In báo cáo vụ mùa</button>
                                    <button onClick={() => setShowClosing(false)} className="flex-1 bg-transparent border border-border text-primary py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary/10 transition-all active:scale-95 no-print">Đóng lại</button>
                                </div>
                            </m.div>
                        </div>
                    )}
                </AnimatePresence>
            </Portal>

            <Portal>
                <AnimatePresence>
                    {showItemOrders && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0" onClick={() => setShowItemOrders(false)} />
                            <m.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                                className="modal-premium w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-border relative z-10 flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
                                    <div>
                                        <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Lịch sử giao dịch: {tab === 'synthesis' ? `${selectedItem?.product_name} - ${selectedItem?.partner_name}` : selectedItem?.name}</h2>
                                        <p className="text-[10px] text-muted font-black uppercase tracking-widest">Hiển thị tối đa 100 đơn hàng gần nhất trong kỳ</p>
                                    </div>
                                    <button onClick={() => setShowItemOrders(false)} className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"><X size={22} /></button>
                                </div>
                                <div className="flex-1 overflow-auto p-6">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-transparent z-10">
                                            <tr className="border-b border-border">
                                                <th className="p-3 text-[10px] font-black uppercase text-muted">Mã đơn</th>
                                                <th className="p-3 text-[10px] font-black uppercase text-muted">Ngày giờ</th>
                                                {(tab === 'products' || tab === 'synthesis' || tab === 'customers' || tab === 'suppliers') && <th className="p-3 text-[10px] font-black uppercase text-muted text-center">{tab === 'suppliers' ? 'SL Mua' : 'SL Bán'}</th>}
                                                <th className="p-3 text-[10px] font-black uppercase text-muted text-right">Tổng thanh toán</th>
                                                <th className="p-3 text-[10px] font-black uppercase text-muted text-center">PTTT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {itemOrders.map(order => {
                                                const itemDetail = tab === 'products' ? order.details.find(d => d.product_id === selectedItem?.id) : null;
                                                return (
                                                    <tr key={order.id} className="hover:bg-primary/5 transition-colors">
                                                        <td className="p-3">
                                                            <button
                                                                onClick={() => setEditingOrder(order)}
                                                                className="flex items-center gap-1.5 font-black text-xs text-primary hover:text-primary-hover hover:underline"
                                                            >
                                                                #{order.display_id || order.id}
                                                                <ExternalLink size={10} />
                                                            </button>
                                                        </td>
                                                        <td className="p-3 text-xs text-muted font-bold">{new Date(order.date).toLocaleString('vi-VN')}</td>
                                                        {(tab === 'products' || tab === 'synthesis' || tab === 'customers' || tab === 'suppliers') && (
                                                            <td className="p-3 text-center text-xs font-black text-primary">
                                                                {tab === 'products' && itemDetail ? formatNumber(itemDetail.quantity) :
                                                                    tab === 'synthesis' ? (
                                                                        order.details.filter(d => d.product_id === selectedItem?.product_id).reduce((sum, d) => sum + d.quantity, 0)
                                                                    ) :
                                                                        (tab === 'customers' || tab === 'suppliers') ? (
                                                                            order.details.reduce((sum, d) => sum + d.quantity, 0)
                                                                        ) : '-'}
                                                            </td>
                                                        )}
                                                        <td className="p-3 text-xs text-right font-black text-primary">{formatNumber(order.total_amount)}</td>
                                                        <td className="p-3 text-center"><span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", order.payment_method === 'Cash' ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400")}>{order.payment_method === 'Cash' ? 'Tiền mặt' : 'Công nợ'}</span></td>
                                                    </tr>
                                                );
                                            })}
                                            {itemOrders.length === 0 && <tr><td colSpan={tab === 'products' ? "5" : "4"} className="p-10 text-center text-gray-400 font-bold">Không tìm thấy đơn hàng nào.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {itemOrdersTotalPages > 1 && (
                                    <div className="p-4 border-t border-border bg-transparent flex justify-center items-center gap-4">
                                        <button
                                            disabled={itemOrdersPage === 1}
                                            onClick={() => viewItemOrders(selectedItem, itemOrdersPage - 1)}
                                            className="px-4 py-1.5 bg-transparent border border-border rounded-xl text-[10px] font-black uppercase text-primary disabled:opacity-30 hover:bg-primary/10 transition-all"
                                        >
                                            Trang trước
                                        </button>
                                        <span className="text-[10px] font-black text-muted uppercase">Trang {itemOrdersPage} / {itemOrdersTotalPages}</span>
                                        <button
                                            disabled={itemOrdersPage === itemOrdersTotalPages}
                                            onClick={() => viewItemOrders(selectedItem, itemOrdersPage + 1)}
                                            className="px-4 py-1.5 bg-transparent border border-border rounded-xl text-[10px] font-black uppercase text-primary disabled:opacity-30 hover:bg-primary/10 transition-all"
                                        >
                                            Trang sau
                                        </button>
                                    </div>
                                )}
                            </m.div>
                        </div>
                    )}
                </AnimatePresence>
            </Portal>

            <Portal>
                <AnimatePresence>
                    {editingOrder && (
                        <OrderEditPopup
                            order={editingOrder}
                            partner={(tab === 'customers' || tab === 'suppliers') ? selectedItem : null}
                            onClose={() => setEditingOrder(null)}
                            onSave={() => {
                                // Update the itemOrders list locally or fetch
                                if (showItemOrders && selectedItem) {
                                    viewItemOrders(selectedItem, itemOrdersPage);
                                }
                                fetchData(); // Update totals
                                setEditingOrder(null);
                            }}
                        />
                    )}
                </AnimatePresence>
            </Portal>

            <Portal>
                <AnimatePresence>
                    {loading && (
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100000] flex items-center justify-center bg-transparent backdrop-blur-sm"
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        >
                            <m.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-emerald-100 dark:border-emerald-900/30 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    <Sprout size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-[0.3em]">Đang tải dữ liệu...</div>
                            </m.div>
                        </m.div>
                    )}
                </AnimatePresence>
            </Portal>
        </div>
    </div>
    );
}
