import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomSelect from '../../components/CustomSelect';
import { m, AnimatePresence } from 'framer-motion';
import { Search, Eye, TrendingUp, TrendingDown, Calendar, X, FileText, Trash2, Edit, ChevronUp, ChevronDown, ArrowUpDown, Wheat, Droplets, Leaf, Sprout, Coins, User, Clock, Package, History as HistoryIcon, AlertTriangle, CheckCircle, Warehouse } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_SETTINGS } from '../../lib/settings';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import Portal from '../../components/Portal';
import ComboSearch from '../../components/ComboSearch';

export default function History() {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('history_activeTab') || 'Sale');
    const [year, setYear] = useState(() => {
        const saved = localStorage.getItem('history_year');
        return saved ? parseInt(saved, 10) : new Date().getFullYear();
    });
    const [month, setMonth] = useState(() => {
        const saved = localStorage.getItem('history_month');
        return saved !== null ? saved : String(new Date().getMonth() + 1);
    });
    const [day, setDay] = useState(() => {
        const saved = localStorage.getItem('history_day');
        return saved !== null ? saved : String(new Date().getDate());
    });

    // Input states
    const [searchPartner, setSearchPartner] = useState(() => location.state?.searchPartner || localStorage.getItem('history_searchPartner') || '');
    const [searchId, setSearchId] = useState(() => location.state?.searchId || localStorage.getItem('history_searchId') || '');
    const [minPrice, setMinPrice] = useState(() => localStorage.getItem('history_minPrice') || "");
    const [maxPrice, setMaxPrice] = useState(() => localStorage.getItem('history_maxPrice') || "");
    const [exactPrice, setExactPrice] = useState(() => localStorage.getItem('history_exactPrice') || "");
    const [searchProduct, setSearchProduct] = useState(() => location.state?.searchProduct || localStorage.getItem('history_searchProduct') || '');

    // Query states
    const [searchPartnerQuery, setSearchPartnerQuery] = useState(() => location.state?.searchPartner || localStorage.getItem('history_searchPartnerQuery') || '');
    const [searchIdQuery, setSearchIdQuery] = useState(() => location.state?.searchId || localStorage.getItem('history_searchIdQuery') || '');
    const [minPriceQuery, setMinPriceQuery] = useState(() => localStorage.getItem('history_minPriceQuery') || "");
    const [maxPriceQuery, setMaxPriceQuery] = useState(() => localStorage.getItem('history_maxPriceQuery') || "");
    const [exactPriceQuery, setExactPriceQuery] = useState(() => localStorage.getItem('history_exactPriceQuery') || "");
    const [searchProductQuery, setSearchProductQuery] = useState(() => location.state?.searchProduct || localStorage.getItem('history_searchProductQuery') || '');
    const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('history_paymentMethod') || "");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [page, setPage] = useState(() => Number(localStorage.getItem('history_page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(() => Number(localStorage.getItem('history_limit')) || 30);
    const [scale, setScale] = useState(1);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        if (location.state?.searchId) {
            setSearchId(location.state.searchId);
            setSearchIdQuery(location.state.searchId);
        }
        if (location.state?.searchPartner) {
            setSearchPartner(location.state.searchPartner);
            setSearchPartnerQuery(location.state.searchPartner);
        }
        if (location.state?.searchProduct) {
            setSearchProduct(location.state.searchProduct);
            setSearchProductQuery(location.state.searchProduct);
        }
    }, [location.state]);
    const [allPartners, setAllPartners] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // Sorting state
    const [sortBy, setSortBy] = useState(() => localStorage.getItem('history_sortBy') || 'date');
    const [sortOrder, setSortOrder] = useState(() => localStorage.getItem('history_sortOrder') || 'desc');
    const [duplicates, setDuplicates] = useState([]);
    const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
    const [confirmingId, setConfirmingId] = useState(null);
    const [confirmedIds, setConfirmedIds] = useState([]);

    useEffect(() => {
        localStorage.setItem('history_activeTab', activeTab);
        localStorage.setItem('history_year', year ? year.toString() : '');
        localStorage.setItem('history_month', month !== null ? month.toString() : '');
        localStorage.setItem('history_day', day !== null ? day.toString() : '');
        localStorage.setItem('history_searchPartner', searchPartner || '');
        localStorage.setItem('history_searchId', searchId || '');
        localStorage.setItem('history_minPrice', minPrice || '');
        localStorage.setItem('history_maxPrice', maxPrice || '');
        localStorage.setItem('history_exactPrice', exactPrice || '');
        localStorage.setItem('history_searchProduct', searchProduct || '');
        localStorage.setItem('history_searchPartnerQuery', searchPartnerQuery || '');
        localStorage.setItem('history_searchIdQuery', searchIdQuery || '');
        localStorage.setItem('history_minPriceQuery', minPriceQuery || '');
        localStorage.setItem('history_maxPriceQuery', maxPriceQuery || '');
        localStorage.setItem('history_exactPriceQuery', exactPriceQuery || '');
        localStorage.setItem('history_searchProductQuery', searchProductQuery || '');
        localStorage.setItem('history_paymentMethod', paymentMethod || '');
        localStorage.setItem('history_page', page.toString());
        localStorage.setItem('history_limit', limit.toString());
        localStorage.setItem('history_sortBy', sortBy || '');
        localStorage.setItem('history_sortOrder', sortOrder || '');
    }, [activeTab, year, month, day, searchPartner, searchId, minPrice, maxPrice, exactPrice, searchPartnerQuery, searchIdQuery, minPriceQuery, maxPriceQuery, exactPriceQuery, searchProduct, searchProductQuery, paymentMethod, page, limit, sortBy, sortOrder]);

    const years = [];
    for (let i = 2023; i <= new Date().getFullYear() + 1; i++) years.push(i);

    useEffect(() => {
        fetchOrders();
    }, [page, activeTab, year, month, day, limit, searchPartnerQuery, searchIdQuery, minPriceQuery, maxPriceQuery, exactPriceQuery, searchProductQuery, sortBy, sortOrder, paymentMethod]);

    useEffect(() => {
        fetchSettings();
        fetchActiveFilters();
    }, [activeTab, year, month, day]);

    const fetchActiveFilters = async () => {
        try {
            const res = await axios.get('/api/history/active-filters', {
                params: { type: activeTab, year, month, day }
            });
            setAllPartners(res.data.partners);
            setAllProducts(res.data.products);
        } catch (err) { console.error(err); }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`/api/print-templates?module=${activeTab}`);
            const data = res.data;
            if (data && data.length > 0) {
                const defaultTemplate = data.find(t => t.is_default) || data[0];
                if (defaultTemplate) {
                    try {
                        const config = JSON.parse(defaultTemplate.config);
                        setSettings(prev => ({ ...prev, ...config }));
                    } catch (e) { console.error(e); }
                }
            } else {
                const oldRes = await axios.get('/api/settings');
                if (Object.keys(oldRes.data).length > 0) setSettings(prev => ({ ...prev, ...oldRes.data }));
            }
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/orders`, {
                params: {
                    type: activeTab,
                    year, month, day,
                    search_partner: searchPartnerQuery,
                    search_id: searchIdQuery,
                    minPrice: minPriceQuery,
                    maxPrice: maxPriceQuery,
                    page, limit,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    payment_method: paymentMethod || undefined,
                    search_product: searchProductQuery
                }
            });
            if (res.data.items) {
                setOrders(res.data.items);
                setTotalPages(res.data.pages);
                setTotalItems(res.data.total);
            } else {
                setOrders(res.data);
                setTotalPages(1);
                setTotalItems(res.data.length);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDuplicates = async () => {
        try {
            const res = await axios.get('/api/orders/duplicates');
            setDuplicates(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching duplicates", err);
            setDuplicates([]);
        }
    };


    const handleCheckDuplicate = async (orderId) => {
        setConfirmingId(orderId);
        try {
            await axios.post(`/api/orders/${orderId}/check-duplicate`);
            setConfirmedIds(prev => [...prev, orderId]);
            await new Promise(resolve => setTimeout(resolve, 850));
            fetchDuplicates();
            setConfirmedIds(prev => prev.filter(id => id !== orderId));
        } catch (err) {
            console.error("Error checking duplicate", err);
            alert("Không thể xác nhận đơn. Vui lòng thử lại.");
        } finally {
            setConfirmingId(null);
        }
    };

    useEffect(() => {
        if (activeTab === 'Sale') {
            fetchDuplicates();
        } else {
            setDuplicates([]);
            setShowOnlyDuplicates(false);
        }

        const syncChannel = new BroadcastChannel('pos_data_sync');
        syncChannel.onmessage = (event) => {
            if (event.data?.type === 'SETTINGS_UPDATED') {
                fetchSettings();
            }
        };
        return () => {
            syncChannel.close();
        };
    }, [activeTab]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedOrder(null);
                setConfirm(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        if (selectedOrder) {
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
    }, [selectedOrder]);

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
        if (sortBy !== field) return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
        return sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1 text-[#4a7c59]" /> : <ChevronDown size={14} className="ml-1 text-[#4a7c59]" />;
    };

    const handleSearchTrigger = () => {
        setSearchPartnerQuery(searchPartner);
        setSearchIdQuery(searchId);
        setSearchProductQuery(searchProduct);
        if (exactPrice) {
            setMinPriceQuery(exactPrice);
            setMaxPriceQuery(exactPrice);
            setExactPriceQuery(exactPrice);
        } else {
            setMinPriceQuery(minPrice);
            setMaxPriceQuery(maxPrice);
            setExactPriceQuery("");
        }
        setPage(1);
    };

    const handleClearSearch = () => {
        setSearchPartner('');
        setSearchId('');
        setMinPrice('');
        setMaxPrice('');
        setExactPrice('');
        setSearchPartnerQuery('');
        setSearchIdQuery('');
        setMinPriceQuery('');
        setMaxPriceQuery('');
        setExactPriceQuery('');
        setSearchProduct('');
        setSearchProductQuery('');
        setPaymentMethod('');
        setPage(1);
    };

    const handleDelete = (id) => {
        setConfirm({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn muốn XÓA đơn hàng này? Thao tác này sẽ cập nhật lại kho và công nợ.",
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/orders/${id}`);
                    setToast({ message: "Đã xóa đơn hàng thành công", type: "success" });
                    fetchOrders();
                    if (activeTab === 'Sale') {
                        fetchDuplicates();
                    }
                } catch (err) {
                    setToast({ message: err.response?.data?.error || "Lỗi khi xóa đơn hàng", type: "error" });
                }
                setConfirm(null);
            },
            type: "danger"
        });
    };

    return (
        <div className="pt-2 px-4 pb-20 w-full transition-colors">
            <div className="flex-1 flex flex-col overflow-hidden">
            <div className="no-print space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-4 md:px-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#2d5016] dark:text-[#4a7c59] uppercase tracking-tight flex items-center gap-3 pt-2 pb-0.5 leading-relaxed">
                            <HistoryIcon className="text-[#2d5016] dark:text-[#4a7c59]" size={32} />
                            Nhật Ký Vụ Mùa
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg tracking-tighter">LyangPOS by Lyang</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500">Tra cứu lịch sử bán hàng và nhập hàng</p>
                        </div>
                    </div>
                    <div className="flex p-1.5 pos-card rounded-2xl relative">
                        <button
                            onClick={() => { setActiveTab('Sale'); setPage(1); }}
                            className={cn(
                                "relative z-10 px-8 py-2.5 rounded-xl text-sm font-black uppercase transition-all flex items-center gap-2",
                                activeTab === 'Sale' ? "text-white" : "text-[#8b6f47] hover:text-[#2d5016] dark:text-[#d4a574]/60 dark:hover:text-[#d4a574]"
                            )}
                        >
                            <Wheat size={18} /> BÁN HÀNG
                            {activeTab === 'Sale' && (
                                <m.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('Purchase'); setPage(1); }}
                            className={cn(
                                "relative z-10 px-8 py-2.5 rounded-xl text-sm font-black uppercase transition-all flex items-center gap-2",
                                activeTab === 'Purchase' ? "text-white" : "text-[#8b6f47] hover:text-[#2d5016] dark:text-[#d4a574]/60 dark:hover:text-[#d4a574]"
                            )}
                        >
                            <Sprout size={18} /> NHẬP HÀNG
                            {activeTab === 'Purchase' && (
                                <m.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    </div>
                </div>

                <div className="relative pos-card p-6 rounded-2xl space-y-6 overflow-hidden">
                    {/* Subtle grain pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}></div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                        <div className="md:col-span-9 flex items-center gap-3 pos-card p-3 rounded-2xl transition-all">
                            <Calendar size={20} className="ml-2 text-[#4a7c59]" />
                            <CustomSelect
                                className="border-0 p-0 min-w-[120px]"
                                value={day}
                                onChange={(e) => { setDay(e.target.value); setPage(1); }}
                                options={[
                                    { value: "", label: "Ngày: Tất cả" },
                                    ...[...Array(31)].map((_, i) => ({ value: String(i + 1), label: String(i + 1) }))
                                ]}
                            />
                            <div className="w-px h-6 bg-[#d4a574]/30 mx-1"></div>
                            <CustomSelect
                                className="border-0 p-0 min-w-[130px]"
                                value={month}
                                onChange={(e) => { setMonth(e.target.value); setPage(1); }}
                                options={[
                                    { value: "", label: "Tháng: Tất cả" },
                                    ...[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }))
                                ]}
                            />
                            <div className="w-px h-6 bg-[#d4a574]/30 mx-1"></div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-[#8b6f47] uppercase shrink-0">Năm:</span>
                                <CustomSelect
                                    className="border-0 p-0 min-w-[80px]"
                                    value={year}
                                    onChange={(e) => { setYear(parseInt(e.target.value)); setPage(1); }}
                                    options={years.map(y => ({ value: y, label: String(y) }))}
                                />
                            </div>

                            <div className="w-px h-6 bg-[#d4a574]/30 mx-1 hidden sm:block"></div>
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    setDay(now.getDate());
                                    setMonth(now.getMonth() + 1);
                                    setYear(now.getFullYear());
                                    setPage(1);
                                }}
                                className="px-4 py-1.5 bg-[#2d5016]/10 hover:bg-[#2d5016] text-[#2d5016] hover:text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                            >
                                <Clock size={14} /> Hôm nay
                            </button>
                        </div>

                        <div className="md:col-span-3">
                            <button onClick={handleSearchTrigger} className="w-full h-full bg-transparent border border-border text-primary hover:bg-primary/10 p-3 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-none">
                                <Search size={18} /> Lọc kết quả
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t-2 border-[#d4a574]/20 relative z-10 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Số tiền (đ):</span>
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    placeholder="Chính xác"
                                    value={exactPrice}
                                    onChange={e => {
                                        setExactPrice(e.target.value);
                                        if (e.target.value) {
                                            setMinPrice('');
                                            setMaxPrice('');
                                        }
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleSearchTrigger()}
                                    className="w-24 px-3 py-2 bg-transparent border border-border focus:border-emerald-500 rounded-xl outline-none font-bold text-xs dark:text-white transition-all"
                                />
                                <span className="text-[10px] text-[#8b6f47]/50 font-black uppercase">hoặc</span>
                                <input
                                    type="number"
                                    placeholder="Từ"
                                    value={minPrice}
                                    onChange={e => {
                                        setMinPrice(e.target.value);
                                        if (e.target.value) setExactPrice('');
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleSearchTrigger()}
                                    className="w-20 px-3 py-2 bg-transparent border border-border focus:border-emerald-500 rounded-xl outline-none font-bold text-xs dark:text-white transition-all"
                                />
                                <span className="text-emerald-500/50">→</span>
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    value={maxPrice}
                                    onChange={e => {
                                        setMaxPrice(e.target.value);
                                        if (e.target.value) setExactPrice('');
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleSearchTrigger()}
                                    className="w-20 px-3 py-2 bg-transparent border border-border focus:border-emerald-500 rounded-xl outline-none font-bold text-xs dark:text-white transition-all"
                                />
                            </div>
                        </div>

                        <ComboSearch
                            value={searchPartner}
                            onChange={setSearchPartner}
                            onSearch={handleSearchTrigger}
                            options={allPartners}
                            placeholder="Tất cả đối tác..."
                            icon={User}
                        />

                        <div className="relative flex-1 min-w-[140px]">
                            <FileText className="absolute left-3 top-2.5 text-emerald-500/50" size={16} />
                            <input
                                type="text"
                                placeholder="Mã đơn..."
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearchTrigger()}
                                className="w-full pl-9 pr-4 py-2 bg-transparent border border-border focus:border-emerald-500 rounded-xl focus:outline-none font-bold transition-all text-xs dark:text-white"
                            />
                        </div>

                        <ComboSearch
                            value={searchProduct}
                            onChange={setSearchProduct}
                            onSearch={handleSearchTrigger}
                            options={allProducts}
                            placeholder="Tất cả sản phẩm..."
                            icon={Package}
                        />

                        <div className="flex bg-transparent p-1.5 rounded-xl border border-border">
                            {['', 'Cash', 'Debt'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => { setPaymentMethod(m); setPage(1); }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap",
                                        paymentMethod === m ? "bg-[#2d5016] text-white shadow-md scale-105" : "text-[#8b6f47]/60 hover:text-[#2d5016] uppercase"
                                    )}
                                >
                                    {m === '' ? 'TẤT CẢ' : m === 'Cash' ? 'TIỀN MẶT' : 'CÔNG NỢ'}
                                </button>
                            ))}
                        </div>

                        {(searchPartnerQuery || searchIdQuery || minPriceQuery || maxPriceQuery || exactPriceQuery || searchProductQuery) && (
                            <button onClick={handleClearSearch} className="px-3 py-2 text-rose-500 hover:text-rose-600 font-black text-[10px] uppercase transition-colors flex items-center gap-1 group">
                                <X size={14} className="group-hover:rotate-90 transition-transform" />
                                <span>Xóa lọc</span>
                            </button>
                        )}

                        <div className="flex items-center gap-3 ml-auto">
                            <span className="text-[10px] font-black uppercase text-[#8b6f47]">Dòng:</span>
                            <CustomSelect
                                className="border-0 p-0 min-w-[100px]"
                                value={limit}
                                onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}
                                options={[
                                    { value: 10, label: "10 dòng" },
                                    { value: 20, label: "20 dòng" },
                                    { value: 30, label: "30 dòng" },
                                    { value: 50, label: "50 dòng" },
                                    { value: 100, label: "100 dòng" }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {activeTab === 'Sale' && duplicates.length > 0 && (
                        <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-transparent border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                                        <AlertTriangle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-amber-700 uppercase text-sm tracking-tight">Cảnh báo trùng đơn</h3>
                                        <p className="text-amber-600/80 text-xs font-bold">Phát hiện {duplicates.length} cặp đơn hàng có nội dung giống hệt nhau nhưng người nhập khác nhau.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-bold text-xs uppercase transition-all shadow-sm border",
                                        showOnlyDuplicates 
                                            ? "bg-amber-600 text-white border-amber-600 shadow-amber-600/20" 
                                            : "bg-background text-amber-600 hover:bg-muted border-amber-500/30"
                                    )}
                                >
                                    {showOnlyDuplicates ? 'HIỆN TẤT CẢ' : 'XEM CÁC ĐƠN TRÙNG'}
                                </button>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                <div className="border border-border pos-card rounded-2xl overflow-hidden min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <m.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-20 text-center flex flex-col items-center gap-4"
                            >
                                <div className="w-12 h-12 border-4 border-[#2d5016]/20 border-t-[#2d5016] rounded-full animate-spin"></div>
                                <div className="text-[#8b6f47] font-black uppercase text-xs tracking-[0.2em]">Đang tải dữ liệu...</div>
                            </m.div>
                        ) : (
                            <m.div
                                key={activeTab + page}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent border-b border-[#d4a574]/20 sticky top-0 z-10 print:hidden text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                        <tr className="border-none">
                                            <th onClick={() => handleSort('display_id')} className="py-4 px-4 text-center cursor-pointer hover:text-primary transition-colors group whitespace-nowrap border-r border-white/5 dark:border-slate-800/10">
                                                <div className="flex items-center justify-center gap-1">MÃ <SortIcon field="display_id" /></div>
                                            </th>
                                            <th onClick={() => handleSort('date')} className="py-4 px-4 text-center cursor-pointer hover:text-primary transition-colors group whitespace-nowrap border-r border-white/5 dark:border-slate-800/10">
                                                <div className="flex items-center justify-center gap-1">NGÀY GIỜ <SortIcon field="date" /></div>
                                            </th>
                                            <th className="py-4 px-4 text-center min-w-[240px] border-r border-white/5 dark:border-slate-800/10">ĐỐI TÁC & SẢN PHẨM</th>
                                            <th onClick={() => handleSort('total_amount')} className="py-4 px-4 text-center cursor-pointer hover:text-primary transition-colors group whitespace-nowrap border-r border-white/5 dark:border-slate-800/10">
                                                <div className="flex items-center justify-center gap-1">TỔNG TIỀN <SortIcon field="total_amount" /></div>
                                            </th>
                                            <th className="py-4 px-4 text-center whitespace-nowrap border-r border-white/5 dark:border-slate-800/10">SL</th>
                                            <th className="py-4 px-4 text-center whitespace-nowrap border-r border-white/5 dark:border-slate-800/10">PTTT</th>
                                            <th className="py-4 px-4 text-center whitespace-nowrap">THAO TÁC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#d4a574]/10">
                                        {orders
                                            .filter(o => !showOnlyDuplicates || (Array.isArray(duplicates) && duplicates.some(group => Array.isArray(group) && group.some(do_item => do_item.id === o.id))))
                                            .map((o) => {
                                                const isDuplicate = Array.isArray(duplicates) && duplicates.some(group => Array.isArray(group) && group.some(do_item => do_item.id === o.id));
                                                return (
                                                    <tr
                                                        key={o.id}
                                                        className={cn(
                                                            "hover:bg-white/5 dark:hover:bg-slate-800/10 group transition-colors cursor-pointer",
                                                            isDuplicate && "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-amber-500/50"
                                                        )}
                                                        onClick={() => setSelectedOrder(o)}
                                                    >
                                                        <td className="p-4 font-bold text-[#8b6f47] whitespace-nowrap">
                                                            #{o.display_id || o.id}
                                                            {(() => {
                                                                const group = Array.isArray(duplicates) ? duplicates.find(g => Array.isArray(g) && g.some(do_item => do_item.id === o.id)) : null;
                                                                if (group) {
                                                                    const other = group.find(do_item => do_item.id !== o.id);
                                                                    if (!other) return null;
                                                                    return (
                                                                        <div className="flex flex-col gap-1 mt-1">
                                                                            <div className="text-[8px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block uppercase border border-amber-500/20 w-fit">
                                                                                Trùng với #{other.display_id || other.id} ({other.created_by || 'Chưa rõ'})
                                                                            </div>
                                                                            {confirmedIds.includes(o.id) ? (
                                                                                <m.div
                                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                                    className="flex items-center gap-1 text-[8px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded border border-emerald-700 w-fit"
                                                                                >
                                                                                    <CheckCircle size={8} className="animate-bounce" /> ĐÃ XÁC NHẬN!
                                                                                </m.div>
                                                                            ) : confirmingId === o.id ? (
                                                                                <div className="flex items-center gap-1 text-[8px] font-black text-gray-500 bg-gray-155 dark:bg-slate-800 px-2 py-0.5 rounded border dark:border-slate-700 w-fit">
                                                                                    <div className="w-2.5 h-2.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> Đang lưu...
                                                                                </div>
                                                                            ) : (
                                                                                <m.button
                                                                                    whileHover={{ scale: 1.05 }}
                                                                                    whileTap={{ scale: 0.95 }}
                                                                                    onClick={(e) => { e.stopPropagation(); handleCheckDuplicate(o.id); }}
                                                                                    className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded transition-all border border-emerald-500/20 w-fit cursor-pointer"
                                                                                >
                                                                                    <CheckCircle size={8} /> XÁC NHẬN ĐƠN OK
                                                                                </m.button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </td>
                                                        <td className="p-4 text-[#8b6f47] dark:text-gray-400 text-[11px] font-black whitespace-nowrap tabular-nums">
                                                            {formatDate(o.date)}
                                                            <div className="text-[10px] text-[#4a7c59] mt-0.5 flex items-center gap-1 opacity-70"><User size={10} /> {o.created_by || 'Admin'}</div>
                                                        </td>
                                                        <td className="p-4 py-5 min-w-[240px]">
                                                            <div className="flex items-center gap-2 mb-2 py-0.5">
                                                                <span className="font-black text-[#2d5016] dark:text-gray-100 uppercase text-xs tracking-tight truncate max-w-[200px] py-0.5 leading-normal">{o.partner_name}</span>
                                                                {o.is_consignment && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[8px] font-black uppercase flex items-center gap-0.5 shrink-0">
                                                                        <Warehouse size={9} /> GỬI KHO
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {o.details && o.details.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 cursor-default" onClick={e => e.stopPropagation()}>
                                                                    {o.details.slice(0, 5).map((d, dIdx) => (
                                                                        <div
                                                                            key={dIdx}
                                                                            className="px-2 py-0.5 bg-[#2d5016]/5 dark:bg-emerald-500/10 border border-[#2d5016]/10 dark:border-emerald-500/20 rounded-md text-[9px] font-black text-[#2d5016]/70 dark:text-emerald-400 uppercase flex items-center gap-1"
                                                                        >
                                                                            <span className="truncate max-w-[80px]">{d.product_name}</span>
                                                                            <span className="text-[8px] opacity-40">x</span>
                                                                            <span className="text-emerald-600 dark:text-emerald-300">{d.quantity}</span>
                                                                        </div>
                                                                    ))}
                                                                    {o.details.length > 5 && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                                                                            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase transition-all hover:scale-102"
                                                                            title="Bấm để xem tất cả món"
                                                                        >
                                                                            +{o.details.length - 5} MÓN KHÁC...
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className={cn("p-4 text-right font-black text-lg whitespace-nowrap tabular-nums", o.total_amount < 0 ? "text-amber-500" : "text-[#2d5016] dark:text-[#4a7c59]")}>
                                                            {formatNumber(o.total_amount)}
                                                            {o.total_amount < 0 && <div className="text-[9px] uppercase font-black text-amber-500/60 mt-0.5 tracking-wider">Khách trả hàng</div>}
                                                        </td>
                                                        <td className="p-4 text-right text-[#8b6f47] font-bold text-xs whitespace-nowrap tabular-nums">{o.details?.length || 0}</td>
                                                        <td className="p-4 text-right whitespace-nowrap">
                                                            {o.total_amount < 0 ? (
                                                                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                                    o.payment_method === 'Debt' ? "bg-orange-100 text-orange-600" :
                                                                        o.payment_method === 'Cash' ? "bg-purple-100 text-purple-600" :
                                                                            "bg-transparent text-gray-500"
                                                                )}>
                                                                    {o.payment_method === 'Debt' ? 'TRỪ CÔNG NỢ' : o.payment_method === 'Cash' ? 'HOÀN TIỀN' : 'CHỜ XỬ LÝ'}
                                                                </span>
                                                            ) : (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                                        o.payment_method === 'Cash' ? "bg-[#2d5016]/10 text-[#2d5016]" :
                                                                            (o.amount_paid >= o.total_amount ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600")
                                                                    )}>
                                                                        {o.payment_method === 'Cash' ? 'TIỀN MẶT' : (o.amount_paid >= o.total_amount ? 'TẤT TOÁN' : 'CÔNG NỢ')}
                                                                    </span>
                                                                    {o.is_consignment && (
                                                                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-tight">
                                                                            HÀNG GỬI KHO
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                                            <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} className="p-2 text-gray-400 hover:text-[#4a7c59] transition-colors" title="Xem chi tiết"><Eye size={18} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); navigate(activeTab === 'Sale' ? '/pos' : '/purchase', { state: { editOrder: o } }); }} className="p-2 text-[#f4c430] hover:bg-[#f4c430]/10 rounded-lg transition-colors" title="Chỉnh sửa"><Edit size={18} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} className="p-2 text-gray-300 hover:text-rose-500 transition-colors" title="Xóa"><Trash2 size={18} /></button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                                {orders.length === 0 && <div className="p-20 text-center text-[#8b6f47] font-bold uppercase tracking-widest text-sm">Không tìm thấy giao dịch nào.</div>}

                                <div className="p-4 bg-gradient-to-r from-[#faf8f3]/50 to-[#f5f1e8]/50 dark:bg-[#2d5016]/5 border-t-2 border-[#d4a574]/20 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="text-[10px] font-black text-[#8b6f47] uppercase tracking-widest">Hiển thị <span className="text-[#2d5016] dark:text-[#4a7c59]">{(page - 1) * limit + 1} - {Math.min(page * limit, totalItems)}</span> trên tổng số <span className="text-[#2d5016] dark:text-[#4a7c59]">{totalItems}</span> đơn</div>
                                    <div className="flex items-center gap-1.5">
                                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-5 py-2.5 border-2 border-[#d4a574]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-[#d4a574]/10 transition-all text-[#2d5016] dark:text-[#d4a574]">Trước</button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pNum = i + 1;
                                            if (pNum === 1 || pNum === totalPages || (pNum >= page - 2 && pNum <= page + 2)) {
                                                return <button key={pNum} onClick={() => setPage(pNum)} className={cn("w-10 h-10 rounded-2xl text-[10px] font-black transition-all", page === pNum ? "bg-gradient-to-r from-[#2d5016] to-[#4a7c59] text-white shadow-lg shadow-[#2d5016]/30 border-0" : "hover:bg-[#d4a574]/10 text-[#8b6f47] dark:text-[#d4a574]/60 border-2 border-[#d4a574]/30")}>{pNum}</button>;
                                            }
                                            if (pNum === page - 3 || pNum === page + 3) return <span key={pNum} className="px-1 text-[#d4a574]">...</span>;
                                            return null;
                                        })}
                                        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-5 py-2.5 border-2 border-[#d4a574]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-[#d4a574]/10 transition-all text-[#2d5016] dark:text-[#d4a574]">Sau</button>
                                    </div>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal Chi tiết đơn hàng */}
            <AnimatePresence>
                {selectedOrder && (
                    <Portal>
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 no-print overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
                            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border flex flex-col my-auto z-10">
                                <div className="flex justify-between items-center p-6 border-b border-border bg-card transition-colors">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black text-[#2d5016] dark:text-[#d4a574] uppercase tracking-tighter">Chi tiết giao dịch</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] font-black text-[#8b6f47] uppercase tracking-widest">Phóng to:</span>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="1.5"
                                                step="0.1"
                                                value={scale}
                                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                                className="w-32 h-1.5 bg-[#d4a574]/20 rounded-lg appearance-none cursor-pointer accent-[#2d5016]"
                                            />
                                            <span className="text-[10px] font-black text-[#4a7c59]">{Math.round(scale * 100)}%</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 rounded-xl transition-all"><X size={24} /></button>
                                </div>
                                <div className="flex-1 overflow-auto p-8 bg-card/60 dark:bg-slate-950/40 no-scrollbar transition-colors">
                                    <div className={cn(
                                        "flex justify-center transition-all duration-500 origin-top gap-8 items-start",
                                        (() => {
                                            const group = Array.isArray(duplicates) ? duplicates.find(g => Array.isArray(g) && g.some(do_item => do_item.id === selectedOrder.id)) : null;
                                            return group ? "flex-row flex-wrap lg:flex-nowrap" : "flex-col";
                                        })()
                                    )} style={{ transform: `scale(${scale})` }}>
                                        {/* Đơn hiện tại */}
                                        <div className={cn(
                                            "pos-card p-8 rounded-2xl transition-all shadow-none",
                                            (Array.isArray(duplicates) && duplicates.some(g => Array.isArray(g) && g.some(o => o.id === selectedOrder.id))) ? "w-full lg:w-1/2 border-emerald-500/30" : "w-full max-w-2xl mx-auto"
                                        )}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-lg font-black uppercase text-[#2d5016] dark:text-[#d4a574]">Chi tiết đơn hàng #{selectedOrder.display_id || selectedOrder.id}</h4>
                                                <div className="text-[10px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded uppercase tracking-widest border border-emerald-500/20">ĐANG XEM</div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-background/50 rounded-xl border border-border">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase">Đối tác</div>
                                                    <div className="text-sm font-bold text-slate-800 dark:text-white uppercase">{selectedOrder.partner_name}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase">Thời gian</div>
                                                    <div className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">{formatDate(selectedOrder.date)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase">Người lập</div>
                                                    <div className="text-sm font-bold text-emerald-600 uppercase flex items-center gap-1"><User size={12} /> {selectedOrder.created_by || 'Khác'}</div>
                                                </div>
                                            </div>

                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b-2 border-[#d4a574]/30 text-left text-xs uppercase text-[#8b6f47]">
                                                        <th className="py-2">Sản phẩm</th>
                                                        <th className="py-2 text-right">SL</th>
                                                        <th className="py-2 text-right">Giá</th>
                                                        <th className="py-2 text-right">T.Tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.details.map((d, i) => (
                                                        <tr key={i} className="border-b border-[#d4a574]/10 text-sm">
                                                            <td className="py-2 font-bold text-[#2d5016] dark:text-white">{d.product_name}</td>
                                                            <td className="py-2 text-right text-[#8b6f47] font-black">{d.quantity}</td>
                                                            <td className="py-2 text-right text-[#8b6f47]">{formatNumber(d.price)}</td>
                                                            <td className="py-2 text-right font-bold text-[#2d5016] dark:text-[#4a7c59]">{formatNumber(d.quantity * d.price)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-6 flex flex-col gap-2 pt-4 border-t-2 border-[#d4a574]/40">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black uppercase text-sm text-[#2d5016] dark:text-[#d4a574]">Tổng cộng:</span>
                                                    <span className="font-black text-2xl text-[#2d5016] dark:text-[#4a7c59]">{formatNumber(selectedOrder.total_amount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Đơn đối xứng (Nếu có trùng) */}
                                        {(() => {
                                            const group = Array.isArray(duplicates) ? duplicates.find(g => Array.isArray(g) && g.some(o => o.id === selectedOrder.id)) : null;
                                            if (!group) return null;
                                            const other = group.find(o => o.id !== selectedOrder.id);
                                            if (!other) return null;

                                            return (
                                                <div className="w-full lg:w-1/2 bg-transparent p-8 rounded-2xl shadow-sm border-2 border-amber-500/30 ring-4 ring-amber-500/5 transition-all">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-lg font-black uppercase text-amber-700 dark:text-amber-500">Đơn hàng nghi trùng #{other.display_id || other.id}</h4>
                                                        <div className="text-[10px] font-black px-2 py-1 bg-amber-500/10 text-amber-600 rounded uppercase tracking-widest border border-amber-500/20">NGHI TRÙNG</div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50">
                                                        <div>
                                                            <div className="text-[10px] font-black text-amber-500 uppercase">Đối tác</div>
                                                            <div className="text-sm font-bold text-slate-800 dark:text-white uppercase">{other.partner_name}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-amber-500 uppercase">Thời gian</div>
                                                            <div className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">{formatDate(other.date)}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-amber-500 uppercase">Người lập</div>
                                                            <div className="text-sm font-bold text-amber-600 uppercase flex items-center gap-1"><User size={12} /> {other.created_by || 'Khác'}</div>
                                                        </div>
                                                    </div>

                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b-2 border-amber-500/30 text-left text-xs uppercase text-amber-600">
                                                                <th className="py-2">Sản phẩm</th>
                                                                <th className="py-2 text-right">SL</th>
                                                                <th className="py-2 text-right">Giá</th>
                                                                <th className="py-2 text-right">T.Tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {other.details.map((d, i) => (
                                                                <tr key={i} className="border-b border-amber-500/10 text-sm">
                                                                    <td className="py-2 font-bold text-slate-700 dark:text-white">{d.product_name}</td>
                                                                    <td className="py-2 text-right text-amber-600 font-black">{d.quantity}</td>
                                                                    <td className="py-2 text-right text-slate-500">{formatNumber(d.price)}</td>
                                                                    <td className="py-2 text-right font-bold text-amber-700 dark:text-amber-500">{formatNumber(d.quantity * d.price)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    
                                                    <div className="mt-6 flex flex-col gap-2 pt-4 border-t-2 border-amber-500/40">
                                                        <div className="flex justify-between items-center text-amber-700">
                                                            <span className="font-black uppercase text-sm">Tổng cộng:</span>
                                                            <span className="font-black text-2xl">{formatNumber(other.total_amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="p-6 bg-card flex justify-end gap-3 transition-colors border-t border-border">
                                    <button onClick={() => {
                                        navigate(activeTab === 'Sale' ? '/pos' : '/purchase', { state: { editOrder: selectedOrder } });
                                    }} className="px-6 py-2.5 rounded-xl font-black text-[#f4c430] hover:bg-[#f4c430]/10 uppercase text-xs transition-all border-2 border-[#f4c430]/30">
                                        CHỈNH SỬA
                                    </button>
                                    <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 rounded-xl font-black text-[#8b6f47] uppercase text-xs hover:bg-[#d4a574]/10 transition-all border-2 border-[#d4a574]/20">Đóng</button>
                                </div>
                            </m.div>
                        </div>
                    </Portal>
                )}
            </AnimatePresence>



            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {confirm && (
                    <ConfirmModal
                        isOpen={!!confirm}
                        title={confirm.title}
                        message={confirm.message}
                        confirmText="XÓA"
                        cancelText="HỦY"
                        type={confirm.type}
                        onConfirm={confirm.onConfirm}
                        onCancel={() => setConfirm(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    </div>
    );
}
