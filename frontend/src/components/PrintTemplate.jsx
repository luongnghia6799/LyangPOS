import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { formatNumber, formatDate, normalizeUOM } from '../lib/utils';
import { DEFAULT_SETTINGS } from '../lib/settings';
import { loadGoogleFont } from '../lib/googleFonts';

const EditableWrapper = ({
    label,
    settingKey,
    sizeKey,
    colorKey,
    toggleKey,
    tab,
    settings,
    onUpdateSetting,
    isPreview,
    activeKey,
    setActiveKey,
    children,
    style = {},
    tagName = 'div'
}) => {
    const [hovered, setHovered] = useState(false);
    const isSelected = activeKey === settingKey;

    if (!isPreview) {
        return children;
    }

    const value = settings[settingKey] || '';
    const sizeValue = sizeKey ? (parseInt(settings[sizeKey]) || 12) : null;
    const colorValue = colorKey ? (settings[colorKey] || '#000000') : null;

    const handleContainerClick = (e) => {
        e.stopPropagation();
        setActiveKey(settingKey);
        if (tab && onUpdateSetting) {
            onUpdateSetting('activeTab', tab);
        }
    };

    const handleSizeChange = (change) => {
        if (!onUpdateSetting || !sizeKey) return;
        const newSize = Math.max(8, Math.min(72, (sizeValue || 12) + change));
        onUpdateSetting(sizeKey, String(newSize));
    };

    const handleColorChange = (color) => {
        if (!onUpdateSetting || !colorKey) return;
        onUpdateSetting(colorKey, color);
    };

    const handleTextChange = (text) => {
        if (!onUpdateSetting || !settingKey) return;
        onUpdateSetting(settingKey, text);
    };

    const handleToggleVisibility = () => {
        if (!onUpdateSetting || !toggleKey) return;
        const current = settings[toggleKey] === 'true';
        onUpdateSetting(toggleKey, current ? 'false' : 'true');
    };

    // Style for the wrapper container
    const wrapperStyle = {
        position: 'relative',
        outline: isSelected ? '2px solid #10b981' : (hovered ? '1px dashed #10b981' : 'none'),
        borderRadius: '4px',
        padding: '2px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        ...style
    };

    const Tag = tagName;

    return (
        <Tag
            style={wrapperStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleContainerClick}
        >
            {/* Label Badge on Hover or Selection */}
            {(hovered || isSelected) && (
                <div style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '2px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    zIndex: 999,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {label}
                </div>
            )}

            {children}

            {/* Floating Toolbar Controls */}
            {isSelected && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '-45px',
                        left: '0',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 9999,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        pointerEvents: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing/re-selecting when clicking toolbar
                >
                    {/* Text editor input if settingKey is editable text */}
                    {settingKey && ['shop_name', 'shop_address', 'shop_phone', 'shop_bank', 'shop_bank_account', 'shop_bank_user', 'invoice_thank_you_message', 'invoice_custom_title', 'invoice_custom_notes', 'invoice_delivery_title', 'invoice_sale_title', 'invoice_purchase_title'].includes(settingKey) && (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleTextChange(e.target.value)}
                            style={{
                                backgroundColor: '#0f172a',
                                color: 'white',
                                border: '1px solid #475569',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '11px',
                                outline: 'none',
                                width: '130px'
                            }}
                            placeholder="Sửa văn bản..."
                        />
                    )}

                    {/* Font Size controls */}
                    {sizeKey && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', borderLeft: '1px solid #475569', paddingLeft: '4px' }}>
                            <button
                                onClick={() => handleSizeChange(-1)}
                                style={{
                                    backgroundColor: '#334155',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Giảm cỡ chữ"
                            >
                                -
                            </button>
                            <span style={{ fontSize: '10px', fontMono: 'true', minWidth: '18px', textAlign: 'center' }}>
                                {sizeValue}
                            </span>
                            <button
                                onClick={() => handleSizeChange(1)}
                                style={{
                                    backgroundColor: '#334155',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Tăng cỡ chữ"
                            >
                                +
                            </button>
                        </div>
                    )}

                    {/* Color Picker swatch */}
                    {colorKey && (
                        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #475569', paddingLeft: '4px', position: 'relative' }}>
                            <input
                                type="color"
                                value={colorValue}
                                onChange={(e) => handleColorChange(e.target.value)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '1px solid #475569',
                                    padding: '0',
                                    borderRadius: '50%',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}
                                title="Đổi màu sắc"
                            />
                        </div>
                    )}

                    {/* Toggle Visibility button */}
                    {toggleKey && (
                        <button
                            onClick={handleToggleVisibility}
                            style={{
                                backgroundColor: '#334155',
                                color: settings[toggleKey] === 'true' ? '#34d399' : '#f87171',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            title="Bật/Tắt hiển thị"
                        >
                            {settings[toggleKey] === 'true' ? 'Ẩn' : 'Hiện'}
                        </button>
                    )}

                    {/* Jump to Sidebar Tab */}
                    {tab && (
                        <button
                            onClick={() => onUpdateSetting && onUpdateSetting('activeTab', tab)}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                            title="Mở cài đặt chi tiết trên thanh bên"
                        >
                            Cài đặt
                        </button>
                    )}

                    {/* Close Selection button */}
                    <button
                        onClick={() => setActiveKey(null)}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginLeft: '2px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </Tag>
    );
};

const DraggableBlock = ({
    xKey,
    yKey,
    wKey,
    yOffset = 0,
    positionMode = 'absolute',
    settings,
    onUpdateSetting,
    isPreview,
    children,
    style = {},
    className = ""
}) => {
    const isFree = settings.invoice_free_layout === 'true';
    const [hovered, setHovered] = useState(false);

    if (!isFree) {
        return children;
    }

    const x = parseInt(settings[xKey]) || 0;
    const yBase = parseInt(settings[yKey]) || 0;
    const y = yBase + yOffset;
    const w = wKey ? (parseInt(settings[wKey]) || 300) : null;

    const handleMouseDown = (e) => {
        if (!isPreview || !onUpdateSetting) return;
        // Don't drag if clicking input/button/select or elements inside toolbar
        if (
            e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'SELECT' || 
            e.target.closest('[class*="resize"]') ||
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('[class*="handle"]')
        ) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startPosValX = x;
        const startPosValY = yBase;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            onUpdateSetting(xKey, String(Math.round(startPosValX + deltaX)));
            onUpdateSetting(yKey, String(Math.round(startPosValY + deltaY)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (e) => {
        if (!isPreview || !onUpdateSetting || !wKey) return;
        e.stopPropagation();
        e.preventDefault();

        const startX = e.clientX;
        const startWidth = w;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.max(50, startWidth + deltaX);
            onUpdateSetting(wKey, String(Math.round(newWidth)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const combinedStyle = {
        ...style,
        position: positionMode === 'relative-flow' ? 'relative' : 'absolute',
        ...(positionMode === 'relative-flow' ? {
            marginLeft: `${x}px`,
            marginTop: `${y}px`,
        } : {
            left: `${x}px`,
            top: `${y}px`,
        }),
        width: wKey ? `${w}px` : (style.width || 'auto'),
        cursor: isPreview ? 'move' : 'default',
        userSelect: isPreview ? 'none' : 'auto',
        outline: (isPreview && hovered) ? '1px dashed #10b981' : 'none',
        zIndex: isPreview ? 999 : 'auto',
        transition: 'none'
    };

    return (
        <div
            className={className}
            style={combinedStyle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseDown={handleMouseDown}
        >
            {isPreview && hovered && (
                <div style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '2px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    Kéo để di chuyển ({x}, {yBase}) {wKey && `| Rộng: ${w}px`}
                </div>
            )}
            {isPreview && hovered && wKey && (
                <div
                    onMouseDown={handleResizeMouseDown}
                    className="resize-handle"
                    style={{
                        position: 'absolute',
                        right: '-4px',
                        top: '0',
                        bottom: '0',
                        width: '8px',
                        cursor: 'ew-resize',
                        backgroundColor: 'rgba(16, 185, 129, 0.3)',
                        borderRadius: '2px',
                        zIndex: 1001,
                    }}
                    title="Kéo sang phải/trái để chỉnh độ rộng"
                />
            )}
            {children}
        </div>
    );
};

const PrintTemplate = forwardRef(({ 
    data, 
    settings = {}, 
    type = 'Sale', 
    isPreview = false, 
    onUpdateSetting = null,
    showOldDebt = undefined,
    showPayment = undefined,
    showRemaining = undefined,
    showCashGiven = undefined,
    showChange = undefined
}, ref) => {
    const [activeKey, setActiveKey] = useState(null);
    const [watermarkHovered, setWatermarkHovered] = useState(false);

    // Merge settings with defaults safely
    const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };

    // Helper to resolve relative assets (logos, fonts) to full backend URLs in Tauri
    const getResolvedUrl = (url) => {
        if (!url || url === 'undefined' || url === 'null') return '';
        const normalized = url.replace(/\\/g, '/').trim();
        if (normalized.startsWith('http') || normalized.startsWith('data:')) {
            return normalized;
        }
        const savedIp = localStorage.getItem('server_ip');
        const defaultPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) || ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ? '3588' : '3588');
        let base = `http://localhost:${defaultPort}`;
        if (savedIp && savedIp !== 'undefined' && savedIp !== 'null' && savedIp.trim() !== '') {
            base = `http://${savedIp.trim()}:${defaultPort}`;
        } else if (!window.__TAURI_INTERNALS__) {
            base = window.location.origin;
        }
        return `${base.replace(/\/+$/, '')}/${normalized.replace(/^\/+/, '')}`;
    };

    const fontFamily = s.invoice_custom_font_name
        ? `'${s.invoice_custom_font_name.split('.')[0]}', sans-serif`
        : (s.invoice_font_family || 'Inter, "Be Vietnam Pro", sans-serif');

    // Preload custom font explicitly into document.fonts cache so print dialog always sees it
    useEffect(() => {
        if (s.invoice_custom_font_name && typeof document !== 'undefined' && document.fonts && typeof FontFace !== 'undefined') {
            try {
                const fontName = s.invoice_custom_font_name.split('.')[0];
                const format = s.invoice_custom_font_name.toLowerCase().endsWith('.ttf') ? 'truetype' : 'opentype';
                const fontUrl = getResolvedUrl(`/uploads/fonts/${s.invoice_custom_font_name}`);
                const f = new FontFace(fontName, `url('${fontUrl}')`, { display: 'block' });
                f.load().then(loadedFace => {
                    document.fonts.add(loadedFace);
                }).catch(err => {
                    console.warn(`PrintTemplate: Failed to load font ${fontName}`, err);
                });
            } catch (e) {
                // ignore font load error
            }
        } else if (s.invoice_font_family) {
            loadGoogleFont(s.invoice_font_family);
        }
    }, [s.invoice_custom_font_name, s.invoice_font_family]);

    if (!data) return null;
    const isVoucher = type === 'Receipt' || type === 'Payment';
    const isLedger = type === 'PartnerLedger';
    const isDelivery = type === 'Delivery' || type === 'StockOut';
    if (!isVoucher && !isLedger && (!data.details || data.details.length === 0)) return null;

    // Calculate safe total amount if data.total_amount is undefined
    const computedTotalFromDetails = (data.details || []).reduce((acc, item) => {
        const itemTotal = item.total !== undefined ? Number(item.total) : (Number(item.quantity || 0) * Number(item.price || 0));
        return acc + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    const safeTotalAmount = data.total_amount !== undefined && data.total_amount !== null
        ? Number(data.total_amount)
        : (data.total !== undefined && data.total !== null ? Number(data.total) : computedTotalFromDetails);
    const safeOldDebt = (data.old_debt !== undefined && data.old_debt !== null)
        ? Number(data.old_debt)
        : Number((data.partner && data.partner.debt_balance) || 0);
    const safeAmountPaid = Number(data.amount_paid || data.paid || 0);
    const safeCashGiven = Number(data.cash_given || 0);

    const wrap = (label, key, options = {}, child) => {
        return (
            <EditableWrapper
                label={label}
                settingKey={key}
                sizeKey={options.sizeKey}
                colorKey={options.colorKey}
                toggleKey={options.toggleKey}
                tab={options.tab}
                settings={s}
                onUpdateSetting={onUpdateSetting}
                isPreview={isPreview}
                activeKey={activeKey}
                setActiveKey={setActiveKey}
                style={options.style}
                tagName={options.tagName || 'div'}
            >
                {child}
            </EditableWrapper>
        );
    };

    const handleResizeStart = (e, colId, side = 'single') => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        
        let settingKey = '';
        if (colId === 'stt') settingKey = 'invoice_col_stt';
        else if (colId === 'code') settingKey = 'invoice_col_code';
        else if (colId === 'date') settingKey = 'invoice_col_date';
        else if (colId === 'method') settingKey = 'invoice_col_method';
        else if (colId === 'total') settingKey = 'invoice_col_total';
        else if (colId === 'name') settingKey = 'invoice_col_name';
        else if (colId === 'unit') settingKey = 'invoice_col_unit';
        else if (colId === 'sqty') settingKey = 'invoice_col_secondary_qty_width';
        else if (colId === 'qty') settingKey = 'invoice_col_qty';
        else if (colId === 'price') settingKey = 'invoice_col_price';
        
        if (!settingKey) return;

        // If side is left or right, resolve to the side-specific key
        if (side === 'left') {
            settingKey = settingKey.replace('invoice_col_', 'invoice_left_col_');
        } else if (side === 'right') {
            settingKey = settingKey.replace('invoice_col_', 'invoice_right_col_');
        }

        // Get current width (fallback to global key if side-specific is not defined yet)
        const currentWidth = parseInt(s[settingKey]) || parseInt(s[settingKey.replace('invoice_left_col_', 'invoice_col_').replace('invoice_right_col_', 'invoice_col_')]) || 80;
 
        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.max(30, currentWidth + deltaX);
            onUpdateSetting(settingKey, newWidth.toString());
        };
 
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
 
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleWatermarkDragStart = (e) => {
        if (!isPreview || !onUpdateSetting) return;
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const currentX = parseInt(s.invoice_watermark_x) || 100;
        const currentY = parseInt(s.invoice_watermark_y) || 200;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            onUpdateSetting('invoice_watermark_x', String(Math.round(currentX + deltaX)));
            onUpdateSetting('invoice_watermark_y', String(Math.round(currentY + deltaY)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleWatermarkResizeStart = (e) => {
        if (!isPreview || !onUpdateSetting) return;
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const currentSize = parseInt(s.invoice_watermark_size) || 100;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newSize = Math.max(10, currentSize + deltaX);
            onUpdateSetting('invoice_watermark_size', String(Math.round(newSize)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const useBadge = s.invoice_shop_name_badge === 'true';

    // Dynamic @font-face for the custom font
    const customFontFaceStyle = s.invoice_custom_font_name ? (
        <style>
            {`
                @font-face {
                    font-family: '${s.invoice_custom_font_name.split('.')[0]}';
                    src: url('${getResolvedUrl(`/uploads/fonts/${s.invoice_custom_font_name}`)}') format('${s.invoice_custom_font_name.toLowerCase().endsWith('.ttf') ? 'truetype' : 'opentype'}');
                    font-weight: normal;
                    font-style: normal;
                    font-display: block;
                }
            `}
        </style>
    ) : null;

    // Calculate dimensions based on paper size
    const getDimensions = () => {
        const size = s.paper_size || 'A4';
        const orientation = s.invoice_orientation || 'portrait';

        let width = '210mm';
        let height = '297mm';

        if (size === 'A5') { width = '148mm'; height = '210mm'; }
        else if (size === 'A6') { width = '105mm'; height = '148mm'; }
        else if (size === 'C5') { width = '162mm'; height = '229mm'; }
        else if (size === 'K80') { width = '80mm'; height = 'auto'; }
        else if (size === 'K58') { width = '58mm'; height = 'auto'; }
        else if (size === 'CUSTOM') {
            const customW = parseFloat(s.invoice_custom_width) || 210;
            const customH = parseFloat(s.invoice_custom_height);
            width = `${customW}mm`;
            height = (customH && customH > 0) ? `${customH}mm` : 'auto';
        }

        if (orientation === 'landscape' && !size.startsWith('K') && height !== 'auto') {
            const temp = width;
            width = height;
            height = temp;
        }

        return { width, height };
    };

    const { width, height } = getDimensions();

    const isThermal = s.paper_size === 'K80' || s.paper_size === 'K58' || (s.paper_size === 'CUSTOM' && (!s.invoice_custom_height || parseFloat(s.invoice_custom_height) <= 0));

    const useDefaultMargins = s.invoice_use_default_margins === 'true' || s.invoice_use_default_margins === true;
    const mt = useDefaultMargins ? 0 : parseFloat(s.invoice_margin_top || 0);
    const mr = useDefaultMargins ? 0 : parseFloat(s.invoice_margin_right || 0);
    const mb = useDefaultMargins ? 0 : parseFloat(s.invoice_margin_bottom || 0);
    const ml = useDefaultMargins ? 0 : parseFloat(s.invoice_margin_left || 0);
    const printPaddingTop = parseFloat(s.invoice_padding_top || 0);

    const watermarkBottom = (String(s.invoice_show_watermark) === 'true')
        ? (parseInt(s.invoice_watermark_y) || 200) + (parseInt(s.invoice_watermark_size) || 100)
        : 0;

    const getHeaderHeight = () => {
        return parseInt(s.pos_table_y) || 230;
    };

    const getFooterHeight = () => {
        let maxBottom = 0;
        const notesY = Math.max(0, (parseInt(s.pos_notes_y) || 500) - 500);
        const summaryY = Math.max(0, (parseInt(s.pos_summary_y) || 500) - 500);
        const signaturesY = Math.max(0, (parseInt(s.pos_signatures_y) || 650) - 500);
        const thankYouY = Math.max(0, (parseInt(s.pos_thank_you_y) || 750) - 500);

        let hasAny = false;

        if (s.invoice_show_notes === 'true' && data.note && !isVoucher) {
            maxBottom = Math.max(maxBottom, notesY + 60);
            hasAny = true;
        }
        if (s.invoice_show_total_amount !== 'false') {
            let summaryRowsCount = 0;
            if (isVoucher) {
                summaryRowsCount = 1;
            } else {
                if (type !== 'PartnerLedger' && !isDelivery) {
                    summaryRowsCount += 1;
                }
                if (type === 'PartnerLedger') {
                    summaryRowsCount += 3;
                } else if (!isDelivery && (type === 'Sale' || type === 'Purchase' || type === 'Report')) {
                    const hasOldDebt = (showOldDebt !== undefined ? !!showOldDebt : s.invoice_show_old_debt === 'true') && data.partner_id && (data.old_debt || 0) !== 0 && !(type === 'Sale' && data.payment_method === 'Cash' && s.invoice_hide_old_debt_on_cash === 'true');
                    if (hasOldDebt) summaryRowsCount += 1;

                    const hasCashGiven = (showCashGiven !== undefined ? !!showCashGiven : s.invoice_show_cash_given === 'true') && data.cash_given > 0;
                    if (hasCashGiven) summaryRowsCount += 1;

                    const hasChange = (showChange !== undefined ? !!showChange : s.invoice_show_change === 'true') && data.cash_given > (data.total_amount || 0);
                    if (hasChange) summaryRowsCount += 1;

                    const hasPayment = (showPayment !== undefined ? !!showPayment : s.invoice_show_paid === 'true');
                    if (hasPayment) summaryRowsCount += 1;

                    const balance = type === 'Sale'
                        ? (data.total_amount + (data.old_debt || 0)) - (data.amount_paid || 0)
                        : (data.old_debt || 0) - (data.total_amount - (data.amount_paid || 0));
                    const isDebtOrPartial = ((type === 'Sale' || type === 'Purchase') && data.payment_method === 'Debt') || (balance !== 0) || ((data.old_debt || 0) !== 0);
                    const hasBalance = (showRemaining !== undefined ? !!showRemaining : s.invoice_show_balance === 'true') && (data.partner_id || data.partner?.id || data.partner || (data.old_debt || 0) !== 0) && (balance !== 0 || isDebtOrPartial) && !(type === 'Sale' && data.payment_method === 'Cash' && s.invoice_hide_old_debt_on_cash === 'true');
                    if (hasBalance) summaryRowsCount += 1;
                }
            }
            const summaryHeight = summaryRowsCount * 22 + 10;
            maxBottom = Math.max(maxBottom, summaryY + summaryHeight);
            hasAny = true;
        }
        if (s.invoice_show_signatures === 'true') {
            maxBottom = Math.max(maxBottom, signaturesY + 100);
            hasAny = true;
        }
        if (s.invoice_show_thank_you === 'true') {
            maxBottom = Math.max(maxBottom, thankYouY + 60);
            hasAny = true;
        }
        return hasAny ? maxBottom + 20 : 0;
    };

    const containerStyle = {
        fontFamily: fontFamily,
        fontSize: `${s.invoice_table_content_size || s.invoice_font_size}px`,
        lineHeight: s.invoice_line_spacing || '1.4',
        color: '#000',
        padding: isPreview 
            ? `${mt + printPaddingTop + (isThermal ? 0 : 4)}mm ${mr}mm ${mb}mm ${ml}mm` 
            : `${mt + printPaddingTop + (isThermal ? 0 : 4)}mm ${mr}mm ${mb}mm ${ml}mm`,
        maxWidth: 'none',
        width: isPreview ? width : (isThermal ? width : `calc(${width} - ${ml}mm - ${mr}mm)`),
        minHeight: isPreview ? height : (watermarkBottom > 0 ? `${watermarkBottom}px` : '0'),
        height: 'auto',
        backgroundColor: '#fff',
        margin: isPreview ? '0' : '0 auto',
        boxSizing: 'border-box',
        display: 'block',
        flexDirection: 'column',
        overflow: 'visible',
        pageBreakAfter: 'auto',
        pageBreakBefore: 'auto',
        pageBreakInside: 'auto',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        // Visual indicator for margins in preview
        boxShadow: isPreview ? '0 15px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)' : 'none',
        borderRadius: isPreview ? '2px' : '0',
        backgroundImage: (isPreview && s.invoice_preview_bg_image && s.invoice_preview_bg_image !== 'none')
            ? `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url(/${s.invoice_preview_bg_image})`
            : 'none',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'normal'
    };

    const borderThickness = s.invoice_table_border_thickness === 'medium' ? '2px' : (s.invoice_table_border_thickness === 'thick' ? '3px' : '1px');
    const borderValue = `${borderThickness} ${s.invoice_table_border_style || 'solid'} #000`;

    const headerBorderValue = s.invoice_table_header_border === 'true'
        ? `${s.invoice_table_header_border_width}px solid ${s.invoice_table_header_border_color}`
        : (s.invoice_table_border_rows === 'true' ? borderValue : 'none');

    const isHeaderBadge = s.invoice_table_header_is_badge === 'true';

    const badgeHeaderBorder = isHeaderBadge
        ? `0.5px solid ${s.invoice_table_header_badge_border || '#86efac'}`
        : headerBorderValue;

    // Dynamic style for both preview and print
    const fontScopeStyle = (
        <style>
            {`
                #print-template,
                #print-template *,
                .preview-mode,
                .preview-mode * {
                    font-family: ${fontFamily} !important;
                }
            `}
        </style>
    );

    // Dynamic @page style
    const pageStyle = !isPreview ? (
        <style>
            {`
                @media print {
                    html, body, :root {
                        color-scheme: light !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box !important;
                    }
                    .print-watermark {
                        display: block !important;
                        visibility: visible !important;
                        opacity: ${s.invoice_watermark_opacity || '0.15'} !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        z-index: 9999 !important;
                        position: absolute !important;
                    }
                    @page {
                        size: ${s.paper_size === 'K80' ? '80mm auto' : (s.paper_size === 'K58' ? '58mm auto' : (s.paper_size === 'CUSTOM' ? `${width} ${height}` : `${s.paper_size || 'A4'} ${s.invoice_orientation || 'portrait'}`))} !important;
                        margin: ${isThermal ? '0' : (useDefaultMargins ? '0' : `${mt + printPaddingTop}mm ${mr}mm ${mb}mm ${ml}mm`)} !important;
                        ${s.invoice_show_page_number === 'true' ? `
                        @bottom-${s.invoice_page_number_position === 'bottom-left' ? 'left' : (s.invoice_page_number_position === 'bottom-center' ? 'center' : 'right')} {
                            content: ${s.invoice_page_number_format === 'page_only' ? '"Trang " counter(page)' : '"Trang " counter(page) " / " counter(pages)'} !important;
                            font-size: ${s.invoice_page_number_size || 10}px !important;
                            color: ${s.invoice_page_number_color || '#64748b'} !important;
                            font-style: italic !important;
                            font-family: ${fontFamily} !important;
                        }
                        ` : ''}
                    }
                    .print-page-number {
                        display: none !important;
                    }
                    body, html, .dark, .dark body, .dark #pos-root-container, .dark .pos-lite-container {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        background-color: #fff !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    #print-template,
                    #print-template * {
                        font-family: ${fontFamily} !important;
                    }
                    #print-template {
                        width: ${isThermal ? width : '100%'} !important;
                        max-width: 100% !important;
                        overflow: visible !important;
                        position: relative !important;
                        padding: ${isThermal ? `${mt + printPaddingTop}mm ${mr}mm ${mb}mm ${ml}mm` : (useDefaultMargins ? '4mm 0' : '0')} !important;
                        box-sizing: border-box !important;
                        margin: 0 auto !important;
                    }
                    .print-content-flow {
                        width: 100% !important;
                        overflow: visible !important;
                        display: block !important;
                    }
                    .invoice-items-table {
                        width: 100% !important;
                        border-collapse: ${isHeaderBadge ? 'separate' : 'collapse'} !important;
                        border-spacing: 0 !important;
                        ${(s.invoice_table_border === 'true' && !isHeaderBadge) ? `border: ${borderValue} !important;` : 'border: none !important;'}
                        page-break-inside: auto !important;
                        break-inside: auto !important;
                    }
                    .invoice-items-table tr {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .invoice-items-table th {
                        border-top: ${isHeaderBadge ? badgeHeaderBorder : (s.invoice_table_header_border === 'true' ? headerBorderValue : 'none')} !important;
                        border-bottom: ${isHeaderBadge ? badgeHeaderBorder : headerBorderValue} !important;
                        border-right: ${(!isHeaderBadge && s.invoice_table_border_cols === 'true') ? borderValue : 'none'} !important;
                        border-left: ${(!isHeaderBadge && s.invoice_table_border === 'true') ? borderValue : 'none'} !important;
                        padding: ${isHeaderBadge ? `${Math.max(2, Math.floor((parseInt(s.invoice_row_padding || 4) + 4) * 0.8))}px ${s.invoice_row_padding || 4}px` : `${Math.max(1, Math.floor(parseInt(s.invoice_row_padding || 4) * 0.8))}px ${s.invoice_row_padding || 4}px`} !important;
                        line-height: ${s.invoice_table_line_height || '1.15'} !important;
                    }
                    ${isHeaderBadge ? `
                    .invoice-items-table th:first-child {
                        border-left: ${badgeHeaderBorder} !important;
                    }
                    .invoice-items-table th:last-child {
                        border-right: ${badgeHeaderBorder} !important;
                    }
                    ` : ''}
                    .invoice-items-table td {
                        border-bottom: ${s.invoice_table_border_rows === 'true' ? borderValue : 'none'} !important;
                        border-right: ${s.invoice_table_border_cols === 'true' ? borderValue : 'none'} !important;
                        border-left: ${s.invoice_table_border === 'true' ? borderValue : 'none'} !important;
                        padding: ${(s.paper_size === 'A6' || s.paper_size === 'K80' || s.paper_size === 'K58') ? Math.max(1, parseInt(s.invoice_row_padding || 4) - 2) : (parseInt(s.invoice_row_padding || 4))}px !important;
                        line-height: ${s.invoice_table_line_height || '1.15'} !important;
                    }
                    .invoice-items-table .invoice-summary-row td {
                        border-top: ${s.invoice_table_border_rows === 'true' ? borderValue : (s.invoice_table_border === 'true' ? borderValue : 'none')} !important;
                        border-bottom: ${s.invoice_table_border === 'true' ? borderValue : 'none'} !important;
                        border-left: ${s.invoice_table_border === 'true' ? borderValue : 'none'} !important;
                        border-right: ${s.invoice_table_border === 'true' ? borderValue : 'none'} !important;
                        padding: ${Math.max(3, parseInt(s.invoice_row_padding || 4))}px 8px !important;
                        background-color: #fafafa !important;
                    }
                    .print-pages-container {
                        width: 100% !important;
                        display: block !important;
                    }
                    .print-page-sheet {
                        width: 100% !important;
                        display: block !important;
                        box-sizing: border-box !important;
                    }
                    .print-section-avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}
        </style>
    ) : null;

    const useTitleBadge = s.invoice_title_badge === 'true';

    const headerStyle = {
        marginBottom: `${s.invoice_header_spacing || 10}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        paddingTop: '6px',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        overflow: 'visible'
    };

    const labelStyle = {
        fontWeight: 'bold',
        fontSize: `${s.invoice_customer_info_size || 12}px`,
        color: s.invoice_color_customer_info || '#000'
    };

    const shopNameStyle = {
        fontWeight: 'bold',
        fontSize: `${s.invoice_store_name_size || '24'}px`,
        color: s.invoice_color_store_info || '#333333',
        lineHeight: '1.25',
        paddingTop: isPreview ? '2px' : '0px'
    };
    const shopInfoStyle = {
        fontSize: `${s.invoice_store_info_size || '11'}px`,
        color: s.invoice_color_store_info || '#333333',
        lineHeight: '1.4'
    };
    const invoiceTitleStyle = {
        fontWeight: '900',
        fontSize: `${s.invoice_title_size || '22'}px`,
        textAlign: isDelivery ? 'center' : 'right',
        color: useTitleBadge ? (s.invoice_title_badge_text_color || '#fff') : (s.invoice_color_title || '#000'),
        textTransform: 'uppercase',
        letterSpacing: '1px',
        lineHeight: '1.25',
        paddingTop: isPreview ? '2px' : '0px',
        ...(useTitleBadge ? {
            background: s.invoice_title_badge_bg || '#2d5016',
            border: `1px solid ${s.invoice_title_badge_border || '#86efac'}`,
            borderRadius: '9999px',
            padding: '6px 20px',
            display: 'inline-block',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        } : {})
    };
    const infoGridStyle = {
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '4px',
        marginBottom: '1.3mm',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
    };
    const generalInfoTextStyle = {
        fontSize: `${s.invoice_customer_info_size || '12'}px`,
        color: s.invoice_color_customer_info || '#000',
        lineHeight: '1.4'
    };
    const tableStyle = {
        width: '100%',
        borderCollapse: isHeaderBadge ? 'separate' : 'collapse',
        borderSpacing: 0,
        fontSize: `${s.invoice_table_font_size_preset === 'small' ? (parseInt(s.invoice_table_content_size) - 2) : s.invoice_table_content_size}px`,
        border: (s.invoice_table_border === 'true' && !isHeaderBadge) ? borderValue : 'none',
        marginTop: s.invoice_table_margin_top ? `${s.invoice_table_margin_top}px` : '1.3mm',
        tableLayout: 'auto'
    };
    const thStyle = {
        borderTop: isHeaderBadge ? badgeHeaderBorder : (s.invoice_table_header_border === 'true' ? headerBorderValue : 'none'),
        borderBottom: isHeaderBadge ? badgeHeaderBorder : headerBorderValue,
        borderRight: (!isHeaderBadge && s.invoice_table_border_cols === 'true') ? borderValue : 'none',
        padding: isHeaderBadge ? `${Math.max(2, Math.floor((parseInt(s.invoice_row_padding || 4) + 4) * 0.8))}px ${s.invoice_row_padding || 4}px` : `${Math.max(1, Math.floor(parseInt(s.invoice_row_padding || 4) * 0.8))}px ${s.invoice_row_padding || 4}px`,
        backgroundColor: isHeaderBadge ? (s.invoice_table_header_badge_bg || '#2d5016') : (s.invoice_table_header_bg_enabled === 'true' ? (s.invoice_table_header_bg_color || '#f2f2f2') : 'transparent'),
        fontWeight: 'bold',
        fontSize: `${s.invoice_table_header_size}px`,
        textAlign: 'center',
        color: isHeaderBadge ? (s.invoice_table_header_badge_text_color || '#fff') : (s.invoice_color_table_header || '#000'),
        transition: 'all 0.2s ease',
        whiteSpace: (s.paper_size === 'A6' || s.paper_size === 'K80' || s.paper_size === 'K58') ? 'normal' : 'nowrap',
        wordBreak: 'break-word',
        lineHeight: s.invoice_table_line_height || '1.15'
    };

    const getThStyle = (isFirst, isLast) => {
        let style = { ...thStyle };
        const isSmallPaper = s.paper_size === 'A6' || s.paper_size === 'K80' || s.paper_size === 'K58';
        const sidePadding = isSmallPaper ? '12px' : '20px';

        if (isHeaderBadge) {
            if (isFirst) {
                style.borderLeft = badgeHeaderBorder;
                style.borderTopLeftRadius = '50px';
                style.borderBottomLeftRadius = '50px';
                style.paddingLeft = sidePadding;
            }
            if (isLast) {
                style.borderRight = badgeHeaderBorder;
                style.borderTopRightRadius = '50px';
                style.borderBottomRightRadius = '50px';
                style.paddingRight = sidePadding;
            }
        } else {
            if (isFirst) style.borderLeft = s.invoice_table_border === 'true' ? borderValue : 'none';
        }
        return style;
    };

    const tdStyle = {
        borderBottom: s.invoice_table_border_rows === 'true' ? borderValue : 'none',
        borderRight: s.invoice_table_border_cols === 'true' ? borderValue : 'none',
        padding: `${(s.paper_size === 'A6' || s.paper_size === 'K80' || s.paper_size === 'K58') ? Math.max(1, parseInt(s.invoice_row_padding || 4) - 2) : (s.invoice_row_padding || '4')}px`,
        verticalAlign: 'middle',
        color: s.invoice_color_table_body || '#000',
        borderLeft: (isHeaderBadge && s.invoice_table_border === 'true') ? borderValue : 'none',
        wordBreak: 'break-word',
        lineHeight: s.invoice_table_line_height || '1.15'
    };

    const getTdStyle = (isFirst, isLast) => {
        let style = { ...tdStyle };
        if (isHeaderBadge && s.invoice_table_border === 'true') {
            if (isFirst) style.borderLeft = borderValue;
            if (isLast) style.borderRight = borderValue;
        }
        return style;
    };

    const summaryRowStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '15px',
        marginBottom: '4px',
        pageBreakInside: 'avoid'
    };

    const summaryLabelStyle = {
        fontSize: `${s.invoice_total_section_size || '14'}px`,
        fontWeight: '500',
        color: '#000',
        whiteSpace: 'nowrap'
    };

    const summaryValueStyle = {
        fontSize: `${s.invoice_total_section_size || '14'}px`,
        fontWeight: 'bold',
        minWidth: '100px',
        textAlign: 'right',
        color: '#000'
    };

    const mainTotalLabelStyle = {
        fontSize: `${s.invoice_total_line_size || s.invoice_total_section_size}px`,
        fontWeight: s.invoice_total_line_bold === 'true' ? '900' : '500',
        fontStyle: s.invoice_total_line_italic === 'true' ? 'italic' : 'normal',
        color: s.invoice_color_total_label || '#000',
        whiteSpace: 'nowrap'
    };

    const mainTotalValueStyle = {
        fontSize: `${s.invoice_total_line_size || s.invoice_total_section_size}px`,
        fontWeight: s.invoice_total_line_bold === 'true' ? '900' : 'bold',
        fontStyle: s.invoice_total_line_italic === 'true' ? 'italic' : 'normal',
        minWidth: '100px',
        textAlign: 'right',
        color: s.invoice_color_total_value || '#000'
    };

    const getInvoiceTitle = () => {
        if (s.invoice_custom_title && s.invoice_custom_title.trim() !== '') return s.invoice_custom_title;
        if (data.display_id === '#NODAU') return 'GHI NHẬN NỢ ĐẦU KỲ';
        if (data.type === 'DebtIncrease') return 'PHIẾU GHI NỢ SỔ TAY';
        if (isDelivery) return s.invoice_delivery_title || 'PHIẾU XUẤT KHO';
        if (type === 'Sale') return s.invoice_sale_title || 'HÓA ĐƠN BÁN HÀNG';
        if (type === 'Purchase') return s.invoice_purchase_title || 'PHIẾU NHẬP HÀNG';
        if (type === 'History') return 'CHI TIẾT GIAO DỊCH';
        if (type === 'Receipt') return 'PHIẾU THU TIỀN';
        if (type === 'Payment') return 'PHIẾU CHI TIỀN';
        if (type === 'Report') return 'BÁO CÁO CHI TIẾT';
        if (type === 'PartnerLedger') return 'SỔ CHI TIẾT CÔNG NỢ';
        return 'HÓA ĐƠN';
    };

    const partnerLabel = (type === 'Sale' || type === 'Receipt' || type === 'History' || isDelivery) ? 'Khách hàng' : 'Nhà cung cấp';

    // Stats
    const totalQty = (data.details || []).reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const totalItems = (data.details || []).length;

    // Secondary qty totals grouped by unit
    const secondaryTotals = {};
    (data.details || []).forEach(item => {
        if (item.multiplier && item.multiplier > 1 && item.secondary_unit) {
            const whole = Math.floor(item.quantity / item.multiplier);
            if (whole > 0) {
                secondaryTotals[item.secondary_unit] = (secondaryTotals[item.secondary_unit] || 0) + whole;
            }
        }
    });
    const formattedSecondaryQtyTotals = Object.entries(secondaryTotals)
        .map(([unit, val]) => `${val} ${normalizeUOM(unit)}`)
        .join(' / ');

    const isFree = s.invoice_free_layout === 'true';

    const getBlockWidth = (baseWidth = '100%') => {
        const size = s.paper_size || 'A4';
        if (size === 'A4') return '750px';
        if (size === 'C5') return '580px';
        if (size === 'A5') return '520px';
        if (size === 'A6') return '360px';
        if (size === 'K80') return '280px';
        if (size === 'K58') return '200px';
        if (size === 'CUSTOM') {
            const customW = parseFloat(s.invoice_custom_width) || 210;
            return `${Math.round(customW * 3.78)}px`;
        }
        return baseWidth;
    };

    const logoEl = s.invoice_show_logo === 'true' && s.invoice_logo_url && wrap(
        "Logo", 
        "invoice_logo_url", 
        { toggleKey: "invoice_show_logo", tab: "content" },
        <img src={getResolvedUrl(s.invoice_logo_url)} alt="Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />
    );

    const shopNameEl = s.invoice_show_shop_name === 'true' && wrap(
        "Tên Cửa Hàng", 
        "shop_name", 
        { sizeKey: "invoice_store_name_size", colorKey: "invoice_color_store_info", toggleKey: "invoice_show_shop_name", tab: "text" },
        <div style={{ ...shopNameStyle, marginBottom: '2px' }}>
            {s.shop_name?.toUpperCase()}
        </div>
    );

    const shopInfoEl = (s.invoice_show_address === 'true' || s.invoice_show_phone === 'true' || s.invoice_show_bank_info === 'true') && (
        <div style={shopInfoStyle}>
            {s.invoice_show_address === 'true' && s.shop_address && s.shop_address.trim() !== "" && wrap(
                "Địa chỉ", 
                "shop_address", 
                { colorKey: "invoice_color_store_info", toggleKey: "invoice_show_address", tab: "text" },
                <div>{s.shop_address}</div>
            )}
            {s.invoice_show_phone === 'true' && s.shop_phone && wrap(
                "Số điện thoại", 
                "shop_phone", 
                { colorKey: "invoice_color_store_info", toggleKey: "invoice_show_phone", tab: "text" },
                <div>ĐT: {s.shop_phone}</div>
            )}
            {s.invoice_show_bank_info === 'true' && (s.shop_bank || s.shop_bank_account) && wrap(
                "Tài khoản ngân hàng", 
                "shop_bank_account", 
                { colorKey: "invoice_color_store_info", toggleKey: "invoice_show_bank_info", tab: "text" },
                <div style={{ marginTop: '2px', borderTop: '1px dashed #ccc', paddingTop: '2px' }}>
                    {s.shop_bank && <span>{s.shop_bank}: </span>}
                    {s.shop_bank_account && <strong style={{ letterSpacing: '0.5px' }}>{s.shop_bank_account}</strong>}
                    {s.shop_bank_user && <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{s.shop_bank_user}</div>}
                </div>
            )}
        </div>
    );

    const titleEl = s.invoice_show_title !== 'false' && wrap(
        "Tiêu đề hóa đơn",
        "invoice_custom_title",
        { sizeKey: "invoice_title_size", colorKey: "invoice_color_title", toggleKey: "invoice_show_title", tab: "text" },
        <div
            style={{
                ...invoiceTitleStyle,
                marginTop: useTitleBadge ? '0' : '0'
            }}
            onClick={() => {
                if (isPreview && onUpdateSetting) {
                    onUpdateSetting('invoice_title_badge', s.invoice_title_badge === 'true' ? 'false' : 'true');
                }
            }}
            title={isPreview ? "Click để bật/tắt viền tiêu đề" : ""}
            className={isPreview ? "hover:scale-[1.02] transition-transform active:scale-95" : ""}
        >
            {getInvoiceTitle()}
        </div>
    );

    const customerNameEl = s.invoice_show_customer_info === 'true' && wrap(
        "Tên đối tác",
        "invoice_show_customer_info",
        { sizeKey: "invoice_customer_info_size", toggleKey: "invoice_show_customer_info", tab: "content" },
        <div style={generalInfoTextStyle}>
            <span style={labelStyle}>{partnerLabel}:</span>{' '}
            {(data.partner_id || data.partner?.id || ((type === 'Report' || type === 'PartnerLedger') ? data.id : null)) && s.invoice_hide_customer_id !== 'true' ? (
                <span style={{ fontWeight: 'bold' }}>#{data.partner_id || data.partner?.id || data.id} </span>
            ) : ''}
            {data.partner_name || data.partner?.name || (type === 'PartnerLedger' ? data.name : null) || 'Khách lẻ'}
        </div>
    );

    const partnerPhoneVal = data.partner_phone || data.partner?.phone || (type === 'PartnerLedger' ? data.phone : null);
    const customerPhoneEl = s.invoice_show_customer_info === 'true' && partnerPhoneVal && wrap(
        "SĐT đối tác",
        "invoice_show_customer_info",
        { sizeKey: "invoice_customer_info_size", toggleKey: "invoice_show_customer_info", tab: "content" },
        <div style={generalInfoTextStyle}>
            <span style={labelStyle}>Điện thoại:</span> {partnerPhoneVal}
        </div>
    );

    const partnerAddressVal = data.partner_address || data.partner?.address || (type === 'PartnerLedger' ? data.address : null);
    const customerAddressEl = s.invoice_show_customer_info === 'true' && partnerAddressVal && wrap(
        "Địa chỉ đối tác",
        "invoice_show_customer_info",
        { sizeKey: "invoice_customer_info_size", toggleKey: "invoice_show_customer_info", tab: "content" },
        <div style={generalInfoTextStyle}>
            <span style={labelStyle}>Địa chỉ:</span> {partnerAddressVal}
        </div>
    );

    const formatInvoiceDate = (dateInput) => {
        if (!dateInput) return '-';
        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return '-';

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            if (s.invoice_show_time === 'false') {
                return `${day}/${month}/${year}`;
            }

            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        } catch (e) {
            return '-';
        }
    };

    const voucherNoteEl = isVoucher && <div style={generalInfoTextStyle}><span style={labelStyle}>Nội dung:</span> {data.note}</div>;

    const invoiceMetaEl = (
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            {s.invoice_show_id === 'true' && wrap(
                "Mã hóa đơn",
                "invoice_show_id",
                { sizeKey: "invoice_customer_info_size", toggleKey: "invoice_show_id", tab: "content" },
                <div style={{ ...generalInfoTextStyle, whiteSpace: 'nowrap' }}><span style={labelStyle}>Mã Số:</span> #{data.display_id || data.id || 'Draft'}</div>
            )}
            {s.invoice_show_date === 'true' && wrap(
                "Ngày hóa đơn",
                "invoice_show_date",
                { sizeKey: "invoice_customer_info_size", toggleKey: "invoice_show_date", tab: "content" },
                <div style={{ ...generalInfoTextStyle, whiteSpace: 'nowrap' }}><span style={labelStyle}>Ngày:</span> {formatInvoiceDate(data.date || Date.now())}</div>
            )}
        </div>
    );

    const renderTable = (itemsList, startIndex = 0, hideFooter = false, side = 'single') => {
        const getShowColSetting = (colKey) => {
            let val = s[colKey];
            if (side === 'left') {
                const leftKey = colKey.replace('invoice_show_', 'invoice_left_show_');
                if (s[leftKey] !== undefined && s[leftKey] !== '' && s[leftKey] !== null) val = s[leftKey];
            } else if (side === 'right') {
                const rightKey = colKey.replace('invoice_show_', 'invoice_right_show_');
                if (s[rightKey] !== undefined && s[rightKey] !== '' && s[rightKey] !== null) val = s[rightKey];
            }
            return (val === 'true' || val === true) ? 'true' : 'false';
        };

        const getColWidthSetting = (colKey) => {
            if (side === 'left') {
                const leftKey = colKey.replace('invoice_col_', 'invoice_left_col_');
                if (s[leftKey] !== undefined && s[leftKey] !== '' && s[leftKey] !== null) return s[leftKey];
            } else if (side === 'right') {
                const rightKey = colKey.replace('invoice_col_', 'invoice_right_col_');
                if (s[rightKey] !== undefined && s[rightKey] !== '' && s[rightKey] !== null) return s[rightKey];
            }
            return s[colKey];
        };

        return (
            <table className="invoice-items-table" style={{ ...tableStyle, position: 'relative', zIndex: 1, backgroundColor: 'transparent' }}>
                <thead
                    onClick={() => {
                        if (isPreview && onUpdateSetting) {
                            const newVal = s.invoice_table_header_is_badge === 'true' ? 'false' : 'true';
                            onUpdateSetting('invoice_table_header_is_badge', newVal);
                            if (newVal === 'true') {
                                onUpdateSetting('invoice_table_header_border', 'true');
                            }
                        }
                    }}
                    style={{ cursor: isPreview ? 'pointer' : 'default' }}
                    title={isPreview ? "Click để bật/tắt viền (Badge) header bảng" : ""}
                    className={isPreview ? "hover:brightness-110 transition-all active:scale-[0.99]" : ""}
                >
                    <tr>
                        {(() => {
                            const cols = [];
                            if (getShowColSetting('invoice_show_col_stt') === 'true') cols.push({ id: 'stt', label: 'STT', width: getColWidthSetting('invoice_col_stt') });

                            if (type === 'Report') {
                                if (getShowColSetting('invoice_show_col_code') === 'true') cols.push({ id: 'code', label: 'Mã Đơn', width: getColWidthSetting('invoice_col_code'), align: 'left' });
                                if (getShowColSetting('invoice_show_col_date') === 'true') cols.push({ id: 'date', label: 'Ngày', width: getColWidthSetting('invoice_col_date') });
                                if (getShowColSetting('invoice_show_col_method') === 'true') cols.push({ id: 'method', label: 'PTTT', width: getColWidthSetting('invoice_col_method') });
                                if (getShowColSetting('invoice_show_col_total') === 'true') cols.push({ id: 'total', label: 'Thành tiền', width: getColWidthSetting('invoice_col_total'), align: 'right' });
                            } else if (type === 'PartnerLedger') {
                                const isSmall = s.paper_size === 'A6' || s.paper_size === 'K80' || s.paper_size === 'K58';
                                cols.push({ id: 'date', label: 'Ngày', width: isSmall ? 55 : (getColWidthSetting('invoice_col_date') || 70) });
                                cols.push({ id: 'content', label: 'Nội dung / Sản phẩm', width: getColWidthSetting('invoice_col_content') || 'auto', align: 'left' });
                                cols.push({ id: 'qty', label: 'SL', width: isSmall ? 30 : (getColWidthSetting('invoice_col_qty') || 40), align: 'center' });
                                cols.push({ id: 'price', label: 'Đơn giá', width: isSmall ? 65 : (getColWidthSetting('invoice_col_price') || 80), align: 'right' });
                                cols.push({ id: 'total', label: 'T.Tiền', width: isSmall ? 70 : (getColWidthSetting('invoice_col_total') || 90), align: 'right' });
                                cols.push({ id: 'increase', label: 'Ghi nợ (+)', width: isSmall ? 70 : (getColWidthSetting('invoice_col_ledger_increase') || 90), align: 'right' });
                                cols.push({ id: 'decrease', label: 'T.Toán (-)', width: isSmall ? 70 : (getColWidthSetting('invoice_col_ledger_decrease') || 90), align: 'right' });
                                cols.push({ id: 'balance', label: 'Dư nợ', width: isSmall ? 80 : (getColWidthSetting('invoice_col_ledger_balance') || 100), align: 'right' });
                            } else {
                                if (getShowColSetting('invoice_show_col_name') === 'true') cols.push({ id: 'name', label: 'Tên hàng hóa', width: getColWidthSetting('invoice_col_name'), align: 'left' });
                                if (getShowColSetting('invoice_show_col_unit') === 'true') cols.push({ id: 'unit', label: 'ĐVT', width: getColWidthSetting('invoice_col_unit') });
                                if (getShowColSetting('invoice_show_secondary_qty') === 'true') cols.push({ id: 'sqty', label: 'Quy đổi', width: getColWidthSetting('invoice_col_secondary_qty_width'), align: 'center' });
                                if (getShowColSetting('invoice_show_col_qty') === 'true') cols.push({ id: 'qty', label: 'SL', width: getColWidthSetting('invoice_col_qty'), align: 'center' });
                                if (!isDelivery && getShowColSetting('invoice_show_col_price') === 'true') cols.push({ id: 'price', label: 'Đơn giá', width: getColWidthSetting('invoice_col_price'), align: 'right' });
                                if (!isDelivery && getShowColSetting('invoice_show_col_total') === 'true') cols.push({ id: 'total', label: 'Thành tiền', width: getColWidthSetting('invoice_col_total'), align: 'right' });
                            }

                            if (typeof window !== 'undefined') {
                                if (!window.debug_cols) window.debug_cols = {};
                                window.debug_cols[side] = cols.map(c => c.id);
                            }

                            const isHeaderBadge = s.invoice_table_header_is_badge === 'true';

                            return cols.map((c, i) => (
                                <th
                                    key={c.id}
                                    style={{
                                        ...getThStyle(i === 0, i === cols.length - 1),
                                        width: c.width === 'auto' ? 'auto' : (typeof c.width === 'number' || !isNaN(c.width) ? `${c.width}px` : c.width),
                                        textAlign: isHeaderBadge ? 'center' : (c.align || 'center'),
                                        position: 'relative'
                                    }}
                                >
                                    {c.label?.toUpperCase()}
                                    {isPreview && (
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, c.id, side)}
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '8px',
                                                cursor: 'col-resize',
                                                zIndex: 20,
                                                backgroundColor: 'transparent'
                                            }}
                                            className="hover:bg-blue-500/20 active:bg-blue-500/40 transition-colors"
                                            title="Kéo để chỉnh độ rộng cột"
                                        />
                                    )}
                                </th>
                            ));
                        })()}
                    </tr>
                </thead>
                <tbody>
                    {itemsList.map((item, idx) => {
                        const globalIdx = startIndex + idx;
                        const rowBg = (s.invoice_table_zebra_stripe === 'true' && globalIdx % 2 === 1) ? (s.invoice_table_zebra_color || '#f9fafb') : 'transparent';

                        if (type === 'PartnerLedger') {
                            return (
                                <React.Fragment key={idx}>
                                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                        {getShowColSetting('invoice_show_col_stt') === 'true' && <td style={{ ...tdStyle, textAlign: 'center' }}>{globalIdx + 1}</td>}
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{formatDate(item.date).split(' ')[1]}</td>
                                        <td style={tdStyle}>
                                            <span style={{ color: '#2563eb' }}>[{item.type}]</span> {item.ref_id} - {item.desc}
                                        </td>
                                        <td style={tdStyle}></td>
                                        <td style={tdStyle}></td>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{item.increase > 0 ? formatNumber(item.increase) : '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{item.decrease > 0 ? formatNumber(item.decrease) : '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 900 }}>{formatNumber(item.running_balance)}</td>
                                    </tr>
                                    {item.items && item.items.map((it, iti) => (
                                        <tr key={`${idx}-${iti}`} style={{ color: '#64748b', fontSize: '0.92em' }}>
                                            {getShowColSetting('invoice_show_col_stt') === 'true' && <td style={tdStyle}></td>}
                                            <td style={tdStyle}></td>
                                            <td style={{ ...tdStyle, paddingLeft: '20px' }}>• {it.product_name}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>{it.quantity}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{formatNumber(it.unit_price)}</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{formatNumber(it.total_price)}</td>
                                            <td style={tdStyle}></td>
                                            <td style={tdStyle}></td>
                                            <td style={tdStyle}></td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        }

                        return (
                            <tr key={idx} style={{ backgroundColor: rowBg }}>
                                {(() => {
                                    const colsCount = [];
                                    if (getShowColSetting('invoice_show_col_stt') === 'true') colsCount.push('stt');
                                    if (type === 'Report') {
                                        if (getShowColSetting('invoice_show_col_code') === 'true') colsCount.push('code');
                                        if (getShowColSetting('invoice_show_col_date') === 'true') colsCount.push('date');
                                        if (getShowColSetting('invoice_show_col_method') === 'true') colsCount.push('method');
                                    } else {
                                        if (getShowColSetting('invoice_show_col_name') === 'true') colsCount.push('name');
                                        if (getShowColSetting('invoice_show_col_unit') === 'true') colsCount.push('unit');
                                        if (getShowColSetting('invoice_show_secondary_qty') === 'true') colsCount.push('sqty');
                                        if (getShowColSetting('invoice_show_col_qty') === 'true') colsCount.push('qty');
                                        if (!isDelivery && getShowColSetting('invoice_show_col_price') === 'true') colsCount.push('price');
                                    }
                                    if (!isDelivery && getShowColSetting('invoice_show_col_total') === 'true') colsCount.push('total');

                                    const isFirst = (id) => colsCount[0] === id;
                                    const isLast = (id) => colsCount[colsCount.length - 1] === id;

                                    return (
                                        <>
                                            {getShowColSetting('invoice_show_col_stt') === 'true' && <td style={{ ...getTdStyle(isFirst('stt'), isLast('stt')), textAlign: 'center' }}>{globalIdx + 1}</td>}

                                            {type === 'Report' ? (
                                                <>
                                                    {getShowColSetting('invoice_show_col_code') === 'true' && <td style={{ ...getTdStyle(isFirst('code'), isLast('code')), textAlign: 'left', fontWeight: 'bold' }}>{item.display_id || item.id}</td>}
                                                    {getShowColSetting('invoice_show_col_date') === 'true' && <td style={{ ...getTdStyle(isFirst('date'), isLast('date')), textAlign: 'center' }}>{formatDate(item.date).split(' ')[1]}</td>}
                                                    {getShowColSetting('invoice_show_col_method') === 'true' && (
                                                        <td style={{ ...getTdStyle(isFirst('method'), isLast('method')), textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                backgroundColor: item.payment_method === 'Cash' ? '#ecfdf5' : '#fff1f2',
                                                                color: item.payment_method === 'Cash' ? '#059669' : '#e11d48',
                                                                fontSize: '0.9em',
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {item.display_id === '#NODAU' ? 'Nợ đầu kỳ' : (item.payment_method === 'Cash' ? 'Tiền mặt' : 'Công nợ')}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {getShowColSetting('invoice_show_col_total') === 'true' && <td style={{ ...getTdStyle(isFirst('total'), isLast('total')), textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(item.total_amount)}</td>}
                                                </>
                                            ) : (
                                                <>
                                                    {getShowColSetting('invoice_show_col_name') === 'true' && (
                                                        <td style={{ ...getTdStyle(isFirst('name'), isLast('name')), textAlign: 'left' }}>
                                                            <div style={{
                                                                fontWeight: '500',
                                                                ...(s.invoice_table_name_nowrap === 'true' ? {
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: getColWidthSetting('invoice_col_name') ? `${getColWidthSetting('invoice_col_name')}px` : '200px',
                                                                    paddingTop: '3px',
                                                                    paddingBottom: '3px',
                                                                    marginTop: '-3px',
                                                                    marginBottom: '-3px'
                                                                } : {
                                                                    wordBreak: 'break-word',
                                                                    whiteSpace: 'normal',
                                                                    paddingTop: '2px',
                                                                    paddingBottom: '2px'
                                                                })
                                                            }}>
                                                                {item.product_name}
                                                                {item.price === 0 && <span style={{ marginLeft: '5px', fontSize: '0.8em', fontStyle: 'italic', color: '#666' }}>(Hàng tặng)</span>}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {getShowColSetting('invoice_show_col_unit') === 'true' && <td style={{ ...getTdStyle(isFirst('unit'), isLast('unit')), textAlign: 'center' }}>{normalizeUOM(item.product_unit || item.unit || '-')}</td>}
                                                    {getShowColSetting('invoice_show_secondary_qty') === 'true' && (
                                                        <td style={{ ...getTdStyle(isFirst('sqty'), isLast('sqty')), textAlign: 'center' }}>
                                                            {(() => {
                                                                const mult = Number(item.multiplier) || 1;
                                                                const qty = Number(item.quantity) || 0;
                                                                if (mult > 1) {
                                                                    const absQty = Math.abs(qty);
                                                                    const whole = Math.floor(absQty / mult);
                                                                    const rem = absQty % mult;
                                                                    const unitChar = item.secondary_unit ? item.secondary_unit.trim().charAt(0).toUpperCase() : '';
                                                                    if (whole > 0) {
                                                                        return (
                                                                            <span style={{ fontWeight: '500' }}>
                                                                                {qty < 0 ? '-' : ''}{whole} {unitChar}{rem > 0 ? ` + ${rem}` : ''}
                                                                            </span>
                                                                        );
                                                                    }
                                                                }
                                                                return '-';
                                                             })()}
                                                        </td>
                                                    )}
                                                    {getShowColSetting('invoice_show_col_qty') === 'true' && <td style={{ ...getTdStyle(isFirst('qty'), isLast('qty')), textAlign: 'center' }}>{item.quantity}</td>}
                                                    {!isDelivery && getShowColSetting('invoice_show_col_price') === 'true' && <td style={{ ...getTdStyle(isFirst('price'), isLast('price')), textAlign: 'right' }}>{formatNumber(item.price)}</td>}
                                                    {!isDelivery && getShowColSetting('invoice_show_col_total') === 'true' && <td style={{ ...getTdStyle(isFirst('total'), isLast('total')), textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(item.price * item.quantity)}</td>}
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </tr>
                        );
                    })}
                    {!hideFooter && (type !== 'Report') && (s.invoice_show_total_items !== 'false' || s.invoice_show_total_qty !== 'false' || s.invoice_show_total_secondary_qty === 'true') && (
                        <tr className="invoice-summary-row">
                            <td colSpan={100} style={{
                                ...tdStyle,
                                padding: '6px 10px',
                                backgroundColor: '#fafafa',
                                fontSize: `${s.invoice_total_summary_font_size}px`,
                                borderTop: s.invoice_table_border_rows === 'true' ? borderValue : (s.invoice_table_border === 'true' ? borderValue : 'none'),
                                borderBottom: s.invoice_table_border === 'true' ? borderValue : 'none',
                                borderLeft: s.invoice_table_border === 'true' ? borderValue : 'none',
                                borderRight: s.invoice_table_border === 'true' ? borderValue : 'none'
                            }}>
                                {wrap(
                                    "Tổng hợp Dòng",
                                    "invoice_total_summary_font_size",
                                    { sizeKey: "invoice_total_summary_font_size", tab: "table" },
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '15px'
                                    }}>
                                        {s.invoice_show_total_items !== 'false' && (
                                            <span>Tổng: <strong>{totalItems}</strong> SP</span>
                                        )}

                                        {s.invoice_show_total_qty !== 'false' && (
                                            <>
                                                <span style={{ color: '#ccc' }}>|</span>
                                                <span>SL: <strong>{totalQty}</strong></span>
                                            </>
                                        )}

                                        {s.invoice_show_total_secondary_qty === 'true' && formattedSecondaryQtyTotals && (
                                            <>
                                                <span style={{ color: '#ccc' }}>|</span>
                                                <span>Quy đổi: <strong>{formattedSecondaryQtyTotals}</strong></span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };

    const isTwoColumns = false;
    const halfLength = Math.ceil((data.details || []).length / 2);
    const leftDetails = isTwoColumns ? (data.details || []).slice(0, halfLength) : (data.details || []);
    const rightDetails = isTwoColumns ? (data.details || []).slice(halfLength) : [];

    const leftTableWidth = parseInt(s.pos_width_table_left) || Math.floor((parseInt(s.pos_width_table) || 600) / 2 - 5);
    const rightTableWidth = parseInt(s.pos_width_table_right) || Math.floor((parseInt(s.pos_width_table) || 600) / 2 - 5);

    const leftTableX = parseInt(s.pos_table_left_x) || (parseInt(s.pos_table_x) || 0);
    const leftTableY = parseInt(s.pos_table_left_y) || (parseInt(s.pos_table_y) || 230);

    const rightTableX = parseInt(s.pos_table_right_x) || ((parseInt(s.pos_table_x) || 0) + leftTableWidth + 10);
    const rightTableY = parseInt(s.pos_table_right_y) || (parseInt(s.pos_table_y) || 230);

    const totalSummaryEl = isTwoColumns && (type !== 'Report') && (s.invoice_show_total_items === 'true' || s.invoice_show_total_qty === 'true' || s.invoice_show_total_secondary_qty === 'true') && (
        <div style={{
            ...tdStyle,
            padding: '8px 10px',
            backgroundColor: '#fafafa',
            fontSize: `${s.invoice_total_summary_font_size}px`,
            border: s.invoice_table_border === 'true' ? borderValue : 'none',
            borderTop: s.invoice_table_border === 'true' ? 'none' : 'none',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '2px'
        }}>
            {wrap(
                "Tổng hợp Dòng",
                "invoice_total_summary_font_size",
                { sizeKey: "invoice_total_summary_font_size", tab: "table" },
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    {s.invoice_show_total_items === 'true' && (
                        <span>Tổng: <strong>{totalItems}</strong> SP</span>
                    )}

                    {s.invoice_show_total_qty === 'true' && (
                        <>
                            <span style={{ color: '#ccc' }}>|</span>
                            <span>SL: <strong>{totalQty}</strong></span>
                        </>
                    )}

                    {s.invoice_show_total_secondary_qty === 'true' && formattedSecondaryQtyTotals && (
                        <>
                            <span style={{ color: '#ccc' }}>|</span>
                            <span>Quy đổi: <strong>{formattedSecondaryQtyTotals}</strong></span>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    const leftTableEl = s.invoice_show_table === 'true' && !isVoucher && wrap(
        "Bảng hàng hóa (Trái)",
        "invoice_color_table_body",
        {
            sizeKey: "invoice_table_content_size",
            colorKey: "invoice_color_table_body",
            tab: "table"
        },
        renderTable(leftDetails, 0, true, 'left')
    );

    const rightTableEl = s.invoice_show_table === 'true' && !isVoucher && wrap(
        "Bảng hàng hóa (Phải)",
        "invoice_color_table_body",
        {
            sizeKey: "invoice_table_content_size",
            colorKey: "invoice_color_table_body",
            tab: "table"
        },
        rightDetails.length > 0 ? (
            renderTable(rightDetails, halfLength, true, 'right')
        ) : (
            <div style={{ border: s.invoice_table_border === 'true' ? borderValue : 'none', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '11px', fontStyle: 'italic', padding: '10px' }}>
                (Trống)
            </div>
        )
    );

    const tableEl = s.invoice_show_table === 'true' && !isVoucher && wrap(
        "Bảng hàng hóa",
        "invoice_color_table_body",
        {
            sizeKey: "invoice_table_content_size",
            colorKey: "invoice_color_table_body",
            tab: "table"
        },
        <div style={{ position: 'relative', width: '100%', overflow: 'visible', pageBreakInside: 'auto', breakInside: 'auto' }}>
            {isTwoColumns ? (
                <>
                    <div style={{ display: 'flex', gap: `${s.invoice_column_spacing || 10}px`, width: '100%' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {renderTable(leftDetails, 0, true, 'left')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {rightDetails.length > 0 ? (
                                renderTable(rightDetails, halfLength, true, 'right')
                            ) : (
                                <div style={{ border: s.invoice_table_border === 'true' ? borderValue : 'none', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '11px', fontStyle: 'italic', padding: '10px' }}>
                                    (Trống)
                                </div>
                            )}
                        </div>
                    </div>
                    {totalSummaryEl}
                </>
            ) : (
                renderTable(leftDetails, 0, false, 'single')
            )}
        </div>
    );

    const noteText = data.note || s.invoice_custom_notes;
    const notesEl = s.invoice_show_notes === 'true' && noteText && !isVoucher && wrap(
        "Ghi chú",
        "invoice_custom_notes",
        { colorKey: "invoice_color_notes", toggleKey: "invoice_show_notes", tab: "text" },
        <div style={{ fontSize: '11px', fontStyle: 'italic', color: s.invoice_color_notes || '#555', borderLeft: '3px solid #ddd', paddingLeft: '8px' }}>
            <strong>Ghi chú:</strong> {noteText}
        </div>
    );

    const summaryEl = !isDelivery && s.invoice_show_total_amount !== 'false' && (
        <div style={{ width: '100%' }}>
            {!isVoucher ? (
                <>
                    {type !== 'PartnerLedger' && wrap(
                        "Tổng cộng",
                        "invoice_color_total_value",
                        { sizeKey: "invoice_total_line_size", colorKey: "invoice_color_total_value", tab: "table" },
                        <div style={{ ...summaryRowStyle, marginTop: `${s.invoice_total_line_margin_top || 0}px`, marginBottom: `${s.invoice_total_line_margin_bottom || 10}px` }}>
                            <div style={mainTotalLabelStyle}>Tổng cộng:</div>
                            <div style={mainTotalValueStyle}>{formatNumber(safeTotalAmount)}</div>
                        </div>
                    )}

                    {(type === 'Sale' || type === 'Purchase' || type === 'Report' || type === 'PartnerLedger') && (
                        <>
                            {type === 'PartnerLedger' ? (
                                <div style={{ marginTop: '10px', paddingTop: '5px' }}>
                                    <div style={summaryRowStyle}>
                                        <div style={summaryLabelStyle}>Tổng phát sinh (+):</div>
                                        <div style={summaryValueStyle}>{formatNumber((data.details || []).reduce((sum, item) => sum + (item.increase || 0), 0))}</div>
                                    </div>
                                    <div style={summaryRowStyle}>
                                        <div style={summaryLabelStyle}>Tổng thanh toán (-):</div>
                                        <div style={summaryValueStyle}>{formatNumber((data.details || []).reduce((sum, item) => sum + (item.decrease || 0), 0))}</div>
                                    </div>
                                    <div style={{ ...summaryRowStyle, marginTop: '5px' }}>
                                        <div style={{ ...summaryLabelStyle, fontSize: `${s.invoice_total_balance_size || 16}px`, fontWeight: '900' }}>DƯ NỢ CUỐI KỲ:</div>
                                        <div style={{ ...summaryValueStyle, fontSize: `${s.invoice_total_balance_size || 16}px`, fontWeight: '900' }}>
                                            {formatNumber(data.current_balance || safeTotalAmount || 0)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {(showOldDebt !== undefined ? !!showOldDebt : s.invoice_show_old_debt === 'true') && (data.partner_id || data.partner?.id || data.partner || safeOldDebt !== 0) && safeOldDebt !== 0 && !(type === 'Sale' && data.payment_method === 'Cash' && s.invoice_hide_old_debt_on_cash === 'true') && (
                                        <div style={summaryRowStyle}>
                                            <div style={summaryLabelStyle}>Nợ cũ:</div>
                                            <div style={summaryValueStyle}>{formatNumber(safeOldDebt)}</div>
                                        </div>
                                    )}
                                    {(showCashGiven !== undefined ? !!showCashGiven : s.invoice_show_cash_given === 'true') && safeCashGiven > 0 && (
                                        <div style={summaryRowStyle}>
                                            <div style={summaryLabelStyle}>Khách đưa:</div>
                                            <div style={summaryValueStyle}>{formatNumber(safeCashGiven)}</div>
                                        </div>
                                    )}
                                    {(showChange !== undefined ? !!showChange : s.invoice_show_change === 'true') && safeCashGiven > safeTotalAmount && (
                                        <div style={summaryRowStyle}>
                                            <div style={summaryLabelStyle}>Tiền thối:</div>
                                            <div style={summaryValueStyle}>{formatNumber(safeCashGiven - safeTotalAmount)}</div>
                                        </div>
                                    )}
                                    {(showPayment !== undefined ? !!showPayment : s.invoice_show_paid === 'true') && (
                                        <div style={summaryRowStyle}>
                                            <div style={summaryLabelStyle}>Thanh toán:</div>
                                            <div style={summaryValueStyle}>{formatNumber(safeAmountPaid)}</div>
                                        </div>
                                    )}
                                    {(() => {
                                        const balance = type === 'Sale'
                                            ? (safeTotalAmount + safeOldDebt) - safeAmountPaid
                                            : safeOldDebt - (safeTotalAmount - safeAmountPaid);

                                        // Show "Remaining" if balance is non-zero or explicitly requested, even if old debt was zero
                                        const isDebtOrPartial = ((type === 'Sale' || type === 'Purchase') && data.payment_method === 'Debt') || (balance !== 0) || (safeOldDebt !== 0);
                                        const shouldShowRemaining = showRemaining !== undefined ? !!showRemaining : s.invoice_show_balance === 'true';
                                        if (shouldShowRemaining && (data.partner_id || data.partner?.id || data.partner || safeOldDebt !== 0) && (balance !== 0 || isDebtOrPartial) && !(type === 'Sale' && data.payment_method === 'Cash' && s.invoice_hide_old_debt_on_cash === 'true')) {
                                            return wrap(
                                                "Còn lại / Dư nợ",
                                                "invoice_total_balance_size",
                                                { sizeKey: "invoice_total_balance_size", toggleKey: "invoice_show_balance", tab: "table" },
                                                <div style={{ ...summaryRowStyle, marginTop: '5px', borderTop: '1px double #000', paddingTop: '5px' }}>
                                                    <div style={{ ...summaryLabelStyle, fontSize: `${s.invoice_total_balance_size}px`, fontWeight: '900' }}>Còn lại:</div>
                                                    <div style={{ ...summaryValueStyle, fontSize: `${s.invoice_total_balance_size}px`, fontWeight: '900' }}>
                                                        {formatNumber(balance)}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div style={{ borderTop: '1px solid #000', paddingTop: '8px' }}>
                    <div style={{ ...summaryRowStyle, marginBottom: '6px' }}>
                        <div style={mainTotalLabelStyle}>
                            {type === 'Receipt' ? 'Số tiền thu:' : 'Số tiền chi:'}
                        </div>
                        <div style={mainTotalValueStyle}>
                            {formatNumber(data.amount !== undefined && data.amount !== null ? data.amount : safeTotalAmount)}
                        </div>
                    </div>
                    {((showOldDebt !== undefined ? !!showOldDebt : s.invoice_show_old_debt === 'true') && (data.old_debt !== undefined && data.old_debt !== null && Number(data.old_debt) !== 0)) && (
                        <div style={summaryRowStyle}>
                            <div style={summaryLabelStyle}>Nợ cũ:</div>
                            <div style={summaryValueStyle}>{formatNumber(data.old_debt)}</div>
                        </div>
                    )}
                    {((showPayment !== undefined ? !!showPayment : s.invoice_show_paid === 'true') && (data.amount_paid || data.paid) && Number(data.amount_paid || data.paid) !== Number(data.amount || safeTotalAmount)) && (
                        <div style={summaryRowStyle}>
                            <div style={summaryLabelStyle}>Đã thanh toán:</div>
                            <div style={summaryValueStyle}>{formatNumber(data.amount_paid || data.paid)}</div>
                        </div>
                    )}
                    {(() => {
                        const newDebt = data.new_debt !== undefined && data.new_debt !== null 
                            ? Number(data.new_debt)
                            : (data.old_debt !== undefined && data.old_debt !== null 
                                ? (type === 'Receipt' ? Number(data.old_debt) - Number(data.amount || safeTotalAmount || 0) : Number(data.old_debt) + Number(data.amount || safeTotalAmount || 0))
                                : null);
                        
                        const shouldShowRemaining = showRemaining !== undefined ? !!showRemaining : s.invoice_show_balance === 'true';
                        if (shouldShowRemaining && newDebt !== null && (data.partner_id || data.partner_name || data.old_debt !== undefined)) {
                            return (
                                <div style={{ ...summaryRowStyle, marginTop: '5px', borderTop: '1px double #000', paddingTop: '5px' }}>
                                    <div style={{ ...summaryLabelStyle, fontSize: `${s.invoice_total_balance_size || 14}px`, fontWeight: '900' }}>
                                        Dư nợ cuối:
                                    </div>
                                    <div style={{ ...summaryValueStyle, fontSize: `${s.invoice_total_balance_size || 14}px`, fontWeight: '900' }}>
                                        {formatNumber(newDebt)}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}
        </div>
    );

    const signaturesEl = s.invoice_show_signatures === 'true' && wrap(
        "Chữ ký",
        "invoice_show_signatures",
        { toggleKey: "invoice_show_signatures", tab: "content" },
        <div style={{ marginTop: '30px' }}>
            {type === 'PartnerLedger' && (
                <div style={{ fontStyle: 'italic', fontSize: '11px', marginBottom: '15px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    * Hai bên cùng kiểm tra và xác nhận mọi thông tin trên là chính xác. Số dư chốt cuối kỳ là căn cứ thanh toán tiếp theo.
                </div>
            )}
            {isDelivery ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>NGƯỜI NHẬN HÀNG</div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>(Ký, họ tên)</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>NGƯỜI GIAO HÀNG</div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>(Ký, họ tên)</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>NGƯỜI LẬP PHIẾU</div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>(Ký, họ tên)</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            {(type === 'PartnerLedger' ? 'Đại diện Đối tác' : 'Khách hàng').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>(Ký, họ tên)</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {type === 'PartnerLedger' ? 'Đại diện Cửa hàng' : 'Người lập phiếu'}
                        </div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>(Ký, họ tên)</div>
                    </div>
                </div>
            )}
        </div>
    );

    const thankYouEl = s.invoice_show_thank_you === 'true' && wrap(
        "Lời cảm ơn",
        "invoice_thank_you_message",
        { colorKey: "invoice_color_footer", toggleKey: "invoice_show_thank_you", tab: "content" },
        <div style={{
            textAlign: 'center',
            marginTop: '25px',
            paddingTop: '15px',
            borderTop: '1px dashed #eee',
            fontSize: '13px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: s.invoice_color_footer || '#444'
        }}>
            {s.invoice_thank_you_message || 'Cảm ơn Quý Khách & Hẹn Gặp Lại!'}
        </div>
    );

    const renderPageNumber = (currentPage = 1, totalPages = 1) => {
        if (s.invoice_show_page_number !== 'true') return null;
        const format = s.invoice_page_number_format;
        const text = format === 'page_only'
            ? `Trang ${currentPage}`
            : `Trang ${currentPage}/${totalPages}`;

        return wrap(
            "Số trang",
            "invoice_page_number_size",
            { sizeKey: "invoice_page_number_size", colorKey: "invoice_page_number_color", toggleKey: "invoice_show_page_number", tab: "layout" },
            <div
                className="print-page-number"
                style={{
                    textAlign: s.invoice_page_number_position === 'bottom-left' ? 'left' : (s.invoice_page_number_position === 'bottom-center' ? 'center' : 'right'),
                    fontSize: `${s.invoice_page_number_size || 10}px`,
                    color: s.invoice_page_number_color || '#64748b',
                    fontStyle: 'italic',
                    paddingTop: '6px',
                    marginTop: '8px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                    display: 'block'
                }}
            >
                <span>
                    {text}
                </span>
            </div>
        );
    };

    const pageNumberEl = renderPageNumber(1, 1);

    return (
        <>
            {fontScopeStyle}
            {pageStyle}
            {customFontFaceStyle}
            <div ref={ref} id="print-template" className={isPreview ? "preview-mode" : "only-print"} style={(!isThermal && (data.details || []).length > (s.paper_size === 'A5' ? 12 : (s.paper_size === 'A6' ? 6 : 22))) ? { width: '100%', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center' } : containerStyle}>
                {/* Visual Margin Guides for Preview */}
                {isPreview && (
                    <>
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            border: '1px dashed #cbd5e1',
                            pointerEvents: 'none',
                            zIndex: 10,
                            margin: s.invoice_use_default_margins === 'true' ? '5mm' : '0'
                        }} />
                        {s.invoice_use_default_margins !== 'true' && (
                            <>
                                {mt > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0,
                                        height: `${mt}mm`,
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '1px dashed #cbd5e1',
                                        pointerEvents: 'none',
                                        zIndex: 9
                                    }} />
                                )}
                                {mb > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        height: `${mb}mm`,
                                        backgroundColor: '#f8fafc',
                                        borderTop: '1px dashed #cbd5e1',
                                        pointerEvents: 'none',
                                        zIndex: 9
                                    }} />
                                )}
                                {ml > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: `${mt}mm`, bottom: `${mb}mm`, left: 0,
                                        width: `${ml}mm`,
                                        backgroundColor: '#f8fafc',
                                        borderRight: '1px dashed #cbd5e1',
                                        pointerEvents: 'none',
                                        zIndex: 9
                                    }} />
                                )}
                                {mr > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: `${mt}mm`, bottom: `${mb}mm`, right: 0,
                                        width: `${mr}mm`,
                                        backgroundColor: '#f8fafc',
                                        borderLeft: '1px dashed #cbd5e1',
                                        pointerEvents: 'none',
                                        zIndex: 9
                                    }} />
                                )}
                            </>
                        )}
                        {s.invoice_use_default_margins === 'true' && (
                            <div style={{
                                position: 'absolute',
                                top: '2mm',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '9px',
                                color: '#94a3b8',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                zIndex: 11
                            }}>
                                Lề mặc định Driver (Ước lượng)
                            </div>
                        )}
                    </>
                )}

                {isFree ? (
                    isPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {/* 1. Header Area with dynamic height container */}
                            <div style={{ position: 'relative', width: '100%', height: `${getHeaderHeight()}px` }}>
                                {logoEl && (
                                    <DraggableBlock xKey="pos_logo_x" yKey="pos_logo_y" wKey="pos_width_logo" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {logoEl}
                                    </DraggableBlock>
                                )}
                                {shopNameEl && (
                                    <DraggableBlock xKey="pos_shop_name_x" yKey="pos_shop_name_y" wKey="pos_width_shop_name" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {shopNameEl}
                                    </DraggableBlock>
                                )}
                                {shopInfoEl && (
                                    <DraggableBlock xKey="pos_shop_info_x" yKey="pos_shop_info_y" wKey="pos_width_shop_info" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {shopInfoEl}
                                    </DraggableBlock>
                                )}
                                {titleEl && (
                                    <DraggableBlock xKey="pos_title_x" yKey="pos_title_y" wKey="pos_width_title" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {titleEl}
                                    </DraggableBlock>
                                )}
                                {customerNameEl && (
                                    <DraggableBlock xKey="pos_customer_name_x" yKey="pos_customer_name_y" wKey="pos_width_customer_name" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {customerNameEl}
                                    </DraggableBlock>
                                )}
                                {customerPhoneEl && (
                                    <DraggableBlock xKey="pos_customer_phone_x" yKey="pos_customer_phone_y" wKey="pos_width_customer_phone" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {customerPhoneEl}
                                    </DraggableBlock>
                                )}
                                {customerAddressEl && (
                                    <DraggableBlock 
                                        xKey={partnerPhoneVal ? "pos_customer_address_x" : "pos_customer_phone_x"} 
                                        yKey={partnerPhoneVal ? "pos_customer_address_y" : "pos_customer_phone_y"} 
                                        wKey={partnerPhoneVal ? "pos_width_customer_address" : "pos_width_customer_phone"} 
                                        settings={s} 
                                        onUpdateSetting={onUpdateSetting} 
                                        isPreview={isPreview}
                                    >
                                        {customerAddressEl}
                                    </DraggableBlock>
                                )}
                                {voucherNoteEl && (
                                    <DraggableBlock xKey="pos_customer_info_x" yKey="pos_customer_info_y" wKey="pos_width_customer_info" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {voucherNoteEl}
                                    </DraggableBlock>
                                )}
                                {invoiceMetaEl && (
                                    <DraggableBlock xKey="pos_invoice_meta_x" yKey="pos_invoice_meta_y" wKey="pos_width_invoice_meta" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {invoiceMetaEl}
                                    </DraggableBlock>
                                )}
                            </div>

                            {/* 2. Table Area (flows naturally below Header Area) */}
                            {isTwoColumns ? (
                                <>
                                    <div style={{ display: 'flex', gap: `${s.invoice_column_spacing || 10}px`, width: '100%', alignItems: 'flex-start', position: 'relative' }}>
                                        {leftTableEl && (
                                            <DraggableBlock 
                                                xKey="pos_table_left_x" 
                                                yKey="pos_table_y" 
                                                wKey="pos_width_table_left" 
                                                yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                                positionMode="relative-flow" 
                                                settings={{
                                                    ...s,
                                                    pos_table_left_x: s.pos_table_left_x !== undefined ? s.pos_table_left_x : String(leftTableX),
                                                    pos_width_table_left: s.pos_width_table_left !== undefined ? s.pos_width_table_left : String(leftTableWidth)
                                                }} 
                                                onUpdateSetting={onUpdateSetting} 
                                                isPreview={isPreview}
                                            >
                                                {leftTableEl}
                                            </DraggableBlock>
                                        )}
                                        {rightTableEl && (
                                            <DraggableBlock 
                                                xKey="pos_table_right_x" 
                                                yKey="pos_table_y" 
                                                wKey="pos_width_table_right" 
                                                yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                                positionMode="relative-flow" 
                                                settings={{
                                                    ...s,
                                                    pos_table_right_x: s.pos_table_right_x !== undefined ? s.pos_table_right_x : String(rightTableX),
                                                    pos_width_table_right: s.pos_width_table_right !== undefined ? s.pos_width_table_right : String(rightTableWidth)
                                                }} 
                                                onUpdateSetting={onUpdateSetting} 
                                                isPreview={isPreview}
                                            >
                                                {rightTableEl}
                                            </DraggableBlock>
                                        )}
                                    </div>
                                    {totalSummaryEl && (
                                        <DraggableBlock 
                                            xKey="pos_table_summary_x" 
                                            yKey="pos_table_summary_y" 
                                            wKey="pos_width_table_summary" 
                                            yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                            positionMode="relative-flow" 
                                            settings={{
                                                ...s,
                                                pos_table_summary_x: s.pos_table_summary_x !== undefined ? s.pos_table_summary_x : s.pos_table_x,
                                                pos_table_summary_y: s.pos_table_summary_y !== undefined ? s.pos_table_summary_y : String(leftTableY - 230 + 100),
                                                pos_width_table_summary: s.pos_width_table_summary !== undefined ? s.pos_width_table_summary : s.pos_width_table
                                            }} 
                                            onUpdateSetting={onUpdateSetting} 
                                            isPreview={isPreview}
                                        >
                                            {totalSummaryEl}
                                        </DraggableBlock>
                                    )}
                                </>
                            ) : (
                                tableEl && (
                                    <DraggableBlock xKey="pos_table_x" yKey="pos_table_y" wKey="pos_width_table" yOffset={-(parseInt(s.pos_table_y) || 230)} positionMode="relative-flow" settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                        {tableEl}
                                    </DraggableBlock>
                                )
                            )}

                            {/* 3. Footer Area (flows naturally below Table Area) */}
                            {getFooterHeight() > 0 && (
                                <div style={{ position: 'relative', width: '100%', height: `${getFooterHeight()}px`, marginTop: '15px' }}>
                                    {notesEl && (
                                        <DraggableBlock xKey="pos_notes_x" yKey="pos_notes_y" wKey="pos_width_notes" yOffset={-500} settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                            {notesEl}
                                        </DraggableBlock>
                                    )}
                                    {summaryEl && (
                                        <DraggableBlock xKey="pos_summary_x" yKey="pos_summary_y" wKey="pos_width_summary" yOffset={-500} settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                            {summaryEl}
                                        </DraggableBlock>
                                    )}
                                    {signaturesEl && (
                                        <DraggableBlock xKey="pos_signatures_x" yKey="pos_signatures_y" wKey="pos_width_signatures" yOffset={-500} settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                            {signaturesEl}
                                        </DraggableBlock>
                                    )}
                                    {thankYouEl && (
                                        <DraggableBlock xKey="pos_thank_you_x" yKey="pos_thank_you_y" wKey="pos_width_thank_you" yOffset={-500} settings={s} onUpdateSetting={onUpdateSetting} isPreview={isPreview}>
                                            {thankYouEl}
                                        </DraggableBlock>
                                    )}
                                </div>
                            )}

                            {pageNumberEl && (
                                <div style={{ width: '100%' }}>
                                    {pageNumberEl}
                                </div>
                            )}
                        </div>
                    ) : (
                        <table className="print-layout-table" style={{ width: '100%', border: 'none', borderCollapse: 'collapse', backgroundColor: 'transparent' }}>
                            {s.invoice_repeat_header_on_later_pages === 'true' ? (
                                <thead>
                                    <tr>
                                        <td style={{ border: 'none', padding: 0 }}>
                                            <div style={{ position: 'relative', width: '100%', height: `${getHeaderHeight()}px`, overflow: 'visible' }}>
                                                {logoEl && <DraggableBlock xKey="pos_logo_x" yKey="pos_logo_y" wKey="pos_width_logo" settings={s} isPreview={false}>{logoEl}</DraggableBlock>}
                                                {shopNameEl && <DraggableBlock xKey="pos_shop_name_x" yKey="pos_shop_name_y" wKey="pos_width_shop_name" settings={s} isPreview={false}>{shopNameEl}</DraggableBlock>}
                                                {shopInfoEl && <DraggableBlock xKey="pos_shop_info_x" yKey="pos_shop_info_y" wKey="pos_width_shop_info" settings={s} isPreview={false}>{shopInfoEl}</DraggableBlock>}
                                                {titleEl && <DraggableBlock xKey="pos_title_x" yKey="pos_title_y" wKey="pos_width_title" settings={s} isPreview={false}>{titleEl}</DraggableBlock>}
                                                {customerNameEl && <DraggableBlock xKey="pos_customer_name_x" yKey="pos_customer_name_y" wKey="pos_width_customer_name" settings={s} isPreview={false}>{customerNameEl}</DraggableBlock>}
                                                {customerPhoneEl && <DraggableBlock xKey="pos_customer_phone_x" yKey="pos_customer_phone_y" wKey="pos_width_customer_phone" settings={s} isPreview={false}>{customerPhoneEl}</DraggableBlock>}
                                                {customerAddressEl && (
                                                    <DraggableBlock 
                                                        xKey={partnerPhoneVal ? "pos_customer_address_x" : "pos_customer_phone_x"} 
                                                        yKey={partnerPhoneVal ? "pos_customer_address_y" : "pos_customer_phone_y"} 
                                                        wKey={partnerPhoneVal ? "pos_width_customer_address" : "pos_width_customer_phone"} 
                                                        settings={s} 
                                                        isPreview={false}
                                                    >
                                                        {customerAddressEl}
                                                    </DraggableBlock>
                                                )}
                                                {voucherNoteEl && <DraggableBlock xKey="pos_customer_info_x" yKey="pos_customer_info_y" wKey="pos_width_customer_info" settings={s} isPreview={false}>{voucherNoteEl}</DraggableBlock>}
                                                {invoiceMetaEl && <DraggableBlock xKey="pos_invoice_meta_x" yKey="pos_invoice_meta_y" wKey="pos_width_invoice_meta" settings={s} isPreview={false}>{invoiceMetaEl}</DraggableBlock>}
                                            </div>
                                        </td>
                                    </tr>
                                </thead>
                            ) : null}
                            <tbody>
                                <tr>
                                    <td style={{ border: 'none', padding: 0 }}>
                                        {s.invoice_repeat_header_on_later_pages !== 'true' && (
                                            <div style={{ position: 'relative', width: '100%', height: `${getHeaderHeight()}px`, overflow: 'visible' }}>
                                                {logoEl && <DraggableBlock xKey="pos_logo_x" yKey="pos_logo_y" wKey="pos_width_logo" settings={s} isPreview={false}>{logoEl}</DraggableBlock>}
                                                {shopNameEl && <DraggableBlock xKey="pos_shop_name_x" yKey="pos_shop_name_y" wKey="pos_width_shop_name" settings={s} isPreview={false}>{shopNameEl}</DraggableBlock>}
                                                {shopInfoEl && <DraggableBlock xKey="pos_shop_info_x" yKey="pos_shop_info_y" wKey="pos_width_shop_info" settings={s} isPreview={false}>{shopInfoEl}</DraggableBlock>}
                                                {titleEl && <DraggableBlock xKey="pos_title_x" yKey="pos_title_y" wKey="pos_width_title" settings={s} isPreview={false}>{titleEl}</DraggableBlock>}
                                                {customerNameEl && <DraggableBlock xKey="pos_customer_name_x" yKey="pos_customer_name_y" wKey="pos_width_customer_name" settings={s} isPreview={false}>{customerNameEl}</DraggableBlock>}
                                                {customerPhoneEl && <DraggableBlock xKey="pos_customer_phone_x" yKey="pos_customer_phone_y" wKey="pos_width_customer_phone" settings={s} isPreview={false}>{customerPhoneEl}</DraggableBlock>}
                                                {customerAddressEl && (
                                                    <DraggableBlock 
                                                        xKey={partnerPhoneVal ? "pos_customer_address_x" : "pos_customer_phone_x"} 
                                                        yKey={partnerPhoneVal ? "pos_customer_address_y" : "pos_customer_phone_y"} 
                                                        wKey={partnerPhoneVal ? "pos_width_customer_address" : "pos_width_customer_phone"} 
                                                        settings={s} 
                                                        isPreview={false}
                                                    >
                                                        {customerAddressEl}
                                                    </DraggableBlock>
                                                )}
                                                {voucherNoteEl && <DraggableBlock xKey="pos_customer_info_x" yKey="pos_customer_info_y" wKey="pos_width_customer_info" settings={s} isPreview={false}>{voucherNoteEl}</DraggableBlock>}
                                                {invoiceMetaEl && <DraggableBlock xKey="pos_invoice_meta_x" yKey="pos_invoice_meta_y" wKey="pos_width_invoice_meta" settings={s} isPreview={false}>{invoiceMetaEl}</DraggableBlock>}
                                            </div>
                                        )}
                                        {isTwoColumns ? (
                                            <>
                                                <div style={{ display: 'flex', gap: `${s.invoice_column_spacing || 10}px`, width: '100%', alignItems: 'flex-start', position: 'relative' }}>
                                                    {leftTableEl && (
                                                        <DraggableBlock 
                                                            xKey="pos_table_left_x" 
                                                            yKey="pos_table_y" 
                                                            wKey="pos_width_table_left" 
                                                            yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                                            positionMode="relative-flow" 
                                                            settings={{
                                                                ...s,
                                                                pos_table_left_x: s.pos_table_left_x !== undefined ? s.pos_table_left_x : String(leftTableX),
                                                                pos_width_table_left: s.pos_width_table_left !== undefined ? s.pos_width_table_left : String(leftTableWidth)
                                                            }} 
                                                            isPreview={false}
                                                        >
                                                            {leftTableEl}
                                                        </DraggableBlock>
                                                    )}
                                                    {rightTableEl && (
                                                        <DraggableBlock 
                                                            xKey="pos_table_right_x" 
                                                            yKey="pos_table_y" 
                                                            wKey="pos_width_table_right" 
                                                            yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                                            positionMode="relative-flow" 
                                                            settings={{
                                                                ...s,
                                                                pos_table_right_x: s.pos_table_right_x !== undefined ? s.pos_table_right_x : String(rightTableX),
                                                                pos_width_table_right: s.pos_width_table_right !== undefined ? s.pos_width_table_right : String(rightTableWidth)
                                                            }} 
                                                            isPreview={false}
                                                        >
                                                            {rightTableEl}
                                                        </DraggableBlock>
                                                    )}
                                                </div>
                                                {totalSummaryEl && (
                                                    <DraggableBlock 
                                                        xKey="pos_table_summary_x" 
                                                        yKey="pos_table_summary_y" 
                                                        wKey="pos_width_table_summary" 
                                                        yOffset={-(parseInt(s.pos_table_y) || 230)} 
                                                        positionMode="relative-flow" 
                                                        settings={{
                                                            ...s,
                                                            pos_table_summary_x: s.pos_table_summary_x !== undefined ? s.pos_table_summary_x : s.pos_table_x,
                                                            pos_table_summary_y: s.pos_table_summary_y !== undefined ? s.pos_table_summary_y : String(leftTableY - 230 + 100),
                                                            pos_width_table_summary: s.pos_width_table_summary !== undefined ? s.pos_width_table_summary : s.pos_width_table
                                                        }} 
                                                        isPreview={false}
                                                    >
                                                        {totalSummaryEl}
                                                    </DraggableBlock>
                                                )}
                                            </>
                                        ) : (
                                            tableEl && (
                                                <DraggableBlock xKey="pos_table_x" yKey="pos_table_y" wKey="pos_width_table" yOffset={-(parseInt(s.pos_table_y) || 230)} positionMode="relative-flow" settings={s} isPreview={false}>
                                                    {tableEl}
                                                </DraggableBlock>
                                            )
                                        )}
                                        {getFooterHeight() > 0 && (
                                            <div style={{ position: 'relative', width: '100%', height: `${getFooterHeight()}px`, marginTop: '15px', overflow: 'visible' }}>
                                                {notesEl && <DraggableBlock xKey="pos_notes_x" yKey="pos_notes_y" wKey="pos_width_notes" yOffset={-500} settings={s} isPreview={false}>{notesEl}</DraggableBlock>}
                                                {summaryEl && <DraggableBlock xKey="pos_summary_x" yKey="pos_summary_y" wKey="pos_width_summary" yOffset={-500} settings={s} isPreview={false}>{summaryEl}</DraggableBlock>}
                                                {signaturesEl && <DraggableBlock xKey="pos_signatures_x" yKey="pos_signatures_y" wKey="pos_width_signatures" yOffset={-500} settings={s} isPreview={false}>{signaturesEl}</DraggableBlock>}
                                                {thankYouEl && <DraggableBlock xKey="pos_thank_you_x" yKey="pos_thank_you_y" wKey="pos_width_thank_you" yOffset={-500} settings={s} isPreview={false}>{thankYouEl}</DraggableBlock>}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )
                ) : (
                    isPreview ? (() => {
                        const allDetails = data.details || [];
                        const rowPad = parseInt(s.invoice_row_padding || 4);
                        const rowLh = parseFloat(s.invoice_table_line_height || 1.15);
                        const fontSz = parseInt(s.invoice_table_content_size || 12);
                        const estRowH = Math.max(18, fontSz * rowLh + rowPad * 2 + 4);
                        
                        const printableH = s.paper_size === 'A5' ? 790 : (s.paper_size === 'A6' ? 560 : 1120);
                        const firstHeaderH = (s.invoice_show_logo === 'true' ? 50 : 0) + 70 + (parseInt(s.invoice_header_spacing || 10));
                        const otherHeaderH = s.invoice_repeat_header_on_later_pages === 'true' ? firstHeaderH : 35;
                        const totalSectionH = 260 + (parseInt(s.invoice_total_section_margin_top || 0));

                        const renderStandardPages = (isForPreview) => {
                            const size = s.paper_size || 'A4';
                            const pageH_mm = size === 'A5' ? 210 : (size === 'A6' ? 148 : 297);
                            const paddingMm = useDefaultMargins ? 0 : Math.max(mt, ml, mr, mb);
                            const firstPageAvailH = printableH;
                            const otherPageAvailH = Math.max(200, printableH - otherHeaderH);
                            const firstPageCap = Math.max(1, Math.floor((firstPageAvailH - firstHeaderH - totalSectionH) / estRowH));
                            const otherPageCap = Math.max(1, Math.floor(otherPageAvailH / estRowH));
                            const realisticSumH = 260 + (parseInt(s.invoice_total_section_margin_top || 0));
                            const laterPageWithSummaryCap = Math.max(1, Math.floor((otherPageAvailH - realisticSumH) / estRowH));

                            if (allDetails.length <= firstPageCap) {
                                return (
                                    <>
                                        <div style={headerStyle}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                                                {logoEl}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    {shopNameEl}
                                                    {shopInfoEl}
                                                </div>
                                            </div>
                                            {titleEl}
                                        </div>
                                        <div style={infoGridStyle}>
                                            <div>{customerNameEl}{customerPhoneEl}{customerAddressEl}{voucherNoteEl}</div>
                                            {invoiceMetaEl}
                                        </div>
                                        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                                            {renderTable(allDetails, 0, false, 'page-1', false)}
                                        </div>
                                        <div className="print-section-avoid-break" style={{ marginTop: `${s.invoice_total_section_margin_top || 0}px`, display: 'flex', flexDirection: 'column', gap: '15px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{notesEl}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>{summaryEl}</div>
                                            </div>
                                        </div>
                                        <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>{signaturesEl}</div>
                                        <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>{thankYouEl}</div>
                                        {renderPageNumber(1, 1)}
                                    </>
                                );
                            }

                            const pages = [];
                            let remaining = [...allDetails];
                            let p1Count = allDetails.length <= firstPageCap + laterPageWithSummaryCap ? Math.min(firstPageCap, Math.max(1, allDetails.length - laterPageWithSummaryCap)) : firstPageCap;
                            
                            pages.push({ pageIndex: 0, items: remaining.slice(0, p1Count), startIndex: 0 });
                            remaining = remaining.slice(p1Count);
                            while (remaining.length > 0) {
                                let count = remaining.length <= laterPageWithSummaryCap ? remaining.length : (remaining.length <= otherPageCap + laterPageWithSummaryCap ? Math.min(otherPageCap, Math.max(1, remaining.length - laterPageWithSummaryCap)) : Math.min(remaining.length, otherPageCap));
                                pages.push({ pageIndex: pages.length, items: remaining.slice(0, count), startIndex: allDetails.length - remaining.length });
                                remaining = remaining.slice(count);
                            }

                            return (
                                <div className="print-pages-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: isForPreview ? '40px' : '0px' }}>
                                    {pages.map((p, idx) => {
                                        const isFirstPage = idx === 0;
                                        const isLastPage = idx === pages.length - 1;
                                        const pageNum = idx + 1;
                                        return (
                                            <div key={`sheet-${idx}`} className="print-page-sheet" style={{ width: '100%', minHeight: isForPreview ? `${pageH_mm}mm` : 'auto', height: isForPreview ? `${pageH_mm}mm` : 'auto', boxSizing: 'border-box', position: 'relative', pageBreakAfter: isLastPage ? 'auto' : 'always', breakAfter: isLastPage ? 'auto' : 'page', marginBottom: (!isLastPage && !isForPreview) ? 0 : undefined, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', boxShadow: isForPreview ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none', borderRadius: isForPreview ? '8px' : '0', padding: isForPreview ? `${paddingMm}mm` : '0', overflow: 'hidden' }}>
                                                {isFirstPage ? (
                                                    <>
                                                        <div style={headerStyle}>
                                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>{logoEl}<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{shopNameEl}{shopInfoEl}</div></div>
                                                            {titleEl}
                                                        </div>
                                                        <div style={infoGridStyle}>
                                                            <div>{customerNameEl}{customerPhoneEl}{customerAddressEl}{voucherNoteEl}</div>
                                                            {invoiceMetaEl}
                                                        </div>
                                                    </>
                                                ) : (
                                                    s.invoice_repeat_header_on_later_pages === 'true' && (
                                                        <div style={{ ...headerStyle, paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{s.invoice_shop_name || 'CỬA HÀNG'}</span>
                                                                <span style={{ fontSize: '11px', color: '#64748b' }}>Hóa đơn: #{data.display_id || data.id} (tiếp theo)</span>
                                                            </div>
                                                            <span style={{ fontSize: '10px', color: '#64748b' }}>{data.date ? formatDate(data.date) : ''}</span>
                                                        </div>
                                                    )
                                                )}
                                                <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>{renderTable(p.items, p.startIndex, !isLastPage, `page-${pageNum}`, !isLastPage)}</div>
                                                {isLastPage && (
                                                    <>
                                                        <div className="print-section-avoid-break" style={{ marginTop: `${s.invoice_total_section_margin_top || 0}px`, display: 'flex', flexDirection: 'column', gap: '15px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{notesEl}</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>{summaryEl}</div>
                                                            </div>
                                                        </div>
                                                        <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>{signaturesEl}</div>
                                                        <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>{thankYouEl}</div>
                                                    </>
                                                )}
                                                {renderPageNumber(pageNum, pages.length)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        };

                        return renderStandardPages(true);
                    })() : (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            {/* Standard Header */}
                            <div style={headerStyle}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
                                    {logoEl}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {shopNameEl}
                                        {shopInfoEl}
                                    </div>
                                </div>
                                {titleEl}
                            </div>
                            <div style={infoGridStyle}>
                                <div>
                                    {customerNameEl}
                                    {customerPhoneEl}
                                    {customerAddressEl}
                                    {voucherNoteEl}
                                </div>
                                {invoiceMetaEl}
                            </div>

                            {/* Standard Table (Render all rows) */}
                            <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                                {renderTable(data.details || [], 0, false, 'single', false)}
                            </div>

                            {/* Summary & Notes Section */}
                            <div className="print-section-avoid-break" style={{ marginTop: `${s.invoice_total_section_margin_top || 0}px`, width: '100%', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                <table style={{ width: '100%', border: 'none', borderCollapse: 'collapse', margin: 0, padding: 0 }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: 'none', verticalAlign: 'top', padding: '0 15px 0 0', width: '55%' }}>
                                                {notesEl}
                                            </td>
                                            <td style={{ border: 'none', verticalAlign: 'top', padding: 0, width: '45%', textAlign: 'right' }}>
                                                {summaryEl}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures */}
                            <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                {signaturesEl}
                            </div>

                            {/* Thank You */}
                            <div className="print-section-avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                {thankYouEl}
                            </div>

                            {/* Page Number */}
                            {pageNumberEl}
                        </div>
                    )
                )}

                {String(s.invoice_show_watermark) === 'true' && (
                    <div 
                    className="print-watermark"
                    style={{
                        position: 'absolute',
                        left: `${s.invoice_watermark_x || 100}px`,
                        top: `${s.invoice_watermark_y || 200}px`,
                        opacity: s.invoice_watermark_opacity || '0.15',
                        transform: `rotate(${s.invoice_watermark_angle || -30}deg)`,
                        transformOrigin: 'center',
                        userSelect: 'none',
                        pointerEvents: isPreview ? 'auto' : 'none',
                        zIndex: 9999,
                        outline: (isPreview && watermarkHovered) ? '2px dashed #10b981' : 'none',
                        cursor: isPreview ? 'move' : 'default',
                        padding: isPreview ? '10px' : '0',
                        display: 'inline-block',
                        boxSizing: 'border-box'
                    }}
                    onMouseDown={handleWatermarkDragStart}
                    onMouseEnter={() => setWatermarkHovered(true)}
                    onMouseLeave={() => setWatermarkHovered(false)}
                    >
                        {isPreview && watermarkHovered && (
                            <div style={{
                                position: 'absolute',
                                top: '-25px',
                                left: '0',
                                backgroundColor: '#10b981',
                                color: 'white',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                userSelect: 'none',
                                zIndex: 10001
                            }}>
                                {s.invoice_watermark_type === 'image' ? 'Watermark ảnh (Kéo để di chuyển)' : 'Watermark chữ (Kéo để di chuyển)'}
                            </div>
                        )}
                        {s.invoice_watermark_type === 'image' ? (
                            s.invoice_watermark_image_url ? (
                                <img
                                    src={getResolvedUrl(s.invoice_watermark_image_url)}
                                    alt="Watermark"
                                    style={{
                                        width: `${s.invoice_watermark_size || 100}px`,
                                        height: 'auto',
                                        display: 'block',
                                        pointerEvents: 'none',
                                        userSelect: 'none'
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', padding: '10px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                                    [Chưa chọn hình ảnh watermark]
                                </div>
                            )
                        ) : (
                            <div style={{
                                fontSize: `${s.invoice_watermark_size || 100}px`,
                                fontWeight: 'bold',
                                color: '#000000',
                                whiteSpace: 'nowrap',
                                lineHeight: 1
                            }}>
                                {s.invoice_watermark_text || 'NHÁP'}
                            </div>
                        )}
                        {isPreview && watermarkHovered && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: '-6px',
                                    bottom: '-6px',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#10b981',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    cursor: 'se-resize',
                                    zIndex: 10002
                                }}
                                onMouseDown={handleWatermarkResizeStart}
                                title="Kéo để đổi kích thước"
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
});

export default PrintTemplate;
