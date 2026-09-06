import React, { useState, useEffect, useMemo, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    User, Lock, ArrowRight, Sparkles, UserPlus, LogIn, Sprout, Wheat, Leaf,
    Sun, Moon, ShieldCheck, Network, Wifi, WifiOff, X, Check, 
    Laptop, Plus, Eye, EyeOff, Clock, Calendar, Zap, Shield, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { cn } from '../../lib/utils';

// High-Performance Ambient Background (Pure Static CSS - 0% GPU Overhead)
const FloatingBackground = ({ isDark }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Pure CSS Static Radial Ambient Gradients */}
            <div 
                className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle at 15% 15%, rgba(5, 150, 105, 0.12) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(13, 148, 136, 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.05) 0%, transparent 60%)'
                        : 'radial-gradient(circle at 15% 15%, rgba(45, 80, 22, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(212, 165, 116, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(74, 124, 89, 0.05) 0%, transparent 60%)'
                }}
            />

            {/* Subtle Grid Pattern Overlay */}
            <div 
                className={cn(
                    "absolute inset-0 transition-opacity duration-700 pointer-events-none",
                    isDark ? "opacity-[0.03]" : "opacity-[0.02]"
                )}
                style={{
                    backgroundImage: `radial-gradient(${isDark ? '#4ade80' : '#2d5016'} 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                }}
            />
        </div>
    );
};

export default function Welcome() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: localStorage.getItem('saved_username') || '',
        password: localStorage.getItem('saved_password') || '',
        display_name: '',
        admin_secret: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSecretAdminMode, setIsSecretAdminMode] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [selectedUserLoading, setSelectedUserLoading] = useState(null);

    // Dark Mode state with immediate listener sync
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        const root = document.documentElement;
        const newMode = !root.classList.contains('dark');
        if (newMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        setIsDark(newMode);
        window.dispatchEvent(new Event('theme_changed'));
    };

    // Live Clock & VN Date (Minute-based to optimize GPU/CPU performance)
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update clock every 15 seconds instead of every second
        const timer = setInterval(() => setTime(new Date()), 15000);
        return () => clearInterval(timer);
    }, []);

    // Fetch users & Auto-login if default landing page is dashboard
    useEffect(() => {
        const fetchUsersAndAutoLogin = async () => {
            try {
                const res = await axios.get('/api/users');
                if (Array.isArray(res.data)) {
                    setUsers(res.data);
                    if (res.data.length === 0) {
                        setShowLoginForm(true);
                        return;
                    }

                    // Check if user enabled auto-open Dashboard (skip login / quick enter)
                    const isAutoDashboard = localStorage.getItem('pos_default_landing_page') === 'dashboard';
                    const savedUser = localStorage.getItem('saved_username');
                    if (isAutoDashboard && savedUser) {
                        const targetUser = res.data.find(u => u.username === savedUser) || res.data[0];
                        const savedPwd = localStorage.getItem(`saved_pwd_${targetUser.username}`) || localStorage.getItem('saved_password') || '0607@Nghia';
                        
                        if (targetUser && savedPwd) {
                            try {
                                setLoading(true);
                                setSelectedUserLoading(targetUser.username);
                                const loginRes = await axios.post('/api/login', {
                                    username: targetUser.username,
                                    password: savedPwd
                                });
                                sessionStorage.setItem('user', JSON.stringify(loginRes.data.user));
                                navigate('/');
                                return;
                            } catch (autoErr) {
                                console.warn("Auto-login on startup failed:", autoErr);
                            } finally {
                                setLoading(false);
                                setSelectedUserLoading(null);
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch users in welcome screen", err);
                setShowLoginForm(true);
            }
        };
        fetchUsersAndAutoLogin();
    }, []);

    const handleSelectUser = async (user) => {
        const savedPassword = localStorage.getItem(`saved_pwd_${user.username}`) || '';
        
        if (savedPassword) {
            setLoading(true);
            setSelectedUserLoading(user.username);
            setError('');
            try {
                const res = await axios.post('/api/login', {
                    username: user.username,
                    password: savedPassword
                });
                const userData = JSON.stringify(res.data.user);
                sessionStorage.setItem('user', userData);
                
                localStorage.setItem('saved_username', user.username);
                localStorage.setItem('saved_password', savedPassword);
                localStorage.setItem(`saved_pwd_${user.username}`, savedPassword);
                
                navigate('/');
            } catch (err) {
                console.error("Auto login failed, showing login form:", err);
                setError(err.response?.data?.error || 'Thông tin đăng nhập không chính xác');
                setFormData({
                    username: user.username,
                    password: '',
                    display_name: ''
                });
                setShowLoginForm(true);
            } finally {
                setLoading(false);
                setSelectedUserLoading(null);
            }
        } else {
            setFormData({
                username: user.username,
                password: '',
                display_name: ''
            });
            setShowLoginForm(true);
            setTimeout(() => {
                document.getElementById('welcome-password-input')?.focus();
            }, 100);
        }
    };

    // Lunar & Solar Date Formatting
    const formatDateVN = (date) => {
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${dayName}, ${day}/${month}/${year}`;
    };

    const getLunarDate = (date) => {
        const y = date.getFullYear();
        const data = {
            2024: { lny: new Date(2024, 1, 10), months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29], leap: 0, stemBranch: "Giáp Thìn" },
            2025: { lny: new Date(2025, 0, 29), months: [30, 29, 30, 29, 29, 30, 30, 29, 29, 30, 30, 29, 30], leap: 6, stemBranch: "Ất Tỵ" },
            2026: { lny: new Date(2026, 1, 17), months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30], leap: 0, stemBranch: "Bính Ngọ" },
            2027: { lny: new Date(2027, 1, 6), months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29], leap: 0, stemBranch: "Đinh Mùi" }
        };

        const yearData = data[y] || data[2026];
        let diffDays = Math.floor((date.getTime() - yearData.lny.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays < 0) {
            const prevYearData = data[y - 1] || data[2025];
            diffDays = Math.floor((date.getTime() - prevYearData.lny.getTime()) / (24 * 60 * 60 * 1000));
            let lunarMonth = 1;
            let day = diffDays + 1;
            for (let i = 0; i < prevYearData.months.length; i++) {
                const daysInMonth = prevYearData.months[i];
                if (day <= daysInMonth) {
                    lunarMonth = i + 1;
                    break;
                }
                day -= daysInMonth;
            }
            let displayMonth = lunarMonth;
            let isLeap = false;
            if (prevYearData.leap > 0) {
                if (lunarMonth === prevYearData.leap + 1) {
                    displayMonth = prevYearData.leap;
                    isLeap = true;
                } else if (lunarMonth > prevYearData.leap + 1) {
                    displayMonth = lunarMonth - 1;
                }
            }
            return { day, month: displayMonth, isLeap, year: prevYearData.stemBranch };
        } else {
            let lunarMonth = 1;
            let day = diffDays + 1;
            for (let i = 0; i < yearData.months.length; i++) {
                const daysInMonth = yearData.months[i];
                if (day <= daysInMonth) {
                    lunarMonth = i + 1;
                    break;
                }
                day -= daysInMonth;
            }
            let displayMonth = lunarMonth;
            let isLeap = false;
            if (yearData.leap > 0) {
                if (lunarMonth === yearData.leap + 1) {
                    displayMonth = yearData.leap;
                    isLeap = true;
                } else if (lunarMonth > yearData.leap + 1) {
                    displayMonth = lunarMonth - 1;
                }
            }
            return { day, month: displayMonth, isLeap, year: yearData.stemBranch };
        }
    };

    const getAuspiciousHours = (date) => {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        
        let a = Math.floor((14 - m) / 12);
        let y_calc = y + 4800 - a;
        let m_calc = m + 12 * a - 3;
        let jd = d + Math.floor((153 * m_calc + 2) / 5) + 365 * y_calc + Math.floor(y_calc / 4) - Math.floor(y_calc / 100) + Math.floor(y_calc / 400) - 32045;
        
        const dayChiIndex = (Math.floor(jd + 1.5) + 11) % 12;
        
        const mapping = {
            0: ["Tý", "Sửu", "Dần", "Mão", "Mùi", "Dậu"],
            6: ["Tý", "Sửu", "Dần", "Mão", "Mùi", "Dậu"],
            1: ["Dần", "Mão", "Tỵ", "Thân", "Tuất", "Hợi"],
            7: ["Dần", "Mão", "Tỵ", "Thân", "Tuất", "Hợi"],
            2: ["Tý", "Sửu", "Thìn", "Tỵ", "Mùi", "Tuất"],
            8: ["Tý", "Sửu", "Thìn", "Tỵ", "Mùi", "Tuất"],
            3: ["Tý", "Dần", "Mão", "Ngọ", "Mùi", "Dậu"],
            9: ["Tý", "Dần", "Mão", "Ngọ", "Mùi", "Dậu"],
            4: ["Dần", "Thìn", "Tỵ", "Thân", "Dậu", "Hợi"],
            10: ["Dần", "Thìn", "Tỵ", "Thân", "Dậu", "Hợi"],
            5: ["Sửu", "Thìn", "Ngọ", "Mùi", "Tuất", "Hợi"],
            11: ["Sửu", "Thìn", "Ngọ", "Mùi", "Tuất", "Hợi"]
        };
        
        return mapping[dayChiIndex] || ["Tý", "Sửu", "Dần", "Mão", "Mùi", "Dậu"];
    };

    const lunarInfo = useMemo(() => getLunarDate(time), [time]);
    const auspiciousHours = useMemo(() => getAuspiciousHours(time), [time]);

    // Global Enter key handler
    useEffect(() => {
        const handleGlobalEnter = (e) => {
            if (e.key === 'Enter' && isLogin && formData.username && formData.password && !loading) {
                 if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'BUTTON') {
                     document.getElementById('login-form-submit-btn')?.click();
                 }
            }
        };
        window.addEventListener('keydown', handleGlobalEnter);
        return () => window.removeEventListener('keydown', handleGlobalEnter);
    }, [isLogin, formData, loading]);

    // LAN Configuration
    const [showLanModal, setShowLanModal] = useState(false);
    const [lanIp, setLanIp] = useState(localStorage.getItem('server_ip') || '');
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [pingError, setPingError] = useState('');
    const [isClientMode, setIsClientMode] = useState(!!localStorage.getItem('server_ip'));

    const sanitizeIp = (input) => {
        let cleaned = input.trim();
        cleaned = cleaned.replace(/^(https?:\/\/)/i, '');
        cleaned = cleaned.replace(/\/+$/, '');
        return cleaned;
    };

    const resolveApiUrl = (val) => {
        if (!val) return '';
        let clean = val.trim();
        const defaultPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) || ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ? '3588' : '3588');
        if (/^https?:\/\//i.test(clean)) return clean;
        if (clean.toLowerCase() === 'localhost') return `http://localhost:${defaultPort}`;
        const hasLetters = /[a-zA-Z]/.test(clean) && !clean.includes(':');
        if (hasLetters) return `https://${clean}`;
        if (clean.includes(':')) return `http://${clean}`;
        return `http://${clean}:${defaultPort}`;
    };

    const handleTestConnection = async () => {
        const cleanedIp = sanitizeIp(lanIp);
        if (!cleanedIp) {
            setConnectionStatus('failed');
            setPingError('Vui lòng nhập địa chỉ IP hợp lệ.');
            return;
        }
        setTestingConnection(true);
        setConnectionStatus(null);
        setPingError('');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);
            
            let fetchFn = window.fetch;
            if (window.__TAURI_INTERNALS__) {
                try {
                    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
                    fetchFn = tauriFetch;
                } catch (e) {
                    console.warn('Khong the nap Tauri HTTP plugin, su dung fetch mac dinh', e);
                }
            }
            
            const testUrl = resolveApiUrl(cleanedIp) + '/api/ping';
            const response = await fetchFn(testUrl, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                setConnectionStatus('failed');
                setPingError(`Máy chủ phản hồi mã lỗi HTTP: ${response.status}`);
                return;
            }
            
            const data = await response.json();
            if (data.status === 'ok' || data.message === 'pong') {
                setConnectionStatus('success');
            } else {
                setConnectionStatus('failed');
                setPingError('Phản hồi từ máy chủ không khớp.');
            }
        } catch (err) {
            setConnectionStatus('failed');
            const targetUrl = resolveApiUrl(cleanedIp);
            if (window.location.protocol === 'https:') {
                errorMsg = `Safari trên iOS chặn kết nối HTTP nội bộ khi truy cập qua HTTPS. Vui lòng mở đường dẫn: ${targetUrl}`;
            } else if (err && err.name === 'AbortError') {
                errorMsg = 'Hết thời gian chờ kết nối (Timeout 3.5s). Vui lòng kiểm tra IP và kết nối WiFi.';
            } else if (err && (err.name === 'TypeError' || String(err).includes('Fetch') || String(err).includes('Load failed'))) {
                errorMsg = `Không thể kết nối tới ${targetUrl}. Đảm bảo cùng kết nối chung một mạng LAN/WiFi.`;
            } else {
                errorMsg = typeof err === 'string' ? err : (err && err.message ? err.message : String(err));
            }
            setPingError(errorMsg);
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSaveLanConfig = () => {
        if (isClientMode) {
            const cleanedIp = sanitizeIp(lanIp);
            if (!cleanedIp) {
                setError('Vui lòng nhập IP máy chủ hoặc chọn chế độ chạy cục bộ.');
                return;
            }
            localStorage.setItem('server_ip', cleanedIp);
        } else {
            localStorage.removeItem('server_ip');
        }
        setShowLanModal(false);
        window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const res = await axios.post('/api/login', {
                    username: formData.username,
                    password: formData.password
                });
                const userData = JSON.stringify(res.data.user);
                sessionStorage.setItem('user', userData);

                if (rememberMe) {
                    localStorage.setItem('saved_username', formData.username);
                    localStorage.setItem('saved_password', formData.password);
                    localStorage.setItem(`saved_pwd_${formData.username}`, formData.password);
                } else {
                    localStorage.removeItem('saved_username');
                    localStorage.removeItem('saved_password');
                    localStorage.removeItem(`saved_pwd_${formData.username}`);
                }
                navigate('/');
            } else {
                const res = await axios.post('/api/register', {
                    username: formData.username,
                    password: formData.password,
                    display_name: formData.display_name,
                    admin_secret: isSecretAdminMode ? formData.admin_secret : ''
                });
                sessionStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Thông tin đăng nhập không chính xác');
        } finally {
            setLoading(false);
        }
    };

    const serverIp = localStorage.getItem('server_ip');

    return (
        <div className={cn(
            "h-[100dvh] w-full flex flex-col justify-between items-center relative overflow-hidden select-none transition-colors duration-700",
            isDark ? "bg-[#070b14] text-slate-100" : "bg-[#faf8f3] text-[#2d5016]"
        )}>
            {/* Dynamic Animated Atmospheric Background */}
            <FloatingBackground isDark={isDark} />

            {/* Top Navigation Bar: Date & Clock Widget (Left) + Theme & LAN Badges (Right) */}
            <header className="w-full shrink-0 z-40 px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 max-w-7xl mx-auto">
                {/* Left: Vietnamese Lunar & Real-time Clock Widget */}
                <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                        "hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border backdrop-blur-xl shadow-xs group transition-all duration-300",
                        isDark 
                            ? "bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40 text-slate-300" 
                            : "bg-white/70 border-[#d4a574]/25 hover:border-[#2d5016]/40 text-[#2d5016]"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-xs font-mono font-bold tracking-tight">
                            {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="h-3 w-px bg-current opacity-20" />

                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <Calendar size={13} className={isDark ? "text-emerald-400" : "text-[#8b6f47]"} />
                        <span>{formatDateVN(time)}</span>
                    </div>

                    <div className="h-3 w-px bg-current opacity-20" />

                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-tight text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        <Wheat size={11} />
                        <span>Âm lịch: {String(lunarInfo.day).padStart(2, '0')}/{String(lunarInfo.month).padStart(2, '0')} {lunarInfo.year}</span>
                    </div>
                </m.div>

                {/* Right: Theme Toggle & LAN Modal Button */}
                <m.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex items-center gap-2 ml-auto"
                >
                    {/* Dark/Light Mode Switcher */}
                    <m.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleDarkMode}
                        title={isDark ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"}
                        className={cn(
                            "p-2 sm:px-3 sm:py-1.5 rounded-2xl border backdrop-blur-xl shadow-xs flex items-center gap-1.5 text-xs font-black uppercase tracking-wider cursor-pointer transition-all duration-300",
                            isDark
                                ? "bg-slate-900/70 border-slate-800 text-amber-400 hover:border-amber-400/50 hover:bg-slate-800/80 shadow-amber-400/5"
                                : "bg-white/70 border-[#d4a574]/25 text-[#8b6f47] hover:text-[#2d5016] hover:border-[#2d5016]/40 hover:bg-white/90"
                        )}
                    >
                        {isDark ? (
                            <>
                                <Sun size={14} className="text-amber-400" />
                                <span className="hidden sm:inline">Chế độ sáng</span>
                            </>
                        ) : (
                            <>
                                <Moon size={14} className="text-slate-700" />
                                <span className="hidden sm:inline">Chế độ tối</span>
                            </>
                        )}
                    </m.button>

                    {/* LAN Configuration Button */}
                    <m.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLanModal(true)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 border rounded-2xl backdrop-blur-xl shadow-xs transition-all duration-300 text-[11px] font-black uppercase tracking-wider cursor-pointer",
                            serverIp
                                ? (isDark 
                                    ? "bg-blue-950/40 border-blue-500/30 text-blue-400 hover:border-blue-400" 
                                    : "bg-blue-50/80 border-blue-200 text-blue-800 hover:border-blue-500")
                                : (isDark 
                                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:border-emerald-400" 
                                    : "bg-emerald-50/80 border-emerald-200 text-[#2d5016] hover:border-[#2d5016]")
                        )}
                    >
                        {serverIp ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                                <Network size={14} />
                                <span className="max-w-[120px] sm:max-w-none truncate">LAN: {serverIp}</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                                <Wifi size={14} />
                                <span>Cục bộ</span>
                            </>
                        )}
                    </m.button>
                </m.div>
            </header>

            {/* Main Interactive Hub Container */}
            <main className="w-full flex-1 min-h-0 flex flex-col items-center justify-center relative z-20 px-4 sm:px-6 py-2 max-w-6xl mx-auto overflow-hidden">
                {/* Brand / Hero Logo Section */}
                <div className="text-center mb-3 sm:mb-4 shrink-0 flex flex-col items-center">
                    {/* Glowing Animated Logo Aura */}
                    <m.div
                        initial={{ scale: 0.7, opacity: 0, y: -15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 140,
                            damping: 18
                        }}
                        className="relative mb-2 group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                    >
                        {/* Shimmering Halo Backdrop */}
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-700",
                            isDark 
                                ? "bg-gradient-to-tr from-emerald-600/40 via-teal-500/40 to-amber-500/30" 
                                : "bg-gradient-to-tr from-[#2d5016]/30 via-emerald-500/20 to-[#d4a574]/40"
                        )} />

                        <div className={cn(
                            "relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1.5 border backdrop-blur-2xl shadow-2xl flex items-center justify-center transition-all duration-500",
                            isDark 
                                ? "bg-slate-900/80 border-slate-800/90 shadow-emerald-950/50" 
                                : "bg-white/80 border-[#d4a574]/30 shadow-[#2d5016]/10"
                        )}>
                            <img
                                src={logo}
                                alt="LyangPOS Logo"
                                className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(45,80,22,0.25)] group-hover:rotate-3 transition-transform duration-500"
                            />
                        </div>
                    </m.div>

                    {/* Brand Title & Glowing Tagline */}
                    <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="space-y-0.5"
                    >
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-1">
                            <span className={cn(
                                "bg-gradient-to-r bg-clip-text text-transparent font-extrabold italic",
                                isDark 
                                    ? "from-emerald-300 via-teal-200 to-emerald-400" 
                                    : "from-[#2d5016] via-[#3e6b20] to-[#2d5016]"
                            )}>
                                Lyang
                            </span>
                            <span className="text-[#d4a574] not-italic drop-shadow-sm font-black">
                                POS
                            </span>
                        </h1>

                        <p className={cn(
                            "font-bold uppercase tracking-[0.25em] text-[8px] sm:text-[9px]",
                            isDark ? "text-emerald-400/80" : "text-[#8b6f47]"
                        )}>
                            Hệ thống quản lý bán hàng nông nghiệp thông minh
                        </p>

                        {/* Slogan */}
                        <div className="flex items-center justify-center pt-0.5">
                            <div className={cn(
                                "text-[11px] sm:text-xs font-semibold italic flex items-center gap-1.5",
                                isDark ? "text-slate-400" : "text-emerald-900/70"
                            )}>
                                <Sparkles size={12} className="text-amber-500 shrink-0" />
                                <span>“Quản lý thông minh - Tương lai thịnh vượng”</span>
                            </div>
                        </div>
                    </m.div>
                </div>

                {/* Content Switcher: Accounts Grid or Dedicated Login/Register Form */}
                <AnimatePresence mode="wait">
                    {showLoginForm ? (
                        /* Premium Login / Register Glassmorphism Card */
                        <m.div
                            key="login-form-card"
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "w-full max-w-sm sm:max-w-[470px] min-h-[500px] sm:min-h-[560px] max-h-[76vh] overflow-y-auto no-scrollbar rounded-[2.5rem] sm:rounded-[3rem] border backdrop-blur-2xl p-6 sm:p-9 shadow-2xl relative flex flex-col justify-between group transition-all duration-500",
                                isDark 
                                    ? "bg-slate-900/90 border-slate-800/90 shadow-black/80" 
                                    : "bg-white/90 border-[#d4a574]/30 shadow-[#2d5016]/15"
                            )}
                        >
                            {/* Card Ambient Glow Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

                            {/* Back to Accounts Button */}
                            {users.length > 0 && (
                                <m.button 
                                    whileHover={{ x: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setShowLoginForm(false)}
                                    className={cn(
                                        "w-full py-2.5 sm:py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all mb-4 sm:mb-5 flex items-center justify-center gap-2 border border-dashed cursor-pointer",
                                        isDark 
                                            ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-emerald-400" 
                                            : "bg-[#faf8f3]/80 hover:bg-white border-[#d4a574]/40 text-[#8b6f47] hover:text-[#2d5016]"
                                    )}
                                >
                                    <ArrowRight size={14} className="rotate-180" />
                                    <span>Quay lại danh sách tài khoản</span>
                                </m.button>
                            )}

                            {/* Login / Register Toggle Tabs */}
                            <div className={cn(
                                "flex p-1.5 rounded-2xl mb-4 sm:mb-6 relative border transition-colors",
                                isDark 
                                    ? "bg-slate-950/60 border-slate-800" 
                                    : "bg-[#faf8f3] border-[#d4a574]/20"
                            )}>
                                <m.div
                                    className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-[#2d5016] to-[#4a7c59] dark:from-emerald-700 dark:to-teal-600 shadow-md"
                                    initial={false}
                                    animate={{
                                        left: isLogin ? '6px' : '50%',
                                        width: 'calc(50% - 6px)'
                                    }}
                                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(true); setIsSecretAdminMode(false); setError(''); }}
                                    className={cn(
                                        "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                        isLogin 
                                            ? "text-white" 
                                            : (isDark ? "text-slate-400 hover:text-slate-200" : "text-[#8b6f47] hover:text-[#2d5016]")
                                    )}
                                >
                                    <LogIn size={15} /> Đăng nhập
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { 
                                        setIsLogin(false); 
                                        setIsSecretAdminMode(!isSecretAdminMode);
                                        setError(''); 
                                    }}
                                    className={cn(
                                        "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                        !isLogin 
                                            ? "text-white" 
                                            : (isDark ? "text-slate-400 hover:text-slate-200" : "text-[#8b6f47] hover:text-[#2d5016]")
                                    )}
                                >
                                    <ShieldCheck size={15} /> {isSecretAdminMode ? 'ĐK Quản Trị' : 'Đăng ký'}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-4 sm:space-y-4.5">
                                    {/* Mobile / Desktop Quick User Pills */}
                                    {users.length > 0 && (
                                        <div className="pb-1">
                                            <p className={cn(
                                                "text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5",
                                                isDark ? "text-emerald-400/80" : "text-[#8b6f47]"
                                            )}>
                                                <Zap size={12} className="text-amber-500" />
                                                <span>Chọn nhanh:</span>
                                            </p>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                                                {users.map(u => {
                                                    const isSelected = formData.username === u.username;
                                                    const initial = (u.display_name || u.username || "?").charAt(0).toUpperCase();

                                                    return (
                                                        <button
                                                            key={u.id || u.username}
                                                            type="button"
                                                            onClick={() => handleSelectUser(u)}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer",
                                                                isSelected
                                                                    ? "bg-[#2d5016] text-white border-[#2d5016] shadow-sm"
                                                                    : (isDark 
                                                                        ? "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-300" 
                                                                        : "bg-white/80 border-[#d4a574]/30 text-[#8b6f47] hover:border-[#2d5016] hover:text-[#2d5016]")
                                                            )}
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[8px] font-black">
                                                                {initial}
                                                            </div>
                                                            <span>{u.display_name?.split(' ')[0] || u.username}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Register Display Name */}
                                    <AnimatePresence mode="wait">
                                        {!isLogin && (
                                            <m.div
                                                key="displayName"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-1.5 overflow-hidden"
                                            >
                                                <label className={cn(
                                                    "text-[10px] sm:text-[11px] font-black uppercase ml-3 tracking-wider",
                                                    isDark ? "text-slate-400" : "text-[#8b6f47]"
                                                )}>
                                                    Tên hiển thị / Họ tên
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                                                        <Sparkles size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className={cn(
                                                            "w-full border-2 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 font-bold text-sm sm:text-base outline-none transition-all",
                                                            isDark 
                                                                ? "bg-slate-950/60 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600" 
                                                                : "bg-[#faf8f3] border-transparent focus:border-[#d4a574]/50 focus:bg-white text-[#2d5016] placeholder-[#8b6f47]/40 shadow-inner"
                                                        )}
                                                        placeholder="Ví dụ: Nguyễn Văn A"
                                                        value={formData.display_name}
                                                        onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                                        required={!isLogin}
                                                    />
                                                </div>

                                                {isSecretAdminMode && (
                                                    <m.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="space-y-1.5 pt-2"
                                                    >
                                                        <label className="text-[10px] sm:text-[11px] font-black text-rose-500 uppercase ml-3 flex items-center gap-1.5">
                                                            <Shield size={13} /> Mã bảo mật cấp quyền Quản Trị
                                                        </label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-500">
                                                                <ShieldCheck size={18} />
                                                            </div>
                                                            <input
                                                                type="password"
                                                                className="w-full bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 focus:border-rose-500 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-rose-700 dark:text-rose-300 placeholder-rose-300 dark:placeholder-rose-700 outline-none font-bold text-sm sm:text-base"
                                                                placeholder="Nhập mã bí mật Admin..."
                                                                value={formData.admin_secret}
                                                                onChange={e => setFormData({ ...formData, admin_secret: e.target.value })}
                                                                required={isSecretAdminMode}
                                                            />
                                                        </div>
                                                    </m.div>
                                                )}
                                            </m.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Username Field */}
                                    <div className="space-y-1.5">
                                        <label className={cn(
                                            "text-[10px] sm:text-[11px] font-black uppercase ml-3 tracking-wider",
                                            isDark ? "text-slate-400" : "text-[#8b6f47]"
                                        )}>
                                            Tên đăng nhập
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                className={cn(
                                                    "w-full border-2 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 font-bold text-sm sm:text-base outline-none transition-all",
                                                    isDark 
                                                        ? "bg-slate-950/60 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600" 
                                                        : "bg-[#faf8f3] border-transparent focus:border-[#d4a574]/50 focus:bg-white text-[#2d5016] placeholder-[#8b6f47]/40 shadow-inner"
                                                )}
                                                placeholder="Tên tài khoản (username)"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field with Eye Toggle */}
                                    <div className="space-y-1.5">
                                        <label className={cn(
                                            "text-[10px] sm:text-[11px] font-black uppercase ml-3 tracking-wider",
                                            isDark ? "text-slate-400" : "text-[#8b6f47]"
                                        )}>
                                            Mật khẩu
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                id="welcome-password-input"
                                                type={showPassword ? "text" : "password"}
                                                className={cn(
                                                    "w-full border-2 rounded-2xl py-3.5 sm:py-4 pl-12 pr-12 font-bold text-sm sm:text-base outline-none transition-all",
                                                    isDark 
                                                        ? "bg-slate-950/60 border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-600" 
                                                        : "bg-[#faf8f3] border-transparent focus:border-[#d4a574]/50 focus:bg-white text-[#2d5016] placeholder-[#8b6f47]/40 shadow-inner"
                                                )}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    {isLogin && (
                                        <div className="flex items-center justify-between pt-1 ml-1">
                                            <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                                    rememberMe 
                                                        ? "bg-[#2d5016] dark:bg-emerald-600 border-[#2d5016] dark:border-emerald-600 text-white shadow-sm" 
                                                        : (isDark ? "border-slate-700 bg-slate-900" : "border-[#d4a574]/40 bg-white")
                                                )}>
                                                    {rememberMe && <Check size={13} strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={rememberMe}
                                                    onChange={e => setRememberMe(e.target.checked)}
                                                />
                                                <span className={cn(
                                                    "text-xs sm:text-sm font-bold transition-colors",
                                                    rememberMe 
                                                        ? (isDark ? "text-emerald-400" : "text-[#2d5016]") 
                                                        : (isDark ? "text-slate-400" : "text-[#8b6f47]")
                                                )}>
                                                    Ghi nhớ đăng nhập
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {/* Error Notification Banner */}
                                    {error && (
                                        <m.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-black text-center uppercase tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <X size={15} />
                                            <span>{error}</span>
                                        </m.div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <m.button
                                    id="login-form-submit-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 sm:mt-5 bg-gradient-to-r from-[#2d5016] via-[#3a651d] to-[#4a7c59] dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white font-black uppercase tracking-[0.15em] py-4 sm:py-4.5 rounded-2xl shadow-xl shadow-[#2d5016]/20 hover:shadow-[#2d5016]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-60"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{isLogin ? "Đăng nhập hệ thống" : "Hoàn tất đăng ký"}</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </m.button>
                            </form>
                        </m.div>
                    ) : (
                        /* Horizontal Accounts Flow Row (Glassmorphic Cards) */
                        <m.div
                            key="accounts-row"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="w-full flex flex-col items-center shrink-0 my-auto"
                        >
                            <div className="text-center mb-2 sm:mb-3">
                                <span className={cn(
                                    "px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shadow-xs inline-flex items-center gap-1.5",
                                    isDark 
                                        ? "bg-slate-900/60 border-slate-800 text-emerald-400" 
                                        : "bg-white/70 border-[#d4a574]/30 text-[#8b6f47]"
                                )}>
                                    <Sparkles size={11} className="text-amber-500" />
                                    <span>Chọn tài khoản để bắt đầu ca làm việc</span>
                                </span>
                            </div>

                            <div className="flex gap-3 sm:gap-5 overflow-x-auto w-full max-w-full py-2 px-2 no-scrollbar scroll-smooth items-center justify-center flex-wrap">
                                {/* Recent Accounts Cards */}
                                {users.map(u => {
                                    const initial = (u.display_name || u.username || "?").charAt(0).toUpperCase();
                                    const isCurrentSelected = selectedUserLoading === u.username;

                                    return (
                                        <m.div
                                            key={u.id || u.username}
                                            whileHover={{ y: -5, scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleSelectUser(u)}
                                            className={cn(
                                                "w-36 sm:w-44 md:w-48 rounded-[1.8rem] sm:rounded-[2.2rem] border backdrop-blur-2xl p-4 sm:p-5 flex flex-col items-center justify-between min-h-[160px] sm:min-h-[190px] shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer text-center",
                                                isDark 
                                                    ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/60 hover:shadow-emerald-950/40" 
                                                    : "bg-white/80 border-[#d4a574]/30 hover:border-[#2d5016]/60 hover:shadow-[#2d5016]/10"
                                            )}
                                        >
                                            {/* Top Subtle Ambient Light */}
                                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all duration-500" />

                                            {/* Avatar with Glowing Halo */}
                                            <div className="relative mb-2 mt-1">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-[#d4a574] shadow-md group-hover:rotate-6 transition-transform duration-500">
                                                    <div className={cn(
                                                        "w-full h-full rounded-full flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner",
                                                        isDark ? "bg-slate-900 text-emerald-300" : "bg-white text-[#2d5016]"
                                                    )}>
                                                        {isCurrentSelected ? (
                                                            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                                        ) : (
                                                            initial
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Details */}
                                            <div className="w-full space-y-0.5">
                                                <h3 className={cn(
                                                    "text-xs sm:text-sm font-black truncate tracking-tight transition-colors",
                                                    isDark 
                                                        ? "text-slate-100 group-hover:text-emerald-400" 
                                                        : "text-[#2d5016] group-hover:text-[#1e3a0f]"
                                                )}>
                                                    {u.display_name || u.username}
                                                </h3>
                                                <p className={cn(
                                                    "text-[9px] font-bold uppercase tracking-wider",
                                                    isDark ? "text-slate-400" : "text-[#8b6f47]"
                                                )}>
                                                    @{u.username}
                                                </p>
                                            </div>

                                            {/* Quick Enter Action Badge */}
                                            <div className={cn(
                                                "mt-2 w-full py-1 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all",
                                                isDark 
                                                    ? "bg-slate-800/60 border-slate-700/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 text-slate-300" 
                                                    : "bg-[#faf8f3] border-[#d4a574]/20 group-hover:bg-[#2d5016] group-hover:text-white group-hover:border-[#2d5016] text-[#8b6f47]"
                                            )}>
                                                <span>Vào ca</span>
                                                <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </m.div>
                                    );
                                })}

                                {/* Other Account / Add New Card */}
                                <m.div
                                    whileHover={{ y: -5, scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        setShowLoginForm(true);
                                        setFormData({ username: '', password: '', display_name: '', admin_secret: '' });
                                    }}
                                    className={cn(
                                        "w-36 sm:w-44 md:w-48 rounded-[1.8rem] sm:rounded-[2.2rem] border-2 border-dashed backdrop-blur-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[190px] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer text-center group",
                                        isDark 
                                            ? "bg-slate-900/40 border-slate-800 hover:border-emerald-500/80 hover:bg-slate-900/80" 
                                            : "bg-white/50 border-[#d4a574]/40 hover:border-[#2d5016] hover:bg-white/80"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:scale-110",
                                        isDark 
                                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950" 
                                            : "border-[#2d5016]/30 bg-[#2d5016]/10 text-[#2d5016] group-hover:bg-[#2d5016] group-hover:text-white"
                                    )}>
                                        <Plus size={22} />
                                    </div>
                                    <span className={cn(
                                        "text-[11px] sm:text-xs font-black uppercase tracking-wider",
                                        isDark ? "text-emerald-400" : "text-[#2d5016]"
                                    )}>
                                        Đăng nhập khác
                                    </span>
                                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                        Tạo hoặc đổi tài khoản
                                    </p>
                                </m.div>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Status Bar & Auspicious Hours Tip */}
            <footer className="w-full shrink-0 z-30 px-4 py-2 sm:py-2.5 border-t backdrop-blur-xl transition-colors duration-500 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center">
                {/* Auspicious Hours Daily Tip */}
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold opacity-85">
                    <span className={cn(
                        "px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider text-[8px] sm:text-[9px]",
                        isDark ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-[#2d5016]"
                    )}>
                        🌾 Giờ Hoàng Đạo
                    </span>
                    <span className={isDark ? "text-slate-400" : "text-emerald-900/80"}>
                        {auspiciousHours.join(", ")}
                    </span>
                </div>

                {/* System Credit */}
                <p className={cn(
                    "text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5",
                    isDark ? "text-slate-500" : "text-[#8b6f47]/60"
                )}>
                    <Leaf size={11} className="text-emerald-500" />
                    <span>LyangPOS Intelligent Agri Ecosystem • {new Date().getFullYear()}</span>
                </p>
            </footer>

            {/* Modal LAN Configuration */}
            <AnimatePresence>
                {showLanModal && (
                    <div className="fixed inset-0 w-full h-full flex items-center justify-center z-[100] p-4">
                        {/* Overlay backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLanModal(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />

                        {/* Modal Body */}
                        <m.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={cn(
                                "border-2 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden transition-all duration-300",
                                isDark 
                                    ? "bg-slate-900/95 border-emerald-500/20 text-slate-100 shadow-black/80" 
                                    : "bg-white/95 border-[#d4a574]/40 text-[#2d5016] shadow-[#2d5016]/15"
                            )}
                        >
                            {/* Card Ambient Glow Line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5016] via-[#d4a574] to-[#2d5016] dark:from-emerald-600 dark:via-teal-400 dark:to-emerald-600 opacity-90" />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pt-1">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-gradient-to-br from-[#2d5016]/10 to-[#d4a574]/20 dark:from-emerald-500/20 dark:to-teal-500/10 rounded-2xl text-[#2d5016] dark:text-emerald-400 border border-[#2d5016]/10 dark:border-emerald-400/20 shadow-xs">
                                        <Network size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#2d5016] dark:text-white">Cấu hình kết nối mạng</h3>
                                        <p className="text-[10px] font-black text-[#8b6f47] dark:text-emerald-400/80 uppercase tracking-widest mt-0.5">Liên kết dữ liệu giữa các máy POS</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLanModal(false)}
                                    className="p-2.5 rounded-xl border border-transparent hover:border-[#d4a574]/30 hover:bg-[#faf8f3] dark:hover:bg-slate-800 text-slate-400 hover:text-[#2d5016] dark:hover:text-emerald-400 transition-all cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Mode Selection Switcher with animated pill */}
                                <div className={cn(
                                    "flex p-1.5 rounded-2xl relative border transition-colors",
                                    isDark 
                                        ? "bg-slate-950/70 border-slate-800" 
                                        : "bg-[#faf8f3] border-[#d4a574]/30"
                                )}>
                                    <m.div
                                        className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-[#2d5016] to-[#4a7c59] dark:from-emerald-700 dark:to-teal-600 shadow-md"
                                        initial={false}
                                        animate={{
                                            left: !isClientMode ? '6px' : '50%',
                                            width: 'calc(50% - 6px)'
                                        }}
                                        transition={{ type: "spring", stiffness: 350, damping: 32 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setIsClientMode(false); setConnectionStatus(null); }}
                                        className={cn(
                                            "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                            !isClientMode 
                                                ? "text-white" 
                                                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-[#8b6f47] hover:text-[#2d5016]")
                                        )}
                                    >
                                        <Laptop size={15} /> Chạy cục bộ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsClientMode(true)}
                                        className={cn(
                                            "flex-1 relative z-10 py-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                            isClientMode 
                                                ? "text-white" 
                                                : (isDark ? "text-slate-400 hover:text-slate-200" : "text-[#8b6f47] hover:text-[#2d5016]")
                                        )}
                                    >
                                        <Network size={15} /> Máy khách LAN
                                    </button>
                                </div>

                                {isClientMode ? (
                                    <m.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] sm:text-[11px] font-black text-[#8b6f47] dark:text-emerald-400 uppercase ml-2 tracking-wider">
                                                Địa chỉ IP Máy Chủ chính
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ví dụ: 192.168.1.15"
                                                value={lanIp}
                                                onChange={(e) => { setLanIp(e.target.value); setConnectionStatus(null); }}
                                                className={cn(
                                                    "w-full border-2 rounded-2xl py-3.5 sm:py-4 px-4 font-mono font-bold text-sm outline-none transition-all shadow-inner",
                                                    isDark 
                                                        ? "bg-slate-950/60 border-slate-800 focus:border-emerald-500 text-emerald-300 placeholder-slate-600" 
                                                        : "bg-[#faf8f3] border-transparent focus:border-[#d4a574]/50 focus:bg-white text-[#2d5016] placeholder-[#8b6f47]/40"
                                                )}
                                            />
                                        </div>

                                        {/* Status Message */}
                                        {connectionStatus === 'success' && (
                                            <m.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center shadow-xs"
                                            >
                                                <Check size={16} strokeWidth={2.5} /> 
                                                <span>Kết nối Máy Chủ thành công!</span>
                                            </m.div>
                                        )}
                                        {connectionStatus === 'failed' && (
                                            <m.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 justify-center shadow-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <WifiOff size={16} /> 
                                                    <span>Lỗi kết nối! Kiểm tra lại IP hoặc WiFi.</span>
                                                </div>
                                                {pingError && (
                                                    <div className="text-[10px] text-rose-500/80 font-mono text-center normal-case border-t border-rose-500/15 pt-1 w-full">
                                                        {pingError}
                                                    </div>
                                                )}
                                            </m.div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleTestConnection}
                                            disabled={testingConnection || !lanIp.trim()}
                                            className={cn(
                                                "w-full py-4 border-2 rounded-2xl font-black uppercase tracking-wider text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer",
                                                isDark 
                                                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40" 
                                                    : "border-[#2d5016]/20 bg-emerald-50/70 text-[#2d5016] hover:bg-emerald-100/70 hover:border-[#2d5016]/40"
                                            )}
                                        >
                                            {testingConnection ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                                    <span>ĐANG KIỂM TRA KẾT NỐI...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wifi size={16} /> 
                                                    <span>Kiểm tra kết nối mạng</span>
                                                </>
                                            )}
                                        </button>
                                    </m.div>
                                ) : (
                                    <div className={cn(
                                        "p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm transition-colors",
                                        isDark 
                                            ? "bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-teal-950/20 border-emerald-500/20 text-emerald-200" 
                                            : "bg-gradient-to-br from-emerald-500/[0.07] via-[#faf8f3] to-amber-500/[0.05] border-[#2d5016]/15 text-[#2d5016]"
                                    )}>
                                        <div className="p-2.5 bg-[#2d5016]/10 dark:bg-emerald-500/20 text-[#2d5016] dark:text-emerald-400 rounded-xl shrink-0">
                                            <Laptop size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase tracking-wider">Chế độ Máy Độc Lập</h4>
                                            <p className="text-xs font-medium leading-relaxed opacity-90">
                                                Ứng dụng sẽ hoạt động cục bộ, sử dụng cơ sở dữ liệu nội bộ trực tiếp trên máy tính này.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer buttons */}
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#d4a574]/20 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowLanModal(false)}
                                        className={cn(
                                            "py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] cursor-pointer border",
                                            isDark 
                                                ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800" 
                                                : "bg-[#faf8f3] border-[#d4a574]/40 text-[#8b6f47] hover:bg-white hover:text-[#2d5016]"
                                        )}
                                    >
                                        HỦY BỎ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveLanConfig}
                                        className="py-4 bg-gradient-to-r from-[#2d5016] via-[#3a651d] to-[#4a7c59] dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:opacity-95 transition-all shadow-xl shadow-[#2d5016]/20 active:scale-[0.98] cursor-pointer"
                                    >
                                        LƯU CẤU HÌNH
                                    </button>
                                </div>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
