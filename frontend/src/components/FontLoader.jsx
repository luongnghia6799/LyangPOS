import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { loadGoogleFont, applyGlobalAppFont } from '../lib/googleFonts';

export default function FontLoader() {
    const [fonts, setFonts] = useState([]);

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

    // 1. Initial application of saved app font
    useEffect(() => {
        const savedAppFont = localStorage.getItem('app_font_family') || 'Be Vietnam Pro';
        applyGlobalAppFont(savedAppFont);

        const handleFontChangeEvent = (e) => {
            const fontName = e?.detail?.font || localStorage.getItem('app_font_family') || 'Be Vietnam Pro';
            applyGlobalAppFont(fontName);
        };

        window.addEventListener('app_font_changed', handleFontChangeEvent);
        window.addEventListener('storage', handleFontChangeEvent);

        return () => {
            window.removeEventListener('app_font_changed', handleFontChangeEvent);
            window.removeEventListener('storage', handleFontChangeEvent);
        };
    }, []);

    // 2. Fetch server settings, fonts & templates
    useEffect(() => {
        const fetchFontsAndTemplates = async () => {
            try {
                const [fontsRes, templatesRes, settingsRes] = await Promise.all([
                    axios.get('/api/fonts').catch(() => ({ data: [] })),
                    axios.get('/api/print-templates').catch(() => ({ data: [] })),
                    axios.get('/api/settings').catch(() => ({ data: {} }))
                ]);
                
                setFonts(fontsRes.data || []);
                
                // If server has app_font_family configured and local storage is empty, use it
                if (settingsRes.data && settingsRes.data.app_font_family) {
                    const localFont = localStorage.getItem('app_font_family');
                    if (!localFont) {
                        localStorage.setItem('app_font_family', settingsRes.data.app_font_family);
                        applyGlobalAppFont(settingsRes.data.app_font_family);
                    }
                }

                // Preload any Google Fonts set on print templates
                if (templatesRes.data && Array.isArray(templatesRes.data)) {
                    templatesRes.data.forEach(tpl => {
                        try {
                            const cfg = typeof tpl.config === 'string' ? JSON.parse(tpl.config) : tpl.config;
                            if (cfg?.invoice_font_family) {
                                loadGoogleFont(cfg.invoice_font_family);
                            }
                        } catch (e) {}
                    });
                }
            } catch (err) {
                console.error("Error fetching fonts for loader", err);
            }
        };
        fetchFontsAndTemplates();
    }, []);

    // 3. Inject custom uploaded fonts
    useEffect(() => {
        if (fonts.length > 0) {
            const styleId = 'custom-fonts-style';
            let style = document.getElementById(styleId);
            if (!style) {
                style = document.createElement('style');
                style.id = styleId;
                document.head.appendChild(style);
            }

            style.innerHTML = fonts.map(font => {
                const fontName = font.split('.')[0];
                const format = font.toLowerCase().endsWith('.ttf') ? 'truetype' : 'opentype';
                const fontUrl = getResolvedUrl(`/uploads/fonts/${font}`);
                return `
                    @font-face {
                        font-family: '${fontName}';
                        src: url('${fontUrl}') format('${format}');
                        font-display: block;
                    }
                `;
            }).join('\n');

            // Force browser to load and cache all custom fonts into memory immediately
            if (typeof document !== 'undefined' && document.fonts && typeof FontFace !== 'undefined') {
                fonts.forEach(font => {
                    try {
                        const fontName = font.split('.')[0];
                        const fontUrl = getResolvedUrl(`/uploads/fonts/${font}`);
                        const f = new FontFace(fontName, `url('${fontUrl}')`, { display: 'block' });
                        f.load().then(loadedFace => {
                            document.fonts.add(loadedFace);
                        }).catch(e => {
                            console.warn(`Could not preload font ${fontName}:`, e);
                        });
                    } catch (e) {
                        // ignore font load errors
                    }
                });
            }
        }
    }, [fonts]);

    return null; // This component doesn't render anything
}
