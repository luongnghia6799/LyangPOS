import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) return "0";
    return new Intl.NumberFormat('en-US').format(value);
}

export const formatDebt = (debt) => {
    if (debt === undefined || debt === null || debt === 0) return "0";
    return (debt > 0 ? "+" : "") + formatNumber(debt);
}

export const isNearExpiry = (dateStr, days = 60) => {
    if (!dateStr || dateStr === '...') return false;
    try {
        let expiryDate;
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return false;
            expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateStr.includes('-')) {
            // YYYY-MM-DD
            expiryDate = new Date(dateStr);
        } else {
            return false;
        }

        const today = new Date();
        // Reset hours
        today.setHours(0, 0, 0, 0);

        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days;
    } catch (e) {
        return false;
    }
}

export const isExpired = (dateStr) => {
    if (!dateStr || dateStr === '...') return false;
    try {
        let expiryDate;
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length !== 3) return false;
            expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateStr.includes('-')) {
            // YYYY-MM-DD
            expiryDate = new Date(dateStr);
        } else {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return expiryDate < today;
    } catch (e) {
        return false;
    }
}

export const getLocalDateString = (dateInput = new Date()) => {
    if (!dateInput) return '';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
};

export const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '-';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch (e) {
        return '-';
    }
}
export const normalizeUOM = (uom) => {
    if (!uom || typeof uom !== 'string') return uom;

    // 1. Trim & Lowercase
    const clean = uom.trim().toLowerCase();
    if (!clean) return '';

    // 2. Mapping table (Sync with BRIEF)
    const UOM_MAP = {
        'kg': 'Kg', 'ki': 'Kg', 'kilogram': 'Kg', 'kilo': 'Kg',
        'l': 'Lít', 'lit': 'Lít',
        'm': 'Mét', 'met': 'Mét',
        'cai': 'Cái', 'chiec': 'Cái',
        'thung': 'Thg', 'thg': 'Thg',
        'hop': 'Hộp',
        'chai': 'Chai', 'lo': 'Chai',
        'goi': 'Gói',
        'vien': 'Viên', 'vi': 'Vỉ',
        'tui': 'Túi',
        'cuon': 'Cuộn'
    };


    const noAccent = removeAccents(clean);

    // 4. Look up in map (original or no accent)
    if (UOM_MAP[clean]) return UOM_MAP[clean];
    if (UOM_MAP[noAccent]) return UOM_MAP[noAccent];

    // 5. Default: Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};

export const UOM_PRIORITY = {
    'bao': 100, 'bành': 100, 'phuy': 100, 'phi': 100,
    'xô': 90,
    'thùng': 80, 'thg': 80, 'can': 80, 'két': 80,
    'tấm': 70, 'cuộn': 70,
    'túi': 60, 'bịch': 60, 'bó': 60,
    'bình': 50,
    'chai': 40, 'hũ': 40, 'lọ': 30, 'hộp': 30,
    'tip': 20, 'tuýp': 20, 'viên': 20,
    'gói': 10, 'cái': 10, 'chiếc': 10, 'vỉ': 10
};

export const getUomPriority = (uom) => {
    if (!uom) return 0;
    const clean = removeAccents(uom.toLowerCase().trim());
    return UOM_PRIORITY[clean] || 0;
};

export const smartSortItems = (items) => {
    if (!items || !Array.isArray(items)) return items;
    return [...items].sort((a, b) => {
        const uomA = a.unit || a.product_unit;
        const uomB = b.unit || b.product_unit;
        const priorityA = getUomPriority(uomA);
        const priorityB = getUomPriority(uomB);
        if (priorityA !== priorityB) {
            return priorityB - priorityA; // Descending
        }
        return (a.product_name || a.name || '').localeCompare(b.product_name || b.name || '', 'vi');
    });
};

export const playSuccessSound = (profileOverride) => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  const profile = profileOverride || localStorage.getItem('pos_sound_theme_success') || 'chime';
  if (profile === 'off') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const playTone = (freq, time, duration, volume = 0.25, type = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };

    if (profile === 'cash_register') {
      // Crisp bell "Cha-ching"
      playTone(987.77, now, 0.1, 0.25, 'triangle'); // B5
      playTone(1318.51, now + 0.08, 0.45, 0.3, 'sine'); // E6
      playTone(2637.02, now + 0.09, 0.35, 0.15, 'sine'); // E7 harmonic
    } else if (profile === 'digital_pos') {
      // Two crisp modern high beeps
      playTone(1760, now, 0.08, 0.25, 'sine'); // A6
      playTone(2349.32, now + 0.09, 0.15, 0.3, 'sine'); // D7
    } else if (profile === 'mario') {
      // 8-bit Coin power-up
      playTone(987.77, now, 0.08, 0.2, 'square'); // B5
      playTone(1318.51, now + 0.08, 0.35, 0.25, 'square'); // E6
    } else if (profile === 'subtle_wood') {
      // Organic marimba double tap
      playTone(523.25, now, 0.12, 0.3, 'triangle');
      playTone(783.99, now + 0.1, 0.2, 0.25, 'triangle');
    } else if (profile === 'fanfare') {
      // 4-note victory arpeggio: C5 -> E5 -> G5 -> C6
      playTone(523.25, now, 0.1, 0.2, 'triangle');
      playTone(659.25, now + 0.08, 0.1, 0.22, 'triangle');
      playTone(783.99, now + 0.16, 0.12, 0.25, 'triangle');
      playTone(1046.50, now + 0.26, 0.5, 0.3, 'sine');
    } else if (profile === 'zen_bell') {
      // Resonant singing bell with long decay
      playTone(880, now, 0.8, 0.25, 'sine');
      playTone(1760, now, 0.6, 0.12, 'sine');
      playTone(2640, now, 0.4, 0.06, 'sine');
    } else if (profile === 'coin_clink') {
      // Golden coin clink
      playTone(3200, now, 0.06, 0.2, 'sine');
      playTone(4000, now + 0.04, 0.15, 0.25, 'triangle');
      playTone(2800, now + 0.07, 0.2, 0.15, 'sine');
    } else {
      // Default: Warmer triad chime (C5 -> E5 -> G5)
      playTone(523.25, now, 0.5, 0.22, 'sine');
      playTone(659.25, now + 0.12, 0.5, 0.2, 'sine');
      playTone(783.99, now + 0.24, 0.7, 0.22, 'sine');
    }
  } catch (e) { console.error("Audio success sound failed", e); }
};

export const playAddToCartSound = (profileOverride) => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  const profile = profileOverride || localStorage.getItem('pos_sound_theme_cart_add') || 'barcode_beep';
  if (profile === 'off') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const playTone = (freq, time, duration, volume = 0.25, type = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };

    if (profile === 'bubble_drop') {
      // Gentle water droplet pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (profile === 'laser_blip') {
      // Futuristic laser blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (profile === 'bell_ding') {
      // Crystal clear ding
      playTone(1760, now, 0.12, 0.22, 'triangle'); // A6
    } else if (profile === 'wood_click') {
      // Warm wooden block tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (profile === 'coin_drop') {
      // Short coin bounce
      playTone(2800, now, 0.04, 0.22, 'sine');
      playTone(3600, now + 0.03, 0.08, 0.25, 'triangle');
    } else if (profile === 'cyber_pop') {
      // Crisp cyber micro pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else {
      // Default: barcode_beep (Crisp scanner beep: 2093Hz C7)
      playTone(2093, now, 0.055, 0.22, 'sine');
    }
  } catch (e) { }
};

export const playTickSound = () => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch (e) { }
};

export const playPopSound = (profileOverride) => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  const profile = profileOverride || localStorage.getItem('pos_sound_theme_action') || 'pop_bubble';
  if (profile === 'off') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (profile === 'click_switch') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (profile === 'tap_wooden') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (profile === 'beep_soft') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, now); // C6
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (profile === 'whoosh_subtle') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (profile === 'camera_snap') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    } else {
      // Default: pop_bubble
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch (e) { }
};

export const playNotificationSound = () => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const playTone = (freq, time, duration, volume = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };
    const now = ctx.currentTime;
    playTone(440.00, now, 0.5, 0.25);
    playTone(349.23, now + 0.35, 0.8, 0.22);
  } catch (e) { }
};

export const playErrorSound = (profileOverride) => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  const profile = profileOverride || localStorage.getItem('pos_sound_theme_error') || 'buzz_low';
  if (profile === 'off') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const playTone = (freq, time, duration, volume = 0.25, type = 'sawtooth') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };

    if (profile === 'glass_bonk') {
      playTone(350, now, 0.12, 0.25, 'triangle');
      playTone(180, now + 0.04, 0.15, 0.2, 'sine');
    } else if (profile === 'chord_warn') {
      playTone(311.13, now, 0.25, 0.2, 'sawtooth'); // Eb4
      playTone(261.63, now, 0.25, 0.2, 'sawtooth'); // C4
    } else {
      // Default: buzz_low
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) { }
};

export const playTabSound = () => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch (e) { }
};

export const playTypingSound = (profileOverride) => {
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  if (localStorage.getItem('pos_typing_sound_enabled') === 'false') return;
  const profile = profileOverride || localStorage.getItem('pos_sound_theme_typing') || 'mechanical';
  if (profile === 'off') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (profile === 'typewriter') {
      // Vintage typewriter mechanical strike
      const pitch = 2200 + Math.random() * 600;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.02);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (profile === 'soft_click') {
      // Subtle membrane / bubble tap
      const pitch = 850 + Math.random() * 200;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (profile === 'thock_deep') {
      // Deep thocky switch (Gateron Oil King / Ink Black feel)
      const pitch = 500 + Math.random() * 150;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (profile === 'bubble_typing') {
      // Water bubble droplet typing
      const pitch = 700 + Math.random() * 400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.02);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (profile === 'retro_beep') {
      // 8-bit retro computer key
      const pitch = 900 + Math.random() * 200;
      osc.type = 'square';
      osc.frequency.setValueAtTime(pitch, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else {
      // Default: mechanical blue / brown switch crisp click
      const pitch = 1700 + Math.random() * 500;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    }
  } catch (e) { }
};


// Simple in-memory cache for audio buffers to achieve 0ms TTS delay via Web Audio API
const ttsAudioCache = {};
let audioCtx = null;
const activeBufferSources = new Set();
let activeTraditionalAudio = null;

export const stopAllTTS = () => {
  try {
    currentSequenceId++;
    activeBufferSources.forEach(src => {
      try {
        src.stop(0);
        src.disconnect();
      } catch {}
    });
    activeBufferSources.clear();

    if (activeTraditionalAudio) {
      try {
        activeTraditionalAudio.pause();
        activeTraditionalAudio.currentTime = 0;
      } catch {}
      activeTraditionalAudio = null;
    }

    if (typeof window !== 'undefined' && window.currentTtsSequence) {
      try { window.currentTtsSequence.audio1?.pause(); } catch {}
      try { window.currentTtsSequence.audio2?.pause(); } catch {}
      window.currentTtsSequence = null;
    }
  } catch (e) {
    console.error("stopAllTTS error:", e);
  }
};

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    } catch {}
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play an AudioBuffer via Web Audio API for zero latency
const playAudioBuffer = (audioBuffer, rate) => {
  try {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = rate;
    source.connect(ctx.destination);
    activeBufferSources.add(source);
    source.onended = () => {
      activeBufferSources.delete(source);
    };
    source.start(0);
    return source;
  } catch (e) {
    console.error("playAudioBuffer failed", e);
    return null;
  }
};

const getCacheName = (voiceParam = '') => {
  const isMale = voiceParam.includes('male') || (typeof localStorage !== 'undefined' && (localStorage.getItem('pos_selected_voice') === 'edge-vi-male' || localStorage.getItem('pos_tts_mode') === 'male'));
  return isMale ? 'lyang-tts-audio-cache-male-v2' : 'lyang-tts-audio-cache-female-v2';
};

const loadAndCacheAudio = async (audioUrl, cacheKey, priority = 'auto') => {
  try {
    const currentCacheName = getCacheName(cacheKey);

    // For low-priority background precaching, write directly to disk cache
    // and skip memory-heavy decoding to prevent RAM ballooning when AudioContext resumes
    if (priority === 'low') {
      if (typeof caches !== 'undefined') {
        try {
          const cache = await caches.open(currentCacheName);
          const cachedResponse = await cache.match(audioUrl);
          if (cachedResponse) {
            return null;
          }
          const resAxios = await axios.get(audioUrl, { responseType: 'arraybuffer' });
          if (resAxios.data && resAxios.data.byteLength >= 100) {
            const responseObj = new Response(resAxios.data, {
              headers: { 'Content-Type': 'audio/mpeg' }
            });
            await cache.put(audioUrl, responseObj);
          }
        } catch (err) {
          console.warn("Low-priority Cache API write failed:", err);
        }
      }
      return null;
    }

    if (ttsAudioCache[cacheKey]) {
      return ttsAudioCache[cacheKey];
    }
    
    const loadPromise = (async () => {
      let arrayBuffer = null;
      let cachedResponse = null;

      // 1. Try to read from browser's Cache API first
      if (typeof caches !== 'undefined') {
        try {
          const cache = await caches.open(currentCacheName);
          cachedResponse = await cache.match(audioUrl);
          if (cachedResponse) {
            const buf = await cachedResponse.arrayBuffer();
            if (buf && buf.byteLength >= 100) {
              arrayBuffer = buf;
            } else {
              // Delete corrupted / 0-byte cache entry from Cache API
              await cache.delete(audioUrl);
              cachedResponse = null;
            }
          }
        } catch (err) {
          console.warn("Cache API matching failed:", err);
        }
      }

      if (!arrayBuffer) {
        // 2. If not in Cache API, fetch from backend via Axios (bypasses Tauri CORS/Mixed Content)
        const resAxios = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        arrayBuffer = resAxios.data;
        
        // Save to browser cache for future page loads only if valid
        if (typeof caches !== 'undefined' && arrayBuffer && arrayBuffer.byteLength >= 100) {
          try {
            const cache = await caches.open(currentCacheName);
            const responseObj = new Response(arrayBuffer, {
              headers: { 'Content-Type': 'audio/mpeg' }
            });
            await cache.put(audioUrl, responseObj);
          } catch (err) {
            console.warn("Cache API writing failed:", err);
          }
        }
      }

      if (!arrayBuffer || arrayBuffer.byteLength < 100) {
        return null;
      }

      const ctx = getAudioContext();
      const rawAudioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const audioBuffer = trimAudioBuffer(ctx, rawAudioBuffer);
      ttsAudioCache[cacheKey] = audioBuffer;
      return audioBuffer;
    })();
    
    ttsAudioCache[cacheKey] = loadPromise;
    return await loadPromise;
  } catch (e) {
    console.error("loadAndCacheAudio failed", e);
    delete ttsAudioCache[cacheKey];
    return null;
  }
};

/**
 * Trim leading and trailing silence from AudioBuffer (Edge-TTS adds ~150-300ms silence padding)
 */
const trimAudioBuffer = (ctx, buffer) => {
  try {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const threshold = 0.005; // -46dB silence threshold

    let start = 0;
    let end = length - 1;

    // Find first non-silent sample across channels
    outerStart: for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        if (Math.abs(buffer.getChannelData(ch)[i]) > threshold) {
          start = Math.max(0, i - Math.floor(sampleRate * 0.01)); // keep 10ms margin
          break outerStart;
        }
      }
    }

    // Find last non-silent sample across channels
    outerEnd: for (let i = length - 1; i >= 0; i--) {
      for (let ch = 0; ch < numChannels; ch++) {
        if (Math.abs(buffer.getChannelData(ch)[i]) > threshold) {
          end = Math.min(length - 1, i + Math.floor(sampleRate * 0.01)); // keep 10ms margin
          break outerEnd;
        }
      }
    }

    const trimmedLength = end - start + 1;
    if (trimmedLength <= 0 || (start === 0 && end === length - 1)) {
      return buffer;
    }

    const trimmedBuffer = ctx.createBuffer(numChannels, trimmedLength, sampleRate);
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = buffer.getChannelData(ch).subarray(start, end + 1);
      trimmedBuffer.copyToChannel(channelData, ch);
    }
    return trimmedBuffer;
  } catch (err) {
    return buffer;
  }
};

const getDynamicBaseUrl = () => {
  const defaultPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) || ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ? '3588' : '3588');
  let baseUrl = axios.defaults.baseURL || `http://localhost:${defaultPort}`;
  if (baseUrl.includes('localhost') && typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.includes('tauri')) {
    baseUrl = baseUrl.replace('localhost', window.location.hostname);
  }
  return baseUrl;
};

export const numberToViText = (numIn) => {
  let n = Math.round(numIn);
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  if (n === 0) return "không";
  if (n < 0) return "âm " + numberToViText(Math.abs(n));
  
  let text = "";
  if (n >= 1000000000) {
    text += numberToViText(Math.floor(n / 1000000000)) + " tỷ ";
    n %= 1000000000;
  }
  if (n >= 1000000) {
    text += numberToViText(Math.floor(n / 1000000)) + " triệu ";
    n %= 1000000;
  }
  if (n >= 1000) {
    text += numberToViText(Math.floor(n / 1000)) + " nghìn ";
    n %= 1000;
  }
  if (n >= 100) {
    text += units[Math.floor(n / 100)] + " trăm ";
    n %= 100;
    if (n > 0 && n < 10) {
      text += "lẻ ";
    }
  }
  if (n >= 10) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (ten === 1) {
      text += "mười ";
    } else {
      text += units[ten] + " mươi ";
    }
    if (unit === 1) {
      text += ten === 1 ? "một" : "mốt";
    } else if (unit === 5) {
      text += "lăm";
    } else if (unit > 0) {
      text += units[unit];
    }
  } else if (n > 0) {
    text += units[n];
  }
  return text.trim();
};

export const precacheCommonTTS = (products = []) => {
  try {
    const rate = parseFloat(localStorage.getItem("pos_speech_rate") || "1.4");
    const pitch = localStorage.getItem("pos_speech_pitch") || "0";
    const selectedVoiceName = localStorage.getItem("pos_selected_voice") || "edge-vi-female";
    if (selectedVoiceName !== "google" && !selectedVoiceName.startsWith("edge")) {
      return;
    }
    const baseUrl = getDynamicBaseUrl();
    
    // Voices to precache: put currently selected voice FIRST so it is immediately ready
    const activeVoice = (selectedVoiceName === 'edge-vi-male' || localStorage.getItem("pos_tts_mode") === "male") ? 'edge-vi-male' : 'edge-vi-female';
    const secondaryVoice = activeVoice === 'edge-vi-female' ? 'edge-vi-male' : 'edge-vi-female';
    const voicesToCache = [activeVoice, secondaryVoice];
    
    // 1. Basic numbers 1-1000 and thank you text
    const textsToPrecache = [];
    for (let i = 1; i <= 1000; i++) {
      textsToPrecache.push(numberToViText(i));
    }
    
    // Common system phrases for POS & Packing
    const commonPhrases = [
      localStorage.getItem("pos_tts_thankyou_template") || "Cảm ơn quý khách",
      "Cảm ơn quý khách",
      "Đã xóa",
      "Đã soạn",
      "Soạn hàng",
      "Đã soạn xong",
      "Trả hàng",
      "số tiền của quý khách là",
      "số tiền cần chuyển khoản là"
    ];
    commonPhrases.forEach(phrase => {
      if (phrase && !textsToPrecache.includes(phrase)) {
        textsToPrecache.push(phrase);
      }
    });

    // 2. Pre-cache raw alias and unique units for active products
    if (products && Array.isArray(products)) {
      products.forEach(p => {
        if (p.alias && p.alias.trim()) {
          const alias = p.alias.trim();
          if (!textsToPrecache.includes(alias)) {
            textsToPrecache.push(alias);
          }
        }
        const unit = (p.unit || p.product_unit || "").trim();
        if (unit && !textsToPrecache.includes(unit)) {
          textsToPrecache.push(unit);
        }
      });
    }

    // Build combination list: active voice items first, then secondary voice items
    const queueItems = [];
    voicesToCache.forEach(voiceParam => {
      textsToPrecache.forEach(text => {
        queueItems.push({ voiceParam, text });
      });
    });

    // Helper to dispatch progress events
    const dispatchProgress = (completed, total, active) => {
      if (typeof window !== 'undefined') {
        window.ttsPrecacheProgress = { completed, total, active };
        window.dispatchEvent(new CustomEvent('tts-precache-progress', { 
          detail: { completed, total, active } 
        }));
      }
    };

    // 3. Queue audio requests with concurrency limit to avoid clogging browser/WebView2 connections
    let index = 0;
    let completedCount = 0;
    const totalCount = queueItems.length;
    if (totalCount === 0) return;
    const maxConcurrency = 3;

    dispatchProgress(0, totalCount, true);

    const loadNext = async () => {
      if (index >= totalCount) {
        if (completedCount >= totalCount) {
          dispatchProgress(completedCount, totalCount, false);
        }
        return;
      }
      
      const item = queueItems[index++];
      const { voiceParam, text } = item;
      const cacheKey = `${voiceParam}_${rate}_${pitch}_${text}`;
      
      if (ttsAudioCache[cacheKey]) {
        completedCount++;
        dispatchProgress(completedCount, totalCount, true);
        loadNext();
        return;
      }
      
      const audioUrl = `${baseUrl.replace(/\/+$/, '')}/api/tts?text=${encodeURIComponent(text)}&voice=${voiceParam}&rate=${rate}&pitch=${encodeURIComponent(pitch)}`;
      try {
        await loadAndCacheAudio(audioUrl, cacheKey, 'low');
      } catch (err) {
        console.error("Failed to load/decode audio for precaching:", text, err);
      }
      
      completedCount++;
      dispatchProgress(completedCount, totalCount, true);
      
      if (completedCount >= totalCount) {
        dispatchProgress(completedCount, totalCount, false);
      } else {
        // Small stagger to let browser rest
        setTimeout(loadNext, 30);
      }
    };

    // Run initial batch
    for (let i = 0; i < Math.min(maxConcurrency, totalCount); i++) {
      loadNext();
    }
  } catch (e) {
    console.error("Precache TTS failed", e);
  }
};

export const checkMissingTTSCache = (products = []) => {
  return { missingCount: 0, totalNeeded: 0, details: [] };
};

export const precacheAmounts = (totalAmount, partnerName = "") => {
  try {
    const rate = parseFloat(localStorage.getItem("pos_speech_rate") || "1.4");
    const pitch = localStorage.getItem("pos_speech_pitch") || "0";
    const selectedVoiceName = localStorage.getItem("pos_selected_voice") || "edge-vi-female";
    if (selectedVoiceName !== "google" && !selectedVoiceName.startsWith("edge")) {
      return;
    }
    const baseUrl = getDynamicBaseUrl();
    let voiceParam = 'google';
    if (selectedVoiceName === 'edge-vi-female' || selectedVoiceName === 'edge-vi-male') {
      voiceParam = selectedVoiceName;
    }

    // Clean up old dynamic entries in ttsAudioCache to prevent memory leak (RAM overflow)
    Object.keys(ttsAudioCache).forEach(key => {
      if (key.includes("số tiền của") || key.includes("số tiền cần chuyển khoản")) {
        delete ttsAudioCache[key];
      }
    });

    const cleanPartner = (partnerName || "").trim();
    const isRealPartner = cleanPartner && 
                         cleanPartner.toLowerCase() !== "khách lẻ" && 
                         cleanPartner.toLowerCase() !== "khách vãng lai" && 
                         cleanPartner.toLowerCase() !== "ncc vãng lai";
    const partnerDisplay = isRealPartner ? cleanPartner : "";

    const textsToCache = [];
    const finalAmount = Math.round(Number(totalAmount) || 0);
    if (finalAmount <= 0) return;

    // A. Total Amount Text
    const disablePartnerTemplate = localStorage.getItem("pos_tts_disable_partner_template") === "true";
    const finalPartnerDisplay = disablePartnerTemplate ? "" : partnerDisplay;
    const totalTemplate = finalPartnerDisplay
      ? (localStorage.getItem("pos_tts_currency_partner_template") || "số tiền của {partner} là {amount} đồng")
      : (localStorage.getItem("pos_tts_currency_template") || "số tiền của quý khách là {amount} đồng");
    const totalViText = totalTemplate
      .replace("{amount}", numberToViText(finalAmount))
      .replace(/{partner}/gi, finalPartnerDisplay || "quý khách")
      .replace(/{customer}/gi, finalPartnerDisplay || "quý khách");
    textsToCache.push(totalViText);

    // B. F7 Transfer Amount Text
    const step1 = finalAmount / 1.05;
    const step2 = Math.floor(step1 / 100) * 100;
    const finalAmountTransfer = step2 * 1.05;

    const disablePartnerTransfer = localStorage.getItem("pos_tts_disable_partner_transfer_template") === "true";
    const finalPartnerDisplayTransfer = disablePartnerTransfer ? "" : partnerDisplay;
    const transferTemplate = finalPartnerDisplayTransfer
      ? (localStorage.getItem("pos_tts_transfer_partner_template") || "số tiền cần chuyển khoản của {partner} là {amount} đồng")
      : (localStorage.getItem("pos_tts_transfer_template") || "số tiền cần chuyển khoản là {amount} đồng");
    const transferViText = transferTemplate
      .replace("{amount}", numberToViText(finalAmountTransfer))
      .replace(/{partner}/gi, finalPartnerDisplayTransfer || "quý khách")
      .replace(/{customer}/gi, finalPartnerDisplayTransfer || "quý khách");
    textsToCache.push(transferViText);

    textsToCache.forEach(text => {
      const cacheKey = `${voiceParam}_${rate}_${pitch}_${text}`;
      if (!ttsAudioCache[cacheKey]) {
        const audioUrl = `${baseUrl.replace(/\/+$/, '')}/api/tts?text=${encodeURIComponent(text)}&voice=${voiceParam}&rate=${rate}&pitch=${encodeURIComponent(pitch)}`;
        loadAndCacheAudio(audioUrl, cacheKey, 'high');
      }
    });

  } catch (e) {
    console.error("Precache amounts TTS failed", e);
  }
};

let lastSpokenText = "";
let lastSpokenTime = 0;

export const speakNumber = (num, isCurrency = false, partnerName = "", customTemplate = "") => {
  if (localStorage.getItem('pos_tts_mode') === 'off') return;
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;
  try {
    // Clean partner name: ignore defaults like "Khách lẻ"
    const cleanPartner = (partnerName || "").trim();
    const isRealPartner = cleanPartner && 
                         cleanPartner.toLowerCase() !== "khách lẻ" && 
                         cleanPartner.toLowerCase() !== "khách vãng lai" && 
                         cleanPartner.toLowerCase() !== "ncc vãng lai";
    const partnerDisplay = isRealPartner ? cleanPartner : "";

    let viText = "";
    if (typeof num === "string" && isNaN(Number(num))) {
      viText = num;
      if (partnerDisplay) {
        if (viText.includes("{partner}")) {
          viText = viText.replace(/{partner}/gi, partnerDisplay);
        } else if (viText.includes("{customer}")) {
          viText = viText.replace(/{customer}/gi, partnerDisplay);
        } else {
          viText = viText.replace(/quý khách/gi, partnerDisplay);
        }
      } else {
        viText = viText.replace(/\{partner\}/g, "quý khách").replace(/\{customer\}/g, "quý khách");
      }
    } else {
      viText = numberToViText(num);
      if (isCurrency) {
        const disablePartnerTemplate = localStorage.getItem("pos_tts_disable_partner_template") === "true";
        const finalPartnerDisplay = disablePartnerTemplate ? "" : partnerDisplay;
        const template = customTemplate
          ? customTemplate
          : (finalPartnerDisplay
              ? (localStorage.getItem("pos_tts_currency_partner_template") || "số tiền của {partner} là {amount} đồng")
              : (localStorage.getItem("pos_tts_currency_template") || "số tiền của quý khách là {amount} đồng"));
          
        viText = template
          .replace("{amount}", viText)
          .replace(/{partner}/gi, finalPartnerDisplay || "quý khách")
          .replace(/{customer}/gi, finalPartnerDisplay || "quý khách");
      }
    }

    const now = Date.now();
    if (viText === lastSpokenText && now - lastSpokenTime < 500) {
      return;
    }
    lastSpokenText = viText;
    lastSpokenTime = now;

    const rate = parseFloat(localStorage.getItem("pos_speech_rate") || "1.4");
    const pitch = localStorage.getItem("pos_speech_pitch") || "0";
    const selectedVoiceName = localStorage.getItem("pos_selected_voice") || "edge-vi-female";

    const baseUrl = getDynamicBaseUrl();
    let voiceParam = 'google';
    if (selectedVoiceName === 'edge-vi-female' || selectedVoiceName === 'edge-vi-male') {
      voiceParam = selectedVoiceName;
    }
    
    const cacheKey = `${voiceParam}_${rate}_${pitch}_${viText}`;
    const audioUrl = `${baseUrl.replace(/\/+$/, '')}/api/tts?text=${encodeURIComponent(viText)}&voice=${voiceParam}&rate=${rate}&pitch=${encodeURIComponent(pitch)}`;

    const playWithTraditionalAudio = async () => {
      try {
        const resBlob = await axios.get(audioUrl, { responseType: 'blob' });
        const blobUrl = URL.createObjectURL(resBlob.data);
        const audio = new Audio(blobUrl);
        activeTraditionalAudio = audio;
        try {
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'none';
          }
        } catch {}
        audio.playbackRate = rate;
        audio.onended = () => {
          if (activeTraditionalAudio === audio) activeTraditionalAudio = null;
          try {
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
          } catch {}
          URL.revokeObjectURL(blobUrl);
        };
        audio.play().catch(err => {
          if (activeTraditionalAudio === audio) activeTraditionalAudio = null;
          console.error("Local backend TTS play failed...", err);
          URL.revokeObjectURL(blobUrl);
        });
      } catch (err) {
        console.error("Traditional Audio playback failed:", err);
      }
    };

    const cached = ttsAudioCache[cacheKey];
    if (cached) {
      if (cached instanceof Promise) {
        return cached.then(buffer => {
          if (buffer) {
            return playAudioBuffer(buffer, rate);
          } else {
            return playWithTraditionalAudio();
          }
        }).catch(() => {
          return playWithTraditionalAudio();
        });
      } else {
        return playAudioBuffer(cached, rate);
      }
    } else {
      return loadAndCacheAudio(audioUrl, cacheKey, 'high').then(buffer => {
        if (buffer) {
          return playAudioBuffer(buffer, rate);
        } else {
          return playWithTraditionalAudio();
        }
      }).catch(() => {
        return playWithTraditionalAudio();
      });
    }

  } catch (e) {
    console.error("Speech synthesis failed", e);
  }
};

/**
 * Play a sequence of phrases sequentially (e.g. [product_alias, quantity])
 * ensuring each item hits precache independently and plays one after another with 0 latency.
 */
let currentSequenceId = 0;

export const speakAudioSequence = async (items = []) => {
  if (localStorage.getItem('pos_tts_mode') === 'off') return;
  if (localStorage.getItem('pos_lite_sounds_muted') === 'true') return;
  if (localStorage.getItem('pos_notifications_muted') === 'true') return;

  const validItems = items.filter(it => it !== null && it !== undefined && it !== "");
  if (validItems.length === 0) return;

  const seqId = ++currentSequenceId;
  const rate = parseFloat(localStorage.getItem("pos_speech_rate") || "1.4");
  const pitch = localStorage.getItem("pos_speech_pitch") || "0";
  const selectedVoiceName = localStorage.getItem("pos_selected_voice") || "edge-vi-female";
  const baseUrl = getDynamicBaseUrl();
  let voiceParam = 'google';
  if (selectedVoiceName === 'edge-vi-female' || selectedVoiceName === 'edge-vi-male') {
    voiceParam = selectedVoiceName;
  }

  // Pre-resolve all texts and buffers in parallel with gap metadata
  const parsedItems = validItems.map((item, idx) => {
    let text = "";
    let customGap = undefined;
    let isNumeric = false;

    if (typeof item === "object" && item !== null && "text" in item) {
      text = typeof item.text === "number" || !isNaN(Number(item.text)) ? numberToViText(item.text) : item.text.toString().trim();
      customGap = item.gap;
      isNumeric = typeof item.text === "number" || !isNaN(Number(item.text));
    } else if (typeof item === "number" || !isNaN(Number(item))) {
      text = numberToViText(item);
      isNumeric = true;
    } else {
      text = item.toString().trim();
    }
    return { text, customGap, isNumeric };
  }).filter(it => Boolean(it.text));

  if (parsedItems.length === 0) return;

  const buffers = await Promise.all(parsedItems.map(async item => {
    const { text, customGap, isNumeric } = item;
    const cacheKey = `${voiceParam}_${rate}_${pitch}_${text}`;
    const audioUrl = `${baseUrl.replace(/\/+$/, '')}/api/tts?text=${encodeURIComponent(text)}&voice=${voiceParam}&rate=${rate}&pitch=${encodeURIComponent(pitch)}`;

    let buffer = ttsAudioCache[cacheKey];
    if (buffer instanceof Promise) {
      buffer = await buffer.catch(() => null);
    }
    if (!buffer) {
      buffer = await loadAndCacheAudio(audioUrl, cacheKey, 'high').catch(() => null);
    }
    return { text, customGap, isNumeric, buffer, audioUrl };
  }));

  if (seqId !== currentSequenceId) return;

  // Check if all items are successfully decoded as AudioBuffers for continuous Web Audio scheduling
  const allBuffered = buffers.every(b => b.buffer);

  const rawGap = parseFloat(localStorage.getItem("pos_speech_gap") || "150");
  const defaultGapSeconds = (isNaN(rawGap) ? 150 : Math.max(0, rawGap)) / 1000;

  if (allBuffered) {
    const ctx = getAudioContext();
    let startTime = ctx.currentTime + 0.01;

    return new Promise((resolve) => {
      let completedCount = 0;
      for (let i = 0; i < buffers.length; i++) {
        if (seqId !== currentSequenceId) {
          resolve();
          return;
        }
        const { buffer, customGap, isNumeric } = buffers[i];
        const nextItem = buffers[i + 1];

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = rate;
        source.connect(ctx.destination);
        activeBufferSources.add(source);
        source.onended = () => {
          activeBufferSources.delete(source);
          completedCount++;
          if (completedCount >= buffers.length) {
            resolve();
          }
        };
        source.start(startTime);

        // Gap calculation: If current item is a number and next item is a unit/noun, make transition tight (20ms)
        let stepGap = defaultGapSeconds;
        if (customGap !== undefined) {
          stepGap = customGap;
        } else if (isNumeric && nextItem && !nextItem.isNumeric) {
          // Tight transition between quantity and unit (20ms instead of 150ms)
          stepGap = 0.02;
        }

        const duration = buffer.duration / rate;
        startTime += duration + stepGap;
      }
    });
  } else {
    // Fallback: sequential playback
    for (const { text, buffer, audioUrl } of buffers) {
      if (seqId !== currentSequenceId) break;

      if (buffer) {
        await new Promise((resolve) => {
          try {
            const ctx = getAudioContext();
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = rate;
            source.connect(ctx.destination);
            activeBufferSources.add(source);
            source.onended = () => {
              activeBufferSources.delete(source);
              resolve();
            };
            source.start(0);
          } catch (err) {
            resolve();
          }
        });
      } else {
        await new Promise((resolve) => {
          try {
            const audio = new Audio(audioUrl);
            activeTraditionalAudio = audio;
            audio.playbackRate = rate;
            audio.onended = () => {
              if (activeTraditionalAudio === audio) activeTraditionalAudio = null;
              resolve();
            };
            audio.onerror = () => {
              if (activeTraditionalAudio === audio) activeTraditionalAudio = null;
              resolve();
            };
            audio.play().catch(() => resolve());
          } catch (e) {
            resolve();
          }
        });
      }
    }
  }
};


