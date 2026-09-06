import React, { Suspense, lazy, useEffect, useState } from 'react';
import { KeepAlive } from 'react-activation';
import { HashRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LazyMotion, domMax, m, AnimatePresence, MotionConfig } from 'framer-motion';
import Layout from './components/Layout';
import PageWrapper from './components/PageWrapper';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import FontLoader from './components/FontLoader';
import LoadingOverlay from './components/LoadingOverlay';
import CustomCursor from './components/CustomCursor';
import { checkIsAdmin } from './lib/auth';
import { precacheCommonTTS } from './lib/utils';
import axios from 'axios';

const DEFAULT_PORT = import.meta.env.VITE_BACKEND_PORT || '3579';

const resolveApiUrl = (val) => {
    if (!val) return '';
    let clean = val.trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.toLowerCase() === 'localhost') return `http://localhost:${DEFAULT_PORT}`;
    const hasLetters = /[a-zA-Z]/.test(clean) && !clean.includes(':');
    if (hasLetters) {
        return `https://${clean}`;
    }
    if (clean.includes(':')) {
        return `http://${clean}`;
    }
    return `http://${clean}:${DEFAULT_PORT}`;
};

const savedIp = localStorage.getItem('server_ip');
const envApiUrl = import.meta.env.VITE_API_URL;
if (savedIp) {
    axios.defaults.baseURL = resolveApiUrl(savedIp);
} else if (envApiUrl) {
    axios.defaults.baseURL = resolveApiUrl(envApiUrl);
} else if (typeof window !== 'undefined' && window.location && window.location.hostname && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' && 
           window.location.hostname !== 'tauri.localhost') {
    axios.defaults.baseURL = `${window.location.protocol}//${window.location.hostname}:${DEFAULT_PORT}`;
} else {
    axios.defaults.baseURL = `http://localhost:${DEFAULT_PORT}`;
}

// Don dep bo nho dem bi loi neu co
if (localStorage.getItem('weather_location') === 'undefined') {
    localStorage.removeItem('weather_location');
}
if (sessionStorage.getItem('user') === 'undefined') {
    sessionStorage.removeItem('user');
}
if (localStorage.getItem('user') === 'undefined') {
    localStorage.removeItem('user');
}

const getSafeSessionUser = (fallback = '{}') => {
  const saved = sessionStorage.getItem('user');
  if (!saved || saved === 'undefined') return fallback === 'null' ? null : {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    sessionStorage.removeItem('user');
    return fallback === 'null' ? null : {};
  }
};

// Tu dong su dung adapter native Rust cho Axios neu chay trong moi truong Tauri
if (window.__TAURI_INTERNALS__) {
    import('@tauri-apps/plugin-http').then(({ fetch: tauriFetch }) => {
        axios.defaults.adapter = async (config) => {
            // Xay dung URL day du
            let fullUrl = config.url || '';
            if (config.baseURL && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = `${config.baseURL.replace(/\/+$/, '')}/${fullUrl.replace(/^\/+/, '')}`;
            }

            // Ghep query parameters tu config.params neu co
            if (config.params) {
                const searchParams = new URLSearchParams();
                Object.entries(config.params).forEach(([key, val]) => {
                    if (val !== undefined && val !== null) {
                        searchParams.append(key, val);
                    }
                });
                const queryString = searchParams.toString();
                if (queryString) {
                    fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
                }
            }

            // Chuan bi headers
            const headers = {};
            if (config.headers) {
                if (typeof config.headers.toJSON === 'function') {
                    Object.assign(headers, config.headers.toJSON());
                } else {
                    Object.assign(headers, config.headers);
                }
            }

            // Kiem tra loai du lieu FormData de upload file
            const isFormData = config.data instanceof FormData;
            
            if (isFormData) {
                // Xoa Content-Type de trinh duyet/native fetch tu dong tao boundary
                Object.keys(headers).forEach(key => {
                    if (key.toLowerCase() === 'content-type') {
                        delete headers[key];
                    }
                });
            } else {
                // Dat Content-Type mac dinh neu gui payload dang JSON
                const hasContentType = Object.keys(headers).some(key => key.toLowerCase() === 'content-type');
                if (config.data && typeof config.data === 'object' && !hasContentType) {
                    headers['Content-Type'] = 'application/json';
                }
            }

            // Chuan bi body de gui
            let body = undefined;
            if (config.data) {
                if (isFormData) {
                    body = config.data;
                } else if (typeof config.data === 'string') {
                    body = config.data;
                } else {
                    body = JSON.stringify(config.data);
                }
            }

            try {
                // Thuc hien fetch native qua Rust
                const response = await tauriFetch(fullUrl, {
                    method: (config.method || 'GET').toUpperCase(),
                    headers: headers,
                    body: body
                });
                
                // Doc body dua tren config.responseType hoac Content-Type
                let data;
                if (config.responseType === 'arraybuffer') {
                    data = await response.arrayBuffer();
                } else if (config.responseType === 'blob') {
                    const buffer = await response.arrayBuffer();
                    const contentType = response.headers.get('content-type') || 'application/octet-stream';
                    data = new Blob([buffer], { type: contentType });
                } else {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }
                }
                
                const isSuccess = response.status >= 200 && response.status < 300;
                const axiosResponse = {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    config
                };

                if (!isSuccess) {
                    const axiosError = new Error(`Request failed with status code ${response.status}`);
                    axiosError.response = axiosResponse;
                    axiosError.config = config;
                    axiosError.status = response.status;
                    throw axiosError;
                }
                
                return axiosResponse;
            } catch (err) {
                if (err.response) throw err;
                console.warn('[Tauri HTTP Adapter] Native fetch failed, falling back to standard fetch:', err);
                try {
                    const res = await fetch(fullUrl, { method: (config.method || 'GET').toUpperCase(), headers: headers, body: body });
                    const contentType = res.headers.get('content-type') || '';
                    const data = contentType.includes('application/json') ? await res.json() : await res.text();
                    const axiosResponse = { data, status: res.status, statusText: res.statusText, headers: {}, config };
                    if (res.status >= 400) {
                        const axiosError = new Error(`Request failed with status code ${res.status}`);
                        axiosError.response = axiosResponse;
                        axiosError.config = config;
                        axiosError.status = res.status;
                        throw axiosError;
                    }
                    return axiosResponse;
                } catch (fallbackErr) {
                    throw fallbackErr;
                }
            }
        };
    }).catch(e => {
        console.warn('Khong the nap Tauri HTTP adapter cho Axios:', e);
    });
}

import MobileBottomNav from './components/MobileBottomNav';
import MobileLayout from './components/MobileLayout';
import AppWallpaper from './components/AppWallpaper';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/LyangPOS/Dashboard'));
const POSnew = lazy(() => import('./pages/LyangPOS/POSnew'));
const Purchase = lazy(() => import('./pages/LyangPOS/Purchase'));
const BarcodeGenerator = lazy(() => import('./pages/LyangPOS/BarcodeGenerator'));
const History = lazy(() => import('./pages/LyangPOS/History'));
const CashVoucher = lazy(() => import('./pages/LyangPOS/CashVoucher'));
const ProductManager = lazy(() => import('./pages/LyangPOS/ProductManager'));
const PartnerManager = lazy(() => import('./pages/LyangPOS/PartnerManager'));
const Settings = lazy(() => import('./pages/LyangPOS/Settings'));
const Reports = lazy(() => import('./pages/LyangPOS/Reports'));
const ReportsBoard = lazy(() => import('./pages/LyangPOS/ReportsBoard'));
const Summary = lazy(() => import('./pages/LyangPOS/Summary'));
const InvoiceDesigner = lazy(() => import('./pages/LyangPOS/InvoiceDesigner'));
const BankManager = lazy(() => import('./pages/LyangPOS/BankManager'));
const Calculator = lazy(() => import('./pages/LyangPOS/Calculator'));
const PartnerProfile = lazy(() => import('./pages/LyangPOS/PartnerProfile'));
const Welcome = lazy(() => import('./pages/LyangPOS/Welcome'));
const MobilePOS = lazy(() => import('./pages/LyangPOS_mobile/MobilePOS'));
const MobilePurchase = lazy(() => import('./pages/LyangPOS_mobile/MobilePurchase'));
const MobileOrders = lazy(() => import('./pages/LyangPOS_mobile/MobileOrders'));
const MobileSettings = lazy(() => import('./pages/LyangPOS_mobile/MobileSettings'));
const MobileDashboard = lazy(() => import('./pages/LyangPOS_mobile/MobileDashboard'));
const MobileHistory = lazy(() => import('./pages/LyangPOS_mobile/MobileHistory'));
import MobileProducts from './pages/LyangPOS_mobile/MobileProducts';
const MobilePartners = lazy(() => import('./pages/LyangPOS_mobile/MobilePartners'));
const CustomerCare = lazy(() => import('./pages/LyangPOS/CustomerCare'));
const PackingDisplay = lazy(() => import('./pages/LyangPOS/PackingDisplay'));
const MobileInventory = lazy(() => import('./pages/LyangPOS_mobile/MobileInventory'));
const InventoryAudit = lazy(() => import('./pages/LyangPOS/InventoryAudit'));
const StockConversion = lazy(() => import('./pages/LyangPOS/StockConversion'));
const Unauthorized = lazy(() => import('./pages/LyangPOS/Unauthorized'));
const RoleManager = lazy(() => import('./pages/LyangPOS/RoleManager'));
const Gaming = lazy(() => import('./pages/LyangPOS/Gaming'));
const TypingPractice = lazy(() => import('./pages/LyangPOS/TypingPractice'));
const AccountingInventory = lazy(() => import('./pages/LyangPOS/AccountingInventory'));
const POSWrapper = lazy(() => import('./pages/LyangPOS/POSWrapper'));
const POSLite = lazy(() => import('./pages/LyangPOS_lite/poslite'));
const DashboardLite = lazy(() => import('./pages/LyangPOS_lite/dashboardlite'));
const PurchaseLite = lazy(() => import('./pages/LyangPOS_lite/purchaselite'));
const HistoryLite = lazy(() => import('./pages/LyangPOS_lite/historylite'));
const SummaryLite = lazy(() => import('./pages/LyangPOS_lite/summarylite'));
const LedgerLite = lazy(() => import('./pages/LyangPOS_lite/ledgerlite'));
const SettingsLite = lazy(() => import('./pages/LyangPOS_lite/settingslite'));
const PrintOnly = lazy(() => import('./pages/LyangPOS/PrintOnly'));


const ProtectedRoute = ({ children }) => {
  const user = getSafeSessionUser('null');
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = getSafeSessionUser('null');
  if (!user) return <Navigate to="/welcome" replace />;

  const userRole = (user.role || 'user').toString().trim().toLowerCase();
  const isAdmin = checkIsAdmin(userRole);

  const normalizedAllowedRoles = allowedRoles.map(r => r.toString().trim().toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole) && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const LiteKeepAlive = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const liteTabs = [
    { path: '/' },
    { path: '/pos' },
    { path: '/purchase' },
    { path: '/history' },
    { path: '/summary' },
    { path: '/ledger' },
    { path: '/settings' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable) return;

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            navigate('/pos');
            break;
          case 'd':
            e.preventDefault();
            navigate('/');
            break;
          case 'h':
            e.preventDefault();
            navigate('/history');
            break;
          case 'pageup':
            e.preventDefault();
            const currIdxUp = liteTabs.findIndex(t => t.path === location.pathname);
            if (currIdxUp > 0) navigate(liteTabs[currIdxUp - 1].path);
            break;
          case 'pagedown':
            e.preventDefault();
            const currIdxDown = liteTabs.findIndex(t => t.path === location.pathname);
            if (currIdxDown >= 0 && currIdxDown < liteTabs.length - 1) navigate(liteTabs[currIdxDown + 1].path);
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, navigate]);

  return (
    <>
      <div style={{ display: location.pathname === '/' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <DashboardLite />
      </div>
      <div style={{ display: location.pathname === '/pos' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <POSLite />
      </div>
      <div style={{ display: location.pathname === '/purchase' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <PurchaseLite />
      </div>
      <div style={{ display: location.pathname === '/history' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <HistoryLite />
      </div>
      <div style={{ display: location.pathname === '/summary' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <SummaryLite />
      </div>
      <div style={{ display: location.pathname === '/ledger' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <LedgerLite />
      </div>
      <div style={{ display: location.pathname === '/settings' ? 'block' : 'none', height: '100%', width: '100%' }}>
        <SettingsLite />
      </div>
    </>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const isLiteMode = import.meta.env.VITE_APP_MODE === 'lite';

  const user = getSafeSessionUser('{}');
  const role = (user.role || 'user').toString().trim().toLowerCase();
  const isAdmin = checkIsAdmin(role);

  // Auto-redirect to mobile POS if on root index and mobile device
  // Auto connection recovery for startup & instance database connection
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        await axios.get('/api/ping', { timeout: 3000 });
      } catch (err) {
        console.warn('[Connection Auto-Recovery] Base URL ping failed:', axios.defaults.baseURL);
        const savedIp = localStorage.getItem('server_ip');
          try {
            // Try localhost fallback if custom server IP failed
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`http://localhost:${DEFAULT_PORT}/api/ping`, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
              console.log(`[Connection Auto-Recovery] Switched back to localhost:${DEFAULT_PORT}`);
              localStorage.removeItem('server_ip');
              axios.defaults.baseURL = `http://localhost:${DEFAULT_PORT}`;
            }
          } catch (e) {
            // Both failed
          }
      }
    };
    checkServerConnection();
  }, []);

  useEffect(() => {
    if (isMobile && location.pathname === '/') {
      // Handled by Route below
    }
  }, [isMobile, location.pathname]);

  const isMobilePage = ['/mobile-pos', '/mobile-purchase', '/mobile-orders', '/mobile-settings', '/mobile-inventory', '/mobile-dashboard', '/mobile-history', '/mobile-products', '/mobile-partners'].includes(location.pathname);

  return (
    <>
      {isMobilePage ? (
        <MobileLayout>
          <Suspense fallback={<LoadingOverlay isVisible={true} />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/mobile-dashboard" element={<MobileDashboard />} />
                <Route path="/mobile-pos" element={<MobilePOS />} />
                <Route path="/mobile-purchase" element={<MobilePurchase />} />
                <Route path="/mobile-orders" element={<MobileOrders />} />
                <Route path="/mobile-history" element={<MobileHistory />} />
                <Route path="/mobile-products" element={<MobileProducts />} />
                <Route path="/mobile-partners" element={<MobilePartners />} />

                {/* Admin Only Mobile Routes */}
                <Route path="/mobile-settings" element={<RoleProtectedRoute allowedRoles={['admin']}><MobileSettings /></RoleProtectedRoute>} />
                <Route path="/mobile-inventory" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><MobileInventory /></RoleProtectedRoute>} />
              </Routes>
          </Suspense>
        </MobileLayout>
      ) : (
        <Layout>
          <Suspense fallback={<LoadingOverlay isVisible={true} message="Đang tải..." />}>
            {isLiteMode && ['/', '/pos', '/purchase', '/history', '/summary', '/ledger', '/settings'].includes(location.pathname) ? (
              <LiteKeepAlive />
            ) : (
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  isMobile ? <Navigate to="/mobile-dashboard" /> :
                    (isLiteMode ? <PageWrapper><DashboardLite /></PageWrapper> :
                      (isAdmin ? (localStorage.getItem('pos_default_landing_page') === 'pos' ? <Navigate to="/pos" replace /> : <PageWrapper><Dashboard /></PageWrapper>) : <Navigate to="/pos" replace />))
                } />
                  <Route path="/barcodes" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><BarcodeGenerator /></PageWrapper></RoleProtectedRoute>} />
                  <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />
                <Route path="/mobile-dashboard" element={<PageWrapper><MobileDashboard /></PageWrapper>} />
                <Route path="/mobile-pos" element={<PageWrapper><MobilePOS /></PageWrapper>} />
                <Route path="/mobile-purchase" element={<PageWrapper><MobilePurchase /></PageWrapper>} />
                <Route path="/mobile-orders" element={<PageWrapper><MobileOrders /></PageWrapper>} />
                <Route path="/mobile-history" element={<PageWrapper><MobileHistory /></PageWrapper>} />
                <Route path="/mobile-products" element={<PageWrapper><MobileProducts /></PageWrapper>} />
                <Route path="/mobile-partners" element={<PageWrapper><MobilePartners /></PageWrapper>} />
                <Route path="/mobile-settings" element={<PageWrapper><MobileSettings /></PageWrapper>} />
                <Route path="/mobile-inventory" element={<PageWrapper><MobileInventory /></PageWrapper>} />
                <Route path="/pos" element={
                  <ProtectedRoute>{isLiteMode ? <PageWrapper><POSLite /></PageWrapper> : <PageWrapper><POSWrapper /></PageWrapper>}</ProtectedRoute>
                } />
                <Route path="/purchase" element={
                  <ProtectedRoute>{isLiteMode ? <PageWrapper><PurchaseLite /></PageWrapper> : <PageWrapper><Purchase /></PageWrapper>}</ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>{isLiteMode ? <PageWrapper><HistoryLite /></PageWrapper> : <PageWrapper><History /></PageWrapper>}</ProtectedRoute>
                } />

                {/* Protected Admin Routes */}
                <Route path="/products" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><ProductManager /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/partners" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><PartnerManager /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/vouchers" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><CashVoucher /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/analysis" element={<RoleProtectedRoute allowedRoles={['admin']}><PageWrapper><ReportsBoard /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/summary" element={
                  isLiteMode ? <PageWrapper><SummaryLite /></PageWrapper> :
                    <RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><Summary /></PageWrapper></RoleProtectedRoute>
                } />
                <Route path="/ledger" element={
                  isLiteMode ? <PageWrapper><LedgerLite /></PageWrapper> : <Navigate to="/summary" />
                } />
                <Route path="/partner-profile" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><PartnerProfile /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/partner-profile/:id" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><PartnerProfile /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/reports" element={<RoleProtectedRoute allowedRoles={['admin']}><PageWrapper><Reports /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/accounting/inventory" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><AccountingInventory /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/invoice-designer" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><InvoiceDesigner /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/banking" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><BankManager /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/calculator" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><Calculator /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/settings" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><Settings /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/customer-care" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><CustomerCare /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/inventory" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><InventoryAudit /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/inventory/conversion" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><StockConversion /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/roles" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><RoleManager /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/gaming" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><Gaming /></PageWrapper></RoleProtectedRoute>} />
                <Route path="/typing" element={<RoleProtectedRoute allowedRoles={['admin', 'accountant', 'user']}><PageWrapper><TypingPractice /></PageWrapper></RoleProtectedRoute>} />
              </Routes>
            </AnimatePresence>
            )}
          </Suspense>
        </Layout>
      )}
    </>
  );
};

const Heartbeat = () => {
  useEffect(() => {
    const sendHeartbeat = () => {
      if (!document.hidden) {
        axios.post('/api/heartbeat').catch(() => { });
      }
    };
    const interval = setInterval(sendHeartbeat, 15000);
    sendHeartbeat();
    return () => clearInterval(interval);
  }, []);
  return null;
};

const AutoOptimizeDb = () => {
  useEffect(() => {
    const isEnabled = localStorage.getItem('auto_optimize_db_disabled') !== 'true';
    if (isEnabled) {
      axios.post('/api/optimize-db').catch((err) => {
        console.warn("Auto DB optimization background notice:", err);
      });
    }
  }, []);
  return null;
};

const rgbOrNamedToHex = (colorStr, isDark, isText = false) => {
  if (!colorStr) {
    if (isText) return isDark ? '#4ade80' : '#2d5016';
    return isDark ? '#06150a' : '#faf8f3';
  }

  // If already a hex color, return it
  if (colorStr.startsWith('#')) {
    return colorStr;
  }

  // Handle rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Common named colors fallback
  const lower = colorStr.toLowerCase();
  if (lower === 'white' || lower === '#ffffff') return '#ffffff';
  if (lower === 'black' || lower === '#000000') return '#000000';
  if (lower === 'transparent') {
    if (isText) return isDark ? '#4ade80' : '#2d5016';
    return isDark ? '#06150a' : '#faf8f3';
  }

  // Try parsing by element style injection helper
  try {
    const temp = document.createElement('div');
    temp.style.color = colorStr;
    document.body.appendChild(temp);
    const compColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const match = compColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  } catch (e) {}

  if (isText) return isDark ? '#4ade80' : '#2d5016';
  return isDark ? '#06150a' : '#faf8f3';
};

const TitleBarColorSync = () => {
  const location = useLocation();

  useEffect(() => {
    const syncColors = () => {
      if (typeof window === 'undefined' || !window.__TAURI__) return;

      setTimeout(() => {
        try {
          const docEl = document.documentElement;
          const style = getComputedStyle(docEl);
          const isDark = docEl.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
          
          let bgColor = style.getPropertyValue('--bg-color').trim();
          if (!bgColor) {
            bgColor = style.backgroundColor || '';
          }
          const hexColor = rgbOrNamedToHex(bgColor, isDark);

          let textColor = style.getPropertyValue('--text-main').trim();
          const hexTextColor = rgbOrNamedToHex(textColor, isDark, true);

          window.__TAURI__.core.invoke('set_window_colors', {
            backgroundColor: hexColor,
            textColor: hexTextColor
          }).catch(err => {
            console.error('Failed to set window colors:', err);
          });
        } catch (err) {
          console.error('Error syncing title bar colors:', err);
        }
      }, 150); // Safe timeout for theme/transition styling
    };

    syncColors();

    const observer = new MutationObserver(syncColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style']
    });

    return () => {
      observer.disconnect();
    };
  }, [location]);

  return null;
};

function App() {
  const [gpuDisabled, setGpuDisabled] = useState(() => localStorage.getItem("pos_gpu_disabled") === "true");

  useEffect(() => {
    // Force focus when app starts & listen for close request to checkpoint WAL
    if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        try {
          const appWindow = getCurrentWindow();
          appWindow.setFocus();
          appWindow.show();

          appWindow.onCloseRequested(async () => {
            try {
              await axios.post('/api/optimize-db');
            } catch (e) {}
          });
        } catch (e) {
          console.warn("Failed to set window focus", e);
        }
      }).catch(err => console.warn("Failed to import window api", err));
    }

    const handleF11Toggle = async (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (window.__TAURI_INTERNALS__) {
          try {
            const { getCurrentWindow } = await import('@tauri-apps/api/window');
            const appWindow = getCurrentWindow();
            const isFullscreen = await appWindow.isFullscreen();
            await appWindow.setFullscreen(!isFullscreen);
          } catch (err) {
            console.error("Failed to toggle fullscreen via F11", err);
          }
        }
      }
    };
    window.addEventListener('keydown', handleF11Toggle);

    const handleGpuState = () => {
      setGpuDisabled(localStorage.getItem("pos_gpu_disabled") === "true");
    };
    window.addEventListener("gpu_state_changed", handleGpuState);
    window.addEventListener("storage", handleGpuState);
    
    // Initial mount check
    if (localStorage.getItem("pos_gpu_disabled") === "true") {
      document.documentElement.classList.add("gpu-disabled");
    } else {
      document.documentElement.classList.remove("gpu-disabled");
    }

    return () => {
      window.removeEventListener("keydown", handleF11Toggle);
      window.removeEventListener("gpu_state_changed", handleGpuState);
      window.removeEventListener("storage", handleGpuState);
    };
  }, []);

  useEffect(() => {
    // Tu dong kiem tra va quet tao truoc cac file am thanh TTS nen khi chay tren may moi
    const initTTSBackgroundScan = async () => {
      try {
        const res = await axios.get('/api/products').catch(() => null);
        const products = res && Array.isArray(res.data) ? res.data : [];
        precacheCommonTTS(products);
      } catch (e) {
        console.warn("Background TTS audit failed:", e);
      }
    };
    const timer = setTimeout(initTTSBackgroundScan, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domMax}>
        <MotionConfig
          reducedMotion={gpuDisabled ? "always" : "no-preference"}
          transition={gpuDisabled ? { type: "just" } : { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.25 }}
        >
          <CustomCursor />
          <Router>
            <TitleBarColorSync />
            <Toaster position="top-center" reverseOrder={false} />
            <Heartbeat />
            <AutoOptimizeDb />
            <FontLoader />
            <AppWallpaper />

            <Suspense fallback={<LoadingOverlay isVisible={true} message="Khởi động..." />}>
              <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/packing-display" element={<PackingDisplay />} />
                <Route path="/print-only/:orderId" element={<PrintOnly />} />
                <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </Router>
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  );
}

export default App;
