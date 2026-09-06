import React, { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, forwardRef } from "react";
const i = React;
import axios from "axios";
const M = axios;
const Vn = axios;
import { useQueryClient } from "@tanstack/react-query";
const zl = useQueryClient;
const ci = useQueryClient;
import { useLocation } from "react-router-dom";
const Il = useLocation;
const bd = useLocation;
import toast from "react-hot-toast";
const Ve = toast;
const At = toast;
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion as x, useMotionValue as In, useSpring as Dn, MotionConfig as ro, AnimatePresence as Ws } from "framer-motion";
const P = Ws;
const fd = ro;
import { 
  ReceiptText as ReceiptTextIcon, FileText as FileTextIcon, Copy as Pn, Trash2 as so, User as Qn, X as Xn, 
  Phone as Jn, MapPin as Yn, Plus as Zn, ChevronRight as no, FileText as ei, Pause as io, ChevronLeft as lo, 
  Users as oo, History as ti, Menu as co, Bot as En, Eye as po, Tv as qr, Volume2 as la, ShoppingCart as uo, 
  Bell as mo, PanelRight as xo, PanelBottom as ho, TrendingUp as bo, Satellite as go, Coins as Rs, Zap as fo, 
  Search as yo, PackageX as vo, TriangleAlert as As, Package as ko, RefreshCcw as wo, RotateCcw as jo, 
  TrendingDown as _o, CircleAlert as No, Droplets as Co, Check as Os, Sparkles as Es, Activity as So, 
  Sprout as To, Wallet as zo, Truck as Io, Banknote as Do, CreditCard as Po, ArrowLeftRight as Eo, 
  ArrowRight as qo, ShoppingBag as Mo, Save as Wo, Printer as Ro, Clock as Ao, LoaderCircle as ai, 
  Leaf as ri, BookOpen as Oo, ReceiptText as Lo, BadgePercent as $o, HandCoins as Ho, RotateCw as Ko, 
  Minus as Go, VolumeX as Uo, Camera as Bo, Calendar as Fo, CircleCheck as Vo, PackageSearch as Qo, 
  ExternalLink as Xo, EyeOff as Jo, Bone as Yo, Settings as SetIcon, MessageSquareQuote as MsgQuote, 
  Music as MuIcon, Radio as RadioIcon, Keyboard as KeybIcon, Sliders as SlidersIcon, Palette 
} from "lucide-react";

// Lucide icon & UI component aliases used across POS
const Comp_fd = ro;
const Comp_ke = Xn;
const Comp_ai = ai;
const Comp_pa = so;
const Comp_ei = ei;
const Comp_jt = io;
const Comp_qs = lo;
const Comp_jd = oo;
const Comp_co = co;
const Comp_la = la;
const Comp_uo = uo;
const Comp_mo = mo;
const Comp_xo = xo;
const Comp_ho = ho;
const Comp_da = As;
const Comp_ca = ko;
const Comp_oa = wo;
const Comp_ti = jo;
const Comp_qo = qo;
const Comp_ri = ri;
const Comp_ua = ti;
const Comp_pi = zo;
const Comp_ui = Go;
const Comp_u_t = Io;
const Comp_u_d = FileTextIcon;

const Ir = Qn;
const Gs = yo;
const En_Icon = En;
const As_Icon = As;
const Zn_Icon = Zn;
const Bo_Icon = Bo;
const Es_Icon = Es;
const Ao_Icon = Ao;
const Xn_Icon = Xn;

const TvMonitorIcon = qr;
const SatelliteIcon = go;
const Ln = qr;
const Ot = Zn;
const Dr = no;
const $s = po;
const On = Jo;
const Ja = Ao;
const Hs = Oo;
const Ks = Lo;
const Va = zo;
const yd = Yo;
const Qa = ko;
const _t = Io;
const vd = Fo;
const zr = Vo;
const Us = Yn;
const Mr = Jn;
const kd = Qo;
const wd = Xo;
const Xa = wo;
const Nd = fo;
const Pr = vo;
const Ms = jo;
const $n = _o;
const Cd = No;
const Sd = Co;
const Hn = Os;
const Kn = So;
const Gn = To;
const ca = ei;
const Un = ai;
const Er = Wo;
const Fa = Ro;
const Td = $o;
const Bn = Eo;
const zd = ri;
const Id = Ho;
const Dd = Ko;
const ua = ti;
const oa = Rs;
const Rn = async v => await v();
const Ts = async v => await v();
const An = ProductEditModal;
const Wn = PartnerEditModal;
const Pd = PartnerHistoryModal;

import { DEFAULT_SETTINGS as Gl, DEFAULT_SETTINGS as Tr } from "@/lib/settings";
import PrintTemplate from "@/components/PrintTemplate";
const Ul = PrintTemplate;
const Mn = PrintTemplate;
import TaxCalculatorModal from "@/components/TaxCalculatorModal";
const Bl = TaxCalculatorModal;
import PartnerEditModal from "@/components/PartnerEditModal";
const Fl = PartnerEditModal;
import PartnerInfoHoverCard from "@/components/PartnerInfoHoverCard";
const Vl = PartnerInfoHoverCard;
import HeavyClock from "@/components/HeavyClock";
const Ql = HeavyClock;
import DailyOrderHistoryModal from "@/components/DailyOrderHistoryModal";
const Xl = DailyOrderHistoryModal;
import OrderEditPopup from "@/components/OrderEditPopup";
const OrderEditModal = OrderEditPopup;
import QuickDebtModal from "@/components/QuickDebtModal";
const Jl = QuickDebtModal;
import QuickVoucherModal from "@/components/QuickVoucherModal";
const Yl = QuickVoucherModal;
import QuickAuditPopout from "@/components/QuickAuditPopout";
const Zl = QuickAuditPopout;
import CustomSelect from "@/components/CustomSelect";
const zn = CustomSelect;
import MarqueeText from "@/components/MarqueeText";
const Ps = MarqueeText;
import { useProductData as eo, usePartnerData as to, useShippingSummary as ao } from "@/queries/useProductData";
const od = eo;
const dd = to;
const cd = ao;
import { 
  cn as c, formatNumber as z, formatCurrency as lt, formatDate as ot, removeAccents as xt, 
  speakNumber as ht, speakAudioSequence, stopAllTTS, precacheAmounts as yl, precacheCommonTTS as Ss, 
  normalizeUOM as Ae, smartSortItems as Tn, formatDebt as vl, playSuccessSound as Is, 
  playErrorSound as Sl, playPopSound as Ds, playTabSound as zs, playTypingSound as playTypingSoundUtil, 
  playAddToCartSound 
} from "@/lib/utils";
import Portal from "@/components/Portal";
const Fn = Portal;
const Ee = Portal;
import CustomDatePicker from "@/components/CustomDatePicker";
import POSHistoryPanel from "@/components/POSHistoryPanel";
import PartnerHistoryModal from "@/components/PartnerHistoryModal";
import ProductEditModal from "@/components/ProductEditModal";
import Toast from "@/components/Toast";
const jl = Toast;
import ConfirmModal from "@/components/ConfirmModal";
const Cl = ConfirmModal;
import QuickEditModal from "@/components/QuickEditModal";
const Nl = QuickEditModal;
import logo from "@/assets/logo.png";
const kl = logo;
const _l = () => null;

// Modal & dialog aliases used across POS
const Comp_td = jl;
const Comp_ed = Bl;
const Comp_nd = Jl;
const Comp_id = Yl;
const Comp_ad = _l;
const Comp_rd = Nl;
const Comp_sd = Cl;
const Comp_ld = Zl;
const Comp_ac = _l;
const Comp_zn = zn;

const Ls = (v, N) => {
    let C = M.defaults.baseURL || "http://localhost:3579";
    const rate = localStorage.getItem("pos_speech_rate") || "1.4";
    const pitch = localStorage.getItem("pos_speech_pitch") || "0";
    return C.includes("localhost") && typeof window < "u" && window.location && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && !window.location.hostname.includes("tauri") && (C = C.replace("localhost", window.location.hostname)), `${C.replace(/\/+$/, "")}/api/tts?text=${encodeURIComponent(v)}&voice=${N}&rate=${rate}&pitch=${encodeURIComponent(pitch)}`;
  },
  qn = async (v, N) => {
    if (!v || v.length === 0) return;
    window.currentPackingQueue && window.currentPackingQueue.stop();
    
    let isStopped = false;
    window.currentPackingQueue = {
      stop: () => {
        isStopped = true;
        stopAllTTS();
        window.currentPackingQueue = null;
      }
    };

    const S = localStorage.getItem("pos_tts_cart_speech_order") || "name_first";
    const itemGap = parseFloat(localStorage.getItem("pos_speech_gap") || "150");

    await speakAudioSequence(["Soạn hàng"]);
    if (isStopped) return;
    await new Promise(res => setTimeout(res, Math.max(100, itemGap)));

    for (let i = 0; i < v.length; i++) {
      if (isStopped) break;
      const B = v[i];
      const ue = B.quantity || 0;
      const Ie = N.find(Le => Le.id === B.product_id) || B;
      const dt = (Ie && Ie.alias && Ie.alias.trim()) || (B.alias && B.alias.trim()) || B.product_name;

      const tokens = [];
      if (S === "qty_first") {
        if (ue) tokens.push(ue);
        if (dt) tokens.push(dt);
      } else {
        if (dt) tokens.push(dt);
        if (ue) tokens.push(ue);
      }

      await speakAudioSequence(tokens);
      if (isStopped) break;
      await new Promise(res => setTimeout(res, Math.max(150, itemGap * 1.5)));
    }

    if (!isStopped) {
      await speakAudioSequence(["Đã soạn xong"]);
    }
    if (window.currentPackingQueue && window.currentPackingQueue.stop) {
      window.currentPackingQueue = null;
    }
  };

function POSPage({
  onToggleTheme: v,
  currentTheme: N
}) {
  const [C, X] = i.useState(!1),
    [xe, W] = i.useState(!1),
    [pe, we] = i.useState([]),
    [Oe, Qe] = i.useState(!1),
    [te, at] = i.useState(""),
    B = new Set(["co", "thuoc", "phan", "bon", "sau", "ray", "benh", "duong", "chai", "goi", "can", "xit", "tri", "giet", "diet", "tru", "hop", "thung", "bao", "kg", "gr", "g", "ml", "l", "lit", "x", "loai", "hieu", "syngenta", "hop tri", "basf"]),
    ue = t => xt(String(t || "")).toLowerCase().trim(),
    je = t => {
      if (!t) return {
        clean: "",
        tokens: new Set(),
        codes: new Set(),
        volumes: new Set(),
        npk: null,
        coreWords: []
      };
      let a = ue(t),
        r = null;
      const s = a.match(/\b(\d{1,2})[\-.](\d{1,2})[\-.](\d{1,2})\b/);
      s && (r = `${s[1]}-${s[2]}-${s[3]}`, a = a.replace(s[0], " ")), a = a.replace(/\bx\s*\d+\b/gi, " ");
      const n = new Set(),
        l = /\b(\d+(?:\.\d+)?)\s*(ml|l|lit|kg|gr|g|cc)\b/g;
      let d;
      for (; (d = l.exec(a)) !== null;) {
        let b = d[2] === "lit" ? "l" : d[2] === "gr" ? "g" : d[2];
        n.add(`${d[1]}${b}`);
      }
      const o = a.split(/[\s\-_,./+*()[\]{}]+/).filter(Boolean),
        u = new Set(),
        h = [];
      return o.forEach(b => {
        /^[a-z]+\d+[a-z]*$/i.test(b) || /^\d+[a-z]+$/i.test(b) ? /^\d+(ml|l|lit|kg|gr|g|cc)$/i.test(b) ? n.add(b.toLowerCase()) : u.add(b.toLowerCase()) : b.length > 1 && !B.has(b) && !/^\d+$/.test(b) && h.push(b.toLowerCase());
      }), {
        clean: ue(t),
        tokens: new Set(o),
        codes: u,
        volumes: n,
        npk: r,
        coreWords: h
      };
    },
    Ie = (t, a) => {
      if (t === a) return !0;
      if (t.length >= 3 && a.length >= 3) {
        if (t.includes(a) || a.includes(t)) return !0;
        const r = Math.min(t.length, a.length);
        if (Math.max(t.length, a.length) - r <= 2) {
          let n = 0;
          for (; n < r && t[n] === a[n];) n++;
          if (n >= 4 || r <= 4 && n >= 3) return !0;
        }
      }
      return !1;
    },
    dt = (t, a) => {
      if (!a) return 0;
      const r = a.name || "",
        s = a.alias || "",
        n = a.code || "",
        l = `${r} ${s} ${n}`,
        d = je(l);
      if (t.clean === d.clean || t.clean === ue(r)) return 20;
      let o = 0,
        u = !1;
      if (t.npk && d.npk) {
        if (t.npk === d.npk) o += 6, u = !0;else return 0;
      } else t.npk && !d.npk && (o -= 2);
      let h = 0;
      if (t.coreWords.forEach(w => {
        d.coreWords.some(U => Ie(w, U)) && (h += 1);
      }), h > 0 ? (o += h * 3.5, u = !0) : d.coreWords.length > 0 && t.coreWords.length > 0 && (o -= 2), !u) return 0;
      t.codes.forEach(w => {
        d.codes.has(w) ? o += 3 : d.codes.size > 0 && (o -= 1);
      }), t.volumes.forEach(w => {
        d.volumes.has(w) ? o += 2 : d.volumes.size > 0 && (o -= 1);
      });
      let b = 0;
      t.tokens.forEach(w => {
        d.tokens.has(w) && (b += 1);
      }), b > 0 && (o += b / Math.max(t.tokens.size, d.tokens.size) * 1.5);
      const S = ue(r);
      return (t.clean.includes(S) || S.includes(t.clean)) && (o += 2), Math.max(0, o);
    },
    Le = (t, a) => {
      if (!t || !a || a.length === 0) return null;
      const r = je(t);
      let s = null,
        n = 0;
      for (const l of a) {
        const d = dt(r, l);
        d > n && (n = d, s = l);
      }
      return n >= 0.5 ? s : null;
    },
    Nt = t => {
      const a = Array.from(t.target.files || []);
      if (a.length === 0) return;
      const r = a.map(s => new Promise(n => {
        const l = new FileReader();
        l.onloadend = () => n(l.result), l.readAsDataURL(s);
      }));
      Promise.all(r).then(s => {
        we(n => [...n, ...s]);
      });
    },
    Lt = async () => {
      if (pe.length !== 0) {
        Qe(!0);
        try {
          const t = await M.post("/api/purchase/scan-invoice", {
            images: pe,
            api_key: te || J?.gemini_api_key || ""
          });
          te && te !== J?.gemini_api_key && (await M.post("/api/settings", {
            gemini_api_key: te
          }), Na(s => ({
            ...s,
            gemini_api_key: te
          })));
          const a = t.data || [];
          if (a.length === 0) {
            G({
              message: "Không phát hiện được sản phẩm nào trong hóa đơn.",
              type: "error"
            });
            return;
          }
          const r = [...y];
          a.forEach(s => {
            const n = Le(s.product_name, T),
              l = Math.max(1, parseFloat(s.quantity) || 1);
            if (n) {
              const d = (s.unit || "").trim().toLowerCase(),
                o = (n.unit || "").trim().toLowerCase(),
                u = (n.secondary_unit || "").trim().toLowerCase();
              let h = l,
                b = l / (n.multiplier || 1);
              u && d && (d === u || d.includes(u) || u.includes(d)) && (h = l * (n.multiplier || 1), b = l);
              let S = 0;
              const w = R && R[n.id] !== void 0 ? R[n.id] : void 0,
                U = (Te || localStorage.getItem("unified_pos_mode") || "Retail") === "Wholesale" ? n.bulk_price || n.sale_price || 0 : n.sale_price || 0;
              w !== void 0 ? S = w : n.bulk_quantity > 0 && h >= n.bulk_quantity && n.bulk_price ? S = n.bulk_price : S = U, S <= 0 && s.price && parseFloat(s.price) > 0 && (S = parseFloat(s.price));
              const L = r.findIndex(ce => ce.product_id === n.id && ce.price === S);
              L > -1 ? (r[L].quantity += h, r[L].secondary_qty = r[L].quantity / (n.multiplier || 1)) : r.unshift({
                cartId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                product_id: n.id,
                product_name: n.name,
                unit: n.unit,
                secondary_unit: n.secondary_unit,
                multiplier: n.multiplier || 1,
                price: S,
                quantity: h,
                secondary_qty: b,
                cost_price: n.cost_price,
                latest_cost_price: n.latest_cost_price,
                stock: n.stock,
                is_combo: n.is_combo,
                active_ingredient: n.active_ingredient,
                latest_audit: n.latest_audit,
                latest_stock_entry: n.latest_stock_entry,
                ai_scanned: !0,
                ai_original_name: s.product_name,
                ai_matched_status: "matched"
              });
            } else {
              const d = s.price && parseFloat(s.price) > 0 ? parseFloat(s.price) : 0;
              r.unshift({
                cartId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                product_id: null,
                product_name: s.product_name,
                unit: s.unit || "Cái",
                secondary_unit: null,
                multiplier: 1,
                price: d,
                quantity: l,
                secondary_qty: l,
                cost_price: 0,
                latest_cost_price: 0,
                stock: 0,
                is_combo: !1,
                active_ingredient: null,
                ai_scanned: !0,
                ai_original_name: s.product_name,
                ai_matched_status: "unmatched"
              });
            }
          }), H(r), X(!1), we([]), Is?.(), G({
            message: `Quét AI thành công! Đã thêm ${a.length} sản phẩm vào giỏ hàng.`,
            type: "success"
          });
        } catch (t) {
          console.error(t), G({
            message: t.response?.data?.error || "Có lỗi xảy ra khi quét hóa đơn.",
            type: "error"
          });
        } finally {
          Qe(!1);
        }
      }
    },
    {
      data: he,
      isLoading: $t
    } = od(),
    {
      data: _e,
      isLoading: Xe
    } = dd(),
    {
      data: j
    } = cd(),
    E = ci(),
    D = j?.total || 0,
    T = Array.isArray(he) ? he : (Array.isArray(he?.items) ? he.items : (Array.isArray(he?.products) ? he.products : [])),
    Y = Array.isArray(_e) ? _e : (Array.isArray(_e?.items) ? _e.items : (Array.isArray(_e?.partners) ? _e.partners : [])),
    be = (t, a) => {
      const r = localStorage.getItem("pos_order_tabs"),
        s = localStorage.getItem("pos_active_tab_id");
      if (r && s) try {
        const n = JSON.parse(r),
          l = JSON.parse(s),
          d = n.find(o => o.id === l);
        if (d && d[t] !== void 0) return d[t];
      } catch {}
      return a;
    },
    [Z, ae] = i.useState(""),
    [bt, rt] = i.useState(!0),
    [gt, Ht] = i.useState("add"),
    [fe, _] = i.useState(() => {
      const t = localStorage.getItem("pos_order_tabs");
      if (t) try {
        return JSON.parse(t);
      } catch (a) {
        console.error("Failed to parse saved POS tabs:", a);
      }
      return [{
        id: 1,
        name: "Đơn 1",
        cart: [],
        selectedPartner: null,
        note: "",
        amountPaid: 0,
        cashGiven: 0,
        paymentMethod: (localStorage.getItem("unified_pos_mode") || "Retail") === "Wholesale" ? "Debt" : "Cash"
      }];
    }),
    [g, f] = i.useState(() => {
      const t = localStorage.getItem("pos_active_tab_id");
      return t ? JSON.parse(t) : 1;
    }),
    [ne, me] = i.useState(() => {
      const t = localStorage.getItem("pos_pinned_scan_tab_id");
      return t ? JSON.parse(t) : 1;
    }),
    qe = i.useRef(""),
    ma = i.useRef(0),
    A = i.useRef(null),
    ie = i.useRef({}),
    [y, H] = i.useState(() => be("cart", [])),
    [Je, rc] = i.useState(() => {
      const t = {
          color1: "#ffffff",
          color2: "#f8fafc",
          opacity: 0.8,
          isGradient: !0,
          blur: 20,
          radius: 2.5,
          shadow: 20,
          accent: "#10b981",
          headerColor: "#ffffff",
          headerOpacity: 0.4,
          bgColor1: "#ecfdf5",
          bgColor2: "#f0fdf4",
          dropdownBg: "#ffffff",
          dropdownAccent: "#10b981"
        },
        a = localStorage.getItem("pos_new_style");
      if (!a) return t;
      try {
        const r = JSON.parse(a);
        return {
          ...t,
          ...r
        };
      } catch {
        return t;
      }
    }),
    [sc, nc] = i.useState(!1);
  i.useRef(null);
  const Wr = i.useRef(null),
    Rr = i.useRef(null),
    [ic, lc] = i.useState("themes"),
    [hi, Bs] = i.useState([]),
    [Ya, oc] = i.useState(() => localStorage.getItem("pos_gpu_disabled") === "true"),
    [ft, bi] = i.useState(() => localStorage.getItem("pos_tts_mode") || "female"),
    [Za, gi] = i.useState(() => localStorage.getItem("pos_tts_read_product") !== "false"),
    [er, fi] = i.useState(() => localStorage.getItem("pos_tts_read_qty") !== "false"),
    [xa, yi] = i.useState(() => localStorage.getItem("pos_tts_read_total") !== "false"),
    [ha, vi] = i.useState(() => localStorage.getItem("pos_tts_read_thanks") !== "false"),
    tr = () => {
      stopAllTTS();
    },
    Ar = t => {
      bi(t);
      localStorage.setItem("pos_tts_mode", t);
      tr();
      if (t === "female") {
        Fs("edge-vi-female");
        localStorage.setItem("pos_selected_voice", "edge-vi-female");
      } else if (t === "male") {
        Fs("edge-vi-male");
        localStorage.setItem("pos_selected_voice", "edge-vi-male");
      }
      setTimeout(() => Ss(T), 50);
    },
    [ki, Fs] = i.useState(() => {
      const t = localStorage.getItem("pos_selected_voice") || "edge-vi-female";
      return t === "native-vi" || !t.startsWith("edge") && t !== "google" ? (localStorage.setItem("pos_selected_voice", "edge-vi-female"), "edge-vi-female") : t;
    });
  i.useEffect(() => {
    Ss();
  }, []), i.useEffect(() => {
    T && T.length > 0 && Ss(T);
  }, [T]);
  const [Or, wi] = i.useState(() => parseFloat(localStorage.getItem("pos_speech_rate") || "1.4")),
    ji = t => {
      const a = parseFloat(t.target.value);
      wi(a), localStorage.setItem("pos_speech_rate", a.toString()), setTimeout(() => Ss(T), 100);
    },
    [speechPitch, setSpeechPitch] = i.useState(() => parseInt(localStorage.getItem("pos_speech_pitch") || "0")),
    handlePitchChange = t => {
      const val = parseInt(t.target.value);
      setSpeechPitch(val);
      localStorage.setItem("pos_speech_pitch", val.toString());
      setTimeout(() => Ss(T), 100);
    },
    [speechGap, setSpeechGap] = i.useState(() => parseInt(localStorage.getItem("pos_speech_gap") || "150")),
    handleGapChange = t => {
      const val = parseInt(t.target.value);
      setSpeechGap(val);
      localStorage.setItem("pos_speech_gap", val.toString());
    },
    [Lr, ba] = i.useState(!1),
    [ar, Ct] = i.useState(!1),
    [ga, Vs] = i.useState(() => localStorage.getItem("pos_keep_order_after_save") === "true"),
    [blockTabPrice, setBlockTabPrice] = i.useState(() => localStorage.getItem("pos_block_tab_unit_price") === "true"),
    [typingSoundEnabled, setTypingSoundEnabled] = i.useState(() => localStorage.getItem("pos_typing_sound_enabled") !== "false"),
    [soundThemeSuccess, setSoundThemeSuccess] = i.useState(() => localStorage.getItem("pos_sound_theme_success") || "chime"),
    [soundThemeAction, setSoundThemeAction] = i.useState(() => localStorage.getItem("pos_sound_theme_action") || "pop_bubble"),
    [soundThemeCartAdd, setSoundThemeCartAdd] = i.useState(() => localStorage.getItem("pos_sound_theme_cart_add") || "barcode_beep"),
    [soundThemeTyping, setSoundThemeTyping] = i.useState(() => localStorage.getItem("pos_sound_theme_typing") || "mechanical"),
    [soundThemeError, setSoundThemeError] = i.useState(() => localStorage.getItem("pos_sound_theme_error") || "buzz_low"),
    [showHotkeysGuide, setShowHotkeysGuide] = i.useState(() => localStorage.getItem("pos_show_hotkeys_guide") === "true"),
    [showMascotCustomizer, setShowMascotCustomizer] = i.useState(false),
    [mascotWatermarkVisible, setMascotWatermarkVisible] = i.useState(() => localStorage.getItem("pos_mascot_watermark_visible") !== "false"),
    [mascotWatermarkPos, setMascotWatermarkPos] = i.useState(() => localStorage.getItem("pos_mascot_watermark_pos") || "bottom-right"),
    [mascotWatermarkScale, setMascotWatermarkScale] = i.useState(() => parseFloat(localStorage.getItem("pos_mascot_watermark_scale") || "100")),
    [mascotWatermarkOpacity, setMascotWatermarkOpacity] = i.useState(() => parseFloat(localStorage.getItem("pos_mascot_watermark_opacity") || "15")),
    [mascotWatermarkRotate, setMascotWatermarkRotate] = i.useState(() => parseFloat(localStorage.getItem("pos_mascot_watermark_rotate") || "-6")),
    [mascotWatermarkOffsetX, setMascotWatermarkOffsetX] = i.useState(() => parseFloat(localStorage.getItem("pos_mascot_watermark_offset_x") || "10")),
    [mascotWatermarkOffsetY, setMascotWatermarkOffsetY] = i.useState(() => parseFloat(localStorage.getItem("pos_mascot_watermark_offset_y") || "10")),
    $r = i.useRef(null);
  i.useEffect(() => {
    const t = a => {
      $r.current && !$r.current.contains(a.target) && Ct(!1);
    };
    return ar && document.addEventListener("mousedown", t), () => document.removeEventListener("mousedown", t);
  }, [ar]);
  const [dc, cc] = i.useState("general"),
    Qs = i.useRef(null);
  i.useRef(null);
  const rr = ie;
  i.useEffect(() => {
    const t = a => {
      Qs.current && !Qs.current.contains(a.target) && ba(!1);
    };
    return Lr && document.addEventListener("mousedown", t), () => document.removeEventListener("mousedown", t);
  }, [Lr]);
  const [pc, uc] = i.useState(() => localStorage.getItem("pos_tts_currency_template") || "số tiền của quý khách là {amount} đồng"),
    [mc, xc] = i.useState(() => localStorage.getItem("pos_tts_currency_partner_template") || "số tiền của {partner} là {amount} đồng"),
    [hc, bc] = i.useState(() => {
      const saved = localStorage.getItem("pos_tts_thankyou_template");
      return saved && saved !== "Cảm ơn quý khách đã chọn Sáu Quý" ? saved : "Cảm ơn quý khách";
    }),
    [gc, fc] = i.useState(() => {
      const saved = localStorage.getItem("pos_tts_thankyou_partner_template");
      return saved && saved !== "Cảm ơn {partner} đã chọn Sáu Quý" ? saved : "Cảm ơn {partner}";
    }),
    [yc, vc] = i.useState(() => localStorage.getItem("pos_tts_enable_thankyou") !== "false"),
    [kc, wc] = i.useState(() => localStorage.getItem("pos_tts_disable_partner_template") === "true"),
    [jc, _c] = i.useState(() => localStorage.getItem("pos_tts_disable_partner_thankyou") === "true"),
    [Nc, Cc] = i.useState(() => localStorage.getItem("pos_tts_transfer_template") || "số tiền cần chuyển khoản là {amount} đồng"),
    [Sc, Tc] = i.useState(() => localStorage.getItem("pos_tts_transfer_partner_template") || "số tiền cần chuyển khoản của {partner} là {amount} đồng"),
    [zc, Ic] = i.useState(() => localStorage.getItem("pos_tts_disable_partner_transfer") === "true"),
    [Dc, Pc] = i.useState(() => localStorage.getItem("pos_tts_enable_cart_addition") !== "false"),
    [Ec, qc] = i.useState(() => localStorage.getItem("pos_tts_enable_cart_product_name") !== "false"),
    [Mc, Wc] = i.useState(() => localStorage.getItem("pos_tts_cart_speech_order") || "name_first"),
    [p, F] = i.useState(() => be("selectedPartner", null)),
    [st, Hr] = i.useState(null),
    [nt, Kr] = i.useState(null),
    [Ne, Kt] = i.useState("debt"),
    [sr, Gr] = i.useState(!1),
    [Xs, Js] = i.useState(!1),
    [yt, Ge] = i.useState(""),
    [Me, Ue] = i.useState(!1),
    [K, $e] = i.useState(() => be("note", "")),
    [oe, re] = i.useState(() => be("amountPaid", 0)),
    [V, Ye] = i.useState(() => be("cashGiven", 0)),
    [I, ge] = i.useState(() => be("paymentMethod", (localStorage.getItem("unified_pos_mode") || "Retail") === "Wholesale" ? "Debt" : "Cash")),
    [fa, Ur] = i.useState(null),
    [ya, Ys] = i.useState(null),
    [Be, Zs] = i.useState(!1),
    [Q, Gt] = i.useState(null),
    [le, Br] = i.useState(null),
    [customOrderDate, setCustomOrderDate] = i.useState(""),
    [isOrderDatePickerOpen, setIsOrderDatePickerOpen] = i.useState(!1),
    [Fr, nr] = i.useState(null),
    [Ce, Vr] = i.useState(0);
  i.useEffect(() => {
    (async () => {
      try {
        const t = await M.get("/api/orders?limit=1&page=1&type=Sale");
        t.data.items && t.data.items.length > 0 && Ys(t.data.items[0]);
      } catch (t) {
        console.error("Failed to fetch last order:", t);
      }
    })();
  }, []), i.useEffect(() => {
    _(t => {
      const a = t.find(r => r.id === g);
      return a && (a.cart !== y || a.selectedPartner !== p || a.note !== K || a.amountPaid !== oe || a.cashGiven !== V || a.paymentMethod !== I) ? t.map(r => r.id === g ? {
        ...r,
        cart: y,
        selectedPartner: p,
        note: K,
        amountPaid: oe,
        cashGiven: V,
        paymentMethod: I
      } : r) : t;
    });
  }, [g, y, p, K, oe, V, I]), i.useEffect(() => {
    localStorage.setItem("pos_order_tabs", JSON.stringify(fe));
  }, [fe]), i.useEffect(() => {
    localStorage.setItem("pos_active_tab_id", JSON.stringify(g));
  }, [g]), i.useEffect(() => {
    localStorage.setItem("pos_pinned_scan_tab_id", JSON.stringify(ne));
  }, [ne]), i.useEffect(() => {
    const t = a => {
      if (a.newValue) {
        if (a.key === "pos_order_tabs") try {
          const r = JSON.parse(a.newValue);
          _(r);
          const s = r.find(n => n.id === g);
          s && (JSON.stringify(s.cart) !== JSON.stringify(y) && H(s.cart || []), s.selectedPartner?.id !== p?.id && F(s.selectedPartner || null), s.note !== K && $e(s.note || ""), s.amountPaid !== oe && re(s.amountPaid || 0), s.cashGiven !== V && Ye(s.cashGiven || 0), s.paymentMethod !== I && ge(s.paymentMethod || "Cash"));
        } catch (r) {
          console.error("Error syncing storage across tabs:", r);
        } else if (a.key === "pos_active_tab_id") try {
          const r = JSON.parse(a.newValue);
          if (r !== g) {
            f(r);
            const s = localStorage.getItem("pos_order_tabs");
            if (s) {
              const l = JSON.parse(s).find(d => d.id === r);
              l && (H(l.cart || []), F(l.selectedPartner || null), $e(l.note || ""), re(l.amountPaid || 0), Ye(l.cashGiven || 0), ge(l.paymentMethod || "Cash"));
            }
          }
        } catch {} else if (a.key === "pos_pinned_scan_tab_id") try {
          const r = JSON.parse(a.newValue);
          r !== ne && me(r);
        } catch {}
      }
    };
    return window.addEventListener("storage", t), () => {
      window.removeEventListener("storage", t);
    };
  }, [g, y, p, K, oe, V, I, ne]);
  const Ut = bd(),
    [Fe, Qr] = i.useState(() => {
      const t = localStorage.getItem("held_invoices");
      return t ? JSON.parse(t) : [];
    }),
    [va, St] = i.useState(!1),
    [ka, en] = i.useState(!1),
    [Ze, _i] = i.useState(() => localStorage.getItem("pos_summary_layout_mode") || "sidebar"),
    [ir, Ni] = i.useState(() => localStorage.getItem("pos_save_notice_style") || "card"),
    Ci = () => {
      const t = Ze === "sidebar" ? "bottom" : "sidebar";
      _i(t), localStorage.setItem("pos_summary_layout_mode", t);
    },
    [Si, Xr] = i.useState(!1),
    [Ti, Bt] = i.useState(!1),
    [Rc, zi] = i.useState(!1),
    [Jr, Yr] = i.useState(() => {
      const t = localStorage.getItem("pos_bottom_summary_height");
      const parsed = t ? parseInt(t, 10) : 105;
      return Math.max(parsed, 96);
    }),
    [tn, an] = i.useState(!1),
    Ii = t => {
      t.preventDefault(), t.stopPropagation(), an(!0);
      const a = t.clientY,
        r = Jr,
        s = l => {
          const d = a - l.clientY,
            o = Math.min(Math.max(r + d, 96), 320);
          Yr(o);
        },
        n = () => {
          an(!1), window.removeEventListener("mousemove", s), window.removeEventListener("mouseup", n), Yr(l => (localStorage.setItem("pos_bottom_summary_height", l.toString()), l));
        };
      window.addEventListener("mousemove", s), window.addEventListener("mouseup", n);
    },
    [Se, Di] = i.useState(() => {
      try {
        const t = localStorage.getItem("pos_bubble_positions");
        return t ? JSON.parse(t) : {
          partner: {
            x: 0,
            y: 0
          },
          total: {
            x: 0,
            y: 0
          }
        };
      } catch {
        return {
          partner: {
            x: 0,
            y: 0
          },
          total: {
            x: 0,
            y: 0
          }
        };
      }
    }),
    rn = (t, a) => {
      Di(r => {
        let s = r[t].x + a.x,
          n = r[t].y + a.y;
        t === "partner" ? (s = Math.max(-20, Math.min(s, 800)), n = Math.max(-500, Math.min(n, 20))) : t === "total" && (s = Math.max(-800, Math.min(s, 20)), n = Math.max(-500, Math.min(n, 20)));
        const l = {
          ...r,
          [t]: {
            x: s,
            y: n
          }
        };
        return localStorage.setItem("pos_bubble_positions", JSON.stringify(l)), l;
      });
    },
    Zr = (t, a) => t.map(r => r.id === a ? {
      ...r,
      cart: y,
      selectedPartner: p,
      note: K,
      amountPaid: oe,
      cashGiven: V,
      paymentMethod: I
    } : r),
    es = t => {
      t !== g && _(a => {
        const r = Zr(a, g),
          s = r.find(n => n.id === t);
        return s && (H(s.cart), F(s.selectedPartner), $e(s.note), re(s.amountPaid), Ye(s.cashGiven), ge(s.paymentMethod), f(t)), r;
      });
    },
    Pi = () => {
      if (fe.length >= 5) {
        G({
          message: "Tối đa 5 đơn cùng lúc",
          type: "error"
        });
        return;
      }
      _(t => {
        const a = Zr(t, g),
          r = Math.max(...a.map(n => n.id), 0) + 1,
          s = {
            id: r,
            name: `Đơn ${r}`,
            cart: [],
            selectedPartner: null,
            note: "",
            amountPaid: 0,
            cashGiven: 0,
            paymentMethod: (localStorage.getItem("unified_pos_mode") || "Retail") === "Wholesale" ? "Debt" : "Cash"
          };
        return H(s.cart), F(s.selectedPartner), $e(s.note), re(s.amountPaid), Ye(s.cashGiven), ge(s.paymentMethod), f(r), [...a, s];
      });
    },
    Ei = (t, a) => {
      if (a.stopPropagation(), fe.length <= 1) {
        G({
          message: "Không thể đóng đơn cuối cùng",
          type: "error"
        });
        return;
      }
      _(r => {
        ie.current && delete ie.current[t];
        let s = Zr(r, g);
        if (s = s.filter(n => n.id !== t), g === t) {
          const n = s[s.length - 1];
          H(n.cart), F(n.selectedPartner), $e(n.note), re(n.amountPaid), Ye(n.cashGiven), ge(n.paymentMethod), f(n.id);
        }
        return ne === t && me(s[0].id), s;
      });
    },
    [sn, qi] = i.useState(78),
    [wa, nn] = i.useState(!1),
    [Mi, ja] = i.useState(!1),
    [Wi, _a] = i.useState(!1),
    [Ri, ts] = i.useState(!1),
    [lr, as] = i.useState(!1),
    [De, Ft] = i.useState(0),
    [We, rs] = i.useState(0),
    [R, or] = i.useState({}),
    [ln, Ai] = i.useState([]),
    [ss, ns] = i.useState(""),
    [J, Na] = i.useState(() => {
      const t = localStorage.getItem("ui_enable_smart_sorting");
      return {
        ...Tr,
        ui_enable_smart_sorting: t !== null ? t : Tr.ui_enable_smart_sorting
      };
    }),
    [dr, cr] = i.useState(!1),
    [pr, ur] = i.useState(!1),
    [on, dn] = i.useState(""),
    [is, G] = i.useState(null),
    [Te, Oi] = i.useState(() => localStorage.getItem("unified_pos_mode") || "Retail"),
    [m, He] = i.useState({
      product: null,
      quantity: 0,
      price: 0,
      secondary_qty: 0,
      name: ""
    }),
    [Tt, ct] = i.useState(null),
    [zt, ls] = i.useState(""),
    [It, Ca] = i.useState(0),
    [Li, os] = i.useState(!1),
    [ds, Sa] = i.useState(!1),
    [showFloatingMascot, setShowFloatingMascot] = i.useState(() => localStorage.getItem('ui_show_pos_mascot') !== 'false'),
    [animateMascot, setAnimateMascot] = i.useState(() => localStorage.getItem('ui_mascot_animate') === 'true'),
    [mascotConfig, setMascotConfig] = i.useState(() => {
      try {
        const saved = localStorage.getItem('pos_mascot_config');
        return saved ? JSON.parse(saved) : { x: 0, y: 0, scale: 1.1 };
      } catch {
        return { x: 0, y: 0, scale: 1.1 };
      }
    }),
    savePosMascotConfig = (newCfg) => {
      setMascotConfig(prev => {
        const updated = { ...prev, ...newCfg };
        localStorage.setItem('pos_mascot_config', JSON.stringify(updated));
        return updated;
      });
    },
    [Ta, $i] = i.useState(null),
    [cn, cs] = i.useState(1),
    [ps, vt] = i.useState(!1),
    [Hi, Vt] = i.useState(null),
    [Qt, Dt] = i.useState(!1),
    [pt, Xt] = i.useState(null),
    [Ki, za] = i.useState(null),
    [Gi, pn] = i.useState("Sale"),
    [Jt, un] = i.useState("Sale");

  const undoStackRef = i.useRef([]),
    redoStackRef = i.useRef([]),
    lastStateSnapshotRef = i.useRef(null),
    isUndoingRef = i.useRef(!1);

  i.useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = !1;
      return;
    }
    const currentSnapshot = {
      cart: y,
      partner: p,
      note: K,
      amountPaid: oe,
      cashGiven: V,
      paymentMethod: I,
      orderId: Q,
      workingProduct: m
    };
    if (lastStateSnapshotRef.current) {
      const prev = lastStateSnapshotRef.current;
      const cartDiff = JSON.stringify(prev.cart) !== JSON.stringify(currentSnapshot.cart);
      const partnerDiff = prev.partner?.id !== currentSnapshot.partner?.id;
      const noteDiff = prev.note !== currentSnapshot.note;
      const orderIdDiff = prev.orderId !== currentSnapshot.orderId;
      if (cartDiff || partnerDiff || noteDiff || orderIdDiff) {
        undoStackRef.current.push(prev);
        if (undoStackRef.current.length > 50) {
          undoStackRef.current.shift();
        }
        redoStackRef.current = [];
      }
    }
    lastStateSnapshotRef.current = currentSnapshot;
  }, [y, p, K, oe, V, I, Q]);

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) {
      G({
        message: "Không có thao tác nào để hoàn tác!",
        type: "error"
      });
      return;
    }
    const currentSnapshot = {
      cart: y,
      partner: p,
      note: K,
      amountPaid: oe,
      cashGiven: V,
      paymentMethod: I,
      orderId: Q,
      workingProduct: m
    };
    const previousSnapshot = undoStackRef.current.pop();
    if (previousSnapshot) {
      redoStackRef.current.push(currentSnapshot);
      isUndoingRef.current = !0;
      lastStateSnapshotRef.current = previousSnapshot;
      H(previousSnapshot.cart || []);
      F(previousSnapshot.partner || null);
      $e(previousSnapshot.note || "");
      re(previousSnapshot.amountPaid || 0);
      Ye(previousSnapshot.cashGiven || 0);
      ge(previousSnapshot.paymentMethod || "Cash");
      Gt(previousSnapshot.orderId || null);
      if (previousSnapshot.workingProduct) {
        He(previousSnapshot.workingProduct);
      }
      try {
        Is();
      } catch {}
      G({
        message: `Đã hoàn tác (Undo)! Còn ${undoStackRef.current.length} bước`,
        type: "success"
      });
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const currentSnapshot = {
      cart: y,
      partner: p,
      note: K,
      amountPaid: oe,
      cashGiven: V,
      paymentMethod: I,
      orderId: Q,
      workingProduct: m
    };
    const nextSnapshot = redoStackRef.current.pop();
    if (nextSnapshot) {
      undoStackRef.current.push(currentSnapshot);
      isUndoingRef.current = !0;
      lastStateSnapshotRef.current = nextSnapshot;
      H(nextSnapshot.cart || []);
      F(nextSnapshot.partner || null);
      $e(nextSnapshot.note || "");
      re(nextSnapshot.amountPaid || 0);
      Ye(nextSnapshot.cashGiven || 0);
      ge(nextSnapshot.paymentMethod || "Cash");
      Gt(nextSnapshot.orderId || null);
      if (nextSnapshot.workingProduct) {
        He(nextSnapshot.workingProduct);
      }
      try {
        Is();
      } catch {}
      G({
        message: "Đã làm lại (Redo)!",
        type: "success"
      });
    }
  };

  i.useEffect(() => {
    if (he) {
      const t = Array.isArray(he) ? he : he.items || [];
      if (m.product) {
        const a = t.find(r => r.id === m.product.id);
        a && (a.stock !== m.product.stock || a.name !== m.product.name || a.unit !== m.product.unit || a.cost_price !== m.product.cost_price || JSON.stringify(a.latest_audit) !== JSON.stringify(m.product.latest_audit)) && He(r => ({
          ...r,
          product: a
        }));
      }
      if (Qt && pt) {
        const a = t.find(r => r.id === pt.id);
        if (a) {
          const r = a.stock !== pt.stock,
            s = JSON.stringify(a.latest_audit) !== JSON.stringify(pt.latest_audit);
          (r || s) && Xt(a);
        }
      }
      H(a => {
        let r = !1;
        const s = a.map(n => {
          if (!n.product_id) return n;
          const l = t.find(d => d.id === n.product_id);
          return l && (l.stock !== n.stock || l.name !== n.product_name || l.unit !== n.unit || l.multiplier !== n.multiplier || l.cost_price !== n.cost_price || l.latest_cost_price !== n.latest_cost_price) ? (r = !0, {
            ...n,
            product_name: l.name,
            unit: l.unit,
            secondary_unit: l.secondary_unit,
            multiplier: l.multiplier || 1,
            stock: l.stock,
            cost_price: l.cost_price,
            latest_cost_price: l.latest_cost_price,
            latest_stock_entry: l.latest_stock_entry,
            latest_audit: l.latest_audit,
            is_combo: l.is_combo,
            active_ingredient: l.active_ingredient
          }) : n;
        });
        return r ? s : a;
      });
    }
  }, [he, m.product?.id, Qt, pt?.id, pt?.stock, JSON.stringify(pt?.latest_audit)]), i.useEffect(() => {
    if (_e && p) {
      const t = (Array.isArray(_e) ? _e : _e.items || []).find(a => a.id === p.id);
      t && (t.debt_balance !== p.debt_balance || t.name !== p.name) && F(t);
    }
  }, [_e, p?.id]);
  const [Ui, Yt] = i.useState(!1),
    [us, mr] = i.useState(null),
    [ye, Ia] = i.useState(null),
    [Da, et] = i.useState(null),
    Bi = i.useRef({}),
    se = i.useRef(null),
    Pt = i.useRef(null),
    ms = i.useRef(null),
    Et = i.useRef(null),
    xr = i.useRef(null),
    Pa = i.useRef(null),
    xs = i.useRef(null),
    hs = i.useRef(null),
    Ea = i.useRef(null),
    [productSearchCoords, setProductSearchCoords] = i.useState({ top: 0, left: 0, width: 700 }),
    [hr, qa] = i.useState([]),
    [q, br] = i.useState(null),
    [Zt, Ma] = i.useState(!1),
    [Ac, Oc] = i.useState(!1),
    bs = i.useRef(null),
    [Fi, gr] = i.useState(!1),
    [mn, Wa] = i.useState(""),
    [ea, xn] = i.useState(null),
    Vi = () => {
      const t = parseInt(mn.trim(), 10);
      if (!isNaN(t) && t > 0 && t <= ve.length) {
        const a = ve[t - 1];
        a && (H(r => r.filter(s => s.cartId !== a.cartId)), G({
          message: `Đã xóa dòng ${t}: ${a.product_name || "Sản phẩm"}`,
          type: "success"
        }));
      } else G({
        message: "Số dòng không hợp lệ!",
        type: "error"
      });
      gr(!1), Wa("");
    };
  i.useLayoutEffect(() => {
    if (Z && !m?.product && Li) {
      const updateCoords = () => {
        if (se.current) {
          const rect = se.current.getBoundingClientRect();
          if (rect.width > 0 && rect.bottom > 0) {
            setProductSearchCoords({
              top: rect.bottom + 6,
              left: rect.left,
              width: Math.max(rect.width, 700)
            });
          }
        }
      };
      updateCoords();
      window.addEventListener("resize", updateCoords);
      window.addEventListener("scroll", updateCoords, true);
      return () => {
        window.removeEventListener("resize", updateCoords);
        window.removeEventListener("scroll", updateCoords, true);
      };
    }
  }, [Z, m?.product, Li]);
  i.useEffect(() => {
    if (!Zt) return;
    const t = a => {
      a.key === "Escape" && Ma(!1);
    };
    return window.addEventListener("keydown", t), () => window.removeEventListener("keydown", t);
  }, [Zt]), i.useEffect(() => {
    !(fe.some(a => a.id === g) || g === "remote_inspect" && q) && fe.length > 0 && f(fe[0].id);
  }, [g, fe, q]), i.useEffect(() => {
    const t = async () => {
      try {
        if (typeof document !== "undefined" && document.hidden) return;
        const s = localStorage.getItem("pos_terminal_id"),
          l = ((await Vn.get("/api/pos/terminals")).data.terminals || []).filter(d => d.terminal_id !== s);
        qa(l);
      } catch {}
    };
    t();
    const a = setInterval(t, 5e3),
      r = () => {
        Ma(s => !s);
      };
    return window.addEventListener("focus_pos_mirror_tab", r), () => {
      clearInterval(a), window.removeEventListener("focus_pos_mirror_tab", r);
    };
  }, []);
  const hn = t => {
      if (!t || t.length === 0) {
        Ve.error("Giỏ hàng của máy trạm này đang trống!");
        return;
      }
      const a = t.map((r, s) => ({
        id: `imported_${Date.now()}_${s}`,
        product_id: r.id || r.product_id,
        product_name: r.name || r.product_name,
        unit: r.unit || r.product_unit || "Cái",
        quantity: Number(r.quantity) || 1,
        price: Number(r.price || r.sale_price) || 0,
        cost_price: Number(r.cost_price || r.capital_price) || 0,
        code: r.code || r.product_code || r.sku || ""
      }));
      H(a), br(null), Ve.success(`Đã chép ${a.length} sản phẩm từ máy trạm vào đơn của bạn!`);
    },
    k = q ? hr.find(t => t.terminal_id === q || t.ip_address === q || t.ip_address && q.includes(t.ip_address) || t.terminal_id && (q.includes(t.terminal_id) || t.terminal_id.includes(q))) : null,
    ze = k?.partner || (k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" ? {
      name: k.partner_name,
      debt_balance: k.debt_balance || 0
    } : null),
    Pe = g === "remote_inspect" ? ze : p,
    Ra = t => {
      q && (qa(a => a.map(r => r.terminal_id === q || r.ip_address === q ? {
        ...r,
        cart: t,
        total_items: t.reduce((s, n) => s + (Number(n.quantity) || 1), 0),
        total_amount: t.reduce((s, n) => s + (Number(n.quantity) || 1) * Number(n.price || n.sale_price || 0), 0)
      } : r)), M.post("/api/pos/terminal-state/edit-cart", {
        terminal_id: q,
        cart: t
      }).catch(a => {
        Ve.error("Không thể cập nhật máy trạm!");
      }));
    },
    Aa = t => {
      q && (qa(a => a.map(r => r.terminal_id === q || r.ip_address === q ? {
        ...r,
        partner: t,
        partner_name: t ? t.name : "Khách lẻ"
      } : r)), M.post("/api/pos/terminal-state/edit-cart", {
        terminal_id: q,
        partner: t,
        partner_name: t ? t.name : "Khách lẻ",
        cart: k?.cart || []
      }).catch(a => {
        Ve.error("Không thể cập nhật đối tác máy trạm!");
      }));
    },
    Qi = i.useMemo(() => {
      if (g !== "remote_inspect") return [];
      if (!q && !k) return [];
      const t = k || {
          user_name: "Thu ngân",
          ip_address: q.includes(".") ? q : null,
          cart: []
        },
        a = <x.tr key="remote-header-banner" initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} className="bg-transparent border-b border-[#8b6f47]/15 dark:border-white/10 z-50 relative"><td colSpan={9} className="p-1.5 px-3"><div className="flex items-center justify-between gap-4 py-1.5 px-3 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-[#8b6f47]/20 dark:border-white/10 backdrop-blur-md shadow-xs transition-all duration-300"><div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-[11px] font-black tracking-wider"><span className="flex h-2 w-2 relative shrink-0"><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" /></span><span className="px-2 py-0.5 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest mr-1 shadow-sm">LIVE INSPECT</span><span>Đang soi: <strong className="font-black text-[#8b6f47] dark:text-[#d4a574]">{`${t.user_name || "Thu ngân"} (${t.ip_address || "Local"})`}</strong>{` - ${(t.cart || []).length} món`}</span></div><div className="flex items-center gap-1.5 shrink-0"><button onClick={() => {
                  et({
                    title: "Xác nhận lưu hóa đơn",
                    message: "Bạn có chắc chắn muốn lưu hóa đơn trên máy trạm này?",
                    onConfirm: () => {
                      et(null), M.post("/api/pos/terminal-state/action", {
                        terminal_id: q,
                        action: "save_order"
                      }).then(() => {
                        Ve.success("Đã gửi lệnh lưu hóa đơn tới máy trạm!");
                      }).catch(s => {
                        Ve.error("Không thể gửi lệnh lưu hóa đơn!");
                      });
                    }
                  });
                }} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1">LƯU HÓA ĐƠN</button><button onClick={() => hn(t.cart)} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1"><Pn size={10} className="shrink-0" />CHÉP GIỎ HÀNG</button><button onClick={() => br(null)} className="px-2.5 py-1 bg-black/[0.05] dark:bg-white/[0.08] hover:bg-[#8b6f47]/15 text-[#8b6f47] dark:text-[#d4a574] border border-[#8b6f47]/20 dark:border-white/10 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"><span>✕</span>QUAY LẠI</button></div></div></td></x.tr>,
        r = !t.cart || t.cart.length === 0 ? [<x.tr key="remote-empty-cart" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }}><td colSpan={9} className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">Giỏ hàng của máy trạm này hiện tại đang trống.</td></x.tr>] : t.cart.map((s, n) => {
          const l = Number(s.quantity) || 0,
            d = Number(s.price || s.sale_price) || 0,
            o = d * l,
            u = Number(s.multiplier) || 1,
            h = s.secondary_qty !== void 0 && s.secondary_qty !== null ? s.secondary_qty : l / u,
            b = u > 1 || s.secondary_qty ? Number(h) % 1 === 0 ? Number(h) : Number(h).toFixed(3) : "N/A",
            S = s.id || s.product_id || `remote_${n}_${s.name || s.product_name}`;
          return <x.tr key={S} layout={!0} initial={{
            opacity: 0,
            x: -20,
            scale: 0.98
          }} animate={{
            opacity: 1,
            x: 0,
            scale: 1
          }} exit={{
            opacity: 0,
            x: 30,
            scale: 0.95,
            transition: {
              duration: 0.2
            }
          }} transition={{
            type: "spring",
            stiffness: 350,
            damping: 25
          }} className="border-b border-slate-200 dark:border-white/5 hover:bg-primary/5 dark:hover:bg-slate-800/20 transition-colors group"><td className="py-2 px-4 text-center text-slate-400 font-black text-[11px] group-hover:text-emerald-500 transition-colors tabular-nums">{n + 1}</td><td className="py-2 px-4 text-center"><button onClick={w => {
                w.stopPropagation();
                const O = (k?.cart || []).filter((U, L) => L !== n);
                Ra(O);
              }} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" title="Xóa dòng"><Comp_pa size={18} /></button></td><td className="py-2 px-2 relative"><div className="w-full h-auto py-2.5 px-4 text-[17px] font-black uppercase tracking-tight text-emerald-900 dark:text-emerald-300 leading-relaxed truncate">{s.name || s.product_name}{(s.code || s.product_code || s.sku) && <span className="ml-2 text-xs font-black tabular-nums text-slate-400 normal-case">({s.code || s.product_code || s.sku})</span>}</div></td><td className="py-2 px-4 text-center"><div className="font-bold text-gray-700 dark:text-gray-200">{Ae(s.unit || s.product_unit || "Cái")}</div></td><td className="py-2 px-2 w-32">{s.secondary_unit ? <div className="flex items-center justify-center gap-1 h-10 px-2 bg-transparent border border-white/20 dark:border-white/10 rounded-2xl font-black text-base text-primary dark:text-[#d4a574]"><input type="text" className="w-16 bg-transparent text-center border-0 outline-none p-0 focus:ring-0 focus:border-0 font-black text-base text-primary dark:text-[#d4a574]" value={b} onFocus={w => w.target.select()} onKeyDown={w => {
                  w.key === "Enter" && (w.preventDefault(), se.current?.focus());
                }} onChange={w => {
                  const O = parseFloat(w.target.value) || 0,
                    U = (k?.cart || []).map((L, ce) => ce === n ? {
                      ...L,
                      secondary_qty: O,
                      quantity: O * (Number(L.multiplier) || 1)
                    } : L);
                  Ra(U);
                }} /><span className="text-[10px] font-black text-gray-400 uppercase ml-1">{Ae(s.secondary_unit || "Cái")}</span></div> : <div className="text-center text-gray-300 italic text-[10px] font-bold">N/A</div>}</td><td className="py-2 px-2 w-24"><input type="text" className="w-full h-10 text-center bg-transparent border border-white/20 dark:border-white/10 rounded-2xl font-black text-lg text-primary dark:text-[#d4a574] focus:ring-0 focus:outline-none focus:border-emerald-500/30" value={l} onFocus={w => w.target.select()} onKeyDown={w => {
                w.key === "Enter" && (w.preventDefault(), se.current?.focus());
              }} onChange={w => {
                const O = parseFloat(w.target.value) || 0,
                  U = (k?.cart || []).map((L, ce) => ce === n ? {
                    ...L,
                    quantity: O,
                    secondary_qty: O / (Number(L.multiplier) || 1)
                  } : L);
                Ra(U);
              }} /></td><td className="py-2 px-2 w-[180px]"><input type="text" tabIndex={blockTabPrice ? -1 : 0} className="w-full h-10 text-center bg-transparent border border-white/20 dark:border-white/10 rounded-2xl font-black text-base text-primary dark:text-[#d4a574] focus:ring-0 focus:outline-none focus:border-emerald-500/30" value={z(d)} onFocus={w => w.target.select()} onKeyDown={w => {
                w.key === "Enter" && (w.preventDefault(), se.current?.focus());
              }} onChange={w => {
                const O = parseFloat(w.target.value.replace(/,/g, "")) || 0,
                  U = (k?.cart || []).map((L, ce) => ce === n ? {
                    ...L,
                    price: O,
                    sale_price: O
                  } : L);
                Ra(U);
              }} /></td><td className="py-2 px-4 text-right"><div className="font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">{z(o)}đ</div></td><td className="w-8" /></x.tr>;
        });
      return [a, ...r];
    }, [q, k, g]),
    [Xi, Oa] = i.useState(!1),
    [Ji, fr] = i.useState(null),
    [gs, La] = i.useState(!1),
    [Yi, fs] = i.useState(!1),
    [ut, $a] = i.useState({
      name: "",
      price: ""
    }),
    ys = i.useRef(null),
    bn = i.useRef(null),
    [gn, Zi] = i.useState(!1),
    ve = i.useMemo(() => J.ui_enable_smart_sorting !== "true" ? y : Tn(y), [y, J.ui_enable_smart_sorting]),
    [fn, yn] = i.useState(!1),
    [Ha, el] = i.useState(!1),
    ta = i.useRef(null),
    yr = t => {
      ta.current || (ta.current = setTimeout(() => {
        el(a => !a), ta.current = null;
      }, 3e3));
    },
    aa = () => {
      ta.current && (clearTimeout(ta.current), ta.current = null);
    },
    [tl, kt] = i.useState(!1),
    [editingHistoryOrder, setEditingHistoryOrder] = i.useState(null),
    [al, vn] = i.useState(!1),
    [tt, qt] = i.useState(null),
    [vr, ra] = i.useState(""),
    [kr, sa] = i.useState(""),
    mt = i.useRef(null),
    [Ke, rl] = i.useState(() => {
      const t = localStorage.getItem("pos_print_options");
      return t ? JSON.parse(t) : {
        showOldDebt: !1,
        showPayment: !1,
        showRemaining: !1,
        showCashGiven: !0,
        showChange: !0
      };
    }),
    [transparentCartTable, setTransparentCartTable] = i.useState(() => {
      const t = localStorage.getItem("pos_transparent_cart_table");
      return t === null ? true : t === "true";
    });
  i.useEffect(() => {
    localStorage.setItem("pos_new_style", JSON.stringify(Je)), document.documentElement.style.setProperty("--pos-accent", Je.accent), document.documentElement.style.setProperty("--dropdown-bg", Je.dropdownBg), document.documentElement.style.setProperty("--dropdown-accent", Je.dropdownAccent);
  }, [Je]);
  const kn = t => {
      if (!t) return "#000000";
      const a = parseInt(t.slice(1, 3), 16),
        r = parseInt(t.slice(3, 5), 16),
        s = parseInt(t.slice(5, 7), 16);
      return (a * 299 + r * 587 + s * 114) / 1e3 > 128 ? "#000000" : "#ffffff";
    },
    sl = (t, a = 0.8) => {
      const r = parseInt(t.slice(1, 3), 16),
        s = parseInt(t.slice(3, 5), 16),
        n = parseInt(t.slice(5, 7), 16);
      return `rgba(${r}, ${s}, ${n}, ${a})`;
    },
    Mt = i.useMemo(() => {
      const t = document.documentElement.classList.contains("dark") || N === "dark",
        a = t ? "#1a1714" : "#f7f4ed",
        r = Je.dropdownAccent || "#8b6f47",
        s = kn(a),
        n = kn(r);
      return {
        main: s,
        accent: n,
        muted: s === "#ffffff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
        accentMuted: n === "#ffffff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
        glassBg: t ? "rgba(26, 23, 20, 0.96)" : "rgba(247, 244, 237, 0.96)",
        glassAccent: sl(r, 0.9)
      };
    }, [Je.dropdownBg, Je.dropdownAccent, N]);
  i.useEffect(() => {
    localStorage.setItem("pos_print_options", JSON.stringify(Ke));
  }, [Ke]);
  const nl = In(0),
    il = In(0);
  Dn(nl, {
    stiffness: 50,
    damping: 20
  }), Dn(il, {
    stiffness: 50,
    damping: 20
  }), i.useEffect(() => {
    mt.current = new BroadcastChannel("packing_channel");
    const t = new BroadcastChannel("pos_data_sync");
    return t.onmessage = a => {
      a.data.type === "PARTNER_UPDATED" ? (E.invalidateQueries({
        queryKey: ["partners"]
      }), p && ws(p.id)) : a.data.type === "PRODUCT_UPDATED" ? E.invalidateQueries({
        queryKey: ["products"]
      }) : a.data.type === "ORDER_SAVED" ? (E.invalidateQueries({
        queryKey: ["shippingSummary"]
      }), E.invalidateQueries({
        queryKey: ["partners"]
      }), E.invalidateQueries({
        queryKey: ["products"]
      }), p && ws(p.id)) : a.data.type === "SETTINGS_UPDATED" ? (_n(), Nn()) : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_keep_order_after_save" ? Vs(a.data.value === "true") : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_block_tab_unit_price" ? setBlockTabPrice(a.data.value === "true") : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_transparent_cart_table" ? setTransparentCartTable(a.data.value === "true") : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_typing_sound_enabled" ? setTypingSoundEnabled(a.data.value !== "false") : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_sound_theme_success" ? setSoundThemeSuccess(a.data.value) : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_sound_theme_action" ? setSoundThemeAction(a.data.value) : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "pos_sound_theme_typing" ? setSoundThemeTyping(a.data.value) : a.data.type === "UI_SETTING_UPDATED" && a.data.key === "ui_enable_smart_sorting" && Na(r => ({
        ...r,
        ui_enable_smart_sorting: a.data.value
      }));
    }, () => {
      mt.current && mt.current.close(), t.close();
    };
  }, []), i.useEffect(() => {
    if (mt.current) {
      mt.current.onmessage = s => {
        if (s.data && s.data.type === "REQUEST_SYNC") {
          const n = new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit"
            }),
            l = {
              type: y.length > 0 ? "NEW_ORDER" : "CLEAR",
              orders: y.length > 0 ? [{
                id: Q || "MỚI",
                customer_name: p ? p.name : null,
                timestamp: n,
                items: y.map(d => ({
                  id: d.cartId,
                  product_id: d.product_id,
                  name: d.product_name,
                  quantity: d.quantity,
                  unit: d.unit,
                  price: d.price
                })),
                note: K
              }] : []
            };
          mt.current.postMessage(l), M.post("/api/packing/sync", l).catch(console.error);
        }
      };
      const t = new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        a = {
          type: y.length > 0 ? "NEW_ORDER" : "CLEAR",
          orders: y.length > 0 ? [{
            id: Q || "MỚI",
            customer_name: p ? p.name : null,
            timestamp: t,
            items: y.map(s => ({
              id: s.cartId,
              product_id: s.product_id,
              name: s.product_name,
              quantity: s.quantity,
              unit: s.unit,
              price: s.price
            })),
            note: K
          }] : []
        };
      mt.current.postMessage(a);
      const r = setTimeout(() => {
        M.post("/api/packing/sync", a).catch(console.error);
      }, 350);
      try {
        const s = y.map(l => ({
            name: l.product_name || l.name,
            product_name: l.product_name || l.name,
            quantity: l.quantity || 1,
            unit: l.unit || l.product_unit || "Cái",
            price: l.price || l.sale_price || 0,
            sale_price: l.price || l.sale_price || 0,
            cost_price: l.cost_price || l.capital_price || (l.price ? l.price * 0.75 : 0),
            code: l.code || l.sku || l.product_code || "",
            secondary_unit: l.secondary_unit || null,
            multiplier: Number(l.multiplier) || 1,
            secondary_qty: Number(l.secondary_qty) || 0,
            product_id: l.product_id || null
          })),
          n = p && p.name || "Khách lẻ";
        localStorage.setItem("pos_cart", JSON.stringify(s)), localStorage.setItem("pos_partner_name", n), p ? localStorage.setItem("pos_selected_partner", JSON.stringify(p)) : localStorage.removeItem("pos_selected_partner"), localStorage.setItem("pos_active_payment_method", I || "Cash"), localStorage.setItem("pos_active_amount_paid", String(oe || 0)), localStorage.setItem("pos_active_cash_given", String(V || 0)), localStorage.setItem("pos_active_note", K || ""), window.dispatchEvent(new CustomEvent("pos_cart_updated", {
          detail: {
            cart: s,
            partner_name: n,
            partner: p,
            payment_method: I || "Cash",
            amount_paid: oe || 0,
            cash_given: V || 0,
            note: K || ""
          }
        }));
      } catch {}
      return () => clearTimeout(r);
    }
  }, [y, K, Q, p, I, oe, V]), i.useEffect(() => {
    if (mt.current) {
      const t = {
        type: "SYNC_HELD",
        heldInvoices: Fe.map(a => ({
          id: a.id,
          partner_name: a.partner ? a.partner.name : "Khách Lẻ",
          total: a.total,
          time: a.time,
          itemCount: a.cart.length,
          items: a.cart.map(r => ({
            name: r.product_name,
            quantity: r.quantity,
            unit: r.unit,
            price: r.price
          })),
          note: a.note
        }))
      };
      mt.current.postMessage(t), M.post("/api/packing/sync", t).catch(console.error);
    }
  }, [Fe]), i.useEffect(() => {
    if (m.product) {
      const t = setTimeout(() => {
        const a = Te === "Wholesale" && m.product.secondary_unit ? Pa : Pt;
        a.current && document.activeElement !== a.current && (a.current.focus(), a.current.select?.());
      }, 0);
      return () => clearTimeout(t);
    }
  }, [m.product?.id, Te]);
  const wn = i.useMemo(() => m.product ? m.price * m.quantity : 0, [m.product, m.price, m.quantity]),
    $ = i.useMemo(() => y.reduce((t, a) => t + a.price * a.quantity, 0) + wn, [y, wn]);
  i.useEffect(() => {
    if ($ > 0) {
      const t = setTimeout(() => {
        yl($, p?.name);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [$, p]);
  const vs = i.useMemo(() => {
      const t = y.reduce((r, s) => {
          const n = s.product_id == null ? s.price : s.cost_price || 0;
          return r + (s.price - n) * s.quantity;
        }, 0),
        a = m.product ? (m.price - (m.product.cost_price || 0)) * m.quantity : 0;
      return t + a;
    }, [y, m]),
    ll = i.useMemo(() => y.length + (m.product ? 1 : 0), [y, m.product]),
    ol = i.useMemo(() => y.reduce((t, a) => t + (a.quantity || 0), 0) + (m.quantity || 0), [y, m.quantity]),
    dl = i.useMemo(() => y.reduce((t, a) => t + (a.secondary_qty || 0), 0) + (m.secondary_qty || 0), [y, m.secondary_qty]),
    de = i.useMemo(() => {
      if (!p) return 0;
      if (Q && le && p.id === le.partner_id && le.old_debt !== void 0 && le.old_debt !== null) return le.old_debt;
      let t = p.debt_balance;
      if (Q && le && p.id === le.partner_id && le.payment_method === "Debt") {
        const a = (le.total_amount || 0) - (le.amount_paid || 0);
        t -= a;
      }
      return t;
    }, [p, Q, le]),
    it = I === "Debt" ? de + ($ >= 0 ? $ - oe : $ + oe) : de,
    wr = () => {
      if (y.length === 0) return;
      const t = {
        id: Date.now(),
        cart: [...y],
        partner: p,
        note: K,
        amountPaid: oe,
        cashGiven: V,
        paymentMethod: I,
        editOrderId: Q,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        total: $
      };
      Qr([t, ...Fe]), Wt(), G({
        message: "Đã tạm dừng đơn hàng",
        type: "success"
      });
    },
    jn = t => {
      H(t.cart), F(t.partner), $e(t.note), re(t.amountPaid), Ye(t.cashGiven || 0), ge(t.paymentMethod || "Debt"), Gt(t.editOrderId || null), Qr(Fe.filter(a => a.id !== t.id)), St(!1);
    },
    cl = t => {
      Qr(Fe.filter(a => a.id !== t));
    },
    Wt = (t = !1) => {
      H([]), t || (F(null), Ge("")), ae(""), Ue(!1), re(0), Ye(0), $e(""), or({});
      He({
        product: null,
        quantity: 0,
        price: 0,
        secondary_qty: 0,
        name: ""
      });
      const a = Te === "Wholesale" ? "Debt" : "Cash";
      ge(a), a === "Cash" && re(0), Gt(null), Br(null), setCustomOrderDate(""), Ur(null), Vr(0), qt(null), ra(""), sa(""), ie.current && (ie.current[g] = null), Ds(), setTimeout(() => se.current?.focus(), 100);
    },
    Re = async (t = !0, a = "Sale") => {
      let r = [...y];
      if (m.product && m.quantity !== 0) {
        const s = r.findIndex(n => n.product_id === m.product.id && n.price === m.price);
        s > -1 ? (r[s].quantity += m.quantity, r[s].secondary_qty += m.secondary_qty) : r = [{
          product_id: m.product.id,
          product_name: m.product.name,
          unit: m.product.unit,
          secondary_unit: m.product.secondary_unit,
          multiplier: m.product.multiplier || 1,
          price: m.price,
          cost_price: m.product.cost_price,
          latest_cost_price: m.product.latest_cost_price,
          quantity: m.quantity,
          secondary_qty: m.secondary_qty,
          stock: m.product.stock,
          accounting_stock: m.product.accounting_stock,
          is_combo: m.product.is_combo,
          active_ingredient: m.product.active_ingredient,
          isPacked: !1,
          cartId: Math.random().toString(36).substr(2, 9)
        }, ...r];
      }
      if (r.length !== 0) {
        J.ui_enable_smart_sorting === "true" && (r = Tn(r)), Zs(!0);
        try {
          const s = {
            partner_id: p ? p.id : null,
            type: "Sale",
            payment_method: I,
            details: r.map(o => ({
              product_id: o.product_id,
              product_name: o.product_name,
              quantity: o.quantity,
              price: o.price
            })),
            note: K,
            amount_paid: oe,
            cash_given: V,
            bank_account_id: I === "Transfer" ? ss : null,
            shipping_status: tt,
            shipping_address: vr,
            shipping_phone: kr,
            date: customOrderDate || (le?.date ? le.date : undefined),
            created_by: JSON.parse(sessionStorage.getItem("user") || "{}").name || JSON.parse(sessionStorage.getItem("user") || "{}").username || "Unknown"
          };
          let n;
          if (Q ? n = await M.put(`/api/orders/${Q}`, s) : n = await M.post("/api/orders", s), ft !== "off" && ha) try {
            tr();
            const h = localStorage.getItem("pos_tts_disable_partner_thankyou") === "true",
              b = (p?.name || "").trim(),
              S = b && b.toLowerCase() !== "khách lẻ" && b.toLowerCase() !== "khách vãng lai" && b.toLowerCase() !== "ncc vãng lai",
              w = h || !S ? "" : b,
              U = (w ? localStorage.getItem("pos_tts_thankyou_partner_template") || "Cảm ơn {partner}" : localStorage.getItem("pos_tts_thankyou_template") || "Cảm ơn quý khách").replace(/{partner}/gi, w || "quý khách").replace(/{customer}/gi, w || "quý khách");
            ht(U);
          } catch (o) {
            console.error("Lỗi đọc cảm ơn:", o);
          }
          const l = {
              ...n.data,
              total_amount: n.data?.total_amount ?? n.data?.total ?? $,
              details: (n.data?.details && n.data.details.length > 0) ? n.data.details : r.map(o => ({
                product_id: o.product_id,
                product_name: o.product_name,
                quantity: o.quantity,
                price: o.price,
                unit: o.unit || "Cái"
              })),
              old_debt: n.data?.old_debt !== void 0 && n.data?.old_debt !== null ? n.data.old_debt : p && p.debt_balance || 0,
              partner_id: p?.id || n.data.partner_id,
              partner_name: p?.name || n.data.partner_name,
              partner_address: p?.address || n.data.partner_address,
              partner_phone: p?.phone || n.data.partner_phone,
              partner: p || n.data.partner || null
            },
            d = n.data?.display_id || n.data?.id || Q || "MỚI";
          if (ir === "card") {
            xn({
              id: d,
              count: r.length,
              total: $,
              partnerName: p ? p.name : "Khách lẻ",
              type: "Sale"
            });
            setTimeout(() => xn(null), 1100);
          } else {
            G({
              message: "Đã lưu đơn hàng thành công!",
              type: "success"
            });
          }
          if (Ur(l), Ys(l), p) {
            const o = r.filter(u => u.product_id).map(u => ({
              product_id: u.product_id,
              price: u.price
            }));
            if (o.length > 0) try {
              await M.post("/api/custom-prices/bulk", {
                partner_id: p.id,
                prices: o
              });
            } catch (u) {
              console.error("Failed to save custom prices:", u);
            }
          }
          if (pn(a || "Sale"), E.invalidateQueries(["shippingSummary"]), t) {
            const printFn = async () => {
              try {
                if (document.fonts && document.fonts.ready) {
                  await document.fonts.ready;
                }
              } catch (e) {}
              window.print();
              setTimeout(() => {
                ga ? (Gt(n.data.id), jr(), Ga(), Ua()) : (Wt(!1), localStorage.removeItem("pos_draft"));
                const o = new BroadcastChannel("pos_data_sync");
                o.postMessage({
                  type: "ORDER_SAVED"
                }), o.close();
              }, 1e3);
            };
            setTimeout(printFn, 200);
          } else {
            ga ? (Gt(n.data.id), jr(), Ga(), Ua()) : (Wt(!1), localStorage.removeItem("pos_draft"));
            const o = new BroadcastChannel("pos_data_sync");
            o.postMessage({
              type: "ORDER_SAVED"
            }), o.close(), Is();
          }
        } catch (s) {
          G({
            message: s.response?.data?.error || "Lỗi khi lưu đơn hàng",
            type: "error"
          });
        } finally {
          Zs(!1);
        }
      }
    };
  const [historyPartner, setHistoryPartner] = i.useState(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = i.useState(false);
  const [availableTemplates, setAvailableTemplates] = i.useState([]);
  const [currentTemplateId, setCurrentTemplateId] = i.useState(null);
  const [showTaxCalculator, setShowTaxCalculator] = i.useState(() => localStorage.getItem("feature_tax_calculator_enabled") === "true");
  i.useEffect(() => {
    const handleTaxToggle = () => {
      setShowTaxCalculator(localStorage.getItem("feature_tax_calculator_enabled") === "true");
    };
    window.addEventListener("storage", handleTaxToggle);
    window.addEventListener("feature_tax_calculator_changed", handleTaxToggle);
    return () => {
      window.removeEventListener("storage", handleTaxToggle);
      window.removeEventListener("feature_tax_calculator_changed", handleTaxToggle);
    };
  }, []);

  i.useEffect(() => {
    const t = a => {
      a.detail && a.detail.action === "save_order" && Re(!1);
    };
    return window.addEventListener("pos_remote_action", t), () => window.removeEventListener("pos_remote_action", t);
  }, [Re]);
  const pl = async t => {
      try {
        const a = await M.get(`/api/orders/${t}`);
        a.data && (await Ka(a.data));
      } catch (a) {
        console.error("Error fetching order", a), G({
          message: "Không tìm thấy hóa đơn",
          type: "error"
        });
      }
    },
    Ka = async t => {
      let orderObj = t;
      if (!orderObj) return;
      if ((!orderObj.details || orderObj.details.length === 0) && orderObj.id) {
        try {
          const res = await M.get(`/api/orders/${orderObj.id}`);
          if (res.data) orderObj = res.data;
        } catch (e) {
          console.error("Error fetching full order details", e);
        }
      }
      Gt(orderObj.id), Br(orderObj);
      const detailsList = orderObj.details || orderObj.items || [];
      H(detailsList.map(a => {
        const r = T.find(s => s.id === a.product_id);
        return {
          product_id: a.product_id,
          product_name: a.product_name || a.name || r?.name,
          unit: a.product_unit || a.unit || r?.unit,
          secondary_unit: a.secondary_unit || r?.secondary_unit,
          multiplier: a.multiplier || r?.multiplier || 1,
          price: a.price,
          cost_price: r ? r.cost_price : a.cost_price,
          latest_cost_price: r ? r.latest_cost_price : a.latest_cost_price,
          quantity: a.quantity,
          secondary_qty: a.quantity / (a.multiplier || r?.multiplier || 1),
          stock: r ? r.stock : a.stock || 0,
          latest_audit: r?.latest_audit,
          active_ingredient: a.active_ingredient || r?.active_ingredient,
          is_manual_price: !0,
          isPacked: !1,
          cartId: Math.random().toString(36).substr(2, 9)
        };
      })), $e(orderObj.note || ""), re(orderObj.amount_paid || 0), Ye(orderObj.cash_given || 0), ge(orderObj.payment_method || "Cash"), qt(orderObj.shipping_status || null), ra(orderObj.shipping_address || ""), sa(orderObj.shipping_phone || ""), setCustomOrderDate(orderObj.date ? orderObj.date.slice(0, 10) : ""), orderObj.partner_id ? nr(orderObj.partner_id) : (F(null), nr(null)), Ge(""), ae(""), Ue(!1);
    },
    na = async t => {
      let a;
      if (t === "prev" ? a = Ce + 1 : a = Math.max(0, Ce - 1), a === 0) {
        Ds(), Wt();
        return;
      }
      Ds(), yn(!0);
      try {
        const r = await M.get(`/api/orders?limit=1&page=${a}&type=Sale`);
        r.data.items && r.data.items.length > 0 ? (Ka(r.data.items[0]), Vr(a)) : G({
          message: "Không còn hóa đơn nào khác",
          type: "info"
        });
      } catch (r) {
        console.error(r);
      } finally {
        yn(!1);
      }
    },
    _n = async () => {
      try {
        const [t, a] = await Promise.all([M.get("/api/print-templates?module=Sale"), M.get("/api/settings")]);
        let r = {
          ...Tr
        };
        if (a.data && (r = {
          ...r,
          ...a.data
        }), t.data && t.data.length > 0) {
          setAvailableTemplates(t.data);
          const l = t.data.find(d => d.is_default) || t.data[0];
          if (l) {
            setCurrentTemplateId(l.id);
            try {
              const d = typeof l.config === "string" ? JSON.parse(l.config) : l.config;
              r = {
                ...r,
                ...d
              };
            } catch (d) {
              console.error(d);
            }
          }
        } else {
          setAvailableTemplates([]);
          setCurrentTemplateId(null);
        }
        const s = localStorage.getItem("ui_show_doraemon");
        s !== null && (r.ui_show_doraemon = s);
        const n = localStorage.getItem("ui_enable_smart_sorting");
        r.ui_enable_smart_sorting = n !== null ? n : Tr.ui_enable_smart_sorting, Na(r);
      } catch (t) {
        console.error(t);
      }
    },
    handleSelectDefaultTemplate = async (templateId) => {
      try {
        await M.put(`/api/print-templates/${templateId}`, { is_default: true, is_active: true });
        G({
          message: "Đã chọn làm mẫu in mặc định!",
          type: "success"
        });
        await _n();
        try {
          const channel = new BroadcastChannel("pos_data_sync");
          channel.postMessage({ type: "SETTINGS_UPDATED" });
          channel.close();
        } catch (e) {}
      } catch (err) {
        console.error("Error setting default template:", err);
        G({
          message: "Lỗi khi đổi mẫu in mặc định",
          type: "error"
        });
      }
    };
  i.useEffect(() => {
    const t = a => {
      a.key === "ui_show_doraemon" && Na(r => ({
        ...r,
        [a.key]: a.newValue
      }));
    };
    const syncChannel = new BroadcastChannel('pos_data_sync');
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'SETTINGS_UPDATED') {
        _n();
      }
    };
    window.addEventListener("storage", t);
    return () => {
      window.removeEventListener("storage", t);
      syncChannel.close();
    };
  }, []), i.useEffect(() => {
    va && setTimeout(() => {
      const t = document.getElementById("first-held-card");
      t && t.focus();
    }, 100);
  }, [va]), i.useEffect(() => {
    const t = a => {
      if (a.isComposing || a.keyCode === 229 || !a.key) return;
      if (a.key === "Delete") {
        const o = document.activeElement;
        if (!o || o.tagName !== "INPUT" && o.tagName !== "TEXTAREA" && o.getAttribute("contenteditable") !== "true" || o === se.current) {
          a.preventDefault(), a.stopPropagation(), Wa(""), gr(!0);
          return;
        }
      }
      const r = Date.now();
      if (a.key.length === 1 && !a.ctrlKey && !a.altKey && !a.metaKey) {
        const o = r - ma.current;
        if (ma.current = r, o > 150 ? qe.current = a.key : qe.current += a.key, o < 45) {
          const u = document.activeElement;
          u && (u.tagName === "INPUT" || u.tagName === "TEXTAREA") || (a.preventDefault(), a.stopPropagation()), A.current && (clearTimeout(A.current), A.current = null);
        }
      } else if (a.key === "Enter") {
        const o = r - ma.current,
          u = qe.current;
        if (o < 45 && u.length >= 4) {
          if (a.preventDefault(), a.stopPropagation(), qe.current = "", _s.current(u, Nr.current) || G({
            message: `Mã vạch ${u} không tồn tại`,
            type: "error"
          }), document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
            const h = document.activeElement,
              b = u[0];
            if (h.value.endsWith(u)) try {
              const S = h.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
              Object.getOwnPropertyDescriptor(S, "value").set.call(h, h.value.slice(0, -u.length)), h.dispatchEvent(new Event("input", {
                bubbles: !0
              }));
            } catch {
              h.value = h.value.slice(0, -u.length);
            } else if (b && h.value.endsWith(b)) try {
              const S = h.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
              Object.getOwnPropertyDescriptor(S, "value").set.call(h, h.value.slice(0, -1)), h.dispatchEvent(new Event("input", {
                bubbles: !0
              }));
            } catch {
              h.value = h.value.slice(0, -1);
            }
          }
          return;
        }
        qe.current = "";
      }
      if (a.ctrlKey && (a.code === "Space" || a.key === " ")) {
        a.preventDefault(), a.stopPropagation(), St(o => !o);
        return;
      }
      if ((a.ctrlKey || a.metaKey) && !a.altKey && (a.key === "z" || a.key === "Z")) {
        a.preventDefault();
        a.stopPropagation();
        if (a.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((a.ctrlKey || a.metaKey) && !a.altKey && (a.key === "y" || a.key === "Y")) {
        a.preventDefault();
        a.stopPropagation();
        handleRedo();
        return;
      }
      if (a.key === "Home") {
        a.preventDefault();
        a.stopPropagation();
        if (ve && ve.length > 0) {
          const nextIdx = ve.findIndex(item => !item.isPacked);
          if (nextIdx !== -1) {
            xl(nextIdx);
            document.getElementById(`cart-row-${nextIdx}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } else {
            G({
              message: "Đã soạn xong toàn bộ danh sách hàng!",
              type: "success"
            });
            try {
              ht("Đã soạn xong");
            } catch {}
          }
        }
        return;
      }
      a.key === "Tab" && zs();
      const s = a.key.toUpperCase();
      if (s === (J.kb_cash || "F1").toUpperCase()) {
        a.preventDefault(), a.stopPropagation();
        const o = document.getElementById("cash-given-compact"),
          u = document.getElementById("cash-given-sidebar"),
          h = o && o.offsetParent !== null ? o : u;
        h ? (h.focus(), h.select()) : (xr.current?.focus(), xr.current?.select());
      }
      if (s === (J.kb_partner || "F3").toUpperCase()) {
        a.preventDefault(), a.stopPropagation(), W(!1), zi(!0), setTimeout(() => {
          Et.current?.focus(), Et.current?.select();
        }, 50);
        return;
      }
      if (a.key === "Escape") tr(), (Me || va || ds || dr || pr || ps || Z || Tt !== null || lr || gs || Qt) && (Ue(!1), St(!1), Sa(!1), cr(!1), ur(!1), vt(!1), ae(""), ct(null), kt(!1), as(!1), La(!1), Dt(!1));else if (s === "F2" && a.shiftKey) {
        if (a.preventDefault(), m.product) {
          const o = se.current?.getBoundingClientRect();
          Xt(m.product), o && za({
            top: o.top,
            bottom: o.bottom,
            left: o.left,
            right: o.right
          }), Dt(!0);
        }
      } else if (s === (J.kb_search || "F2").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        const o = document.activeElement;
        if (o && o.id && o.id.startsWith("row-name-")) {
          const u = parseInt(o.id.replace("row-name-", "")),
            h = ve[u];
          if (h) {
            const b = T.find(S => S.id === h.product_id);
            b && (Vt(b), vt(!0));
          }
        } else se.current?.focus(), se.current?.select?.();
      } else if (s === (J.kb_save || "F12").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        Re(!1);
      } else if (s === (J.kb_pay || "F9").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        Re(!0);
      } else if (s === (J.kb_new || "F4").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        Wt();
      } else if (s === (J.kb_hold || "F8").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        wr();
      } else if (s === (J.kb_custom || "F6").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        La(!0);
        $a({
          name: "",
          price: ""
        });
        setTimeout(() => {
          ys.current?.focus();
        }, 100);
      } else if (s === (J.kb_speech || "F10").toUpperCase()) {
        a.preventDefault();
        a.stopPropagation();
        ft !== "off" && xa && (tr(), console.log("F10 calling speakNumber with:", $), ht($, !0, p?.name));
      } else if (a.key === "Insert") {
        a.preventDefault();
        a.stopPropagation();
        m && m.product && He(o => ({
          ...o,
          quantity: o.quantity * -1,
          secondary_qty: o.secondary_qty * -1
        }));
      } else if (s === "F7") {
        a.preventDefault();
        a.stopPropagation();
        console.log("F7 keydown triggered. State:", {
          bLength: y.length
        });
        y.length > 0 && ts(!0);
      } else if (a.ctrlKey && a.key === "ArrowUp") {
        a.preventDefault();
        a.stopPropagation();
        const o = [...fe];
        q && o.push({
          id: "remote_inspect"
        });
        const u = o.findIndex(h => h.id === g);
        if (u > 0) {
          const h = o[u - 1];
          h.id === "remote_inspect" ? f("remote_inspect") : es(h.id);
        }
      } else if (a.ctrlKey && a.key === "ArrowDown") {
        a.preventDefault();
        a.stopPropagation();
        const o = [...fe];
        q && o.push({
          id: "remote_inspect"
        });
        const u = o.findIndex(h => h.id === g);
        if (u !== -1 && u < o.length - 1) {
          const h = o[u + 1];
          h.id === "remote_inspect" ? f("remote_inspect") : es(h.id);
        }
      } else if (a.ctrlKey && a.key === "ArrowLeft") {
        a.preventDefault();
        a.stopPropagation();
        na("prev");
      } else if (a.ctrlKey && a.key === "ArrowRight") {
        a.preventDefault();
        a.stopPropagation();
        na("next");
      }
      const n = a.key.length === 1,
        l = !a.ctrlKey && !a.altKey && !a.metaKey,
        d = a.target.tagName !== "INPUT" && a.target.tagName !== "TEXTAREA";
      console.log("[Keydown Debug] target:", a.target ? a.target.tagName : "null", "key:", a.key, "x:", d), n && l && d && (A.current && clearTimeout(A.current), A.current = setTimeout(() => {
        Sl();
      }, 50));
    };
    return window.addEventListener("keydown", t, !0), () => window.removeEventListener("keydown", t, !0);
  }, [y, p, oe, K, J, Me, va, ds, dr, pr, ps, Z, Tt, gs, Ce, V, I, tt, vr, kr, Re, m, Qt, $, ft, ve, Za, er, xa, ha]);
  const ks = () => {
    const t = localStorage.getItem("pos_draft");
    if (t) try {
      const a = JSON.parse(t);
      if (H(a.cart || []), $e(a.note || ""), re(a.amountPaid || 0), ge(a.paymentMethod || (localStorage.getItem("unified_pos_mode") === "Wholesale" ? "Debt" : "Cash")), Ye(a.cashGiven || 0), a.selectedPartnerId) {
        const r = Y.find(s => s.id === a.selectedPartnerId);
        F(r || null);
      } else F(null);
      return Gt(null), Br(null), Vr(0), !0;
    } catch (a) {
      console.error("Error loading draft", a);
    }
    return !1;
  };
  i.useEffect(() => {
    if (_n(), Nn(), Ut.state?.editOrder || ks(), Ut.state?.editOrder) {
      const t = Ut.state.editOrder;
      Ka(t);
    } else {
      const t = new URLSearchParams(window.location.search),
        a = t.get("edit"),
        r = t.get("partner_id");
      a ? pl(a) : (r && nr(r), Q && (ks() || Wt(!1)));
    }
    Zi(!0);
  }, [Ut.search, Ut.state]);
  const ul = t => {
    Oi(t), localStorage.setItem("unified_pos_mode", t), y.length === 0 && !Q && ge(t === "Wholesale" ? "Debt" : "Cash");
  };
  i.useEffect(() => {
    I === "Cash" && re($);
  }, [I, $]), i.useEffect(() => {
    if (gn && !Q) {
      const t = {
        cart: y,
        selectedPartnerId: p?.id,
        note: K,
        amountPaid: oe,
        paymentMethod: I,
        cashGiven: V
      };
      localStorage.setItem("pos_draft", JSON.stringify(t));
    }
  }, [y, p, K, oe, I, V, Q, gn]), i.useEffect(() => {
    localStorage.setItem("held_invoices", JSON.stringify(Fe));
  }, [Fe]), i.useEffect(() => {
    if (Y.length > 0) {
      if (Fr) {
        const t = Y.find(a => a.id == Fr);
        t && (F(t), nr(null), Ge(""));
      } else if (p) {
        const t = Y.find(a => a.id === p.id);
        t && t.debt_balance !== p.debt_balance && F(t);
      } else if (!Q) {
        const t = localStorage.getItem("pos_draft");
        if (t) try {
          const a = JSON.parse(t);
          if (a.selectedPartnerId) {
            const r = Y.find(s => s.id === a.selectedPartnerId);
            r && (F(r), Ge(""));
          }
        } catch {}
      }
    }
  }, [Y, Fr, Q, Ut.state]), i.useEffect(() => {
    p?.id && !Q && (async () => {
      try {
        const t = await M.post(`/api/partners/${p.id}/recalculate-debt`);
        t.data.new_balance !== void 0 && F(a => !a || a.id !== p.id ? a : {
          ...a,
          debt_balance: t.data.new_balance
        });
      } catch (t) {
        console.error("Error auto-syncing debt:", t);
      }
    })();
  }, [p?.id, Q]);
  const ml = async t => {
      try {
        await M.post("/api/inventory/audit", t), G({
          message: "Đã cập nhật kho thành công!",
          type: "success"
        }), E.invalidateQueries(["products"]);
        const a = new BroadcastChannel("pos_data_sync");
        a.postMessage({
          type: "PRODUCT_UPDATED"
        }), a.close();
      } catch (a) {
        throw console.error(a), G({
          message: "Lỗi khi cập nhật kho",
          type: "error"
        }), a;
      }
    },
    Nn = async () => {
      try {
        const t = await M.get("/api/bank-accounts");
        Ai(t.data), t.data.length > 0 && ns(t.data[0].id);
      } catch (t) {
        console.error(t);
      }
    },
    ws = async t => {
      if (or({}), !!t) try {
        const a = await M.get(`/api/custom-prices/${t}`);
        or(a.data);
      } catch (a) {
        console.error(a);
      }
    };
  i.useEffect(() => {
    p ? (ws(p.id), Js(!0), Kt("debt"), M.get(`/api/partners/${p.id}/ledger`).then(t => {
      const a = t.data?.ledger || [],
        r = a.find(n => n.type === "Order" && n.payment_method === "Debt" && (n.increase > 0 || n.obj && n.obj.total_amount > 0)),
        s = a.find(n => n.type === "Order" && n.payment_method !== "Debt" && (n.increase > 0 || n.obj && n.obj.total_amount > 0));
      Hr(r || null), Kr(s || null);
    }).catch(t => {
      console.error("Error fetching partner ledger:", t), Hr(null), Kr(null);
    }).finally(() => {
      Js(!1);
    })) : (or({}), Hr(null), Kr(null), Kt("debt"));
  }, [p]), i.useEffect(() => {
    const t = a => {
      document.body.contains(a.target) && !(Wr.current && Wr.current.contains(a.target) || Rr.current && Rr.current.contains(a.target)) && !a.target.closest(".partner-popout-trigger") && Gr(!1);
    };
    return document.addEventListener("mousedown", t), () => document.removeEventListener("mousedown", t);
  }, []), i.useEffect(() => {
    if (!he) return;
    const t = Array.isArray(he) ? he : he.items || [];
    H(a => {
      if (a.length === 0) return a;
      let r = !1;
      const s = a.map(n => {
        const l = t.find(d => d.id === n.product_id);
        if (l) {
          const d = l.stock !== n.stock,
            o = l.unit !== n.unit || l.multiplier !== n.multiplier || l.secondary_unit !== n.secondary_unit;
          let u = R[n.product_id] !== void 0 ? R[n.product_id] : l.sale_price;
          l.bulk_quantity > 0 && n.quantity >= l.bulk_quantity && R[n.product_id] === void 0 && (u = l.bulk_price || u);
          const h = !n.is_manual_price && n.price !== u;
          if (d || o || h) return r = !0, {
            ...n,
            cost_price: l.cost_price,
            stock: l.stock,
            unit: l.unit,
            multiplier: l.multiplier || 1,
            secondary_unit: l.secondary_unit,
            latest_audit: l.latest_audit,
            latest_stock_entry: l.latest_stock_entry,
            price: h ? u : n.price
          };
        }
        return n;
      });
      return r ? s : a;
    });
  }, [he, R, y.length]), i.useEffect(() => {
    I === "Cash" && re($);
  }, [$, I]);
  const Ga = async () => {
      try {
        await E.invalidateQueries({
          queryKey: ["products"]
        });
      } catch (t) {
        console.error(t);
      }
    },
    Ua = async () => {
      try {
        await E.invalidateQueries({
          queryKey: ["partners"]
        });
      } catch (t) {
        console.error(t);
      }
    },
    jr = async () => {
      if (p) try {
        const {
            data: t
          } = await M.get("/api/partners"),
          a = t.find(r => r.id === p.id);
        a && F(a), await E.invalidateQueries({
          queryKey: ["partners"]
        });
      } catch (t) {
        console.error("Error syncing partner balance:", t);
      }
    },
    ia = (t, a = null, r = null) => {
      if (g === "remote_inspect" && q) {
        const b = k?.cart || [],
          S = a !== null ? a : 1,
          w = t.sale_price,
          O = R[t.id] !== void 0 ? R[t.id] : w,
          U = r !== null && r !== O,
          L = b.find(ee => (t.id !== null ? ee.product_id === t.id : ee.product_id === null && ee.product_name === t.name) && (U ? ee.price === (r !== null ? r : O) : !ee.is_manual_price)),
          ce = (L ? L.quantity : 0) + S;
        let Rt = r !== null ? r : O;
        t.bulk_quantity > 0 && ce >= t.bulk_quantity && r === null && !U && R[t.id] === void 0 && (Rt = t.bulk_price || O);
        let Sr = [];
        if (L) ce === 0 ? Sr = b.filter(ee => (ee.id || ee.cartId) !== (L.id || L.cartId)) : Sr = b.map(ee => (ee.id || ee.cartId) === (L.id || L.cartId) ? {
          ...ee,
          quantity: ce,
          price: Rt,
          secondary_qty: ce / (ee.multiplier || 1),
          is_manual_price: U || ee.is_manual_price,
          isPacked: ee.isPacked || !1
        } : ee);else {
          const ee = Math.random().toString(36).substr(2, 9);
          Sr = [{
            id: ee,
            cartId: ee,
            product_id: t.id,
            product_name: t.name,
            unit: t.unit,
            secondary_unit: t.secondary_unit,
            multiplier: t.multiplier || 1,
            price: Rt,
            cost_price: t.cost_price,
            latest_cost_price: t.latest_cost_price,
            quantity: S,
            secondary_qty: S / (t.multiplier || 1),
            stock: t.stock,
            accounting_stock: t.accounting_stock,
            latest_audit: t.latest_audit,
            latest_stock_entry: t.latest_stock_entry,
            is_combo: t.is_combo,
            active_ingredient: t.active_ingredient,
            is_manual_price: U,
            isPacked: !1
          }, ...b];
        }
        Ra(Sr), ae(""), Ft(0), He({
          product: null,
          quantity: 0,
          price: 0,
          secondary_qty: 0,
          name: ""
        }), setTimeout(() => {
          const ee = se.current;
          ee && (ee.focus(), ee.select());
        }, 10);
        return;
      }
      const s = a !== null ? a : 1,
        n = t.sale_price,
        l = R[t.id] !== void 0 ? R[t.id] : n,
        d = r !== null && r !== l,
        o = y.find(b => (t.id !== null ? b.product_id === t.id : b.product_id === null && b.product_name === t.name) && (d ? b.price === (r !== null ? r : l) : !b.is_manual_price)),
        u = (o ? o.quantity : 0) + s;
      let h = r !== null ? r : l;
      if (t.bulk_quantity > 0 && u >= t.bulk_quantity && r === null && !d && R[t.id] === void 0 && (h = t.bulk_price || l), H(o ? u === 0 ? y.filter(b => b.cartId !== o.cartId) : y.map(b => b.cartId === o.cartId ? {
        ...b,
        quantity: u,
        price: h,
        secondary_qty: u / (b.multiplier || 1),
        is_manual_price: d || b.is_manual_price,
        isPacked: b.isPacked || !1
      } : b) : [{
        product_id: t.id,
        product_name: t.name,
        unit: t.unit,
        secondary_unit: t.secondary_unit,
        multiplier: t.multiplier || 1,
        price: h,
        cost_price: t.cost_price,
        latest_cost_price: t.latest_cost_price,
        quantity: s,
        secondary_qty: s / (t.multiplier || 1),
        stock: t.stock,
        accounting_stock: t.accounting_stock,
        latest_audit: t.latest_audit,
        latest_stock_entry: t.latest_stock_entry,
        is_combo: t.is_combo,
        active_ingredient: t.active_ingredient,
        is_manual_price: d,
        isPacked: !1,
        cartId: Math.random().toString(36).substr(2, 9)
      }, ...y]), playAddToCartSound(soundThemeCartAdd), ft !== "off" && localStorage.getItem("pos_tts_enable_cart_addition") !== "false" && s !== 0) {
        const b = Za && localStorage.getItem("pos_tts_enable_cart_product_name") !== "false",
          S = localStorage.getItem("pos_tts_cart_speech_order") || "name_first";
        if (window.cartSpeechTimeout && (clearTimeout(window.cartSpeechTimeout), window.cartSpeechTimeout = null), u === 0) ht("Đã xóa");else {
          const w = u < 0,
            O = Math.abs(u),
            U = w ? `Trả hàng ${O}` : O;
          const shouldReadQty = er;
          const fullProduct = T.find(p => p.id === t.id) || t;
          const rawAlias = (fullProduct.alias && fullProduct.alias.trim()) || (t.alias && t.alias.trim()) || "";
          const hasAlias = Boolean(rawAlias);
          const alias = rawAlias;
          const isFirstAdd = !o; // Nếu chưa có trong giỏ hàng thì mới đọc tên alias
          
          if (b && hasAlias && isFirstAdd && shouldReadQty) {
            S === "qty_first" 
              ? speakAudioSequence([U, alias]) 
              : speakAudioSequence([alias, U]);
            rr.current[g] = t.id;
          } else if (b && hasAlias && isFirstAdd) {
            speakAudioSequence([alias]);
            rr.current[g] = t.id;
          } else if (shouldReadQty) {
            ht(U);
            rr.current[g] = t.id;
          }
        }
      }
      ae(""), Ft(0), He({
        product: null,
        quantity: 0,
        price: 0,
        secondary_qty: 0,
        name: ""
      }), setTimeout(() => {
        const b = se.current;
        b && (b.focus(), b.select());
      }, 10);
    },
    xl = t => {
      const a = ve[t];
      if (a) {
        const nextPacked = !a.isPacked;
        H(r => r.map(s => s.cartId === a.cartId ? {
          ...s,
          isPacked: nextPacked
        } : s));
        if (nextPacked && ft !== "off") {
          const r = T.find(n => n.id === a.product_id) || a,
            rawAlias = (r.alias && r.alias.trim()) || (a.alias && a.alias.trim()) || "",
            alias = rawAlias || a.product_name,
            qty = a.quantity,
            b = Za && localStorage.getItem("pos_tts_enable_cart_product_name") !== "false",
            S = localStorage.getItem("pos_tts_cart_speech_order") || "name_first",
            shouldReadQty = er;

          const tokens = [];
          if (b && alias && shouldReadQty) {
            S === "qty_first" ? tokens.push(qty, alias) : tokens.push(alias, qty);
          } else if (b && alias) {
            tokens.push(alias);
          } else if (shouldReadQty) {
            tokens.push(qty);
          } else {
            tokens.push(alias, qty);
          }

          if (tokens.length > 0) {
            speakAudioSequence(tokens);
          }
        }
      }
    },
    _r = (t, a, r) => {
      const s = ve[t];
      s && H(n => n.map(l => {
        if (l.cartId !== s.cartId) return l;
        const d = {
          ...l
        };
        if (a === "secondary_qty" ? (d.secondary_qty = r, d.quantity = r * (d.multiplier || 1)) : a === "quantity" ? (d.quantity = r, d.secondary_qty = r / (d.multiplier || 1)) : a === "price" ? (d.price = r, d.is_manual_price = !0) : d[a] = r, (a === "quantity" || a === "secondary_qty") && !d.is_manual_price) {
          const o = T.find(u => u.id === d.product_id);
          if (o) {
            const u = R[o.id] !== void 0 ? R[o.id] : o.sale_price;
            o.bulk_quantity > 0 && d.quantity >= o.bulk_quantity && R[o.id] === void 0 ? d.price = o.bulk_price || u : d.price = u;
          }
        }
        return d;
      }));
    },
    hl = (t, a, r = 1) => {
      if (t === g) {
        const d = a.sale_price,
          o = R[a.id] !== void 0 ? R[a.id] : d;
        ia(a, r, o);
        return;
      }
      const s = fe.find(d => d.id === t),
        n = s ? s.name : `Đơn #${t}`,
        l = Date.now() + Math.random();
      if (Bs(d => [...d, {
        id: l,
        productName: a.name,
        qty: r,
        tabName: n
      }]), setTimeout(() => {
        Bs(d => d.filter(o => o.id !== l));
      }, 2500), _(d => d.map(o => {
        if (o.id !== t) return o;
        const u = a.sale_price;
        let h = u;
        a.bulk_quantity > 0 && r >= a.bulk_quantity && (h = a.bulk_price || u);
        const b = o.cart.findIndex(w => w.product_id === a.id && !w.is_manual_price);
        let S;
        if (b > -1) {
          const w = o.cart[b].quantity + r;
          w <= 0 ? S = o.cart.filter((O, U) => U !== b) : S = o.cart.map((O, U) => U !== b ? O : {
            ...O,
            quantity: w,
            price: a.bulk_quantity > 0 && w >= a.bulk_quantity && a.bulk_price || O.price,
            secondary_qty: w / (O.multiplier || 1)
          });
        } else r > 0 ? S = [{
          product_id: a.id,
          product_name: a.name,
          unit: a.unit,
          secondary_unit: a.secondary_unit,
          multiplier: a.multiplier || 1,
          price: h,
          cost_price: a.cost_price,
          latest_cost_price: a.latest_cost_price,
          quantity: r,
          secondary_qty: r / (a.multiplier || 1),
          stock: a.stock,
          latest_audit: a.latest_audit,
          latest_stock_entry: a.latest_stock_entry,
          is_combo: a.is_combo,
          active_ingredient: a.active_ingredient,
          is_manual_price: !1,
          isPacked: !1,
          cartId: Math.random().toString(36).substr(2, 9)
        }, ...o.cart] : S = o.cart;
        return {
          ...o,
          cart: S
        };
      })), s) {
        const d = s.cart.findIndex(o => o.product_id === a.id && !o.is_manual_price);
        d > -1 && s.cart[d].quantity;
      }
    },
    js = (t, a = null) => {
      const r = a !== null ? a : Nr.current || g;
      if (t) {
        const u = t.trim().toUpperCase();
        if (u === "THANHTOAN" || u === "THANH_TOAN" || u === "PAY" || u === "IN" || u === "IN_HOA_DON") return Re(!0), !0;
        if (u === "LUUDON" || u === "LUU_DON" || u === "SAVE") return Re(!1), !0;
        if (u === "CMD-TRU" || u === "CMD_TRU" || u === "TRU" || u === "GIAM" || u === "CMD-SUBTRACT") return Ht("subtract"), !0;
        if (u === "CMD-XOA" || u === "CMD_XOA" || u === "XOA" || u === "DELETE" || u === "CMD-DELETE") return Ht("delete"), !0;
        if (u === "CMD-CONG" || u === "CMD_CONG" || u === "CONG" || u === "ADD" || u === "CMD-ADD") return Ht("add"), !0;
      }
      let s = null,
        n = 1,
        l = gt === "delete",
        d = gt === "subtract",
        o = t ? t.trim() : "";
      if (o.toUpperCase().startsWith("DEL-") ? (l = !0, o = o.substring(4)) : o.toUpperCase().startsWith("DELETE-") ? (l = !0, o = o.substring(7)) : o.startsWith("-") && (d = !0, o = o.substring(1)), s = T.find(u => u.code === o || u.barcode === o), !s && o.includes("-")) {
        const u = o.split("-"),
          h = parseInt(u.pop(), 10);
        if (!isNaN(h) && h > 0) {
          const b = u.join("-");
          s = T.find(S => S.code === b || S.barcode === b), s && (n = h);
        }
      }
      if (s) {
        const u = l ? -999999 : d ? -n : n;
        return hl(r, s, u), gt !== "add" && Ht("add"), !0;
      }
      return !1;
    },
    _s = i.useRef(js);
  i.useEffect(() => {
    _s.current = js;
  });
  const Nr = i.useRef(ne);
  i.useEffect(() => {
    Nr.current = ne;
  }, [ne]), i.useEffect(() => {
    if (!bt) return;
    let t = !0;
    const a = async () => {
        try {
          let s = !0;
          for (; s && t;) {
            const n = await M.get("/api/remote-scans/pop");
            if (!t) break;
            if (n.data && n.data.barcode) {
              const l = n.data.barcode;
              _s.current(l, Nr.current) || G({
                message: `Mã vạch ${l} không tồn tại`,
                type: "error"
              });
            } else s = !1;
          }
        } catch {}
      },
      r = setInterval(() => {
        t && a();
      }, 500);
    return () => {
      t = !1, clearInterval(r);
    };
  }, [bt]);
  const bl = t => {
      const a = ve[t];
      a && H(r => r.filter(s => s.cartId !== a.cartId));
    },
    Cn = (t, a) => {
      t && (H([{
        product_id: null,
        product_name: t,
        unit: "Món",
        secondary_unit: null,
        multiplier: 1,
        price: a,
        cost_price: 0,
        quantity: 1,
        secondary_qty: 1,
        stock: 0,
        is_combo: !1,
        active_ingredient: "",
        isPacked: !1,
        cartId: Math.random().toString(36).substr(2, 9)
      }, ...y]), La(!1), $a({
        name: "",
        price: ""
      }), setTimeout(() => {
        se.current?.focus();
      }, 10));
    },
    gl = t => {
      et({
        title: "Xác nhận xóa nợ sổ tay",
        message: `Bạn có chắc chắn muốn xóa khoản nợ ${z(t.total_amount)} VNĐ của ${p?.name}?`,
        onConfirm: async () => {
          try {
            const a = t.id.toString().replace("v_", "");
            await M.delete(`/api/vouchers/${a}`), G({
              message: "Đã xóa khoản nợ thành công!",
              type: "success"
            }), E.invalidateQueries(["partners"]);
            const r = new BroadcastChannel("pos_data_sync");
            r.postMessage({
              type: "PARTNER_UPDATED"
            }), r.close(), kt(!1);
          } catch {
            G({
              message: "Lỗi khi xóa khoản nợ",
              type: "error"
            });
          } finally {
            et(null);
          }
        }
      });
    },
    Sn = t => {
      et({
        title: "Xác nhận hủy đơn hàng",
        message: `Bạn có chắc chắn muốn hủy đơn hàng #${t.display_id || t.id}?`,
        onConfirm: async () => {
          try {
            await M.delete(`/api/orders/${t.id}`), G({
              message: "Đã hủy đơn hàng!",
              type: "success"
            }), kt(!1), Ga(), Ua();
          } catch {
            G({
              message: "Lỗi khi hủy đơn hàng",
              type: "error"
            });
          } finally {
            et(null);
          }
        }
      });
    },
    Ba = i.useMemo(() => T.map(t => ({
      ...t,
      _normName: xt((t.name || "").toLowerCase()),
      _normCode: xt((t.code || "").toLowerCase()),
      _normActive: xt((t.active_ingredient || "").toLowerCase()),
      _lowName: (t.name || "").toLowerCase(),
      _lowCode: (t.code || "").toLowerCase(),
      _lowActive: (t.active_ingredient || "").toLowerCase()
    })), [T]),
    wt = i.useMemo(() => {
      const t = Z.toLowerCase(),
        a = xt(t);
      return t ? Ba.filter(r => r._lowName.includes(t) || r._normName.includes(a) || r._lowCode.includes(t) || r._normCode.includes(a) || r._lowActive.includes(t) || r._normActive.includes(a)).sort((r, s) => {
        const n = o => o._lowName.startsWith(t) ? 0 : o._normName.startsWith(a) ? 1 : o._lowName.includes(t) ? 2 : o._normName.includes(a) ? 3 : o._lowCode.startsWith(t) ? 4 : o._normCode.startsWith(a) ? 5 : o._lowCode.includes(t) || o._normCode.includes(a) ? 6 : o._lowActive.startsWith(t) || o._normActive.startsWith(a) ? 7 : o._lowActive.includes(t) || o._normActive.includes(a) ? 8 : 9,
          l = n(r),
          d = n(s);
        return l !== d ? l - d : r._lowName.localeCompare(s._lowName, "vi", {
          sensitivity: "base"
        });
      }).slice(0, 50) : Ba.slice(0, 50);
    }, [Ba, Z]),
    Cr = i.useMemo(() => {
      const t = yt.toLowerCase(),
        a = parseInt(t),
        r = xt(t);
      return Y.filter(s => {
        const n = !isNaN(a) && s.id === a,
          l = (s.name || "").toLowerCase();
        return n || l.includes(t) || xt(l).includes(r) || (s.phone || "").includes(t);
      }).sort((s, n) => {
        if (!isNaN(a)) {
          if (s.id === a) return -1;
          if (n.id === a) return 1;
        }
        const l = (s.name || "").toLowerCase(),
          d = (n.name || "").toLowerCase(),
          o = l.startsWith(t),
          u = d.startsWith(t);
        return o && !u ? -1 : !o && u ? 1 : l.localeCompare(d, "vi", {
          sensitivity: "base"
        });
      }).slice(0, 50);
    }, [Y, yt]),
    fl = i.useCallback(() => {
      nn(!0);
    }, []),
    Ns = i.useCallback(() => {
      nn(!1);
    }, []),
    Cs = i.useCallback(t => {
      if (wa) {
        const a = t.clientX / window.innerWidth * 100;
        a > 50 && a < 85 && qi(a);
      }
    }, [wa]);
  return i.useEffect(() => (window.addEventListener("mousemove", Cs), window.addEventListener("mouseup", Ns), () => {
    window.removeEventListener("mousemove", Cs), window.removeEventListener("mouseup", Ns);
  }), [Cs, Ns]), <Comp_fd reducedMotion={Ya ? "always" : "no-preference"} transition={Ya ? {
    type: "just"
  } : void 0}><><div id="pos-root-container" className={c("flex flex-col h-screen bg-transparent font-sans overflow-hidden transition-colors relative z-0", Ya && "gpu-disabled-mode")}><style>{`
          :root {
            --pos-accent: ${Je.accent};
            --radius-pos: ${Je.radius}rem;
            --bg-transparent-blur: ${Je.blur}px;
          }
          .pos- {
            backdrop-filter: blur(var(--bg-transparent-blur)) !important;
            border-radius: var(--radius-pos) !important;
          }
        `}</style><div className="flex-1 flex flex-col overflow-hidden no-print"><div className="p-3.5 px-5 flex gap-5 items-center justify-between print:hidden transition-colors relative z-[3000] bg-transparent"><div className="flex items-center gap-3 shrink-0"><div className="flex items-center gap-3 group cursor-default relative"><div className="flex flex-col"><h1 className="text-2xl font-black text-[#2d5016] dark:text-[#d4a574] uppercase tracking-tighter flex items-center gap-2 leading-none">BÁN HÀNG</h1><span className="text-[10px] font-bold text-[#8b6f47]/70 dark:text-[#d4a574]/60 tracking-wider">by LyangNghia</span></div><P mode="popLayout" initial={!1}><x.div key={le?.id || Ce || "draft"} initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} exit={{
                    opacity: 0
                  }} transition={{
                    duration: 0.2
                  }} className="flex items-center"><button type="button" onClick={() => setIsOrderDatePickerOpen(true)} title="Bấm để chọn ngày hóa đơn" className="flex items-center gap-2 bg-[#8b6f47]/[0.06] hover:bg-[#8b6f47]/[0.1] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-[#8b6f47]/20 dark:border-white/10 hover:border-[#2d5016]/40 dark:hover:border-emerald-400/30 backdrop-blur-md shadow-xs transition-all duration-300 shrink-0 cursor-pointer text-left">{(() => {
                    const originalDateStr = le?.date ? le.date.slice(0, 10) : '';
                    let isDateModified = false;
                    if (customOrderDate) {
                      if (!le) {
                        isDateModified = true;
                      } else if (customOrderDate !== originalDateStr) {
                        isDateModified = true;
                      }
                    }
                    if (!isDateModified && le?.date && le?.display_id) {
                      const idParts = le.display_id.split('.');
                      if (idParts.length >= 2) {
                        const dateInId = idParts.slice(1).join('.');
                        const dateSlash = dateInId.split('/');
                        if (dateSlash.length === 3) {
                          const d = parseInt(dateSlash[0], 10);
                          const m = parseInt(dateSlash[1], 10);
                          const y = parseInt(dateSlash[2], 10);
                          const oDate = new Date(le.date);
                          const orderD = oDate.getDate();
                          const orderM = oDate.getMonth() + 1;
                          const orderY = oDate.getFullYear() % 100;
                          if (orderD !== d || orderM !== m || orderY !== y) {
                            isDateModified = true;
                          }
                        }
                      }
                    }
                    return (
                      <>
                        <div className={c("w-2 h-2 rounded-full shrink-0", isDateModified ? "bg-amber-600 dark:bg-amber-400 ring-2 ring-amber-500/20" : Q ? "bg-[#8b6f47] dark:bg-[#d4a574] ring-2 ring-[#8b6f47]/20 dark:ring-[#d4a574]/20 animate-pulse" : "bg-[#2d5016] dark:bg-emerald-400 ring-2 ring-[#2d5016]/20 dark:ring-emerald-400/20")} />
                        <div className="flex flex-col justify-center leading-none min-w-0">
                          <span className="text-[11px] sm:text-[11.5px] font-black font-mono text-[#2d5016] dark:text-[#e8dfd5] tracking-tight leading-tight tabular-nums flex items-center gap-1">#{le?.display_id || Q || (Ce > 0 ? Ce : "MỚI")}</span>
                          {(() => {
                            if (isDateModified) {
                              const timeStr = le?.date ? new Date(le.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                              const activeDate = customOrderDate || originalDateStr;
                              let dateStr = activeDate;
                              if (activeDate) {
                                const p = activeDate.split('-');
                                dateStr = p.length === 3 ? `${p[2]}/${p[1]}` : activeDate;
                              }
                              return <span className="text-[7.5px] sm:text-[8px] font-black text-amber-700 dark:text-amber-400 mt-0.5 tabular-nums leading-none uppercase">{timeStr} - {dateStr} (ĐÃ SỬA)</span>;
                            }
                            if (le?.date) {
                              return <span className="text-[7.5px] sm:text-[8px] font-black text-[#8b6f47] dark:text-[#d4a574] mt-0.5 tabular-nums leading-none uppercase">{new Date(le.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - {new Date(le.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span>;
                            }
                            return <span className="text-[7.5px] sm:text-[8px] font-bold text-[#8b6f47]/70 dark:text-[#d4a574]/70 mt-0.5 leading-none uppercase">{Q ? "ĐANG SỬA" : "TẠO MỚI"}</span>;
                          })()}
                        </div>
                      </>
                    );
                  })()}</button><Ws>{isOrderDatePickerOpen && (<Fn><div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsOrderDatePickerOpen(false)}><x.div initial={{ opacity: 0, scale: 0.9, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: "spring", damping: 25, stiffness: 400 }} className="bg-white dark:bg-slate-900 border-2 border-[#8b6f47]/30 dark:border-emerald-500/30 rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4" onClick={t => t.stopPropagation()}><div className="flex items-center justify-between pb-3 border-b border-border"><div className="flex items-center gap-2"><Ao size={16} className="text-[#2d5016] dark:text-[#4ade80]" /><span className="text-xs font-black uppercase tracking-wider text-[#2d5016] dark:text-white">Chọn ngày hóa đơn</span></div><button type="button" onClick={() => setIsOrderDatePickerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"><Xn size={16} /></button></div><div className="space-y-2"><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ngày giao dịch:</label><CustomDatePicker value={customOrderDate || (le?.date ? le.date.slice(0, 10) : new Date().toISOString().slice(0, 10))} onChange={t => { setCustomOrderDate(t.target.value); }} /></div><div className="flex items-center justify-between pt-2"><button type="button" onClick={() => { setCustomOrderDate(""); setIsOrderDatePickerOpen(false); }} className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Đặt lại hôm nay</button><button type="button" onClick={() => setIsOrderDatePickerOpen(false)} className="px-4 py-1.5 rounded-xl text-xs font-black bg-[#2d5016] text-white hover:bg-[#3d6820] transition-colors shadow-xs cursor-pointer">Xác nhận</button></div></x.div></div></Fn>)}</Ws></x.div></P></div><div className="flex items-center gap-2.5 pl-4 border-l border-[#8b6f47]/20 dark:border-white/10 relative z-[2100]"><div className="relative shrink-0" onMouseEnter={() => { !Me && document.activeElement !== Et.current && W(!0); }} onMouseLeave={() => W(!1)} onBlur={t => { t.currentTarget.contains(t.relatedTarget) || setTimeout(() => { Ue(!1); }, 180); }}><div className={c("relative flex items-center rounded-full overflow-hidden w-44 md:w-52 h-9 border transition-all duration-200 ease-out", (g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me ? "bg-gradient-to-r from-[#2d5016] to-[#3d6820] dark:from-[#1e3a10] dark:to-[#2d5016] border-[#2d5016] dark:border-[#34d399]/40 shadow-md shadow-[#2d5016]/20 text-white" : "border-[#8b6f47]/30 dark:border-[#d4a574]/30 bg-[#8b6f47]/[0.05] dark:bg-white/[0.04] shadow-xs focus-within:border-[#2d5016] dark:focus-within:border-[#d4a574] focus-within:ring-2 focus-within:ring-[#2d5016]/10")}><x.div key={(g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me ? "selected-partner-icon" : "search-icon"} initial={{
                      scale: 0.75,
                      rotate: -8
                    }} animate={{
                      scale: 1,
                      rotate: 0
                    }} transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 24
                    }} className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"><Ir className={(g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me ? "text-white shrink-0 drop-shadow-sm" : "text-[#2d5016] dark:text-[#d4a574] shrink-0"} size={15} strokeWidth={(g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me ? 2.8 : 2.5} /></x.div><input type="text" className={c("w-full pl-8 pr-7 py-1.5 h-full bg-transparent outline-none font-black text-xs text-slate-900 dark:text-white placeholder:text-muted/60 leading-normal", (g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me && "opacity-0 select-none cursor-pointer")} ref={Et} placeholder="Tìm đối tác (F3)..." value={(g === "remote_inspect" ? ze?.name || (k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" ? k.partner_name : "") || yt : p ? p.name : yt) || ""} onFocus={() => {
                      W(!1), Ue(!0);
                    }} onDoubleClick={t => {
                      g === "remote_inspect" ? ze && (t.stopPropagation(), fr(ze), Oa(!0)) : p && (t.stopPropagation(), fr(p), Oa(!0));
                    }} onChange={t => {
                      W(!1), Ge(t.target.value), g !== "remote_inspect" && p && F(null), Ue(!0), rs(0);
                    }} onKeyDown={t => {
                      if (t.key === "Escape") t.preventDefault(), W(!1), Ue(!1);else if (t.key === "ArrowDown") t.preventDefault(), W(!1), rs(a => {
                        const maxIdx = yt ? Math.max(0, Cr.length - 1) : Cr.length,
                          r = Math.min(a + 1, maxIdx),
                          s = xs.current;
                        if (s) {
                          const n = s.querySelector(`[data-index="${r}"]`);
                          n && n.scrollIntoView({
                            block: "nearest"
                          });
                        }
                        return r;
                      });else if (t.key === "ArrowUp") t.preventDefault(), W(!1), rs(a => {
                        const r = Math.max(a - 1, 0),
                          s = xs.current;
                        if (s) {
                          const n = s.querySelector(`[data-index="${r}"]`);
                          n && n.scrollIntoView({
                            block: "nearest"
                          });
                        }
                        return r;
                      });else if (t.key === "Enter") {
                        if (t.preventDefault(), W(!1), !yt) {
                          if (We === 0) g === "remote_inspect" ? Aa(null) : F(null), Ge(""), Ue(!1);
                          else if (Cr[We - 1]) {
                            const a = Cr[We - 1];
                            g === "remote_inspect" ? Aa(a) : F(a), Ge(""), Ue(!1);
                          }
                        } else {
                          if (Cr[We]) {
                            const a = Cr[We];
                            g === "remote_inspect" ? Aa(a) : F(a), Ge(""), Ue(!1);
                          }
                        }
                        setTimeout(() => se.current?.focus(), 50);
                      }
                    }} /><Ws mode="wait">{(g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me && <x.div key={g === "remote_inspect" ? ze?.name || k?.partner_name : p?.name} initial={{
                        opacity: 0,
                        x: 6,
                        scale: 0.95
                      }} animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1
                      }} exit={{
                        opacity: 0,
                        x: -6,
                        scale: 0.95
                      }} transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 28
                      }} className="absolute left-8 right-7 top-0 bottom-0 flex items-center overflow-hidden pointer-events-none"><span className={c("font-black text-xs uppercase tracking-tight whitespace-nowrap inline-block text-white font-black drop-shadow-sm", ((g === "remote_inspect" ? ze?.name || k?.partner_name : p?.name) || "").length > 12 && "partner-pill-marquee-text")}>{g === "remote_inspect" ? ze?.name || k?.partner_name : p?.name}</span></x.div>}</Ws><Ws>{((g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) || yt) && !Me && <x.div initial={{
                        opacity: 0,
                        scale: 0.6
                      }} animate={{
                        opacity: 1,
                        scale: 1
                      }} exit={{
                        opacity: 0,
                        scale: 0.6
                      }} transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 25
                      }} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-10"><button onClick={t => {
                          t.stopPropagation(), W(!1), g === "remote_inspect" ? Aa(null) : F(null), Ge("");
                        }} className={c("w-5 h-5 flex items-center justify-center rounded-full transition-all cursor-pointer", (g === "remote_inspect" ? ze || k?.partner_name && k.partner_name !== "Khách lẻ" && k.partner_name !== "Khách bán lẻ" : p) && !Me ? "bg-white/20 text-white hover:bg-rose-500 hover:text-white shadow-sm" : "bg-black/5 dark:bg-white/10 text-muted hover:bg-rose-500 hover:text-white")} title="Bỏ chọn đối tác"><Comp_ke size={10} strokeWidth={3} /></button></x.div>}</Ws></div><Vl partner={g === "remote_inspect" ? k?.partner : p} isVisible={xe && !Me && !!(g === "remote_inspect" ? k?.partner : p) && document.activeElement !== Et.current} /><P>{Me && <x.div initial={{
                      opacity: 0,
                      y: 8,
                      scale: 0.96
                    }} animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }} exit={{
                      opacity: 0,
                      y: 8,
                      scale: 0.96
                    }} transition={{
                      duration: 0.15
                    }} className="absolute top-full left-0 mt-2 dropdown-premium !z-[3000] w-[560px] md:w-[600px] max-w-[95vw] shadow-2xl rounded-2xl border border-[#8b6f47]/30 dark:border-white/10 overflow-hidden" ref={xs}><div className="max-h-[500px] overflow-y-auto custom-scrollbar p-0 divide-y divide-[#8b6f47]/10 dark:divide-white/5">{!yt && <x.div data-index={0} className={c("dropdown-item flex items-center gap-3.5 px-4 py-3.5 transition-all relative cursor-pointer", We === 0 && "active")} onClick={() => {
                          W(!1), g === "remote_inspect" ? Aa(null) : F(null), Ge(""), Ue(!1), setTimeout(() => se.current?.focus(), 50);
                        }}><div className={c("w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative z-10 shrink-0", We === 0 ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300")}><Ir size={22} strokeWidth={2.5} /></div><div className="relative z-10 py-1"><p className={c("font-black uppercase tracking-tight text-base md:text-[17px] leading-snug pt-0.5", We === 0 ? "text-white" : "text-slate-900 dark:text-white")}>KHÁCH VÃNG LAI</p><p className={c("text-[11px] font-bold uppercase tracking-widest leading-relaxed mt-0.5", We === 0 ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>MẶC ĐỊNH KHÔNG LƯU NỢ</p></div></x.div>}{Cr.map((t, a) => <x.div key={t.id} data-index={yt ? a : a + 1} onClick={() => {
                          W(!1), g === "remote_inspect" ? Aa(t) : F(t), Ge(""), Ue(!1), setTimeout(() => se.current?.focus(), 50);
                        }} className={c("dropdown-item flex justify-between items-center px-4 py-3 transition-all relative cursor-pointer", (yt ? We === a : We === a + 1) && "active")}><div className="flex items-center gap-3.5 relative z-10 min-w-0 pr-3"><div className={c("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all border border-slate-100 dark:border-slate-800", (yt ? We === a : We === a + 1) ? "bg-white/20 text-white border-transparent" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm")}><Ir size={22} strokeWidth={2.5} /></div><div className="flex flex-col gap-0.5 min-w-0 py-0.5"><div className="flex items-center gap-2 min-w-0"><span className={c("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 transition-colors", (yt ? We === a : We === a + 1) ? "bg-white/20 border-white/40 text-white" : t.is_customer && t.is_supplier ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400" : t.is_customer ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400")}>{t.is_customer && t.is_supplier ? "KH & NCC" : t.is_customer ? "KH" : "NCC"}</span><p className={c("font-black tracking-tight text-base md:text-[17px] truncate leading-snug pt-0.5", (yt ? We === a : We === a + 1) ? "text-white" : "text-slate-900 dark:text-white")}>{t.name}</p></div><div className={c("flex items-center gap-3.5 text-xs font-bold tracking-wide transition-colors leading-relaxed", (yt ? We === a : We === a + 1) ? "text-white/80" : "text-slate-500 dark:text-slate-400")}><span className="flex items-center gap-1 shrink-0"><Jn size={12} strokeWidth={2.5} className="opacity-60" />{t.phone || "---"}</span>{t.address && <span className="flex items-center gap-1 truncate max-w-[220px]"><Yn size={12} strokeWidth={2.5} className="opacity-60" />{t.address}</span>}</div></div></div><div className="text-right relative z-10 flex flex-col items-end gap-1 shrink-0 pl-2"><p className={c("text-2xl font-black tabular-nums tracking-tight leading-snug pt-0.5 transition-colors", (yt ? We === a : We === a + 1) ? "text-white" : (t.debt_balance || 0) > 0 ? "text-[#d93025] dark:text-rose-400" : (t.debt_balance || 0) < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[#0f9d58] dark:text-emerald-400 font-bold")}>{vl(t.debt_balance || 0)}</p><div className={c("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border", (yt ? We === a : We === a + 1) ? "bg-white/20 border-white/40 text-white" : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50")}>{(t.debt_balance || 0) > 0 ? "KHÁCH NỢ" : (t.debt_balance || 0) < 0 ? "MÌNH NỢ" : "HẾT NỢ"}</div></div></x.div>)}</div>{yt && <div className="dropdown-item flex items-center justify-between group/add border-t border-slate-100 dark:border-slate-800 px-4 py-3 cursor-pointer" onClick={() => {
                          dn(yt), cr(!0), Ue(!1);
                        }}><div className="flex items-center gap-3"><div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover/add:rotate-90 transition-transform text-primary shrink-0"><Ot size={18} strokeWidth={3} /></div><div className="py-0.5"><p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-normal">Đối tác mới</p><p className="text-sm font-black uppercase tracking-tight text-primary leading-snug pt-0.5">Tạo nhanh "{yt}"</p></div></div><Dr size={18} strokeWidth={3} className="opacity-40 group-hover/add:translate-x-1 transition-transform" /></div>}</x.div>}</P></div><x.button whileHover={{
                  y: -2,
                  scale: 1.05
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => Bt(!0)} className="relative w-9 h-9 flex items-center justify-center bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white rounded-full transition-all duration-200 border border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40 shadow-xs hover:shadow-md hover:shadow-[#2d5016]/20 shrink-0 cursor-pointer" title={K ? `Ghi chú: ${K}` : "Thêm ghi chú đơn hàng"}><Comp_ei size={16} strokeWidth={2.5} />{K && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />}</x.button><x.button whileHover={{
                  y: -2,
                  scale: 1.05
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => St(!0)} className="relative w-9 h-9 flex items-center justify-center bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white rounded-full transition-all duration-200 border border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40 shadow-xs hover:shadow-md hover:shadow-[#2d5016]/20 group shrink-0 cursor-pointer" title="Danh sách đơn tạm / treo"><Comp_jt size={16} strokeWidth={2.5} className="relative z-10" />{Fe.length > 0 && <x.span initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] min-w-[18px] h-4.5 rounded-full flex items-center justify-center font-black border border-white px-1 leading-none z-20">{Fe.length}</x.span>}</x.button>{Ze === "sidebar" && <x.div className="flex items-center rounded-xl border border-[#8b6f47]/20 dark:border-white/10 bg-[#8b6f47]/[0.06] hover:bg-[#8b6f47]/[0.1] dark:bg-white/[0.04] p-0.5 transition-all shadow-xs shrink-0"><x.button onClick={() => na("prev")} whileTap={{
                    scale: 0.9
                  }} className="w-7 h-7 flex items-center justify-center transition-all rounded-lg bg-transparent hover:bg-[#8b6f47]/15 text-[#8b6f47] dark:text-[#d4a574]" title="Đơn trước"><Comp_qs size={14} strokeWidth={2.5} /></x.button><x.button whileTap={{
                    scale: 0.98
                  }} onClick={() => Ce !== 0 && !ks() && Wt()} className="px-2.5 flex items-center justify-center min-w-[55px]"><span className="text-[11px] font-black uppercase tracking-tight text-[#2d5016] dark:text-[#e8dfd5]">{le?.display_id ? `#${le.display_id}` : Q ? `#${Q}` : "MỚI"}</span></x.button><x.button onClick={() => na("next")} disabled={Ce === 0} whileTap={{
                    scale: 0.9
                  }} className={c("w-7 h-7 flex items-center justify-center transition-all rounded-lg", Ce === 0 ? "opacity-30 cursor-not-allowed text-[#8b6f47] dark:text-[#d4a574]" : "bg-transparent hover:bg-[#8b6f47]/15 text-[#8b6f47] dark:text-[#d4a574]")}><Dr size={14} strokeWidth={2.5} /></x.button></x.div>}<x.button whileHover={{
                  y: -2,
                  scale: 1.05
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => ul(Te === "Retail" ? "Wholesale" : "Retail")} className="relative w-9 h-9 flex items-center justify-center bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white rounded-full transition-all duration-200 border border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40 shadow-xs hover:shadow-md hover:shadow-[#2d5016]/20 shrink-0 cursor-pointer" title={Te === "Wholesale" ? "Chế độ Bán sỉ (Bấm để đổi sang Lẻ)" : "Chế độ Bán lẻ (Bấm để đổi sang Sỉ)"}>{Te === "Wholesale" ? <Comp_jd size={16} strokeWidth={2.5} /> : <Ir size={16} strokeWidth={2.5} />}<div className={c("absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full border border-white dark:border-slate-900", Te === "Wholesale" ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600")} /></x.button><x.button whileHover={{
                  y: -2,
                  scale: 1.05
                }} whileTap={{
                  scale: 0.98
                }} onClick={() => {
                  Xr(!0);
                }} className="relative w-9 h-9 flex items-center justify-center bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white rounded-full transition-all duration-200 border border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40 shadow-xs hover:shadow-md hover:shadow-[#2d5016]/20 shrink-0 cursor-pointer" title="Lịch sử hóa đơn trong ngày"><Comp_ua size={16} strokeWidth={2.5} /></x.button><div className="relative" ref={$r}><x.button whileHover={{
                    y: -2,
                    scale: 1.05
                  }} whileTap={{
                    scale: 0.98
                  }} onClick={() => Ct(t => !t)} className={c("w-9 h-9 shrink-0 rounded-full transition-all duration-200 flex items-center justify-center border shadow-xs cursor-pointer", ar ? "bg-[#2d5016] text-white border-[#2d5016] shadow-md shadow-[#2d5016]/25" : "bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40")} title="Thao tác khác"><Comp_co size={16} strokeWidth={2.5} /></x.button><P>{ar && <x.div initial={{
                      opacity: 0,
                      y: 8,
                      scale: 0.95
                    }} animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }} exit={{
                      opacity: 0,
                      y: 8,
                      scale: 0.95
                    }} transition={{
                      duration: 0.15
                    }} className="absolute right-0 top-full mt-2 w-64 max-h-[50vh] overflow-y-auto !overflow-y-auto overscroll-contain custom-scrollbar bg-[#faf8f3]/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-[#8b6f47]/30 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 z-[4000] flex flex-col gap-1 text-left select-none" style={{ maxHeight: '50vh', overflowY: 'auto' }}><button onClick={() => {
                        Ct(!1), X(!0);
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all group/menu-item w-full text-left"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform shrink-0"><En size={16} strokeWidth={2.5} /></div><span className="uppercase tracking-tight text-left">AI SCAN</span></button><button onClick={() => {
                        Ct(!1);
                        const t = y.reduce((r, s) => r + (parseFloat(s.quantity) || 0) * (parseFloat(s.price) || 0), 0),
                          a = {
                            id: Q || le?.id || null,
                            display_id: le?.display_id || (Q ? `#${Q}` : Ce > 0 ? `#${Ce}` : "XEM TRƯỚC"),
                            date: le?.date || new Date().toISOString(),
                            partner: p || null,
                            partner_id: p?.id || null,
                            partner_name: g === "remote_inspect" ? k?.partner?.name || "Khách lẻ" : p?.name || "Khách lẻ",
                            partner_address: g === "remote_inspect" ? k?.partner?.address || "" : p?.address || "",
                            partner_phone: g === "remote_inspect" ? k?.partner?.phone || "" : p?.phone || "",
                            old_debt: de !== void 0 ? de : p?.debt_balance || 0,
                            total_amount: t,
                            final_amount: t,
                            amount_paid: oe !== void 0 ? oe : t,
                            cash_given: V || 0,
                            payment_method: I || "Cash",
                            note: K || "",
                            details: y.map(r => ({
                              product_id: r.product_id,
                              product_name: r.product_name,
                              unit: r.unit,
                              secondary_unit: r.secondary_unit,
                              multiplier: r.multiplier || 1,
                              quantity: r.quantity,
                              secondary_qty: r.secondary_qty,
                              price: r.price,
                              cost_price: r.cost_price,
                              stock: r.stock
                            }))
                          };
                        $i(a), Sa(!0);
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all group/menu-item"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><$s size={16} strokeWidth={2.5} /></div><span className="uppercase tracking-tight">Xem trước in đơn</span></button>
                      
                      {/* Chọn Mẫu In Mặc Định (Từ Invoice Designer) */}
                      <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col gap-1.5 my-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Ro size={13} className="text-primary dark:text-emerald-400 shrink-0" strokeWidth={2.5} /> Mẫu in mặc định:
                          </span>
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {availableTemplates.length} mẫu
                          </span>
                        </div>
                        {availableTemplates.length > 0 ? (
                          <div className="relative">
                            <select
                              value={currentTemplateId || availableTemplates.find(t => t.is_default)?.id || availableTemplates[0]?.id || ''}
                              onChange={(e) => {
                                const tplId = parseInt(e.target.value);
                                if (tplId) handleSelectDefaultTemplate(tplId);
                              }}
                              className="w-full bg-white dark:bg-[#06140e] border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 outline-none cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
                            >
                              {availableTemplates.map((tpl) => (
                                <option key={tpl.id} value={tpl.id} className="dark:bg-slate-900">
                                  {tpl.name || `Mẫu #${tpl.id}`} {tpl.is_default ? "★ (Mặc định)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-[10px] italic text-slate-400 py-1">Chưa có mẫu in nào trong thiết kế</div>
                        )}
                      </div>

                      <button onClick={() => {
                        Ct(!1), fs(!0);
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all group/menu-item w-full text-left"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Ln size={16} strokeWidth={2.5} /></div><span className="uppercase tracking-tight">Màn hình soạn hàng</span></button><button onClick={() => {
                        Ct(!1), setShowMascotCustomizer(!0);
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all group/menu-item w-full text-left"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Palette size={16} strokeWidth={2.5} /></div><span className="uppercase tracking-tight">Tùy biến Mascot in chìm</span></button><button onClick={() => {
                        Ct(!1), ba(!0);
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all group/menu-item"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Comp_la size={16} strokeWidth={2.5} /></div><span className="uppercase tracking-tight">Cài đặt giọng đọc (Loa)</span></button><button onClick={() => {
                        const t = !ga;
                        Vs(t), localStorage.setItem("pos_keep_order_after_save", t ? "true" : "false");
                        try {
                          const a = new BroadcastChannel("pos_data_sync");
                          a.postMessage({
                            type: "UI_SETTING_UPDATED",
                            key: "pos_keep_order_after_save",
                            value: t ? "true" : "false"
                          }), a.close();
                        } catch {}
                      }} className="flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-0.5 group/menu-item w-full text-left"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Comp_uo size={16} strokeWidth={2.5} /></div><div className="flex flex-col text-left"><span className="uppercase tracking-tight text-[11px]">Ở lại đơn vừa lưu</span><span className="text-[9px] font-bold text-slate-400 lowercase tracking-normal">{ga ? "bật: giữ lại giỏ hàng" : "tắt: tự xóa giỏ hàng"}</span></div></div><div className={c("w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center border", ga ? "bg-emerald-500 border-emerald-500 justify-end" : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 justify-start")}><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></div></button><button onClick={() => {
                        const t = ir === "card" ? "toast" : "card";
                        Ni(t), localStorage.setItem("pos_save_notice_style", t);
                        try {
                          const a = new BroadcastChannel("pos_data_sync");
                          a.postMessage({
                            type: "UI_SETTING_UPDATED",
                            key: "pos_save_notice_style",
                            value: t
                          }), a.close();
                        } catch {}
                      }} className="flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-0.5 group/menu-item w-full text-left"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Comp_mo size={16} strokeWidth={2.5} /></div><div className="flex flex-col text-left"><span className="uppercase tracking-tight text-[11px]">Kiểu báo lưu đơn</span><span className="text-[9px] font-bold text-slate-400 lowercase tracking-normal">{ir === "card" ? "thẻ nổi giữa màn hình" : "toast góc cũ"}</span></div></div><div className={c("w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center border", ir === "card" ? "bg-emerald-500 border-emerald-500 justify-end" : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 justify-start")}><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></div></button><button onClick={() => {
                        const t = !blockTabPrice;
                        setBlockTabPrice(t), localStorage.setItem("pos_block_tab_unit_price", t ? "true" : "false");
                        try {
                          const a = new BroadcastChannel("pos_data_sync");
                          a.postMessage({
                            type: "UI_SETTING_UPDATED",
                            key: "pos_block_tab_unit_price",
                            value: t ? "true" : "false"
                          }), a.close();
                        } catch {}
                      }} className="flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-0.5 group/menu-item w-full text-left"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Rs size={16} strokeWidth={2.5} /></div><div className="flex flex-col text-left"><span className="uppercase tracking-tight text-[11px]">Chặn Tab vào ô đơn giá</span><span className="text-[9px] font-bold text-slate-400 lowercase tracking-normal">{blockTabPrice ? "bật: bỏ qua ô giá khi Tab" : "tắt: Tab vào ô giá bình thường"}</span></div></div><div className={c("w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center border", blockTabPrice ? "bg-emerald-500 border-emerald-500 justify-end" : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 justify-start")}><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></div></button><button onClick={() => {
                        const t = !transparentCartTable;
                        setTransparentCartTable(t), localStorage.setItem("pos_transparent_cart_table", t ? "true" : "false");
                        try {
                          const a = new BroadcastChannel("pos_data_sync");
                          a.postMessage({
                            type: "UI_SETTING_UPDATED",
                            key: "pos_transparent_cart_table",
                            value: t ? "true" : "false"
                          }), a.close();
                        } catch {}
                      }} className="flex items-center justify-between px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-0.5 group/menu-item w-full text-left"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform"><Comp_mo size={16} strokeWidth={2.5} /></div><div className="flex flex-col text-left"><span className="uppercase tracking-tight text-[11px]">Lớp phủ mờ giỏ hàng</span><span className="text-[9px] font-bold text-slate-400 lowercase tracking-normal">{transparentCartTable ? "bật: lớp kính mờ nổi bật" : "tắt: trong suốt trùng màu nền"}</span></div></div><div className={c("w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center border", transparentCartTable ? "bg-emerald-500 border-emerald-500 justify-end" : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 justify-start")}><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></div></button><button onClick={() => {
                        Ct(!1), Ci();
                      }} className="flex items-center gap-3 px-3 py-2.5 text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-primary dark:hover:text-emerald-400 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-0.5 group/menu-item"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-primary dark:text-emerald-400 flex items-center justify-center group-hover/menu-item:scale-110 transition-transform">{Ze === "bottom" ? <Comp_xo size={16} strokeWidth={2.5} /> : <Comp_ho size={16} strokeWidth={2.5} />}</div><span className="uppercase tracking-tight">Chuyển bố cục: {Ze === "bottom" ? "Cột phải" : "Ở dưới"}</span></button></x.div>}</P></div><P mode="popLayout">{p && p.yearly_revenue > 0 && <x.div layout={!0} initial={{
                    opacity: 0,
                    x: -20,
                    scale: 0.8
                  }} animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1
                  }} exit={{
                    opacity: 0,
                    x: -20,
                    scale: 0.8
                  }} className="flex items-center h-9 relative overflow-hidden bg-[#8b6f47]/[0.06] hover:bg-[#8b6f47]/[0.1] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-[#8b6f47]/20 dark:border-white/10 hover:border-[#2d5016]/40 dark:hover:border-emerald-400/30 rounded-2xl px-3 backdrop-blur-md shadow-xs transition-all duration-300 shrink-0 group/revenue box-border"><div className="absolute -right-1 -bottom-1 text-[#2d5016]/10 dark:text-emerald-400/10 pointer-events-none transition-transform duration-300 group-hover/revenue:scale-110 group-hover/revenue:rotate-6"><Comp_u_d size={26} strokeWidth={2.5} /></div><div className="flex flex-col justify-center leading-none relative z-10"><p className="text-[8px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-wider leading-none mb-0.5">Doanh thu năm</p><p className="text-[13px] font-black text-[#2d5016] dark:text-[#e8dfd5] tabular-nums tracking-tight leading-none">{z(p.yearly_revenue)}</p></div></x.div>}</P></div></div><div className="flex-1 min-w-[8px]" /><div className="flex items-center gap-2 shrink-0"><div className="flex items-center gap-2 ml-auto"><div className="flex items-center gap-1 shrink-0 h-[26px]"><div className="max-w-[120px] overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1 shrink-0">{fe.map((t, a) => {
                    const r = t.id === g,
                      s = t.id === ne;
                    return <div key={t.id} className="group/tab relative shrink-0"><button onClick={n => {
                        n.stopPropagation(), es(t.id);
                      }} className={c("relative flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wide transition-all border cursor-pointer select-none shrink-0 h-[26px]", r ? "bg-[#2d5016] text-white border-[#2d5016] shadow-xs" : "bg-[#8b6f47]/[0.08] hover:bg-[#8b6f47]/15 text-[#8b6f47] dark:text-[#d4a574] border-[#8b6f47]/20 hover:border-[#2d5016]/40")}>{s && <span className="flex items-end gap-[1px] h-1.5 mr-0.5 pb-[1px] shrink-0"><span className={c("w-[1.2px] rounded-full", r ? "bg-white" : "bg-[#2d5016]")} style={{
                          height: "40%"
                        }} /><span className={c("w-[1.2px] rounded-full", r ? "bg-white" : "bg-[#2d5016]")} style={{
                          height: "70%"
                        }} /><span className={c("w-[1.2px] rounded-full", r ? "bg-white" : "bg-[#2d5016]")} style={{
                          height: "100%"
                        }} /></span>}<span>T{a + 1}</span>{fe.length > 1 && <span className={c("inline-flex items-center justify-center w-3 h-3 rounded-full ml-0.5 transition-colors text-[8px]", r ? "text-white/70 hover:text-white hover:bg-white/20" : "text-[#8b6f47]/60 hover:text-rose-500 hover:bg-rose-500/15")} onClick={n => {
                          n.stopPropagation(), Ei(t.id, n);
                        }}>✕</span>}</button>{!s && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/tab:opacity-100 pointer-events-none group-hover/tab:pointer-events-auto transition-opacity z-50"><button onClick={n => {
                          n.stopPropagation(), me(t.id);
                        }} className="bg-slate-800 text-white text-[8px] px-1 py-0.5 rounded-lg shadow-xl flex items-center gap-0.5 hover:bg-blue-600 transition-colors border border-white/20 whitespace-nowrap">Ghim quét</button></div>}</div>;
                  })}{q && <div className="group/tab relative shrink-0"><button onClick={t => {
                      t.stopPropagation(), f("remote_inspect");
                    }} className={c("relative flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider transition-all border cursor-pointer shrink-0 h-[26px]", g === "remote_inspect" ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20")}><SatelliteIcon size={11} className="mr-0.5 shrink-0 text-inherit" /><span className="font-extrabold flex items-center gap-0.5 text-inherit">.{(() => {
                          const t = k?.ip_address || (q.includes(".") ? q : "");
                          if (!t) return "LOCAL";
                          const a = t.split(".");
                          return a[a.length - 1];
                        })()}</span><span className="inline-flex items-center justify-center w-3 h-3 rounded-full ml-0.5 hover:bg-emerald-500/20 hover:text-emerald-600 transition-colors text-emerald-500/60 text-[8px]" onClick={t => {
                        t.stopPropagation(), br(null), g === "remote_inspect" && f(fe[0]?.id || "tab1");
                      }}>✕</span></button></div>}</div>{fe.length < 5 && <button onClick={t => {
                    t.stopPropagation(), Pi();
                  }} className="w-[26px] h-[26px] flex items-center justify-center bg-[#8b6f47]/[0.08] hover:bg-[#8b6f47]/15 border border-dashed border-[#8b6f47]/30 hover:border-[#2d5016] rounded-lg text-[#8b6f47] dark:text-[#d4a574] hover:text-[#2d5016] transition-all text-[10px] font-black cursor-pointer shrink-0" title="Thêm tab đơn mới (Ctrl+N)">＋</button>}<div className="relative shrink-0"><button ref={bs} onClick={t => {
                      t.stopPropagation(), Ma(!Zt);
                    }} className={c("relative w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-all cursor-pointer border shrink-0", Zt || q ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-xs" : "bg-[#2d5016]/10 hover:bg-[#2d5016]/20 text-[#2d5016] dark:text-emerald-400 border-[#2d5016]/20 hover:border-[#2d5016]/40")} title={(() => {
                      const t = new Set();
                      return `Giám sát máy trạm (${hr.filter(r => {
                        const s = r.ip_address || r.terminal_id;
                        return s && !t.has(s) ? (t.add(s), !0) : !1;
                      }).length} máy online)`;
                    })()}><TvMonitorIcon size={11} strokeWidth={2.3} className="shrink-0" />{(() => {
                        const t = new Set(),
                          a = hr.filter(r => {
                            const s = r.ip_address || r.terminal_id;
                            return s && !t.has(s) ? (t.add(s), !0) : !1;
                          });
                        return a.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 min-w-3 px-0.5 items-center justify-center rounded-full bg-emerald-500 text-[6.5px] font-black text-white shadow-xs ring-1 ring-card">{a.length}</span>;
                      })()}</button><P>{Zt ? <Fn><x.div initial={{
                          opacity: 0,
                          scale: 0.95,
                          y: -10
                        }} animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0
                        }} exit={{
                          opacity: 0,
                          scale: 0.95,
                          y: -10
                        }} transition={{
                          duration: 0.15,
                          ease: "easeOut"
                        }} style={(() => {
                          if (bs.current) {
                            const t = bs.current.getBoundingClientRect();
                            return {
                              position: "fixed",
                              top: t.bottom + 6 + "px",
                              right: Math.max(10, window.innerWidth - t.right) + "px",
                              zIndex: 99999
                            };
                          }
                          return {
                            position: "fixed",
                            top: "100px",
                            right: "100px",
                            zIndex: 99999
                          };
                        })()} className="w-[340px] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3.5 space-y-3 text-foreground ring-1 ring-border" onClick={t => t.stopPropagation()}><div className="pb-2 border-b border-border flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"><div className="flex items-center gap-1.5"><TvMonitorIcon size={12} className="text-emerald-500" />MÁY TRẠM HOẠT ĐỘNG</div></span><button onClick={() => Ma(!1)} className="text-muted-foreground hover:text-rose-500 text-sm font-black p-1 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer">✕</button></div><div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">{(() => {
                              const t = new Set(),
                                a = [],
                                r = [...hr].sort((s, n) => {
                                  const l = (s.terminal_name || "").includes("MÁY POS") || (s.terminal_id || "").includes("127.0.0.1"),
                                    d = (n.terminal_name || "").includes("MÁY POS") || (n.terminal_id || "").includes("127.0.0.1");
                                  return l && !d ? 1 : !l && d ? -1 : (n.terminal_id || "").length - (s.terminal_id || "").length;
                                });
                              for (const s of r) {
                                const n = s.ip_address || s.terminal_id;
                                n && !t.has(n) && (t.add(n), a.push(s));
                              }
                              return a.length === 0 ? <div className="p-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Không tìm thấy máy trạm nào online</div> : a.map(s => {
                                const n = q === s.terminal_id,
                                  l = s.total_items || (s.cart ? s.cart.reduce((u, h) => u + (h.quantity || 1), 0) : 0),
                                  d = (s.terminal_id || "").includes("Mobile") || (s.current_page || "").includes("Mobile"),
                                  o = s.total_amount || 0;
                                return <div key={s.terminal_id} className={c("w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all relative overflow-hidden", n ? "bg-emerald-500/15 border-emerald-500 text-foreground shadow-md shadow-emerald-500/5" : "bg-card/60 border-border hover:bg-card")}><div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => {
                                    br(s.terminal_id), Ma(!1), f("remote_inspect");
                                  }}><div className={c("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 text-sm", n ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-card border-border text-muted-foreground")}>{d ? <Rs size={16} /> : <TvMonitorIcon size={16} />}</div><div className="min-w-0 flex-1"><div className="text-xs font-black uppercase tracking-wide truncate text-foreground">{s.user_name && !s.user_name.includes("Thu ngân") ? `${s.user_name} (${s.ip_address})` : `MÁY POS (${s.ip_address})`}</div><div className="text-[10px] font-bold text-muted-foreground truncate flex items-center gap-1"><Qn size={10} />{s.terminal_name || s.terminal_id}</div></div></div><div className="text-right shrink-0 flex flex-col items-end gap-0.5"><div className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums flex items-center gap-0.5">{z(o)}đ</div><div className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-lg border border-amber-500/10 tabular-nums">{l} món</div></div><button onClick={u => {
                                    u.stopPropagation(), hn(s.cart);
                                  }} className="p-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/20 cursor-pointer shadow-xs" title="Sao chép nhanh giỏ hàng từ máy này"><Pn size={13} /></button></div>;
                              });
                            })()}</div></x.div></Fn> : null}</P></div></div><HeavyClock variant="purchase" gpuDisabled={Ya} /></div></div></div><P>{va && <Ee><div className="fixed inset-0 z-[2000] flex justify-end font-sans"><x.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => St(!1)} /><x.div initial={{
                  x: "100%",
                  opacity: 0
                }} animate={{
                  x: 0,
                  opacity: 1
                }} exit={{
                  x: "100%",
                  opacity: 0
                }} transition={{
                  type: "spring",
                  damping: 32,
                  stiffness: 260
                }} className="relative w-full max-w-[440px] h-full bg-[#022c22]/95 backdrop-blur-[100px]  flex flex-col border-l border-white/10"><div className="p-5 border-b border-white/10 relative overflow-hidden group"><div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 translate-x-4 -translate-y-4 pointer-events-none transition-transform group-hover:scale-110 duration-700 text-white"><Comp_jt size={100} /></div><div className="flex justify-between items-center relative z-10"><div className="flex items-center gap-4"><div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-amber-400 border border-white/10"><Comp_jt size={18} strokeWidth={2.5} /></div><div><h3 className="font-black text-[14px] text-white uppercase tracking-tighter leading-none mb-1">Hóa đơn chờ</h3><p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-amber-500" />Đang treo ({Fe.length})</p></div></div><button onClick={() => St(!1)} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 rounded-xl transition-all hover:rotate-90 border border-white/10 "><Comp_ke size={16} strokeWidth={3} /></button></div></div><div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-4">{Fe.length === 0 ? <div className="text-center py-40 opacity-20"><Comp_jt size={60} strokeWidth={1} className="mx-auto mb-8 text-white" /><p className="font-black uppercase text-[10px] tracking-[0.4em] text-white">Trống trải...</p></div> : <P mode="popLayout">{Fe.map((t, a) => <x.div key={t.id} id={a === 0 ? "first-held-card" : void 0} tabIndex={0} layout={!0} initial={{
                        opacity: 0,
                        x: 20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} exit={{
                        opacity: 0,
                        scale: 0.9,
                        x: 20
                      }} transition={{
                        delay: a * 0.04
                      }} className="bg-white/[0.04] border border-white/5 rounded-2xl p-4 hover:border-amber-500/40 focus:border-amber-500 focus:bg-white/[0.08] transition-all group hover:bg-white/[0.08] outline-none focus:outline-none cursor-pointer" onKeyDown={r => {
                        if (r.key === "ArrowDown") {
                          r.preventDefault();
                          const s = r.currentTarget.nextElementSibling;
                          s && s.focus();
                        } else if (r.key === "ArrowUp") {
                          r.preventDefault();
                          const s = r.currentTarget.previousElementSibling;
                          s && s.focus();
                        } else r.key === "Enter" && (r.preventDefault(), jn(t));
                      }}><div className="flex justify-between items-start mb-3"><div className="flex-1 pr-3 min-w-0"><div className="font-black text-white uppercase text-xs leading-tight group-hover:text-amber-400 transition-colors truncate">{t.partner ? t.partner.name : "KHÁCH BÁN LẺ"}</div><div className="flex items-center gap-3 mt-1.5"><div className="text-[8px] font-black text-white/30 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider tabular-nums border border-white/5">{t.time}</div><div className="text-[8px] font-black text-amber-400 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase tracking-widest">{t.cart.length} món</div></div></div></div>{t.cart && t.cart.length > 0 && <div className="border-t border-white/5 mt-2 pt-2 flex flex-wrap gap-1 mb-3">{t.cart.slice(0, 3).map((r, s) => <div key={s} className="px-1.5 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-md text-[8px] font-black text-amber-400/90 uppercase flex items-center gap-1 transition-all hover:bg-amber-500/10"><span className="truncate max-w-[70px]">{r.product_name}</span><div className="w-px h-1.5 bg-amber-500/20" /><span className="text-amber-300">{z(r.quantity)}</span></div>)}{t.cart.length > 3 && <div className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded-md text-[8px] font-black text-white/30 uppercase tracking-tighter">+{t.cart.length - 3} món</div>}</div>}<div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5"><div className="text-amber-400 font-black text-lg tracking-tighter tabular-nums">{z(t.total)}</div><div className="flex gap-2"><x.button whileHover={{
                              scale: 1.05
                            }} whileTap={{
                              scale: 0.95
                            }} onClick={() => cl(t.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/10 active:scale-95 flex items-center justify-center" title="Xóa hóa đơn chờ"><Comp_pa size={12} strokeWidth={2.5} /></x.button><x.button whileHover={{
                              scale: 1.05
                            }} whileTap={{
                              scale: 0.95
                            }} onClick={() => jn(t)} className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border border-amber-500/10 active:scale-95">MỞ LẠI</x.button></div></div></x.div>)}</P>}</div><div className="p-5 border-t border-white/10"><button onClick={() => St(!1)} className="w-full py-3.5 rounded-xl border border-white/10 text-white/30 font-black uppercase text-[9px] hover:bg-white/5 hover:text-white transition-all tracking-[0.3em] active:scale-[0.98]">Đóng</button></div></x.div></div></Ee>}</P><div className="flex-1 flex gap-3 px-4 pb-4 print:hidden min-h-0"><x.div initial={!1} animate={{
              width: Ze === "bottom" ? "100%" : ka ? "calc(100% - 370px)" : "calc(100% - 100px)"
            }} transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }} className="flex flex-col min-h-0 flex-1"><div className={c("flex-1 overflow-hidden relative transition-all duration-500 rounded-3xl", transparentCartTable ? "bg-card/30 dark:bg-card/25 backdrop-blur-md border-0 shadow-[0_0_25px_rgba(139,111,71,0.15),0_8px_32px_rgba(139,111,71,0.1)] dark:shadow-[0_0_30px_rgba(212,165,116,0.18)]" : "bg-transparent border-0 shadow-[0_0_25px_rgba(139,111,71,0.12),0_4px_20px_rgba(139,111,71,0.06)] dark:shadow-[0_0_28px_rgba(212,165,116,0.15)]")}><P>{fn && <x.div key="history-sync-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-[200] flex flex-col items-center justify-center gap-3.5 bg-transparent backdrop-blur-sm select-none rounded-3xl"><div className="relative w-16 h-16 flex items-center justify-center"><div className="absolute inset-0 rounded-full border-[2.5px] border-emerald-500/30 border-t-emerald-600 dark:border-white/10 dark:border-t-emerald-400 animate-spin" /><div className="absolute -inset-1.5 rounded-full border border-dashed border-[#8b6f47]/20 dark:border-white/10 pointer-events-none" /><div className="w-9 h-9 flex items-center justify-center relative z-10"><img src={kl} alt="LyangPOS" className="w-full h-full object-contain rounded-xl drop-shadow-md" /></div></div><div className="flex flex-col items-center gap-1"><span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8b6f47] dark:text-[#d4a574]">Lyang<span className="text-emerald-700 dark:text-emerald-400">POS</span></span><span className="text-xs font-black text-[#2d5016] dark:text-emerald-300 uppercase tracking-widest px-3.5 py-1 rounded-full bg-transparent border border-[#8b6f47]/25 dark:border-white/10 shadow-xs backdrop-blur-md">Đang đồng bộ dữ liệu...</span></div></x.div>}</P><P>{ve.length === 0 && !m.product && !Z && (g !== "remote_inspect" || !k?.cart || k.cart.length === 0) && !(g === "remote_inspect" && k) && (
              <x.div
                key="pos-empty-cart-overlay"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="absolute inset-x-0 top-[110px] bottom-4 z-20 flex flex-col items-center justify-center pointer-events-none select-none px-4"
              >
                <div className="flex flex-col items-center justify-center max-w-4xl w-full mx-auto pointer-events-auto">
                  <div 
                    onClick={() => setShowHotkeysGuide(prev => {
                      const next = !prev;
                      try { localStorage.setItem("pos_show_hotkeys_guide", String(next)); } catch (e) {}
                      return next;
                    })}
                    className="flex items-center gap-3.5 mb-2 cursor-pointer group select-none transition-transform hover:scale-[1.02] active:scale-98 text-left"
                  >
                    <div className="relative shrink-0">
                      <x.img
                        src="/assets/images/user_mascot.png"
                        alt="Lyang Mascot"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
                        draggable="false"
                        initial={{ scale: 0.8, rotate: -6 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wider text-[#2d5016] dark:text-[#d4a574] leading-tight flex items-center gap-2">
                        <span>Giỏ Hàng Chưa Có Sản Phẩm</span>
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#8b6f47]/90 dark:text-slate-400 leading-normal mt-1 whitespace-nowrap">
                        Gõ tên sản phẩm (F2) hoặc quét mã vạch ở ô trên để bắt đầu tạo đơn
                      </span>
                    </div>
                  </div>

                  {/* Fully Transparent Shortcut Grid (Collapsed by Default) */}
                  <Ws>
                    {showHotkeysGuide && (
                      <x.div
                        key="hotkeys-guide-panel"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="w-full overflow-hidden"
                      >
                        <div className="w-full pt-1">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-left">
                            {/* F2: Tìm kiếm */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Tìm kiếm SP</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F2</kbd>
                            </x.div>

                            {/* F3: Chọn khách */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Chọn khách</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F3</kbd>
                            </x.div>

                            {/* F4: Tạo đơn mới */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Tạo đơn mới</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F4</kbd>
                            </x.div>

                            {/* F6: Món tự do */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Món tự do</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F6</kbd>
                            </x.div>

                            {/* F8: Lưu tạm */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Lưu tạm đơn</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F8</kbd>
                            </x.div>

                            {/* F9: Thanh toán */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Thanh toán</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F9</kbd>
                            </x.div>

                            {/* F10: Đọc tiền */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Đọc số tiền</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F10</kbd>
                            </x.div>

                            {/* F12: Lưu / In */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-emerald-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-1">Lưu / In đơn</span>
                              <kbd className="px-1.5 py-0.5 bg-[#2d5016] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">F12</kbd>
                            </x.div>

                            {/* Tab: Chuyển ô */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-amber-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate pr-1">Chuyển ô</span>
                              <kbd className="px-1.5 py-0.5 bg-[#8b6f47] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">Tab</kbd>
                            </x.div>

                            {/* Enter: Thêm món */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-amber-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate pr-1">Thêm vào giỏ</span>
                              <kbd className="px-1.5 py-0.5 bg-[#8b6f47] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">Enter</kbd>
                            </x.div>

                            {/* Ctrl+Z: Hoàn tác */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-amber-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate pr-1">Hoàn tác</span>
                              <kbd className="px-1.5 py-0.5 bg-[#8b6f47] text-white rounded-md text-[9px] font-black font-mono shadow-2xs shrink-0">Ctrl+Z</kbd>
                            </x.div>

                            {/* Ctrl+Arrow: Đổi hóa đơn */}
                            <x.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-white/10 hover:border-amber-600/40 transition-colors group cursor-default">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate pr-1">Đổi tab đơn</span>
                              <kbd className="px-1 py-0.5 bg-[#8b6f47] text-white rounded-lg text-[8px] font-black font-mono shadow-2xs shrink-0">Ctrl+▲▼</kbd>
                            </x.div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#8b6f47]/15 dark:border-white/10 flex items-center justify-between text-[10px] text-[#8b6f47] dark:text-slate-400 px-1 font-bold">
                            <div className="flex items-center gap-1.5">
                              <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-md text-[9px] font-black font-mono">Esc</kbd>
                              <span>Đóng popup / Hủy</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200 rounded-md text-[9px] font-black font-mono">Ctrl+Space</kbd>
                              <span>Đơn treo / Chờ</span>
                            </div>
                          </div>
                        </div>
                      </x.div>
                    )}
                  </Ws>
                </div>
              </x.div>
            )}</P>{mascotWatermarkVisible && (
              <div 
                className={c(
                  "absolute pointer-events-none select-none z-0 overflow-hidden flex transition-all duration-200",
                  mascotWatermarkPos === "bottom-right" ? "right-0 bottom-0 items-end justify-end" :
                  mascotWatermarkPos === "bottom-left" ? "left-0 bottom-0 items-end justify-start" :
                  mascotWatermarkPos === "top-right" ? "right-0 top-0 items-start justify-end" :
                  mascotWatermarkPos === "top-left" ? "left-0 top-0 items-start justify-start" :
                  "inset-0 items-center justify-center"
                )}
                style={{ opacity: (mascotWatermarkOpacity || 15) / 100 }}
              >
                <img
                  src="/assets/images/user_mascot.png"
                  alt="Lyang Mascot"
                  style={{
                    width: `${Math.round(360 * ((mascotWatermarkScale || 100) / 100))}px`,
                    height: `${Math.round(360 * ((mascotWatermarkScale || 100) / 100))}px`,
                    transform: `translate(${mascotWatermarkOffsetX || 0}px, ${mascotWatermarkOffsetY || 0}px) rotate(${mascotWatermarkRotate || 0}deg)`,
                  }}
                  className="object-contain pointer-events-none select-none filter grayscale contrast-[300%] brightness-[90%] sepia-[0.35] hue-rotate-[30deg] dark:invert dark:grayscale dark:contrast-[250%] dark:brightness-[130%] mix-blend-multiply dark:mix-blend-screen transition-transform duration-100"
                  draggable="false"
                />
              </div>
            )}<div className="w-full h-full rounded-3xl overflow-hidden relative bg-transparent"><div className="absolute inset-0 overflow-y-scroll no-scrollbar-on-empty z-10 [scrollbar-gutter:stable]"><div className="w-full transition-colors relative pb-[400px]"><table className="w-full text-left border-collapse table-fixed"><colgroup><col style={{
                            width: "3.5%"
                          }} /><col style={{
                            width: "3.5%"
                          }} /><col style={{
                            width: "38%"
                          }} /><col style={{
                            width: "7%"
                          }} /><col style={{
                            width: "9%"
                          }} /><col style={{
                            width: "8%"
                          }} /><col style={{
                            width: "12%"
                          }} /><col style={{
                            width: "14%"
                          }} /><col style={{
                            width: "5%"
                          }} /></colgroup><thead className="bg-transparent sticky top-0 z-[100] print:hidden border-none"><tr className="border-none"><th className="py-2.5 px-2 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap">Stt</th><th onClick={t => {
                                t.stopPropagation();
                                if (ve && ve.length > 0) {
                                  const anyPacked = ve.some(item => item.isPacked);
                                  if (anyPacked) {
                                    H(r => r.map(item => ({ ...item, isPacked: false })));
                                    G({ message: "Đã uncheck toàn bộ danh sách để soạn lại!", type: "info" });
                                  } else {
                                    H(r => r.map(item => ({ ...item, isPacked: true })));
                                    G({ message: "Đã đánh dấu đã soạn toàn bộ!", type: "success" });
                                  }
                                }
                              }} className="py-2.5 px-2 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap cursor-pointer hover:text-primary transition-colors select-none" title="Bấm để uncheck toàn bộ / soạn lại">Soạn</th><th className="px-3 py-2.5 align-middle whitespace-nowrap"><div className="flex items-center justify-between w-full"><div className="flex items-center gap-2.5"><span className="font-black uppercase tracking-wider text-[11px] text-[#8b6f47] dark:text-[#d4a574]">Danh mục sản phẩm</span><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-emerald-400 text-[9px] font-black tracking-tight border border-primary/20"><span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400" />{ll} món</span></div><x.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={t => {
                                      t.stopPropagation();
                                      const a = J.ui_enable_smart_sorting === "true" ? "false" : "true";
                                      Na(r => ({
                                        ...r,
                                        ui_enable_smart_sorting: a
                                      })), localStorage.setItem("ui_enable_smart_sorting", a), new BroadcastChannel("pos_data_sync").postMessage({
                                        type: "UI_SETTING_UPDATED",
                                        key: "ui_enable_smart_sorting",
                                        value: a
                                      });
                                    }}
                                    className={c(
                                      "relative overflow-hidden flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all duration-300 select-none shadow-xs border backdrop-blur-md group/gom-nhom",
                                      J.ui_enable_smart_sorting === "true"
                                        ? "bg-[#2d5016]/12 hover:bg-[#2d5016]/20 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 border-[#2d5016]/40 dark:border-emerald-400/40 text-[#2d5016] dark:text-emerald-300 shadow-[0_0_12px_rgba(45,80,22,0.12)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        : "bg-[#8b6f47]/[0.06] hover:bg-[#8b6f47]/[0.12] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-[#8b6f47]/20 dark:border-white/10 text-[#8b6f47] dark:text-[#d4a574]"
                                    )}
                                    title="Gom nhóm thông minh tự động (Smart Sorting)"
                                  >
                                    <div className="absolute -right-1 -bottom-1.5 text-current opacity-[0.13] dark:opacity-[0.18] pointer-events-none -rotate-12 transition-transform duration-300 group-hover/gom-nhom:scale-125 select-none">
                                      <Es size={28} strokeWidth={2} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider leading-none relative z-10 pt-0.5">GOM NHÓM</span>
                                    <div
                                      className={c(
                                        "relative z-10 w-6 h-3.5 rounded-full transition-colors duration-300 p-0.5 flex items-center shadow-inner",
                                        J.ui_enable_smart_sorting === "true"
                                          ? "bg-[#2d5016] dark:bg-emerald-500 justify-end"
                                          : "bg-[#8b6f47]/25 dark:bg-white/20 justify-start"
                                      )}
                                    >
                                      <x.div
                                        layout={!0}
                                        transition={{
                                          type: "spring",
                                          stiffness: 600,
                                          damping: 35
                                        }}
                                        className="w-2.5 h-2.5 rounded-full bg-white shadow-sm ring-1 ring-black/10"
                                      />
                                    </div>
                                  </x.button></div></th><th className="py-2.5 px-3 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap">Đơn vị</th><th className="py-2 px-2 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap"><div className="flex flex-col items-center justify-center leading-tight"><span>Quy đổi</span><span className={c("text-[10px] font-mono tabular-nums transition-colors mt-0.5", dl > 0 ? "text-[#8b6f47] dark:text-[#d4a574] font-black" : "text-[#8b6f47]/40 dark:text-[#d4a574]/40 font-normal")}>{dl > 0 ? z(dl) : "—"}</span></div></th><th className="py-2 px-2 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap"><div className="flex flex-col items-center justify-center leading-tight"><span>Số lượng</span><span className={c("text-[10px] font-mono tabular-nums transition-colors mt-0.5", ol > 0 ? "text-primary dark:text-emerald-400 font-black" : "text-[#8b6f47]/40 dark:text-[#d4a574]/40 font-normal")}>{ol > 0 ? z(ol) : "—"}</span></div></th><th className="py-2.5 px-3 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap">Đơn giá</th><th className="py-2.5 px-3 text-center align-middle font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574] whitespace-nowrap">Thành tiền</th><th className="py-2.5 px-2 text-center align-middle" /></tr></thead><tbody className="divide-none"><tr className="bg-[#8b6f47]/[0.035] dark:bg-[#d4a574]/[0.03] backdrop-blur-md sticky top-[42px] z-[150] hover:z-[1000] focus-within:z-[2001] border-b border-[#8b6f47]/20 dark:border-[#d4a574]/20 transition-all hover:bg-[#8b6f47]/[0.06] dark:hover:bg-[#d4a574]/[0.06] shadow-[0_4px_20px_rgba(139,111,71,0.08),0_0_15px_rgba(139,111,71,0.05)] dark:shadow-[0_4px_20px_rgba(212,165,116,0.1),0_0_15px_rgba(212,165,116,0.06)] group/working-row" onDoubleClick={() => {
                            m.product && (Vt(m.product), vt(!0));
                          }}><td onClick={t => {
                              t.stopPropagation(), ve && ve.length > 0 ? qn(ve, T) : Ve.error("Giỏ hàng đang trống!");
                            }} title="Bấm để đọc toàn bộ danh sách soạn hàng" className="py-2.5 px-1 text-center cursor-pointer select-none rounded-l-xl group/speaker-td"><div className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center bg-primary/10 text-primary dark:text-[#d4a574] border border-primary/20 hover:bg-primary hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white hover:border-transparent hover:scale-110 active:scale-95 transition-all duration-200 shadow-xs"><Nd size={15} strokeWidth={2.5} className="group-hover/speaker-td:animate-pulse" /></div></td><td onClick={t => {
                                t.stopPropagation();
                                if (ve && ve.length > 0) {
                                  const anyPacked = ve.some(item => item.isPacked);
                                  if (anyPacked) {
                                    H(r => r.map(item => ({ ...item, isPacked: false })));
                                    G({ message: "Đã uncheck toàn bộ danh sách để soạn lại!", type: "info" });
                                  } else {
                                    H(r => r.map(item => ({ ...item, isPacked: true })));
                                    G({ message: "Đã đánh dấu đã soạn toàn bộ!", type: "success" });
                                  }
                                }
                              }} title="Bấm để uncheck toàn bộ danh sách để soạn lại" className="py-2.5 px-1 text-center cursor-pointer select-none"><div className="w-8 h-8 rounded-xl bg-primary/15 text-primary dark:text-[#d4a574] border border-primary/20 flex items-center justify-center mx-auto transition-all duration-200 group-hover/working-row:scale-110 shadow-xs hover:bg-primary/25 active:scale-95"><Ot size={16} strokeWidth={2.5} /></div></td><td className="py-2.5 px-2 relative"><div className="relative group/search flex items-center gap-2.5"><div className="relative flex-1"><div className="relative"><div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-primary/50 group-focus-within/search:text-primary transition-colors"><Gs size={18} strokeWidth={2.5} /></div><input type="text" placeholder="Tìm kiếm sản phẩm thông minh (F2)..." className="w-full h-10 py-1.5 pl-11 pr-14 bg-white/40 dark:bg-black/20 border border-[#8b6f47]/25 dark:border-[#d4a574]/25 shadow-[0_0_12px_rgba(139,111,71,0.08)] dark:shadow-[0_0_12px_rgba(212,165,116,0.08)] rounded-xl font-extrabold font-sans text-[13.5px] tracking-normal leading-normal text-slate-900 dark:text-white outline-none transition-all focus:border-[#8b6f47]/60 dark:focus:border-[#d4a574]/60 focus:ring-2 focus:ring-[#8b6f47]/20 dark:focus:ring-[#d4a574]/20 focus:shadow-[0_0_18px_rgba(139,111,71,0.2)] dark:focus:shadow-[0_0_20px_rgba(212,165,116,0.25)] focus:bg-white/60 dark:focus:bg-black/30 placeholder:text-slate-500/90 dark:placeholder:text-slate-400/90 placeholder:text-[12.5px] placeholder:font-bold placeholder:font-sans placeholder:tracking-tight" autoComplete="off" value={Z} onChange={t => {
                                      const a = t.target.value;
                                      playTypingSoundUtil();
                                      ae(a), Ft(0), os(!0);
                                      if (se.current) {
                                        const rect = se.current.getBoundingClientRect();
                                        if (rect.width > 0 && rect.bottom > 0) {
                                          setProductSearchCoords({
                                            top: rect.bottom + 6,
                                            left: rect.left,
                                            width: Math.max(rect.width, 700)
                                          });
                                        }
                                      }
                                      if (!a || a.trim() === "") {
                                        He({
                                          product: null,
                                          name: "",
                                          quantity: 0,
                                          price: 0,
                                          secondary_qty: 0
                                        });
                                      } else if (m.product && a !== m.name) {
                                        He({
                                          ...m,
                                          product: null,
                                          name: a,
                                          quantity: 0,
                                          price: 0,
                                          secondary_qty: 0
                                        });
                                      }
                                    }} onKeyDown={t => {
                                      if (t.key === "Escape") {
                                        t.preventDefault(), ae(""), os(!1), He({
                                          product: null,
                                          quantity: 0,
                                          price: 0,
                                          secondary_qty: 0,
                                          name: ""
                                        });
                                      } else if (t.key === "ArrowUp") t.preventDefault(), Ft(a => {
                                        const r = Math.max(a - 1, 0),
                                          s = hs.current;
                                        if (s) {
                                          const n = s.children[r];
                                          n && n.scrollIntoView({
                                            block: "nearest"
                                          });
                                        }
                                        return r;
                                      });else if (t.key === "ArrowDown") t.preventDefault(), Ft(a => {
                                        const r = Math.min(a + 1, wt.length - 1),
                                          s = hs.current;
                                        if (s) {
                                          const n = s.children[r];
                                          n && n.scrollIntoView({
                                            block: "nearest"
                                          });
                                        }
                                        return r;
                                      });else if (t.key === "Enter") {
                                        t.preventDefault();
                                        const a = t.target.value.trim();
                                        if (m.product && m.product.id) {
                                          const r = m.quantity && m.quantity !== 0 ? m.quantity : 1;
                                          ia(m.product, r, m.price);
                                          return;
                                        }
                                        if (a && wt.length === 0) {
                                          G({
                                            message: `Mã vạch ${a} không tồn tại`,
                                            type: "error"
                                          }), ae("");
                                          return;
                                        }
                                        if (Z && wt[De]) {
                                           const a = wt[De],
                                             r = m.quantity && m.quantity !== 0 ? m.quantity : 1,
                                             pPrice = R[a.id] !== void 0 ? R[a.id] : a.sale_price;
                                           ia(a, r, pPrice);
                                           return;
                                         }
                                      } else if (t.key === "Tab") {
                                        if (t.preventDefault(), t.stopPropagation(), m.product) {
                                          const a = Te === "Wholesale" && m.product.secondary_unit ? Pa : Pt;
                                          a.current?.focus(), a.current?.select();
                                        } else if (Z && wt[De]) {
                                          const a = wt[De],
                                            r = m.quantity && m.quantity !== 0 ? m.quantity : 1;
                                          He({
                                            product: a,
                                            quantity: r,
                                            price: R[a.id] !== void 0 ? R[a.id] : a.sale_price,
                                            secondary_qty: r / (a.multiplier || 1),
                                            name: a.name
                                          }), ae(a.name), setTimeout(() => {
                                            const s = Te === "Wholesale" && a.secondary_unit ? Pa : Pt;
                                            s.current?.focus(), s.current?.select?.();
                                          }, 0);
                                        }
                                      }
                                    }} onFocus={t => {
                                      t.target.select(), os(!0);
                                    }} onBlur={() => {
                                      setTimeout(() => os(!1), 200);
                                    }} ref={se} />{m.product && <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="flex items-center gap-2 relative z-[200]"><div onClick={t => {
                                      t.stopPropagation();
                                      const a = t.currentTarget.getBoundingClientRect();
                                      Xt(m.product), za({
                                        top: a.top,
                                        bottom: a.bottom,
                                        left: a.left,
                                        right: a.right
                                      }), Dt(!0);
                                    }} className={c("px-2.5 py-1 rounded-full text-[11px] font-black border transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 group/stock cursor-pointer select-none shadow-xs", m.product.stock <= 0 ? "bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-rose-600/20" : m.product.stock < 10 ? "bg-amber-500 dark:bg-amber-500 text-amber-950 dark:text-slate-950 border-amber-600 dark:border-amber-400 shadow-amber-500/20 font-black" : "bg-[#2d5016] dark:bg-emerald-600 text-white border-[#234011] dark:border-emerald-500 shadow-[#2d5016]/20 font-black")} title="Kiểm tồn nhanh"><div className="flex items-center gap-1 tabular-nums">{m.product.stock <= 0 ? <Pr size={13} strokeWidth={2.8} className="text-white shrink-0" /> : m.product.stock < 10 ? <Comp_da size={13} strokeWidth={2.8} className="text-amber-950 dark:text-slate-950 shrink-0" /> : <Qa size={13} strokeWidth={2.8} className="text-white shrink-0" />}<span className="tabular-nums font-black">{m.product.stock}</span></div>{localStorage.getItem('feature_accounting_enabled') !== 'false' && <><span className="w-px h-3 bg-white/40 shrink-0" /><div className="inline-flex items-center gap-1 text-white/90 shrink-0 whitespace-nowrap" title="Tồn sổ sách kế toán"><ReceiptTextIcon size={12} strokeWidth={2.4} className="shrink-0 text-white" /><span className="tabular-nums font-black">{m.product.accounting_stock || 0}</span></div></>}</div></div></div>}</div></div><x.button whileHover={{
                                  scale: 1.02
                                }} whileTap={{
                                  scale: 0.95
                                }} onClick={() => {
                                  La(!0), $a({
                                    name: "",
                                    price: ""
                                  }), ae(""), setTimeout(() => ys.current?.focus(), 100);
                                }} tabIndex={-1} className="h-8 px-2 bg-[#8b6f47]/[0.08] hover:bg-[#2d5016] text-[#2d5016] hover:text-white dark:bg-white/[0.05] dark:hover:bg-[#2d5016] dark:text-[#d4a574] dark:hover:text-white rounded-xl font-black flex items-center gap-1 shadow-xs border border-[#8b6f47]/25 hover:border-[#2d5016] dark:border-white/10 dark:hover:border-[#d4a574]/40 transition-all duration-200 whitespace-nowrap shrink-0 group/f6 active:scale-95 cursor-pointer" title="Thêm món ngoài (F6)"><div className="w-4.5 h-4.5 rounded-md bg-[#2d5016]/10 text-[#2d5016] group-hover/f6:bg-white/20 group-hover/f6:text-white dark:bg-[#d4a574]/15 dark:text-[#d4a574] dark:group-hover/f6:text-white flex items-center justify-center group-hover/f6:rotate-12 transition-all"><Ot size={11} strokeWidth={3} /></div><div className="px-1 py-0.5 rounded bg-[#8b6f47]/15 dark:bg-[#d4a574]/20 group-hover/f6:bg-white/20 text-[#8b6f47] dark:text-[#d4a574] group-hover/f6:text-white text-[7.5px] font-black border border-[#8b6f47]/20 dark:border-[#d4a574]/30 group-hover/f6:border-white/30 transition-all">F6</div></x.button></div><Fn><P>{Z && !m.product && Li && productSearchCoords.top > 0 && <x.div key="pos-product-dropdown" initial={{
                                  opacity: 0,
                                  y: -5
                                }} animate={{
                                  opacity: 1,
                                  y: 0
                                }} exit={{
                                  opacity: 0,
                                  y: -5
                                }} transition={{
                                  duration: 0.15
                                }} className="fixed dropdown-premium backdrop-blur-xl backdrop-saturate-150 !z-[400000] shadow-2xl rounded-2xl border border-[#8b6f47]/30 dark:border-white/10 overflow-hidden" style={{
                                  backgroundColor: Mt.glassBg,
                                  top: productSearchCoords.top,
                                  left: productSearchCoords.left,
                                  width: Math.min(productSearchCoords.width || 700, typeof window !== "undefined" ? window.innerWidth - (productSearchCoords.left || 0) - 16 : 700),
                                  maxHeight: Math.min(480, typeof window !== "undefined" ? window.innerHeight - (productSearchCoords.top || 0) - 16 : 480)
                                }}><div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" /><div className="max-h-[480px] overflow-y-auto custom-scrollbar" ref={hs}>{wt.map((t, a) => <div key={t.id} onMouseMove={() => { if (De !== a) Ft(a); }} onMouseDown={r => {
                                      r.preventDefault();
                                      const s = m.quantity && m.quantity !== 0 ? m.quantity : 1;
                                      He({
                                        product: t,
                                        quantity: s,
                                        price: R[t.id] !== void 0 ? R[t.id] : t.sale_price,
                                        secondary_qty: s / (t.multiplier || 1),
                                        name: t.name
                                      }), ae(t.name);
                                    }} className={c("dropdown-item flex justify-between items-center", a === De && "active")}><div className="flex-1 flex flex-col gap-1.5 relative z-10 min-w-0 overflow-hidden mr-3"><div className="flex items-center gap-3 min-w-0"><div className="min-w-0 flex-1 overflow-hidden"><Ps text={t.name} isActive={a === De} className="font-black tracking-tight transition-all duration-300 leading-relaxed" style={{
                                              color: a === De ? Mt.accent : Mt.main,
                                              fontSize: a === De ? "18px" : "16px",
                                              paddingLeft: a === De ? "12px" : "0px"
                                            }} /></div>{t.is_combo && <span className="shrink-0 px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black tracking-widest">COMBO</span>}</div><div className="flex items-center gap-5"><span className="text-[11px] font-black italic tracking-wide transition-colors" style={{
                                              color: a === De ? Mt.accentMuted : Mt.muted
                                            }}>{t.active_ingredient || ""}</span><div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.code && <span className={c("shrink-0 px-2 py-0.5 rounded-md font-mono text-[9.5px] font-black tabular-nums border transition-colors", a === De ? "bg-white/20 border-white/30 text-white" : "bg-slate-900/5 dark:bg-white/10 border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300")}>{t.code}</span>}<span className={c("px-2 py-0.5 rounded-md border transition-colors", a === De ? "bg-white/20 border-white/30 text-white" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300")}>{Ae(t.unit)}</span>{t.multiplier > 1 && <span className={a === De ? "text-white/60" : "text-slate-500 opacity-60"}>/ {Ae(t.secondary_unit)} (x{t.multiplier})</span>}</div></div></div><div className="flex items-center gap-8 relative z-10"><div onClick={r => {
                                          r.stopPropagation();
                                          const s = r.currentTarget.getBoundingClientRect();
                                          Xt(t), za({
                                            top: s.top,
                                            bottom: s.bottom,
                                            left: s.left,
                                            right: s.right
                                          }), Dt(!0);
                                        }} className={c("px-3 py-1.5 rounded-full text-xs font-black border transition-all flex items-center gap-2 hover:scale-105 active:scale-95 group/stock cursor-pointer select-none shadow-xs", t.stock <= 0 ? "bg-rose-600 text-white" : t.stock < 10 ? "bg-amber-500 text-slate-950" : "bg-[#2d5016] dark:bg-emerald-600 text-white", a === De ? "border-white/90 shadow-sm" : "border-white/20 dark:border-white/20")} title="Kiểm tồn nhanh"><div className="flex items-center gap-1.5 tabular-nums">{t.stock <= 0 ? <Pr size={14} strokeWidth={2.8} className="text-white shrink-0" /> : t.stock < 10 ? <Comp_da size={14} strokeWidth={2.8} className="text-slate-950 shrink-0" /> : <Qa size={14} strokeWidth={2.8} className="text-white shrink-0" />}<span className={c("tabular-nums font-black", t.stock < 10 && t.stock > 0 ? "text-slate-950" : "text-white")}>{t.stock}</span></div>{localStorage.getItem('feature_accounting_enabled') !== 'false' && <><span className={c("w-px h-3.5 shrink-0", t.stock < 10 && t.stock > 0 ? "bg-slate-950/30" : "bg-white/40")} /><div className={c("inline-flex items-center gap-1 shrink-0 whitespace-nowrap", t.stock < 10 && t.stock > 0 ? "text-slate-950" : "text-white/90")} title="Tồn sổ sách kế toán"><ReceiptTextIcon size={13} strokeWidth={2.4} className={c("shrink-0", t.stock < 10 && t.stock > 0 ? "text-slate-950" : "text-white")} /><span className={c("tabular-nums font-black", t.stock < 10 && t.stock > 0 ? "text-slate-950" : "text-white")}>{t.accounting_stock || 0}</span></div></>}</div><div className="flex flex-col items-end gap-1"><div className="text-[22px] font-black tracking-tighter tabular-nums drop-" style={{
                                              color: a === De ? Mt.accent : Mt.main
                                            }}>{z(t.sale_price)}</div><div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest opacity-80">NHẬP CUỐI: {z(t.latest_cost_price)}</div></div></div></div>)}</div>{Z && wt.length === 0 && <div className="dropdown-item flex items-center justify-center gap-3 font-black uppercase text-[12px] tracking-widest border-t border-transparent" onClick={() => {
                                      dn(Z), ur(!0);
                                    }}><Ot size={18} strokeWidth={3} /><span>Thêm sản phẩm mới: "{Z}"</span></div>}</x.div>}</P></Fn></td><td className="py-2.5 px-2 text-center"><div className="font-bold font-sans text-slate-700 dark:text-slate-200 text-xs leading-normal">{m.product ? Ae(m.product.unit) : "-"}</div>{m.product && m.product.secondary_unit && <div className="text-[9.5px] text-primary dark:text-[#d4a574] font-black uppercase tracking-tighter leading-tight font-sans">1 {Ae(m.product.secondary_unit)} = {m.product.multiplier} {Ae(m.product.unit)}</div>}</td><td className="py-2.5 px-2">{m.product && m.product.secondary_unit ? <div className="flex items-center gap-1 h-10 px-2 bg-white/40 dark:bg-black/20 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-[0_0_10px_rgba(139,111,71,0.06)] dark:shadow-[0_0_10px_rgba(212,165,116,0.06)] rounded-xl focus-within:bg-white/60 dark:focus-within:bg-black/30 focus-within:border-[#8b6f47]/50 dark:focus-within:border-[#d4a574]/50 focus-within:ring-2 focus-within:ring-[#8b6f47]/15 focus-within:shadow-[0_0_15px_rgba(139,111,71,0.18)] dark:focus-within:shadow-[0_0_15px_rgba(212,165,116,0.2)] transition-all text-primary dark:text-foreground"><input type="number" className="w-full min-w-0 bg-transparent text-center font-black font-sans text-sm outline-none placeholder:text-muted-foreground/30 leading-normal" value={m.secondary_qty || ""} id="working-sec-qty" ref={Pa} autoComplete="off" onFocus={t => t.target.select()} onChange={t => {
                                    const a = parseFloat(t.target.value) || 0;
                                    He(r => {
                                      const s = parseFloat(r.product?.multiplier) || 1;
                                      return {
                                        ...r,
                                        secondary_qty: a,
                                        quantity: a * s
                                      };
                                    });
                                  }} onKeyDown={t => {
                                    if (t.key === "Tab") {
                                      t.preventDefault(), t.stopPropagation();
                                      if (t.shiftKey) {
                                        se.current?.focus(), se.current?.select?.();
                                      } else {
                                        Pt.current?.focus(), Pt.current?.select?.();
                                      }
                                    } else if (t.key === "Enter") {
                                      t.preventDefault(), m.product && m.quantity !== 0 && ia(m.product, m.quantity, m.price);
                                    }
                                  }} /><span className="text-[10px] font-black font-sans text-muted-foreground uppercase pr-1 shrink-0 leading-normal">{Ae(m.product.secondary_unit)}</span></div> : <div className="text-center text-muted-foreground italic text-[10px] font-bold h-[40px] flex items-center justify-center font-sans">N/A</div>}</td><td className="py-2.5 px-2 group/qty"><div className="relative w-full"><input type="number" className="w-full h-10 text-center bg-white/40 dark:bg-black/20 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-[0_0_10px_rgba(139,111,71,0.06)] dark:shadow-[0_0_10px_rgba(212,165,116,0.06)] rounded-xl focus:bg-white/60 dark:focus:bg-black/30 focus:border-[#8b6f47]/50 dark:focus:border-[#d4a574]/50 focus:ring-2 focus:ring-[#8b6f47]/15 focus:shadow-[0_0_15px_rgba(139,111,71,0.18)] dark:focus:shadow-[0_0_15px_rgba(212,165,116,0.2)] outline-none font-black font-sans text-base text-primary dark:text-foreground leading-normal transition-all" value={m.product ? m.quantity : ""} id="working-main-qty" ref={Pt} autoComplete="off" onFocus={t => t.target.select()} onChange={t => {
                                    const a = parseFloat(t.target.value) || 0;
                                    He(r => {
                                      const s = parseFloat(r.product?.multiplier) || 1;
                                      return {
                                        ...r,
                                        quantity: a,
                                        secondary_qty: a / s
                                      };
                                    });
                                  }} onKeyDown={t => {
                                    if (t.key === "Tab") {
                                      t.preventDefault(), t.stopPropagation();
                                      if (t.shiftKey) {
                                        if (m.product?.secondary_unit) {
                                          Pa.current?.focus(), Pa.current?.select?.();
                                        } else {
                                          se.current?.focus(), se.current?.select?.();
                                        }
                                      } else {
                                        if (blockTabPrice) {
                                          t.target.select?.();
                                        } else {
                                          ms.current?.focus(), ms.current?.select?.();
                                        }
                                      }
                                    } else if (t.key === "Enter") {
                                      t.preventDefault(), m.product && m.quantity !== 0 && ia(m.product, m.quantity, m.price);
                                    }
                                  }} /><button tabIndex={-1} className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-white/60 dark:bg-black/40 text-[#8b6f47] dark:text-[#d4a574] rounded-full border border-white/50 dark:border-white/10 hover:bg-white active:scale-90 z-[70] transition-all hover:scale-110 opacity-0 group-hover/qty:opacity-100 shadow-xs" onClick={() => {
                                    He(t => ({
                                      ...t,
                                      quantity: t.quantity * -1,
                                      secondary_qty: t.secondary_qty * -1
                                    })), Pt.current?.focus();
                                  }} title="Đổi thành Trả Hàng (Âm)"><Ms size={11} strokeWidth={3} /></button></div></td><td className="py-2.5 px-2 text-right"><div className="flex flex-col items-center gap-1 group/price relative group-hover/price:z-[500]">{m.product && <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-1 bg-[#fbf9f4]/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-[#8b6f47]/30 dark:border-white/15 shadow-2xl shadow-[#8b6f47]/10 dark:shadow-black/50 flex items-stretch whitespace-nowrap z-[9999] opacity-0 group-hover/price:opacity-100 group-focus-within/price:opacity-100 transition-all duration-300 pointer-events-none -translate-y-2 group-hover/price:translate-y-0 group-focus-within/price:translate-y-0 ring-1 ring-black/5 dark:ring-white/5"><div className="flex flex-col items-center px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"><span className="text-[8.5px] uppercase font-black font-sans text-slate-500/80 dark:text-slate-400 leading-none mb-1 tracking-[0.1em]">Vốn TB</span><span className="text-xs font-black font-sans text-amber-700 dark:amber-300 tabular-nums leading-normal">{z(m.product.cost_price)}<span className="text-[9px] ml-0.5 opacity-60">đ</span></span></div><div className="w-px my-1.5 bg-gradient-to-b from-transparent via-[#8b6f47]/20 dark:via-white/15 to-transparent" /><div className="flex flex-col items-center px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"><span className="text-[8.5px] uppercase font-black font-sans text-[#8b6f47] dark:text-[#d4a574] leading-none mb-1 tracking-[0.1em]">Nhập cuối</span><span className="text-xs font-black font-sans text-emerald-600 dark:text-emerald-400 tabular-nums leading-normal">{z(m.product.latest_cost_price || 0)}<span className="text-[9px] ml-0.5 opacity-60">đ</span></span></div><div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#fbf9f4]/95 dark:border-b-slate-900/95 drop-shadow-xs" /></div>}<input type="text" tabIndex={blockTabPrice ? -1 : 0} className={c("w-full h-10 text-center bg-white/40 dark:bg-black/20 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-[0_0_10px_rgba(139,111,71,0.06)] dark:shadow-[0_0_10px_rgba(212,165,116,0.06)] rounded-xl focus:bg-white/60 dark:focus:bg-black/30 focus:border-[#8b6f47]/50 dark:focus:border-[#d4a574]/50 focus:ring-2 focus:ring-[#8b6f47]/15 focus:shadow-[0_0_15px_rgba(139,111,71,0.18)] dark:focus:shadow-[0_0_15px_rgba(212,165,116,0.2)] outline-none font-black font-sans text-base leading-normal transition-all", m.product && m.price < m.product.cost_price ? "text-rose-600 dark:text-rose-400 bg-rose-500/15 dark:bg-rose-900/20 focus:ring-rose-200" : m.product && m.price < (m.product.latest_cost_price || 0) ? "text-orange-600 dark:text-orange-400 bg-orange-500/15 dark:bg-orange-900/10 focus:ring-orange-200" : "text-primary dark:text-foreground")} value={m.product ? z(m.price) : ""} id="working-price" ref={ms} autoComplete="off" onFocus={t => t.target.select()} onChange={t => {
                                    const a = parseFloat(t.target.value.replace(/,/g, "")) || 0;
                                    He({
                                      ...m,
                                      price: a
                                    });
                                  }} onKeyDown={t => {
                                    t.key === "Enter" ? (t.preventDefault(), m.product && m.quantity !== 0 && ia(m.product, m.quantity, m.price)) : t.key === "Tab" && !t.shiftKey && (t.preventDefault(), t.stopPropagation(), se.current?.focus());
                                  }} /><P>{m.product && m.price < m.product.cost_price && <x.div initial={{
                                      opacity: 0,
                                      scale: 0.8,
                                      y: -5
                                    }} animate={{
                                      opacity: 1,
                                      scale: 1,
                                      y: 0
                                    }} className="bg-rose-500/90 text-white text-[8.5px] px-1.5 py-0.5 rounded-lg font-black whitespace-nowrap z-10 flex items-center gap-1 shadow-rose-500/30 border border-white/20"><Comp_da size={11} strokeWidth={3} className="text-white" />LỖ VỐN</x.div>}{m.product && m.price < (m.product.latest_cost_price || 0) && m.price >= m.product.cost_price && <x.div initial={{
                                      opacity: 0,
                                      scale: 0.8,
                                      y: -5
                                    }} animate={{
                                      opacity: 1,
                                      scale: 1,
                                      y: 0
                                    }} className="bg-orange-500/90 text-white text-[8.5px] px-1.5 py-0.5 rounded-lg font-black whitespace-nowrap z-10 flex items-center gap-1 shadow-orange-500/30 border border-white/20"><$n size={11} strokeWidth={3} className="text-white" />DƯỚI VỐN NHẬP</x.div>}{m.product && m.price < m.product.sale_price && m.price >= (m.product.latest_cost_price || m.product.cost_price) && <x.div initial={{
                                      opacity: 0,
                                      scale: 0.8,
                                      y: -5
                                    }} animate={{
                                      opacity: 1,
                                      scale: 1,
                                      y: 0
                                    }} className="bg-amber-500/90 text-white text-[8.5px] px-1.5 py-0.5 rounded-lg font-black whitespace-nowrap z-10 flex items-center gap-1 border border-white/20"><Cd size={11} strokeWidth={3} className="text-white" />GIÁ THẤP ({lt(m.product.sale_price)})</x.div>}{m.product && p && R[m.product.id] !== void 0 && m.price === m.product.sale_price && <x.div initial={{
                                      opacity: 0,
                                      scale: 0.8,
                                      y: -5
                                    }} animate={{
                                      opacity: 1,
                                      scale: 1,
                                      y: 0
                                    }} className="px-2 py-0.5 rounded-lg bg-indigo-500/90 dark:bg-indigo-600/90 border border-white/20 flex items-center gap-1 overflow-hidden"><Sd size={11} className="text-white fill-white/20" /><span className="text-[8.5px] font-black uppercase tracking-wider text-white">Đồng bộ giá</span></x.div>}</P></div></td><td className="py-2 px-2 text-right"><div className={c("font-black font-sans text-base leading-normal transition-colors", m.quantity < 0 ? "text-rose-600 dark:text-rose-400" : "text-primary")}>{m.product ? z(m.price * m.quantity) : ""}</div>{m.quantity < 0 && <span className="inline-block px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[8.5px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800/50 mt-0.5">Hàng trả</span>}</td><td className="py-2 px-1.5 text-center">{m.product && <button onClick={() => {
                                  ae("");
                                  He({
                                    product: null,
                                    quantity: 0,
                                    price: 0,
                                    secondary_qty: 0,
                                    name: ""
                                  });
                                  se.current?.focus();
                                }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all" title="Xóa dòng"><Comp_ke size={17} /></button>}</td></tr><P initial={!1}>{...Qi || []}{g !== "remote_inspect" && !fn && ve.length > 0 && ve.map((t, a) => <x.tr key={t.cartId || `cart-row-${a}-${t.product_id}`} layout={!0} initial={{
                              opacity: 0,
                              x: -20
                            }} animate={{
                              opacity: t.isPacked ? 0.6 : 1,
                              x: 0
                            }} exit={{
                              opacity: 0,
                              x: 50,
                              scale: 0.95,
                              backgroundColor: "rgba(0,0,0,0)",
                              transition: {
                                duration: 0.2,
                                ease: "easeIn"
                              }
                            }} whileHover={{
                              scale: 1.008,
                              y: -3,
                              transition: {
                                duration: 0.2,
                                ease: "easeOut"
                              }
                            }} transition={{
                              duration: 0.3,
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                              delay: a * 0.02
                            }} id={`cart-row-${a}`} className={c("relative transition-colors duration-200 group cursor-pointer border-b border-[#8b6f47]/10 dark:border-white/5 last:border-b-0", t.isPacked && "line-through decoration-emerald-500/30 opacity-50", Tt === a ? "z-[3500] bg-white/5 dark:bg-slate-800/20" : "z-[50] hover:z-[3000] group-hover/price:z-[4000] focus-within:z-[3000] bg-transparent")} onDoubleClick={() => {
                              const r = T.find(s => s.id === t.product_id);
                              r && (Vt(r), vt(!0));
                            }}><td onClick={r => {
                                r.stopPropagation();
                                const s = T.find(l => l.id === t.product_id) || t,
                                  rawAlias = (s.alias && s.alias.trim()) || (t.alias && t.alias.trim()) || "",
                                  alias = rawAlias || t.product_name,
                                  qty = t.quantity,
                                  S = localStorage.getItem("pos_tts_cart_speech_order") || "name_first";

                                S === "qty_first" 
                                  ? speakAudioSequence([qty, alias]) 
                                  : speakAudioSequence([alias, qty]);
                              }} title="Bấm để đọc tên và số lượng" className="py-2 px-2 text-center tabular-nums cursor-pointer select-none rounded-l-xl group/index-td"><div className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-black text-xs text-slate-400 dark:text-slate-500 group-hover/index-td:text-emerald-600 dark:group-hover/index-td:text-emerald-400 group-hover/index-td:bg-emerald-500/15 group-hover/index-td:border group-hover/index-td:border-emerald-500/20 group-hover/index-td:scale-110 group-hover/index-td:shadow-xs active:scale-95 transition-all duration-200">{a + 1}</div></td><td className="py-2 px-2 text-center"><button onClick={r => {
                                  r.stopPropagation(), xl(a);
                                }} className={c("w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 border-2 cursor-pointer", t.isPacked ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105" : "bg-transparent border-slate-300/80 dark:border-white/20 text-slate-400/80 dark:text-slate-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 hover:scale-110 active:scale-95 shadow-none hover:shadow-xs")}><Hn size={16} strokeWidth={3.5} className="transition-transform duration-200" /></button></td><td className="py-2 px-2 relative"><div className="relative group/search-row" onDoubleClick={r => {
                                  r.preventDefault();
                                  const s = T.find(n => n.id === t.product_id);
                                  s && (Vt(s), vt(!0));
                                }}>{Tt === a ? <input type="text" autoComplete="off" autoFocus={!0} className={c("w-full h-auto py-2.5 pl-4 pr-28 bg-white/10 dark:bg-slate-800/30 rounded-xl border-0 border-transparent outline-none focus:outline-none ring-0 focus:ring-0 focus:ring-transparent focus:border-transparent focus:border-0", "text-[17px] font-black tracking-tight transition-all leading-relaxed placeholder:normal-case placeholder:leading-relaxed", "text-emerald-900 dark:text-emerald-300 placeholder:text-gray-300", t.ai_scanned && "pb-6")} value={zt} onFocus={r => {
                                    ct(a), ls(t.product_name), Ca(0), r.target.select(), r.target.scrollIntoView({
                                      block: "nearest",
                                      behavior: "smooth"
                                    });
                                  }} onChange={r => {
                                    ls(r.target.value), Ca(0);
                                  }} onBlur={() => {
                                    setTimeout(() => {
                                      ct(r => r === a ? null : r);
                                    }, 200);
                                  }} onDoubleClick={() => {
                                    const r = T.find(s => s.id === t.product_id);
                                    r && (Vt(r), vt(!0));
                                  }} onKeyDown={r => {
                                    const s = Ba.filter(n => {
                                      const l = zt.toLowerCase(),
                                        d = xt(l);
                                      return n._lowName.includes(l) || n._normName.includes(d) || n._lowCode.includes(l) || n._normCode.includes(d) || n._lowActive.includes(l) || n._normActive.includes(d);
                                    }).sort((n, l) => {
                                      const d = zt.toLowerCase(),
                                        o = n._lowName.startsWith(d),
                                        u = l._lowName.startsWith(d);
                                      return o && !u ? -1 : !o && u ? 1 : n._lowCode === d && l._lowCode !== d ? -1 : n._lowCode !== d && l._lowCode === d ? 1 : n._lowName.localeCompare(l._lowName, "vi", {
                                        sensitivity: "base"
                                      });
                                    }).slice(0, 10);
                                    if (r.key === "ArrowDown") {
                                      if (Tt === a && s.length > 0) r.preventDefault(), Ca(n => {
                                        const l = Math.min(n + 1, s.length - 1);
                                        if (Ea.current) {
                                          const d = Ea.current.children[l];
                                          d && d.scrollIntoView({
                                            block: "nearest"
                                          });
                                        }
                                        return l;
                                      });else {
                                        r.preventDefault();
                                        const n = a + 1;
                                        n < ve.length && document.getElementById(`row-name-${n}`)?.focus();
                                      }
                                    } else if (r.key === "ArrowUp") {
                                      if (Tt === a && s.length > 0) r.preventDefault(), Ca(n => {
                                        const l = Math.max(n - 1, 0);
                                        if (Ea.current) {
                                          const d = Ea.current.children[l];
                                          d && d.scrollIntoView({
                                            block: "nearest"
                                          });
                                        }
                                        return l;
                                      });else {
                                        r.preventDefault();
                                        const n = a - 1;
                                        n >= 0 ? document.getElementById(`row-name-${n}`)?.focus() : se.current?.focus();
                                      }
                                    } else if (r.key === "Enter") {
                                      if (r.preventDefault(), s[It]) {
                                        const n = s[It];
                                        let l = [...y];
                                        const d = t.quantity,
                                          o = l.findIndex(h => h.cartId !== t.cartId && h.product_id === n.id),
                                          u = l.findIndex(h => h.cartId === t.cartId);
                                        u > -1 && (o > -1 ? (l[o].quantity += d, l[o].secondary_qty = l[o].quantity / (l[o].multiplier || 1), l.splice(u, 1)) : l[u] = {
                                          ...l[u],
                                          product_id: n.id,
                                          product_name: n.name,
                                          unit: n.unit,
                                          secondary_unit: n.secondary_unit,
                                          multiplier: n.multiplier || 1,
                                          price: R[n.id] !== void 0 ? R[n.id] : n.sale_price,
                                          cost_price: n.cost_price,
                                          latest_cost_price: n.latest_cost_price,
                                          stock: n.stock,
                                          latest_stock_entry: n.latest_stock_entry,
                                          is_combo: n.is_combo,
                                          secondary_qty: d / (n.multiplier || 1),
                                          active_ingredient: n.active_ingredient
                                        }, delete l[u]?.ai_scanned, H(l), ct(null));
                                      }
                                      se.current?.focus();
                                    } else if (r.key === "Tab") {
                                      r.preventDefault();
                                      const n = s.length > 0 ? s : [];
                                      if (n[It]) {
                                        const l = n[It];
                                        let d = [...y];
                                        const o = t.quantity,
                                          u = d.findIndex(b => b.cartId !== t.cartId && b.product_id === l.id),
                                          h = d.findIndex(b => b.cartId === t.cartId);
                                        h > -1 && (u > -1 ? (d[u].quantity += o, d[u].secondary_qty = d[u].quantity / (d[u].multiplier || 1), d.splice(h, 1), H(d), ct(null), setTimeout(() => {
                                          const b = ve.findIndex(O => O.cartId === d[u > h ? u - 1 : u].cartId),
                                            S = b > -1 ? b : u > h ? u - 1 : u,
                                            w = document.getElementById(`qty-sec-${S}`);
                                          if (Te === "Wholesale" && w && !w.disabled) w.focus(), w.select?.();else {
                                            const O = document.getElementById(`qty-main-${S}`);
                                            O?.focus(), O?.select?.();
                                          }
                                        }, 200)) : (d[h] = {
                                          ...d[h],
                                          product_id: l.id,
                                          product_name: l.name,
                                          unit: l.unit,
                                          secondary_unit: l.secondary_unit,
                                          multiplier: l.multiplier || 1,
                                          price: R[l.id] !== void 0 ? R[l.id] : l.sale_price,
                                          cost_price: l.cost_price,
                                          latest_cost_price: l.latest_cost_price,
                                          stock: l.stock,
                                          latest_stock_entry: l.latest_stock_entry,
                                          is_combo: l.is_combo,
                                          secondary_qty: o / (l.multiplier || 1),
                                          active_ingredient: l.active_ingredient
                                        }, delete d[h]?.ai_scanned, H(d), ct(null), setTimeout(() => {
                                          const b = document.getElementById(`qty-sec-${a}`);
                                          if (Te === "Wholesale" && b && !b.disabled) b.focus(), b.select?.();else {
                                            const S = document.getElementById(`qty-main-${a}`);
                                            S?.focus(), S?.select?.();
                                          }
                                        }, 200)));
                                      } else ct(null), setTimeout(() => {
                                        const l = document.getElementById(`qty-sec-${a}`);
                                        if (Te === "Wholesale" && l && !l.disabled) l.focus(), l.select?.();else {
                                          const d = document.getElementById(`qty-main-${a}`);
                                          d?.focus(), d?.select?.();
                                        }
                                      }, 200);
                                    }
                                  }} id={`row-name-${a}`} /> : <div onClick={() => {
                                    ct(a), ls(t.product_name), Ca(0), setTimeout(() => {
                                      const r = document.getElementById(`row-name-${a}`);
                                      r?.focus(), r?.select?.();
                                    }, 50);
                                  }} onDoubleClick={() => {
                                    const r = T.find(s => s.id === t.product_id);
                                    r && (Vt(r), vt(!0));
                                  }} className="w-full h-auto py-2 px-3 flex items-center justify-between gap-2.5 cursor-pointer group/marquee-wrap min-h-[44px]"><div className="flex-1 min-w-0 flex flex-col justify-center"><div className="flex items-center gap-2"><Ps text={t.product_name} className="text-[17px] font-black tracking-tight leading-snug text-emerald-900 dark:text-emerald-300" title={t.product_name} />{t.is_combo && <span className="shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black tracking-widest border border-amber-500/30">COMBO</span>}</div>{t.ai_scanned && <div className="mt-1 flex items-center gap-1.5 z-10">{t.ai_matched_status === "matched" ? <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black flex items-center gap-1 border border-emerald-500/20 shadow-sm w-fit"><Es size={10} className="text-emerald-500 dark:text-emerald-400 shrink-0" /><span className="truncate max-w-[320px]">{`AI Tự khớp: "${t.ai_original_name}"`}</span><button type="button" onClick={r => {
                                        r.stopPropagation();
                                        const s = [...y],
                                          n = s.findIndex(l => l.cartId === t.cartId);
                                        n > -1 && (delete s[n].ai_scanned, H(s));
                                      }} className="hover:bg-emerald-500/20 rounded p-0.5 text-emerald-700 dark:text-emerald-300 transition-all inline-flex items-center justify-center ml-1" title="Xác nhận khớp đúng"><Os size={10} strokeWidth={3} /></button></span> : <span className="px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black flex items-center gap-1 border border-amber-500/20 shadow-sm w-fit"><As size={10} className="text-amber-500 dark:text-amber-400 shrink-0" /><span className="truncate max-w-[320px]">{`AI không khớp được: "${t.ai_original_name}"`}</span><button type="button" onClick={r => {
                                        r.stopPropagation();
                                        const s = [...y],
                                          n = s.findIndex(l => l.cartId === t.cartId);
                                        n > -1 && (delete s[n].ai_scanned, H(s));
                                      }} className="hover:bg-amber-500/20 rounded p-0.5 text-amber-700 dark:text-amber-300 transition-all inline-flex items-center justify-center ml-1" title="Bỏ qua cảnh báo"><Xn size={10} strokeWidth={3} /></button></span>}</div>}</div><div className="shrink-0 z-10"><div onClick={r => {
                                      r.stopPropagation();
                                      const s = T.find(n => n.id === t.product_id);
                                      if (s) {
                                        const n = r.currentTarget.getBoundingClientRect();
                                        Xt(s), za({
                                          top: n.top,
                                          bottom: n.bottom,
                                          left: n.left,
                                          right: n.right
                                        }), Dt(!0);
                                      }
                                    }} className={c("relative cursor-pointer hover:scale-105 active:scale-95 px-2.5 py-1 rounded-full text-[11px] font-black border transition-all flex items-center gap-1.5 group/stock whitespace-nowrap shadow-xs select-none", t.stock <= 0 ? "bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-rose-600/20" : t.stock < 10 ? "bg-amber-500 dark:bg-amber-500 text-amber-950 dark:text-slate-950 border-amber-600 dark:border-amber-400 shadow-amber-500/20 font-black" : "bg-[#2d5016] dark:bg-emerald-600 text-white border-[#234011] dark:border-emerald-500 shadow-[#2d5016]/20 font-black")} title="Kiểm tồn nhanh"><div className="flex items-center gap-1 tabular-nums">{t.stock <= 0 ? <Pr size={12} strokeWidth={2.8} className="text-white" /> : t.stock < 10 ? <Comp_da size={12} strokeWidth={2.8} className="text-amber-950 dark:text-slate-950" /> : <Qa size={12} strokeWidth={2.8} className="text-white" />}<span className="tabular-nums font-black">{t.stock}</span></div>{localStorage.getItem('feature_accounting_enabled') !== 'false' && <><span className="w-px h-3 bg-white/40 shrink-0" /><div className="inline-flex items-center gap-1 text-white/90 shrink-0 whitespace-nowrap" title="Tồn sổ sách kế toán"><ReceiptTextIcon size={11} strokeWidth={2.4} className="shrink-0 text-white" /><span className="tabular-nums font-black">{(t.accounting_stock !== undefined ? t.accounting_stock : (T.find(n => n.id === t.product_id)?.accounting_stock || 0))}</span></div></>}</div></div></div>}{Tt === a && t.ai_scanned && <div className="px-3 pb-2 flex items-center gap-1.5 z-10">{t.ai_matched_status === "matched" ? <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black flex items-center gap-1 border border-emerald-500/20 shadow-sm"><Es size={10} className="text-emerald-500 dark:text-emerald-400 shrink-0" />{`AI Tự khớp: "${t.ai_original_name}"`}</span> : <span className="px-1.5 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black flex items-center gap-1 border border-amber-500/20 shadow-sm"><As size={10} className="text-amber-500 dark:text-amber-400 shrink-0" />{`AI không khớp được: "${t.ai_original_name}"`}</span>}</div>}<P>{Tt === a && zt && <x.div initial={{
                                      opacity: 0,
                                      y: -5
                                    }} animate={{
                                      opacity: 1,
                                      y: 0
                                    }} exit={{
                                      opacity: 0,
                                      y: -5
                                    }} transition={{
                                      duration: 0.15
                                    }} className="absolute left-0 top-full mt-2 w-full min-w-[700px] dropdown-premium backdrop-blur-xl backdrop-saturate-150 !z-[1000]" style={{
                                      backgroundColor: Mt.glassBg
                                    }}><div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" /><div ref={Ea} className="max-h-[480px] overflow-y-auto custom-scrollbar">{Ba.filter(r => {
                                          const s = zt.toLowerCase(),
                                            n = xt(s);
                                          return r._lowName.includes(s) || r._normName.includes(n) || r._lowCode.includes(s) || r._normCode.includes(n) || r._lowActive.includes(s) || r._normActive.includes(n);
                                        }).sort((r, s) => {
                                          const n = zt.toLowerCase(),
                                            l = r._lowName.startsWith(n),
                                            d = s._lowName.startsWith(n);
                                          return l && !d ? -1 : !l && d ? 1 : r._lowCode === n && s._lowCode !== n ? -1 : r._lowCode !== n && s._lowCode === n ? 1 : r._lowName.localeCompare(s._lowName, "vi", {
                                            sensitivity: "base"
                                          });
                                        }).slice(0, 50).map((r, s) => <div key={r.id} onMouseMove={() => { if (Ja !== s) Ca(s); }} onClick={() => {
                                          let n = [...y];
                                          const l = n.findIndex(u => u.cartId === t.cartId);
                                          if (l === -1) return;
                                          const d = n[l].quantity,
                                            o = n.findIndex((u, h) => h !== l && u.product_id === r.id);
                                          o > -1 ? (n[o].quantity += d, n[o].secondary_qty = n[o].quantity / (n[o].multiplier || 1), n.splice(l, 1)) : (n[l] = {
                                            ...n[l],
                                            product_id: r.id,
                                            product_name: r.name,
                                            unit: r.unit,
                                            secondary_unit: r.secondary_unit,
                                            multiplier: r.multiplier || 1,
                                            price: R[r.id] !== void 0 ? R[r.id] : Te === "Wholesale" && r.bulk_price || r.sale_price,
                                            cost_price: r.cost_price,
                                            latest_cost_price: r.latest_cost_price,
                                            stock: r.stock,
                                            accounting_stock: r.accounting_stock,
                                            is_combo: r.is_combo,
                                            secondary_qty: d / (r.multiplier || 1),
                                            active_ingredient: r.active_ingredient,
                                            latest_audit: r.latest_audit,
                                            latest_stock_entry: r.latest_stock_entry
                                          }, delete n[l]?.ai_scanned), H(n), ct(null);
                                        }} className={c("dropdown-item flex justify-between items-center", s === It && "active")}><div className="flex-1 flex flex-col gap-1.5 relative z-10 min-w-0 overflow-hidden mr-3"><div className="flex items-center gap-3 min-w-0"><div className="min-w-0 flex-1 overflow-hidden"><Ps text={r.name} isActive={s === It} className="font-black tracking-tight transition-all duration-300 leading-relaxed" style={{
                                                color: s === It ? Mt.accent : Mt.main,
                                                fontSize: s === It ? "18px" : "16px",
                                                paddingLeft: s === It ? "12px" : "0px"
                                              }} /></div>{r.is_combo && <span className="shrink-0 px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-black tracking-widest">COMBO</span>}</div><div className="flex items-center gap-5"><span className="text-[11px] font-black italic tracking-wide transition-colors" style={{
                                              color: s === It ? Mt.accentMuted : Mt.muted
                                            }}>{r.active_ingredient || ""}</span><div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{r.code && <span className={c("shrink-0 px-2 py-0.5 rounded-md font-mono text-[9.5px] font-black tabular-nums border transition-colors", s === It ? "bg-white/20 border-white/30 text-white" : "bg-slate-900/5 dark:bg-white/10 border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400")}>{r.code}</span>}<span className={c("px-2 py-0.5 rounded-md border transition-colors", s === It ? "bg-white/20 border-white/30 text-white" : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:border-slate-300")}>{Ae(r.unit)}</span>{r.multiplier > 1 && <span className={s === It ? "text-white/60" : "text-slate-500 opacity-60"}>/ {Ae(r.secondary_unit)} (x{r.multiplier})</span>}</div></div></div><div className="flex items-center gap-8 relative z-10"><div onClick={n => {
                                                n.stopPropagation();
                                                const l = n.currentTarget.getBoundingClientRect();
                                                Xt(r), za({
                                                  top: l.top,
                                                  bottom: l.bottom,
                                                  left: l.left,
                                                  right: l.right
                                                }), Dt(!0);
                                              }} className={c("px-3 py-1.5 rounded-full text-xs font-black border transition-all flex items-center gap-2 hover:scale-105 active:scale-95 group/stock cursor-pointer select-none shadow-xs", r.stock <= 0 ? s === It ? "bg-rose-600 text-white border-white/50 shadow-lg font-black" : "bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-rose-600/20" : r.stock < 10 ? s === It ? "bg-amber-500 text-slate-950 border-white/50 shadow-lg font-black" : "bg-amber-500 dark:bg-amber-500 text-amber-950 dark:text-slate-950 border-amber-600 dark:border-amber-400 shadow-amber-500/20 font-black" : s === It ? "bg-[#2d5016] text-white border-white/50 shadow-lg font-black" : "bg-[#2d5016] dark:bg-emerald-600 text-white border-[#234011] dark:border-emerald-500 shadow-[#2d5016]/20 font-black")} title="Kiểm tồn nhanh"><div className="flex items-center gap-1.5 tabular-nums">{r.stock <= 0 ? <Pr size={14} strokeWidth={2.8} className={s === It ? "text-white shrink-0" : "text-white shrink-0"} /> : r.stock < 10 ? <Comp_da size={14} strokeWidth={2.8} className={s === It ? "text-slate-950 shrink-0" : "text-amber-950 dark:text-slate-950 shrink-0"} /> : <Qa size={14} strokeWidth={2.8} className={s === It ? "text-white shrink-0" : "text-white shrink-0"} />}<span className="tabular-nums font-black">{r.stock}</span></div>{localStorage.getItem('feature_accounting_enabled') !== 'false' && <><span className={c("w-px h-3.5 shrink-0", s === It ? "bg-white/40" : "bg-white/40")} /><div className={c("inline-flex items-center gap-1 shrink-0 whitespace-nowrap", s === It ? "text-white" : "text-white/90")} title="Tồn sổ sách kế toán"><ReceiptTextIcon size={13} strokeWidth={2.4} className="shrink-0" /><span className="tabular-nums font-black">{r.accounting_stock || 0}</span></div></>}</div><div className="flex flex-col items-end gap-1"><div className="text-[22px] font-black tracking-tighter tabular-nums" style={{
                                              color: s === It ? Mt.accent : Mt.main
                                            }}>{z(r.sale_price)}</div><div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest opacity-80">NHẬP CUỐI: {z(r.latest_cost_price)}</div></div></div></div>)}</div></x.div>}</P>{t.active_ingredient && <div className="absolute left-0 bottom-full mb-2 hidden group-hover/search-row:block z-[2000] w-64 bg-slate-800 text-white p-3 rounded-xl  animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-700"><div className="text-[10px] font-black uppercase text-[#d4a574] mb-1 tracking-widest border-b border-white/10 pb-1">Hoạt chất / Thành phần</div><div className="text-xs font-bold leading-relaxed">{t.active_ingredient}</div></div>}</div></td><td className="py-2 px-2 text-center"><div className="font-bold text-gray-700 dark:text-gray-200">{Ae(t.unit)}</div>{t.secondary_unit && <div className="text-[10px] text-primary dark:text-[#d4a574] font-black uppercase tracking-tighter whitespace-nowrap">1 {Ae(t.secondary_unit)} = {t.multiplier} {Ae(t.unit)}</div>}</td><td className="py-2 px-2">{t.secondary_unit ? <div className="flex items-center gap-1 h-10 px-2 bg-transparent border border-white/20 dark:border-white/10 rounded-2xl focus-within:bg-transparent focus-within:border-[#d4a574]/50 focus-within:ring-4 focus-within:ring-[#d4a574]/10 shadow-none transition-all"><input type="number" className="w-full bg-transparent text-center font-black text-base outline-none placeholder:text-gray-300 text-primary dark:text-[#d4a574]" value={t.secondary_qty} onFocus={r => r.target.select()} autoComplete="off" onChange={r => _r(a, "secondary_qty", parseFloat(r.target.value) || 0)} onKeyDown={r => {
                                    if (r.key === "ArrowDown") {
                                      r.preventDefault();
                                      const s = a + 1;
                                      s < ve.length && document.getElementById(`qty-sec-${s}`)?.focus();
                                    } else if (r.key === "ArrowUp") {
                                      r.preventDefault();
                                      const s = a - 1;
                                      s >= 0 && document.getElementById(`qty-sec-${s}`)?.focus();
                                    }
                                  }} id={`qty-sec-${a}`} /><span className="text-[10px] font-black text-gray-400 uppercase pr-2">{Ae(t.secondary_unit)}</span></div> : <div className="text-center text-gray-300 italic text-[10px] font-bold">N/A</div>}</td><td className="py-2 px-2 group/qty"><div className="relative w-full"><input type="number" className="w-full h-10 text-center bg-transparent border border-white/20 dark:border-white/10 rounded-2xl focus:bg-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none font-black text-lg text-primary dark:text-[#d4a574] shadow-none transition-all" value={t.quantity} onFocus={r => r.target.select()} autoComplete="off" onChange={r => _r(a, "quantity", parseFloat(r.target.value) || 0)} ref={r => Bi.current[t.product_id] = r} id={`qty-main-${a}`} onKeyDown={r => {
                                    if (r.key === "Enter") r.preventDefault(), se.current?.focus();else if (r.key === "Tab") r.preventDefault(), blockTabPrice ? r.target.select?.() : document.getElementById(`price-${a}`)?.focus();else if (r.key === "ArrowDown") {
                                      r.preventDefault();
                                      const s = a + 1;
                                      s < ve.length && document.getElementById(`qty-main-${s}`)?.focus();
                                    } else if (r.key === "ArrowUp") {
                                      r.preventDefault();
                                      const s = a - 1;
                                      s >= 0 ? document.getElementById(`qty-main-${s}`)?.focus() : Pt.current?.focus();
                                    }
                                  }} /><button tabIndex={-1} className="absolute -top-2.5 -right-2.5 w-6 h-6 flex items-center justify-center bg-white/40 dark:bg-black/20 text-[#8b6f47] dark:text-[#d4a574] rounded-full  border border-white/50 dark:border-white/10 hover:bg-white/60 active:scale-90 z-[70] transition-all hover:scale-110 opacity-0 group-hover/qty:opacity-100" onClick={() => _r(a, "quantity", t.quantity * -1)} title="Đổi thành Trả Hàng (Âm)"><Ms size={10} strokeWidth={3} /></button></div></td><td className="py-2 px-2 text-right relative hover:z-[4000] focus-within:z-[4000]"><div className="flex flex-col items-center gap-1 group/price relative z-[10] group-hover/price:z-[4000] group-focus-within/price:z-[4000]"><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-1 bg-[#fbf9f4]/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-[#8b6f47]/30 dark:border-white/15 shadow-2xl shadow-[#8b6f47]/10 dark:shadow-black/50 flex items-stretch whitespace-nowrap z-[9999] opacity-0 group-hover/price:opacity-100 group-focus-within/price:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover/price:translate-y-0 group-focus-within/price:translate-y-0 ring-1 ring-black/5 dark:ring-white/5"><div className="flex flex-col items-center px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"><span className="text-[9px] uppercase font-black text-slate-500/80 dark:text-slate-400 leading-none mb-1.5 tracking-[0.1em]">Vốn TB</span><span className="text-sm font-black text-amber-700 dark:text-amber-300 tabular-nums">{z(t.cost_price)}<span className="text-[10px] ml-1 opacity-60">đ</span></span></div><div className="w-px my-2 bg-gradient-to-b from-transparent via-[#8b6f47]/20 dark:via-white/15 to-transparent" /><div className="flex flex-col items-center px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"><span className="text-[9px] uppercase font-black text-[#8b6f47] dark:text-[#d4a574] leading-none mb-1.5 tracking-[0.1em]">Nhập cuối</span><span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{z(t.latest_cost_price || 0)}<span className="text-[10px] ml-1 opacity-60">đ</span></span></div><div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#fbf9f4]/95 dark:border-t-slate-900/95 drop-shadow-xs" /></div><div className="relative w-full"><input type="text" tabIndex={blockTabPrice ? -1 : 0} className={c("w-full p-2 text-center bg-transparent border-none focus:ring-2 rounded font-black transition-all outline-none", t.price === 0 ? "text-transparent select-none placeholder:text-transparent" : t.price < t.cost_price ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-900" : t.price < (t.latest_cost_price || 0) ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 focus:ring-orange-200" : "text-primary dark:text-[#d4a574] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#4a7c59]/20")} value={z(t.price)} onFocus={r => r.target.select()} autoComplete="off" onChange={r => {
                                      const s = parseFloat(r.target.value.replace(/,/g, "")) || 0;
                                      _r(a, "price", s);
                                    }} onKeyDown={r => {
                                      if (r.key === "Enter" || r.key === "Tab") r.preventDefault(), r.key === "Enter" && zs(), se.current?.focus();else if (r.key === "ArrowDown") {
                                        r.preventDefault();
                                        const s = a + 1;
                                        s < ve.length && document.getElementById(`price-${s}`)?.focus();
                                      } else if (r.key === "ArrowUp") {
                                        r.preventDefault();
                                        const s = a - 1;
                                        s >= 0 ? document.getElementById(`price-${s}`)?.focus() : ms.current?.focus();
                                      }
                                    }} id={`price-${a}`} />{t.price === 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-wider border border-rose-500/20">HÀNG TẶNG</span></div>}</div><P>{(() => {
                                      const r = T.find(n => n.id === t.product_id),
                                        s = t.latest_cost_price || 0;
                                      return t.price < t.cost_price ? <x.div initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        y: -5
                                      }} animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0
                                      }} className="bg-gradient-to-r from-red-600/90 to-rose-600/90 text-white text-[9px] px-2 py-1 rounded-full font-black whitespace-nowrap z-10 flex items-center gap-1.5 pointer-events-none border border-white/20"><Comp_da size={10} className="text-white" /><span>LỖ VỐN (THỰC TẾ: {lt(t.cost_price)})</span></x.div> : s > 0 && t.price < s && t.price >= t.cost_price ? <x.div initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        y: -5
                                      }} animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0
                                      }} className="bg-gradient-to-r from-orange-500/90 to-orange-600/90 text-white text-[9px] px-2 py-1 rounded-full font-black whitespace-nowrap z-10 flex items-center gap-1.5 pointer-events-none border border-white/20"><Kn size={10} className="text-white" /><span>DƯỚI VỐN NHẬP MỚI ({lt(s)})</span></x.div> : r && t.price < r.sale_price && t.price >= (s || t.cost_price) ? <x.div initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        y: -5
                                      }} animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0
                                      }} className="bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-white text-[9px] px-2 py-1 rounded-full font-black whitespace-nowrap z-10 flex items-center gap-1.5 border border-white/20"><$n size={10} className="text-white" /><span>GIÁ THẤP ({lt(r.sale_price)})</span></x.div> : r && p && R[t.product_id] !== void 0 && t.price === r.sale_price ? <x.div initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        y: -5
                                      }} animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0
                                      }} className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-[9px] px-2 py-1 rounded-full font-black whitespace-nowrap z-10 flex items-center gap-1.5 border border-white/20 "><Xa size={10} className="text-white" /><span>ĐỒNG BỘ GIÁ</span></x.div> : null;
                                    })()}</P></div></td><td className="py-2 px-4 text-right"><div className={c("font-black text-lg transition-colors", t.quantity < 0 ? "text-red-600 dark:text-red-400" : "text-primary dark:text-[#d4a574]")}>{z(t.price * t.quantity)}</div>{t.quantity < 0 && <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800/50 mt-1">Hàng trả</span>}</td><td className="py-2 px-2 text-center"><button onClick={r => {
                                  r.stopPropagation(), bl(a);
                                }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Xóa dòng"><Comp_pa size={18} /></button></td></x.tr>)}</P></tbody></table></div></div><P>{ea && <x.div initial={{
                      opacity: 0
                    }} animate={{
                      opacity: 1
                    }} exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.15
                      }
                    }} className="no-print print:hidden absolute inset-0 z-[500] pointer-events-none rounded-3xl backdrop-blur-xl bg-transparent flex items-center justify-center p-4"><x.div initial={{
                        scale: 0.88,
                        opacity: 0,
                        y: 10
                      }} animate={{
                        scale: 1,
                        opacity: 1,
                        y: 0
                      }} exit={{
                        scale: 0.95,
                        opacity: 0,
                        y: -6,
                        transition: {
                          duration: 0.12
                        }
                      }} transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 28
                      }} className="bg-[#fbf8f2] dark:bg-[#1a1e17] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 shadow-2xl rounded-3xl px-6 py-5 md:px-8 md:py-6 flex flex-col items-center gap-2.5 text-center w-auto max-w-md mx-auto relative overflow-hidden pointer-events-auto"><svg className="absolute inset-0 w-full h-full pointer-events-none z-20"><x.rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="23" fill="none" stroke="#10b981" strokeWidth="2" pathLength="100" strokeDasharray="25 75" initial={{
                            strokeDashoffset: 100
                          }} animate={{
                            strokeDashoffset: 0
                          }} transition={{
                            duration: 0.85,
                            ease: "easeInOut"
                          }} /></svg><div className="relative flex items-center justify-center mb-0.5"><x.div initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-[#2d5016]/25 relative z-10"><Os size={30} strokeWidth={3.5} /></x.div></div><div className="text-base sm:text-lg font-black uppercase tracking-tight text-[#2d5016] dark:text-emerald-400 whitespace-nowrap select-none">ĐÃ LƯU ĐƠN HÀNG THÀNH CÔNG!</div><div className="flex items-center flex-nowrap whitespace-nowrap gap-2 px-3.5 py-1 rounded-full bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 border border-[#8b6f47]/25 dark:border-[#d4a574]/30 text-[#2d5016] dark:text-[#d4a574] text-xs font-black uppercase tracking-wide shrink-0"><span>ĐƠN #{ea.id}</span><span className="opacity-40">•</span><span>{ea.count} MÓN</span>{ea.partnerName && ea.partnerName !== "Khách lẻ" && <><span className="opacity-40">•</span><span className="truncate max-w-[140px]">{ea.partnerName}</span></>}</div></x.div></x.div>}</P><P>{Ze === "sidebar" && !ka && <><x.div layout={!0} initial={{
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)"
                  }} animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0.01px)"
                  }} exit={{
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)",
                    transition: {
                      duration: 0.15,
                      ease: "easeOut"
                    }
                  }} className="absolute bottom-3 left-3 z-[110] pointer-events-none flex flex-col items-start gap-2.5"><div className="flex items-center gap-2.5 pointer-events-auto"><div onClick={t => {
                        t.stopPropagation(), p ? setIsHistoryPanelOpen(true) : Xr(!0);
                      }} className="flex items-start group/partner-bubble cursor-pointer hover:scale-[1.02] transition-all duration-300 p-3 px-5 rounded-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 bg-transparent backdrop-blur-md hover:border-[#8b6f47]/50 dark:hover:border-[#d4a574]/50 shadow-md shadow-[#8b6f47]/5 dark:shadow-black/40 relative overflow-hidden"><Gn className="absolute -right-4 -bottom-4 w-28 h-28 text-[#8b6f47]/10 dark:text-[#d4a574]/10 -rotate-12 transition-transform group-hover/partner-bubble:scale-110 group-hover/partner-bubble:-rotate-6 pointer-events-none" /><div className="flex flex-col max-w-[300px] min-w-[200px] relative z-10"><div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8b6f47] dark:text-[#d4a574] mb-0.5 leading-normal py-0.5">Đối tác / Khách hàng</div><div className="flex items-center gap-1.5 mb-1">{g === "remote_inspect" ? <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black tracking-wider shrink-0 border border-emerald-500/20">MÁY TRẠM</span> : p && <span className="px-1.5 py-0.5 bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 text-[#8b6f47] dark:text-[#d4a574] rounded-md text-[9px] font-black tracking-wider shrink-0 border border-[#8b6f47]/20 dark:border-[#d4a574]/20">ID: {p.id}</span>}<div className="text-base font-black text-[#2d5016] dark:text-emerald-400 uppercase leading-normal py-0.5 tracking-tight truncate">{g === "remote_inspect" ? k?.partner_name || "Khách bán lẻ" : p ? p.name : "Khách bán lẻ"}</div></div>{Pe && <div className="flex flex-col gap-1 w-full border-l-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 pl-2.5 ml-0.5">{(Pe.phone || Pe.cccd) && <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal py-0.5">{Pe.phone && <div className="flex items-center gap-1"><Mr size={11} className="text-[#8b6f47] dark:text-[#d4a574] shrink-0" /><span className="truncate leading-normal">{Pe.phone}</span></div>}{Pe.cccd && <div className="flex items-center gap-1"><Comp_ca size={11} className="text-[#8b6f47] dark:text-[#d4a574] shrink-0" /><span className="truncate leading-normal">{Pe.cccd}</span></div>}</div>}{Pe.address && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal py-0.5"><Us size={11} className="text-[#8b6f47] dark:text-[#d4a574] shrink-0" /><span className="truncate leading-normal">{Pe.address}</span></div>}{(g === "remote_inspect" ? Pe.debt_balance || 0 : (it !== 0 || de !== 0)) && <div className="w-full mt-0.5 pt-1 border-t border-[#8b6f47]/15 dark:border-[#d4a574]/15">{(() => {
                                  if (g === "remote_inspect") {
                                    const a = Pe.debt_balance || 0;
                                    return <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-xs"><div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#8b6f47] dark:text-[#d4a574]"><Va size={11} className="shrink-0" /><span>Dư nợ:</span></div><div className="flex items-center gap-1"><span className={c("text-xs font-black tabular-nums", a > 0 ? "text-rose-600 dark:text-rose-400" : a < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>{lt(Math.abs(a))}đ</span><span className={c("text-[8px] font-black px-1.5 py-0.5 rounded-md", a > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : a < 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500")}>{a > 0 ? "Khách nợ" : a < 0 ? "Mình nợ" : "Hết nợ"}</span></div></div>;
                                  }
                                  if (it - de === 0) return <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-xs"><div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#8b6f47] dark:text-[#d4a574]"><Va size={11} className="shrink-0" /><span>Dư nợ:</span></div><div className="flex items-center gap-1"><span className={c("text-xs font-black tabular-nums", de > 0 ? "text-rose-600 dark:text-rose-400" : de < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>{lt(Math.abs(de))}đ</span><span className={c("text-[8px] font-black px-1.5 py-0.5 rounded-md", de > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : de < 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500")}>{de > 0 ? "Khách nợ" : de < 0 ? "Mình nợ" : "Hết nợ"}</span></div></div>;
                                  const S_delta = it - de;
                                  return <div className="flex flex-col gap-1 w-full"><div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-[#8b6f47] dark:text-[#d4a574]"><span className="flex items-center gap-1"><Va size={11} className="shrink-0 text-[#8b6f47] dark:text-[#d4a574]" /><span>Biến động nợ</span></span><span className={c("text-[8px] font-black px-1.5 py-0.5 rounded-md", it > 0 ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : it < 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500")}>{it > 0 ? "Khách nợ" : it < 0 ? "Mình nợ" : "Hết nợ"}</span></div><div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 shadow-xs"><div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-none mb-0.5">Hiện tại</span><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-through decoration-rose-400/60 tabular-nums">{lt(Math.abs(de))}đ</span></div><div className={c("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-tight", S_delta > 0 ? "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25" : "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25")}><span>➔</span><span>{S_delta > 0 ? `+${lt(S_delta)}` : `-${lt(Math.abs(S_delta))}`}</span></div><div className="flex flex-col items-end"><span className="text-[8px] font-bold text-rose-500/80 dark:text-rose-400/80 uppercase leading-none mb-0.5">Sau đơn</span><span className={c("text-[11px] font-black tabular-nums", it > 0 ? "text-rose-600 dark:text-rose-400" : it < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[#2d5016] dark:text-emerald-400")}>{lt(Math.abs(it))}đ</span></div></div></div>;
                                })()}</div>}</div>}</div></div><div className="relative group/note-container pointer-events-auto"><div onClick={t => {
                          t.stopPropagation(), as(!lr);
                        }} className={c("w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 backdrop-blur-md shadow-md shadow-[#8b6f47]/5", K || lr ? "bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white border-[#2d5016] dark:border-emerald-400 shadow-md shadow-[#2d5016]/25" : "bg-transparent text-[#8b6f47] dark:text-[#d4a574] border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:bg-[#2d5016]/10 dark:hover:bg-emerald-500/15 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400")} title="Ghi chú hóa đơn"><Comp_ca size={18} className={K || lr ? "text-white" : "transition-colors"} strokeWidth={2.5} />{K && !lr && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800" />}</div><P>{lr && <x.div initial={{
                            opacity: 0,
                            scale: 0.9,
                            x: -20,
                            y: 20
                          }} animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0
                          }} exit={{
                            opacity: 0,
                            scale: 0.9,
                            x: -20,
                            y: 20
                          }} onClick={t => t.stopPropagation()} className="absolute bottom-full left-0 mb-3 w-[280px] bg-[#fbf9f4] dark:bg-[#1c1916] backdrop-blur-2xl p-4 rounded-3xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 shadow-2xl z-[100]"><div className="flex justify-between items-center mb-2"><div className="text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-widest">Ghi chú đơn</div><button onClick={t => {
                                t.stopPropagation(), as(!1);
                              }} className="text-muted-foreground hover:text-primary transition-colors"><Comp_ke size={14} strokeWidth={3} /></button></div><textarea autoFocus={!0} placeholder="Nhập ghi chú cho hóa đơn này..." rows={3} className="w-full px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-[#8b6f47]/20 dark:border-white/10 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#8b6f47]/30 transition-all resize-none shadow-none custom-scrollbar dark:text-white" value={K} onChange={t => $e(t.target.value)} /></x.div>}</P></div><div className="relative group/ship-container pointer-events-auto"><div onClick={t => {
                          t.stopPropagation(), tt ? qt(null) : (qt("Shipping"), p && (ra(p.address || ""), sa(p.phone || "")));
                        }} className={c("w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border-2 backdrop-blur-md shadow-md shadow-[#8b6f47]/5", tt ? "bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white border-[#2d5016] dark:border-emerald-400 shadow-md shadow-[#2d5016]/25" : "bg-transparent text-[#8b6f47] dark:text-[#d4a574] border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:bg-[#2d5016]/10 dark:hover:bg-emerald-500/15 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400")} title="Giao hàng tận nơi"><Comp_u_t size={18} strokeWidth={2.5} className={tt ? "text-white" : "transition-colors"} />{tt && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800" />}</div><P>{tt && <x.div initial={{
                            opacity: 0,
                            scale: 0.9,
                            x: -20,
                            y: 20
                          }} animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0
                          }} exit={{
                            opacity: 0,
                            scale: 0.9,
                            x: -20,
                            y: 20
                          }} onClick={t => t.stopPropagation()} className="absolute bottom-full left-0 mb-3 w-[320px] bg-[#fbf9f4] dark:bg-[#1c1916] backdrop-blur-2xl p-5 rounded-3xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 shadow-2xl z-[100]"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-2"><Comp_u_t size={16} className="text-emerald-500" /><div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Thông tin giao hàng</div></div><button onClick={t => {
                                t.stopPropagation(), qt(null);
                              }} className="text-muted-foreground hover:text-rose-500 transition-colors"><Comp_ke size={14} strokeWidth={3} /></button></div><div className="space-y-4"><div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 ml-1">Địa chỉ giao hàng</label><textarea placeholder="Nhập địa chỉ nhận hàng..." rows={2} className="w-full px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none dark:text-white" value={vr} onChange={t => ra(t.target.value)} /></div><div className="space-y-1"><label className="text-[9px] font-black uppercase text-gray-400 ml-1">Số điện thoại nhận</label><div className="relative"><Mr size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" /><input type="text" placeholder="SĐT người nhận..." className="w-full h-10 pl-9 pr-4 bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20 dark:border-white/10 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white" value={kr} onChange={t => sa(t.target.value)} /></div></div></div></x.div>}</P></div></div></x.div><x.div key="total-bubble" layout={!0} initial={{
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)"
                  }} animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0.01px)"
                  }} exit={{
                    opacity: 0,
                    y: 20,
                    filter: "blur(10px)",
                    transition: {
                      duration: 0.15,
                      ease: "easeOut"
                    }
                  }} className="absolute bottom-3 right-3 z-[110] pointer-events-none flex items-center gap-2.5">{I === "Cash" && <div className="pointer-events-auto flex items-center bg-transparent backdrop-blur-md p-3 pr-5 rounded-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 shadow-md shadow-[#8b6f47]/5 dark:shadow-black/40 group/cash-calculator relative min-w-[200px] hover:scale-[1.02] transition-all duration-300"><div className="w-10 h-10 bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-[#2d5016]/20 shrink-0 group-hover/cash-calculator:rotate-12 transition-transform"><Comp_oa size={20} /></div><div className="flex flex-col ml-3"><span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8b6f47] dark:text-[#d4a574] mb-0.5 whitespace-nowrap">Khách đưa (F1)</span><div className="flex items-center gap-2.5"><div className="relative flex items-center min-w-[70px] group/input-wrapper h-full"><span className="invisible whitespace-pre font-black text-xl px-1 pointer-events-none tabular-nums select-none">{z(V) || "0"}</span><input id="cash-given-compact" ref={xr} type="text" className="absolute inset-0 w-full h-full bg-transparent border-b-2 border-[#8b6f47]/30 focus:border-[#2d5016] dark:focus:border-emerald-400 outline-none font-black text-xl text-[#2d5016] dark:text-emerald-400 p-0 tabular-nums transition-all z-10" value={z(V)} autoComplete="off" onChange={t => Ye(parseFloat(t.target.value.replace(/,/g, "")) || 0)} onFocus={t => t.target.select()} /></div>{V > 0 && <div className="flex flex-col items-end min-w-[85px] border-l border-[#8b6f47]/20 dark:border-[#d4a574]/20 pl-3 py-0.5"><span className="text-[8px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase leading-none mb-0.5 whitespace-nowrap">Tiền thối</span><span className={c("text-xl font-black tabular-nums transition-colors", V > $ ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 opacity-50")}>{z(Math.max(0, V - $))}</span></div>}</div></div></div>}{(p || g === "remote_inspect") && <div className="w-[155px] pointer-events-auto flex items-center bg-transparent backdrop-blur-md p-1 rounded-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 shadow-md shadow-[#8b6f47]/5 dark:shadow-black/40 group/payment-toggle relative h-[56px] transition-all duration-300"><x.div layout={!0} className="absolute inset-y-1 bg-gradient-to-tr from-[#2d5016] to-emerald-600 rounded-xl shadow-md shadow-[#2d5016]/20 z-0" style={{
                        width: "calc(50% - 4px)",
                        left: (g === "remote_inspect" ? k?.payment_method || "Cash" : I) === "Cash" ? "4px" : "calc(50%)"
                      }} transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }} /><button onClick={t => {
                        t.stopPropagation(), ge("Cash"), re($);
                      }} className={c("flex-1 h-full rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative z-10 gap-0.5", I === "Cash" ? "text-white" : "text-slate-400 hover:text-[#2d5016] dark:hover:text-emerald-400")}><Comp_oa size={13} className={c(I === "Cash" ? "opacity-100" : "opacity-40")} /><span className="text-[9px] font-black uppercase tracking-wider">Tiền mặt</span></button><button onClick={t => {
                        t.stopPropagation(), ge("Debt"), re(0);
                      }} className={c("flex-1 h-full rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative z-10 gap-0.5", I === "Debt" ? "text-white" : "text-slate-400 hover:text-[#2d5016] dark:hover:text-emerald-400")}><Comp_ua size={13} className={c(I === "Debt" ? "opacity-100" : "opacity-40")} /><span className="text-[9px] font-black uppercase tracking-wider">Ghi nợ</span></button></div>}<div onMouseDown={yr} onMouseUp={aa} onMouseLeave={aa} onTouchStart={yr} onTouchEnd={aa} className="px-6 py-3 rounded-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 bg-transparent backdrop-blur-md hover:border-[#8b6f47]/50 dark:hover:border-[#d4a574]/50 shadow-md shadow-[#8b6f47]/5 dark:shadow-black/40 flex flex-col items-end group/total pointer-events-auto relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"><Va className="absolute -left-8 -bottom-8 w-36 h-36 text-[#2d5016]/5 dark:text-emerald-500/5 -rotate-12 transition-transform group-hover/total:scale-110 group-hover/total:-rotate-6 pointer-events-none" /><div className="flex items-center gap-1.5 mb-0.5 z-10 relative"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8b6f47] dark:text-[#d4a574] flex items-center gap-1.5">Tổng cộng thanh toán</span></div><div className="text-2xl sm:text-3xl font-black tracking-tighter tabular-nums text-[#2d5016] dark:text-emerald-400 flex items-baseline gap-1 z-10 relative">{z(g === "remote_inspect" ? k?.total_amount || (k?.cart || []).reduce((t, a) => t + (a.price || a.sale_price || 0) * (a.quantity || 1), 0) : $)}<span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold ml-0.5">đ</span></div>{Ha && (y.some(t => t.product_id !== null) || m.product && m.product.id !== null) && <div className="mt-1 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-1.5 border border-emerald-500/20 z-10 relative"><Kn size={12} className="text-emerald-600 dark:text-emerald-400" /><span className="text-[10px] font-black uppercase tracking-tight">Lợi nhuận: {z(vs)}đ</span></div>}</div></x.div></>}</P></div></div>{Ze === "bottom" && (() => {
                const t = k?.total_amount || (k?.cart || []).reduce((S, w) => S + (Number(w.price || w.sale_price) || 0) * (Number(w.quantity) || 1), 0),
                  a = g === "remote_inspect" ? Pe || k?.partner : p,
                  r = g === "remote_inspect" ? k?.partner_name || a?.name || "Khách máy trạm" : p ? p.name : "Khách bán lẻ",
                  s = a?.debt_balance || 0,
                  n = g === "remote_inspect" ? k?.payment_method || "Cash" : I,
                  l = g === "remote_inspect" ? t : $,
                  d = g === "remote_inspect" ? (k?.cart || []).length : y.length,
                  o = g === "remote_inspect" ? n === "Cash" ? l : k?.amount_paid || 0 : oe,
                  u = g === "remote_inspect" ? k?.cash_given || 0 : V,
                  h = g === "remote_inspect" ? s : de,
                  b = g === "remote_inspect" ? n === "Debt" ? h + (l >= 0 ? l - o : l + o) : h : it;
                return <div style={{
                  minHeight: `${Jr}px`,
                  height: `${Jr}px`
                }} className={c("relative mt-1 p-1 px-1.5 rounded-2xl shrink-0 no-print flex flex-col justify-center overflow-visible transition-[height] duration-75 bg-transparent border-0 shadow-none", tn && "select-none")}><div onMouseDown={Ii} onDoubleClick={() => {
                    Yr(105), localStorage.setItem("pos_bottom_summary_height", "105");
                  }} className="absolute -top-1.5 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center group/resize-bar z-30 select-none" title="Kéo lên/xuống để chỉnh chiều cao (Nhấp đúp để đặt lại mặc định)"><div className={c("w-16 h-1 rounded-full transition-all shadow-sm", tn ? "bg-emerald-500 h-1.5 w-24 shadow-emerald-500/50" : "bg-slate-400/40 dark:bg-slate-600/40 group-hover/resize-bar:bg-emerald-500 group-hover/resize-bar:h-1.5 group-hover/resize-bar:w-20")} /></div><div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-stretch w-full h-full relative z-10"><x.div initial={{
                      opacity: 0,
                      y: 10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.3
                    }} className="md:col-span-2 flex flex-col justify-between gap-1 min-w-0 h-full"><div onClick={() => {
                        a ? kt(!0) : zt.current?.focus();
                      }} className={c("flex-1 min-h-[34px] relative overflow-hidden p-1 px-2.5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] min-w-0 shadow-sm flex flex-col justify-between group/debt-card backdrop-blur-md", s > 0 ? "bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]" : s < 0 ? "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "bg-card/40 hover:bg-card/70 border-border/80 hover:border-primary/50 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_0_15px_var(--primary-color)]/20")} title={a ? `Xem lịch sử nợ của ${r}` : "Chưa chọn đối tác"}><div className="absolute -right-1.5 -bottom-2 opacity-[0.08] dark:opacity-[0.12] text-current pointer-events-none -rotate-6 transition-transform group-hover/debt-card:scale-110 select-none"><Va size={42} strokeWidth={1.5} /></div><div className="flex items-center justify-between w-full relative z-10 pt-0.5"><span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-normal">Dư nợ</span>{a && s !== 0 && <x.span initial={{
                            opacity: 0,
                            scale: 0.8
                          }} animate={{
                            opacity: 1,
                            scale: 1
                          }} className={c("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shrink-0 transition-all leading-normal shadow-sm", s > 0 ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-emerald-600 text-white shadow-emerald-600/30")}>{s > 0 ? "Khách nợ" : "Mình nợ"}</x.span>}</div><x.div key={Math.abs(s || 0)} initial={{
                          opacity: 0,
                          y: -3
                        }} animate={{
                          opacity: 1,
                          y: 0
                        }} transition={{
                          duration: 0.25
                        }} className={c("text-sm lg:text-base font-black tracking-tight tabular-nums truncate leading-tight mt-auto text-right pb-0.5 transition-colors duration-300 relative z-10", s > 0 ? "text-rose-600 dark:text-rose-400" : s < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>{z(Math.abs(s || 0))}<span className="text-[10px] font-normal ml-0.5">đ</span></x.div></div><div className="flex-1 min-h-[26px] max-h-9 flex items-stretch gap-1"><button onClick={() => ja(!0)} className="relative overflow-hidden flex-1 h-full flex items-center justify-center rounded-xl border border-border/80 bg-card/40 text-foreground text-[9px] font-black hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_var(--primary-color)]/25 transition-all text-center tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98] group/sno backdrop-blur-sm" title="Sổ ghi nợ"><div className="absolute -right-1 -bottom-2 opacity-[0.09] dark:opacity-[0.13] text-current pointer-events-none -rotate-6 transition-transform group-hover/sno:scale-115 select-none"><Comp_ti size={30} strokeWidth={1.8} /></div><span className="relative z-10">SỔ NỢ</span></button><button onClick={() => _a(!0)} className="relative overflow-hidden flex-1 h-full flex items-center justify-center rounded-xl border border-border/80 bg-card/40 text-foreground text-[9px] font-black hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_var(--primary-color)]/25 transition-all text-center tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98] group/thuchi backdrop-blur-sm" title="Thu / Chi"><div className="absolute -right-1 -bottom-2 opacity-[0.09] dark:opacity-[0.13] text-current pointer-events-none -rotate-6 transition-transform group-hover/thuchi:scale-115 select-none"><Rs size={30} strokeWidth={1.8} /></div><span className="relative z-10">THU/CHI</span></button></div></x.div><x.div initial={{
                      opacity: 0,
                      y: 10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.3,
                      delay: 0.05
                    }} className="md:col-span-3 flex flex-col justify-between gap-1 h-full"><div className="flex-1 min-h-[26px] max-h-9 flex items-stretch w-full gap-1"><button onClick={() => {
                          g === "remote_inspect" ? (qa(S => S.map(w => w.terminal_id === q || w.ip_address === q ? {
                            ...w,
                            payment_method: "Cash"
                          } : w)), M.post("/api/pos/terminal-state/edit-cart", {
                            terminal_id: q,
                            payment_method: "Cash",
                            cart: k?.cart || []
                          }).catch(() => {})) : (ge("Cash"), re($));
                        }} className={c("relative overflow-hidden flex-1 h-full rounded-xl flex items-center justify-center text-[9px] font-black tracking-wider transition-all active:scale-95 cursor-pointer group/cash backdrop-blur-sm", n === "Cash" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.45)] border border-emerald-400/60" : "bg-card/40 text-foreground border border-border/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_var(--primary-color)]/20")}><div className={c("absolute -right-1 -bottom-2 pointer-events-none -rotate-6 transition-transform group-hover/cash:scale-110 select-none", n === "Cash" ? "opacity-25 text-white" : "opacity-[0.09] dark:opacity-[0.13] text-current")}><Do size={34} strokeWidth={1.8} /></div><span className="relative z-10">TIỀN MẶT</span></button><button onClick={() => {
                          g === "remote_inspect" ? (qa(S => S.map(w => w.terminal_id === q || w.ip_address === q ? {
                            ...w,
                            payment_method: "Debt"
                          } : w)), M.post("/api/pos/terminal-state/edit-cart", {
                            terminal_id: q,
                            payment_method: "Debt",
                            cart: k?.cart || []
                          }).catch(() => {})) : (ge("Debt"), re(0));
                        }} className={c("relative overflow-hidden flex-1 h-full rounded-xl flex items-center justify-center text-[9px] font-black tracking-wider transition-all active:scale-95 cursor-pointer group/debt backdrop-blur-sm", n === "Debt" ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.45)] border border-rose-400/60" : "bg-card/40 text-foreground border border-border/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_var(--primary-color)]/20")}><div className={c("absolute -right-1 -bottom-2 pointer-events-none -rotate-6 transition-transform group-hover/debt:scale-110 select-none", n === "Debt" ? "opacity-25 text-white" : "opacity-[0.09] dark:opacity-[0.13] text-current")}><Po size={34} strokeWidth={1.8} /></div><span className="relative z-10">CÔNG NỢ</span></button><button onClick={() => ge("Transfer")} className={c("relative overflow-hidden flex-1 h-full rounded-xl flex items-center justify-center text-[9px] font-black tracking-wider transition-all active:scale-95 cursor-pointer group/ck backdrop-blur-sm", n === "Transfer" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.45)] border border-blue-400/60" : "bg-card/40 text-foreground border border-border/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_var(--primary-color)]/20")}><div className={c("absolute -right-1 -bottom-2 pointer-events-none -rotate-6 transition-transform group-hover/ck:scale-110 select-none", n === "Transfer" ? "opacity-25 text-white" : "opacity-[0.09] dark:opacity-[0.13] text-current")}><Es size={34} strokeWidth={1.8} /></div><span className="relative z-10">C/K</span></button></div>{n === "Transfer" ? <Comp_zn className="flex-1 min-h-[30px] max-h-10 w-full p-1 bg-card/40 border border-border/80 rounded-xl font-bold text-xs outline-none text-foreground flex items-center shadow-xs focus-within:border-primary focus-within:shadow-[0_0_15px_var(--primary-color)]/25 backdrop-blur-sm" value={ss} onChange={S => ns(S.target.value)} options={ln.map(S => ({
                        value: S.id,
                        label: `${S.bank_name} - ${S.account_number}`
                      }))} /> : <div className="flex-1 min-h-[30px] max-h-10 relative flex items-center bg-card/40 rounded-xl border border-border/80 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-[0_0_16px_var(--primary-color)]/30 group/pay-input transition-all duration-300 backdrop-blur-sm"><div className="absolute right-16 -bottom-3 opacity-[0.06] dark:opacity-[0.08] text-foreground pointer-events-none -rotate-6 select-none overflow-hidden"><Comp_ca size={42} strokeWidth={1.5} /></div><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground uppercase tracking-widest pointer-events-none z-10">Thanh toán:</span><input type="text" readOnly={n === "Cash" || n === "Pending" || g === "remote_inspect"} className={c("w-full h-full pl-22 pr-3 text-right font-black text-base md:text-lg outline-none bg-transparent tabular-nums flex items-center transition-colors duration-300 relative z-10", n === "Cash" || n === "Pending" || g === "remote_inspect" ? "text-primary/70 cursor-not-allowed" : "text-primary")} value={z(o)} onChange={S => re(parseFloat(S.target.value.replace(/,/g, "")) || 0)} />{g !== "remote_inspect" && (n === "Debt" || n === "Transfer" || n === "Combined" || I === "Debt" || I === "Transfer") && <button type="button" onClick={() => re($ + (de > 0 ? de : 0))} className="absolute right-2 -top-2.5 opacity-0 group-hover/pay-input:opacity-100 focus-within:opacity-100 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white dark:text-slate-950 text-[8.5px] font-black uppercase rounded-full border border-white/40 dark:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-200 active:scale-95 z-30 cursor-pointer" title="Thanh toán toàn bộ đơn hàng và nợ cũ">Trả hết</button>}</div>}</x.div><x.div initial={{
                      opacity: 0,
                      y: 10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.3,
                      delay: 0.1
                    }} className="md:col-span-3 h-full p-1.5 px-3 rounded-2xl bg-card/40 border border-border/80 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_0_18px_var(--primary-color)]/20 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group/debt-change backdrop-blur-md"><div className="absolute -right-2 -bottom-2 opacity-[0.06] dark:opacity-[0.09] text-current pointer-events-none -rotate-6 transition-transform group-hover/debt-change:scale-105 select-none"><Bn size={48} strokeWidth={1.5} /></div><div className="flex items-center justify-between relative z-10 pt-0.5"><span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-normal">{u > l ? "Tiền thừa" : "Biến động nợ"}</span>{u > l ? <x.span initial={{
                          opacity: 0,
                          scale: 0.85
                        }} animate={{
                          opacity: 1,
                          scale: 1
                        }} className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] leading-normal">Thối lại</x.span> : <x.span key={b > h ? "up" : b < h ? "down" : "same"} initial={{
                          opacity: 0,
                          scale: 0.85
                        }} animate={{
                          opacity: 1,
                          scale: 1
                        }} className={c("text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full transition-all duration-300 leading-normal", b > h ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : b < h ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-black/[0.05] dark:bg-white/[0.05] text-muted-foreground")}>{b > h ? "+ Tăng nợ" : b < h ? "- Giảm nợ" : "Không đổi"}</x.span>}</div><div className="flex items-center justify-between gap-1.5 mt-auto relative z-10"><div className="flex-1 min-w-0"><div className="flex items-center gap-1 leading-normal mb-0.5"><span className="text-[8.5px] font-bold text-muted-foreground uppercase leading-normal">Trước</span>{h !== 0 ? <span className={c("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border leading-normal shrink-0", h > 0 ? "text-rose-600 bg-rose-500/10 border-rose-500/25 dark:text-rose-400" : "text-emerald-600 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400")}>{h > 0 ? "Khách nợ" : "Mình nợ"}</span> : <span className="text-[8px] font-bold text-muted-foreground uppercase shrink-0 leading-normal">Hết nợ</span>}</div><x.div key={Math.abs(h)} initial={{
                            opacity: 0,
                            scale: 0.95
                          }} animate={{
                            opacity: 1,
                            scale: 1
                          }} transition={{
                            duration: 0.25
                          }} className={c("text-xs lg:text-sm font-black tracking-tight tabular-nums truncate leading-tight transition-colors duration-300", h > 0 ? "text-rose-500" : h < 0 ? "text-emerald-500" : "text-muted-foreground")}>{z(Math.abs(h))}<span className="text-[9px] font-normal ml-0.5">đ</span></x.div></div><div className="flex items-center justify-center w-5 h-5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground shrink-0"><Comp_qo size={11} strokeWidth={2.5} /></div><div className="flex-1 min-w-0 text-right"><div className="flex items-center justify-end gap-1 leading-normal mb-0.5">{u > l ? <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 leading-normal shrink-0">Thối lại</span> : b !== 0 ? <span className={c("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border leading-normal shrink-0", b > 0 ? "text-rose-600 bg-rose-500/10 border-rose-500/25 dark:text-rose-400" : "text-emerald-600 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400")}>{b > 0 ? "Khách nợ" : "Mình nợ"}</span> : <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 leading-normal shrink-0">Hết nợ</span>}<span className="text-[8.5px] font-bold text-muted-foreground uppercase leading-normal">Sau đơn</span></div><x.div key={u > l ? Math.max(0, u - l) : Math.abs(b)} initial={{
                            opacity: 0,
                            scale: 0.95
                          }} animate={{
                            opacity: 1,
                            scale: 1
                          }} transition={{
                            duration: 0.25
                          }} className={c("text-sm lg:text-base font-black tracking-tight tabular-nums truncate leading-tight transition-colors duration-300", u > l ? "text-amber-700 dark:text-amber-400" : b > 0 ? "text-rose-600 dark:text-rose-400" : b < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>{z(u > l ? Math.max(0, u - l) : Math.abs(b))}<span className="text-[9px] font-normal ml-0.5">đ</span></x.div></div></div></x.div><x.div initial={{
                      opacity: 0,
                      y: 10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      duration: 0.3,
                      delay: 0.15
                    }} className="md:col-span-4 flex items-stretch gap-1.5 h-full"><div onMouseDown={yr} onMouseUp={aa} onMouseLeave={aa} onTouchStart={yr} onTouchEnd={aa} onClick={() => p ? setIsHistoryPanelOpen(true) : Xr(!0)} className="flex-1 h-full p-1.5 px-3.5 rounded-2xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white flex flex-col justify-between relative overflow-hidden select-none active:scale-[0.98] transition-all cursor-pointer min-h-0 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] group/total-main" title="Bấm để xem lịch sử, bấm giữ để xem lợi nhuận đơn"><div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" /><div className="absolute -right-3 -bottom-4 text-white/15 pointer-events-none -rotate-12 transition-transform group-hover/total-main:scale-110 group-hover/total-main:-rotate-6 select-none"><Comp_pi size={76} strokeWidth={1.2} /></div><div className="flex items-center justify-between relative z-10"><span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-200">{Ha ? "LỢI NHUẬN ĐƠN" : "TỔNG CỘNG ĐƠN HÀNG"}</span>{Ha ? <span className="px-1.5 py-0.2 bg-white/20 rounded-lg text-[7px] font-black tracking-widest">BÍ MẬT</span> : <x.span key={d} initial={{
                            opacity: 0,
                            scale: 0.8
                          }} animate={{
                            opacity: 1,
                            scale: 1
                          }} transition={{
                            duration: 0.2
                          }} className="text-[8px] font-bold px-1.5 py-0.5 rounded-lg bg-white/20 text-emerald-100 backdrop-blur-md shadow-[0_0_8px_rgba(255,255,255,0.2)]">{d} món</x.span>}</div><x.div key={Ha ? vs : l} initial={{
                          opacity: 0,
                          y: -4,
                          scale: 0.98
                        }} animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1
                        }} transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 25
                        }} className="text-2xl md:text-3xl font-black tracking-tight truncate leading-tight tabular-nums mt-auto relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">{z(Ha ? vs : l)}<span className="text-xs font-normal ml-0.5 opacity-90">đ</span></x.div></div><div className="flex flex-col justify-between gap-1 shrink-0 min-w-[135px] h-full"><div className="flex-1 min-h-[28px] max-h-11 flex items-stretch gap-1 justify-between"><x.button whileTap={{
                            scale: 0.95
                          }} disabled={d === 0 || g === "remote_inspect"} onClick={wr} className="relative overflow-hidden flex-1 h-full bg-card/40 text-foreground rounded-xl flex items-center justify-center border border-border/80 hover:bg-primary/10 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_14px_var(--primary-color)]/30 transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed group/btn-pause backdrop-blur-sm" title="Tạm đơn [F4]"><div className="absolute -right-1 -bottom-2 opacity-[0.08] dark:opacity-[0.12] text-current pointer-events-none -rotate-6 transition-transform group-hover/btn-pause:scale-115 select-none"><Comp_jt size={28} strokeWidth={1.8} /></div><Comp_jt size={16} strokeWidth={2.5} className="relative z-10" /></x.button><x.button whileTap={{
                            scale: 0.95
                          }} disabled={d === 0 || Be} onClick={() => {
                            g === "remote_inspect" ? et({
                              title: "Xác nhận lưu hóa đơn",
                              message: "Bạn có chắc chắn muốn lưu hóa đơn trên máy trạm này?",
                              onConfirm: () => {
                                et(null), M.post("/api/pos/terminal-state/action", {
                                  terminal_id: q,
                                  action: "save_order"
                                }).then(() => {
                                  Ve.success("Đã gửi lệnh lưu hóa đơn tới máy trạm!");
                                }).catch(() => {
                                  Ve.error("Không thể gửi lệnh lưu hóa đơn!");
                                });
                              }
                            }) : Re(!1);
                          }} className="relative overflow-hidden flex-1 h-full bg-card/40 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center border border-emerald-600/30 dark:border-emerald-400/30 hover:bg-emerald-500/15 hover:border-emerald-500/50 hover:shadow-[0_0_14px_rgba(16,185,129,0.3)] transition-all shadow-xs group/btn-save backdrop-blur-sm" title="Lưu đơn [Ctrl+S]"><div className="absolute -right-1 -bottom-2 opacity-[0.08] dark:opacity-[0.12] text-current pointer-events-none -rotate-6 transition-transform group-hover/btn-save:scale-115 select-none"><Er size={28} strokeWidth={1.8} /></div>{Be ? <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin relative z-10" /> : <Er size={16} strokeWidth={2.5} className="relative z-10" />}</x.button><x.button whileTap={{
                            scale: 0.95
                          }} disabled={d === 0 || Be} onClick={() => {
                            g === "remote_inspect" ? et({
                              title: "Xác nhận lưu hóa đơn",
                              message: "Bạn có chắc chắn muốn lưu hóa đơn trên máy trạm này?",
                              onConfirm: () => {
                                et(null), M.post("/api/pos/terminal-state/action", {
                                  terminal_id: q,
                                  action: "save_order"
                                }).then(() => {
                                  Ve.success("Đã gửi lệnh lưu hóa đơn tới máy trạm!");
                                }).catch(() => {
                                  Ve.error("Không thể gửi lệnh lưu hóa đơn!");
                                });
                              }
                            }) : Re(!0);
                          }} className="relative overflow-hidden flex-1 h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_28px_rgba(16,185,129,0.65)] border border-emerald-400/50 hover:scale-[1.02] active:scale-95 transition-all group/btn-print" title="Lưu và In hóa đơn [F9]"><div className="absolute -right-1 -bottom-2 text-white/15 pointer-events-none -rotate-6 transition-transform group-hover/btn-print:scale-115 select-none"><Fa size={28} strokeWidth={1.8} /></div>{Be ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" /> : <Fa size={17} strokeWidth={2.5} className="relative z-10" />}</x.button></div><div className="flex-1 min-h-[26px] max-h-8 flex items-stretch gap-1.5 w-full"><x.button onClick={() => na("prev")} whileHover={{
                            scale: 1.03
                          }} whileTap={{
                            scale: 0.95
                          }} className="flex-1 h-full rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-400/25 flex items-center justify-center shadow-xs hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer" title="Xem đơn trước"><Comp_qs size={18} strokeWidth={2.8} /></x.button><x.button onClick={() => na("next")} disabled={Ce === 0} whileHover={Ce === 0 ? {} : {
                            scale: 1.03
                          }} whileTap={Ce === 0 ? {} : {
                            scale: 0.95
                          }} className={c("flex-1 h-full rounded-xl border flex items-center justify-center shadow-xs transition-all", Ce === 0 ? "bg-black/[0.03] dark:bg-white/[0.03] text-emerald-700/30 dark:text-emerald-400/30 border-black/5 dark:border-white/5 cursor-not-allowed" : "bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-400/25 hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] cursor-pointer")} title="Xem đơn kế tiếp"><Dr size={18} strokeWidth={2.8} /></x.button></div></div></x.div></div></div>;
              })()}</x.div>{Ze === "sidebar" && <x.div initial={!1} animate={{
              width: ka ? "360px" : "90px"
            }} transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }} className="flex flex-col bg-transparent min-h-0 relative z-[3000] shrink-0"><div className="p-1 transition-colors relative flex-1 flex flex-col min-h-0"><P mode="wait">{ka ? <x.div key="expanded-sidebar" initial={{
                    opacity: 0,
                    x: 20,
                    scale: 0.98
                  }} animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1
                  }} exit={{
                    opacity: 0,
                    x: 20,
                    scale: 0.98
                  }} transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 1
                  }} className="h-full flex flex-col relative bg-transparent border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/20 rounded-3xl p-3.5 shadow-2xl shadow-[#8b6f47]/10 dark:shadow-black/50"><x.button whileHover={{
                      scale: 1.15,
                      x: 2
                    }} whileTap={{
                      scale: 0.9
                    }} onClick={() => en(!1)} className="absolute -left-5 top-7 w-9 h-9 bg-[#f6f2ea] dark:bg-[#151311] hover:bg-[#2d5016] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-full flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/40 dark:border-[#d4a574]/40 z-[60] shadow-md hover:border-[#2d5016] dark:hover:border-emerald-400 transition-all group/toggle-open cursor-pointer" title="Thu gọn bảng thanh toán"><Dr size={18} strokeWidth={3.5} className="group-hover/toggle-open:translate-x-0.5 transition-transform" /></x.button><div className="flex flex-col gap-3 relative z-10 flex-1 overflow-y-auto pr-1 pb-1 scroll-smooth custom-scrollbar"><div className="space-y-2.5"><div onClick={() => {
                          p ? setIsHistoryPanelOpen(true) : Et.current?.focus();
                        }} className="bg-transparent p-3 rounded-2xl border border-[#8b6f47]/25 dark:border-[#d4a574]/20 shadow-sm hover:border-[#2d5016]/40 dark:hover:border-emerald-500/40 transition-colors group/partner-sidebar cursor-pointer relative overflow-hidden"><To className="absolute -right-3 -bottom-3 w-20 h-20 text-[#2d5016]/5 dark:text-emerald-400/5 -rotate-12 pointer-events-none select-none" /><div className="flex-1 min-w-0 relative z-10"><div className="flex items-center justify-between gap-2 mb-1"><div className="flex items-center gap-1.5"><span className="text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-[0.15em] whitespace-nowrap">KHÁCH HÀNG</span>{p && <span className="bg-[#2d5016]/10 dark:bg-emerald-500/15 text-[#2d5016] dark:text-emerald-300 border border-[#2d5016]/20 dark:border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">#{p.id}</span>}</div>{p && <button onClick={t => {
                                t.stopPropagation(), setIsHistoryPanelOpen(true);
                              }} className="w-7 h-7 rounded-full bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 hover:bg-[#2d5016] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-[#8b6f47] dark:text-[#d4a574] flex items-center justify-center border border-[#8b6f47]/20 transition-all cursor-pointer shrink-0 z-20 partner-popout-trigger shadow-2xs" title="Xem lịch sử giao dịch"><Ja size={13} strokeWidth={2.8} /></button>}</div><div className="font-black text-[#2d5016] dark:text-[#e8dfd5] text-lg uppercase leading-normal"><Ps text={p ? p.name : "KHÁCH BÁN LẺ"} isActive={!0} className="font-black text-[#2d5016] dark:text-[#e8dfd5] text-lg uppercase leading-normal" /></div>{p && <div className="flex flex-col gap-1.5 mt-2">{(Pe.phone || p.phone) && <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-black/[0.03] dark:bg-white/5 border border-[#8b6f47]/15 dark:border-white/10 px-2.5 py-1 rounded-xl w-full max-w-full overflow-hidden"><Mr size={11} strokeWidth={3} className="shrink-0 text-[#8b6f47] dark:text-[#d4a574]" /><div className="min-w-0 flex-1 overflow-hidden"><Ps text={Pe.phone || p.phone || "N/A"} isActive={!0} className="text-xs font-bold text-slate-700 dark:text-slate-300" /></div></div>}{(Pe.address || p.address) && <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-black/[0.03] dark:bg-white/5 border border-[#8b6f47]/15 dark:border-white/10 px-2.5 py-1 rounded-xl w-full max-w-full overflow-hidden"><Us size={11} strokeWidth={3} className="shrink-0 text-emerald-600 dark:text-emerald-400" /><div className="min-w-0 flex-1 overflow-hidden"><Ps text={Pe.address || p.address} isActive={!0} className="text-xs font-bold text-slate-700 dark:text-slate-300" /></div></div>}{p.cccd && <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-black/[0.03] dark:bg-white/5 border border-[#8b6f47]/15 dark:border-white/10 px-2.5 py-1 rounded-xl w-full max-w-full overflow-hidden"><Comp_ca size={11} strokeWidth={3} className="shrink-0 text-indigo-500" /><div className="min-w-0 flex-1 overflow-hidden"><Ps text={`CCCD: ${p.cccd}`} isActive={!0} className="text-xs font-bold text-slate-700 dark:text-slate-300" /></div></div>}</div>}</div>{p && <div ref={Rr} onClick={t => t.stopPropagation()} className={c("absolute right-full top-1/2 -translate-y-1/2 mr-3 w-60 p-4 rounded-2xl bg-[#fbf8f2] dark:bg-[#1c1916] shadow-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 transition-all duration-300 z-[9999] text-left text-slate-800 dark:text-slate-100 partner-popout-container", sr ? "pointer-events-auto opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-2")}><div className="border-b border-[#8b6f47]/20 dark:border-[#d4a574]/20 pb-2 mb-2.5"><div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8b6f47] dark:text-[#d4a574]">LỊCH SỬ GIAO DỊCH</div></div><div className="flex bg-[#8b6f47]/10 dark:bg-[#d4a574]/10 p-0.5 rounded-xl mb-2.5"><button onClick={() => Kt("debt")} className={c("flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all", Ne === "debt" ? "bg-white dark:bg-slate-800 text-[#2d5016] dark:text-emerald-400 shadow-sm" : "text-[#8b6f47] dark:text-[#d4a574]/70 hover:text-[#2d5016]")}>Mua nợ</button><button onClick={() => Kt("cash")} className={c("flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all", Ne === "cash" ? "bg-white dark:bg-slate-800 text-[#2d5016] dark:text-emerald-400 shadow-sm" : "text-[#8b6f47] dark:text-[#d4a574]/70 hover:text-[#2d5016]")}>Mua tiền</button></div>{Xs ? <div className="flex items-center gap-2 py-3 font-black uppercase text-[10px] tracking-wider text-[#8b6f47] dark:text-[#d4a574]"><Un size={14} className="animate-spin text-[#2d5016] dark:text-emerald-400" /><span>Đang tải...</span></div> : (Ne === "debt" ? st : nt) ? <div onClick={() => {
                                const t = Ne === "debt" ? st : nt;
                                t && t.obj && (mr(t.obj), Yt(!0));
                              }} className="space-y-2 py-1.5 cursor-pointer hover:bg-[#8b6f47]/10 dark:hover:bg-white/5 rounded-xl p-2 transition-all active:scale-[0.98] border border-transparent hover:border-[#8b6f47]/20"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Comp_oa size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">SỐ TIỀN</div><div className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase">{(() => {
                                        const t = Ne === "debt" ? st : nt;
                                        return lt(t.increase || t.obj?.total_amount || 0);
                                      })()}</div></div></div><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Comp_ca size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div className="min-w-0 flex-1"><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">NỘI DUNG</div><div className="text-[10px] font-black uppercase truncate text-slate-800 dark:text-slate-200">{(Ne === "debt" ? st : nt).desc}</div></div></div><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Ja size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">THỜI GIAN</div><div className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">{ot((Ne === "debt" ? st : nt).date)}</div></div></div></div> : <div className="py-4 text-center font-black uppercase text-[11px] tracking-wider text-slate-400 italic">Không có giao dịch {Ne === "debt" ? "nợ" : "tiền mặt"} gần đây</div>}</div>}</div><div className="relative bg-transparent rounded-xl border border-[#8b6f47]/20 dark:border-[#d4a574]/20 focus-within:border-[#2d5016] dark:focus-within:border-emerald-400/50 focus-within:ring-2 focus-within:ring-[#2d5016]/10 transition-colors shadow-2xs"><div className="absolute left-3 top-3 text-[#8b6f47] dark:text-[#d4a574] z-10"><ri size={16} /></div><textarea placeholder="Ghi chú đơn bán..." className="w-full pl-9 pr-3 py-2.5 bg-transparent outline-none resize-none h-14 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400/70 italic" value={K} onChange={t => $e(t.target.value)} /></div></div><div className="space-y-2.5 pt-0.5"><div onClick={() => p ? setIsHistoryPanelOpen(true) : Xr(!0)} className="bg-gradient-to-br from-[#1a3812] via-[#2d5016] to-[#1e3a10] dark:from-[#173812] dark:via-[#244b18] dark:to-[#12280d] text-white p-4.5 rounded-2xl border-2 border-emerald-400/40 relative overflow-hidden group/total-card flex flex-col justify-between cursor-pointer" title={p ? "Xem lịch sử giao dịch khách hàng" : "Xem lịch sử đơn hàng trong ngày"}><div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" /><Mo size={84} strokeWidth={1} className="absolute -right-3 -bottom-4 text-white/[0.08] pointer-events-none -rotate-12 select-none" /><div className="w-full flex items-center justify-start relative z-10 mb-1"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/90 flex items-center gap-1.5"><Es size={12} className="text-emerald-300" />TỔNG CỘNG ĐƠN HÀNG</div></div><div className="text-3xl lg:text-4xl font-black text-center text-white tracking-tight drop-shadow-md whitespace-nowrap overflow-hidden relative z-10">{z($)}<span className="text-base font-bold opacity-80 ml-1">đ</span></div></div><div className="space-y-2"><div className="flex justify-between items-center bg-transparent border border-[#8b6f47]/20 dark:border-[#d4a574]/20 p-2.5 px-3.5 rounded-xl shadow-2xs hover:border-[#8b6f47]/35 transition-colors"><span className="text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-wider">NỢ TRƯỚC ĐƠN:</span><span className="font-black text-sm text-rose-600 dark:text-rose-400 tabular-nums">{z(de)}</span></div>{p && <div className="flex justify-between items-center bg-transparent border border-[#8b6f47]/20 dark:border-[#d4a574]/20 p-2.5 px-3.5 rounded-xl shadow-2xs hover:border-[#8b6f47]/35 transition-colors"><span className="text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-wider">NỢ HIỆN TẠI:</span><span className="font-black text-sm text-amber-600 dark:text-amber-400 tabular-nums">{z(p.debt_balance || 0)}</span></div>}<div className="flex justify-between items-center bg-transparent border border-[#8b6f47]/20 dark:border-[#d4a574]/20 p-2.5 px-3.5 rounded-xl shadow-2xs hover:border-[#8b6f47]/35 transition-colors"><div className="flex items-center gap-2"><Comp_u_t size={16} className="text-[#8b6f47] dark:text-[#d4a574]" /><span className="text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase tracking-wider">GIAO HÀNG TẬN NƠI:</span></div><label onClick={t => {
                                t.preventDefault(), tt ? qt(null) : (qt("Shipping"), p && (ra(p.address || ""), sa(p.phone || "")));
                              }} className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={!!tt} readOnly={!0} className="sr-only" /><div className={c("w-10 h-5.5 rounded-full transition-colors duration-200 relative border", tt ? "bg-[#2d5016] border-[#2d5016]" : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600")}><div className={c("absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-md", tt ? "translate-x-[18px]" : "translate-x-0")} /></div></label></div><div className={c("overflow-hidden space-y-2 bg-transparent rounded-xl border border-[#8b6f47]/20 dark:border-[#d4a574]/20", tt === "Shipping" ? "max-h-[160px] p-3 border mt-2 opacity-100 shadow-xs" : "max-h-0 p-0 border-0 opacity-0 pointer-events-none")}><input type="text" placeholder="Địa chỉ giao hàng..." className="w-full p-2.5 bg-white/70 dark:bg-slate-900/50 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#2d5016] dark:focus:border-emerald-400 outline-none" value={vr} onChange={t => ra(t.target.value)} /><input type="text" placeholder="Số điện thoại nhận hàng..." className="w-full p-2.5 bg-white/70 dark:bg-slate-900/50 border border-[#8b6f47]/20 dark:border-[#d4a574]/20 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#2d5016] dark:focus:border-emerald-400 outline-none" value={kr} onChange={t => sa(t.target.value)} /></div><div className={c("grid grid-cols-2 gap-2", p ? "max-h-[60px] mt-1.5 opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden pointer-events-none")}><x.button whileHover={{
                                y: -2,
                                scale: 1.02
                              }} whileTap={{
                                scale: 0.96
                              }} onClick={() => ja(!0)} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-transparent text-[#2d5016] dark:text-emerald-400 border border-[#8b6f47]/25 dark:border-[#d4a574]/20 hover:bg-[#2d5016] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"><Hs size={14} strokeWidth={2.5} /><span>Ghi nợ</span></x.button><x.button whileHover={{
                                y: -2,
                                scale: 1.02
                              }} whileTap={{
                                scale: 0.96
                              }} onClick={() => _a(!0)} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-transparent text-[#2d5016] dark:text-emerald-400 border border-[#8b6f47]/25 dark:border-[#d4a574]/20 hover:bg-[#2d5016] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"><Ks size={14} strokeWidth={2.5} /><span>Thu/Chi</span></x.button></div><div className="flex flex-col gap-2.5 pt-1"><div className="flex bg-black/[0.03] dark:bg-white/[0.04] p-1.5 rounded-xl border border-[#8b6f47]/25 dark:border-[#d4a574]/20 gap-1.5 shadow-inner"><button onClick={() => {
                                  ge("Cash"), re($);
                                }} className={c("flex-1 py-1.5 rounded-lg text-[10px] font-black cursor-pointer", I === "Cash" ? "bg-gradient-to-r from-[#2d5016] to-[#4a7c59] text-white shadow-md shadow-[#2d5016]/25 border border-emerald-400/30" : "text-[#8b6f47] dark:text-[#d4a574]/75 hover:bg-black/5 dark:hover:bg-white/5")}>TIỀN MẶT</button><button onClick={() => {
                                  ge("Debt"), re(0);
                                }} className={c("flex-1 py-1.5 rounded-lg text-[10px] font-black cursor-pointer", I === "Debt" ? "bg-gradient-to-r from-[#8b6f47] to-[#b38f5d] dark:from-[#b38f5d] dark:to-[#d4a574] text-white shadow-md shadow-[#8b6f47]/25 border border-amber-300/30" : "text-[#8b6f47] dark:text-[#d4a574]/75 hover:bg-black/5 dark:hover:bg-white/5")}>CÔNG NỢ</button><button onClick={() => ge("Transfer")} className={c("flex-1 py-1.5 rounded-lg text-[10px] font-black cursor-pointer", I === "Transfer" ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-600/25 border border-blue-400/30" : "text-[#8b6f47] dark:text-[#d4a574]/75 hover:bg-black/5 dark:hover:bg-white/5")}>C/K</button></div><P>{I === "Transfer" && <x.div initial={{
                                  opacity: 0,
                                  height: 0
                                }} animate={{
                                  opacity: 1,
                                  height: "auto"
                                }} exit={{
                                  opacity: 0,
                                  height: 0
                                }} className="relative overflow-hidden flex items-center justify-between p-2.5 pl-3.5 bg-transparent border-2 border-blue-400/30 dark:border-blue-500/30 rounded-xl shadow-2xs"><div className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase whitespace-nowrap">TK Nhận:</div><Comp_zn className="w-full min-w-0 border-none shadow-none text-right justify-end font-bold text-xs bg-transparent dark:text-white outline-none" value={ss} onChange={t => ns(t.target.value)} options={ln.map(t => ({
                                    value: t.id,
                                    label: `${t.bank_name} - ${t.account_number}`
                                  }))} /></x.div>}</P><div className="relative bg-transparent border-2 border-[#8b6f47]/25 dark:border-[#d4a574]/25 focus-within:border-[#2d5016] dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-[#2d5016]/15 rounded-xl shadow-2xs"><div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase z-10">KHÁCH ĐƯA (F1):</div><input ref={xr} type="number" className="w-full p-2.5 pl-36 text-right rounded-xl font-black text-xl outline-none bg-transparent text-[#2d5016] dark:text-emerald-400 tabular-nums" value={V === 0 ? "" : V} placeholder="0" id="cash-given-sidebar" autoComplete="off" onChange={t => Ye(parseFloat(t.target.value) || 0)} onFocus={t => t.target.select()} /></div><div className="relative group/pay-sidebar bg-transparent border-2 border-[#8b6f47]/25 dark:border-[#d4a574]/25 focus-within:border-[#2d5016] dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-[#2d5016]/15 rounded-xl shadow-2xs"><div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#8b6f47] dark:text-[#d4a574] uppercase z-10">THANH TOÁN:</div><input type="text" readOnly={I === "Cash" || I === "Pending"} className={c("w-full p-2.5 pl-28 pr-4 text-right rounded-xl font-black text-xl outline-none bg-transparent tabular-nums", I === "Cash" || I === "Pending" ? "text-[#2d5016]/50 dark:text-emerald-400/50 cursor-not-allowed" : "text-[#2d5016] dark:text-emerald-400")} value={z(oe)} autoComplete="off" onChange={t => re(parseFloat(t.target.value.replace(/,/g, "")) || 0)} /><P>{(I === "Debt" || I === "Transfer") && <x.button initial={{
                                  opacity: 0
                                }} animate={{
                                  opacity: 1
                                }} exit={{
                                  opacity: 0
                                }} onClick={() => re($ + (de > 0 ? de : 0))} className="absolute right-3 -top-2.5 opacity-0 group-hover/pay-sidebar:opacity-100 focus-within:opacity-100 px-2.5 py-0.5 bg-[#2d5016] hover:bg-emerald-700 text-white text-[9px] font-black rounded-full border border-emerald-400/40 shadow-md hover:scale-105 active:scale-95 z-30 uppercase cursor-pointer" title="Thanh toán toàn bộ đơn hàng và nợ cũ">Trả hết</x.button>}</P></div><P>{V > $ && <x.div initial={{
                                  opacity: 0,
                                  height: 0
                                }} animate={{
                                  opacity: 1,
                                  height: "auto"
                                }} exit={{
                                  opacity: 0,
                                  height: 0
                                }} className="flex justify-between items-center bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/30 text-[#2d5016] dark:text-emerald-300 p-3 px-4 rounded-xl shadow-xs overflow-hidden"><span className="text-[10px] font-black uppercase tracking-wider">TIỀN THỐI LẠI:</span><span className="font-black text-base text-[#2d5016] dark:text-emerald-400 tabular-nums">{z(Math.max(0, V - $))}đ</span></x.div>}</P></div></div></div></div><div className="pt-2 space-y-2 border-t border-[#8b6f47]/20 dark:border-[#d4a574]/20 shrink-0"><div className={c("py-3.5 px-4.5 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden group/debt-card transition-all", it > 0 ? "bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 dark:from-rose-800 dark:via-rose-900 dark:to-[#4c0519] text-white border-2 border-rose-400/50 shadow-rose-600/30 dark:shadow-rose-950/60" : "bg-gradient-to-br from-[#1a3812] via-[#2d5016] to-[#1e3a10] dark:from-[#173812] dark:via-[#244b18] dark:to-[#12280d] text-white border-2 border-emerald-400/40 shadow-[#2d5016]/25")}><div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" /><div className="min-w-0 flex flex-col justify-center relative z-10"><span className={c("text-[10px] font-black uppercase tracking-[0.2em] block mb-0.5 leading-tight", it > 0 ? "text-rose-200/90" : "text-emerald-200/90")}>NỢ SAU ĐƠN:</span><span className="text-3xl font-black tracking-tight block leading-tight tabular-nums text-white drop-shadow-md">{z(Math.abs(it))}<span className="text-base font-bold opacity-80 ml-1">đ</span></span></div><Comp_oa className="text-white/20 shrink-0 ml-2 select-none relative z-10" size={36} /></div><div className="flex flex-col gap-2"><div className="flex gap-2"><x.button whileHover={{
                            scale: 1.02
                          }} whileTap={{
                            scale: 0.95
                          }} disabled={y.length === 0} onClick={wr} className="flex-1 bg-transparent text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/35 dark:border-[#d4a574]/35 hover:bg-[#8b6f47] hover:text-white rounded-xl font-black py-2.5 text-sm uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-40 cursor-pointer"><Comp_jt size={18} strokeWidth={2.5} /><span>TẠM</span></x.button><x.button whileHover={{
                            scale: 1.02
                          }} whileTap={{
                            scale: 0.95
                          }} disabled={y.length === 0 || Be} onClick={() => Re(!1)} className="flex-1 bg-transparent text-[#2d5016] dark:text-emerald-400 border-2 border-[#2d5016]/40 dark:border-emerald-500/40 hover:bg-[#2d5016] hover:text-white dark:hover:bg-emerald-600 rounded-xl font-black py-2.5 text-sm uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-40 cursor-pointer"><Er size={18} strokeWidth={2.5} /><span>LƯU</span></x.button></div><x.button whileHover={{
                          scale: 1.01
                        }} whileTap={{
                          scale: 0.98
                        }} disabled={y.length === 0 || Be} onClick={() => Re(!0)} className="w-full bg-gradient-to-r from-[#2d5016] via-emerald-600 to-[#1e3a10] hover:brightness-110 text-white rounded-2xl flex items-center justify-center py-3.5 h-14 text-2xl font-black uppercase tracking-widest gap-2.5 shadow-xl shadow-[#2d5016]/25 border-2 border-emerald-400/40 transition-all disabled:opacity-40 cursor-pointer">{Be ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><Fa size={24} strokeWidth={2.5} /><span>IN</span></>}</x.button></div></div></x.div> : <x.div key="mini-sidebar" initial={{
                    opacity: 0,
                    x: -20,
                    scale: 0.95
                  }} animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1
                  }} exit={{
                    opacity: 0,
                    x: -20,
                    scale: 0.95
                  }} transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 1
                  }} className="flex flex-col items-center py-6 gap-5 h-full relative z-10 no-print bg-transparent"><div onClick={() => p && Gr(!sr)} className={c("w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-colors relative cursor-pointer partner-popout-trigger shadow-md shadow-[#8b6f47]/5", p ? "bg-transparent text-[#2d5016] dark:text-emerald-400 border-[#8b6f47]/35 dark:border-[#d4a574]/35 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:bg-[#8b6f47]/10" : "bg-transparent text-[#8b6f47]/70 dark:text-[#d4a574]/70 border-[#8b6f47]/25 dark:border-[#d4a574]/25 hover:bg-black/5 dark:hover:bg-white/10")} title={p ? `Khách: ${p.name}` : "Chưa chọn khách"}><Gn size={24} />{p && <div className="absolute -top-1.5 -right-2 bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border border-white/40 shadow-xs transition-transform z-20">#{p.id}</div>}{p && <div ref={Wr} onClick={t => t.stopPropagation()} className={c("absolute right-full top-1/2 -translate-y-1/2 mr-3 w-56 p-3.5 rounded-2xl bg-[#fbf8f2] dark:bg-[#1a1e17] shadow-2xl border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 transition-all duration-300 z-[9999] text-left text-slate-800 dark:text-slate-100 partner-popout-container", sr ? "pointer-events-auto opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-2")}><div className="border-b border-[#8b6f47]/20 dark:border-[#d4a574]/20 pb-1.5 mb-2"><div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8b6f47] dark:text-[#d4a574]">LỊCH SỬ GIAO DỊCH</div></div><div className="flex bg-[#8b6f47]/10 dark:bg-[#d4a574]/10 p-0.5 rounded-xl mb-2"><button onClick={() => Kt("debt")} className={c("flex-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all", Ne === "debt" ? "bg-white dark:bg-slate-800 text-[#2d5016] dark:text-emerald-400 shadow-sm" : "text-[#8b6f47] dark:text-[#d4a574]/70 hover:text-[#2d5016]")}>Mua nợ</button><button onClick={() => Kt("cash")} className={c("flex-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all", Ne === "cash" ? "bg-white dark:bg-slate-800 text-[#2d5016] dark:text-emerald-400 shadow-sm" : "text-[#8b6f47] dark:text-[#d4a574]/70 hover:text-[#2d5016]")}>Mua tiền</button></div>{Xs ? <div className="flex items-center gap-2 py-2 font-black uppercase text-[10px] tracking-wider opacity-85 text-[#8b6f47] dark:text-[#d4a574]"><Un size={14} className="animate-spin text-[#2d5016] dark:text-emerald-400" /><span>Đang tải...</span></div> : (Ne === "debt" ? st : nt) ? <div onClick={() => {
                          const t = Ne === "debt" ? st : nt;
                          t && t.obj && (mr(t.obj), Yt(!0));
                        }} className="space-y-2 py-1 cursor-pointer hover:bg-[#8b6f47]/10 dark:hover:bg-white/5 rounded-xl transition-all active:scale-[0.98] border border-transparent"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Comp_oa size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">SỐ TIỀN</div><div className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase">{(() => {
                                  const t = Ne === "debt" ? st : nt;
                                  return lt(t.increase || t.obj?.total_amount || 0);
})()}</div></div></div><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Comp_ca size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div className="min-w-0 flex-1"><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">NỘI DUNG</div><div className="text-[10px] font-black uppercase truncate text-slate-800 dark:text-slate-200">{(Ne === "debt" ? st : nt).desc}</div></div></div><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-lg bg-[#8b6f47]/10 dark:bg-[#d4a574]/15 flex items-center justify-center shrink-0"><Ja size={15} className="text-[#8b6f47] dark:text-[#d4a574]" /></div><div><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">THỜI GIAN</div><div className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">{ot((Ne === "debt" ? st : nt).date)}</div></div></div></div> : <div className="py-4 text-center font-black uppercase text-xs tracking-wider text-slate-400 italic">Không có giao dịch {Ne === "debt" ? "nợ" : "tiền mặt"} gần đây</div>}</div>}</div><div className="flex flex-col items-center gap-3.5 shrink-0 relative z-[50]">{p && <x.button whileHover={{
                        scale: 1.08,
                        rotate: 5
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => ja(!0)} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400 hover:bg-[#8b6f47]/10 transition-all group/qd relative overflow-hidden shadow-md shadow-[#8b6f47]/5" title="Ghi nợ nhanh"><Hs size={22} strokeWidth={2.5} className="relative z-20" /></x.button>}{p && <x.button whileHover={{
                        scale: 1.08,
                        rotate: -5
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => _a(!0)} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400 hover:bg-[#8b6f47]/10 transition-all group/qv relative overflow-hidden shadow-md shadow-[#8b6f47]/5" title="Lập phiếu nhanh"><Ks size={22} strokeWidth={2.5} className="relative z-20" /></x.button>}<div className="relative group/ship-mini"><x.button whileHover={{
                          scale: 1.08,
                          rotate: 8
                        }} whileTap={{
                          scale: 0.92
                        }} onClick={() => vn(!0)} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400 hover:bg-[#8b6f47]/10 transition-all group/ship relative overflow-hidden shadow-md shadow-[#8b6f47]/5" title="Quản lý giao hàng"><Comp_u_t size={22} strokeWidth={2.5} className="relative z-20" /></x.button>{D > 0 && <div className="absolute -top-1.5 -right-2 min-w-[20px] h-[20px] bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white text-[9px] font-black tracking-wider rounded-full border border-white/40 shadow-xs flex items-center justify-center px-1.5 z-20"><span className="relative flex h-1.5 w-1.5 mr-0.5"><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-200" /></span>{D}</div>}</div></div><div className="flex-1 flex items-center justify-center w-full min-h-[60px] relative"><x.button whileHover={{
                        scale: 1.08,
                        x: -2
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => en(!0)} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/35 dark:border-[#d4a574]/35 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400 hover:bg-[#8b6f47]/10 transition-all group/toggle z-10 relative shadow-md shadow-[#8b6f47]/5" title="Mở rộng bảng thanh toán"><Comp_qs size={24} strokeWidth={3} className="group-hover/toggle:-translate-x-0.5 transition-transform" /></x.button></div><div className="flex flex-col gap-3 pb-4 px-3"><x.button whileHover={{
                        scale: 1.08
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={wr} disabled={y.length === 0} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] dark:hover:text-emerald-400 hover:bg-[#8b6f47]/10 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md shadow-[#8b6f47]/5" title="Treo đơn"><Comp_jt size={20} strokeWidth={2.5} /></x.button><x.button whileHover={{
                        scale: 1.08
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => Re(!1)} disabled={y.length === 0 || Be} className="w-14 h-14 bg-transparent rounded-2xl flex items-center justify-center text-[#2d5016] dark:text-emerald-400 border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md shadow-[#8b6f47]/5" title="Lưu đơn">{Be ? <div className="w-5 h-5 border-2 border-[#2d5016]/20 border-t-[#2d5016] dark:border-emerald-400/20 dark:border-t-emerald-400 rounded-full animate-spin" /> : <Er size={22} strokeWidth={2.5} />}</x.button><x.button whileHover={{
                        scale: 1.08,
                        y: -1
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => Re(!0)} disabled={y.length === 0 || Be} className="w-14 h-14 bg-gradient-to-tr from-[#2d5016] to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#2d5016]/25 hover:from-emerald-700 hover:to-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-all relative overflow-hidden group/print-mini border-2 border-emerald-500/50 dark:border-emerald-400/50" title="Lưu & In đơn">{Be ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Fa size={24} strokeWidth={2.5} className="relative z-10" />}</x.button>{showTaxCalculator && y.length > 0 && <x.button whileHover={{
                        scale: 1.08,
                        y: -1
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={() => ts(!0)} className="w-14 h-14 bg-gradient-to-tr from-[#8b6f47] to-[#b38f5d] dark:from-[#b38f5d] dark:to-[#d4a574] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#8b6f47]/20 hover:brightness-110 transition-all relative overflow-hidden group/tax-mini border-2 border-[#8b6f47]/40" title="Quy đổi tiền CK"><Td size={24} strokeWidth={2.5} className="relative z-10" /></x.button>}{v && <x.button whileHover={{
                        scale: 1.08,
                        rotate: 180
                      }} whileTap={{
                        scale: 0.92
                      }} onClick={v} className="w-14 h-14 bg-[#fbf8f2] dark:bg-[#1a1e17] rounded-2xl flex items-center justify-center text-[#8b6f47] dark:text-[#d4a574] border-2 border-[#8b6f47]/30 dark:border-[#d4a574]/30 hover:border-[#2d5016] dark:hover:border-emerald-400 hover:text-[#2d5016] transition-all shadow-md shadow-[#8b6f47]/5" title="Chuyển đổi giao diện Sáng / Tối"><Bn size={20} strokeWidth={2.5} /></x.button>}</div></x.div>}</P></div></x.div>}</div><P>{dr && <Wn isOpen={dr} partner={{
              name: on,
              is_customer: !0,
              is_supplier: !1
            }} onClose={() => cr(!1)} onSave={t => {
              Ua(), cr(!1), t && (F(t), Ge(""), setTimeout(() => se.current?.focus(), 100));
            }} />}</P><P>{pr && <An isOpen={pr} product={{
              name: on
            }} onClose={() => ur(!1)} onSave={() => {
              Ga(), ur(!1);
            }} />}</P><P>{is && <Comp_td message={is.message} type={is.type} onClose={() => G(null)} />}</P><div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"><P>{hi.map(t => <x.div key={t.id} initial={{
                opacity: 0,
                x: 100,
                scale: 0.9
              }} animate={{
                opacity: 1,
                x: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                x: 50,
                scale: 0.9,
                transition: {
                  duration: 0.15
                }
              }} className="bg-slate-900/90 text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 dark:border-white/10 backdrop-blur-md text-xs font-black flex items-center gap-3 pointer-events-auto"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" /><div><div className="text-[10px] text-slate-400 uppercase tracking-wider leading-none">Quét từ xa</div><div className="mt-1">{t.productName} <span className="text-amber-400">x{t.qty}</span> → <span className="underline text-blue-400">{t.tabName}</span></div></div></x.div>)}</P></div>{showTaxCalculator && <Comp_ed isOpen={Ri} onClose={() => ts(!1)} totalAmount={$} partnerName={p?.name || ""} />}<An isOpen={ps} product={Hi} onClose={() => vt(!1)} onSave={Ga} /><Wn isOpen={Xi} partner={Ji} onClose={() => Oa(!1)} onSave={async t => {
            await Ua(), t && (F(t), Ge(""), setTimeout(() => se.current?.focus(), 100));
          }} /><Ee><Comp_nd isOpen={Mi || ye && ye.type === "DebtIncrease"} partner={p} initialData={ye && ye.type === "DebtIncrease" ? ye : null} onClose={() => {
              ja(!1), Ia(null);
            }} onSave={async t => {
              ye ? await jr() : (F(t), E.invalidateQueries(["partners"])), G({
                message: ye ? "Đã cập nhật khoản nợ thành công!" : "Đã lưu khoản nợ mới thành công!",
                type: "success"
              }), Ia(null), ja(!1), ye || kt(!1);
            }} /></Ee><Ee><Comp_ac isOpen={al} onClose={() => vn(!1)} onViewOrder={t => {
              mr(t), Yt(!0);
            }} /></Ee><Ee><Comp_id isOpen={Wi || ye && (ye.type === "Receipt" || ye.type === "Payment")} partner={p} initialData={ye && (ye.type === "Receipt" || ye.type === "Payment") ? ye : null} onClose={() => {
              _a(!1), Ia(null);
            }} onSave={async t => {
              await jr(), G({
                message: ye ? "Đã cập nhật phiếu thành công!" : "Đã lập phiếu thành công!",
                type: "success"
              }), ye && (Ia(null), _a(!1));
            }} /></Ee><P>{ds && Ta && <Ee><div className="fixed inset-0 z-[1000] flex bg-[radial-gradient(circle_at_25%_center,_#1e293b_0%,_#020617_100%)] animate-in fade-in duration-700 font-sans overflow-hidden"><div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden" /></div><x.div initial={{
                  x: -100,
                  opacity: 0
                }} animate={{
                  x: 0,
                  opacity: 1
                }} exit={{
                  x: -100,
                  opacity: 0
                }} transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                }} className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-50  relative" onClick={t => t.stopPropagation()}><div className="p-8 border-b border-white/10"><h3 className="text-xl font-black text-white uppercase tracking-tighter">Thiết lập in</h3><p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Tùy chỉnh nội dung hiển thị</p></div><div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"><div className="space-y-4"><div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-3 gap-1"><button onClick={() => un("Sale")} className={c("flex-1 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5", Jt === "Sale" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-white/60 hover:text-white hover:bg-white/5")}><Lo size={14} className="shrink-0" strokeWidth={2.5} /><span>Hóa đơn</span></button><button onClick={() => un("Delivery")} className={c("flex-1 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5", Jt === "Delivery" ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "text-white/60 hover:text-white hover:bg-white/5")}><ko size={14} className="shrink-0" strokeWidth={2.5} /><span>Xuất kho</span></button></div>{Jt === "Delivery" ? <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300 font-bold leading-relaxed">Phiếu xuất kho tự động ẩn đơn giá, thành tiền và toàn bộ thông tin công nợ thanh toán.</div> : <div className="space-y-4"><div className="flex items-center justify-between px-2"><label className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em]">Thông tin tài chính</label><div className="h-[1px] flex-1 bg-gradient-to-r from-rose-500/20 to-transparent ml-4" /></div><div className="grid gap-3">{[{
                            id: "showOldDebt",
                            label: "Hiển thị nợ cũ",
                            icon: ua,
                            color: "text-rose-400",
                            glow: "shadow-rose-500/20",
                            baseColor: "rose"
                          }, {
                            id: "showPayment",
                            label: "Hiển thị thanh toán",
                            icon: Va,
                            color: "text-emerald-400",
                            glow: "shadow-emerald-500/20",
                            baseColor: "emerald"
                          }, {
                            id: "showRemaining",
                            label: "Hiển thị còn lại",
                            icon: oa,
                            color: "text-blue-400",
                            glow: "shadow-blue-500/20",
                            baseColor: "blue"
                          }, {
                            id: "showCashGiven",
                            label: "Hiển thị khách đưa",
                            icon: Id,
                            color: "text-amber-400",
                            glow: "shadow-amber-500/20",
                            baseColor: "amber"
                          }, {
                            id: "showChange",
                            label: "Hiển thị tiền thối",
                            icon: Dd,
                            color: "text-cyan-400",
                            glow: "shadow-cyan-500/20",
                            baseColor: "cyan"
                          }].map(t => {
                            const IconComp = t.icon,
                              r = Ke[t.id];
                            return <x.button key={t.id} whileHover={{
                              x: 8,
                              backgroundColor: "rgba(255,255,255,0.08)"
                            }} whileTap={{
                              scale: 0.96
                            }} onClick={() => rl(s => ({
                              ...s,
                              [t.id]: !s[t.id]
                            }))} className={c("w-full p-4 rounded-[1.8rem] flex items-center justify-between transition-all duration-500 border border-white/5 group relative overflow-hidden", r ? "bg-white/10 " : "bg-transparent")}>{r && <div className={c("absolute inset-0 opacity-5 bg-current", t.color)} />}<div className="flex items-center gap-4 relative z-10"><div className={c("w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500", r ? `bg-white/10 ${t.color}  ${t.glow} scale-110` : "bg-white/5 text-white/20 group-hover:text-white/40 dark:text-white/20 group-hover:text-slate-600 dark:group-hover:text-white/40")}><IconComp size={20} strokeWidth={2.5} className={c("transition-transform duration-700", r ? "rotate-0 scale-110" : "rotate-[-10deg]")} /></div><div className="flex flex-col items-start gap-0.5"><span className={c("text-[11px] font-black uppercase tracking-[0.05em] transition-colors duration-500", r ? "text-white" : "text-white/30 group-hover:text-white/60 group-hover:text-slate-600 dark:group-hover:text-white/60")}>{t.label}</span><span className="text-[8px] font-bold text-white/10 uppercase tracking-widest leading-none">{r ? "ĐANG HIỆN" : "ĐANG ẨN"}</span></div></div><div className={c("w-12 h-6 rounded-full relative p-1 transition-all duration-700 overflow-hidden ring-1 ring-white/10", r ? "bg-emerald-500/20 " : "bg-white/5 shadow-none")}><div className={c("absolute top-1/2 left-3 right-3 h-[2px] rounded-full transition-colors duration-700", r ? "bg-emerald-500/40" : "bg-white/10")} /><x.div layout={!0} animate={{
                                  x: r ? 24 : 0,
                                  backgroundColor: r ? "#10b981" : "#475569"
                                }} transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30
                                }} className="w-4 h-4 rounded-full  flex items-center justify-center relative z-10"><div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 shadow-none" />{r && <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-10" />}</x.div></div></x.button>;
                          })}</div></div>}</div></div><div className="p-8 border-t border-white/10 space-y-3 bg-slate-900"><x.button whileHover={{
                      scale: 1.02
                    }} whileTap={{
                      scale: 0.98
                    }} onClick={() => {
                      Sa(!1), Re(!0, Jt);
                    }} className="group w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px]  shadow-emerald-500/20 flex items-center justify-center gap-3"><Fa size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />{Jt === "Delivery" ? "Lưu & In Xuất Kho" : "Lưu & In Ngay"}</x.button><x.button whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(236, 72, 153, 0.2)"
                    }} whileTap={{
                      scale: 0.98
                    }} onClick={() => {
                      Ta && Ta.details && qn(Ta.details, T);
                    }} className="w-full py-4 bg-pink-500/10 text-pink-400 hover:text-pink-300 rounded-[2rem] font-black uppercase tracking-widest text-[11px] border border-pink-500/20 flex items-center justify-center gap-3"><Comp_la size={18} />Đọc Soạn Hàng</x.button><x.button whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255,255,255,0.1)"
                    }} whileTap={{
                      scale: 0.98
                    }} onClick={() => Sa(!1)} className="w-full py-4 bg-white/5 text-white/50 hover:text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] border border-white/5 flex items-center justify-center gap-3"><Comp_ke size={18} />Đóng nhanh</x.button></div></x.div><div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2100] flex items-center gap-2 p-2 bg-slate-900/80 rounded-[2rem] border border-white/10 "><x.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={() => cs(t => Math.max(0.5, t - 0.1))} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title="Thu nhỏ"><Comp_ui size={20} /></x.button><div className="px-4 text-[13px] font-black text-white min-w-[60px] text-center">{Math.round(cn * 100)}%</div><x.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={() => cs(t => Math.min(2, t + 0.1))} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title="Phóng to"><Ot size={20} /></x.button><div className="w-[1px] h-6 bg-white/10 mx-1" /><x.button whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }} onClick={() => cs(1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors" title="Reset"><Ms size={18} /></x.button></div><div className="flex-1 h-full overflow-auto no-scrollbar py-20 px-4 flex flex-col items-center cursor-zoom-out" onClick={() => Sa(!1)}><x.div initial={{
                    scale: 0.9,
                    opacity: 0,
                    y: 30
                  }} animate={{
                    scale: cn,
                    opacity: 1,
                    y: 0
                  }} exit={{
                    scale: 0.95,
                    opacity: 0,
                    y: 20
                  }} transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                  }} onClick={t => t.stopPropagation()} className="relative keep-white bg-white  ring-1 ring-black/5 transform-gpu cursor-default origin-top"><Mn data={Ta} settings={J} type={Jt || "Sale"} isPreview={!0} showOldDebt={Ke.showOldDebt} showPayment={Ke.showPayment} showRemaining={Ke.showRemaining} showCashGiven={Ke.showCashGiven} showChange={Ke.showChange} /></x.div><p className="mt-10 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-sans">Cuộn để xem toàn bộ hóa đơn • LyangPOS Studio</p></div></div></Ee>}</P><Comp_ad isVisible={Be && T.length === 0} message="Đang nạp dữ liệu POS..." /><Ee><Pd isOpen={tl} partner={p} onClose={() => kt(!1)} onViewOrder={t => {
              setEditingHistoryOrder(t);
            }} onEditOrder={async t => {
              kt(!1);
              await Ka(t);
              G({
                message: `Đã nạp hóa đơn #${t.display_id || t.id} ra giỏ hàng!`,
                type: "success"
              });
            }} onDeleteOrder={Sn} onEditVoucher={t => {
              Ia({
                ...t,
                id: t.id.toString().replace("v_", ""),
                amount: t.total_amount
              });
            }} onDeleteVoucher={gl} onAddToCart={t => {
              const a = T.find(r => r.id === t.id);
              a && ia(a);
            }} /></Ee><Ws>{editingHistoryOrder && <OrderEditModal order={editingHistoryOrder} partner={p || Y.find(n => n.id === editingHistoryOrder.partner_id)} onClose={() => setEditingHistoryOrder(null)} onSave={() => {
              setEditingHistoryOrder(null);
              window.dispatchEvent(new CustomEvent("pos_data_sync", { detail: { type: "ORDER_SAVED" } }));
              const bc = new BroadcastChannel("pos_data_sync");
              bc.postMessage({ type: "ORDER_SAVED" });
              bc.close();
              G({
                message: "Đã cập nhật hóa đơn thành công!",
                type: "success"
              });
            }} />}</Ws><P>{gs && <Ee><div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/60 overflow-y-auto"><x.div initial={{
                  scale: 0.95,
                  opacity: 0,
                  y: 10
                }} animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }} exit={{
                  scale: 0.95,
                  opacity: 0,
                  y: 10
                }} className="bg-[#faf8f3]/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl w-full max-w-md rounded-2xl border border-[#8b6f47]/30 dark:border-white/15 shadow-2xl flex flex-col relative z-10 overflow-hidden"><div className="p-5 flex items-center justify-between border-b border-[#8b6f47]/15 dark:border-white/10 shrink-0"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#2d5016]/10 dark:bg-[#d4a574]/15 rounded-xl flex items-center justify-center border border-[#8b6f47]/20 text-[#2d5016] dark:text-[#d4a574]"><Ot size={20} /></div><div><h3 className="text-base font-black text-[#2d5016] dark:text-[#d4a574] uppercase tracking-wide leading-tight">Thêm món ngoài</h3><p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Phím tắt F6</p></div></div><button onClick={() => La(!1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 transition-colors"><Comp_ke size={16} strokeWidth={2.5} /></button></div><div className="p-5 space-y-4"><div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Tên món / Nội dung</label><input ref={ys} type="text" className="w-full h-12 px-4 bg-white/70 dark:bg-slate-900/70 border border-[#8b6f47]/25 dark:border-white/10 focus:border-[#2d5016] dark:focus:border-[#d4a574] rounded-xl font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground uppercase shadow-inner" placeholder="GÕ TÊN MÓN..." value={ut.name} onChange={t => $a({
                        ...ut,
                        name: t.target.value
                      })} onKeyDown={t => {
                        t.key === "Enter" && (t.preventDefault(), bn.current?.focus());
                      }} /></div><div className="space-y-1"><label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Giá tiền</label><input ref={bn} type="text" className="w-full h-12 px-4 bg-white/70 dark:bg-slate-900/70 border border-[#8b6f47]/25 dark:border-white/10 focus:border-[#2d5016] dark:focus:border-[#d4a574] rounded-xl font-black text-xl text-[#2d5016] dark:text-[#d4a574] outline-none transition-all shadow-inner" placeholder="0" value={ut.price ? parseFloat(ut.price).toLocaleString("en-US") : ""} onChange={t => {
                        const a = t.target.value.replace(/,/g, "");
                        /^\d*$/.test(a) && $a({
                          ...ut,
                          price: a
                        });
                      }} onKeyDown={t => {
                        t.key === "Enter" && (t.preventDefault(), Cn(ut.name, parseFloat(ut.price) || 0));
                      }} /></div></div><div className="p-5 border-t border-[#8b6f47]/15 dark:border-white/10 flex flex-col items-center"><button onClick={() => Cn(ut.name, parseFloat(ut.price) || 0)} className="w-full py-3.5 bg-[#2d5016] hover:bg-[#3d6820] text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-[#2d5016]/20 cursor-pointer"><Ot size={18} /> THÊM VÀO GIỎ (ENTER)</button></div></x.div></div></Ee>}</P><P>{Ui && us && <Comp_rd order={us} partner={Y.find(t => t.id === us.partner_id)} onClose={() => Yt(!1)} onSave={() => {
              Yt(!1), _e && E.invalidateQueries(["orders"]);
            }} />}</P><P>{Da && <Comp_sd isOpen={!!Da} title={Da.title} message={Da.message} onConfirm={Da.onConfirm} onCancel={() => et(null)} />}</P><Ee><P>{Qt && pt && <Comp_ld product={pt} isOpen={Qt} onClose={() => Dt(!1)} onSave={ml} coordinates={Ki} />}</P></Ee><Ee><P>{Fi && <x.div initial={{
                opacity: 0,
                y: -20,
                scale: 0.9
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -20,
                scale: 0.9
              }} className="fixed top-6 right-6 z-[2000000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border border-rose-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl no-print overflow-hidden"><div className="p-2 rounded-xl text-white shadow-lg bg-rose-500 shadow-rose-500/25 shrink-0"><Comp_pa size={20} /></div><div className="flex flex-col min-w-[140px] max-w-[180px]"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 opacity-70">Hành động</span><span className="font-bold text-xs tracking-tight text-slate-800 dark:text-white/95 leading-snug">Xóa dòng thứ mấy?</span></div><input type="text" autoFocus={!0} value={mn} onChange={t => Wa(t.target.value)} onKeyDown={t => {
                  t.key === "Enter" ? (t.preventDefault(), Vi()) : t.key === "Escape" && (gr(!1), Wa(""));
                }} placeholder="Số..." className="w-16 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" /><button onClick={() => {
                  gr(!1), Wa("");
                }} className="ml-2 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white"><Comp_ke size={16} /></button></x.div>}</P></Ee><Ee><P>{Ti && <div className="fixed inset-0 z-[300000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150" onClick={() => Bt(!1)}><x.div onClick={t => t.stopPropagation()} initial={{
                  scale: 0.92,
                  opacity: 0,
                  y: 15
                }} animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }} exit={{
                  scale: 0.92,
                  opacity: 0,
                  y: 15
                }} transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25
                }} className="bg-[#fcfbf9]/95 dark:bg-[#1a1612]/95 backdrop-blur-2xl w-full max-w-lg rounded-[2rem] border border-[#8b6f47]/30 dark:border-white/15 shadow-2xl overflow-hidden p-6 space-y-4"><div className="flex items-center justify-between border-b border-[#8b6f47]/15 dark:border-white/10 pb-3"><div className="flex items-center gap-2.5"><div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><Comp_ri size={18} /></div><div><h3 className="font-black text-base uppercase tracking-tight text-[#2d5016] dark:text-emerald-300">Ghi chú đơn hàng</h3><p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{p ? `Áp dụng cho đơn của: ${p.name}` : "Ghi chú sẽ được in lên hoá đơn bán hàng"}</p></div></div><button onClick={() => Bt(!1)} className="p-2 hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Comp_ke size={18} /></button></div><div className="relative"><textarea autoFocus={!0} rows={5} value={K} onChange={t => $e(t.target.value)} onKeyDown={t => {
                      (t.key === "Escape" || t.key === "Enter" && t.ctrlKey) && (t.preventDefault(), Bt(!1));
                    }} placeholder={`Nhập ghi chú chi tiết cho đơn hàng tại đây...
(Ví dụ: Giao hàng buổi chiều, bọc hàng cẩn thận, chiết khấu đặc biệt...)`} className="w-full p-4 bg-white/70 dark:bg-slate-900/70 border border-[#8b6f47]/25 dark:border-white/10 rounded-2xl text-sm font-semibold text-foreground placeholder:text-slate-400 placeholder:italic focus:border-[#8b6f47]/60 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#8b6f47]/10 transition-all resize-none leading-relaxed custom-scrollbar shadow-inner" /></div><div className="flex items-center justify-between pt-1">{K ? <button onClick={() => $e("")} className="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-1.5"><Comp_pa size={14} />Xóa ghi chú</button> : <div />}<div className="flex items-center gap-2"><button onClick={() => Bt(!1)} className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-all">Đóng (Esc)</button><button onClick={() => Bt(!1)} className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"><Hn size={14} strokeWidth={3} />Xong</button></div></div></x.div></div>}</P></Ee><Ee><P>{Yi && <div className="fixed inset-0 z-[300000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"><x.div initial={{
                  scale: 0.9,
                  opacity: 0,
                  y: 20
                }} animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }} exit={{
                  scale: 0.9,
                  opacity: 0,
                  y: 20
                }} className="bg-white dark:bg-slate-900 backdrop-blur-2xl w-full max-w-sm rounded-[2rem] border border-white dark:border-white/10 overflow-hidden relative p-6 space-y-4"><div className="flex justify-between items-start"><div className="flex items-center gap-2 text-primary dark:text-[#d4a574]"><Ln size={20} className="shrink-0" /><h3 className="font-black text-lg uppercase tracking-tight">Màn hình soạn hàng</h3></div><button onClick={() => fs(!1)} className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Comp_ke size={18} /></button></div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-normal">Chọn phương thức hiển thị màn hình soạn hàng. Sử dụng trình duyệt Chrome/Edge nếu bạn muốn <span className="text-[#059669] dark:text-[#34d399] font-black">truyền màn hình (Cast) lên TV</span>.</p><div className="flex flex-col gap-2.5 pt-2"><button onClick={async () => {
                      fs(!1);
                      const t = "packing-display-" + Date.now(),
                        a = "/#/packing-display",
                        r = window.__TAURI__?.webviewWindow?.WebviewWindow || window.__TAURI__?.window?.WebviewWindow;
                      if (r) try {
                        new r(t, {
                          url: a,
                          title: "Màn hình soạn hàng",
                          width: 1e3,
                          height: 800,
                          center: !0
                        });
                        return;
                      } catch (s) {
                        console.error("Failed to create WebviewWindow from global namespace", s);
                      }
                      if (window.__TAURI_INTERNALS__) try {
                        const {
                          WebviewWindow: s
                        } = await Rn(async () => {
                          const {
                            WebviewWindow: n
                          } = await Ts(async () => {
                            const {
                              WebviewWindow: l
                            } = await import("@tauri-apps/api/webviewWindow");
                            return {
                              WebviewWindow: l
                            };
                          }, []);
                          return {
                            WebviewWindow: n
                          };
                        }, []);
                        new s(t, {
                          url: a,
                          title: "Màn hình soạn hàng",
                          width: 1e3,
                          height: 800,
                          center: !0
                        });
                        return;
                      } catch (s) {
                        console.error("Failed to dynamically import WebviewWindow", s);
                      }
                      window.open(window.location.origin + "/#/packing-display", "_blank", "width=1200,height=800,menubar=no,status=no,toolbar=no,location=no");
                    }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"><Ln size={16} strokeWidth={2.5} /><span>Mở trong cửa sổ App (Tauri)</span></button><button onClick={async () => {
                      fs(!1);
                      const t = localStorage.getItem("server_ip"),
                        a = (t ? `http://${t}:3579` : "http://localhost:3579") + "/#/packing-display";
                      try {
                        await M.post("/api/open-external-chrome", {
                          url: a
                        });
                        return;
                      } catch (r) {
                        console.error("Failed to open Chrome in app mode via backend API, falling back", r);
                      }
                      if (window.__TAURI_INTERNALS__) try {
                        const {
                          open: r
                        } = await Rn(async () => {
                          const {
                            open: s
                          } = await Ts(async () => {
                            const {
                              open: n
                            } = await import("@tauri-apps/plugin-shell");
                            return {
                              open: n
                            };
                          }, []);
                          return {
                            open: s
                          };
                        }, []);
                        await r(a);
                        return;
                      } catch (r) {
                        console.error("Failed to open URL using tauri shell", r);
                      }
                      window.open(a, "_blank", "width=1200,height=800,menubar=no,status=no,toolbar=no,location=no");
                    }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"><Xo size={16} strokeWidth={2.5} /><span>Mở trong Trình duyệt (Để Cast TV)</span></button></div></x.div></div>}</P></Ee><Ee><P>{Lr && <div className="fixed inset-0 z-[300000] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => ba(!1)}><x.div initial={{
                  scale: 0.94,
                  opacity: 0,
                  y: 15
                }} animate={{
                  scale: 1,
                  opacity: 1,
                  y: 0
                }} exit={{
                  scale: 0.94,
                  opacity: 0,
                  y: 15
                }} onClick={t => t.stopPropagation()} className="bg-[#fcfbf9] dark:bg-[#071510] backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] border border-[#8b6f47]/30 dark:border-emerald-500/20 shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden relative p-6 space-y-4 text-foreground max-h-[90vh] flex flex-col box-border">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-1">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#8b6f47]/10 dark:bg-emerald-500/15 border border-[#8b6f47]/25 dark:border-emerald-500/30 text-[#8b6f47] dark:text-emerald-400 flex items-center justify-center shadow-inner shrink-0">
                        <la size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1 flex items-center gap-2">
                          <span>Cài đặt âm thanh & Giọng đọc</span>
                        </h3>
                        <p className="text-[11px] font-bold text-[#8b6f47]/80 dark:text-emerald-400/70">Tùy biến hiệu ứng Web Audio & Giọng đọc AI thời gian thực</p>
                      </div>
                    </div>
                    <button onClick={() => ba(!1)} className="w-9 h-9 flex items-center justify-center hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all hover:rotate-90">
                      <Xn size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Nav Tabs */}
                  <div className="flex p-1 bg-[#f4efe6] dark:bg-[#040e0a] rounded-2xl gap-1 border border-[#8b6f47]/20 dark:border-white/5">
                    <button type="button" onClick={() => cc("general")} className={c("flex-1 py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer", dc === "general" ? "bg-white dark:bg-[#0f2e21] text-[#8b6f47] dark:text-emerald-300 shadow-sm border border-[#8b6f47]/25 dark:border-emerald-500/40" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}>
                      <SetIcon size={14} strokeWidth={2.5} /><span>Giọng đọc TTS</span>
                    </button>
                    <button type="button" onClick={() => cc("sounds")} className={c("flex-1 py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer", dc === "sounds" ? "bg-white dark:bg-[#0f2e21] text-[#8b6f47] dark:text-emerald-300 shadow-sm border border-[#8b6f47]/25 dark:border-emerald-500/40" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}>
                      <MuIcon size={14} strokeWidth={2.5} /><span>Hiệu ứng âm thanh</span>
                    </button>
                    <button type="button" onClick={() => cc("templates")} className={c("flex-1 py-2 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer", dc === "templates" ? "bg-white dark:bg-[#0f2e21] text-[#8b6f47] dark:text-emerald-300 shadow-sm border border-[#8b6f47]/25 dark:border-emerald-500/40" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}>
                      <MsgQuote size={14} strokeWidth={2.5} /><span>Mẫu câu thông báo</span>
                    </button>
                  </div>

                  {/* Tab 2: Hiệu ứng âm thanh */}
                  {dc === "sounds" ? (
                    <div className="space-y-3.5 overflow-y-auto max-h-[52vh] pr-1.5 custom-scrollbar">
                      {/* 1. Thêm món */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                            <uo size={15} strokeWidth={2.5} /> 1. Âm thanh khi thêm món vào giỏ
                          </label>
                          <button type="button" onClick={() => playAddToCartSound(soundThemeCartAdd)} className="text-[11px] font-black text-[#8b6f47] dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8b6f47]/10 dark:bg-emerald-500/10 border border-[#8b6f47]/15 dark:border-emerald-500/20 cursor-pointer">
                            <la size={12} /><span>Nghe thử</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                          {[
                            { id: 'barcode_beep', label: 'Tít máy quét' },
                            { id: 'bubble_drop', label: 'Giọt nước' },
                            { id: 'laser_blip', label: 'Tia Laser' },
                            { id: 'bell_ding', label: 'Chuông Ting' },
                            { id: 'wood_click', label: 'Gõ thanh mộc' },
                            { id: 'coin_drop', label: 'Thả đồng xu' },
                            { id: 'cyber_pop', label: 'Cyber Pop' },
                            { id: 'off', label: 'Tắt âm', isOff: true }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSoundThemeCartAdd(t.id);
                                localStorage.setItem('pos_sound_theme_cart_add', t.id);
                                playAddToCartSound(t.id);
                                try {
                                  const bc = new BroadcastChannel('pos_data_sync');
                                  bc.postMessage({ type: 'UI_SETTING_UPDATED', key: 'pos_sound_theme_cart_add', value: t.id });
                                  bc.close();
                                } catch(e){}
                              }}
                              className={c(
                                "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                                soundThemeCartAdd === t.id
                                  ? t.isOff
                                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/30"
                                    : "bg-[#8b6f47]/15 dark:bg-emerald-500/20 border-[#8b6f47] dark:border-emerald-500 text-[#694e2b] dark:text-emerald-200 font-black shadow-xs ring-1 ring-[#8b6f47]/30 dark:ring-emerald-500/40"
                                  : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-[#8b6f47]/40 dark:hover:border-emerald-500/30"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {t.isOff ? <Uo size={13} className="text-rose-500 shrink-0" /> : <la size={13} className="text-[#8b6f47] dark:text-emerald-400 shrink-0" />}
                                <span className="truncate">{t.label}</span>
                              </div>
                              {soundThemeCartAdd === t.id && (
                                t.isOff ? <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" /> : <Vo size={14} className="text-[#8b6f47] dark:text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Hoàn tất lưu đơn */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                            <Lo size={15} strokeWidth={2.5} /> 2. Âm thanh hoàn tất / Lưu đơn
                          </label>
                          <button type="button" onClick={() => Is(soundThemeSuccess)} className="text-[11px] font-black text-[#8b6f47] dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8b6f47]/10 dark:bg-emerald-500/10 border border-[#8b6f47]/15 dark:border-emerald-500/20 cursor-pointer">
                            <la size={12} /><span>Nghe thử</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs font-bold">
                          {[
                            { id: 'chime', label: 'Chuông Triad ngân' },
                            { id: 'cash_register', label: 'Két tiền Cha-ching' },
                            { id: 'digital_pos', label: 'POS Điện tử' },
                            { id: 'mario', label: 'Ăn xu Arcade' },
                            { id: 'subtle_wood', label: 'Gỗ Mộc Marimba' },
                            { id: 'fanfare', label: 'Khải hoàn Fanfare' },
                            { id: 'zen_bell', label: 'Chuông Bát Thiền' },
                            { id: 'coin_clink', label: 'Tiếng Xu Keng' },
                            { id: 'off', label: 'Tắt âm', isOff: true }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSoundThemeSuccess(t.id);
                                localStorage.setItem('pos_sound_theme_success', t.id);
                                Is(t.id);
                                try {
                                  const bc = new BroadcastChannel('pos_data_sync');
                                  bc.postMessage({ type: 'UI_SETTING_UPDATED', key: 'pos_sound_theme_success', value: t.id });
                                  bc.close();
                                } catch(e){}
                              }}
                              className={c(
                                "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                                soundThemeSuccess === t.id
                                  ? t.isOff
                                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/30"
                                    : "bg-[#8b6f47]/15 dark:bg-emerald-500/20 border-[#8b6f47] dark:border-emerald-500 text-[#694e2b] dark:text-emerald-200 font-black shadow-xs ring-1 ring-[#8b6f47]/30 dark:ring-emerald-500/40"
                                  : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-[#8b6f47]/40 dark:hover:border-emerald-500/30"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {t.isOff ? <Uo size={13} className="text-rose-500 shrink-0" /> : <la size={13} className="text-[#8b6f47] dark:text-emerald-400 shrink-0" />}
                                <span className="truncate">{t.label}</span>
                              </div>
                              {soundThemeSuccess === t.id && (
                                t.isOff ? <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" /> : <Vo size={14} className="text-[#8b6f47] dark:text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Thao tác click */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                            <Es size={15} strokeWidth={2.5} /> 3. Âm thao tác (Chọn, Đổi tab, Xóa)
                          </label>
                          <button type="button" onClick={() => Ds(soundThemeAction)} className="text-[11px] font-black text-[#8b6f47] dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8b6f47]/10 dark:bg-emerald-500/10 border border-[#8b6f47]/15 dark:border-emerald-500/20 cursor-pointer">
                            <la size={12} /><span>Nghe thử</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                          {[
                            { id: 'pop_bubble', label: 'Bóng nước Pop' },
                            { id: 'click_switch', label: 'Nút bấm sắc' },
                            { id: 'tap_wooden', label: 'Gõ lách cách' },
                            { id: 'beep_soft', label: 'Tít êm dịu' },
                            { id: 'whoosh_subtle', label: 'Lướt gió Whoosh' },
                            { id: 'camera_snap', label: 'Máy ảnh Snap' },
                            { id: 'off', label: 'Tắt âm', isOff: true }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSoundThemeAction(t.id);
                                localStorage.setItem('pos_sound_theme_action', t.id);
                                Ds(t.id);
                                try {
                                  const bc = new BroadcastChannel('pos_data_sync');
                                  bc.postMessage({ type: 'UI_SETTING_UPDATED', key: 'pos_sound_theme_action', value: t.id });
                                  bc.close();
                                } catch(e){}
                              }}
                              className={c(
                                "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                                soundThemeAction === t.id
                                  ? t.isOff
                                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/30"
                                    : "bg-[#8b6f47]/15 dark:bg-emerald-500/20 border-[#8b6f47] dark:border-emerald-500 text-[#694e2b] dark:text-emerald-200 font-black shadow-xs ring-1 ring-[#8b6f47]/30 dark:ring-emerald-500/40"
                                  : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-[#8b6f47]/40 dark:hover:border-emerald-500/30"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {t.isOff ? <Uo size={13} className="text-rose-500 shrink-0" /> : <la size={13} className="text-[#8b6f47] dark:text-emerald-400 shrink-0" />}
                                <span className="truncate">{t.label}</span>
                              </div>
                              {soundThemeAction === t.id && (
                                t.isOff ? <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" /> : <Vo size={14} className="text-[#8b6f47] dark:text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Gõ phím tìm kiếm */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                            <yo size={15} strokeWidth={2.5} /> 4. Âm thanh gõ ô tìm kiếm (F2)
                          </label>
                          <button type="button" onClick={() => playTypingSoundUtil(soundThemeTyping)} className="text-[11px] font-black text-[#8b6f47] dark:text-emerald-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#8b6f47]/10 dark:bg-emerald-500/10 border border-[#8b6f47]/15 dark:border-emerald-500/20 cursor-pointer">
                            <la size={12} /><span>Nghe thử</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                          {[
                            { id: 'mechanical', label: 'Phím cơ Blue' },
                            { id: 'thock_deep', label: 'Phím Thocky' },
                            { id: 'typewriter', label: 'Máy đánh chữ' },
                            { id: 'soft_click', label: 'Màng phím nhẹ' },
                            { id: 'bubble_typing', label: 'Bong bóng nước' },
                            { id: 'retro_beep', label: 'Terminal cổ' },
                            { id: 'off', label: 'Tắt âm', isOff: true }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSoundThemeTyping(t.id);
                                localStorage.setItem('pos_sound_theme_typing', t.id);
                                playTypingSoundUtil(t.id);
                                try {
                                  const bc = new BroadcastChannel('pos_data_sync');
                                  bc.postMessage({ type: 'UI_SETTING_UPDATED', key: 'pos_sound_theme_typing', value: t.id });
                                  bc.close();
                                } catch(e){}
                              }}
                              className={c(
                                "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                                soundThemeTyping === t.id
                                  ? t.isOff
                                    ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/30"
                                    : "bg-[#8b6f47]/15 dark:bg-emerald-500/20 border-[#8b6f47] dark:border-emerald-500 text-[#694e2b] dark:text-emerald-200 font-black shadow-xs ring-1 ring-[#8b6f47]/30 dark:ring-emerald-500/40"
                                  : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-[#8b6f47]/40 dark:hover:border-emerald-500/30"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {t.isOff ? <Uo size={13} className="text-rose-500 shrink-0" /> : <la size={13} className="text-[#8b6f47] dark:text-emerald-400 shrink-0" />}
                                <span className="truncate">{t.label}</span>
                              </div>
                              {soundThemeTyping === t.id && (
                                t.isOff ? <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" /> : <Vo size={14} className="text-[#8b6f47] dark:text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 5. Cảnh báo & Lỗi */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-rose-500/20 dark:border-rose-500/25">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <As size={15} strokeWidth={2.5} /> 5. Âm cảnh báo & Báo lỗi
                          </label>
                          <button type="button" onClick={() => Sl(soundThemeError)} className="text-[11px] font-black text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer">
                            <la size={12} /><span>Nghe thử</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                          {[
                            { id: 'buzz_low', label: 'Rè trầm báo động' },
                            { id: 'glass_bonk', label: 'Gõ kính đanh' },
                            { id: 'chord_warn', label: 'Hợp âm cảnh báo' },
                            { id: 'off', label: 'Tắt âm', isOff: true }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setSoundThemeError(t.id);
                                localStorage.setItem('pos_sound_theme_error', t.id);
                                Sl(t.id);
                                try {
                                  const bc = new BroadcastChannel('pos_data_sync');
                                  bc.postMessage({ type: 'UI_SETTING_UPDATED', key: 'pos_sound_theme_error', value: t.id });
                                  bc.close();
                                } catch(e){}
                              }}
                              className={c(
                                "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer",
                                soundThemeError === t.id
                                  ? "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-black shadow-xs ring-1 ring-rose-500/30"
                                  : "bg-white dark:bg-[#06140e] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-rose-500/40"
                              )}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {t.isOff ? <Uo size={13} className="text-rose-500 shrink-0" /> : <As size={13} className="text-rose-500 shrink-0" />}
                                <span className="truncate">{t.label}</span>
                              </div>
                              {soundThemeError === t.id && <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-1" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : dc === "general" ? (
                    /* Tab 1: Cài đặt Giọng đọc TTS */
                    <div className="space-y-4 overflow-y-auto max-h-[52vh] pr-1.5 custom-scrollbar">
                      {/* Voice Mode */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                          <span>Giọng đọc chính (TTS Engine)</span>
                          <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-bold">Edge Neural AI (Tự nhiên)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => Ar("off")}
                            className={c(
                              "py-3 px-2 rounded-2xl font-black text-xs uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all border cursor-pointer",
                              ft === "off"
                                ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20 scale-[1.02]"
                                : "bg-white dark:bg-[#06140e] text-slate-700 dark:text-slate-300 border-[#8b6f47]/20 dark:border-white/5 hover:bg-[#f4efe6] dark:hover:bg-white/5"
                            )}
                          >
                            <Uo size={20} strokeWidth={2.5} />
                            <span>Tắt giọng đọc</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => Ar("female")}
                            className={c(
                              "py-3 px-2 rounded-2xl font-black text-xs uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all border cursor-pointer",
                              ft === "female"
                                ? "bg-[#8b6f47] dark:bg-emerald-600 text-white border-[#8b6f47] dark:border-emerald-500 shadow-md shadow-[#8b6f47]/20 dark:shadow-emerald-600/20 scale-[1.02]"
                                : "bg-white dark:bg-[#06140e] text-slate-700 dark:text-slate-300 border-[#8b6f47]/20 dark:border-white/5 hover:bg-[#f4efe6] dark:hover:bg-white/5"
                            )}
                          >
                            <la size={20} strokeWidth={2.5} />
                            <span>Giọng Nữ (Hoài My)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => Ar("male")}
                            className={c(
                              "py-3 px-2 rounded-2xl font-black text-xs uppercase tracking-tight flex flex-col items-center gap-1.5 transition-all border cursor-pointer",
                              ft === "male"
                                ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20 scale-[1.02]"
                                : "bg-white dark:bg-[#06140e] text-slate-700 dark:text-slate-300 border-[#8b6f47]/20 dark:border-white/5 hover:bg-[#f4efe6] dark:hover:bg-white/5"
                            )}
                          >
                            <la size={20} strokeWidth={2.5} />
                            <span>Giọng Nam (Nam Minh)</span>
                          </button>
                        </div>
                      </div>

                      {/* Speed Slider */}
                      <div className="space-y-2 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 p-4 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="uppercase tracking-wider text-slate-700 dark:text-slate-300">Tốc độ đọc giọng</span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#8b6f47]/15 dark:bg-emerald-500/15 text-[#8b6f47] dark:text-emerald-300 font-mono font-black text-xs">
                            {Or}x {Or === 1.4 ? "(Chuẩn tối ưu)" : ""}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="2.0"
                          step="0.1"
                          value={Or}
                          onChange={ji}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                        <div className="flex justify-between gap-1 pt-1">
                          {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map(sp => (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => {
                                wi(sp);
                                localStorage.setItem("pos_speech_rate", sp.toString());
                                setTimeout(() => Ss(T), 100);
                              }}
                              className={c(
                                "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer",
                                Or === sp ? "bg-[#8b6f47] dark:bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-[#06140e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-[#8b6f47]/20 dark:border-white/5"
                              )}
                            >
                              {sp}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pitch Slider (Tông giọng: Trầm - Bổng / Cao - Thấp) */}
                      <div className="space-y-2 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 p-4 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="uppercase tracking-wider text-slate-700 dark:text-slate-300">Tông giọng (Cao - Thấp / Trầm - Bổng)</span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#8b6f47]/15 dark:bg-emerald-500/15 text-[#8b6f47] dark:text-emerald-300 font-mono font-black text-xs">
                            {speechPitch === 0 ? "0Hz (Chuẩn tự nhiên)" : speechPitch > 0 ? `+${speechPitch}Hz (Bổng/Trẻ trung)` : `${speechPitch}Hz (Trầm ấm)`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="5"
                          value={speechPitch}
                          onChange={handlePitchChange}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {[
                            { val: -20, label: "Trầm ấm (-20)" },
                            { val: -10, label: "Hơi trầm (-10)" },
                            { val: 0, label: "Chuẩn (0)" },
                            { val: 10, label: "Hơi bổng (+10)" },
                            { val: 20, label: "Trong trẻo (+20)" },
                          ].map(item => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setSpeechPitch(item.val);
                                localStorage.setItem("pos_speech_pitch", item.val.toString());
                                setTimeout(() => Ss(T), 100);
                              }}
                              className={c(
                                "px-1.5 py-1 rounded-lg text-[9.5px] font-black transition-all cursor-pointer text-center truncate",
                                speechPitch === item.val ? "bg-[#8b6f47] dark:bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-[#06140e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-[#8b6f47]/20 dark:border-white/5"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Speech Gap Slider (Khoảng nghỉ giữa Tên món & Số lượng) */}
                      <div className="space-y-2 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 p-4 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="uppercase tracking-wider text-slate-700 dark:text-slate-300">Khoảng nghỉ giữa Tên món & Số lượng</span>
                          <span className="px-2 py-0.5 rounded-lg bg-[#8b6f47]/15 dark:bg-emerald-500/15 text-[#8b6f47] dark:text-emerald-300 font-mono font-black text-xs">
                            {speechGap}ms {speechGap === 150 ? "(Tự nhiên)" : speechGap === 0 ? "(Liền mạch 0ms)" : ""}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="25"
                          value={speechGap}
                          onChange={handleGapChange}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                        <div className="grid grid-cols-6 gap-1 pt-1">
                          {[
                            { val: 0, label: "0ms" },
                            { val: 50, label: "50ms" },
                            { val: 100, label: "100ms" },
                            { val: 150, label: "150ms" },
                            { val: 200, label: "200ms" },
                            { val: 300, label: "300ms" },
                          ].map(item => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setSpeechGap(item.val);
                                localStorage.setItem("pos_speech_gap", item.val.toString());
                              }}
                              className={c(
                                "px-1.5 py-1 rounded-lg text-[9.5px] font-black transition-all cursor-pointer text-center truncate",
                                speechGap === item.val ? "bg-[#8b6f47] dark:bg-emerald-600 text-white shadow-xs" : "bg-white dark:bg-[#06140e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-[#8b6f47]/20 dark:border-white/5"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content options */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Tùy chọn đọc nội dung</label>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const t = !Za;
                              gi(t), localStorage.setItem("pos_tts_read_product", t.toString());
                            }}
                            className={c("flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer", Za ? "bg-[#8b6f47]/10 dark:bg-emerald-500/10 border-[#8b6f47]/40 dark:border-emerald-500/40 text-[#694e2b] dark:text-emerald-300 font-black shadow-xs" : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 opacity-60 text-slate-500")}
                          >
                            <input type="checkbox" checked={Za} readOnly={!0} className="w-4 h-4 accent-[#8b6f47] dark:accent-emerald-600 rounded" />
                            <div className="flex flex-col">
                              <span>Đọc tên sản phẩm</span>
                              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 leading-tight">(Chỉ đọc khi có bí danh / alias)</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const t = !er;
                              fi(t), localStorage.setItem("pos_tts_read_qty", t.toString());
                            }}
                            className={c("flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer", er ? "bg-[#8b6f47]/10 dark:bg-emerald-500/10 border-[#8b6f47]/40 dark:border-emerald-500/40 text-[#694e2b] dark:text-emerald-300 font-black shadow-xs" : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 opacity-60 text-slate-500")}
                          >
                            <input type="checkbox" checked={er} readOnly={!0} className="w-4 h-4 accent-[#8b6f47] dark:accent-emerald-600 rounded" />
                            <span>Đọc số lượng món</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const t = !xa;
                              yi(t), localStorage.setItem("pos_tts_read_total", t.toString());
                            }}
                            className={c("flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer", xa ? "bg-[#8b6f47]/10 dark:bg-emerald-500/10 border-[#8b6f47]/40 dark:border-emerald-500/40 text-[#694e2b] dark:text-emerald-300 font-black shadow-xs" : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 opacity-60 text-slate-500")}
                          >
                            <input type="checkbox" checked={xa} readOnly={!0} className="w-4 h-4 accent-[#8b6f47] dark:accent-emerald-600 rounded" />
                            <span>Đọc tổng tiền hóa đơn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const t = !ha;
                              vi(t), localStorage.setItem("pos_tts_read_thanks", t.toString());
                            }}
                            className={c("flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left cursor-pointer", ha ? "bg-[#8b6f47]/10 dark:bg-emerald-500/10 border-[#8b6f47]/40 dark:border-emerald-500/40 text-[#694e2b] dark:text-emerald-300 font-black shadow-xs" : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 opacity-60 text-slate-500")}
                          >
                            <input type="checkbox" checked={ha} readOnly={!0} className="w-4 h-4 accent-[#8b6f47] dark:accent-emerald-600 rounded" />
                            <span>Đọc lời cảm ơn sau lưu</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const t = !typingSoundEnabled;
                              setTypingSoundEnabled(t);
                              localStorage.setItem("pos_typing_sound_enabled", t ? "true" : "false");
                              try {
                                const a = new BroadcastChannel("pos_data_sync");
                                a.postMessage({
                                  type: "UI_SETTING_UPDATED",
                                  key: "pos_typing_sound_enabled",
                                  value: t ? "true" : "false"
                                }), a.close();
                              } catch {}
                            }}
                            className={c("flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left col-span-2 cursor-pointer", typingSoundEnabled ? "bg-[#8b6f47]/10 dark:bg-emerald-500/10 border-[#8b6f47]/40 dark:border-emerald-500/40 text-[#694e2b] dark:text-emerald-300 font-black shadow-xs" : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 opacity-60 text-slate-500")}
                          >
                            <input type="checkbox" checked={typingSoundEnabled} readOnly={!0} className="w-4 h-4 accent-[#8b6f47] dark:accent-emerald-600 rounded" />
                            <span>Bật tiếng lách cách bàn phím khi gõ tìm kiếm (F2)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : dc === "templates" ? (
                    /* Tab 3: Mẫu câu thông báo */
                    <div className="space-y-3.5 overflow-y-auto max-h-[52vh] pr-1.5 custom-scrollbar">
                      {/* Thứ tự đọc khi quét */}
                      <div className="space-y-2.5 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                            <uo size={15} strokeWidth={2.5} className="shrink-0" /> Thứ tự đọc khi quét / thêm món
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              Wc("name_first");
                              localStorage.setItem("pos_tts_cart_speech_order", "name_first");
                            }}
                            className={c("py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer", Mc === "name_first" ? "bg-[#8b6f47] dark:bg-emerald-600 text-white border-[#8b6f47] dark:border-emerald-500 shadow-sm" : "bg-white dark:bg-[#06140e] text-slate-700 dark:text-slate-300 border-[#8b6f47]/20 dark:border-white/5")}
                          >
                            Tên món ➜ Số lượng
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              Wc("qty_first");
                              localStorage.setItem("pos_tts_cart_speech_order", "qty_first");
                            }}
                            className={c("py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer", Mc === "qty_first" ? "bg-[#8b6f47] dark:bg-emerald-600 text-white border-[#8b6f47] dark:border-emerald-500 shadow-sm" : "bg-white dark:bg-[#06140e] text-slate-700 dark:text-slate-300 border-[#8b6f47]/20 dark:border-white/5")}
                          >
                            Số lượng ➜ Tên món
                          </button>
                        </div>
                      </div>

                      {/* Đọc tổng tiền */}
                      <div className="space-y-3 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                          <Do size={15} strokeWidth={2.5} className="shrink-0" /> Đọc tổng tiền thanh toán
                        </label>
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Mẫu câu (Khách lẻ):</span>
                              <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-mono">Dùng: {'{amount}'}</span>
                            </div>
                            <input
                              type="text"
                              value={pc}
                              onChange={t => {
                                uc(t.target.value);
                                localStorage.setItem("pos_tts_currency_template", t.target.value);
                              }}
                              placeholder="số tiền của quý khách là {amount} đồng"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Mẫu câu (Có tên đối tác / khách hàng):</span>
                              <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-mono">Dùng: {'{partner}'}, {'{amount}'}</span>
                            </div>
                            <input
                              type="text"
                              value={mc}
                              onChange={t => {
                                xc(t.target.value);
                                localStorage.setItem("pos_tts_currency_partner_template", t.target.value);
                              }}
                              placeholder="số tiền của {partner} là {amount} đồng"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Chuyển khoản */}
                      <div className="space-y-3 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                          <Po size={15} strokeWidth={2.5} className="shrink-0" /> Đọc chuyển khoản (VietQR / Ngân hàng)
                        </label>
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Mẫu câu chuyển khoản:</span>
                              <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-mono">Dùng: {'{amount}'}</span>
                            </div>
                            <input
                              type="text"
                              value={Nc}
                              onChange={t => {
                                Cc(t.target.value);
                                localStorage.setItem("pos_tts_transfer_template", t.target.value);
                              }}
                              placeholder="số tiền cần chuyển khoản là {amount} đồng"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Mẫu câu chuyển khoản (Có tên khách):</span>
                              <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-mono">Dùng: {'{partner}'}, {'{amount}'}</span>
                            </div>
                            <input
                              type="text"
                              value={Sc}
                              onChange={t => {
                                Tc(t.target.value);
                                localStorage.setItem("pos_tts_transfer_partner_template", t.target.value);
                              }}
                              placeholder="số tiền cần chuyển khoản của {partner} là {amount} đồng"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lời cảm ơn */}
                      <div className="space-y-3 p-3.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-2xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <label className="text-xs font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center gap-2">
                          <Es size={15} strokeWidth={2.5} className="shrink-0" /> Lời cảm ơn sau bán hàng
                        </label>
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Lời cảm ơn (Khách lẻ):</span>
                            </div>
                            <input
                              type="text"
                              value={hc}
                              onChange={t => {
                                bc(t.target.value);
                                localStorage.setItem("pos_tts_thankyou_template", t.target.value);
                              }}
                              placeholder="Cảm ơn quý khách"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              <span>Lời cảm ơn (Có tên khách):</span>
                              <span className="text-[10px] text-[#8b6f47] dark:text-emerald-400 font-mono">Dùng: {'{partner}'}</span>
                            </div>
                            <input
                              type="text"
                              value={gc}
                              onChange={t => {
                                fc(t.target.value);
                                localStorage.setItem("pos_tts_thankyou_partner_template", t.target.value);
                              }}
                              placeholder="Cảm ơn {partner}"
                              className="w-full p-2.5 bg-white dark:bg-[#06140e] border border-[#8b6f47]/20 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-[#8b6f47] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#8b6f47]/40"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Modal Footer */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#8b6f47]/20 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const sampleAmount = "năm mươi nghìn đồng",
                          samplePartner = "anh Nam",
                          sampleTotal = (pc || "số tiền của quý khách là {amount} đồng").replace("{amount}", sampleAmount).replace(/{partner}/gi, samplePartner),
                          sampleThanks = (hc || "Xin cảm ơn quý khách!").replace(/{partner}/gi, samplePartner),
                          sampleText = dc === "templates" ? `${sampleTotal}. ${sampleThanks}` : "Đã thêm 2 chai nước khoáng, tổng tiền năm mươi nghìn đồng. Xin cảm ơn quý khách!";
                        ht(sampleText);
                      }}
                      className="flex-1 py-3 px-4 bg-[#f4efe6] hover:bg-[#eae3d5] dark:bg-[#0a1f16] dark:hover:bg-[#0e291e] border border-[#8b6f47]/20 dark:border-emerald-500/20 rounded-2xl font-black text-xs uppercase tracking-wider text-[#8b6f47] dark:text-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <la size={16} /><span>Phát thử giọng mẫu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => ba(!1)}
                      className="py-3 px-8 bg-gradient-to-r from-[#8b6f47] to-[#6e5433] dark:from-emerald-600 dark:to-teal-600 hover:opacity-95 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#8b6f47]/20 dark:shadow-emerald-600/25 active:scale-98 cursor-pointer"
                    >
                      Xong & Lưu
                    </button>
                  </div>
                </x.div></div>}</P></Ee><P>{C && <Ee><div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"><x.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} className="fixed inset-0" onClick={() => {
                  X(!1), we([]);
                }} /><x.div initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10
                }} animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10
                }} transition={{
                  duration: 0.22,
                  ease: [0.22, 1, 0.36, 1]
                }} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col relative z-10 overflow-hidden max-h-[90vh]"><div className="p-4 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 shrink-0"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-sm"><En size={20} /></div><div className="flex flex-col min-w-0"><h3 className="text-base font-black text-foreground uppercase tracking-tight leading-relaxed py-0.5 truncate">Quét Đơn Hàng / Hóa Đơn AI</h3><p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-0.5">Tự động nhận dạng toa hàng & thêm vào giỏ bán bằng Gemini</p></div></div><button onClick={() => {
                      X(!1), we([]);
                    }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-muted-foreground transition-colors"><Comp_ke size={16} strokeWidth={2.5} /></button></div><div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">{!J?.gemini_api_key && <div className="p-4 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-2xl space-y-2"><div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase"><As size={16} />Cần cấu hình API Key</div><p className="text-xs text-slate-600 dark:text-slate-400">Vui lòng nhập <strong>Gemini API Key</strong> của bạn để tiếp tục.</p><input type="password" value={te} onChange={t => at(t.target.value)} placeholder="Nhập Gemini API Key..." className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none focus:border-emerald-500 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500/35 transition-all" /></div>}<div className="space-y-4 flex flex-col"><div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 rounded-[2rem] p-6 bg-slate-50/50 dark:bg-slate-800/20 min-h-[260px] relative overflow-hidden group transition-all duration-300">{pe.length > 0 ? <div className="w-full h-full flex flex-col space-y-4"><div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto p-1 custom-scrollbar">{pe.map((t, a) => <div key={a} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 group/thumb shadow-sm"><img src={t} alt={`Preview ${a + 1}`} className="w-full h-full object-cover" /><button type="button" onClick={() => we(r => r.filter((s, n) => n !== a))} className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow opacity-0 group-hover/thumb:opacity-100 duration-200"><Comp_ke size={10} /></button></div>)}</div><div className="flex justify-center gap-3"><label htmlFor="pos-scan-image-upload" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95"><Zn size={14} strokeWidth={3} />Thêm ảnh</label><button type="button" onClick={() => we([])} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm active:scale-95">Xóa tất cả</button></div></div> : <label htmlFor="pos-scan-image-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-4 w-full h-full py-8"><div className="p-5 bg-emerald-500/10 text-emerald-600 rounded-full group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300"><Bo size={36} /></div><div className="text-center space-y-1.5"><p className="text-sm font-black text-slate-700 dark:text-slate-300">Chụp hoặc tải ảnh toa hàng / hóa đơn</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hỗ trợ nhiều ảnh chụp tay, hóa đơn giấy</p></div></label>}<input type="file" accept="image/*" multiple={!0} capture="environment" onChange={Nt} className="hidden" id="pos-scan-image-upload" /></div>{pe.length > 0 && <x.button whileTap={{
                        scale: 0.98
                      }} onClick={Lt} disabled={Oe || !J?.gemini_api_key && !te} className="w-full p-4 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:brightness-110 disabled:opacity-50 text-white font-black uppercase text-xs tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-[0.98] transition-all">{Oe ? <><Comp_ai size={16} className="animate-spin text-white" />Đang nhận dạng toa hàng bằng AI...</> : <><Es size={16} className="text-white" />Bắt đầu quét và thêm vào giỏ hàng (AI)</>}</x.button>}</div></div></x.div></div></Ee>}</P><Ee><Xl isOpen={Si} settings={J} onClose={() => Xr(!1)} onEditOrder={t => {
              Ka(t), G({
                message: `Đã nạp hóa đơn #${t.display_id || t.id} ra giỏ hàng!`,
                type: "success"
              });
            }} onPrintOrder={(t, a = "Sale") => {
              pn(a || "Sale");
              const r = Y.find(n => n.id === t.partner_id),
                s = {
                  ...t,
                  old_debt: t.old_debt !== void 0 && t.old_debt !== null ? t.old_debt : r && r.debt_balance || 0,
                  partner: r || t.partner || null
                };
              Ur(s);
              setTimeout(async () => {
                try {
                  if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                  }
                } catch (e) {}
                window.print();
              }, 200);
            }} onDeleteOrder={t => {
              Sn(t);
            }} /></Ee><P>{showMascotCustomizer && (
              <Fn>
                <x.div
                  drag={!0}
                  dragMomentum={!1}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="fixed right-5 bottom-5 z-[9999] w-[350px] bg-[#fcfbf9]/95 dark:bg-[#071510]/95 backdrop-blur-2xl rounded-[2rem] border border-[#8b6f47]/30 dark:border-emerald-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-4 text-foreground flex flex-col gap-3 font-sans ring-1 ring-black/5 dark:ring-white/10 select-none cursor-default"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header & Drag Handle */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#8b6f47]/15 dark:border-white/10 cursor-move active:cursor-grabbing">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#8b6f47]/15 dark:bg-emerald-500/20 text-[#8b6f47] dark:text-emerald-400 flex items-center justify-center text-base shrink-0 shadow-inner">
                        🎨
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-0.5 flex items-center gap-1.5">
                          <span>Tùy Biến Mascot Chìm</span>
                          <span className="text-[9px] font-bold text-slate-400 font-mono">(Kéo thả di chuyển)</span>
                        </h4>
                        <p className="text-[10px] font-bold text-[#8b6f47]/80 dark:text-emerald-400/80">Live preview ngay trên giỏ hàng</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMascotCustomizer(false)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Xn size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[65vh] pr-1 custom-scrollbar">
                    {/* Bật / Tắt */}
                    <div className="p-2.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-xl border border-[#8b6f47]/20 dark:border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-white">Hiện Mascot Khắc Chìm</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !mascotWatermarkVisible;
                          setMascotWatermarkVisible(next);
                          localStorage.setItem("pos_mascot_watermark_visible", String(next));
                        }}
                        className={c(
                          "w-11 h-6 rounded-full transition-colors p-0.5 flex items-center shadow-inner cursor-pointer",
                          mascotWatermarkVisible ? "bg-[#2d5016] dark:bg-emerald-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                        )}
                      >
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>

                    {/* Vị trí góc neo */}
                    <div className="space-y-1.5 p-2.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[#8b6f47] dark:text-emerald-400 flex items-center justify-between">
                        <span>Góc neo</span>
                        <span className="text-[9.5px] text-slate-500 font-mono font-bold">{mascotWatermarkPos}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                        {[
                          { id: "bottom-right", label: "Dưới Phải" },
                          { id: "bottom-left", label: "Dưới Trái" },
                          { id: "center", label: "Chính Giữa" },
                          { id: "top-right", label: "Trên Phải" },
                          { id: "top-left", label: "Trên Trái" },
                        ].map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setMascotWatermarkPos(item.id);
                              localStorage.setItem("pos_mascot_watermark_pos", item.id);
                            }}
                            className={c(
                              "py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer text-[10px] font-black",
                              mascotWatermarkPos === item.id
                                ? "bg-[#8b6f47] dark:bg-emerald-600 text-white shadow-xs border-[#8b6f47] dark:border-emerald-500"
                                : "bg-white dark:bg-[#06140e] border-[#8b6f47]/15 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-[#8b6f47]/40"
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Kích thước & Độ mờ */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Scale */}
                      <div className="space-y-1 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 p-2.5 rounded-xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex justify-between items-center text-[10.5px] font-black">
                          <span className="text-slate-700 dark:text-slate-300">Cỡ ({mascotWatermarkScale}%)</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          step="5"
                          value={mascotWatermarkScale}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setMascotWatermarkScale(val);
                            localStorage.setItem("pos_mascot_watermark_scale", String(val));
                          }}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* Opacity */}
                      <div className="space-y-1 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 p-2.5 rounded-xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                        <div className="flex justify-between items-center text-[10.5px] font-black">
                          <span className="text-slate-700 dark:text-slate-300">Độ đậm ({mascotWatermarkOpacity}%)</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="1"
                          value={mascotWatermarkOpacity}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setMascotWatermarkOpacity(val);
                            localStorage.setItem("pos_mascot_watermark_opacity", String(val));
                          }}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Tinh chỉnh tọa độ X / Y (Offset) & Góc xoay */}
                    <div className="space-y-2 p-2.5 bg-[#fbf8f2] dark:bg-[#0a1f16]/60 rounded-xl border border-[#8b6f47]/20 dark:border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-black text-[#8b6f47] dark:text-emerald-400 uppercase">Dịch tọa độ & Góc xoay</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMascotWatermarkOffsetX(10);
                            setMascotWatermarkOffsetY(10);
                            setMascotWatermarkRotate(-6);
                            setMascotWatermarkScale(100);
                            setMascotWatermarkOpacity(15);
                            setMascotWatermarkPos("bottom-right");
                            localStorage.setItem("pos_mascot_watermark_offset_x", "10");
                            localStorage.setItem("pos_mascot_watermark_offset_y", "10");
                            localStorage.setItem("pos_mascot_watermark_rotate", "-6");
                            localStorage.setItem("pos_mascot_watermark_scale", "100");
                            localStorage.setItem("pos_mascot_watermark_opacity", "15");
                            localStorage.setItem("pos_mascot_watermark_pos", "bottom-right");
                          }}
                          className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Mặc định
                        </button>
                      </div>

                      {/* Trục X */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-600 dark:text-slate-300">
                          <span>Ngang (X):</span>
                          <span className="font-mono text-[#8b6f47] dark:text-emerald-400">{mascotWatermarkOffsetX > 0 ? `+${mascotWatermarkOffsetX}` : mascotWatermarkOffsetX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={mascotWatermarkOffsetX}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setMascotWatermarkOffsetX(val);
                            localStorage.setItem("pos_mascot_watermark_offset_x", String(val));
                          }}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* Trục Y */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-600 dark:text-slate-300">
                          <span>Dọc (Y):</span>
                          <span className="font-mono text-[#8b6f47] dark:text-emerald-400">{mascotWatermarkOffsetY > 0 ? `+${mascotWatermarkOffsetY}` : mascotWatermarkOffsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-120"
                          max="120"
                          step="2"
                          value={mascotWatermarkOffsetY}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setMascotWatermarkOffsetY(val);
                            localStorage.setItem("pos_mascot_watermark_offset_y", String(val));
                          }}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* Góc xoay */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-slate-600 dark:text-slate-300">
                          <span>Góc xoay:</span>
                          <span className="font-mono text-[#8b6f47] dark:text-emerald-400">{mascotWatermarkRotate}°</span>
                        </div>
                        <input
                          type="range"
                          min="-45"
                          max="45"
                          step="1"
                          value={mascotWatermarkRotate}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setMascotWatermarkRotate(val);
                            localStorage.setItem("pos_mascot_watermark_rotate", String(val));
                          }}
                          className="w-full accent-[#8b6f47] dark:accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút đóng hoàn tất */}
                  <button
                    type="button"
                    onClick={() => setShowMascotCustomizer(false)}
                    className="w-full py-2 bg-[#2d5016] dark:bg-emerald-600 hover:bg-[#234011] dark:hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer text-center"
                  >
                    Xong / Đóng bảng
                  </button>
                </x.div>
              </Fn>
            )}</P><P>{historyPartner && <PartnerHistoryModal isOpen={!!historyPartner} partner={historyPartner} onClose={() => setHistoryPartner(null)} />}</P><Fn><POSHistoryPanel context="POS" defaultType="Sale" partner={p} isOpen={isHistoryPanelOpen} onClose={() => setIsHistoryPanelOpen(!1)} onAddToCart={t => {
              const a = (T || []).find(r => r.id === t.id) || t,
                r = t.last_price !== void 0 ? t.last_price : R[a.id] !== void 0 ? R[a.id] : Te === "Wholesale" && a.bulk_price || a.sale_price || 0;
              He({
                product: a,
                quantity: 1,
                price: r,
                secondary_qty: 1 / (a.multiplier || 1),
                name: a.name
              }), ia(a, 1, r), Ds(), G({
                message: `Đã thêm ${a.name} vào giỏ hàng`,
                type: "success"
              });
            }} onEditOrder={async t => {
              setIsHistoryPanelOpen(!1);
              await Ka(t);
              G({
                message: `Đã nạp hóa đơn #${t.display_id || t.id} ra giỏ hàng!`,
                type: "success"
              });
            }} onDeleteOrder={t => {
              Sn(t);
            }} /></Fn></div></div>{(fa || ya) && (fa && fa.details && fa.details.length > 0 || ya && ya.details && ya.details.length > 0) && <div className="only-print"><PrintTemplate data={fa || ya} settings={J} type={Gi || "Sale"} isPreview={false} showOldDebt={Ke.showOldDebt} showPayment={Ke.showPayment} showRemaining={Ke.showRemaining} showCashGiven={Ke.showCashGiven} showChange={Ke.showChange} /></div>}</></Comp_fd>;
}
export default POSPage;