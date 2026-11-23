// ==UserScript==
// @name         Dot Ads
// @namespace    http://tampermonkey.net/
// @version      2.7
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_listValues
// @grant        GM.listValues
// @grant        GM_deleteValue
// @grant        GM.deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      fonts.googleapis.com
// @connect      fonts.gstatic.com
// @run-at       document-start
// ==/UserScript==

(async function () {
    'use strict';
    const CONFIG = {
        allow: ['microsoft.com', 'windows.com', 'windowsupdate.com', 'wikipedia.org','facebook.com','messenger.com','instagram.com','youtube.com'],
        names: ['smartbanner', 'app-banner', 'cookie-popup', '*adsbygoogle*'],
        hosts: [],
        links: ['tinyurl', 'bit.ly', 'cutt.ly', 'shorturl', 'bet', 'win', '88', '789', 'nhacai', 'casino', 'jackpot'],
        appAllow: [],
        frames: true,
        antiAdblock: true,
        playerAds: true,
        onboarding: true,
        welcomeReplay: false
    };

    let uiBusy = false;
    const every = (ms, fn, always) => setInterval(() => { if (!document.hidden && (always || !uiBusy)) fn(); }, ms);

    function adSuspect(h, p, q, port, nav) {
        if (!h) return false;
        if (/^(localhost|.+\.(local|lan|internal))$|^(10|127)\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\.|^\[(::1|fe80|fc|fd)/.test(h)) return false;

        const GN = /(^|[.\-])(\d*bet\d*|nhacai\w*|casino\w*|jackpot\w*|xoso\w*|soicau\w*|sbobet|1xbet|8xbet|12bet|188bet|fb88|w88|m88|jun88|hi88|vn88|sv88|me88|bong88|kubet\w*|789club|go88|b52club|sunwin|hitclub|rikvip|v9bet|iwin)([.\-]|$)/.test(h);
        const GX = /(^|[.\-])((\d{2,4}(bet|win|club|vip|play))|((bet|vip)\d{2,4}))/.test(h);
        if (nav === 'gamble') return GN || GX;
        if (nav ? (GN || GX) : GN) return true;

        if (/doubleclick|googlesyndication|google(adservices|tagservices)|taboola|outbrain|mgid|revcontent|criteo|pubmatic|rubiconproject|openx\.net|adnxs|adsrvr|casalemedia|indexww|bidswitch|rtbhouse|amazon-adsystem|(^|\.)zedo\.|(^|\.)an\.yandex\.|exo(click|srv)|juicyads|pop(ads|cash|cdn)|propellerads|onclkds|(^|[.\-])ad-?(sterra|cash|maven|skeeper|form|now|tng|stune|spyglass|tima|colony|delivery)|hilltopads|trafficjunky|trafficstars|trafficfactory|tsyndicate|mondiad|rich(push|ads)|push(nami|ails)|bidvertiser|yllix|monetag|acscdn|realsrv|magsrv|tmrjmp|plugrush|eclick\.vn|a-ads|adf\.ly|shorte\.st|ouo\.io|linkvertise|applovin|coinzilla|galaksion|evadav|rollerads|zeropark|dolohen|jads\.co|cpmstar/.test(h)) return true;

        if (!nav) return /\/(pagead|adsbygoogle|aclib|popunder|pop-under|clickunder|popmagic)/.test(p) || /utm_medium=pop/.test(q);

        let s = 0, sf = 0;
        const L = h.split('.'), tld = L[L.length - 1];
        const cc = L.length > 2 && tld.length === 2 && /^(co|com|net|org|gov|edu|ac)$/.test(L[L.length - 2]);
        const sld = L[L.length - (cc ? 3 : 2)] || '';
        const cnt = (str, re) => (str.match(re) || []).length;
        const safe = /(^|\.)(google\.com|googleapis\.com|gstatic\.com|googleusercontent\.com|youtube\.com|youtube-nocookie\.com|ytimg\.com|facebook\.com|fbcdn\.net|instagram\.com|twitter\.com|x\.com|twimg\.com|tiktok\.com|zalo\.me|zaloapp\.com|zdn\.vn|github\.com|githubusercontent\.com|github\.io|wikipedia\.org|wikimedia\.org|cloudflare\.com|jsdelivr\.net|unpkg\.com|jquery\.com|bootstrapcdn\.com|fontawesome\.com|recaptcha\.net|hcaptcha\.com|paypal\.com|stripe\.com|vnpay\.vn|momo\.vn|apple\.com|microsoft\.com|live\.com|discord\.com|gravatar\.com|wp\.com)$/.test(h);

        if (!safe) {
            if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.charAt(0) === '[') sf += 3;
            else {
                if (/adserv|vertising|pop(under|magic)|onclick|click(adu|adilla|aine|under)|cpm|(performance|creative)format|profitablegate|exchangeclear|bet365|nhacai|casino/.test(h) ||
                    /(^|[.\-_])(ads?|adv|advert\w*|adx|adtech|adsrv|banners?|popups?|cpm|rtb|vast|vpaid|prebid)\d*([.\-_]|$)/.test(h)) s += 3;
                if (!/(^|\.)(cloudfront\.net|amazonaws\.com|azureedge\.net|akamaihd\.net|akamaized\.net|fastly\.net|b-cdn\.net|herokuapp\.com|vercel\.app|netlify\.app|pages\.dev|workers\.dev)$/.test(h) &&
                    L.slice(0, -1).some(l => l.length >= 10 && !/^xn--/.test(l) && ((cnt(l, /\d/g) >= 3 && /[a-z]/.test(l)) || !/[aeiouy]/.test(l)))) sf += 2;
                if (/(^|\.)xn--/.test(h)) sf += 2;
                if (/^(xyz|top|click|icu|buzz|monster|cfd|sbs|rest|cam|bid|loan|win|stream|download|gq|tk|ml|cf|ga|cyou|quest|pw|su)$/.test(tld)) sf += 1.5;
                if (cnt(sld, /-/g) >= 3) sf += 1;
                if (L.length >= 5) sf += 1;
            }
            if (port && port !== '80' && port !== '443') sf += 1.5;
        }

        if (/\/(pagead|adsbygoogle|aclib|popunder|pop-under|clickunder|popmagic|prebid|adserv|advert|doubleclick)|utm_medium=pop/.test(p + q)) s += 3;
        else if (/\/(ads?|banners?|tracking)([\/._?-]|$)/.test(p + q)) s += 2;
        if (/[?&](zone_?id|campaign_?id|click_?id|sub_?id|pub(lisher)?_?id|ad_?unit|ad_?id|creative_?id|placement_?id|cpm)=/.test(q)) s += 2;

        return (s + sf) >= 4;
    }

    function appSchemeOf(u, allow) {
        if (u == null) return '';
        const s = String(u).replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+/, '');
        const m = /^([a-z][a-z0-9+.\-]*):/i.exec(s);
        if (!m) return '';
        if (/^[^:]*:\d+([\/?#]|$)/.test(s)) return '';
        const sc = m[1].toLowerCase();
        if (/^(https?|mailto|tel|sms|smsto|javascript|data|blob|about|file|ftp|wss?|view-source|chrome|chrome-extension|moz-extension|safari-web-extension|webcal)$/.test(sc)) return '';
        if (allow && allow.indexOf(sc) >= 0) return '';
        return sc;
    }

    const siteBase = h => {
        h = String(h || '').toLowerCase().replace(/\.$/, '');
        if (!h || /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.charAt(0) === '[') return h;
        const L = h.split('.');
        if (L.length < 2) return h;
        const tld = L[L.length - 1];
        const cc = L.length > 2 && tld.length === 2 && /^(co|com|net|org|gov|edu|ac)$/.test(L[L.length - 2]);
        const reg = L.slice(cc ? -3 : -2).join('.');
        const sld = L[L.length - (cc ? 3 : 2)] || '';
        if (sld.length < 4) return reg;
        if (/^(github|githubusercontent|cloudfront|amazonaws|azureedge|akamaihd|akamaized|fastly|herokuapp|vercel|netlify|pages|workers|blogspot|blogger|wordpress|appspot|firebaseapp|weebly|wixsite|googleusercontent|sharepoint|pythonanywhere|glitch|onrender|neocities|000webhostapp|infinityfreeapp)$/.test(sld)) return L.slice(cc ? -4 : -3).join('.');
        return sld;
    };

    /* URL quảng cáo người dùng nhập -> khoá chặn gọn: "host" hoặc "host/đường-dẫn?query" (bỏ giao thức, www, #hash).
       Chuỗi không phải URL (từ khoá, tinyurl, appname://) giữ nguyên. */
    const URLISH = /^(https?:)?\/\/|^www\./i;
    const normLink = v => {
        v = String(v == null ? '' : v).trim();
        if (!URLISH.test(v)) return v;
        try {
            const o = new URL(/^www\./i.test(v) ? 'https://' + v : v.replace(/^\/\//, 'https://'));
            let s = o.hostname.replace(/^www\./i, '') + o.pathname + o.search;
            if (!o.search) s = s.replace(/\/+$/, '');
            return s.toLowerCase();
        } catch (e) { return v; }
    };
    const hostKey = h => String(h || '').toLowerCase().replace(/^www\./, '');

    /* ---- Chặn lớp QC: khoá dạng "host/đường-dẫn" lưu ở tab Liên kết ---- */
    const QC_KEY_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+\/[^\s\/][^\s]*$/i;
    const isQcKey = k => QC_KEY_RE.test(String(k || ''));
    /* URL nguồn video/khung -> khoá chặn. Đường dẫn có đuôi file (.m3u8, .mp4...) thì bỏ ?query (token đổi mỗi lần tải) */
    const qcKeyOf = u => {
        try {
            const o = new URL(String(u), location.href);
            if (!/^https?:$/.test(o.protocol)) return '';
            const keepQ = !/\.[a-z0-9]{2,5}$/i.test(o.pathname);
            const k = (o.hostname.replace(/^www\./i, '') + o.pathname + (keepQ ? o.search : '')).toLowerCase();
            return isQcKey(k) ? k : '';
        } catch (e) { return ''; }
    };

    const DOT_SIDE = 'left', DOT_X = 18, DOT_Y = 14;
    const COLOR_GREEN = { hex: '#1fff6a', rgb: '31,255,106', ac: '#34d36b', acRgb: '52,211,107', ink: '#04230f' };
    const COLOR_RANDOM = (() => {
        const HK = 'gdar_hist', HIST_N = 10, MIN_DIST = 140, W_MIN = .5, W_MAX = .65;
        const R = Math.random, shuf = a => a.sort(() => R() - .5);
        const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
        const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        const mkBase = () => shuf([255, 0, Math.round(R() * 255)]);

        let hist = [];
        try { hist = JSON.parse(localStorage.getItem(HK)) || []; } catch (e) {}
        hist = (Array.isArray(hist) ? hist : []).filter(c => Array.isArray(c) && c.length === 3 && c.every(Number.isFinite)).slice(-HIST_N);

        const far = c => hist.every(h => dist(c, h) >= MIN_DIST);
        let base = null, best = null, bestD = -1;
        for (let i = 0; i < 60 && !base; i++) {
            const c = mkBase();
            if (far(c)) base = c;
            else {
                const d = Math.min(...hist.map(h => dist(c, h)));
                if (d > bestD) { bestD = d; best = c; }
            }
        }
        base = base || best || mkBase();

        try {
            if (window.self === window.top) {
                hist.push(base);
                localStorage.setItem(HK, JSON.stringify(hist.slice(-HIST_N)));
            }
        } catch (e) {}

        const w = W_MIN + R() * (W_MAX - W_MIN);
        const c = base.map(v => Math.round(v + (255 - v) * w));
        const ink = hex(base.map(v => Math.round(v * .12)));
        return { hex: hex(c), rgb: c.join(','), ac: hex(c), acRgb: c.join(','), ink };
    })();

    const IS_FRAME = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
    if (IS_FRAME && CONFIG.frames === false) return;
    if (location.protocol === 'about:' || window.__gdarLoaded) return;
    window.__gdarLoaded = true;

    if (!document.documentElement) {
        await new Promise(res => {
            const mo = new MutationObserver(() => { if (document.documentElement) { mo.disconnect(); res(); } });
            mo.observe(document, { childList: true });
        });
    }

    const APP_ALLOW = (CONFIG.appAllow || []).map(x => String(x).toLowerCase().replace(/:.*$/, '')).filter(Boolean);
    const LEGACY_SITE_KEY = 'gdar_rules', CACHE_KEY = 'gdar_cache', HOST = location.hostname, SITE_PREFIX = 'site:';
    const BASE = siteBase(HOST);
    const HOLD_MS = 400, RED_MS = 150, PICK_MS = 250, MOVE_TOL = 10;
    const ATTR = 'data-gdar', INV_ATTR = 'data-gdar-inv', PICK_ATTR = 'data-gdar-pick', PRESS_ATTR = 'data-gdar-press';
    const LNK_ATTR = 'data-gdar-lk', TOUCH_ATTR = 'data-gdar-t', LNK_HREF = 'data-gdar-href', GUARD_ATTR = 'data-gdar-g';
    const Q_ATTR = 'data-gdar-q', MARK = 'data-gdar-m', OK_ATTR = 'data-gdar-ok', PA_ATTR = 'data-gdar-pa', PICKED_ATTR = 'data-gdar-picked';
    const QC_ATTR = 'data-gdar-qc', QCL_ATTR = 'data-gdar-qcl', QCW_ATTR = 'data-gdar-qcw';
    const DECIDE_MS = 160, GUARD_MS = 20000, WATCH_MS = 3000, INV_SCAN_MS = 20, MEDIA_SWEEP_MS = 25, LEARN_MAX = 40;
    const AUTO_WORDS = ['ad', 'ads', 'adv', 'popup', 'banner', 'app-download', 'float-ad', 'float-ads', 'floating-ad', 'float-banner', 'floating-banner'];
    const NAME_RE = /^\*?[\w-]+\*?$/;
    const INV_SEL = 'a[href],area[href],iframe';
    const MEDIA_SEL = 'video,audio';
    const MEDIA_IN = 'img,video,canvas,svg,picture,iframe,input,button,textarea,select,audio,object,embed';
    const HIDE = 'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important';
    const QHIDE = 'clip-path:inset(100%)!important;-webkit-clip-path:inset(100%)!important;pointer-events:none!important';
    const NOT_ME = ':not(html,body,#gdar-host)';
    const NOT_POPUP_TAG = /^(HEAD|BODY|HTML|SCRIPT|STYLE|LINK|META|NOSCRIPT|TEMPLATE|MAIN|HEADER|FOOTER|NAV|ARTICLE|FORM)$/;
    const NOT_PICK = /^(HTML|BODY|HEAD)$/;
    const STOP_ID = /^(app|root|__next|__nuxt|wrapper|page|content|container)$/i;
    const SKIP_TAG = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/;
    const DYN_RE = /\d{4,}|^gdar/i;
    const ATTRS = ['alt', 'title', 'aria-label'];
    const ATTR_SEL = ATTRS.map(a => `[${a}]`).join(',');
    const MSG = '__dotads';
    const ANTI = CONFIG.antiAdblock !== false;
    const PLAYER_ADS = CONFIG.playerAds !== false;
    const K3 = ['sel', 'txt', 'lnk'];

    const AD_PLAYER = '.jwplayer.jw-flag-ads,.jwplayer.jw-flag-ads-vpaid,.jwplayer.jw-flag-ads-googleima,.video-js.vjs-ad-playing,.video-js.vjs-ad-loading,[class*="ad-playing" i],[class*="ad-showing" i]';
    const AD_SKIP_SEL = '.jw-skip,.jw-skippable,.videoAdUiSkipButton,.ima-skip-button,.vjs-skip-button,[class*="skip-ad" i],[class*="ad-skip" i],[class*="skipad" i],[class*="skip-button" i]';
    const SKIP_TXT = /^\s*(bỏ qua|skip)(\s+(quảng cáo|qc|ad|ads|advertisement))?\s*[›»>▶⏭]*\s*$/i;

    const HAS = (() => { try { document.createDocumentFragment().querySelector(':has(a)'); return true; } catch (e) { return false; } })();

    const PLAYER_IFR = 'iframe[allowfullscreen],iframe[allow*="fullscreen" i],iframe[src*="player" i],iframe[src*="embed" i],iframe[src*="stream" i],iframe[src*="video" i],iframe[src*="m3u8" i],iframe[src*="/play" i]';
    const PLAYER_LIB = '.jwplayer,.plyr,.video-js,.art-video-player,.artplayer-app,.dplayer,.fp-player,.flowplayer,.mejs__container,.shaka-video-container,.oplayer';
    const PLAYER_CLS = PLAYER_LIB + ',.vjs-tech,[class*="player" i],[id*="player" i],[class*="embed" i],[id*="embed" i],' + PLAYER_IFR + ',video';
    const PLAYER_HAS = 'video,' + PLAYER_IFR + ',' + PLAYER_LIB + ',[class*="player" i],[id*="player" i],[class*="embed" i],[id*="embed" i]';
    const PLAYER_CTX = PLAYER_LIB + ',[class*="player" i],[id*="player" i]';
    const inPlayer = el => { try { return !!(el && el.closest && el.closest(PLAYER_CTX)); } catch (e) { return false; } };
    const NOT_PLAYER = ANTI
        ? `:not(${PLAYER_CLS})` + (HAS ? `:not(:has(${PLAYER_HAS}))` : '')
        : ':not(iframe[allowfullscreen],video)';
    const BAIT_RE = /(^|[\s_-])(adsbox|ad-?(banner|box|unit|slot|placement|container|block|zone|holder)s?|banner-?ads?|text-?ads?|textad|pub_\d+x\d+m?|adsbygoogle|ad-?\d+x\d+|google-?ads?|adbox|ads?|adv|advert\w*|sponsor\w*|bait)([\s_-]|$)/i;
    const WALL_RE = /ad[\s-]?block|ads?[\s-]?blocker|anti[\s-]?ad|chặn\s+quảng\s+cáo|trình\s+chặn|tắt\s+(trình\s+)?(chặn|adblock)|(turn|switch)\s+off\s+(your\s+)?ad|disable\s+(your\s+)?ad|whitelist\s+(this|our)\s+site/i;

    const SUSPECT = [
        'dialog', '[role=dialog]', '[role=alertdialog]', '[aria-modal=true]', 'iframe',
        ...['popup', 'pop-up', 'modal', 'overlay', 'lightbox', 'interstitial', 'backdrop', 'dialog']
            .flatMap(w => [`[id*="${w}" i]`, `[class*="${w}" i]`]),
        ...['mask', 'promo', 'welcome', 'announce', 'swal', 'drawer'].map(w => `[class*="${w}" i]`),
        '[class~="fixed"]', '[class*="inset-0"]', '[class*="z-50"]', '[class*="z-["]', '[class*="z-9"]',
        '[style*="fixed" i]', '[style*="2147483" i]'
    ].join(',');

    /* ---------- lưu trữ (GM + localStorage) ---------- */
    const hasGM = typeof GM !== 'undefined' && GM;
    const gmGet = (hasGM && typeof GM.getValue === 'function') ? (k, d) => GM.getValue(k, d)
        : (typeof GM_getValue === 'function' ? (k, d) => Promise.resolve(GM_getValue(k, d)) : null);
    const gmSet = (hasGM && typeof GM.setValue === 'function') ? (k, v) => GM.setValue(k, v)
        : (typeof GM_setValue === 'function' ? (k, v) => Promise.resolve(GM_setValue(k, v)) : null);
    const gmDel = (hasGM && typeof GM.deleteValue === 'function') ? k => GM.deleteValue(k)
        : (typeof GM_deleteValue === 'function' ? k => Promise.resolve(GM_deleteValue(k)) : null);
    const gmList = async () => {
        try {
            if (hasGM && typeof GM.listValues === 'function') return (await GM.listValues()) || [];
            if (typeof GM_listValues === 'function') return (await Promise.resolve(GM_listValues())) || [];
        } catch (e) {}
        return [];
    };
    const GMOK = !!(gmGet && gmSet);

    const FONT_FAMILY = 'Plus Jakarta Sans';
    const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap';
    const FONT_CACHE_KEY = 'fontcache:pjs3';
    const gmXhr = (typeof GM_xmlhttpRequest === 'function') ? GM_xmlhttpRequest
        : (hasGM && typeof GM.xmlHttpRequest === 'function' ? GM.xmlHttpRequest.bind(GM) : null);
    const xhrGet = (url, type) => new Promise((res, rej) => {
        if (!gmXhr) { rej(new Error('no-xhr')); return; }
        try {
            gmXhr({
                method: 'GET', url, responseType: type || 'text', timeout: 20000,
                onload: r => ((r.status >= 200 && r.status < 300) ? res(r.response) : rej(new Error('http ' + r.status))),
                onerror: () => rej(new Error('net')),
                ontimeout: () => rej(new Error('timeout')),
                onabort: () => rej(new Error('abort'))
            });
        } catch (e) { rej(e); }
    });
    const b64enc = buf => {
        const u = new Uint8Array(buf);
        let s = '';
        for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return btoa(s);
    };
    const b64dec = str => {
        const s = atob(str), u = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
        return u.buffer;
    };
    const readFontCache = async () => {
        if (!GMOK) return null;
        try {
            let v = await gmGet(FONT_CACHE_KEY, null);
            if (typeof v === 'string') v = JSON.parse(v);
            return (v && fontValid(v.f)) ? v.f : null;
        } catch (e) { return null; }
    };
    /* chỉ cần latin + latin-ext + vietnamese (bỏ cyrillic cho nhẹ); cache hợp lệ phải có cả latin lẫn tiếng Việt */
    const fontKeep = r => !/U\+04(00|60)/i.test(r || '');
    const fontValid = l => Array.isArray(l) && l.some(f => f && /U\+0102/i.test(f.r || '')) && l.some(f => f && /U\+0000/i.test(f.r || ''));
    const fetchFontData = async () => {
        const css = await xhrGet(FONT_CSS_URL, 'text');
        const out = [];
        for (const b of (String(css).match(/@font-face\s*\{[^}]*\}/g) || [])) {
            const u = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/.exec(b);
            if (!u) continue;
            const ur = /unicode-range:\s*([^;]+);/.exec(b), w = /font-weight:\s*([^;]+);/.exec(b);
            const r = ur ? ur[1].trim() : '';
            if (!fontKeep(r)) continue;
            try { out.push({ r, w: w ? w[1].trim() : '200 800', d: b64enc(await xhrGet(u[1], 'arraybuffer')) }); } catch (e) {}
        }
        return out;
    };
    let fontLinkEl = null;
    const fontFallbackLink = () => {
        try {
            if (fontLinkEl && fontLinkEl.isConnected) return;
            fontLinkEl = document.createElement('link');
            fontLinkEl.rel = 'stylesheet';
            fontLinkEl.href = FONT_CSS_URL;
            (document.head || document.documentElement).appendChild(fontLinkEl);
        } catch (e) {}
    };
    let fontStarted = false, fontOk = false, fontTry = 0;
    const fontFaces = [];
    /* nạp từng face từ bộ nhớ (FontFace + ArrayBuffer): không phụ thuộc CSP của trang; face lỗi không làm hỏng các face khác */
    const fontApply = list => {
        let n = 0;
        list.forEach(it => tryQ(() => {
            const d = { weight: it.w || '200 800', style: 'normal', display: 'swap' };
            if (it.r) d.unicodeRange = it.r;
            const f = new FontFace(FONT_FAMILY, b64dec(it.d), d);
            document.fonts.add(f);
            fontFaces.push(f);
            tryQ(() => f.load().catch(() => {}));
            n++;
        }));
        return n;
    };
    async function loadFont() {
        if (fontStarted || IS_FRAME) return;
        fontStarted = true;
        const go = async () => {
            if (fontOk) return;
            try {
                if (!document.fonts || typeof FontFace !== 'function') throw new Error('nofont');
                let list = await readFontCache();
                if (!fontValid(list)) {
                    list = await fetchFontData();
                    if (fontValid(list) && GMOK) gmSet(FONT_CACHE_KEY, JSON.stringify({ t: Date.now(), f: list })).catch(() => {});
                }
                if (fontValid(list) && fontApply(list)) fontOk = true;
            } catch (e) {}
            if (!fontOk) {
                fontFallbackLink();
                if (fontTry < 4) setTimeout(go, [2000, 6000, 15000, 40000][fontTry++]);
            }
        };
        go();
    }

    /* font chữ nghiêng serif (Playfair Display Italic) cho các từ nhấn nhá ở màn chào mừng + hướng dẫn */
    const SERIF_FAMILY = 'Playfair Display';
    const SERIF_CSS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400..900&display=swap';
    const SERIF_CACHE_KEY = 'fontcache:pfd1';
    let serifStarted = false, serifOk = false, serifTry = 0, serifLinkEl = null;
    const readSerifCache = async () => {
        if (!GMOK) return null;
        try {
            let v = await gmGet(SERIF_CACHE_KEY, null);
            if (typeof v === 'string') v = JSON.parse(v);
            return (v && fontValid(v.f)) ? v.f : null;
        } catch (e) { return null; }
    };
    const fetchSerifData = async () => {
        const css = await xhrGet(SERIF_CSS_URL, 'text');
        const out = [];
        for (const b of (String(css).match(/@font-face\s*\{[^}]*\}/g) || [])) {
            const u = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/.exec(b);
            if (!u) continue;
            const ur = /unicode-range:\s*([^;]+);/.exec(b), w = /font-weight:\s*([^;]+);/.exec(b);
            const r = ur ? ur[1].trim() : '';
            if (!fontKeep(r)) continue;
            try { out.push({ r, w: w ? w[1].trim() : '400 900', d: b64enc(await xhrGet(u[1], 'arraybuffer')) }); } catch (e) {}
        }
        return out;
    };
    const serifApply = list => {
        let n = 0;
        list.forEach(it => tryQ(() => {
            const d = { weight: it.w || '400 900', style: 'italic', display: 'swap' };
            if (it.r) d.unicodeRange = it.r;
            const f = new FontFace(SERIF_FAMILY, b64dec(it.d), d);
            document.fonts.add(f);
            fontFaces.push(f);
            tryQ(() => f.load().catch(() => {}));
            n++;
        }));
        return n;
    };
    async function loadSerif() {
        if (serifStarted || IS_FRAME) return;
        serifStarted = true;
        const go = async () => {
            if (serifOk) return;
            try {
                if (!document.fonts || typeof FontFace !== 'function') throw new Error('nofont');
                let list = await readSerifCache();
                if (!fontValid(list)) {
                    list = await fetchSerifData();
                    if (fontValid(list) && GMOK) gmSet(SERIF_CACHE_KEY, JSON.stringify({ t: Date.now(), f: list })).catch(() => {});
                }
                if (fontValid(list) && serifApply(list)) serifOk = true;
            } catch (e) {}
            if (!serifOk) {
                tryQ(() => {
                    if (serifLinkEl && serifLinkEl.isConnected) return;
                    serifLinkEl = document.createElement('link');
                    serifLinkEl.rel = 'stylesheet';
                    serifLinkEl.href = SERIF_CSS_URL;
                    (document.head || document.documentElement).appendChild(serifLinkEl);
                });
                if (serifTry < 3) setTimeout(go, [3000, 9000, 25000][serifTry++]);
            }
        };
        go();
    }
    /* một số trang xoá / thay document.fonts: nạp lại font khi bị mất */
    every(3000, () => { if (fontOk) fontFaces.forEach(f => tryQ(() => { if (!document.fonts.has(f)) document.fonts.add(f); })); }, true);

    const gmGetSync = k => {
        try {
            if (typeof GM_getValue !== 'function') return null;
            let v = GM_getValue(k, null);
            if (v && typeof v.then === 'function') return null;
            if (typeof v === 'string') v = JSON.parse(v);
            return (v && typeof v === 'object') ? v : null;
        } catch (e) { return null; }
    };

    const DEF_SET = { on: true, auto: true, pick: true, links: true, pop: true, rnd: true };
    const DEF_RULES = () => ({ sel: [], txt: [], lnk: [] });
    const DEF_LEARN = () => ({ l: [], p: [] });
    const strArr = a => (Array.isArray(a) ? a.filter(x => typeof x === 'string') : []);
    const count = o => o.sel.length + o.txt.length + o.lnk.length;

    const normSet = o => {
        const s = Object.assign({}, DEF_SET, o);
        if (o && 'ovl' in o) s.pop = !!(s.pop || o.ovl);
        ['ovl', 'light', 'sus', 'deep'].forEach(k => delete s[k]);
        return s;
    };
    const lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const normRules = o => {
        const r = DEF_RULES();
        K3.forEach(k => { r[k] = strArr(o && o[k]); });
        r.lnk = [...new Set(r.lnk.map(normLink).filter(Boolean))];
        if (o && o._t) r._t = o._t;
        return r;
    };
    const ts = o => (o && +o._t) || 0;
    const normLearn = o => {
        const r = DEF_LEARN();
        if (o && Array.isArray(o.l)) r.l = o.l.filter(x => x && typeof x.s === 'string' && typeof x.k === 'string').slice(-LEARN_MAX);
        r.p = strArr(o && o.p).filter(Boolean).slice(-LEARN_MAX);
        return r;
    };

    const mergeRules = (dst, src, replace) => {
        const n = normRules(src);
        let added = 0;
        K3.forEach(k => {
            if (replace) { dst[k] = n[k].slice(); added++; }
            else n[k].forEach(v => { if (!dst[k].includes(v)) { dst[k].push(v); added++; } });
        });
        return added;
    };
    const mergeLearn = (dst, src) => {
        const n = normLearn(src);
        let added = 0;
        n.l.forEach(x => { if (!dst.l.some(y => y.s === x.s && y.k === x.k)) { dst.l.push(x); added++; } });
        n.p.forEach(x => { if (!dst.p.includes(x)) { dst.p.push(x); added++; } });
        dst.l = dst.l.slice(-LEARN_MAX);
        dst.p = dst.p.slice(-LEARN_MAX);
        return added;
    };
    const isLegacyFor = (k, prefix) => {
        if (typeof k !== 'string' || !k.startsWith(prefix) || k === prefix + BASE) return false;
        const h = k.slice(prefix.length);
        return h.indexOf('.') > 0 && siteBase(h) === BASE;
    };

    const newer = (a, b) => (a && b) ? ((b._t || 0) > (a._t || 0) ? b : a) : (a || b || null);
    let writing = 0, wgen = 0;
    const gReadRaw = async k => {
        let a = null;
        if (GMOK) {
            try {
                let v = await gmGet(k, null);
                if (typeof v === 'string') v = JSON.parse(v);
                if (v && typeof v === 'object') a = v;
            } catch (e) {}
        }
        const b = lsGet('gdar_' + k);
        return newer(a, (b && typeof b === 'object') ? b : null);
    };
    const gRead = async (k, d) => { const v = await gReadRaw(k); return v ? Object.assign({}, d, v) : d; };
    const gWrite = (k, o) => {
        o._t = Date.now();
        wgen++;
        writeCache();
        let p;
        try {
            lsSet('gdar_' + k, o);
            p = GMOK ? Promise.resolve(gmSet(k, JSON.stringify(o))) : Promise.resolve();
        } catch (e) { p = Promise.resolve(); }
        writing++;
        return p.catch(() => {}).then(() => { writing--; });
    };
    const siteKey = SITE_PREFIX + BASE, learnKey = 'learn:' + BASE;
    const siteWrite = () => gWrite(siteKey, site);
    const learnWrite = () => gWrite(learnKey, learn);
    const writeCache = () => lsSet(CACHE_KEY, { set, glb, site, learn });

    const syncSet = gmGetSync('settings'), syncGlb = gmGetSync('global');
    const syncSite = gmGetSync(siteKey), syncLearn = gmGetSync(learnKey);
    const cache = lsGet(CACHE_KEY) || {};
    let set = normSet(newer(syncSet, cache.set));
    let glb = normRules(newer(syncGlb, cache.glb));
    let site = normRules(newer(syncSite, cache.site) || lsGet(LEGACY_SITE_KEY));
    let learn = normLearn(newer(syncLearn, cache.learn));

    (function legacySync() {
        try {
            const ks = typeof GM_listValues === 'function' ? GM_listValues() : null;
            if (!Array.isArray(ks)) return;
            ks.forEach(k => {
                if (isLegacyFor(k, SITE_PREFIX)) { const v = gmGetSync(k); if (v) mergeRules(site, v); }
                else if (isLegacyFor(k, 'learn:')) { const v = gmGetSync(k); if (v) mergeLearn(learn, v); }
            });
        } catch (e) {}
    })();

    if (syncSet || syncGlb || syncSite || syncLearn) writeCache();

    const killKey = async k => {
        try { if (gmDel) await gmDel(k); else if (gmSet) await gmSet(k, JSON.stringify(k.startsWith('learn:') ? DEF_LEARN() : DEF_RULES())); } catch (e) {}
        try { localStorage.removeItem('gdar_' + k); } catch (e) {}
    };
    async function migrateLegacy() {
        if (!GMOK) return;
        const ks = await gmList();
        const sp = ks.filter(k => isLegacyFor(k, SITE_PREFIX)), lp = ks.filter(k => isLegacyFor(k, 'learn:'));
        if (sp.length) {
            const cur = normRules(await gRead(siteKey, DEF_RULES()));
            let add = 0;
            for (const k of sp) add += mergeRules(cur, await gReadRaw(k));
            if (add) await gWrite(siteKey, cur);
            for (const k of sp) await killKey(k);
        }
        if (lp.length) {
            const cur = normLearn(await gRead(learnKey, DEF_LEARN()));
            let add = 0;
            for (const k of lp) add += mergeLearn(cur, await gReadRaw(k));
            if (add) await gWrite(learnKey, cur);
            for (const k of lp) await killKey(k);
        }
    }

    let scope = 'all', tab = 'sel';
    let frameRules = {};
    const pickedHosts = new Set();
    const shieldOn = () => set.on;
    let uiReady = false, hostEl = null, dotEl = null;
    let promote = () => {}, render = () => {};
    let keys = [], lkeys = [], lastRules = null;
    let lnkBlocked = 0, budget = 0;

    const pickOn = () => !!(set.on && set.pick);
    const cur = () => (scope === 'all' ? glb : scope === 'site' ? site : (frameRules[scope.slice(2)] || site));
    const saveCur = () => (scope === 'all' ? gWrite('global', glb)
        : scope === 'site' || !frameRules[scope.slice(2)] ? siteWrite()
        : gWrite(SITE_PREFIX + scope.slice(2), frameRules[scope.slice(2)]));

    const SHIELD = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerover', 'pointerout',
        'pointerenter', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'click',
        'auxclick', 'dblclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel',
        'gesturestart', 'gesturechange', 'gestureend', 'selectstart', 'dragstart',
        'keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'focus', 'blur', 'focusin', 'focusout'];
    const MOVE_RE = /^(pointer|mouse)move$/;
    const GHOST = { touchend: 1, mouseup: 1, mousedown: 1, click: 1 };
    const HND = Object.create(null);
    const bind = (el, type, fn) => { (HND[type] || (HND[type] = new WeakMap())).set(el, fn); };
    const inHost = e => !!hostEl && (e.target === hostEl || hostEl.contains(e.target));
    const stamp = () => { try { document.documentElement.setAttribute(TOUCH_ATTR, String(Date.now())); } catch (e) {} };
    SHIELD.forEach(t => window.addEventListener(t, e => {
        if (!inHost(e)) return;
        if (shieldOn() && !MOVE_RE.test(t)) stamp();
        const path = e.composedPath(), tg = path[0];
        if (dotEl && GHOST[t] && e.cancelable && path.includes(dotEl)) e.preventDefault();
        const m = HND[t];
        if (m) for (const n of path) {
            const f = m.get(n);
            if (f) f.call(n, e, tg);
            if (n === hostEl) break;
        }
        e.stopImmediatePropagation();
    }, { capture: true, passive: false }));

    let gestured = false, rafQ = false;
    const T0 = Date.now();

    const guardOn = () => !IS_FRAME && !gestured && Date.now() - T0 < GUARD_MS;
    const fresh = new Set(), watch = new Map();

    function syncGuard() {
        const de = document.documentElement;
        if (!de) return;
        if (set.on && set.pop && guardOn()) { if (!de.hasAttribute(GUARD_ATTR)) de.setAttribute(GUARD_ATTR, ''); }
        else de.removeAttribute(GUARD_ATTR);
    }
    function endGuard() {
        if (gestured) return;
        gestured = true;
        try { document.querySelectorAll(`[${Q_ATTR}]`).forEach(e => e.removeAttribute(Q_ATTR)); } catch (e) {}
        fresh.clear(); watch.clear();
        syncGuard();
    }
    ['touchstart', 'pointerdown', 'mousedown', 'keydown'].forEach(t =>
        window.addEventListener(t, e => { if (e.isTrusted) endGuard(); }, true));
    setTimeout(() => { fresh.clear(); watch.clear(); syncGuard(); }, GUARD_MS + 50);

    const cssEsc = s => (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^\w-]/g, '\\$&');
    const clsOf = el => {
        const c = typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '';
        return c.trim().replace(/\s+/g, ' ');
    };
    const inHostNode = el => !!(el.closest && el.closest('#gdar-host'));
    const attrEsc = s => String(s).replace(/["\\]/g, '\\$&');
    const vpSize = () => [window.innerWidth || document.documentElement.clientWidth || 0,
        window.innerHeight || document.documentElement.clientHeight || 0];
    const hideAll = a => a.map(s => `${s}{${HIDE}}`).join('\n');
    const tryQ = (fn, d) => { try { return fn(); } catch (e) { return d; } };
    const eachMatch = (root, sel, fn) => tryQ(() => {
        if (root.nodeType === 1 && root.matches(sel)) fn(root);
        if (root.querySelectorAll) root.querySelectorAll(sel).forEach(fn);
    });
    const classSel = (el, n, strict) => clsOf(el).split(' ')
        .filter(c => c && c.length <= 40 && !DYN_RE.test(c) && (!strict || NAME_RE.test(c)))
        .slice(0, n).map(c => '.' + cssEsc(c)).join('');
    const okId = el => el.id && NAME_RE.test(el.id) && !DYN_RE.test(el.id);

    function nameToSel(n) {
        n = String(n || '').trim();
        if (!n) return '';
        const partial = n.startsWith('*') || n.endsWith('*');
        const v = attrEsc(n.replace(/^\*+|\*+$/g, ''));
        if (!v) return '';
        return partial ? `[id*="${v}" i],[class*="${v}" i],[name*="${v}" i]`
            : `[id="${v}" i],[class~="${v}" i],[name="${v}" i]`;
    }
    const toCss = s => (NAME_RE.test(s) ? nameToSel(s) : s);

    const BUILTIN_SEL = (CONFIG.names || []).map(nameToSel).filter(Boolean);
    const BUILTIN_CSS = hideAll(BUILTIN_SEL);
    const BUILTIN_TXT = (CONFIG.texts || []).map(t => String(t).trim().toLowerCase()).filter(Boolean);

    const AUTO_SEL = (() => {
        const out = [];
        ['id', 'class'].forEach(a => AUTO_WORDS.forEach(w => {
            out.push(`[${a}~="${w}" i]`, `[${a}^="${w}-" i]`, `[${a}^="${w}_" i]`,
                `[${a}$="-${w}" i]`, `[${a}$="_${w}" i]`, `[${a}*="-${w}-" i]`, `[${a}*="_${w}_" i]`,
                `[${a}*=" ${w}-" i]`, `[${a}*=" ${w}_" i]`, `[${a}*="-${w} " i]`, `[${a}*="_${w} " i]`);
        }));
        const base = `:is(${out.join(',')})${NOT_ME}`;
        if (!ANTI) return base;
        const np = `:not(:empty):not(${PLAYER_CLS})`;
        const variants = [
            `${base}${np}:not(:has(${PLAYER_HAS})):not(:has(input,textarea,select,a[href^="/"]:not([href^="//"])))`,
            `${base}${np}:not(:has(${PLAYER_HAS}))`,
            `${base}${np}`
        ];
        for (const full of variants) {
            try { document.createDocumentFragment().querySelector(full); return full; } catch (e) {}
        }
        return `${base}:not(:empty)`;
    })();
    const AUTO_CSS = `${AUTO_SEL}{${HIDE}}`;

    /* tách nhiều mục: ; hoặc xuống dòng (tab Liên kết: thêm dấu phẩy / khoảng trắng, rồi chuẩn hoá URL) */
    const parseMulti = (raw, lnk) => {
        const out = [];
        String(raw || '').split(/[;\n]+/).forEach(x => {
            (lnk ? x.split(/[\s,]+/) : [x]).forEach(y => {
                y = y.trim();
                if (lnk) y = normLink(y);
                if (y && !out.includes(y)) out.push(y);
            });
        });
        return out;
    };

    const PAGE_CSS = `
        [${ATTR}],[${INV_ATTR}]{${HIDE}}
        [${QC_ATTR}]{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
        [${QCL_ATTR}]{${HIDE}}
        html[${PICK_ATTR}] :is(a,img,video,canvas,svg,picture,button,[role=button],iframe){-webkit-touch-callout:none!important}
        html[${PICK_ATTR}] img{-webkit-user-drag:none!important;-webkit-touch-callout:none!important}
        html[${PICK_ATTR}] .jw-rightclick{display:none!important}
        html[${PICKED_ATTR}] :is(img,video,canvas,picture,svg){pointer-events:none!important}
        [${PA_ATTR}] video,[${PA_ATTR}] .jw-media{opacity:0!important}
        html[${PRESS_ATTR}],html[${PRESS_ATTR}] *{-webkit-user-select:none!important;user-select:none!important;
            -webkit-touch-callout:none!important}`;

    const mkStyle = () => document.createElement('style');
    const page = mkStyle(), autoStyle = mkStyle(), ruleStyle = mkStyle();
    page.textContent = PAGE_CSS;

    let adopted = null;
    try { adopted = new CSSStyleSheet(); } catch (e) {}
    const setAdopted = css => { if (adopted) tryQ(() => adopted.replaceSync(css)); };
    const attachAdopted = () => {
        if (!adopted) return;
        tryQ(() => {
            const list = document.adoptedStyleSheets;
            if (!list.includes(adopted)) document.adoptedStyleSheets = [...list, adopted];
        });
    };

    const probe = document.createDocumentFragment();
    const validSel = s => tryQ(() => { probe.querySelector(s); return true; }, false);

    let killSel = '', popKillSel = '', lastCss = '';
    const frameDocs = new Set(), frameStyleOf = new WeakMap();
    let wireFrame = () => {};
    const syncFrameStyle = doc => tryQ(() => {
        const de = doc.documentElement;
        if (!de) return;
        let st = frameStyleOf.get(doc);
        if (!st || !st.isConnected) {
            st = doc.createElement('style');
            frameStyleOf.set(doc, st);
            de.appendChild(st);
        }
        if (st.textContent !== lastCss) st.textContent = lastCss;
        if (pickOn()) de.setAttribute(PICK_ATTR, ''); else de.removeAttribute(PICK_ATTR);
    });
    const publishRules = () => tryQ(() => document.documentElement.setAttribute(LNK_ATTR, JSON.stringify(lastRules)));

    const calcKeys = () => {
        keys = [...BUILTIN_TXT, ...glb.txt, ...site.txt].map(t => t.toLowerCase());
        lkeys = [...(CONFIG.links || []), ...glb.lnk, ...site.lnk].map(t => String(t).trim().toLowerCase()).filter(Boolean);
        const res = [...(CONFIG.hosts || []).map(h => h.toLowerCase()), ...lkeys.filter(k => /[.\/]/.test(k))];
        lastRules = {
            on: shieldOn(), keys: set.links ? lkeys : [], res, pop: !!set.pop, ovl: !!set.pop,
            apps: !!set.links, appAllow: APP_ALLOW, ab: ANTI, pa: PLAYER_ADS,
            qc: lkeys.filter(isQcKey),
            allow: (CONFIG.allow || []).map(x => String(x).toLowerCase()), kill: killSel
        };
        publishRules();
    };

    const learnSels = () => (!set.on ? [] : learn.l.filter(x => keys.includes(x.k) && validSel(x.s)).map(x => x.s));
    const learnPops = () => learn.p.filter(validSel);
    const learnActive = () => learnSels().length + learnPops().length;

    const attrSel = () => {
        if (!set.on || !keys.length) return '';
        const sels = [];
        keys.forEach(k => { const v = attrEsc(k); if (v) ATTRS.forEach(a => sels.push(`[${a}*="${v}" i]`)); });
        return sels.length ? `:is(${sels.join(',')})${NOT_ME}` : '';
    };

    const buildCss = () => {
        autoStyle.textContent = (set.on && set.auto) ? AUTO_CSS : '';
        const userSels = [...glb.sel, ...site.sel].map(toCss).filter(validSel);
        const ls = learnSels(), as = attrSel();
        ruleStyle.textContent = set.on ? [BUILTIN_CSS, hideAll(userSels), hideAll(ls), as ? `${as}{${HIDE}}` : ''].join('\n') : '';
        killSel = set.on ? [...BUILTIN_SEL, ...userSels, ...ls, (set.auto ? AUTO_SEL : '')].filter(Boolean).join(',') : '';
        if (lastRules) { lastRules.kill = killSel; publishRules(); }

        let guardCss = '';
        popKillSel = '';
        if (set.on && set.pop) {
            const ps = learnPops();
            if (ps.length) guardCss += `html[${GUARD_ATTR}] :is(${ps.join(',')})${NOT_ME}{${HIDE}}\n`;
            guardCss += `html[${GUARD_ATTR}] :is(${SUSPECT}):not([${OK_ATTR}],html,body,#gdar-host)${NOT_PLAYER}{${QHIDE}}\n`;
            guardCss += `html[${GUARD_ATTR}] [${Q_ATTR}]${NOT_ME}${NOT_PLAYER}{${QHIDE}}`;
            popKillSel = ps.join(',');
        }
        lastCss = [PAGE_CSS, autoStyle.textContent, ruleStyle.textContent, guardCss].join('\n');
        setAdopted(lastCss);
        frameDocs.forEach(syncFrameStyle);
    };

    const ensureStyles = () => {
        const de = document.documentElement;
        if (!de) return;
        [page, autoStyle, ruleStyle].forEach(s => { if (!s.isConnected) de.appendChild(s); });
        attachAdopted();
        if (hostEl && !hostEl.isConnected) { de.appendChild(hostEl); promote(); }
        if (lastRules && !de.hasAttribute(LNK_ATTR)) publishRules();
        if (set.on && set.pop && guardOn() && !de.hasAttribute(GUARD_ATTR)) de.setAttribute(GUARD_ATTR, '');
    };

    calcKeys(); buildCss(); ensureStyles(); syncGuard();

    const hush = m => tryQ(() => {
        m.setAttribute(MARK, '');
        m.muted = true; m.volume = 0; m.autoplay = false;
        m.removeAttribute('autoplay');
        if (!m.paused) { const r = m.pause(); if (r && r.catch) r.catch(() => {}); }
    });
    const stopMedia = el => {
        const f = m => {
            hush(m);
            tryQ(() => {
                m.querySelectorAll('source').forEach(s => s.removeAttribute('src'));
                m.removeAttribute('src');
                if (m.srcObject) m.srcObject = null;
                if (m.load) m.load();
            });
        };
        if (el.matches && el.matches(MEDIA_SEL)) f(el);
        if (el.querySelectorAll) el.querySelectorAll(MEDIA_SEL).forEach(f);
    };

    const playerFrame = f => tryQ(() => {
        if (!f || f.tagName !== 'IFRAME') return false;
        const s = f.getAttribute('src') || '';
        if (s && adSrcBad(s)) return false;
        if (f.hasAttribute('allowfullscreen') || /fullscreen/i.test(f.getAttribute('allow') || '')) return true;
        return !!s && /player|embed|stream|play|video|m3u8|vod|watch/i.test(s);
    }, false);
    const isPlayerish = el => tryQ(() => {
        if (!ANTI || !el || el.nodeType !== 1) return false;
        if (el.tagName === 'IFRAME') return playerFrame(el);
        const s0 = el.getAttribute('src') || el.getAttribute('data') || '';
        if (s0 && adSrcBad(s0)) return false;
        if (el.matches(PLAYER_CLS)) return true;
        for (const v of el.querySelectorAll('video,iframe')) {
            if (v.tagName === 'IFRAME') { if (playerFrame(v)) return true; }
            else {
                const s = v.getAttribute('src') || v.currentSrc || '';
                if (!(s && adSrcBad(s))) return true;
            }
        }
        return !!el.querySelector(PLAYER_CLS);
    }, false);
    const isBaitEmpty = el => tryQ(() => ANTI && /^(DIV|SPAN|P|INS|B|I|SECTION|ASIDE)$/.test(el.tagName) &&
        !el.firstElementChild && !(el.textContent || '').trim() && BAIT_RE.test(clsOf(el) + ' ' + (el.id || '')), false);

    const managed = el => tryQ(() => {
        for (const k of Object.keys(el)) if (k.charCodeAt(0) === 95 && /^(__react|__vue|_vnode|__vnode|_reactRoot|__svelte)/.test(k)) return true;
        return false;
    }, false);
    const KEEP = new WeakSet();

    function kill(el, perm) {
        if (!el || el.nodeType !== 1 || el === document.body || el === document.documentElement || inHostNode(el)) return false;
        if (isPlayerish(el) || isBaitEmpty(el)) return false;
        stopMedia(el);
        if (!managed(el)) {
            try { el.remove(); if (!el.isConnected) return true; } catch (e) {}
        }
        el.setAttribute(ATTR, '');
        if (perm) KEEP.add(el);
        return false;
    }
    const purgePop = root => {
        if (!popKillSel || !set.on || !set.pop || !root || !guardOn()) return;
        eachMatch(root, popKillSel, e => { if (kill(e, true)) unlockScroll(); });
    };
    const purgeSel = root => { if (set.on && killSel && root) eachMatch(root, killSel, e => kill(e)); };

    const sameSite = h => {
        const me = location.hostname.toLowerCase();
        return h === me || h.endsWith('.' + me) || me.endsWith('.' + h) || siteBase(h) === siteBase(me);
    };
    const parseExt = u => {
        if (!u) return null;
        let o;
        try { o = new URL(String(u), location.href); } catch (e) { return null; }
        return (/^https?:$/.test(o.protocol) && !sameSite(o.hostname.toLowerCase())) ? o : null;
    };
    const appUrl = u => !!(set.on && set.links && appSchemeOf(u, APP_ALLOW));
    const HOST_KEYS = (CONFIG.hosts || []).map(h => String(h).toLowerCase());
    const hitKeys = (o, list) => {
        const h = o.hostname.toLowerCase();
        const full = h + o.pathname.toLowerCase() + o.search.toLowerCase();
        return list.some(k => (/[\/?=&]/.test(k) ? full.includes(k) : h.includes(k)));
    };
    const ALLOW = (CONFIG.allow || []).map(x => String(x).toLowerCase());
    const allowed = h => ALLOW.some(k => h === k || h.endsWith('.' + k));
    const susHit = (o, nav) => adSuspect(o.hostname.toLowerCase(), o.pathname.toLowerCase(), o.search.toLowerCase(), o.port, nav);
    const adHost = (o, nav) => !allowed(o.hostname.toLowerCase()) && (hitKeys(o, HOST_KEYS) || susHit(o, nav));
    const urlBad = u => {
        if (!set.on) return false;
        if (appUrl(u)) return true;
        const o = parseExt(u);
        return !!o && (adHost(o, true) || !!(set.links && lkeys.length && !allowed(o.hostname.toLowerCase()) && hitKeys(o, lkeys)));
    };

    const SEARCH_REF = /(^|\.)(google|bing|duckduckgo|yahoo|coccoc|baidu|yandex|ecosia|brave)\.[a-z.]+$/;
    (function landingGuard() {
        try {
            if (!set.on || !set.links) return;
            const h = location.hostname.toLowerCase();
            if (!h || !/^https?:$/.test(location.protocol) || allowed(h)) return;
            let okH = '';
            try { okH = sessionStorage.getItem('gdar_land_ok') || ''; } catch (e) {}
            if (okH === h) return;
            try { if ((JSON.parse(localStorage.getItem('gdar_land_trust')) || []).indexOf(h) >= 0) return; } catch (e) {}
            const o = new URL(location.href);
            const strong = !!adSuspect(h, '', '', '', 'gamble') || (HOST_KEYS.length > 0 && hitKeys(o, HOST_KEYS));
            const weak = !strong && lkeys.length > 0 && hitKeys(o, lkeys);
            if (!strong && !weak) return;

            let refH = '';
            try { refH = new URL(document.referrer).hostname.toLowerCase(); } catch (e) {}
            if (!IS_FRAME && refH && sameSite(refH)) return;
            const viaLink = (!!refH && !SEARCH_REF.test(refH)) || (!refH && !!window.opener);

            if (IS_FRAME ? !strong : !(strong || viaLink)) return;

            const root = () => document.documentElement;
            const withRoot = fn => {
                if (root()) return fn();
                new MutationObserver((m, ob) => { if (root()) { ob.disconnect(); fn(); } }).observe(document, { childList: true });
            };
            withRoot(() => {
                const st = document.createElement('style');
                st.textContent = IS_FRAME
                    ? 'html,body{display:none!important}'
                    : 'html>*:not(#gdar-land){display:none!important}html{background:#111!important}';
                root().appendChild(st);
                try { window.stop(); } catch (e) {}
                lnkBlocked++;
                if (IS_FRAME) return;

                const box = document.createElement('div');
                box.id = 'gdar-land';
                box.setAttribute('style', 'all:initial;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#111;color:#eee;font:16px/1.5 system-ui,sans-serif;padding:24px;box-sizing:border-box;text-align:center');
                const card = document.createElement('div');
                card.setAttribute('style', 'max-width:420px');
                const t = document.createElement('div');
                t.setAttribute('style', 'font-size:20px;font-weight:700;margin-bottom:8px');
                t.textContent = 'Dot Ads đã chặn trang chuyển hướng';
                const d = document.createElement('div');
                d.setAttribute('style', 'opacity:.8;word-break:break-all;margin-bottom:18px');
                d.textContent = h;
                const mk = (txt, bg, fn) => {
                    const b = document.createElement('button');
                    b.textContent = txt;
                    b.setAttribute('style', 'all:initial;cursor:pointer;margin:4px;padding:10px 18px;border-radius:10px;font:600 15px system-ui,sans-serif;color:#fff;background:' + bg);
                    b.addEventListener('click', fn);
                    return b;
                };
                const back = () => {
                    if (window.opener) { try { window.close(); } catch (e) {} }
                    if (history.length > 1) history.back(); else location.replace('about:blank');
                };
                card.append(t, d, mk('Quay lại', '#2e7d32', back), mk('Vẫn mở trang này', '#555', () => {
                    try { sessionStorage.setItem('gdar_land_ok', h); } catch (e) {}
                    try {
                        const l = JSON.parse(localStorage.getItem('gdar_land_trust')) || [];
                        if (l.indexOf(h) < 0) l.push(h);
                        localStorage.setItem('gdar_land_trust', JSON.stringify(l.slice(-200)));
                    } catch (e) {}
                    location.reload();
                }));
                box.appendChild(card);
                root().appendChild(box);

                if (strong) {
                    if (window.opener) { try { window.close(); } catch (e) {} }
                    if (history.length > 1) setTimeout(() => { try { history.back(); } catch (e) {} }, 60);
                }
            });
        } catch (e) {}
    })();
    const AD_SRC_SEL = 'iframe[src],embed[src],object[data],script[src],img[src],video[src],audio[src],source[src]';
    const adSrcBad = u => { if (!set.on || !u) return false; if (appUrl(u)) return true; if (qcHit(u)) return true; const o = parseExt(u); return !!o && adHost(o, false); };

    /* Quảng cáo video trong player: không gỡ phần tử (player sẽ treo), chỉ tắt tiếng, tua tới cuối rồi báo "ended". */
    function finishAdMedia(m) {
        tryQ(() => {
            m.setAttribute(MARK, '');
            m.muted = true; m.volume = 0;
            m.playbackRate = 16;
            const d = m.duration;
            if (d && isFinite(d) && d > 0.2) m.currentTime = Math.max(0, d - 0.05);
            if (!m.__gdE) {
                m.__gdE = 1;
                setTimeout(() => tryQ(() => { m.dispatchEvent(new Event('timeupdate')); m.dispatchEvent(new Event('ended')); }), 40);
            }
        });
    }
    const purgeAdSrc = root => {
        if (!set.on || !root) return;
        eachMatch(root, AD_SRC_SEL, e => {
            const su = e.getAttribute('src') || e.getAttribute('data');
            if (qcHit(su)) {
                const mt = e.tagName === 'SOURCE' ? e.parentElement : e;
                if (mt && mt.matches && mt.matches(MEDIA_SEL)) { qcMark(mt, false); return; }
            }
            if (!adSrcBad(su)) return;
            if (e.tagName === 'SCRIPT') tryQ(() => { e.type = 'javascript/blocked'; });
            const t = e.tagName === 'SOURCE' && e.parentElement && e.parentElement.matches(MEDIA_SEL) ? e.parentElement : e;
            if (PLAYER_ADS && t.matches && t.matches(MEDIA_SEL) && inPlayer(t)) { finishAdMedia(t); return; }
            kill(t);
        });
    };
    const purgeMeta = root => {
        if (!set.on || !(set.pop || set.links) || !root) return;
        eachMatch(root, 'meta[http-equiv="refresh" i]', m => {
            const u = ((m.getAttribute('content') || '').match(/url\s*=\s*['"]?([^'";\s]+)/i) || [])[1];
            if (u && ((set.pop && parseExt(u)) || appUrl(u))) kill(m);
        });
    };
    const neutralize = a => {
        const h = a.getAttribute && a.getAttribute('href');
        if (h && urlBad(h) && !inHostNode(a)) { a.setAttribute(LNK_HREF, h); a.removeAttribute('href'); }
    };
    const neutralizeIn = root => { if (set.on && root) eachMatch(root, 'a[href],area[href]', neutralize); };
    const linkSweep = () => {
        document.querySelectorAll(`[${LNK_HREF}]`).forEach(a => {
            const o = a.getAttribute(LNK_HREF);
            if (!urlBad(o)) { a.setAttribute('href', o); a.removeAttribute(LNK_HREF); }
        });
        neutralizeIn(document.documentElement);
    };

    let intent = null;
    const hostOf = u => tryQ(() => new URL(String(u), location.href).hostname.toLowerCase(), '');
    function restoreIntent() {
        const it = intent;
        if (!it || !set.on || !set.pop) return;
        if (Date.now() - it.t > 4000) { intent = null; return; }
        const a = it.a;
        if (!a.isConnected) return;
        tryQ(() => {
            const h = a.getAttribute('href');
            if (h !== it.href && it.href != null && (appUrl(h) || (parseExt(h) && hostOf(h) !== it.host))) {
                a.setAttribute('href', it.href);
                lnkBlocked++;
                if (uiReady) render();
            }
            const tg = a.getAttribute('target');
            if (tg !== it.tgt && /_blank/i.test(tg || '')) {
                if (it.tgt == null) a.removeAttribute('target'); else a.setAttribute('target', it.tgt);
            }
        });
    }
    ['pointerdown', 'touchstart', 'mousedown', 'pointerup', 'touchend', 'mouseup', 'click'].forEach(t =>
        window.addEventListener(t, e => {
            if (!e.isTrusted || !set.on || !set.pop) return;
            const el = e.target;
            if (!el || el.nodeType !== 1 || inHostNode(el)) return;
            const a = el.closest && el.closest('a[href]');
            if (!a) return;
            const now = Date.now();
            if (!intent || intent.a !== a || now - intent.t > 4000)
                intent = { a, href: a.getAttribute('href'), tgt: a.getAttribute('target'), host: hostOf(a.href), t: now };
            else restoreIntent();
        }, { capture: true, passive: true }));

    const CLICK_URL_ATTRS = ['href', 'onclick', 'data-href', 'data-url', 'data-link', 'data-target-url', 'data-redirect', 'data-click-url', 'data-clickurl', 'xlink:href'];
    const URL_IN_TXT = /(?:https?:)?\/\/[^\s'"<>()\\]+/gi;
    const badInPath = e => {
        let path = [];
        try { path = e.composedPath ? e.composedPath() : []; } catch (x) {}
        if (!path.length) for (let n = e.target; n; n = n.parentNode) path.push(n);
        for (const el of path) {
            if (!el || el.nodeType !== 1 || !el.getAttribute) continue;
            if (el.id === 'gdar-host') return false;
            const tag = el.tagName;
            if (tag === 'BODY' || tag === 'HTML') break;
            if ((tag === 'A' || tag === 'AREA') && urlBad(el.getAttribute('href') || el.getAttribute(LNK_HREF))) return true;
            for (const at of CLICK_URL_ATTRS) {
                const v = el.getAttribute(at);
                if (!v || v.length > 4000) continue;
                if (at === 'href' || at === 'xlink:href') { if (urlBad(v)) return true; continue; }
                const m = v.match(URL_IN_TXT);
                if (m && m.some(u => urlBad(u.charAt(0) === '/' ? 'https:' + u : u))) return true;
            }
        }
        return false;
    };
    ['click', 'auxclick', 'mouseup', 'pointerup', 'touchend'].forEach(t => window.addEventListener(t, e => {
        if (!set.on) return;
        if (badInPath(e)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (t === 'click' || t === 'auxclick') { lnkBlocked++; if (uiReady) render(); }
        }
    }, true));

    function pageShield(W, INIT, MARK_PW, SUS, APP, REG) {
        if (W.__gdarShield) return;
        W.__gdarShield = true;
        const D = W.document, de = D.documentElement;
        let raw = '', R = INIT || null;

        const FTS = W.Function.prototype.toString, NATIVE = new W.WeakMap();
        const mask = (w, o) => { try { NATIVE.set(w, o); } catch (e) {} return w; };
        try {
            const ts2 = function toString() { const o = NATIVE.get(this); return FTS.call(o || this); };
            NATIVE.set(ts2, FTS);
            W.Function.prototype.toString = ts2;
        } catch (e) {}

        const rules = () => {
            const e = D.documentElement;
            const s = (e && e.getAttribute('data-gdar-lk')) || '';
            if (s && s !== raw) { raw = s; try { R = JSON.parse(s); } catch (x) {} }
            return R;
        };
        const parse = u => {
            try { const o = new W.URL(String(u), W.location.href); return /^https?:$/.test(o.protocol) ? o : null; }
            catch (e) { return null; }
        };
        const regDom = REG;
        const same = h => { const me = W.location.hostname.toLowerCase(); return h === me || h.endsWith('.' + me) || me.endsWith('.' + h) || regDom(h) === regDom(me); };
        const OKHOST = /(^|\.)(accounts\.google\.com|appleid\.apple\.com|login\.microsoftonline\.com|login\.live\.com|github\.com|discord\.com|paypal\.com|stripe\.com|vnpay\.vn|vnpayment\.vn|momo\.vn|zalopay\.vn|facebook\.com)$/i;
        const AD_URL = /popunder|clickunder|pop[-_]?under|utm_medium=pop/i;
        const AD_SIG = /popMagic|PopMagic|aclib\.runPop|ExoLoader|atOptions\s*=|popunder|clickunder|pop_under|\brunPop\b|HilltopAds|adsterra|ad-maven|admaven/i;
        const VAST_RE = /(^|[\/_.-])(vast|vmap)([\/_.?-]|\d|$)|\/(preroll|pre-roll|adtag|ad-tag)([\/_.?-]|$)|[?&](vast|vmap|adtag|adtagurl|ad_tag_url|vpaid)=/i;
        const VAST_XML = '<?xml version="1.0" encoding="UTF-8"?><VAST version="3.0"></VAST>';
        const DATA_SCRIPT = /__next_f|__NEXT_DATA__|__NUXT__|__INITIAL_STATE__|self\.__next/;
        const allowedH = h => { const r = rules(); return !!(r && r.allow && r.allow.some(k => h === k || h.endsWith('.' + k))); };
        const okHost = h => OKHOST.test(h) || allowedH(h);
        const hit = (o, list) => {
            const h = o.hostname.toLowerCase();
            const full = h + o.pathname.toLowerCase() + o.search.toLowerCase();
            return list.some(k => /[\/?=&]/.test(k) ? full.includes(k) : h.includes(k));
        };
        const susOf = (o, nav) => {
            const r = rules();
            return !!(r && typeof SUS === 'function' && SUS(o.hostname.toLowerCase(), o.pathname.toLowerCase(), o.search.toLowerCase(), o.port, nav));
        };
        const appBad = u => {
            const r = rules();
            return !!(r && r.on && r.apps && typeof APP === 'function' && u != null && APP(u, r.appAllow));
        };
        const badNav = u => {
            const r = rules();
            if (!r || !r.on || !u) return false;
            if (appBad(u)) return true;
            const o = parse(u);
            if (!o) return false;
            const h = o.hostname.toLowerCase();
            if (same(h) || allowedH(h)) return false;
            return !!((r.keys && r.keys.length && hit(o, r.keys)) || (r.res && r.res.length && hit(o, r.res)) || susOf(o, true));
        };
        /* khoá "Chặn lớp QC" (host/đường-dẫn): chặn cả khi cùng trang */
        const qcHit = u => {
            const r = rules();
            if (!r || !r.on || !r.qc || !r.qc.length || !u) return false;
            const o = parse(u);
            if (!o) return false;
            const full = o.hostname.toLowerCase() + o.pathname.toLowerCase() + o.search.toLowerCase();
            return r.qc.some(k => full.includes(k));
        };
        const qcNote = u => {
            try { if (qcHit(u)) D.documentElement.setAttribute('data-gdar-qcw', String(Date.now())); } catch (e) {}
        };
        const badRes = u => {
            const r = rules();
            if (!r || !r.on || !u) return false;
            if (appBad(u)) return true;
            const o = parse(u);
            if (!o) return false;
            if (qcHit(u)) return true;
            if (r.pa && VAST_RE.test(o.pathname + o.search)) return true;
            const h = o.hostname.toLowerCase();
            if (same(h) || allowedH(h)) return false;
            return !!((r.res && r.res.length && hit(o, r.res)) || susOf(o, false));
        };
        const locked = ms => {
            const r = rules(), e = D.documentElement;
            return !!(r && r.on) && Date.now() - (+(e && e.getAttribute('data-gdar-t')) || 0) < (ms || 3000);
        };

        let gT = 0, gOK = false, gHref = '', gDepth = 0, popSig = 0, gIsoT = 0, tapN = 0, hijT = 0, extT = 0;
        ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown'].forEach(t => W.addEventListener(t, e => {
            if (!e.isTrusted) return;
            const el = e.target;
            if (el && el.id === 'gdar-host') return;
            const now = Date.now();
            if (now - gT > 800) tapN++;
            gT = now;
            gOK = !!(el && el.closest && el.closest('a[href],button,[role=button],input,select,summary,label'));
            const a = el && el.closest && el.closest('a[href]');
            const rh = a ? (a.getAttribute('href') || '') : '';
            gHref = (a && rh && !/^(#|javascript:)/i.test(rh)) ? a.href : '';
            if (gHref) {
                const gp = parse(gHref);
                if (gp && !same(gp.hostname.toLowerCase())) extT = now;
            }
            if (gHref && !gIsoT) gIsoT = gT;
        }, { capture: true, passive: true }));
        const popOK = () => Date.now() - gT < 1500 && gOK;
        const isolate = ev => {
            const r = rules();
            return !!(r && r.on && r.pop && gIsoT && gHref && ev && ev.isTrusted && Date.now() - gIsoT < 1500);
        };
        const markHijack = () => { if (tapN === 1 && !gOK && !gHref && Date.now() - gT < 1500) hijT = Date.now(); };

        const gestureLink = o => {
            if (!gHref || Date.now() - gT > 3000) return false;
            const g = parse(gHref);
            return !!g && g.origin === o.origin && g.pathname === o.pathname;
        };
        const samePage = o => { const L = W.location; return o.origin === L.origin && o.pathname === L.pathname && o.search === L.search; };
        const navBad = o => {
            const r = rules();
            if (!r || !r.on || !o) return false;
            if (badNav(o.href) || AD_URL.test(o.href) || locked(6000)) return true;
            const h = o.hostname.toLowerCase();
            if (same(h) || okHost(h) || !r.pop) return false;
            return !gestureLink(o);
        };
        const popBlocked = u => {
            const r = rules();
            return !!(r && r.on) && (locked() || badNav(u) || (!!r.pop && !popOK()));
        };
        const fakeWin = () => new Proxy(function () {}, {
            get: (t, k) => (k === 'closed' ? false : (typeof k === 'symbol' || k === 'then') ? undefined : fakeWin()),
            set: () => true, apply: () => undefined
        });

        const BAIT = /(^|[\s_-])(adsbox|ad-?(banner|box|unit|slot|placement|container|block|zone|holder)s?|banner-?ads?|text-?ads?|textad|pub_\d+x\d+m?|adsbygoogle|ad-?\d+x\d+|google-?ads?|adbox|ads?|adv|advert\w*|sponsor\w*|bait)([\s_-]|$)/i;
        const isBait = e => {
            try {
                if (!e || e.nodeType !== 1) return false;
                const r = rules();
                if (!r || !r.on || !r.ab) return false;
                const c = typeof e.className === 'string' ? e.className : (e.getAttribute && e.getAttribute('class')) || '';
                if (!BAIT.test(c + ' ' + (e.id || ''))) return false;
                return !e.firstElementChild && !(e.textContent || '').trim();
            } catch (x) { return false; }
        };
        try {
            const defNum = (P, n, fake) => {
                const d = P && Object.getOwnPropertyDescriptor(P, n);
                if (!d || !d.get) return;
                Object.defineProperty(P, n, {
                    configurable: true, enumerable: d.enumerable,
                    get: mask(function () {
                        const v = d.get.call(this);
                        return ((v === 0 || v === null) && isBait(this)) ? (typeof fake === 'function' ? fake() : fake) : v;
                    }, d.get)
                });
            };
            const HP = W.HTMLElement && W.HTMLElement.prototype, EP = W.Element && W.Element.prototype;
            ['offsetHeight', 'offsetWidth', 'offsetLeft', 'offsetTop'].forEach(n => defNum(HP, n, 1));
            defNum(HP, 'offsetParent', () => D.body || D.documentElement);
            ['clientHeight', 'clientWidth', 'scrollHeight', 'scrollWidth'].forEach(n => defNum(EP, n, 1));

            const gb = EP.getBoundingClientRect;
            EP.getBoundingClientRect = mask(function () {
                const r = gb.apply(this, arguments);
                try { if (!r.width && !r.height && isBait(this)) return new W.DOMRect(r.x, r.y, 1, 1); } catch (e) {}
                return r;
            }, gb);

            const gcr = EP.getClientRects;
            if (gcr) EP.getClientRects = mask(function () {
                const r = gcr.apply(this, arguments);
                try { if (!r.length && isBait(this)) return [new W.DOMRect(0, 0, 1, 1)]; } catch (e) {}
                return r;
            }, gcr);

            const cvis = EP.checkVisibility;
            if (cvis) EP.checkVisibility = mask(function () {
                const v = cvis.apply(this, arguments);
                return (!v && isBait(this)) ? true : v;
            }, cvis);

            const gcs = W.getComputedStyle;
            W.getComputedStyle = mask(function (el) {
                const cs = gcs.apply(this, arguments);
                try {
                    if (el && el.nodeType === 1 && arguments.length < 2 && isBait(el) &&
                        (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')) {
                        const F = { display: 'block', visibility: 'visible', opacity: '1' };
                        return new W.Proxy(cs, {
                            get(t, k) {
                                if (typeof k === 'string' && F[k] !== undefined) return F[k];
                                if (k === 'getPropertyValue') return n => (F[n] !== undefined ? F[n] : t.getPropertyValue(n));
                                const v = t[k];
                                return typeof v === 'function' ? v.bind(t) : v;
                            }
                        });
                    }
                } catch (e) {}
                return cs;
            }, gcs);
        } catch (e) {}

        try {
            const r0 = rules();
            if (r0 && r0.on && r0.ab) {
                if (typeof W.canRunAds === 'undefined') W.canRunAds = true;
                if (!W.googletag) {
                    const mkStub = () => new W.Proxy(function () {}, {
                        get: (t, k) => {
                            if (k === 'apiReady') return true;
                            if (k === 'cmd') return { push: fn => { try { if (typeof fn === 'function') fn(); } catch (e) {} return 1; } };
                            if (k === 'toString' || k === 'valueOf' || k === 'toJSON') return () => '';
                            if (typeof k === 'symbol' || k === 'then') return undefined;
                            return mkStub();
                        },
                        apply: () => mkStub(),
                        construct: () => mkStub()
                    });
                    const gt = mkStub();
                    Object.defineProperty(W, 'googletag', { configurable: true, get: () => gt, set: () => {} });
                }
            }
        } catch (e) {}

        try {
            const wrapped = new W.WeakSet(), patched = new W.WeakSet();
            const paOn = () => { const r = rules(); return !!(r && r.on && r.pa); };
            const stripCfg = c => {
                try {
                    if (!c || typeof c !== 'object' || !paOn()) return;
                    ['advertising', 'adschedule', 'adSchedule', 'vast', 'ima'].forEach(k => { if (k in c) delete c[k]; });
                    if (Array.isArray(c.playlist)) c.playlist.forEach(i => {
                        if (i && typeof i === 'object') { delete i.adschedule; delete i.advertising; }
                    });
                } catch (e) {}
            };
            const hook = pl => {
                try {
                    if (!pl || pl.__gdarH || typeof pl.on !== 'function') return;
                    pl.__gdarH = 1;
                    ['adImpression', 'adStarted', 'adPlay', 'adRequest'].forEach(ev => {
                        try { pl.on(ev, () => { try { if (paOn() && typeof pl.skipAd === 'function') pl.skipAd(); } catch (e) {} }); } catch (e) {}
                    });
                } catch (e) {}
            };
            const patch = p => {
                try {
                    if (!p || (typeof p !== 'object' && typeof p !== 'function') || patched.has(p)) return p;
                    patched.add(p);
                    ['setup', 'setConfig'].forEach(k => {
                        const f = p[k];
                        if (typeof f !== 'function') return;
                        p[k] = mask(function (c) {
                            stripCfg(c);
                            const ret = f.apply(this, arguments);
                            if (k === 'setup') hook(ret && typeof ret === 'object' ? ret : this);
                            return ret;
                        }, f);
                    });
                } catch (e) {}
                return p;
            };
            const wrapJw = jw => {
                if (typeof jw !== 'function' || wrapped.has(jw)) return jw;
                try { if (jw.defaults && typeof jw.defaults === 'object' && paOn()) delete jw.defaults.advertising; } catch (e) {}
                const px = new W.Proxy(jw, { apply: (t, th, a) => patch(W.Reflect.apply(t, th, a)) });
                wrapped.add(px); wrapped.add(jw);
                return px;
            };
            const holder = { v: W.jwplayer };
            if (typeof holder.v === 'function') holder.v = wrapJw(holder.v);
            try {
                Object.defineProperty(W, 'jwplayer', {
                    configurable: true, enumerable: true,
                    get: () => holder.v,
                    set: v => { holder.v = wrapJw(v); }
                });
            } catch (e) {}
            let pn = 0;
            const piv = W.setInterval(() => {
                try {
                    const j = W.jwplayer;
                    if (typeof j === 'function' && !wrapped.has(j)) { try { W.jwplayer = wrapJw(j); } catch (e) {} }
                    if (++pn > 200) W.clearInterval(piv);
                } catch (e) {}
            }, 300);
        } catch (e) {}

        const WATCH = { SCRIPT: 1, IFRAME: 1, IMG: 1, LINK: 1, SOURCE: 1, EMBED: 1, OBJECT: 1, VIDEO: 1, AUDIO: 1, TRACK: 1 };
        /* video quảng cáo bị chặn: ẩn ngay (CSS theo thuộc tính), báo "ended" để trình phát bỏ qua sang phim chính */
        const qcMedia = el => {
            try {
                D.documentElement.setAttribute('data-gdar-qcw', String(Date.now()));
                const m = el.tagName === 'SOURCE' ? el.parentElement : el;
                if (!m || (m.tagName !== 'VIDEO' && m.tagName !== 'AUDIO')) return;
                if (m.hasAttribute('data-gdar-qc')) return;
                sa.call(m, 'data-gdar-qc', String(Date.now()));
                [0, 350].forEach(ms => W.setTimeout(() => {
                    try {
                        if (!m.isConnected || !m.hasAttribute('data-gdar-qc')) return;
                        m.dispatchEvent(new W.Event('timeupdate'));
                        m.dispatchEvent(new W.Event('ended'));
                    } catch (e) {}
                }, ms));
            } catch (e) {}
        };
        const blockEl = (el, u) => {
            try { if (el.tagName === 'SCRIPT') el.type = 'javascript/blocked'; } catch (e) {}
            if (u && qcHit(u)) qcMedia(el);
            W.setTimeout(() => { try { el.dispatchEvent(new W.Event('load')); } catch (e) {} }, 0);
        };
        const sa = W.Element.prototype.setAttribute;
        W.Element.prototype.setAttribute = mask(function (n, v) {
            if (WATCH[this.tagName] && typeof n === 'string') {
                const l = n.toLowerCase();
                if ((l === 'src' || l === 'href' || l === 'data') && badRes(v)) { blockEl(this, v); return; }
                if (l === 'src' && (this.tagName === 'VIDEO' || this.tagName === 'AUDIO') && isAdMedia(this)) return;
            }
            return sa.apply(this, arguments);
        }, sa);
        const defSet = (P, p, wrap) => {
            const d = P && Object.getOwnPropertyDescriptor(P, p);
            if (!d || !d.set) return;
            Object.defineProperty(P, p, { configurable: true, enumerable: d.enumerable, get: d.get, set: mask(wrap(d), d.set) });
        };
        [['HTMLScriptElement', 'src'], ['HTMLIFrameElement', 'src'], ['HTMLImageElement', 'src'],
         ['HTMLLinkElement', 'href'], ['HTMLSourceElement', 'src'], ['HTMLEmbedElement', 'src'],
         ['HTMLObjectElement', 'data'], ['HTMLMediaElement', 'src']].forEach(x => {
            const C = W[x[0]];
            defSet(C && C.prototype, x[1], d => function (v) { if (badRes(v)) { blockEl(this, v); return; } return d.set.call(this, v); });
        });

        const MP = W.HTMLMediaElement && W.HTMLMediaElement.prototype;
        const gd = n => MP && Object.getOwnPropertyDescriptor(MP, n);
        const dMu = gd('muted'), dVo = gd('volume'), dAu = gd('autoplay');
        const isAdMedia = m => {
            try {
                const r = rules();
                if (!r || !r.on || !m) return false;
                if (m.hasAttribute('data-gdar-m')) return true;
                const s = m.getAttribute('src') || m.currentSrc || '';
                if (s && badRes(s)) return true;
                if (m.isConnected) {
                    if (m.closest('[data-gdar],[data-gdar-inv]')) return true;
                    if (m.closest('.jwplayer,.video-js,.plyr,.art-video-player,.dplayer,.fp-player,.flowplayer,.mejs__container,.shaka-video-container,.oplayer,[class*="player" i],[id*="player" i]')) return false;
                    if (r.kill && m.closest(r.kill)) return true;
                }
            } catch (e) {}
            return false;
        };
        const hushMedia = m => {
            try { sa.call(m, 'data-gdar-m', ''); } catch (e) {}
            try { if (dMu && dMu.set) dMu.set.call(m, true); } catch (e) {}
            try { if (dVo && dVo.set) dVo.set.call(m, 0); } catch (e) {}
            try { if (dAu && dAu.set) dAu.set.call(m, false); } catch (e) {}
            try { m.removeAttribute('autoplay'); } catch (e) {}
            try { if (!m.paused) m.pause(); } catch (e) {}
        };
        if (MP) {
            const pl0 = MP.play;
            if (pl0) MP.play = mask(function () {
                if (isAdMedia(this)) { hushMedia(this); return W.Promise.resolve(); }
                return pl0.apply(this, arguments);
            }, pl0);
            [['src', () => true], ['srcObject', v => !!v], ['autoplay', v => !!v], ['muted', v => !v], ['volume', v => +v > 0]]
                .forEach(([name, risky]) => defSet(MP, name, d => function (v) {
                    if (risky(v) && isAdMedia(this)) { hushMedia(this); return; }
                    return d.set.call(this, v);
                }));
        }
        try {
            const A0 = W.Audio;
            if (A0) {
                const A = function (s) {
                    const a = new A0();
                    if (s != null) {
                        if (badRes(s)) { try { sa.call(a, 'data-gdar-m', ''); } catch (e) {} }
                        else a.src = s;
                    }
                    return a;
                };
                A.prototype = A0.prototype;
                W.Audio = mask(A, A0);
            }
        } catch (e) {}

        const GIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const fakeResp = (i, init) => {
            try {
                const raw = String(i && i.url ? i.url : i);
                const u = raw.split(/[?#]/)[0].toLowerCase();
                const nc = !!(init && init.mode === 'no-cors') || !!(i && i.mode === 'no-cors');
                const mk = (b, t) => new W.Response(b, { status: 200, headers: { 'content-type': t } });
                if (VAST_RE.test(raw)) return mk(VAST_XML, 'text/xml');
                if (/\.(gif|png|jpe?g|webp|ico)$/.test(u)) return mk(W.Uint8Array.from(W.atob(GIF), c => c.charCodeAt(0)), 'image/gif');
                if (/\.js$/.test(u)) return mk('', 'application/javascript');
                if (/\.css$/.test(u)) return mk('', 'text/css');
                if (nc) return mk('', 'text/plain');
                return mk('{}', 'application/json');
            } catch (e) { return null; }
        };
        const f0 = W.fetch;
        if (f0) W.fetch = mask(function (i, init) {
            const u = i && i.url ? i.url : i;
            if (badRes(u)) {
                qcNote(u);
                const r = fakeResp(i, init);
                if (r) return W.Promise.resolve(r);
            }
            return f0.apply(this, arguments);
        }, f0);
        const xo = W.XMLHttpRequest && W.XMLHttpRequest.prototype.open;
        if (xo) W.XMLHttpRequest.prototype.open = mask(function () {
            const a = [].slice.call(arguments);
            if (badRes(a[1])) { qcNote(a[1]); a[1] = VAST_RE.test(String(a[1])) ? 'data:text/xml;charset=utf-8,' + encodeURIComponent(VAST_XML) : 'data:application/json,%7B%7D'; }
            return xo.apply(this, a);
        }, xo);
        const sb = W.Navigator && W.Navigator.prototype.sendBeacon;
        if (sb) W.Navigator.prototype.sendBeacon = mask(function (u) { if (badRes(u)) return true; return sb.apply(this, arguments); }, sb);

        const strip = s => {
            if (typeof s !== 'string' || s.length > 300000 || s.indexOf('<') < 0) return s;
            const r = rules();
            if (!r || !r.on) return s;
            return s.replace(/<(script|iframe|img|embed)\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)[^>]*>(\s*<\/\1>)?/gi,
                (m, t, u) => (badRes(u) ? '' : m))
                .replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi, (m, c) => ((AD_SIG.test(c) && !DATA_SCRIPT.test(c)) ? '' : m));
        };
        ['write', 'writeln'].forEach(k => {
            const o = W.Document.prototype[k];
            W.Document.prototype[k] = mask(function () { return o.apply(this, [].map.call(arguments, strip)); }, o);
        });
        const iah = W.Element.prototype.insertAdjacentHTML;
        W.Element.prototype.insertAdjacentHTML = mask(function (p, h) { return iah.call(this, p, strip(h)); }, iah);
        defSet(W.Element.prototype, 'innerHTML', d => function (v) { return d.set.call(this, strip(v)); });
        defSet(W.HTMLIFrameElement && W.HTMLIFrameElement.prototype, 'srcdoc', d => function (v) { return d.set.call(this, strip(v)); });

        const op = W.open;
        const guardedOpen = function (u, t) {
            const r = rules();
            if (r && r.on) {
                const o = u ? parse(u) : null;
                const tg = String(t || '').toLowerCase();
                let bad = popBlocked(u);
                if (!bad && o) {
                    if (tg === '_self' || tg === '_top' || tg === '_parent') bad = navBad(o);
                    else if (AD_URL.test(o.href)) bad = true;
                    else if (r.pop) {
                        const hh = o.hostname.toLowerCase();
                        if (samePage(o)) bad = true;
                        else if (!same(hh) && !okHost(hh) && !gestureLink(o)) bad = true;
                        else if (gDepth > 0 && !gestureLink(o)) bad = true;
                    }
                } else if (!bad && !o && r.pop && (!u || /^about:blank$/i.test(String(u)))) bad = true;
                if (bad) { popSig = Date.now(); return fakeWin(); }
            }
            return op.apply(this, arguments);
        };
        mask(guardedOpen, op);
        try { Object.defineProperty(W, 'open', { configurable: false, enumerable: true, get: () => guardedOpen, set: () => {} }); }
        catch (e) { W.open = guardedOpen; }

        ['showModal', 'show'].forEach(k => {
            const P = W.HTMLDialogElement && W.HTMLDialogElement.prototype, o = P && P[k];
            if (o) P[k] = mask(function () {
                const r = rules();
                if (r && r.on && r.ovl && !gT) return;
                return o.apply(this, arguments);
            }, o);
        });
        const blockA = a => {
            const r = rules();
            if (!r || !r.on) return false;
            if (appBad(a.getAttribute('href'))) return true;
            const o = parse(a.href);
            if (!o) return false;
            if (locked() || badNav(a.href) || AD_URL.test(a.href)) return true;
            if (!r.pop) return false;
            const h = o.hostname.toLowerCase();
            if (!same(h)) return !(okHost(h) || (popOK() && gestureLink(o)));
            return a.target === '_blank' && (!popOK() || samePage(o));
        };
        const ac = W.HTMLAnchorElement.prototype.click;
        W.HTMLAnchorElement.prototype.click = mask(function () { if (blockA(this)) return; return ac.apply(this, arguments); }, ac);
        W.addEventListener('click', e => {
            if (e.isTrusted) return;
            const a = e.target && e.target.closest && e.target.closest('a[href]');
            if (a && blockA(a)) { e.preventDefault(); e.stopImmediatePropagation(); }
        }, true);

        const blockForm = f => {
            const r = rules();
            if (!r || !r.on) return false;
            const act = f.getAttribute('action') || W.location.href;
            if (appBad(act)) return true;
            const o = parse(act);
            if (!o) return false;
            if (locked() || badNav(act)) return true;
            const h = o.hostname.toLowerCase();
            return !!r.pop && ((!same(h) && !okHost(h)) || (f.target === '_blank' && !popOK()));
        };
        const FP = W.HTMLFormElement && W.HTMLFormElement.prototype;
        if (FP) ['submit', 'requestSubmit'].forEach(k => {
            const o = FP[k];
            if (o) FP[k] = mask(function () { if (blockForm(this)) return; return o.apply(this, arguments); }, o);
        });

        try {
            const nav = W.navigation;
            if (nav) nav.addEventListener('navigate', e => {
                if (!e.cancelable || e.hashChange || e.downloadRequest != null) return;
                const r = rules();
                if (!r || !r.on) return;
                if (appBad(e.destination.url)) { popSig = Date.now(); e.preventDefault(); return; }
                const o = parse(e.destination.url);
                if (!o) return;
                if (!same(o.hostname.toLowerCase())) extT = Date.now();
                if (o.origin === W.location.origin) return;
                if (e.userInitiated && badNav(e.destination.url)) { popSig = Date.now(); e.preventDefault(); return; }
                if (e.userInitiated) {
                    const nt = e.navigationType;
                    if (r.pop && gHref && (nt === 'push' || nt === 'replace') && Date.now() - gT < 3000 && !gestureLink(o)) {
                        const hh = o.hostname.toLowerCase();
                        if (!same(hh) && !okHost(hh)) {
                            popSig = Date.now();
                            e.preventDefault();
                            const g = gHref;
                            W.setTimeout(() => { try { W.location.href = g; } catch (x) {} }, 0);
                        }
                    }
                    return;
                }
                if (navBad(o)) { popSig = Date.now(); e.preventDefault(); }
            });
        } catch (e) {}

        W.addEventListener('beforeunload', e => {
            const r = rules();
            if (!r || !r.on) return;
            if (locked() && Date.now() - extT < 2500) { try { e.preventDefault(); e.returnValue = ''; } catch (x) {} }
            const hij = !!hijT && Date.now() - hijT < 1500 && !gHref;
            if (!W.navigation && r.pop && (Date.now() - popSig < 1200 || gDepth > 0 || hij)) {
                popSig = Date.now();
                [0, 10, 30, 60, 100, 150, 250, 400, 600, 1000, 1500].forEach(ms => W.setTimeout(() => { try { W.stop(); } catch (x) {} }, ms));
            }
        });

        try {
            const GT = { click: 1, auxclick: 1, mousedown: 1, mouseup: 1, pointerdown: 1, pointerup: 1, touchstart: 1, touchend: 1 };
            const wrapMap = new WeakMap();
            const isGlobal = t => t === W || t === D || t === D.documentElement || t === de || t === D.body;
            const ael = W.EventTarget.prototype.addEventListener;
            const rel = W.EventTarget.prototype.removeEventListener;
            const keyOf = (type, o) => type + ((typeof o === 'boolean' ? o : !!(o && o.capture)) ? 'c' : 'b');
            const wrapFn = fn => function (ev) { if (isolate(ev)) return; gDepth++; try { return fn.apply(this, arguments); } finally { gDepth--; markHijack(); } };
            W.EventTarget.prototype.addEventListener = mask(function (type, fn, o) {
                if (GT[type] && fn && isGlobal(this)) {
                    try {
                        let m = wrapMap.get(fn);
                        if (!m) { m = new Map(); wrapMap.set(fn, m); }
                        const k = keyOf(type, o);
                        let w = m.get(k);
                        if (!w) {
                            w = typeof fn === 'function' ? wrapFn(fn) : { handleEvent: wrapFn(fn.handleEvent.bind(fn)) };
                            m.set(k, w);
                        }
                        return ael.call(this, type, w, o);
                    } catch (x) {}
                }
                return ael.apply(this, arguments);
            }, ael);
            W.EventTarget.prototype.removeEventListener = mask(function (type, fn, o) {
                if (GT[type] && fn && isGlobal(this)) {
                    const m = wrapMap.get(fn), w = m && m.get(keyOf(type, o));
                    if (w) return rel.call(this, type, w, o);
                }
                return rel.apply(this, arguments);
            }, rel);
        } catch (e) {}

        const blockScript = n => {
            try {
                const r = rules();
                if (!r || !r.on || !n || n.tagName !== 'SCRIPT') return;
                const s = n.getAttribute('src');
                if (s) { if (badRes(s)) n.type = 'javascript/blocked'; return; }
                if (n.id === '__NEXT_DATA__' || /json/i.test(n.type || '')) return;
                const t = n.textContent || '';
                if (DATA_SCRIPT.test(t.slice(0, 400))) return;
                if (t.length < 400000 && AD_SIG.test(t)) n.type = 'javascript/blocked';
            } catch (e) {}
        };
        const vetNode = n => {
            try {
                if (!n) return n;
                if (n.nodeType === 1 && n.tagName === 'SCRIPT') blockScript(n);
                else if ((n.nodeType === 1 || n.nodeType === 11) && n.querySelectorAll) n.querySelectorAll('script').forEach(blockScript);
            } catch (e) {}
            return n;
        };
        try {
            const fixWin = w => {
                try { if (w && !w.__gdarO) { w.__gdarO = 1; Object.defineProperty(w, 'open', { configurable: false, get: () => guardedOpen, set: () => {} }); } } catch (e) {}
                return w;
            };
            const defGet = (P, p, wrap) => {
                const d = Object.getOwnPropertyDescriptor(P, p);
                if (d && d.get) Object.defineProperty(P, p, { configurable: true, enumerable: d.enumerable, get: mask(wrap(d.get), d.get) });
            };
            const IP = W.HTMLIFrameElement.prototype;
            defGet(IP, 'contentWindow', g => function () { return fixWin(g.call(this)); });
            defGet(IP, 'contentDocument', g => function () { const d = g.call(this); try { if (d) fixWin(d.defaultView); } catch (e) {} return d; });
        } catch (e) {}

        try {
            const q = [];
            q.push = function () { return 0; };
            q.loaded = true;
            Object.defineProperty(W, 'adsbygoogle', { configurable: true, get: function () { return q; }, set: function () {} });
        } catch (e) {}

        const rc = W.Node.prototype.removeChild;
        W.Node.prototype.removeChild = mask(function (c) { if (c && c.parentNode !== this) return c; return rc.apply(this, arguments); }, rc);
        const rpc = W.Node.prototype.replaceChild;
        W.Node.prototype.replaceChild = mask(function (n, o) {
            vetNode(n);
            if (o && o.parentNode !== this) { try { this.appendChild(n); } catch (e) {} return o; }
            return rpc.apply(this, arguments);
        }, rpc);
        const ib = W.Node.prototype.insertBefore;
        W.Node.prototype.insertBefore = mask(function (n, r) {
            vetNode(n);
            if (r && r.parentNode !== this) return ib.call(this, n, null);
            return ib.apply(this, arguments);
        }, ib);
        const apc = W.Node.prototype.appendChild;
        W.Node.prototype.appendChild = mask(function (n) { vetNode(n); return apc.apply(this, arguments); }, apc);
        ['append', 'prepend'].forEach(k => {
            const o = W.Element.prototype[k];
            if (o) W.Element.prototype[k] = mask(function () { [].forEach.call(arguments, vetNode); return o.apply(this, arguments); }, o);
        });

        if (de && MARK_PW) de.setAttribute('data-gdar-pw', '1');
    }
    (function injectShield() {
        const de = document.documentElement;
        const code = '(' + pageShield.toString() + ')(window,' + JSON.stringify(lastRules) + ',true,' +
            adSuspect.toString() + ',' + appSchemeOf.toString() + ',' + siteBase.toString() + ');';
        try {
            const sc = document.createElement('script');
            sc.textContent = code;
            de.appendChild(sc);
            sc.remove();
        } catch (e) {}
        if (!de.hasAttribute('data-gdar-pw')) {
            try {
                const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
                const sc = document.createElement('script');
                sc.src = url;
                sc.onload = sc.onerror = () => { try { sc.remove(); URL.revokeObjectURL(url); } catch (e) {} };
                de.appendChild(sc);
            } catch (e) {}
        }
        try { pageShield((typeof unsafeWindow !== 'undefined' && unsafeWindow) || window, lastRules, false, adSuspect, appSchemeOf, siteBase); } catch (e) {}
    })();

    const adOrig = new WeakMap(), adSeen = new WeakMap();
    let lastSkipAt = 0, lastApiAt = 0, lastBtnTick = 0;
    const synthClick = el => tryQ(() => {
        const o = { bubbles: true, cancelable: true, composed: true, view: window };
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t => {
            const E = (/^pointer/.test(t) && typeof PointerEvent === 'function') ? PointerEvent : MouseEvent;
            el.dispatchEvent(new E(t, o));
        });
    });
    const jwSkipApi = () => tryQ(() => {
        const w = (typeof unsafeWindow !== 'undefined' && unsafeWindow) || window;
        const jw = w.jwplayer;
        if (typeof jw !== 'function') return;
        const p = jw();
        if (p && typeof p.skipAd === 'function') p.skipAd();
    });
    function findSkipBtn(p) {
        let b = tryQ(() => p.querySelector(AD_SKIP_SEL), null);
        if (b) return b;
        tryQ(() => {
            let n = 0;
            for (const e of p.querySelectorAll('button,[role=button],a,div,span')) {
                if (++n > 250) break;
                if (e.children.length > 3) continue;
                const t = (e.textContent || '').trim();
                if (t.length <= 30 && SKIP_TXT.test(t)) { b = e; break; }
            }
        });
        return b;
    }
    /* p: khung player; btn: nút "Bỏ qua" tìm theo chữ (chế độ generic, chỉ động vào video ngắn như quảng cáo) */
    function skipAdIn(p, btn) {
        if (!p || p.nodeType !== 1 || inHostNode(p)) return;
        const generic = !!btn;
        let live = !generic;
        p.querySelectorAll('video').forEach(v => tryQ(() => {
            const d = v.duration;
            const short = !d || !isFinite(d) || d <= 180;
            if (generic && !short) return;
            live = true;
            if (!adOrig.has(v)) adOrig.set(v, { m: v.muted, r: v.playbackRate, d: v.defaultPlaybackRate });
            v.muted = true;
            if (v.playbackRate !== 16) v.playbackRate = 16;
            if (d && isFinite(d) && d > 0.5 && v.currentTime < d - 0.3) v.currentTime = d - 0.1;
            if (v.paused && !v.ended) { const r = v.play(); if (r && r.catch) r.catch(() => {}); }
        }));
        if (!live) return;
        p.setAttribute(PA_ATTR, '');
        if (generic) adSeen.set(p, Date.now());
        const now = Date.now();
        if (now - lastSkipAt > 120) {
            lastSkipAt = now;
            const b = btn || findSkipBtn(p);
            if (b) { synthClick(b); tryQ(() => b.click()); }
        }
        if (!generic && now - lastApiAt > 200) { lastApiAt = now; jwSkipApi(); }
    }
    function restoreAdPlayers() {
        const now = Date.now();
        document.querySelectorAll(`[${PA_ATTR}]`).forEach(p => {
            if (set.on && PLAYER_ADS && (tryQ(() => p.matches(AD_PLAYER), false) || now - (adSeen.get(p) || 0) < 700)) return;
            p.removeAttribute(PA_ATTR);
            p.querySelectorAll('video').forEach(v => {
                const o = adOrig.get(v);
                if (!o) return;
                adOrig.delete(v);
                tryQ(() => { v.muted = o.m; v.playbackRate = o.r; v.defaultPlaybackRate = o.d; });
            });
        });
    }
    const SKIP_CAND = 'button,[role=button],a,[class*="skip" i],[id*="skip" i]';
    function playerBoxOf(b) {
        let n = b;
        for (let i = 0; n && i < 10; i++, n = n.parentElement) {
            if (n === document.body || n === document.documentElement) break;
            if (n.querySelector && n.querySelector('video')) return n;
        }
        return null;
    }
    function skipBtnTick() {
        if (!set.on || !PLAYER_ADS) return;
        tryQ(() => {
            let n = 0;
            for (const b of document.querySelectorAll(SKIP_CAND)) {
                if (++n > 150) break;
                if (b.children.length > 4 || inHostNode(b)) continue;
                const t = (b.textContent || '').trim();
                if (!t || t.length > 30 || !SKIP_TXT.test(t)) continue;
                const r = b.getBoundingClientRect();
                if (r.width < 8 || r.height < 8) continue;
                const cs = getComputedStyle(b);
                if (cs.visibility === 'hidden' || cs.display === 'none') continue;
                const box = playerBoxOf(b);
                if (box) skipAdIn(box, b);
            }
        });
    }
    function playerAdTick() {
        if (!set.on) { restoreAdPlayers(); return; }
        tryQ(() => document.querySelectorAll(AD_PLAYER).forEach(p => skipAdIn(p)));
        skipBtnTick();
        restoreAdPlayers();
    }
    if (PLAYER_ADS) {
        every(30, playerAdTick, true);
        ['loadedmetadata', 'durationchange', 'playing', 'play'].forEach(t =>
            window.addEventListener(t, e => {
                if (!set.on) return;
                const v = e.target;
                if (!v || v.nodeType !== 1 || v.tagName !== 'VIDEO') return;
                const p = tryQ(() => v.closest(AD_PLAYER), null);
                if (p) skipAdIn(p);
                else skipBtnTick();
            }, true));
    }


    /* ---------- Chặn lớp QC: chặn nguồn video QC theo khoá ở tab Liên kết, ẩn lớp phủ ngay, phim chính tự phát ---------- */
    const QC_SKIP = /^\s*(bỏ qua|skip)(\s+(quảng cáo|qc|ad|ads))?(\s+(sau|in)\s*\d+\s*(s|giây|sec|seconds?)?)?\s*[›»>▶⏭]*\s*$/i;
    const qcLayerOf = new WeakMap(), qcSizes = new WeakMap();
    let qcAt = 0, qcPlayAt = 0, qcClickAt = 0, lastQcTick = 0;

    function qcKeys() { return (set.on && lastRules && Array.isArray(lastRules.qc) && lastRules.qc.length) ? lastRules.qc : null; }
    function qcHit(u) {
        const q = qcKeys();
        if (!q || !u) return false;
        let o;
        try { o = new URL(String(u), location.href); } catch (e) { return false; }
        if (!/^https?:$/.test(o.protocol)) return false;
        const full = o.hostname.toLowerCase() + o.pathname.toLowerCase() + o.search.toLowerCase();
        return q.some(k => full.includes(k));
    }
    function qcSrcOf(m) {
        const a = [m.getAttribute('src'), m.currentSrc];
        tryQ(() => m.querySelectorAll('source[src]').forEach(x => a.push(x.getAttribute('src'))));
        return a.filter(Boolean);
    }
    const qcOther = (n, v) => {
        let o = false;
        tryQ(() => n.querySelectorAll('video,audio,iframe,canvas').forEach(m => { if (m !== v && !v.contains(m)) o = true; }));
        return o;
    };
    /* lớp phủ QC = tổ tiên nhỏ nhất chỉ chứa video QC + nút điều khiển (cùng kích thước, ít chữ, không chứa player khác) */
    function qcClimb(v) {
        let sz = qcSizes.get(v);
        if (!sz) {
            const r = tryQ(() => v.getBoundingClientRect(), null);
            if (r && r.width > 40 && r.height > 40) { sz = { w: r.width, h: r.height }; qcSizes.set(v, sz); }
        }
        let top = v;
        for (let i = 0; i < 4; i++) {
            const p = top.parentElement;
            if (!p || p === document.body || p === document.documentElement || inHostNode(p)) break;
            if (tryQ(() => p.matches(PLAYER_LIB) || !!p.querySelector('input,textarea,select'), true)) break;
            if (qcOther(p, v) || (p.textContent || '').length > 120) break;
            if (sz) {
                const r = tryQ(() => p.getBoundingClientRect(), null);
                if (r && (r.width > sz.w * 1.1 + 8 || r.height > sz.h * 1.1 + 8)) break;
            }
            top = p;
        }
        return top;
    }
    function qcStop(v) {
        tryQ(() => {
            v.muted = true;
            if (!v.paused) v.pause();
            v.querySelectorAll('source').forEach(x => x.removeAttribute('src'));
            v.removeAttribute('src');
            if (v.srcObject) v.srcObject = null;
            v.load();
        });
    }
    function qcEnd(v) {
        [0, 350].forEach(ms => setTimeout(() => tryQ(() => {
            if (!v.isConnected || !v.hasAttribute(QC_ATTR)) return;
            v.dispatchEvent(new Event('timeupdate'));
            v.dispatchEvent(new Event('ended'));
        }), ms));
    }
    function qcMark(v, forced) {
        if (!v || v.nodeType !== 1 || inHostNode(v)) return;
        const fresh = !v.hasAttribute(QC_ATTR);
        qcAt = Date.now();
        if (fresh) v.setAttribute(QC_ATTR, forced ? 'w' : String(qcAt));
        const old = qcLayerOf.get(v);
        if (!old || !old.isConnected) {
            const top = qcClimb(v);
            qcLayerOf.set(v, top);
            if (top !== v) top.setAttribute(QCL_ATTR, '1');
        }
        if (fresh) {
            if (forced) tryQ(() => { v.muted = true; if (!v.paused) v.pause(); });
            else qcStop(v);
            qcEnd(v);
        }
    }
    function qcFree(v) {
        const top = qcLayerOf.get(v);
        qcLayerOf.delete(v);
        tryQ(() => { v.removeAttribute(QC_ATTR); if (top) top.removeAttribute(QCL_ATTR); });
    }
    function qcFindSkip(root) {
        let b = null;
        if (!root) return b;
        for (const sel of ['button,[role=button],a', 'div,span']) {
            let n = 0;
            tryQ(() => {
                for (const e of root.querySelectorAll(sel)) {
                    if (++n > 250) break;
                    if (e.children.length > 3) continue;
                    const t = (e.textContent || '').trim();
                    if (t && t.length <= 30 && QC_SKIP.test(t)) { b = e; break; }
                }
            });
            if (b) break;
        }
        return b;
    }
    function qcSkipRoot(v) {
        const top = qcLayerOf.get(v);
        if (top && top !== v) return top;
        let root = v.parentElement, n = root;
        for (let i = 0; n && i < 3; i++, n = n.parentElement) {
            if (n === document.body || n === document.documentElement || qcOther(n, v)) break;
            root = n;
        }
        return root;
    }
    /* video QC nạp qua hls.js (blob:) không khớp được theo src: nhận diện theo nút "Bỏ qua" khi có request QC bị chặn */
    function qcGeneric() {
        let hit = false, n = 0;
        tryQ(() => {
            for (const b of document.querySelectorAll(SKIP_CAND)) {
                if (++n > 150) break;
                if (b.children.length > 4 || inHostNode(b)) continue;
                const t = (b.textContent || '').trim();
                if (!t || t.length > 30 || !QC_SKIP.test(t)) continue;
                const box = playerBoxOf(b);
                const v = box && box.querySelector('video');
                if (!v || v.hasAttribute(QC_ATTR)) continue;
                const d = v.duration;
                if (d && isFinite(d) && d > 180) continue;
                qcMark(v, true);
                hit = true;
            }
        });
        return hit;
    }
    /* sau khi lớp QC biến mất: phim chính (video lớn nhất) tự phát; bị chặn tiếng thì phát ở chế độ tắt tiếng */
    function qcAutoplay(now) {
        if (now - qcPlayAt < 300) return;
        let best = null, ba = 0;
        document.querySelectorAll('video').forEach(v => {
            if (inHostNode(v) || v.closest(`[${QC_ATTR}],[${QCL_ATTR}]`)) return;
            const r = tryQ(() => v.getBoundingClientRect(), null);
            if (!r || r.width < 160 || r.height < 90) return;
            const a = r.width * r.height;
            if (a > ba) { ba = a; best = v; }
        });
        if (!best || best.__qcOK || (best.__qcN | 0) > 40) return;
        if (!best.paused) { best.__qcOK = 1; return; }
        if (best.ended || !(best.currentSrc || best.getAttribute('src') || best.srcObject)) return;
        qcPlayAt = now;
        best.__qcN = (best.__qcN | 0) + 1;
        tryQ(() => {
            const p = best.play();
            if (p && p.then) p.then(() => { best.__qcOK = 1; }, () => tryQ(() => {
                best.muted = true;
                const p2 = best.play();
                if (p2 && p2.then) p2.then(() => { best.__qcOK = 1; }, () => {});
            }));
        });
    }
    function qcTick() {
        const de = document.documentElement;
        if (!de) return;
        const q = qcKeys();
        if (!q) {
            if (de.querySelector(`[${QC_ATTR}],[${QCL_ATTR}]`)) {
                document.querySelectorAll(`[${QC_ATTR}]`).forEach(qcFree);
                document.querySelectorAll(`[${QCL_ATTR}]`).forEach(e => e.removeAttribute(QCL_ATTR));
            }
            return;
        }
        const now = Date.now();
        const w = +de.getAttribute(QCW_ATTR) || 0;
        if (w > qcAt) qcAt = w;
        let any = !!de.querySelector(`[${QC_ATTR}]`);
        document.querySelectorAll(MEDIA_SEL).forEach(m => {
            if (m.hasAttribute(QC_ATTR) || inHostNode(m)) return;
            if (qcSrcOf(m).some(qcHit)) { qcMark(m, false); any = true; }
        });
        if (!any && qcAt && now - qcAt < 12000 && qcGeneric()) any = true;
        document.querySelectorAll(`[${QC_ATTR}]`).forEach(v => {
            if (!v.isConnected) return;
            const forced = v.getAttribute(QC_ATTR) === 'w';
            if (forced) {
                const d = v.duration;
                if (d && isFinite(d) && d > 180) { qcFree(v); return; }
            } else {
                const ss = qcSrcOf(v);
                if (ss.length && !ss.some(qcHit)) { qcFree(v); return; }
            }
            const top = qcLayerOf.get(v);
            if (top && top !== v && top.isConnected) {
                let other = false;
                tryQ(() => top.querySelectorAll('video,audio,iframe').forEach(m => { if (m !== v && !v.contains(m) && !m.hasAttribute(QC_ATTR)) other = true; }));
                if (other) { top.removeAttribute(QCL_ATTR); qcLayerOf.delete(v); qcMark(v, forced); }
            }
            if (now - qcClickAt > 120) {
                const b = qcFindSkip(qcSkipRoot(v));
                if (b) {
                    qcClickAt = now;
                    synthClick(b);
                    tryQ(() => b.click());
                    if (qcLayerOf.get(v) === v) b.setAttribute(QCL_ATTR, '1');
                }
            }
        });
        if (any || (qcAt && now - qcAt < 20000)) qcAutoplay(now);
    }
    every(30, qcTick, true);
    ['loadstart', 'loadedmetadata', 'play', 'playing', 'emptied'].forEach(t =>
        window.addEventListener(t, e => {
            const v = e.target;
            if (v && v.nodeType === 1 && v.tagName === 'VIDEO' && qcKeys()) qcTick();
        }, true));

    const invQ = new Set(), invStrike = new WeakMap(), invNeg = new WeakMap();

    const alphaZero = c => !c || c === 'transparent' || /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(\.0+)?\s*\)$/.test(c);
    const effOpacity = el => {
        let o = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            const v = parseFloat(getComputedStyle(n).opacity);
            if (!isNaN(v)) o *= v;
            if (o < 0.03) break;
        }
        return o;
    };
    const coverRatio = (el, vw, vh) => {
        const q = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(q.right, vw) - Math.max(q.left, 0));
        const h = Math.max(0, Math.min(q.bottom, vh) - Math.max(q.top, 0));
        return (w * h) / (vw * vh);
    };
    const isOverlayPos = cs => cs.position === 'fixed' || cs.position === 'absolute';
    const plain = cs => alphaZero(cs.backgroundColor) && cs.backgroundImage === 'none';
    const hasContent = el => !!((el.textContent || '').trim() || el.querySelector(MEDIA_IN));

    function invTarget(el) {
        const isFrame = el.tagName === 'IFRAME';
        if (!isFrame && !parseExt(el.getAttribute('href'))) return null;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return null;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return null;
        const [vw, vh] = vpSize();
        if (!vw || !vh) return null;
        if (isFrame) {
            if (ANTI) {
                if (playerFrame(el) || tryQ(() => !!el.closest(PLAYER_LIB), false)) return null;
                const s = el.getAttribute('src');
                if (s && !/^(about|javascript):/i.test(s) && !adSrcBad(s)) return null;
            }
            return (isOverlayPos(cs) && coverRatio(el, vw, vh) >= 0.1 && effOpacity(el) < 0.03) ? el : null;
        }

        if (!isOverlayPos(cs) && coverRatio(el, vw, vh) >= 0.6 && plain(cs) && !hasContent(el)) return el;

        let box = el, bcs = cs;
        for (let i = 0; i < 4 && !isOverlayPos(bcs); i++) {
            box = box.parentElement;
            if (!box || box === document.body || box === document.documentElement) { box = null; break; }
            bcs = getComputedStyle(box);
        }
        if (!box || !isOverlayPos(bcs)) return null;
        const c = coverRatio(box, vw, vh);
        if (c >= 0.25 && effOpacity(el) < 0.03) return el;
        if (c < 0.4 || hasContent(box)) return null;
        return (plain(cs) && plain(bcs)) ? box : null;
    }

    function invCheck(el, now) {
        if (!el || el.nodeType !== 1 || el.hasAttribute(INV_ATTR) || inHostNode(el)) return 'no';
        const t = tryQ(() => invTarget(el), null);
        if (!t) { invStrike.delete(el); return 'no'; }
        if (isPlayerish(t)) { invStrike.delete(el); return 'no'; }
        const fr = el.tagName === 'IFRAME';
        if (!now) {
            const n = (invStrike.get(el) || 0) + 1;
            invStrike.set(el, n);
            if (n < (fr ? 2 : 1)) return 'wait';
        }
        kill(t, true);
        t.setAttribute(INV_ATTR, '');
        return 'hit';
    }

    const collectInv = n => {
        if (n.nodeType !== 1) return;
        if (n.matches(INV_SEL)) invQ.add(n);
        if (n.firstElementChild) n.querySelectorAll(INV_SEL).forEach(x => invQ.add(x));
    };
    const invScan = () => {
        if (!set.on || !document.body || !invQ.size) return;
        let n = 0;
        for (const el of invQ) {
            if (!el.isConnected || el.hasAttribute(INV_ATTR)) { invQ.delete(el); continue; }
            if (++n > 80) break;
            const r = invCheck(el, guardOn());
            if (r === 'hit') invQ.delete(el);
            else if (r === 'no') {
                const c = (invNeg.get(el) || 0) + 1;
                invNeg.set(el, c);
                if (c >= 3) invQ.delete(el);
            }
        }
    };
    const invClear = () => document.querySelectorAll(`[${INV_ATTR}]`).forEach(e => e.removeAttribute(INV_ATTR));

    const GHOST_SKIP = /^(HTML|BODY|INPUT|TEXTAREA|SELECT|VIDEO|AUDIO|CANVAS|DIALOG|IMG|SVG|BUTTON|A|LABEL|MAIN|HEADER|FOOTER|NAV)$/;
    function ghostOverlay(el) {
        if (!el || el.nodeType !== 1 || GHOST_SKIP.test(el.tagName.toUpperCase()) || inHostNode(el) || el.hasAttribute(INV_ATTR)) return null;
        if (ANTI && (isPlayerish(el) || tryQ(() => !!el.closest(PLAYER_LIB), false))) return null;
        const cs = getComputedStyle(el);
        const z = parseInt(cs.zIndex, 10) || 0;
        if (!isOverlayPos(cs) || z < 100) return null;
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return null;
        const [vw, vh] = vpSize();
        if (!vw || !vh || coverRatio(el, vw, vh) < 0.3) return null;
        if (el.closest('dialog[open],[aria-modal=true],[role=dialog],[role=alertdialog]')) return null;
        if (effOpacity(el) >= 0.03) {
            if (z < 1000 || (el.textContent || '').trim() || el.querySelector(MEDIA_IN + ',a,button') || !plain(cs)) return null;
        } else if (el.querySelector('input,select,textarea')) return null;
        return el;
    }
    const ghostSweep = (x, y) => {
        let list = [];
        try { list = document.elementsFromPoint(x, y).slice(0, 8); } catch (err) { return; }
        for (const el of list) {
            const c = el.closest && el.closest(INV_SEL);
            if (c) invCheck(c, true);
            const g = tryQ(() => ghostOverlay(el), null);
            if (g) { kill(g, true); tryQ(() => g.setAttribute(INV_ATTR, '')); }
        }
    };
    window.addEventListener('pointerdown', e => { if (set.on) ghostSweep(e.clientX, e.clientY); }, true);
    window.addEventListener('touchstart', e => {
        const t = e.touches && e.touches[0];
        if (set.on && t) ghostSweep(t.clientX, t.clientY);
    }, { capture: true, passive: true });

    function popupState(el) {
        if (NOT_POPUP_TAG.test(el.tagName) || STOP_ID.test(el.id || '')) return 'no';
        if (ANTI && isPlayerish(el)) return 'no';
        const cs = getComputedStyle(el);
        const dlg = el.tagName === 'DIALOG';
        const role = el.getAttribute('role');
        const isDlg = dlg || role === 'dialog' || role === 'alertdialog' || el.getAttribute('aria-modal') === 'true';
        const z = parseInt(cs.zIndex, 10) || 0, pos = cs.position;
        if (!(pos === 'fixed' || (pos === 'absolute' && z >= 100) || dlg)) return 'no';
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return 'pending';
        const [vw, vh] = vpSize();
        if (!vw || !vh) return 'pending';
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 20) return 'pending';
        const c = coverRatio(el, vw, vh);
        const center = r.left < vw / 2 && r.right > vw / 2 && r.top < vh / 2 && r.bottom > vh / 2;
        const big = c >= 0.2 || (z >= 1000 && c >= 0.12) || (isDlg && c > 0.02) ||
            (center && c >= 0.06 && (z >= 10 || isDlg || pos === 'fixed'));
        if (!big) {
            let loading = false;
            el.querySelectorAll('img').forEach(i => { if (!i.complete) loading = true; });
            return loading ? 'pending' : 'no';
        }
        if (el.querySelector('video,canvas,form,input,textarea,select')) return 'no';
        if ((el.textContent || '').length > 2000) return 'no';
        return 'popup';
    }
    const stateOf = el => tryQ(() => popupState(el), 'no');
    function unlockScroll() {
        requestAnimationFrame(() => {
            [document.documentElement, document.body].forEach(e => {
                if (e && getComputedStyle(e).overflowY === 'hidden') e.style.setProperty('overflow', 'visible', 'important');
            });
        });
    }
    function popSel(el) {
        if (okId(el)) return '#' + cssEsc(el.id);
        const c = classSel(el, 3, true);
        if (!c) return '';
        const s = el.tagName.toLowerCase() + c;
        return tryQ(() => document.querySelectorAll(s).length <= 3 ? s : '', '');
    }
    function popup(el) {
        if (isPlayerish(el)) return;
        const s = popSel(el);
        if (s && !learn.p.includes(s)) {
            learn.p.push(s);
            if (learn.p.length > LEARN_MAX) learn.p.shift();
            learnWrite();
            buildCss();
        }
        kill(el, true);
        unlockScroll();
        if (uiReady) render();
    }

    function wallScan(root) {
        if (!ANTI || !set.on || !set.pop || !document.body) return;
        if (allowed(location.hostname.toLowerCase())) return;
        const list = [];
        if (root && root.nodeType === 1) {
            if (tryQ(() => root.matches(SUSPECT), false)) list.push(root);
            tryQ(() => root.querySelectorAll(SUSPECT).forEach(e => list.push(e)));
        } else tryQ(() => document.querySelectorAll(SUSPECT).forEach(e => list.push(e)));
        let n = 0;
        for (const el of list) {
            if (++n > 150) break;
            if (!el.isConnected || inHostNode(el) || NOT_POPUP_TAG.test(el.tagName) || STOP_ID.test(el.id || '') || el.tagName === 'IFRAME') continue;
            const t = el.textContent || '';
            if (t.length < 12 || t.length > 1500 || !WALL_RE.test(t)) continue;
            const ok = tryQ(() => {
                const cs = getComputedStyle(el);
                if (!isOverlayPos(cs) || cs.display === 'none' || cs.visibility === 'hidden') return false;
                const [vw, vh] = vpSize();
                return !!vw && !!vh && coverRatio(el, vw, vh) >= 0.12;
            }, false);
            if (!ok || isPlayerish(el)) continue;
            popup(el);
        }
    }

    const kick = () => { if (!rafQ) { rafQ = true; requestAnimationFrame(tick); } };
    const release = el => { el.removeAttribute(Q_ATTR); el.setAttribute(OK_ATTR, ''); };
    function freshCheck(el) {
        if (!set.on || !el.isConnected || inHostNode(el)) return;
        if (el.matches(INV_SEL) && invCheck(el, true) === 'hit') return;
        if (!set.pop || !guardOn() || el.hasAttribute(ATTR)) return;
        if (ANTI && isPlayerish(el)) { release(el); return; }
        const st = stateOf(el);
        if (st === 'popup') { watch.delete(el); popup(el); return; }
        if (st === 'pending') {
            el.setAttribute(Q_ATTR, '');
            watch.set(el, Date.now() + DECIDE_MS);
        } else {
            release(el);
            watch.set(el, Date.now() + WATCH_MS);
        }
        kick();
    }
    function tick() {
        rafQ = false;
        if (!guardOn()) { fresh.clear(); watch.clear(); return; }
        let n = 0;
        for (const el of fresh) {
            fresh.delete(el);
            if (++n > 80) break;
            freshCheck(el);
        }
        const now = Date.now();
        let w = 0;
        for (const [el, exp] of watch) {
            if (!el.isConnected || el.hasAttribute(ATTR)) { watch.delete(el); continue; }
            const q = el.hasAttribute(Q_ATTR);
            if (now > exp) { watch.delete(el); if (q) release(el); continue; }
            if (++w > 150) break;
            const st = stateOf(el);
            if (st === 'popup') { watch.delete(el); popup(el); }
            else if (q && st === 'no') { watch.delete(el); release(el); watch.set(el, now + WATCH_MS); }
        }
        if (fresh.size || watch.size) kick();
    }
    const vetSoon = el => {
        if (budget > 0) { budget--; freshCheck(el); }
        else { fresh.add(el); kick(); }
    };
    const overlayish = n => {
        if (budget <= 0 || n.nodeType !== 1 || NOT_POPUP_TAG.test(n.tagName)) return false;
        return tryQ(() => { const cs = getComputedStyle(n); return cs.position === 'fixed' || (cs.position === 'absolute' && (parseInt(cs.zIndex, 10) || 0) >= 100); }, false);
    };
    const watchFresh = n => {
        if (!set.on || !set.pop || !guardOn()) return;
        const b = document.body, de = document.documentElement;
        if ((b && n.parentElement === b) || n.parentElement === de || n.matches(SUSPECT) || overlayish(n)) vetSoon(n);
        if (n.firstElementChild) n.querySelectorAll(SUSPECT).forEach(vetSoon);
    };
    const watchAttr = t => {
        if (!set.on || !set.pop || t.nodeType !== 1 || !guardOn()) return;
        if (t === document.body || t === document.documentElement || inHostNode(t)) return;
        if (tryQ(() => t.matches(SUSPECT), false) || (document.body && t.parentElement === document.body)) vetSoon(t);
    };
    function scanGuard() {
        if (!set.on || !set.pop || !guardOn() || !document.documentElement) return;
        budget = 400;
        purgePop(document.documentElement);
        document.querySelectorAll(SUSPECT).forEach(el => { if (!inHostNode(el)) vetSoon(el); });
        if (document.body) [...document.body.children].forEach(vetSoon);
    }

    const hiddenByUs = m => tryQ(() => m.hasAttribute(MARK) || !!m.closest(`[${ATTR}],[${INV_ATTR}]`) || !!(killSel && m.closest(killSel)), false);
    const killMedia = m => {
        if (!set.on || !m || m.nodeType !== 1 || !hiddenByUs(m)) return;
        /* media thật trong player thì không đụng tới, trừ khi nằm trong phần tử đã bị ẩn */
        if (inPlayer(m) && !tryQ(() => m.closest(`[${ATTR}],[${INV_ATTR}]`), null)) return;
        hush(m);
        if (m.isConnected && !inHostNode(m)) kill(m);
    };
    const killMediaIn = root => { if (set.on && root) eachMatch(root, MEDIA_SEL, killMedia); };
    ['play', 'playing', 'loadedmetadata', 'loadeddata', 'canplay', 'volumechange'].forEach(t =>
        window.addEventListener(t, e => {
            const m = e.target;
            if (m && m.nodeType === 1 && m.matches && m.matches(MEDIA_SEL)) killMedia(m);
        }, true));
    every(MEDIA_SWEEP_MS, () => { if (set.on) killMediaIn(document.documentElement); }, true);

    const STOP_TAG = /^(HTML|BODY|MAIN|HEADER|FOOTER|NAV|ARTICLE|FORM)$/;
    function climb(p, len) {
        if (!set.pop) return p;
        let t = p;
        const lim = len + 60;
        while (t.parentElement) {
            const par = t.parentElement;
            if (par === document.body || par === document.documentElement) break;
            if (STOP_TAG.test(par.tagName) || STOP_ID.test(par.id || '') || par.id === 'gdar-host') break;
            if ((par.textContent || '').trim().length > lim) break;
            if (par.getElementsByTagName('*').length > 40) break;
            if (par.querySelectorAll('img,video,canvas,iframe').length > 4) break;
            t = par;
        }
        return t;
    }

    const hasKey = el => {
        const t = (el.textContent || '').toLowerCase();
        if (keys.some(k => t.includes(k))) return true;
        const as = attrSel();
        return tryQ(() => !!as && (el.matches(as) || !!el.querySelector(as)), false);
    };
    function stableSel(el) {
        const parts = [];
        let n = el;
        for (let d = 0; n && n.nodeType === 1 && d < 6 && n !== document.body && n !== document.documentElement; d++, n = n.parentElement) {
            const p = okId(n) ? '#' + cssEsc(n.id) : n.tagName.toLowerCase() + classSel(n, 2);
            parts.unshift(p);
            if (!/[#.]/.test(parts.join(''))) continue;
            const q = parts.join(' > ');
            try {
                const ms = document.querySelectorAll(q);
                if (ms.length === 1) return q;
                if (ms.length > 1 && ms.length <= 12 && [...ms].every(hasKey)) return q;
            } catch (e) { return ''; }
            if (p[0] === '#') break;
        }
        return '';
    }

    const learned = new WeakSet();
    function learnAdd(el, k) {
        if (!k || !set.on) return;
        const s = stableSel(el);
        if (!s || learn.l.some(x => x.s === s && x.k === k)) return;
        learn.l.push({ s, k });
        if (learn.l.length > LEARN_MAX) learn.l.shift();
        learnWrite();
        buildCss();
        if (uiReady) render();
    }
    function hideText(p, len, k) {
        const t = climb(p, len);
        if (isPlayerish(t)) return t;
        if (!learned.has(t)) { learned.add(t); learnAdd(t, k); }
        kill(t);
        return t;
    }

    const keyIn = v => keys.find(x => v.includes(x));
    const checkText = n => {
        if (!set.on || !keys.length) return;
        const p = n.parentElement;
        if (!p || SKIP_TAG.test(p.tagName)) return;
        const v = (n.nodeValue || '').toLowerCase();
        const k = v && keyIn(v);
        if (k) return hideText(p, v.trim().length, k);
    };
    const checkEl = el => {
        if (!set.on || !keys.length || el.nodeType !== 1 || SKIP_TAG.test(el.tagName) || inHostNode(el)) return null;
        for (const a of ATTRS) {
            const v = (el.getAttribute(a) || '').toLowerCase();
            const k = v && keyIn(v);
            if (k) return hideText(el, v.trim().length, k);
        }
        return null;
    };
    function scan(root) {
        if (!set.on) return;
        if (root.nodeType === 3) { checkText(root); return; }
        if (root.nodeType !== 1) return;
        if (keys.length) {
            const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = w.nextNode())) checkText(n);
            checkEl(root);
            root.querySelectorAll(ATTR_SEL).forEach(checkEl);
        }
        killMediaIn(root);
    }

    function sweep() {
        if (!set.on) {
            document.querySelectorAll(`[${ATTR}]`).forEach(e => e.removeAttribute(ATTR));
            document.querySelectorAll(`[${MARK}]`).forEach(e => e.removeAttribute(MARK));
            invClear();
            linkSweep();
            return;
        }
        const stale = new Set(document.querySelectorAll(`[${ATTR}]`));
        purgeSel(document.documentElement);
        purgeAdSrc(document.documentElement);
        purgeMeta(document.documentElement);
        const root = document.body || document.documentElement;
        if (root && keys.length) {
            const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = w.nextNode())) {
                const t = checkText(n);
                if (t) { stale.delete(t); stale.delete(n.parentElement); }
            }
            document.querySelectorAll(ATTR_SEL).forEach(el => {
                const t = checkEl(el);
                if (t) { stale.delete(t); stale.delete(el); }
            });
        }
        stale.forEach(e => { if (!KEEP.has(e)) e.removeAttribute(ATTR); });
        document.querySelectorAll(INV_SEL).forEach(x => invQ.add(x));
        killMediaIn(document.documentElement);
        linkSweep();
    }

    function applyPick() {
        const de = document.documentElement;
        if (!de) return;
        if (pickOn()) de.setAttribute(PICK_ATTR, '');
        else de.removeAttribute(PICK_ATTR);
        frameDocs.forEach(syncFrameStyle);
    }

    function applyRules() { calcKeys(); buildCss(); ensureStyles(); syncGuard(); applyPick(); sweep(); }

    const TL_SEL = 'dialog,[popover]';
    let promoteQ = false, promoteAt = 0;
    const schedulePromote = () => {
        if (promoteQ) return;
        promoteQ = true;
        Promise.resolve().then(() => {
            promoteQ = false;
            if (Date.now() - promoteAt < 250) return;
            promoteAt = Date.now();
            promote();
        });
    };

    const mo = new MutationObserver(muts => {
        ensureStyles();
        if (!set.on) return;
        budget = 400;
        for (const m of muts) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(n => {
                    if (n.nodeType === 1 && n.id === 'gdar-host') return;
                    if (n.nodeType === 1) {
                        purgeSel(n); purgePop(n); purgeAdSrc(n); purgeMeta(n);
                        if (!n.isConnected) return;
                        neutralizeIn(n);
                        collectInv(n);
                        watchFresh(n);
                        if (n.matches(TL_SEL) || (n.firstElementChild && n.querySelector(TL_SEL))) schedulePromote();
                    }
                    scan(n);
                });
            } else if (m.type === 'characterData') {
                checkText(m.target);
            } else if (m.type === 'attributes') {
                const an = m.attributeName, tg = m.target;
                if ((an === 'href' || an === 'target') && intent && tg === intent.a) restoreIntent();
                if (an === 'href') { neutralize(tg); if (tg.nodeType === 1 && tg.matches(INV_SEL)) invQ.add(tg); }
                else if (an === 'class' || an === 'style' || an === 'hidden' || an === 'open') {
                    if (PLAYER_ADS && an === 'class' && tg.nodeType === 1 && tryQ(() => tg.matches(AD_PLAYER), false)) skipAdIn(tg);
                    if (tg.nodeType === 1 && tg.matches(INV_SEL)) invQ.add(tg);
                    watchAttr(tg);
                    if (an === 'open' && tg.nodeType === 1 && tg.matches(TL_SEL)) schedulePromote();
                } else if (an !== 'target') checkEl(tg);
            }
        }
        if (PLAYER_ADS) {
            const t = Date.now();
            if (t - lastBtnTick > 30) { lastBtnTick = t; skipBtnTick(); }
        }
        if (qcKeys()) {
            const t = Date.now();
            if (t - lastQcTick > 10) { lastQcTick = t; qcTick(); }
        }
        invScan();
    });
    const MO_OPTS = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTRS, 'href', 'target', 'class', 'style', 'hidden', 'open'] };
    let moRoot = null;
    const attachMo = () => {
        const d = document.documentElement;
        if (!d || d === moRoot) return;
        const again = !!moRoot;
        moRoot = d;
        mo.observe(d, MO_OPTS);
        if (again) { calcKeys(); buildCss(); ensureStyles(); sweep(); }
    };
    attachMo();
    applyRules();
    scanGuard();

    const guardKick = () => { if (guardOn()) { scanGuard(); kick(); } };
    window.addEventListener('load', guardKick, true);
    document.addEventListener('readystatechange', guardKick);
    every(INV_SCAN_MS, invScan, true);
    every(250, () => { ensureStyles(); attachMo(); });
    every(500, () => wallScan(null));
    document.addEventListener('DOMContentLoaded', () => { ensureStyles(); sweep(); invScan(); scanGuard(); }, { once: true });
    window.addEventListener('load', () => { sweep(); setTimeout(sweep, 500); setTimeout(sweep, 2000); }, { once: true });
    window.addEventListener('pageshow', e => { if (e.persisted) { ensureStyles(); sweep(); } });

    const syncFromStore = async () => {
        if (writing) return;
        const g0 = wgen;
        const [s, gRaw, stRaw, lrRaw] = await Promise.all([
            gReadRaw('settings'), gRead('global', DEF_RULES()), gRead(siteKey, DEF_RULES()), gRead(learnKey, DEF_LEARN())
        ]);
        const g = normRules(gRaw), st = normRules(stRaw), lr = normLearn(lrRaw);

        let migrated = false;
        const legacy = GMOK ? lsGet(LEGACY_SITE_KEY) : null;
        if (legacy) {
            const l = normRules(legacy);
            ['sel', 'txt'].forEach(k => l[k].forEach(v => { if (!st[k].includes(v)) { st[k].push(v); migrated = true; } }));
            try { localStorage.removeItem(LEGACY_SITE_KEY); } catch (e) {}
        }

        if (writing || wgen !== g0) return;
        const before = JSON.stringify([set, glb, site, learn]);
        let pushSet = false, pushG = false, pushS = false;
        if (s && (s._t || 0) >= (set._t || 0)) set = normSet(s);
        else if (set._t) pushSet = true;
        if (ts(g) >= ts(glb)) glb = g; else pushG = true;
        if (migrated || ts(st) >= ts(site)) site = st; else pushS = true;
        lr.l.forEach(x => { if (!learn.l.some(y => y.s === x.s && y.k === x.k)) learn.l.push(x); });
        learn.l = learn.l.slice(-LEARN_MAX);
        lr.p.forEach(x => { if (!learn.p.includes(x)) learn.p.push(x); });
        learn.p = learn.p.slice(-LEARN_MAX);
        if (migrated) siteWrite(); else writeCache();
        if (pushSet) gWrite('settings', set);
        if (pushG) gWrite('global', glb);
        if (pushS) siteWrite();
        if (JSON.stringify([set, glb, site, learn]) !== before) applyRules();
        if (uiReady) render();
    };
    const storeP = migrateLegacy().catch(() => {}).then(syncFromStore).catch(() => {});

    const MY_ID = IS_FRAME ? 'f' + Math.random().toString(36).slice(2) + Date.now().toString(36) : '';
    const PK = { list: [], idx: 0, el: null, info: null, owner: MY_ID };
    const routes = Object.create(null);
    let showPick = () => {};
    let stopPress = () => {};

    const postUp = o => {
        tryQ(() => window.parent.postMessage(Object.assign({ [MSG]: 1 }, o), '*'));
        /* khung lồng nhiều tầng: gửi thêm thẳng lên trang gốc phòng khi khung giữa không chạy script */
        if (o && o.t === 'pick') tryQ(() => { if (window.parent !== window.top) window.top.postMessage(Object.assign({ [MSG]: 1, direct: 1 }, o), '*'); });
    };
    const aliveWins = new WeakSet(), firstSeen = new WeakMap();
    const sendCmd = (id, cmd) => { const w = routes[id]; if (w) tryQ(() => w.postMessage({ [MSG]: 1, t: 'cmd', id, cmd }, '*')); };
    const deepTarget = e => tryQ(() => { const p = e.composedPath(); return (p && p[0] && p[0].nodeType === 1) ? p[0] : e.target; }, e.target);

    function findFrame(win, root) {
        let r = null;
        tryQ(() => {
            for (const f of root.querySelectorAll('iframe,frame')) if (f.contentWindow === win) return void (r = f);
            for (const e of root.querySelectorAll('*')) {
                if (e.shadowRoot) { r = findFrame(win, e.shadowRoot); if (r) return; }
            }
        });
        return r;
    }
    const frameOffset = fr => { const r = fr.getBoundingClientRect(); return { x: r.left + (fr.clientLeft || 0), y: r.top + (fr.clientTop || 0) }; };

    const absRect = el => {
        const r = el.getBoundingClientRect();
        let x = r.left, y = r.top;
        let w = tryQ(() => el.ownerDocument.defaultView, null);
        for (let i = 0; i < 4 && w && w !== window; i++) {
            const fe = tryQ(() => w.frameElement, null);
            if (!fe) break;
            const o = frameOffset(fe);
            x += o.x; y += o.y;
            w = tryQ(() => fe.ownerDocument.defaultView, null);
        }
        return { left: x, top: y, width: r.width, height: r.height };
    };

    function selOf(el) {
        const D = el.ownerDocument || document;
        const path = [];
        let n = el;
        while (n && n.nodeType === 1 && n !== D.documentElement) {
            let p;
            if (n.id) p = '#' + cssEsc(n.id);
            else {
                p = n.tagName.toLowerCase();
                clsOf(n).split(' ').filter(c => c && !/^gdar/.test(c)).slice(0, 2).forEach(c => { p += '.' + cssEsc(c); });
                const par = n.parentElement;
                if (par) {
                    const sm = [...par.children].filter(x => x.tagName === n.tagName);
                    if (sm.length > 1) p += `:nth-of-type(${sm.indexOf(n) + 1})`;
                }
            }
            path.unshift(p);
            const q = path.join(' > ');
            try { if (D.querySelectorAll(q).length === 1) return q; } catch (e) {}
            if (n.id) break;
            n = n.parentElement;
        }
        return path.join(' > ');
    }

    function collectInfo(el) {
        let host = el, shadow = false;
        for (let g = 0; g < 8; g++) {
            const rt = host.getRootNode && host.getRootNode();
            if (rt && rt.host) { host = rt.host; shadow = true; } else break;
        }
        const link = el.closest ? el.closest('a[href]') : null;
        const hrefV = (link && link.getAttribute('href')) || '';
        const srcEl = el.matches('img,video,iframe,source,audio,embed') ? el : el.querySelector('img,video,iframe,source');
        const info = {
            tag: el.tagName.toLowerCase(), id: el.id || '', cls: clsOf(el), name: el.getAttribute('name') || '',
            sel: selOf(host), href: hrefV,
            src: (srcEl && (srcEl.currentSrc || srcEl.getAttribute('src'))) || '',
            hideSel: '', host: location.hostname, shadow: shadow ? host.tagName.toLowerCase() : ''
        };
        const ho = parseExt(hrefV), so = parseExt(info.src);
        if (link && ho) info.hideSel = `a[href*="${attrEsc(ho.hostname)}" i]`;
        if (!info.hideSel && so && info.tag === 'iframe') info.hideSel = `iframe[src*="${attrEsc(so.hostname)}" i]`;
        if (!info.hideSel && so && info.tag === 'img') info.hideSel = `img[src*="${attrEsc(so.hostname)}" i]`;
        /* tên miền có thể chặn ở tab Liên kết (link hoặc nguồn tải) */
        const bo = ho || so;
        info.blkHost = bo ? hostKey(bo.hostname) : '';
        /* khoá "Chặn lớp QC": chỉ cho video / audio / khung nhúng có nguồn http(s) */
        info.qcKey = (srcEl && /^(VIDEO|AUDIO|SOURCE|IFRAME)$/.test(srcEl.tagName) && info.src) ? qcKeyOf(info.src) : '';
        return info;
    }

    function layersAt(x, y, first) {
        const doc = (first && first.ownerDocument) || document;
        const out = [];
        const add = el => { if (el && el.nodeType === 1 && !NOT_PICK.test(el.tagName) && !inHostNode(el) && !out.includes(el)) out.push(el); };
        const addDeep = el => {
            if (el.shadowRoot) tryQ(() => el.shadowRoot.elementsFromPoint(x, y).forEach(addDeep));
            add(el);
        };
        add(first);
        tryQ(() => doc.elementsFromPoint(x, y).forEach(addDeep));
        const ghosts = [];
        tryQ(() => {
            const all = doc.body ? doc.body.querySelectorAll('*') : [];
            let n = 0;
            for (const el of all) {
                if (++n > 5000) break;
                if (out.includes(el) || NOT_PICK.test(el.tagName) || SKIP_TAG.test(el.tagName)) continue;
                const r = el.getBoundingClientRect();
                if (r.width < 8 || r.height < 8 || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
                const cs = (doc.defaultView || window).getComputedStyle(el);
                if (cs.pointerEvents === 'none' && cs.visibility !== 'hidden' && cs.display !== 'none') ghosts.push([r.width * r.height, el]);
            }
        });
        ghosts.sort((a, b) => a[0] - b[0]).forEach(g => add(g[1]));
        return out;
    }

    function emitPick(info, r) {
        if (!IS_FRAME) showPick(info, r, '');
        else postUp({ t: 'pick', id: PK.owner, info, rect: r });
    }
    function pickEmit() {
        const el = PK.el;
        if (!el || !el.isConnected) return;
        const info = tryQ(() => collectInfo(el), null);
        if (!info) return;
        PK.info = info;
        emitPick(info, absRect(el));
    }
    function pickStart(x, y, target) {
        PK.owner = MY_ID;
        PK.list = layersAt(x, y, target);
        PK.idx = 0;
        PK.el = PK.list[0] || null;
        pickEmit();
    }
    function takeOver(fr, id) {
        PK.owner = IS_FRAME ? id : MY_ID;
        PK.list = [fr]; PK.idx = 0; PK.el = fr;
        pickEmit();
    }
    /* lưu khoá "Chặn lớp QC" vào tab Liên kết (mục mới nhất nằm cuối) */
    function qcSave(k) {
        if (!k) return;
        const ix = site.lnk.indexOf(k);
        if (ix >= 0) site.lnk.splice(ix, 1);
        site.lnk.push(k);
        siteWrite();
        applyRules();
        qcTick();
        if (uiReady) render();
    }
    function handlePickCmd(c) {
        const el = PK.el;
        if (!el) return;
        if (c === 'up') {
            let p = el.parentElement;
            if (!p) { const rt = el.getRootNode && el.getRootNode(); p = (rt && rt.host) || null; }
            if (p && !NOT_PICK.test(p.tagName)) { PK.el = p; pickEmit(); }
            else {
                const fe = el.ownerDocument !== document ? tryQ(() => el.ownerDocument.defaultView.frameElement, null) : null;
                if (fe) { PK.el = fe; pickEmit(); }
                else if (IS_FRAME) postUp({ t: 'upframe', id: PK.owner });
            }
        } else if (c === 'under') {
            const i = PK.list.indexOf(PK.el);
            const n = (i < 0 ? PK.idx : i) + 1;
            if (n < PK.list.length) { PK.idx = n; PK.el = PK.list[n]; pickEmit(); }
        } else if (c === 'hide' && PK.info) {
            const i = PK.info;
            /* mục mới nhất luôn nằm cuối danh sách */
            [i.sel, i.hideSel].forEach(s => {
                if (!s) return;
                const ix = site.sel.indexOf(s);
                if (ix >= 0) site.sel.splice(ix, 1);
                site.sel.push(s);
            });
            siteWrite();
            applyRules();
            if (uiReady) render();
        } else if (c === 'qc' && PK.info && PK.info.qcKey) {
            qcSave(PK.info.qcKey);
        } else if (c === 'blk' && PK.info && PK.info.blkHost) {
            const ix = site.lnk.indexOf(PK.info.blkHost);
            if (ix >= 0) site.lnk.splice(ix, 1);
            site.lnk.push(PK.info.blkHost);
            siteWrite();
            applyRules();
            if (uiReady) render();
        }
    }

    async function storedSites(only) {
        const out = {};
        try {
            const ks = await gmList();
            for (const k of ks) {
                if (typeof k !== 'string' || !k.startsWith(SITE_PREFIX)) continue;
                const b = siteBase(k.slice(SITE_PREFIX.length));
                if (!b || b === BASE || (only && !only.has(b))) continue;
                const r = normRules(await gRead(k, DEF_RULES()));
                if (!out[b]) out[b] = DEF_RULES();
                mergeRules(out[b], r);
            }
        } catch (e) {}
        return out;
    }
    async function loadFrameHost(h) {
        const b = siteBase(h);
        if (!b || b === BASE) return;
        const all = await storedSites(new Set([b]));
        if (all[b] && count(all[b])) frameRules[b] = all[b]; else delete frameRules[b];
        if (uiReady) render();
    }
    async function scanFrameRules() {
        const known = new Set();
        pickedHosts.forEach(h => { const b = siteBase(h); if (b) known.add(b); });
        document.querySelectorAll('iframe[src]').forEach(f => { const b = siteBase(hostOf(f.src)); if (b) known.add(b); });
        const all = await storedSites(known);
        Object.keys(all).forEach(h => { if (count(all[h])) frameRules[h] = all[h]; else delete frameRules[h]; });
    }

    function scanFrames(root, depth) {
        if (depth > 3) return;
        tryQ(() => root.querySelectorAll('iframe,frame').forEach(f => {
            let doc = null;
            try { doc = f.contentDocument; } catch (e) {}
            if (!doc || !doc.documentElement) return;
            const win = tryQ(() => doc.defaultView, null);
            if (!win) return;
            /* khung đã có script riêng thì để nó tự xử lý; nếu 3s không thấy nó báo "còn sống" thì trang cha tự nối sự kiện giúp */
            if (doc.documentElement.hasAttribute(LNK_ATTR) && !aliveWins.has(win)) {
                const t0 = firstSeen.get(win) || Date.now();
                firstSeen.set(win, t0);
                if (Date.now() - t0 < 3000) return;
            } else if (aliveWins.has(win)) return;
            frameDocs.add(doc);
            wireFrame(win);
            syncFrameStyle(doc);
            scanFrames(doc, depth + 1);
        }));
    }
    function pruneFrames() {
        frameDocs.forEach(d => { if (!tryQ(() => d.defaultView && d.defaultView.frameElement && d.defaultView.frameElement.isConnected, false)) frameDocs.delete(d); });
    }

    function initPicker() {
        let pressTimer = null, pressing = false, blockUntil = 0, sx = 0, sy = 0, pTarget = null, wdT = null, pWin = window;
        let calloutSaved = [];
        const wireCache = new WeakMap();
        const isBlocked = () => pressing || Date.now() < blockUntil;
        const clearSelIn = w => tryQ(() => w.getSelection().removeAllRanges());
        const clearSel = () => clearSelIn(pWin);
        const setPress = on => tryQ(() => {
            const de = pWin.document.documentElement;
            if (on) de.setAttribute(PRESS_ATTR, '');
            else { de.removeAttribute(PRESS_ATTR); de.removeAttribute(PICKED_ATTR); }
        });
        const calloutOff = el => {
            let n = el;
            for (let i = 0; n && n.nodeType === 1 && i < 3; i++, n = n.parentElement) {
                const node = n;
                tryQ(() => {
                    calloutSaved.push([node, node.style.getPropertyValue('-webkit-touch-callout'), node.style.getPropertyPriority('-webkit-touch-callout')]);
                    node.style.setProperty('-webkit-touch-callout', 'none', 'important');
                });
            }
        };
        const calloutRestore = () => {
            calloutSaved.forEach(([n, v, p]) => tryQ(() => {
                if (v) n.style.setProperty('-webkit-touch-callout', v, p);
                else n.style.removeProperty('-webkit-touch-callout');
            }));
            calloutSaved = [];
        };
        stopPress = function () {
            clearTimeout(pressTimer); clearTimeout(wdT);
            pressTimer = null; pressing = false; blockUntil = 0;
            setPress(false);
            calloutRestore();
        };

        /* true nếu điểm chạm nằm đúng trên chữ có thể chọn (không phải link/nút/ảnh/ô nhập đã xử lý riêng) */
        const overText = (win, x, y, t) => {
            try {
                const doc = win.document;
                /* chạm lên vùng video / player (kể cả có lớp chữ trong suốt phủ lên) -> luôn là chọn phần tử, không nhường cho chọn chữ */
                for (const v of doc.querySelectorAll('video')) {
                    const vr = v.getBoundingClientRect();
                    if (vr.width > 40 && vr.height > 40 && x >= vr.left && x <= vr.right && y >= vr.top && y <= vr.bottom) return false;
                }
                if (t.closest && t.closest(PLAYER_CTX)) return false;
                if (t.closest && t.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"]')) return true;
                if (t.closest && t.closest('a[href],button,[role=button],summary,img,video,audio,canvas,svg,picture,iframe,object,embed')) return false;
                let node = null;
                if (doc.caretPositionFromPoint) { const cp = doc.caretPositionFromPoint(x, y); node = cp && cp.offsetNode; }
                else if (doc.caretRangeFromPoint) { const cr = doc.caretRangeFromPoint(x, y); node = cr && cr.startContainer; }
                if (!node || node.nodeType !== 3 || !(node.nodeValue || '').trim()) return false;
                const par = node.parentElement;
                if (!par) return false;
                const cs = win.getComputedStyle(par);
                if ((cs.userSelect || cs.webkitUserSelect) === 'none') return false;
                /* chữ ẩn / trong suốt / bị phần tử khác che thì không phải chữ người dùng thấy */
                if (cs.visibility === 'hidden' || cs.display === 'none' || alphaZero(cs.color) || alphaZero(cs.webkitTextFillColor) || effOpacity(par) < 0.1) return false;
                if (t !== par && !par.contains(t) && !t.contains(par)) return false;
                const rg = doc.createRange();
                rg.selectNodeContents(node);
                for (const q of rg.getClientRects()) {
                    if (x >= q.left - 2 && x <= q.right + 2 && y >= q.top - 2 && y <= q.bottom + 2) return true;
                }
            } catch (err) {}
            return false;
        };

        const wire = win => {
            let h = wireCache.get(win);
            if (!h) {
                const upPress = () => {
                    const fired = pressTimer === null && pressing && Date.now() < blockUntil;
                    clearTimeout(pressTimer); clearTimeout(wdT); pressTimer = null;
                    if (fired) {
                        blockUntil = Date.now() + 500;
                        clearSel();
                        setTimeout(() => { setPress(false); calloutRestore(); }, 700);
                    } else { setPress(false); calloutRestore(); }
                    pressing = false;
                };
                const on = [];
                const add = (t, f, o) => on.push([t, f, o === undefined ? true : o]);

                add('pointerdown', e => {
                    if (!pickOn() || !e.isPrimary) return;
                    if (e.pointerType === 'mouse' && e.button !== 0) return;
                    pTarget = deepTarget(e);
                    if (!pTarget || pTarget.nodeType !== 1 || inHostNode(pTarget)) return;
                    /* nhấn giữ vào chữ thường -> để trình duyệt tự chọn/copy văn bản, không giành quyền */
                    if (overText(win, e.clientX, e.clientY, pTarget)) { stopPress(); return; }
                    pWin = win;
                    sx = e.clientX; sy = e.clientY;
                    pressing = true;
                    setPress(true);
                    calloutRestore();
                    calloutOff(pTarget);
                    clearTimeout(pressTimer);
                    clearTimeout(wdT);
                    pressTimer = setTimeout(() => {
                        pressTimer = null;
                        if (!pickOn()) { stopPress(); return; }
                        blockUntil = Date.now() + 900;
                        clearSel();
                        tryQ(() => pWin.document.documentElement.setAttribute(PICKED_ATTR, ''));
                        if (pTarget && pTarget.isConnected) pickStart(sx, sy, pTarget);
                    }, PICK_MS);
                });
                add('pointermove', e => {
                    if (!pressTimer) return;
                    if (Math.abs(e.clientX - sx) > MOVE_TOL || Math.abs(e.clientY - sy) > MOVE_TOL) stopPress();
                });
                add('touchmove', e => {
                    if (!pressTimer) return;
                    const t = e.touches && e.touches[0];
                    if (t && (Math.abs(t.clientX - sx) > MOVE_TOL || Math.abs(t.clientY - sy) > MOVE_TOL)) stopPress();
                }, { capture: true, passive: true });
                add('pointerup', upPress);
                add('touchend', () => { if (pressing) upPress(); });
                add('touchcancel', () => { if (pressing) upPress(); });
                add('pointercancel', () => {
                    if (!pressing) return;
                    if (pressTimer) return;
                    blockUntil = Date.now() + 1200;
                    clearSel();
                    clearTimeout(wdT);
                    wdT = setTimeout(() => { if (pressing) upPress(); }, 1500);
                });
                add('scroll', () => { if (pressTimer) stopPress(); });
                ['click', 'auxclick', 'dblclick', 'contextmenu', 'selectstart', 'dragstart'].forEach(t =>
                    add(t, e => {
                        if (!pickOn()) return;
                        const needBlock = (t === 'selectstart' || t === 'dragstart' || t === 'contextmenu') ? isBlocked() : Date.now() < blockUntil;
                        if (needBlock) { e.preventDefault(); e.stopImmediatePropagation(); }
                    }));
                add('touchend', e => {
                    if (pickOn() && Date.now() < blockUntil && e.cancelable) e.preventDefault();
                }, { capture: true, passive: false });

                h = { on, onSel: () => { if (pickOn() && isBlocked()) clearSelIn(win); } };
                wireCache.set(win, h);
            }
            h.on.forEach(([t, f, o]) => tryQ(() => win.addEventListener(t, f, o)));
            tryQ(() => win.document.addEventListener('selectionchange', h.onSel));
        };

        wire(window);
        wireFrame = wire;

        if (IS_FRAME) { const hi = () => postUp({ t: 'hi' }); hi(); setInterval(hi, 1500); }

        window.addEventListener('message', ev => {
            const d = ev.data;
            if (!d || typeof d !== 'object' || d[MSG] !== 1 || ev.source === window) return;
            if (d.t === 'hi') { if (ev.source) aliveWins.add(ev.source); return; }
            if (d.t === 'pick' && d.direct) {
                if (IS_FRAME) return;
                const src = ev.source;
                setTimeout(() => {
                    if (routes[d.id]) return;
                    let w = src, fr = null;
                    for (let i = 0; w && i < 12; i++) {
                        const par = tryQ(() => w.parent, null);
                        if (par === window) { fr = findFrame(w, document); break; }
                        if (!par || par === w) break;
                        w = par;
                    }
                    if (!fr) return;
                    routes[d.id] = src;
                    const o = frameOffset(fr);
                    const rect = { left: o.x, top: o.y, width: fr.clientWidth, height: fr.clientHeight };
                    if (d.info && d.info.host) pickedHosts.add(d.info.host);
                    showPick(d.info, rect, d.id);
                }, 300);
                return;
            }
            if (d.t === 'pick' || d.t === 'upframe') {
                const fr = findFrame(ev.source, document);
                if (!fr) return;
                if (d.t === 'upframe') { takeOver(fr, d.id); return; }
                routes[d.id] = ev.source;
                if (PK.owner === d.id) PK.owner = '';
                const o = frameOffset(fr), r = d.rect || { left: 0, top: 0, width: 0, height: 0 };
                const rect = { left: r.left + o.x, top: r.top + o.y, width: r.width, height: r.height };
                if (IS_FRAME) postUp({ t: 'pick', id: d.id, info: d.info, rect });
                else { if (d.info && d.info.host) pickedHosts.add(d.info.host); showPick(d.info, rect, d.id); }
            } else if (d.t === 'cmd') {
                if (d.id === PK.owner) handlePickCmd(d.cmd);
                else if (routes[d.id]) tryQ(() => routes[d.id].postMessage(d, '*'));
            }
        });

        scanFrames(document, 0);
        setInterval(() => { if (document.hidden) return; pruneFrames(); scanFrames(document, 0); }, 800);
    }

    function initUI() {
        if (document.getElementById('gdar-host') || !document.documentElement) return;

        loadFont();
        loadSerif();

        const TL = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';
        const toTop = el => {
            if (!TL || !el || !el.isConnected) return;
            tryQ(() => el.hidePopover());
            tryQ(() => el.showPopover());
        };
        const hideLater = el => {
            if (!TL) return;
            setTimeout(() => { if (!el.classList.contains('show')) tryQ(() => el.hidePopover()); }, 500);
        };
        const reveal = (el, cb) => {
            toTop(el);
            void el.offsetWidth;
            requestAnimationFrame(() => { el.classList.add('show'); if (cb) cb(); });
        };
        function syncBusy() {
            uiBusy = !!((built && (ov.classList.contains('show') || ov2.classList.contains('show'))) || obEl || wlEl);
        }

        const ICONS = {
            x: '<path d="M6 6l12 12M18 6L6 18"/>',
            plus: '<path d="M12 5v14M5 12h14"/>',
            copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H16"/>',
            check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
            swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
            list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
            eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
            up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
            layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
            chev: '<path d="M9 6l6 6-6 6"/>',
            shield: '<path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
            bookmark: '<path d="M6 4h12v17l-6-4-6 4z"/>'
        };
        const ic = (n, s = 16) =>
            `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:none">${ICONS[n]}</svg>`;
        const fic = (d, s) =>
            `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true" style="display:block;flex:none">${d}</svg>`;

        const ready = ms => new Promise(res => {
            const go0 = () => setTimeout(() => {
                if (!document.hidden) return res();
                const f = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', f); res(); } };
                document.addEventListener('visibilitychange', f);
            }, ms);
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go0, { once: true });
            else go0();
        });

        const host = document.createElement('div');
        hostEl = host;
        host.id = 'gdar-host';
        host.style.cssText = 'display:block!important;position:static!important;width:0!important;height:0!important;' +
            'margin:0!important;padding:0!important;border:0!important;opacity:1!important;visibility:visible!important;' +
            'transform:none!important;filter:none!important;overflow:visible!important;';
        const root = host.attachShadow({ mode: 'open' });
        const SIDE = DOT_SIDE === 'left' ? 'left' : 'right';

        root.innerHTML = `
    <style>
:host{all:initial;--ne:#1fff6a;--nr:31,255,106;--ac:#34d36b;--ar:52,211,107;--ink:#04230f;--fg:#f5f5f7;--gy:#8b8b93;--gy2:#C7C7CB;--bad:#f87171;--w06:rgba(255,255,255,.06);--w08:rgba(255,255,255,.08);--w12:rgba(255,255,255,.12);--t42:rgba(255,255,255,.42);--t45:rgba(255,255,255,.45);--t55:rgba(255,255,255,.55);--sheet:#1c1c1e;--grab:rgba(255,255,255,.28);--cl:rgba(255,255,255,.75);--tabbg:rgba(255,255,255,.07);--tabact:rgba(255,255,255,.14);--ph:rgba(255,255,255,.28);--stbg:rgba(var(--nr),.14);--R:32px;--r:10px;--fc:rgba(var(--ar),.7);--glow:0 0 5px 1px rgba(var(--nr),.85);--ff:'Plus Jakarta Sans',-apple-system,system-ui,'Segoe UI',Roboto,sans-serif;font-family:var(--ff);color:var(--fg);-webkit-tap-highlight-color:transparent}
*,*::before,*::after{box-sizing:border-box;margin:0;letter-spacing:normal;text-transform:none;line-height:1.3;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
button{font:inherit;font-size:15px;color:inherit;border:0;background:none;padding:0;cursor:pointer;-webkit-appearance:none;appearance:none;-webkit-tap-highlight-color:transparent;text-align:center}
label{display:flex;-webkit-tap-highlight-color:transparent}
.g-dot{position:fixed;inset:auto;${SIDE}:${DOT_X}px;bottom:${DOT_Y}px;margin:0;padding:0;border:0;overflow:visible;width:6px;height:6px;border-radius:50%;background:var(--ne);box-shadow:0 0 5px 2px rgba(var(--nr),.8);z-index:2147483646;touch-action:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;will-change:opacity,transform;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0);animation:gdarBlink 3.4s cubic-bezier(.45,0,.55,1) infinite;transition:transform .25s ease}
.g-dot::backdrop{display:none}
.g-dot::before{content:"";position:absolute;inset:-16px}
.g-dot.off{background:var(--gy);box-shadow:none;animation:none;opacity:.55}
.g-dot.hold{background:linear-gradient(180deg,#F20021 0%,#FF404D 100%);box-shadow:0 0 12px #F8132C,inset 0 .5px .2px #ED5967;animation:none;opacity:1;transform:scale(1.5) translateZ(0)}
.g-dot.ob-ping::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid var(--ne);pointer-events:none;will-change:transform,opacity;animation:obPing 1.2s ease-out 3}
@keyframes gdarBlink{0%,100%{opacity:.55;transform:scale(.92) translateZ(0)}
50%{opacity:1;transform:scale(1.12) translateZ(0)}}
@keyframes obPing{0%{transform:scale(1);opacity:.9}100%{transform:scale(6);opacity:0}}
.g-hl{position:fixed;display:none;pointer-events:none;z-index:2147483645;border:2px solid var(--ne);border-radius:3px;background:rgba(var(--nr),.12);box-shadow:0 0 0 1px rgba(0,0,0,.35)}
    </style>
    <div class="g-dot" popover="manual"></div>
    <div class="g-hl"></div>`;

        const applyColor = () => {
            const c = set.rnd ? COLOR_RANDOM : COLOR_GREEN, st = host.style;
            st.setProperty('--ne', c.hex);
            st.setProperty('--nr', c.rgb);
            st.setProperty('--ac', c.ac);
            st.setProperty('--ar', c.acRgb);
            st.setProperty('--ink', c.ink);
        };
        applyColor();
        document.documentElement.appendChild(host);

        const $ = id => root.querySelector('#' + id);
        const dot = root.querySelector('.g-dot');
        const hl = root.querySelector('.g-hl');
        dotEl = dot;
        toTop(dot);
        let built = false;
        let ov, ov2, kindBtns, ctl1, ctl2;
        let obEl = null, wlEl = null;

        promote = () => {
            if (!TL) return;
            toTop(dot);
            [built && ov, built && ov2, obEl, wlEl].forEach(e => { if (e && e.isConnected && e.classList.contains('show')) toTop(e); });
        };

        every(1000, () => {
            if (!dot.isConnected) return;
            const r = dot.getBoundingClientRect();
            if (!r.width) return;
            const t = tryQ(() => document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2), null);
            if (!t || t === host) return;
            if (TL) promote();
            else { const c = t.closest && t.closest(INV_SEL); if (c) invCheck(c, true); }
        });

        const PH = { sel: 'smartbanner hoặc .banner, #popup', txt: 'Quảng cáo, tải ứng dụng', lnk: 'Dán URL quảng cáo, tinyurl, bet hoặc appname://' };
        const PH_BULK = {
            sel: 'Mỗi mục cách nhau bằng ; hoặc xuống dòng',
            txt: 'Mỗi từ khoá cách nhau bằng ; hoặc xuống dòng',
            lnk: 'Dán một hoặc nhiều URL / tên miền, cách nhau bằng xuống dòng, ; hoặc dấu cách'
        };

        async function copyText(text) {
            try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
            try {
                const t = document.createElement('textarea');
                t.value = text;
                t.setAttribute('readonly', '');
                t.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
                document.documentElement.appendChild(t);
                t.focus(); t.select(); t.setSelectionRange(0, text.length);
                const ok = document.execCommand('copy');
                t.remove();
                return ok;
            } catch (e) { return false; }
        }
        const flash = (b, ok, idleHTML) => {
            b.innerHTML = (ok ? ic('check', 14) : ic('x', 14)) + `<span>${ok ? 'Đã chép' : 'Lỗi'}</span>`;
            b.classList.toggle('ok', ok);
            setTimeout(() => { b.innerHTML = idleHTML; b.classList.remove('ok'); }, 1200);
        };

        let renderSheet = () => {}, closeInfo = () => {}, showInfoImpl = () => {};

        const ROWS_A = [
            ['g-on', 'on', 'Chặn quảng cáo', 'Xoá quảng cáo, tắt tiếng, chặn link ẩn'],
            ['g-auto', 'auto', 'Tự động chặn', 'Ẩn ads, popup, banner, float'],
            ['g-pop', 'pop', 'Popup, tab lạ &amp; khung chứa', 'Chặn lớp phủ, tab tự mở, ẩn cả khung &amp; viền nút'],
            ['g-links', 'links', 'Chặn chuyển hướng ngoài', '', 'g-lnk-s']
        ];
        const ROW_PICK = ['g-pick', 'pick', 'Nhấn giữ xem phần tử',
            `Giữ ${(PICK_MS / 1000).toFixed(2).replace(/0$/, '').replace('.', ',')}s để xem phần tử`];
        const ROW_RND = ['g-rnd', 'rnd', 'Màu chấm ngẫu nhiên', 'Không liên quan, nhưng thêm vô cho đẹp •ᴗ•'];
        const SW_KEYS = [...ROWS_A, ROW_PICK, ROW_RND].map(r => [r[0], r[1]]);

        function mkSwitch(id, horiz, onTxt, offTxt) {
            const mk = (tag, cls, txt) => {
                const e = document.createElement(tag);
                if (cls) e.className = cls;
                if (txt) e.textContent = txt;
                return e;
            };
            const wrap = mk('div', 'g-sw' + (horiz ? ' h' : ''));
            const input = mk('input');
            input.type = 'checkbox';
            input.id = id;
            wrap.append(input, mk('div', 'on', onTxt || 'Bật'), mk('div', 'off', offTxt || 'Tắt'), mk('span'));
            return wrap;
        }

        const EASE_OPEN = 'cubic-bezier(.16,1,.3,1)', EASE_CLOSE = 'cubic-bezier(.32,.72,0,1)';
        const EASE_SHRINK = 'cubic-bezier(.5,0,.2,1)';
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        const lerp = (a, b, k) => a + (b - a) * k;
        const RAD = 28, DOTW = 6;
        const reduced = () => tryQ(() => matchMedia('(prefers-reduced-motion: reduce)').matches, false);

        function mkSheet(el, o) {
            const q = s => el.querySelector(s);
            const sh = q('.g-sheet'), bd = q('.g-bd'), fill = q('.g-fill'), glass = q('.g-glass'), rim = q('.g-rim'), sc = q('.g-scroll'), grab = q('.g-grab');
            const layers = [glass, fill, rim];
            let Sx = 1, Sy = 1, X = 0, Y = 0, B = 0, p = 0, H = 0, M = null, RR = '', CO = 1, LF = 1;
            let anim = null, kids = [], raf = 0, tw = false, closing = false, tr = null;

            if (o.dot) sh.style.transformOrigin = '50% 50%';

            const lay = () => {
                const g = (o.xp ? 1 - p : 1) * LF, f = (o.xp ? p : 0) * LF;
                return [g, f, g];
            };
            const tf = () => `translate3d(${X}px,${Y}px,0) scale(${Sx},${Sy})`;
            const paint = () => {
                sh.style.transform = tf();
                sh.style.borderRadius = RR;
                sc.style.opacity = CO === 1 ? '' : CO;
                bd.style.opacity = B;
                const l = lay();
                layers.forEach((x, i) => { x.style.opacity = l[i]; });
            };
            const metrics = () => {
                const h = el.clientHeight || window.innerHeight, lo = h * .54;
                return { h, lo, tr: Math.max(60, h * .46 - 43) };
            };
            const setP = v => {
                if (!o.xp) return;
                p = v;
                H = M.lo + p * M.tr;
                sh.style.height = H + 'px';
                B = o.bd0 + .32 * p;
            };
            const geom = () => {
                const w = sh.offsetWidth || 1, hh = sh.offsetHeight || H || 1;
                const orc = el.getBoundingClientRect(), dr = dot.getBoundingClientRect();
                const cx = orc.left + sh.offsetLeft + w / 2, cy = orc.top + sh.offsetTop + hh / 2;
                return { sx: Math.min(1, DOTW / w), sy: Math.min(1, DOTW / hh), rx: w / 2, ry: hh / 2,
                    dx: +(dr.left + dr.width / 2 - cx).toFixed(2), dy: +(dr.top + dr.height / 2 - cy).toFixed(2),
                    r: `${(w / 2).toFixed(1)}px / ${(hh / 2).toFixed(1)}px` };
            };
            const dropTf = g => `translate3d(${g.dx}px,${g.dy}px,0) scale(${g.sx},${g.sy})`;
            const moving = on => el.classList.toggle('moving', on);
            const killAnims = () => {
                kids.forEach(a => tryQ(() => a.cancel()));
                kids = [];
                if (anim) { anim.onfinish = null; tryQ(() => anim.cancel()); anim = null; }
            };
            const stop = () => { killAnims(); cancelAnimationFrame(raf); tw = false; };

            const go = (t, ms, ease, done) => {
                stop();
                moving(true);
                const f = { transform: tf(), borderRadius: RR || RAD + 'px' }, fc = CO, l0 = lay();
                Sx = t.Sx; Sy = t.Sy; X = t.X || 0; Y = t.Y; B = t.B; RR = t.RR || ''; CO = t.CO == null ? 1 : t.CO; LF = t.LF == null ? 1 : t.LF;
                const l1 = lay();
                bd.style.transition = `opacity ${Math.round(ms * .85)}ms ease`;
                paint();
                const e = { transform: tf(), borderRadius: RR || RAD + 'px' };
                const a = sh.animate([f, e], { duration: ms, easing: ease, fill: 'both' });
                anim = a;
                const fd = Math.min(ms, 320);
                kids = [sc.animate([{ opacity: fc }, { opacity: CO }], { duration: fd, easing: 'ease-out', fill: 'both' })];
                layers.forEach((x, i) => kids.push(x.animate([{ opacity: l0[i] }, { opacity: l1[i] }], { duration: fd, easing: 'ease-out', fill: 'both' })));
                a.onfinish = () => { if (anim !== a) return; killAnims(); moving(false); if (done) done(); };
            };
            const tween = to => {
                const from = p, d = Math.abs(to - from), t0 = performance.now(), dur = 220 + 280 * d;
                const fin2 = () => { tw = false; moving(false); el.classList.toggle('full', to >= 1); };
                if (d < .002) { setP(to); paint(); fin2(); return; }
                tw = true;
                moving(true);
                bd.style.transition = 'none';
                const step = now => {
                    const k = Math.min(1, (now - t0) / dur);
                    setP(from + (to - from) * (1 - Math.pow(1 - k, 4)));
                    paint();
                    if (k < 1) raf = requestAnimationFrame(step); else fin2();
                };
                raf = requestAnimationFrame(step);
            };
            const fin = () => {
                closing = false;
                killAnims();
                el.classList.remove('show', 'full', 'moving');
                Sx = 1; Sy = 1; X = 0; Y = 0; B = 0; RR = ''; CO = 1; LF = 1;
                paint();
                hideLater(el);
                syncBusy();
            };

            const open = () => {
                stop(); closing = false; tr = null;
                toTop(el);
                M = metrics();
                setP(0);
                el.classList.remove('full');
                Sx = Sy = 1; RR = ''; CO = 1; LF = 1; X = 0;
                Y = (o.xp ? M.lo : (sh.offsetHeight || 360)) + 32;
                B = 0;
                bd.style.transition = 'none';
                paint();
                el.classList.add('show');
                syncBusy();
                void sh.offsetWidth;
                go({ Sx: 1, Sy: 1, Y: 0, B: o.bd0, CO: 1, LF: 1 }, 460, EASE_OPEN);
            };
            const close = () => {
                if (closing) return;
                closing = true; tr = null;
                if (o.before) o.before();
                el.classList.remove('full');
                if (!(o.dot && !reduced())) {
                    go({ Sx: .94, Sy: .94, Y: Y + 60, B: 0, CO: 0, LF: 0 }, 280, EASE_CLOSE, fin);
                    return;
                }
                const cT = tf(), cR = RR || RAD + 'px', lv = lay();
                stop();
                const g = geom();
                moving(true);
                const end = dropTf(g);
                const dur = 340;
                const a1 = sh.animate([{ transform: cT }, { transform: end }],
                    { duration: dur, easing: EASE_SHRINK, fill: 'forwards' });
                const a2 = sh.animate([{ borderRadius: cR }, { borderRadius: g.r }],
                    { duration: dur, easing: EASE_SHRINK, fill: 'forwards' });
                kids = [a2];
                layers.forEach((x, i) => kids.push(x.animate([{ opacity: lv[i] }, { opacity: lv[i], offset: .65 }, { opacity: 0 }],
                    { duration: dur, easing: 'linear', fill: 'forwards' })));
                [...sc.children].forEach(c => {
                    if (c.animate) kids.push(c.animate([{ opacity: 1 }, { opacity: 1, offset: .2 }, { opacity: 0 }],
                        { duration: 110, easing: 'ease-in', fill: 'forwards' }));
                });
                bd.style.transition = `opacity ${dur - 20}ms ease`;
                B = 0;
                bd.style.opacity = 0;
                anim = a1;
                a1.onfinish = fin;
            };

            const pull = ex => {
                const base = o.bd0 + (o.xp ? .32 * p : 0);
                if (o.dot && !reduced()) {
                    if (ex > 0 && !tr.g) tr.g = geom();
                    const k = clamp(ex / 280, 0, 1), g = tr.g;
                    if (g && k > 0) {
                        Sx = lerp(1, g.sx, k); Sy = lerp(1, g.sy, k);
                        X = lerp(0, g.dx, k); Y = lerp(0, g.dy, k);
                        RR = `${lerp(RAD, g.rx, k).toFixed(1)}px / ${lerp(RAD, g.ry, k).toFixed(1)}px`;
                    } else { Sx = Sy = 1; X = 0; Y = 0; RR = ''; }
                    LF = 1 - .3 * k;
                    CO = Math.max(0, 1 - k * 1.8);
                    B = base * (1 - k);
                } else {
                    X = 0; Y = ex; Sx = Sy = Math.max(.85, 1 - ex / 1600);
                    LF = 1;
                    B = base * (1 - Math.min(1, ex / 500));
                }
            };
            const start = (x, y, t) => {
                if (anim || closing || tw) return;
                tr = { x0: x, y0: y, y, t: Date.now(), vy: 0, grab: grab.contains(t), drag: false, ex: 0, p0: 0, g: null };
            };
            const move = (x, y, ev) => {
                if (!tr) return;
                if (!tr.drag) {
                    const dy = y - tr.y0;
                    if (Math.abs(x - tr.x0) > Math.abs(dy) || Math.abs(dy) < 6) return;
                    if (!tr.grab && (dy < 0 || sc.scrollTop > 0)) { tr = null; return; }
                    Object.assign(tr, { drag: true, p0: p, y0: y, y, t: Date.now(), vy: 0 });
                    stop();
                    moving(true);
                    bd.style.transition = 'none';
                    el.classList.remove('full');
                }
                if (ev && ev.cancelable) ev.preventDefault();
                const now = Date.now(), dt = Math.max(1, now - tr.t), d = y - tr.y0;
                tr.vy = .7 * ((y - tr.y) / dt) + .3 * tr.vy;
                tr.y = y; tr.t = now;
                if (o.xp) {
                    const raw = Math.min(tr.p0 - d / M.tr, tr.grab ? 1 : tr.p0);
                    setP(clamp(raw, 0, 1));
                    tr.ex = raw < 0 ? -raw * M.tr : 0;
                } else tr.ex = Math.max(0, d);
                pull(tr.ex);
                paint();
            };
            const end = () => {
                const t = tr; tr = null;
                if (!t || !t.drag) return;
                const vy = Date.now() - t.t > 90 ? 0 : t.vy;
                if (t.ex > 0 && (t.ex > 80 || vy > .6)) { close(); return; }
                if (o.xp && t.ex === 0) { tween(p - vy * 200 / M.tr > .5 ? 1 : 0); return; }
                go({ Sx: 1, Sy: 1, X: 0, Y: 0, B: o.bd0 + (o.xp ? .32 * p : 0), RR: '', CO: 1, LF: 1 }, 460, EASE_OPEN);
            };

            bind(sh, 'touchstart', (e, tg) => { if (e.touches.length === 1) start(e.touches[0].clientX, e.touches[0].clientY, tg); });
            bind(sh, 'touchmove', e => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY, e); });
            bind(sh, 'touchend', end);
            bind(sh, 'touchcancel', end);
            bind(el, 'touchmove', (e, tg) => { if (tg === el && e.cancelable) e.preventDefault(); });
            bind(el, 'click', (e, tg) => { if (tg === el) close(); });
            bind(grab, 'pointerdown', (e, tg) => {
                if (e.pointerType !== 'mouse') return;
                start(e.clientX, e.clientY, tg);
                tryQ(() => grab.setPointerCapture(e.pointerId));
            });
            bind(grab, 'pointermove', e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY, e); });
            bind(grab, 'pointerup', e => { if (e.pointerType === 'mouse') end(); });

            return { open, close, isOpen: () => el.classList.contains('show') && !closing };
        }

        function build() {
            if (built) return;
            built = true;
            const SW = (id, h) => `<span class="g-swh" data-id="${id}"${h ? ' data-h="1"' : ''}></span>`;
            const rowHtml = ([id, , title, sub, subId]) =>
                `<label class="g-set"><div>${title}<small${subId ? ` id="${subId}"` : ''}>${sub}</small></div>${SW(id)}</label>`;
            const tpl = document.createElement('template');
            tpl.innerHTML = `
    <style>
:host{--ez:cubic-bezier(.16,1,.3,1);--t2:.2s;--t3:.3s;--ctl:inline-flex;--ctr:center}
*,*::before,*::after{-webkit-tap-highlight-color:transparent!important}
label,.g-set,.g-sw,.g-sw input,button,input[type=checkbox]{-webkit-tap-highlight-color:transparent!important;outline:none!important;-webkit-focus-ring-color:transparent!important}
.g-sw input:focus,.g-sw input:focus-visible,.g-sw input:active{outline:none!important;box-shadow:none!important;background:none!important}
.g-sw span:after,.g-ld::before,.g-tab.has .g-lb::after{content:"";position:absolute}
.g-od,.g-state i,.g-ld i,.g-sw span,.g-sw span:after,.g-close,.g-chip button,.g-tab.has .g-lb::after{border-radius:50%}
.g-ov{position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:visible;z-index:2147483647;background:transparent!important;visibility:hidden;touch-action:none}
.g-ov.show{visibility:visible}
.g-ov::backdrop{display:none;background:transparent!important}
.g-bd{position:absolute;inset:0;background:transparent!important;opacity:0;pointer-events:none;display:none!important}
.g-sheet{position:absolute;display:flex;flex-direction:column;left:8px;right:8px;bottom:8px;margin:0 auto;max-width:520px;max-height:80vh;max-height:80dvh;color:var(--fg);touch-action:pan-y;border-radius:var(--R);overflow:hidden;background:transparent;box-shadow:none;transform-origin:50% 100%;will-change:transform;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}
.g-ov.xp .g-sheet{height:54%;max-height:none}
.g-fill,.g-rim,.g-glass{position:absolute;inset:0;border-radius:inherit;pointer-events:none}
.g-fill{background:var(--sheet);opacity:0;will-change:opacity}
.g-glass{background:linear-gradient(165deg,rgba(40,42,56,.42) 0%,rgba(26,28,38,.54) 100%);-webkit-backdrop-filter:blur(12px) saturate(1.9) brightness(1.06);backdrop-filter:blur(12px) saturate(1.9) brightness(1.06);opacity:1}
/* liquid glass: mép dày có độ vát sáng ở góc trên trái và dưới phải, ánh phản chiếu mềm phía trên, lòng kính trong */
.g-glass::before,.g-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none}
.g-glass::before{box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),inset 2px 3px 5px -2px rgba(255,255,255,.3),inset -2px -3px 7px -3px rgba(255,255,255,.16),inset 0 0 28px rgba(255,255,255,.045)}
.g-glass::after{background:radial-gradient(120% 46% at 18% 0%,rgba(255,255,255,.17),rgba(255,255,255,0) 62%),radial-gradient(90% 40% at 92% 100%,rgba(255,255,255,.07),rgba(255,255,255,0) 70%)}
.g-rim{z-index:4;padding:1px;background:linear-gradient(155deg,rgba(255,255,255,.26) 0%,rgba(255,255,255,.06) 28%,rgba(255,255,255,.025) 60%,rgba(255,255,255,.15) 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;will-change:opacity}
.g-scroll{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:44px 16px calc(16px + env(safe-area-inset-bottom,0px));will-change:opacity}
*{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}
input[type=text],textarea{-webkit-user-select:text!important;user-select:text!important;-webkit-touch-callout:default!important}
.g-close,.g-add,.g-chip button,.g-tab,.g-cp,.g-act,.g-bulk-btn{display:var(--ctl);align-items:center;justify-content:var(--ctr)}
.g-close,.g-chip button,.g-cp,.g-bulk-btn.sec,.g-act{background:var(--w12)}
.g-add,.g-bulk-btn,.g-cp.ok,.g-act.ok,.g-act.pri{background:var(--ac);color:var(--ink)}
.g-bulk-btn.sec{color:var(--fg)}
.g-add:active,.g-cp:active,.g-bulk-btn:active,.g-act:active{transform:scale(.94)}
.g-add,.g-cp,.g-bulk-btn,.g-act{transition:transform .18s var(--ez),background var(--t2)}
.g-card{background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.055));border-radius:16px;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 0 0 1px rgba(255,255,255,.05)}
.g-close{box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 0 0 1px rgba(255,255,255,.06)}
.g-set + .g-set,.g-info + .g-info{border-top:1px solid var(--w06)}
.g-sub,.g-set small,.g-hint,.g-empty{color:var(--t45)}
.g-grab{position:absolute;top:0;left:0;right:0;z-index:2;height:34px;margin:0;display:flex;justify-content:center;align-items:flex-start;padding-top:12px;touch-action:none;cursor:grab;background:transparent;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}
.g-grab i{display:block;width:36px;height:4px;border-radius:2px;background:var(--grab)}
.g-close{position:absolute;top:12px;right:14px;z-index:3;width:30px;height:30px;color:var(--cl);transition:background var(--t2),transform var(--t2) ease}
.g-close:active{transform:scale(.88) rotate(90deg)}
.g-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 14px}
.g-title{font-size:20px;font-weight:700;white-space:nowrap}
.g-sub{font-size:13px;margin-top:2px}
.g-od{display:inline-block;width:.34em;height:.34em;margin:0 .08em 0 .06em;vertical-align:.1em;background:var(--ne);box-shadow:0 0 6px 1px rgba(var(--nr),.85)}
.g-state{flex:none;display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap;background:var(--stbg);color:var(--ne);transition:background .35s ease,color .35s ease}
.g-state i{display:block;width:6px;height:6px;background:currentColor}
.g-state.off{background:var(--w08);color:var(--t55)}
.g-set{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;font-size:15px}
.g-set small{display:block;font-size:12px;margin-top:2px;transition:color .25s}
.g-tut{width:100%;text-align:left;color:var(--fg);transition:background var(--t2)}
.g-tut:active{background:var(--w06)}
.g-tut svg{color:var(--t42)}
.g-sw{position:relative;flex:none;height:24px;width:46px;font-family:var(--ff);-webkit-font-smoothing:antialiased;font-synthesis:none}
.g-sw input{display:block;-webkit-appearance:none;appearance:none;position:absolute;top:0;left:0;width:100%;height:24px;border:0;padding:0;margin:0;cursor:pointer;background:none;-webkit-tap-highlight-color:transparent;z-index:1}
.g-sw .on,.g-sw .off{position:absolute;top:0;right:12px;display:block;font-size:12.8px;font-weight:500;line-height:24px;width:100%;text-align:right;color:var(--ne);transform-origin:right 12px;-webkit-user-select:none;user-select:none;transition:transform var(--t3) ease,opacity var(--t3) ease;pointer-events:none;will-change:transform,opacity}
.g-sw .on{transform:translate3d(0,12px,0) scale(.8);opacity:0}
.g-sw .off{transform:translate3d(0,0,0) scale(1);opacity:1}
.g-sw span{position:absolute;top:6.5px;right:0;width:4px;height:4px;background:var(--gy2);box-shadow:0 7px 0 var(--gy2);pointer-events:none}
.g-sw span:after{top:0;left:0;width:100%;height:100%;background:var(--ne);transform:translate3d(0,0,0);transition:transform var(--t2) ease;will-change:transform}
.g-sw input:checked ~ .on{transform:translate3d(0,0,0) scale(1);opacity:1}
.g-sw input:checked ~ span:after{transform:translate3d(0,7px,0)}
.g-sw input:checked ~ .off{transform:translate3d(0,-12px,0) scale(.8);opacity:0}
.g-sw.h{width:40px}
.g-sw.h .on,.g-sw.h .off{right:17px;font-size:11px}
.g-sw.h span{top:10px;right:0;box-shadow:-7px 0 0 var(--gy2)}
.g-sw.h span:after{transform:translate3d(-7px,0,0)}
.g-sw.h input:checked ~ span:after{transform:translate3d(0,0,0)}
.g-ld{flex:none;position:relative;width:46px;height:24px;display:flex;align-items:center;justify-content:flex-end}
.g-ld::before{inset:-10px -4px}
.g-ld i{display:block;width:6px;height:6px;margin-right:-1px;background:var(--gy2);transition:background .25s,transform .15s}
.g-ld.has i{background:var(--ne)}
.g-ld:active i{transform:scale(1.6)}
.g-bar{display:flex;gap:8px;align-items:center;margin:12px 0 8px}
.g-tabs{display:flex;flex:1;min-width:0;gap:2px;padding:2px;border-radius:var(--r);background:var(--tabbg)}
.g-tab{flex:1;min-width:0;padding:7px 4px;border-radius:8px;font-size:13px;font-weight:500;white-space:nowrap;color:var(--t55);transition:background var(--t2),color var(--t2),box-shadow var(--t2)}
.g-tab.act{background:var(--tabact);color:var(--fg);box-shadow:0 1px 3px rgba(0,0,0,.25)}
.g-lb{position:relative;display:inline-block}
.g-tab.has .g-lb::after{top:-3px;right:-7px;width:5px;height:5px;background:var(--ne);box-shadow:var(--glow)}
.g-scope{flex:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 10px;border-radius:var(--r);background:var(--w08);font-size:13px;font-weight:600;color:var(--fg);transition:transform .15s,background var(--t2)}
.g-scope:active{transform:scale(.95)}
.g-scope #g-sc-t{max-width:104px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-scope b{padding:1px 6px;border-radius:8px;font-size:11px;font-weight:600;background:var(--ac);color:var(--ink)}
.g-scope svg{color:var(--t55)}
.g-hint,.g-warn{margin:8px 2px 0;font-size:12px;font-style:italic}
.g-warn{color:#d99a0b;display:none}
.g-row{display:flex;gap:8px;align-items:center}
input[type=text],textarea{flex:1;min-width:0;width:100%;padding:0 12px;border-radius:var(--r);color:var(--fg);border:1px solid transparent;background:var(--w08);font:inherit;font-size:16px;outline:none;-webkit-appearance:none;appearance:none;transition:border-color var(--t2)}
input[type=text]{height:36px}
textarea{display:block;height:auto;min-height:48px;padding:8px 12px;resize:none;line-height:1.35}
input[type=text]::placeholder,textarea::placeholder{color:var(--ph);font-size:12.5px}
input[type=text]:focus,textarea:focus{border-color:var(--fc)}
.g-add{flex:none;width:36px;height:36px;border-radius:var(--r)}
.g-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;align-items:start}
.g-bulk{padding:8px;border-radius:14px;min-width:0;min-height:0;display:flex;flex-direction:column;aspect-ratio:1/1;overflow:hidden;background:linear-gradient(180deg,var(--w08) 0%,var(--w06) 100%);border:1px solid var(--w06)}
.g-bulk-h{flex:none;display:flex;align-items:center;gap:5px;margin-bottom:6px;font-size:11.5px;font-weight:600;white-space:nowrap}
.g-bulk-h svg{color:var(--ac);width:12px;height:12px}
.g-bulk-h span{overflow:hidden;text-overflow:ellipsis}
.g-ta{position:relative;flex:1 1 0;min-height:0;overflow:hidden;border-radius:9px;background:var(--w08)}
.g-ta textarea{position:absolute;top:0;left:0;width:133.34%;height:133.34%;min-height:0;padding:7px 9px;font-size:16px;line-height:1.3;border:0;border-radius:0;background:transparent;transform:scale(.75);transform-origin:0 0}
.g-ta textarea::placeholder{font-size:14px}
.g-ta textarea:focus{box-shadow:inset 0 0 0 1.5px var(--fc)}
.g-bulk-b{flex:none;display:flex;flex-direction:column;align-items:stretch;gap:3px;margin-top:6px}
.g-bulk-btn{flex:none;gap:4px;width:100%;height:28px;padding:0 6px;border-radius:9px;font-size:11.5px;font-weight:600;white-space:nowrap}
.g-bulk-btn svg{width:12px;height:12px}
.g-io-o{flex:none;display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:6px;font-size:11px;color:var(--t55)}
.g-io-o > span{line-height:1.2}
.g-io-r{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px}
.g-io-r .g-bulk-btn{height:26px;padding:0 3px;font-size:11px}
.g-io-r .g-bulk-btn svg{display:none}
.g-msg{flex:none;min-width:0;text-align:center;font-size:10.5px;color:var(--t55)}
.g-msg:empty{display:none}
.g-msg.ok{color:var(--ne)}
.g-msg.err{color:var(--bad)}
#g-io-msg{margin-top:3px}
@media (max-width:340px){.g-cols{grid-template-columns:1fr}}
.g-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.g-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:4px 4px 4px 10px;border-radius:999px;background:var(--w08);font-size:13px;word-break:break-all;animation:gdarIn .25s ease}
.g-chip button{flex:none;width:18px;height:18px;color:var(--cl);transition:background var(--t2)}
.g-chip button:active{background:var(--w12)}
.g-empty{width:100%;padding:8px 0 2px;text-align:center;font-size:13px;opacity:.8}
@keyframes gdarIn{from{opacity:0;transform:scale(.85)}
to{opacity:1;transform:scale(1)}}
.g-info{display:flex;align-items:flex-start;gap:10px;padding:10px 14px}
.g-info > div{flex:1;min-width:0}
.g-info small{display:block;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--t42);margin-bottom:2px}
.g-info code{display:block;font:500 13px/1.4 var(--ff);color:var(--fg);word-break:break-all}
.g-cp{flex:none;gap:5px;padding:6px 10px;border-radius:var(--r);font-size:13px;font-weight:600}
.g-acts{display:flex;gap:8px;margin-top:12px}
.g-acts + .g-acts{margin-top:8px}
.g-act{flex:1;min-width:0;gap:7px;padding:11px 8px;border-radius:12px;font-size:14px;font-weight:600}
#g-blk span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-rcol{flex:none;display:flex;flex-direction:column;align-items:stretch;gap:6px}
.g-qc{background:var(--ac);color:var(--ink);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.g-chip{animation-duration:.01s!important}}
    </style>

    <div class="g-ov xp" id="g-ov1" popover="manual">
        <i class="g-bd"></i>
        <div class="g-sheet">
            <i class="g-glass"></i><i class="g-fill"></i><i class="g-rim"></i>
            <div class="g-scroll">
            <div class="g-grab" id="g-grab1"><i></i></div>
            <button class="g-close" id="g-close" aria-label="Đóng">${ic('x', 14)}</button>
            <div class="g-head">
                <div>
                    <div class="g-title" aria-label="Dot Ads">D<span class="g-od" aria-hidden="true"></span>t Ads</div>
                    <div class="g-sub" id="g-tag">Chặn quảng cáo với một chạm</div>
                </div>
                <div class="g-state" id="g-state"><i></i><span id="g-state-t"></span></div>
            </div>

            <div class="g-card">
                ${ROWS_A.map(rowHtml).join('')}
                <div class="g-set"><div>Chặn tức thì<small id="g-learn-s"></small></div><button class="g-ld" id="g-learn-clr" aria-label="Xoá các mục đã nhớ"><i></i></button></div>
                ${rowHtml(ROW_PICK)}
                ${rowHtml(ROW_RND)}
                <button class="g-set g-tut" id="g-tut"><div>Xem hướng dẫn<small>Mở lại phần giới thiệu Dot Ads</small></div>${ic('chev', 16)}</button>
            </div>

            <div class="g-bar">
                <div class="g-tabs" id="g-kind">
                    <button class="g-tab act" data-tab="sel"><span class="g-lb">Phần tử</span></button>
                    <button class="g-tab" data-tab="txt"><span class="g-lb">Từ khoá</span></button>
                    <button class="g-tab" data-tab="lnk"><span class="g-lb">Liên kết</span></button>
                </div>
                <button class="g-scope" id="g-scope"><span id="g-sc-t"></span><b id="g-sc-n">0</b>${ic('swap', 13)}</button>
            </div>

            <div class="g-row">
                <input type="text" id="g-in" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
                <button class="g-add" id="g-add" aria-label="Thêm">${ic('plus', 18)}</button>
            </div>

            <div class="g-hint" id="g-hint"></div>
            <div class="g-warn" id="g-warn">Không có GM.setValue: luật có thể mất khi xoá dữ liệu Safari</div>
            <div class="g-chips" id="g-list"></div>

            <div class="g-cols">
                <div class="g-bulk">
                    <div class="g-bulk-h">${ic('list', 14)}<span>Thêm nhiều</span></div>
                    <div class="g-ta"><textarea id="g-bulk" autocapitalize="off" autocorrect="off" spellcheck="false" rows="4"></textarea></div>
                    <div class="g-bulk-b">
                        <button class="g-bulk-btn" id="g-bulk-go">${ic('plus', 14)}<span>Thêm tất cả</span></button>
                        <div class="g-msg" id="g-msg"></div>
                    </div>
                </div>

                <div class="g-bulk">
                    <div class="g-bulk-h">${ic('copy', 14)}<span>Sao lưu / Khôi phục</span></div>
                    <div class="g-ta"><textarea id="g-io" autocapitalize="off" autocorrect="off" spellcheck="false" rows="4" placeholder="Dán JSON để nhập"></textarea></div>
                    <label class="g-io-o"><span>Thay thế</span>${SW('g-replace', true)}</label>
                    <div class="g-io-r">
                        <button class="g-bulk-btn sec" id="g-exp">${ic('copy', 14)}<span>Xuất</span></button>
                        <button class="g-bulk-btn" id="g-expf"><span>Lưu tệp</span></button>
                        <button class="g-bulk-btn sec" id="g-imp"><span>Nhập</span></button>
                        <button class="g-bulk-btn" id="g-impf"><span>Chọn tệp</span></button>
                        <input type="file" id="g-file" accept=".json,.txt,application/json,text/plain" style="display:none">
                    </div>
                    <div class="g-msg" id="g-io-msg"></div>
                </div>
            </div>
            </div>
        </div>
    </div>

    <div class="g-ov" id="g-ov2" popover="manual">
        <i class="g-bd"></i>
        <div class="g-sheet">
            <i class="g-glass"></i><i class="g-fill"></i><i class="g-rim"></i>
            <div class="g-scroll">
            <div class="g-grab" id="g-grab2"><i></i></div>
            <button class="g-close" id="g-close2" aria-label="Đóng">${ic('x', 14)}</button>
            <div class="g-head"><div><div class="g-title">Phần tử</div><div class="g-sub" id="g-sub2"></div></div></div>
            <div class="g-card" id="g-info"></div>
            <div class="g-acts">
                <button class="g-act" id="g-up">${ic('up', 15)}<span>Phần tử cha</span></button>
                <button class="g-act" id="g-under">${ic('layers', 15)}<span>Lớp bên dưới</span></button>
            </div>
            <div class="g-acts">
                <button class="g-act" id="g-copyall">${ic('copy', 15)}<span>Sao chép tất cả</span></button>
                <button class="g-act pri" id="g-hideit">${ic('eyeoff', 15)}<span>Ẩn phần tử này</span></button>
            </div>
            <div class="g-acts">
                <button class="g-act pri" id="g-blk" style="display:none">${ic('shield', 15)}<span></span></button>
            </div>
            </div>
        </div>
    </div>`;
            root.appendChild(tpl.content);

            root.querySelectorAll('.g-swh').forEach(h => h.replaceWith(
                mkSwitch(h.dataset.id, h.dataset.h === '1', h.dataset.on, h.dataset.off)));

            ov = $('g-ov1');
            ov2 = $('g-ov2');
            kindBtns = root.querySelectorAll('[data-tab]');
            if (!GMOK) $('g-warn').style.display = 'block';

            ctl1 = mkSheet(ov, { xp: true, dot: true, bd0: 0, before: () => { $('g-in').blur(); $('g-bulk').blur(); } });
            ctl2 = mkSheet(ov2, { bd0: 0, before: () => { hl.style.display = 'none'; } });

            const setMsg = (id, text, cls) => { const m = $(id); m.textContent = text || ''; m.className = 'g-msg' + (cls ? ' ' + cls : ''); };
            const msg = (t, c) => setMsg('g-msg', t, c);
            const ioMsg = (t, c) => setMsg('g-io-msg', t, c);

            renderSheet = function () {
                SW_KEYS.forEach(([id, k]) => { $(id).checked = !!set[k]; });
                $('g-lnk-s').textContent = 'Chặn tên miền lạ, URL quảng cáo và mở app' + (lnkBlocked ? ' · đã chặn ' + lnkBlocked : '');
                const nLearn = learnActive();
                $('g-learn-s').textContent = nLearn ? 'Đã nhớ ' + nLearn + ' mục, ẩn ngay khi tải' : 'Nhớ khung và popup cho lần sau';
                $('g-learn-s').classList.toggle('on', nLearn > 0);
                $('g-learn-clr').classList.toggle('has', nLearn > 0);
                $('g-state').classList.toggle('off', !set.on);
                $('g-state-t').textContent = set.on ? 'Đang bật' : 'Đang tắt';
                if (scope.startsWith('f:') && !frameRules[scope.slice(2)]) scope = 'site';
                $('g-sc-t').textContent = scope === 'all' ? 'Mọi trang' : scope === 'site' ? 'Trang này' : 'Khung ' + scope.slice(2);
                $('g-sc-n').textContent = count(cur());
                const siteLabel = BASE.indexOf('.') < 0 ? BASE + '.*' : BASE;
                $('g-hint').textContent = scope === 'all' ? 'Áp dụng cho mọi trang'
                    : scope === 'site' ? 'Áp dụng cho ' + siteLabel
                    : 'Khung nhúng ' + scope.slice(2) + ' · tải lại để áp dụng';
                $('g-in').placeholder = PH[tab];
                $('g-bulk').placeholder = PH_BULK[tab];
                kindBtns.forEach(b => {
                    b.classList.toggle('act', b.dataset.tab === tab);
                    b.classList.toggle('has', cur()[b.dataset.tab].length > 0);
                });

                /* thứ tự hiển thị: cũ nhất ở trên, mới nhất xếp cuối cùng */
                const list = $('g-list'), arr = cur()[tab];
                list.innerHTML = '';
                if (!arr.length) { list.innerHTML = '<div class="g-empty">Chưa có mục nào</div>'; return; }
                arr.forEach((v, i) => {
                    const chip = document.createElement('span');
                    chip.className = 'g-chip';
                    const s = document.createElement('span');
                    s.textContent = v;
                    const b = document.createElement('button');
                    b.setAttribute('aria-label', 'Xoá');
                    b.innerHTML = ic('x', 10);
                    bind(b, 'click', () => { arr.splice(i, 1); saveCur(); render(); applyRules(); });
                    chip.append(s, b);
                    list.appendChild(chip);
                });
            };

            /* tab Liên kết: URL đầy đủ được tự tách thành tên miền (hoặc tên miền/đường dẫn) trong parseMulti */
            function addMany(raw) {
                const items = parseMulti(raw, tab === 'lnk'), arr = cur()[tab];
                let added = 0, dup = 0, bad = 0;
                items.forEach(v => {
                    if (tab === 'sel' && !NAME_RE.test(v) && !validSel(v)) { bad++; return; }
                    const ix = arr.indexOf(v);
                    if (ix >= 0) { arr.splice(ix, 1); arr.push(v); dup++; return; }
                    arr.push(v);
                    added++;
                });
                if (added || dup) { saveCur(); render(); applyRules(); }
                return { total: items.length, added, dup, bad };
            }
            const summary = r => [r.added && `Đã thêm ${r.added}`, r.dup && `${r.dup} trùng (đưa xuống cuối)`, r.bad && `${r.bad} không hợp lệ`].filter(Boolean).join(' · ');

            function add() {
                const input = $('g-in');
                if (!input.value.trim()) return;
                const r = addMany(input.value);
                if (r.added || r.dup) { input.value = ''; input.style.borderColor = ''; }
                else if (r.bad) input.style.borderColor = '#f87171';
            }
            function addBulk() {
                const ta = $('g-bulk'), r = addMany(ta.value);
                if (!r.total) { msg('Chưa nhập gì', 'err'); return; }
                if (r.added || r.dup) ta.value = '';
                msg(summary(r), (r.added || r.dup) ? 'ok' : 'err');
            }

            const listSites = async () => {
                const all = await storedSites(), out = {};
                if (count(site)) out[BASE] = site;
                Object.keys(all).forEach(h => { if (count(all[h])) out[h] = all[h]; });
                return out;
            };
            const buildExport = async () => JSON.stringify({
                app: 'dot-ads', version: 2, exported: new Date().toISOString(),
                settings: set, global: glb, sites: await listSites()
            }, null, 2);

            async function importData(text) {
                let d;
                let raw = String(text || '').replace(/^\uFEFF/, '').trim();
                const i0 = raw.indexOf('{'), i1 = raw.lastIndexOf('}');
                if (i0 > 0 && i1 > i0) raw = raw.slice(i0, i1 + 1);
                try { d = JSON.parse(raw); } catch (e) { ioMsg('JSON không hợp lệ', 'err'); return; }
                if (!d || typeof d !== 'object' || (d.app !== 'dot-ads' && !d.global && !d.sites && !d.settings)) {
                    ioMsg('Không phải tệp sao lưu Dot Ads', 'err'); return;
                }
                const replace = $('g-replace').checked;
                let nSites = 0;
                const jobs = [];
                ioMsg('Đang lưu…');
                if (d.settings && typeof d.settings === 'object') { set = normSet(d.settings); jobs.push(gWrite('settings', set)); }
                if (d.global) { mergeRules(glb, d.global, replace); jobs.push(gWrite('global', glb)); }
                if (d.sites && typeof d.sites === 'object') {
                    const grouped = {};
                    Object.keys(d.sites).forEach(h => {
                        const b = siteBase(h);
                        if (!b) return;
                        if (!grouped[b]) grouped[b] = DEF_RULES();
                        mergeRules(grouped[b], d.sites[h]);
                    });
                    for (const b of Object.keys(grouped)) {
                        nSites++;
                        if (b === BASE) { mergeRules(site, grouped[b], replace); jobs.push(siteWrite()); }
                        else {
                            const c2 = replace ? DEF_RULES() : normRules(await gRead(SITE_PREFIX + b, DEF_RULES()));
                            mergeRules(c2, grouped[b], replace);
                            jobs.push(gWrite(SITE_PREFIX + b, c2));
                        }
                    }
                }
                applyRules();
                render();
                await Promise.all(jobs);
                ioMsg(`Đã nhập & lưu (${replace ? 'thay thế' : 'gộp'}) · ${nSites} trang`, 'ok');
            }

            bind($('g-exp'), 'click', async () => {
                const text = await buildExport();
                $('g-io').value = text;
                const ok = await copyText(text);
                ioMsg(ok ? 'Đã sao chép JSON sao lưu' : 'Không chép được, hãy chép thủ công từ ô trên', ok ? 'ok' : 'err');
            });
            bind($('g-expf'), 'click', async () => {
                const text = await buildExport();
                $('g-io').value = text;
                try {
                    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dot-ads-backup.json';
                    document.documentElement.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                    ioMsg('Đã tạo tệp dot-ads-backup.json', 'ok');
                } catch (e) { ioMsg('Không lưu được tệp, hãy chép từ ô trên', 'err'); }
            });
            bind($('g-imp'), 'click', () => {
                const t = $('g-io').value;
                if (!t.trim()) { ioMsg('Chưa dán JSON', 'err'); return; }
                importData(t);
            });
            bind($('g-impf'), 'click', () => {
                const fi = $('g-file');
                fi.removeAttribute('capture');
                fi.multiple = false;
                fi.accept = '.json,.txt,application/json,text/plain';
                fi.click();
            });
            $('g-file').onchange = async e => {
                const f = e.target.files && e.target.files[0];
                e.target.value = '';
                if (!f) return;
                try {
                    const t = f.text ? await f.text() : await new Promise((res, rej) => {
                        const fr = new FileReader();
                        fr.onload = () => res(String(fr.result));
                        fr.onerror = () => rej(fr.error);
                        fr.readAsText(f);
                    });
                    $('g-io').value = t;
                    await importData(t);
                }
                catch (err) { ioMsg('Không đọc được tệp', 'err'); }
            };
            bind($('g-io'), 'input', () => ioMsg(''));

            bind($('g-add'), 'click', add);
            bind($('g-in'), 'keydown', e => { if (e.key === 'Enter') add(); });
            bind($('g-in'), 'input', (e, tg) => { tg.style.borderColor = ''; });
            bind($('g-bulk-go'), 'click', addBulk);
            bind($('g-bulk'), 'input', () => msg(''));

            const AFTER = {
                on: () => { render(); applyRules(); },
                auto: applyRules,
                pop: () => { learn.l = []; learnWrite(); applyRules(); render(); },
                links: () => { applyRules(); render(); },
                pick: applyPick,
                rnd: applyColor
            };
            SW_KEYS.forEach(([id, k]) => {
                $(id).onchange = e => { set[k] = e.target.checked; gWrite('settings', set); AFTER[k](); };
            });
            bind($('g-learn-clr'), 'click', () => { learn.l = []; learn.p = []; learnWrite(); applyRules(); render(); });
            bind($('g-scope'), 'click', () => {
                const names = ['all', 'site', ...Object.keys(frameRules).map(h => 'f:' + h)];
                const i = names.indexOf(scope);
                scope = names[(i + 1) % names.length];
                $('g-in').value = ''; msg(''); render();
            });
            kindBtns.forEach(b => bind(b, 'click', () => { tab = b.dataset.tab; $('g-in').value = ''; msg(''); render(); }));

            bind($('g-close'), 'click', () => close());
            bind($('g-tut'), 'click', () => {
                close();
                setTimeout(() => startOnboarding(120), 440);
            });

            let pickedInfo = null, pickedRid = '';
            const placeHl = r => {
                hl.style.cssText = `display:block;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
            };

            showInfoImpl = function (info, rect, rid) {
                pickedInfo = info;
                pickedRid = rid || '';
                placeHl(rect);
                $('g-sub2').textContent = '<' + info.tag + '>' + (info.host && info.host !== HOST ? ' · ' + info.host : '');

                const rows = [['ID', info.id], ['Class', info.cls], ['Name', info.name],
                    ['Selector', info.sel], ['Href', info.href], ['Src', info.src],
                    ['Shadow DOM', info.shadow ? 'Ẩn qua phần tử chủ <' + info.shadow + '>' : ''],
                    ['Khung nhúng', info.host && info.host !== HOST ? info.host : ''],
                    ['Chặn theo tên miền', info.hideSel]];
                const box = $('g-info');
                box.innerHTML = '';
                const idleCp = ic('copy', 14) + '<span>Sao chép</span>';
                rows.forEach(([label, val]) => {
                    if (!val) return;
                    const row = document.createElement('div');
                    row.className = 'g-info';
                    const left = document.createElement('div');
                    const sm = document.createElement('small');
                    sm.textContent = label;
                    const code = document.createElement('code');
                    code.textContent = val;
                    left.append(sm, code);
                    const b = document.createElement('button');
                    b.className = 'g-cp';
                    b.innerHTML = idleCp;
                    bind(b, 'click', async () => flash(b, await copyText(val), idleCp));
                    if (label === 'Src' && info.qcKey) {
                        const q = document.createElement('button');
                        q.className = 'g-cp g-qc';
                        q.innerHTML = ic('shield', 14) + '<span>Chặn lớp QC</span>';
                        bind(q, 'click', applyCmd('qc'));
                        const col = document.createElement('span');
                        col.className = 'g-rcol';
                        col.append(b, q);
                        row.append(left, col);
                    } else row.append(left, b);
                    box.appendChild(row);
                });
                if (!box.children.length) box.innerHTML = '<div class="g-empty" style="padding:14px">Phần tử không có id / class / name</div>';

                /* nút chặn nhanh URL: link hoặc nguồn tải ngoài trang -> thêm vào tab Liên kết */
                const bb = $('g-blk');
                bb.style.display = info.blkHost ? '' : 'none';
                bb.lastElementChild.textContent = 'Chặn ' + info.blkHost;
                if (!ctl2.isOpen()) ctl2.open();
            };

            closeInfo = () => ctl2.close();
            bind($('g-close2'), 'click', () => closeInfo());

            const navCmd = c => () => {
                if (!pickedInfo) return;
                if (pickedRid) sendCmd(pickedRid, c); else handlePickCmd(c);
            };
            bind($('g-up'), 'click', navCmd('up'));
            bind($('g-under'), 'click', navCmd('under'));

            const idleAll = ic('copy', 15) + '<span>Sao chép tất cả</span>';
            bind($('g-copyall'), 'click', async (e, tg) => {
                if (!pickedInfo) return;
                const p = pickedInfo;
                const txt = [`tag: ${p.tag}`, p.id && `id: ${p.id}`, p.cls && `class: ${p.cls}`, p.name && `name: ${p.name}`,
                    `selector: ${p.sel}`, p.href && `href: ${p.href}`, p.src && `src: ${p.src}`,
                    p.host !== HOST && `frame: ${p.host}`].filter(Boolean).join('\n');
                flash(tg.closest('button') || $('g-copyall'), await copyText(txt), idleAll);
            });
            const applyCmd = c => () => {
                if (!pickedInfo) return;
                if (pickedRid) {
                    sendCmd(pickedRid, c);
                    /* nguồn nằm trong khung nhúng: khung tự lưu để chặn, trang chính cũng lưu để hiện ở tab Liên kết */
                    if (c === 'qc' && pickedInfo.qcKey) qcSave(pickedInfo.qcKey);
                    const h = pickedInfo.host;
                    setTimeout(() => loadFrameHost(h), 800);
                } else handlePickCmd(c);
                render();
                closeInfo();
            };
            bind($('g-hideit'), 'click', applyCmd('hide'));
            bind($('g-blk'), 'click', applyCmd('blk'));
        }

        render = function () {
            dot.classList.toggle('off', !set.on);
            applyColor();
            applyPick();
            if (!set.on) {
                stopPress();
                if (built && ctl2.isOpen()) closeInfo();
            }
            if (built) renderSheet();
        };

        showPick = (info, rect, rid) => { build(); showInfoImpl(info, rect, rid); };

        const close = () => { if (ctl1) ctl1.close(); };
        const open = () => {
            build();
            render();
            ctl1.open();
            setTimeout(() => {
                syncFromStore();
                scanFrameRules().then(() => { if (built) renderSheet(); });
            }, 650);
        };

        let hold = null, redT = null, opened = false;
        const cancel = () => {
            clearTimeout(hold); clearTimeout(redT);
            hold = null; redT = null;
            dot.classList.remove('hold');
        };
        bind(dot, 'pointerdown', e => {
            e.preventDefault();
            cancel();
            opened = false;
            redT = setTimeout(() => { redT = null; dot.classList.add('hold'); }, RED_MS);
            hold = setTimeout(() => { opened = true; cancel(); open(); }, HOLD_MS);
        });
        bind(dot, 'pointerup', () => {
            const was = hold !== null;
            cancel();
            if (was && !opened) {
                set.on = !set.on;
                gWrite('settings', set);
                render();
                applyRules();
            }
        });
        bind(dot, 'pointercancel', cancel);
        bind(dot, 'pointerleave', cancel);
        bind(dot, 'contextmenu', e => e.preventDefault());

        const pingDot = () => {
            dot.classList.add('ob-ping');
            setTimeout(() => dot.classList.remove('ob-ping'), 3800);
        };

        /* ═════════ Chào mừng + hướng dẫn · phong cách backgrounds.supply, làm sạch theo unslop ═════════
           Direction
           · Sản phẩm: Dot Ads, chặn quảng cáo trên mọi trang web chỉ bằng một chấm nhỏ
           · Tính cách: yên tĩnh, chính xác, hơi ấm như ánh đèn ban đêm
           · Thế giới: bầu trời đêm và hình nền aurora (đúng tinh thần backgrounds.supply)
           · Khoảnh khắc: mỗi trang hướng dẫn có một thẻ minh hoạ aurora; mọi thứ còn lại giữ yên tĩnh
           · Dấu ấn: chấm tròn nhỏ, màu hồng, đứng trước nhãn từng trang
           Credit: quy trình dựa trên unslop của Damir Sokolovsky (@heydamir), CC BY 4.0 */
        const PK = '#f0477a';
        const SERIF = "'Playfair Display','Instrument Serif',Georgia,'Times New Roman',serif";

        /* thang trung tính nghiêng về tím đen: nền #0d080b · mặt #181116 · chữ #f7f0f4 (chính) / 62% (phụ) / 40% (mờ) */
        const UI_CSS = `
.ai{position:relative;display:block;flex:none;width:var(--s,56px);height:var(--s,56px);border-radius:28%;
    background:linear-gradient(180deg,#f65f8b 0%,#e23c6c 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.4)}
.ai::after{content:"";position:absolute;left:50%;top:50%;width:26%;height:26%;margin:-13% 0 0 -13%;border-radius:50%;background:#4f0b29;
    box-shadow:0 0 0 calc(var(--s,56px)*.07) rgba(79,11,41,.24)}
.hl{font-family:var(--sf);font-style:italic;font-weight:500;font-size:1.08em;letter-spacing:-.01em;color:var(--pk)}
.bt{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:52px;border-radius:26px;
    background:#f7f0f4;color:#170a11;font:500 17px/1 var(--ff);letter-spacing:-.01em;
    box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgba(23,10,17,.1);
    transition:background-color .16s var(--ease),transform .16s var(--ease),opacity .4s var(--ease)}
.bt svg{transition:transform .28s var(--ease)}
.bt.pr{transform:scale(.97);background:#e7dde2}
.bt.pr svg{transform:translateX(3px)}
@media (hover:hover){.bt:hover{background:#fff}.bt.pr:hover{background:#e7dde2}}
.bt:focus-visible,.bt2:focus-visible,.nv-b:focus-visible{outline:2px solid var(--pk);outline-offset:2px}
.bt2{display:flex;align-items:center;justify-content:center;width:100%;height:48px;border-radius:24px;color:rgba(247,240,244,.62);font:500 15px/1 var(--ff);
    transition:color .16s var(--ease),background-color .16s var(--ease),transform .16s var(--ease)}
.bt2.pr{transform:scale(.97);color:#f7f0f4;background:rgba(255,255,255,.06)}
@media (hover:hover){.bt2:hover{color:#f7f0f4}}
`;

        /* nút: chạm là thu nhẹ 3%, đổi nền một nấc, mũi tên nhích 3px; không ripple, không nảy */
        const pressable = b => {
            const on = () => b.classList.add('pr'), off = () => b.classList.remove('pr');
            bind(b, 'pointerdown', on);
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => bind(b, t, off));
        };

        /* ───────────── Chào mừng lần đầu: giữ khung bottom-sheet của bản gốc, nền trơn ───────────── */
        async function startWelcome() {
            const KEY = 'welcome';
            if (!CONFIG.welcomeReplay) {
                const d = await gReadRaw(KEY);
                if (d && d.done) return;
            }
            await ready(900);
            if (wlEl || obEl || document.getElementById('gdar-land')) return;

            const WL_CSS = `
.wl,.wl *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box}
.wl{--pk:${PK};--sf:${SERIF};--ease:cubic-bezier(.2,.8,.2,1);position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:hidden;
    z-index:2147483647;background:transparent;color:#f7f0f4;font-family:var(--ff);touch-action:none;overscroll-behavior:none;
    visibility:hidden;transition:visibility 0s linear .5s;-webkit-font-smoothing:antialiased}
.wl::backdrop{display:none}
.wl.show{visibility:visible;transition:visibility 0s}
.wl-bd{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .4s var(--ease);will-change:opacity}
.wl.show .wl-bd{opacity:.56}
.wl-sh{position:absolute;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));margin:0 auto;max-width:520px;padding:32px 24px 12px;
    border-radius:40px;text-align:center;overflow:hidden;isolation:isolate;background:#080306;box-shadow:inset 0 0 0 1px rgba(255,238,246,.08),0 24px 48px -12px rgba(0,0,0,.6);
    opacity:0;transform:translate3d(0,32px,0);transition:transform .48s var(--ease),opacity .28s ease;will-change:transform,opacity}
.wl.show .wl-sh{opacity:1;transform:translate3d(0,0,0)}
.wl-gl{position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:inherit;overflow:hidden}
.wl-gl i{position:absolute;display:block;pointer-events:none;will-change:transform}
.wl-gl .a{left:-34%;top:-40%;width:104%;height:96%;background:radial-gradient(closest-side,rgba(222,98,156,.92),rgba(222,98,156,0));animation:wlA 11s ease-in-out infinite alternate}
.wl-gl .b{right:-40%;top:-30%;width:108%;height:104%;background:radial-gradient(closest-side,rgba(132,22,88,.96),rgba(132,22,88,0));animation:wlB 13s ease-in-out infinite alternate}
.wl-gl .c{left:8%;top:-52%;width:80%;height:72%;background:radial-gradient(closest-side,rgba(246,148,190,.5),rgba(246,148,190,0));animation:wlC 9s ease-in-out infinite alternate}
.wl-gl::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,3,6,0) 0%,rgba(8,3,6,.72) 54%,#080306 88%)}
@keyframes wlA{from{transform:translate3d(-8%,0,0) scale(1)}to{transform:translate3d(16%,12%,0) scale(1.14)}}
@keyframes wlB{from{transform:translate3d(8%,6%,0) scale(1.1)}to{transform:translate3d(-16%,-4%,0) scale(.92)}}
@keyframes wlC{from{transform:translate3d(-10%,0,0) scale(.96)}to{transform:translate3d(12%,8%,0) scale(1.08)}}
.wl-ic{--s:56px;margin:0 auto}
.wl-t{margin:24px auto 0;max-width:320px;font:500 28px/32px var(--ff);letter-spacing:-.025em;color:#f7f0f4;text-wrap:balance}
.wl-s{margin:12px auto 0;max-width:320px;font:400 15px/22px var(--ff);color:rgba(247,240,244,.76);text-wrap:pretty}
.wl-bt{margin-top:28px}
.wl-bt2{margin-top:4px}
.wl.show .wl-i{animation:wlUp .48s var(--ease) var(--d,0s) backwards}
@keyframes wlUp{from{opacity:0;transform:translate3d(0,12px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
.wl-w{display:inline-block;white-space:nowrap}
.wl-c{display:inline-block}
.wl.show .wl-c{animation:wlCh .8s var(--ease) calc(var(--bs,0s) + var(--i) * var(--st,24ms)) backwards}
@keyframes wlCh{0%{opacity:0;filter:blur(8px);text-shadow:0 0 14px rgba(255,255,255,.9)}55%{opacity:1;filter:blur(2px);text-shadow:0 0 10px rgba(255,255,255,.5)}100%{opacity:1;filter:blur(0);text-shadow:0 0 0 rgba(255,255,255,0)}}
${UI_CSS}
@media (prefers-reduced-motion:reduce){.wl *,.wl *::before,.wl *::after{animation:none!important;transition-duration:.01s!important}}`;

            const css = document.createElement('style');
            css.textContent = WL_CSS;
            root.appendChild(css);

            const el = document.createElement('div');
            el.className = 'wl';
            el.setAttribute('popover', 'manual');
            el.innerHTML = `<div class="wl-bd"></div>
                <div class="wl-sh" role="dialog" aria-label="Chào mừng đến với Dot Ads">
                    <div class="wl-gl"><i class="a"></i><i class="b"></i><i class="c"></i></div>
                    <i class="ai wl-ic wl-i" style="--d:.08s"></i>
                    <div class="wl-t wl-i" style="--d:.14s">Duyệt web <em class="hl">sạch bóng</em> chỉ với một chạm</div>
                    <div class="wl-s wl-i" style="--d:.2s">Dot Ads quét banner, popup và tab lạ ngay khi trang vừa tải. Làm quen chưa đến một phút, bỏ qua cũng được.</div>
                    <button class="bt wl-bt wl-go wl-i" style="--d:.26s"><span>Xem hướng dẫn</span>${ic('chev', 18)}</button>
                    <button class="bt2 wl-bt2 wl-skip wl-i" style="--d:.3s">Bỏ qua</button>
                </div>`;
            root.appendChild(el);
            wlEl = el;

            /* chữ hiện từng ký tự: mờ và phát sáng ở đầu sóng, rõ dần phía sau, như ảnh mẫu */
            const glowSplit = (root, base, step) => {
                let n = 0;
                const walk = node => {
                    Array.from(node.childNodes).forEach(c => {
                        if (c.nodeType === 3) {
                            const frag = document.createDocumentFragment();
                            c.textContent.normalize('NFC').split(/(\s+)/).forEach(tok => {
                                if (!tok) return;
                                if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
                                const w = document.createElement('span');
                                w.className = 'wl-w';
                                Array.from(tok).forEach(ch => {
                                    const k = document.createElement('span');
                                    k.className = 'wl-c';
                                    k.textContent = ch;
                                    k.style.setProperty('--i', n++);
                                    w.appendChild(k);
                                });
                                frag.appendChild(w);
                            });
                            node.replaceChild(frag, c);
                        } else if (c.nodeType === 1) walk(c);
                    });
                };
                root.setAttribute('aria-label', root.textContent);
                walk(root);
                root.style.setProperty('--bs', base + 's');
                root.style.setProperty('--st', step + 'ms');
            };
            glowSplit(el.querySelector('.wl-t'), .2, 26);
            glowSplit(el.querySelector('.wl-s'), .55, 9);
            syncBusy();

            let closing = false;
            const finish = tour => {
                if (closing) return;
                closing = true;
                gWrite(KEY, { done: 1, tour: tour ? 1 : 0 });
                el.classList.remove('show');
                setTimeout(() => {
                    tryQ(() => el.hidePopover());
                    el.remove(); css.remove();
                    wlEl = null;
                    syncBusy();
                    if (tour) startOnboarding(60); else pingDot();
                }, 520);
            };
            const go = el.querySelector('.wl-go'), skip = el.querySelector('.wl-skip');
            pressable(go); pressable(skip);
            bind(go, 'click', () => finish(true));
            bind(skip, 'click', () => finish(false));
            bind(el, 'touchmove', e => { if (e.cancelable) e.preventDefault(); });

            reveal(el);
        }

        /* ───────────── Hướng dẫn sử dụng · 5 trang ───────────── */
        function startOnboarding(delay) {
            if (obEl) return;
            const RM = tryQ(() => matchMedia('(prefers-reduced-motion: reduce)').matches, false);
            const wait = ms => new Promise(r => setTimeout(r, ms));
            const EASE = 'cubic-bezier(.2,.8,.2,1)';
            const STEP = 24, DUR = 480, PAGE_MS = 8500;

            const pill = (cls, txt) => `<span class="il-pill ${cls}">${txt}</span>`;
            const okTxt = t => ic('check', 12) + t;
            const fr = () => '<div class="il">';
            const bar = (l, t, w) => `<i class="il-bar" style="left:${l}px;top:${t}px;width:${w}px"></i>`;

            /* *từ* = chữ nhấn (serif nghiêng, hồng) */
            const PAGES = [
                {
                    e: 'Tự động chặn',
                    t: 'Một chấm nhỏ, trang web *sạch* *bóng*',
                    s: 'Banner, popup và tab lạ bị quét sạch ngay khi trang vừa tải. Bạn chỉ việc đọc, xem và lướt.',
                    v: () => fr() +
                        '<div class="il-pg">' +
                        '<div class="il-ad il-a1">Tải ứng dụng</div>' + bar(16, 64, 128) + bar(16, 80, 220) +
                        '<div class="il-ad il-a2"><span>Quảng cáo</span><i></i></div>' + bar(16, 196, 208) + bar(16, 212, 236) + bar(16, 228, 148) +
                        '<div class="il-ad il-a3"><span>Quảng cáo</span><i></i></div><i class="il-sw"></i></div>' +
                        pill('il-p1', okTxt('Đã chặn 3 quảng cáo')) + '</div>'
                },
                {
                    e: 'Bật hoặc tắt',
                    t: 'Chạm *một* *lần*, bật hay tắt',
                    s: 'Trang nào đó bị chặn nhầm? Chạm vào chấm để tạm dừng, chạm lần nữa là lá chắn quay lại ngay.',
                    v: () => fr() + '<div class="il-pg">' + bar(16, 16, 112) + bar(16, 32, 200) +
                        '<div class="il-ad il-a5"><span>Quảng cáo</span><i></i></div>' +
                        '<div class="il-sf">' + bar(16, 60, 236) + bar(16, 76, 180) + bar(16, 92, 208) + '<b class="il-im" style="top:116px"></b></div>' +
                        '<i class="il-dot il-dc"></i><i class="il-fg a"></i></div>' +
                        pill('il-pa', '<i class="il-pd"></i>Đang bật') + pill('il-pb', '<i class="il-pd off"></i>Đã tạm dừng') + '</div>'
                },
                {
                    e: 'Bảng điều khiển',
                    t: 'Giữ chấm để *toàn* *quyền* kiểm soát',
                    s: 'Giữ đến khi chấm chuyển đỏ để bật tắt từng tính năng, thêm phần tử, từ khoá hay liên kết cần chặn.',
                    v: () => fr() + '<div class="il-pg">' + bar(16, 16, 112) + bar(16, 32, 200) + bar(16, 60, 236) + bar(16, 76, 180) + '<b class="il-im" style="top:100px"></b>' +
                        '<i class="il-dot il-hd"></i><svg class="il-hr" viewBox="0 0 36 36"><circle class="t" cx="18" cy="18" r="16"/><circle class="p" cx="18" cy="18" r="16"/></svg><i class="il-fg b"></i>' +
                        '<i class="il-scr"></i><div class="il-sh3"><i class="il-gb"></i>' +
                        '<div class="il-rw">Tự động chặn<u class="il-tg on"><b></b></u></div>' +
                        '<div class="il-rw">Chặn popup<u class="il-tg a"><b></b></u></div>' +
                        '<div class="il-rw">Chặn liên kết<u class="il-tg on"><b></b></u></div></div></div>' +
                        pill('il-hp', 'Giữ đến khi chấm đỏ') + pill('il-hq', 'Bật tắt từng tính năng') + '</div>'
                },
                {
                    e: 'Ẩn phần tử',
                    t: 'Thấy phiền là *ẩn* ngay',
                    s: 'Nhấn giữ bất kỳ phần tử nào để xem chi tiết, rồi ẩn đi hoặc chặn luôn liên kết quảng cáo của nó.',
                    v: () => fr() +
                        '<div class="il-pg il-pg4">' + bar(16, 16, 112) + bar(16, 32, 208) +
                        '<div class="il-ad il-a4"><span>Quảng cáo</span><i></i></div><b class="il-sel"></b><em class="il-tag">div.banner</em>' +
                        '<div class="il-dn">' + bar(16, 148, 176) + bar(16, 164, 128) + '</div></div>' +
                        '<div class="il-ab"><span>Ẩn</span><span>Chặn link</span></div><i class="il-fg c"></i>' +
                        pill('il-t4', okTxt('Đã ẩn phần tử')) + '</div>'
                },
                {
                    e: 'Ghi nhớ',
                    t: 'Càng dùng, càng *sạch*',
                    s: 'Dot Ads nhớ khung quảng cáo và popup trên từng trang. Lần sau chúng bị chặn ngay từ đầu, chưa kịp hiện ra.',
                    v: () => fr() + '<div class="il-mm"><div class="il-mn"><strong>10</strong><small>khung quảng cáo đã nhớ</small></div>' +
                        [['tin-nhanh.vn', 'T', 3], ['xem-phim.net', 'X', 5], ['doc-bao.vn', 'Đ', 2]].map((r, i) =>
                        `<div class="il-mr" style="top:${96 + i * 52}px;--i:${i};--w:${r[2] / 5}"><i class="il-mt">${r[1]}</i><div class="il-mx"><span>${r[0]}</span><u><b></b></u></div><em>${r[2]}</em></div>`).join('') +
                        '</div>' + pill('il-bk', ic('bookmark', 12) + 'Đã nhớ cho lần sau') + '</div>'
                }
            ];

            const OB_CSS = `
.ob,.ob *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;box-sizing:border-box}
.ob{--pk:${PK};--sf:${SERIF};--ease:${EASE};position:fixed;inset:0;width:auto;height:auto;max-width:none;max-height:none;margin:0;padding:0;border:0;overflow:hidden;
    z-index:2147483647;background:transparent;color:#f7f0f4;font-family:var(--ff);touch-action:none;overscroll-behavior:none;
    visibility:hidden;transition:visibility 0s linear .6s;-webkit-font-smoothing:antialiased}
.ob::backdrop{display:none}
.ob.show{visibility:visible;transition:visibility 0s}
.ob-bg{position:absolute;inset:0;overflow:hidden;background:#050204;opacity:0;transition:opacity .5s var(--ease);will-change:opacity}
.ob-bg i{position:absolute;display:block;pointer-events:none;will-change:transform}
.ob-bg .g1{left:-70%;top:30%;width:150%;height:62%;background:radial-gradient(closest-side,rgba(158,40,98,.8),rgba(158,40,98,0));animation:obG1 14s ease-in-out infinite alternate}
.ob-bg .g2{right:-80%;top:52%;width:160%;height:66%;background:radial-gradient(closest-side,rgba(96,16,60,.85),rgba(96,16,60,0));animation:obG2 17s ease-in-out infinite alternate}
.ob-bg .g3{left:-40%;top:42%;width:90%;height:36%;background:radial-gradient(closest-side,rgba(214,86,142,.38),rgba(214,86,142,0));animation:obG3 10s ease-in-out infinite alternate}
.ob-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#050204 0%,rgba(5,2,4,.85) 18%,rgba(5,2,4,0) 46%,rgba(5,2,4,.35) 100%)}
@keyframes obG1{from{transform:translate3d(-6%,-16%,0) scale(1)}to{transform:translate3d(14%,18%,0) scale(1.15)}}
@keyframes obG2{from{transform:translate3d(8%,14%,0) scale(1.1)}to{transform:translate3d(-16%,-22%,0) scale(.94)}}
@keyframes obG3{from{transform:translate3d(-8%,-40%,0) scale(1)}to{transform:translate3d(30%,60%,0) scale(1.2)}}
@media (prefers-reduced-motion:reduce){.ob-bg i{animation:none!important}}
.ob.show .ob-bg{opacity:1}
.ob-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .6s var(--ease)}
.ob.show .ob-cv{opacity:1}
.ob-in{position:absolute;inset:0;display:flex;flex-direction:column;opacity:0;transition:opacity .4s var(--ease);
    padding:calc(env(safe-area-inset-top,0px) + 72px) 0 calc(env(safe-area-inset-bottom,0px) + 16px)}
.ob.show .ob-in{opacity:1}
.ob-bar{position:absolute;left:0;right:0;top:env(safe-area-inset-top,0px);height:2px;z-index:7;pointer-events:none}
.ob-bar b{display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:0 50%;border-radius:0 1px 1px 0;background:var(--pk);will-change:transform}
.nv{position:absolute;left:16px;right:16px;top:calc(env(safe-area-inset-top,0px) + 16px);z-index:6;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:36px}
.nv-b{justify-self:start}.nv-c{justify-self:end}
.nv-b{display:flex;align-items:center;justify-content:center;height:36px;padding:0 16px;border-radius:18px;background:#f7f0f4;color:#170a11;font:500 14px/1 var(--ff);
    transition:background-color .16s var(--ease),transform .16s var(--ease)}
.nv-b.pr{transform:scale(.96);background:#e7dde2}
.nv-c{display:flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 12px;border-radius:18px;background:rgba(255,255,255,.08);
    color:rgba(247,240,244,.62);font:500 13px/1 var(--ff);font-variant-numeric:tabular-nums}
.ob-stage{flex:1 1 0;min-height:0;position:relative}
.ob-v{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;will-change:transform,opacity;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.ob-fr{position:relative;flex:none;width:300px;height:340px;transform:scale(var(--k,1))}
.ob-txt{padding:16px 28px 0;text-align:center;min-height:192px}
.ob-eb{display:inline-flex;align-items:center;gap:8px;height:16px;margin-bottom:12px;font:500 13px/16px var(--ff);color:rgba(247,240,244,.62)}
.ob-eb::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--pk)}
.ob-t{font:500 28px/32px var(--ff);letter-spacing:-.025em;max-width:340px;margin:0 auto;color:#f7f0f4;text-wrap:balance}
.ob-s{font:400 15px/22px var(--ff);max-width:320px;margin:12px auto 0;color:rgba(247,240,244,.74);text-wrap:pretty}
.ob .w{display:inline-block;will-change:opacity,transform}
.bt.ob-btn{width:calc(100% - 48px);max-width:336px;margin:24px auto 0;opacity:.4;transform:translate3d(0,8px,0);pointer-events:none}
.bt.ob-btn.on{opacity:1;transform:none;pointer-events:auto}
.bt.ob-btn.on.pr{transform:scale(.97)}
${UI_CSS}

/* ── ảnh minh hoạ: bề mặt tối, hairline, một màu nhấn hồng, cùng font với giao diện ── */
.il{position:relative;width:300px;height:340px;--s1:#150b11;--s2:#1e1218;--hl:rgba(255,238,246,.08);--pkd:rgba(240,71,122,.14);--pkb:rgba(240,71,122,.6)}
.il-pill{position:absolute;left:0;right:0;margin:0 auto;width:max-content;top:288px;display:flex;align-items:center;gap:8px;height:40px;padding:0 16px;border-radius:20px;background:var(--s2);box-shadow:inset 0 0 0 1px var(--hl);color:#f7f0f4;font:500 13px/1 var(--ff);white-space:nowrap}
.il-pill svg{color:var(--pk)}
.il-fg{position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(247,240,244,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.45),0 0 0 8px rgba(247,240,244,.06);opacity:0;pointer-events:none}
.il-pg{position:absolute;left:0;top:0;width:300px;height:264px;border-radius:24px;overflow:hidden;background:var(--s1);box-shadow:inset 0 0 0 1px var(--hl)}
.il-bar{position:absolute;height:8px;border-radius:4px;background:rgba(255,238,246,.1)}
.il-ad{position:absolute;border-radius:12px;border:1px dashed var(--pkb);background:var(--pkd);color:rgba(247,240,244,.86);font:500 11px/16px var(--ff)}
.il-ad span{position:absolute;left:12px;top:8px}
.il-ad i{position:absolute;left:12px;bottom:12px;width:40%;height:6px;border-radius:3px;background:rgba(240,71,122,.35)}

/* 1 · quét sạch trang */
.il-a1{left:16px;top:16px;width:268px;height:32px;padding:7px 12px;animation:ilO3 6.5s ease-in-out infinite}
.il-a2{left:16px;top:108px;width:268px;height:72px;animation:ilO2 6.5s ease-in-out infinite}
.il-a3{left:40px;top:88px;width:220px;height:112px;border-style:solid;background:#2a1020;box-shadow:0 16px 32px -8px rgba(0,0,0,.6);animation:ilO1 6.5s ease-in-out infinite}
.il-a3 span{top:12px;left:16px}.il-a3 i{left:16px;bottom:16px}
.il-sw{position:absolute;left:0;right:0;top:0;height:2px;background:var(--pk);opacity:0;animation:ilSw 6.5s cubic-bezier(.4,0,.6,1) infinite}
@keyframes ilSw{0%{opacity:0;transform:translateY(0)}4%{opacity:1}52%{opacity:1;transform:translateY(262px)}58%,100%{opacity:0;transform:translateY(262px)}}
@keyframes ilO3{0%,6%{opacity:1;transform:none}12%,93%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
@keyframes ilO1{0%,18%{opacity:1;transform:none}24%,93%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
@keyframes ilO2{0%,28%{opacity:1;transform:none}34%,93%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
.il-p1{animation:ilP 6.5s ease-in-out infinite}
@keyframes ilP{0%,58%{opacity:0;transform:translateY(8px)}66%,90%{opacity:1;transform:none}98%,100%{opacity:0;transform:none}}

/* chấm: nhỏ, có khối, cùng ngôn ngữ với biểu tượng ứng dụng */
.il-dot{position:absolute;width:20px;height:20px;border-radius:50%;background:var(--ne);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -3px 5px rgba(0,0,0,.2),0 4px 8px -2px rgba(0,0,0,.6)}
.il-dot::before{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(110% 80% at 32% 8%,rgba(255,255,255,.5),rgba(255,255,255,0) 54%)}
.il-im{position:absolute;left:16px;width:268px;height:100px;border-radius:12px;background:rgba(255,238,246,.06)}
.il-fg.a,.il-fg.b{left:244px;top:212px}

/* 2 · chạm chấm: quảng cáo hiện ra khi tắt, biến mất khi bật */
.il-a5{left:16px;top:60px;width:268px;height:72px;opacity:0;animation:ilAd 7s cubic-bezier(.3,.7,.2,1) infinite}
.il-sf{position:absolute;inset:0;animation:ilSf 7s cubic-bezier(.5,0,.2,1) infinite}
.il-dc{left:256px;top:224px;animation:ilDc 7s ease-in-out infinite}
.il-fg.a{animation:ilTp 7s ease-in-out infinite}
.il-pd{display:block;width:8px;height:8px;border-radius:50%;background:var(--ne)}
.il-pd.off{background:#7c6a74}
.il-pa{animation:ilPa 7s ease-in-out infinite}
.il-pb{opacity:0;animation:ilPb 7s ease-in-out infinite}
@keyframes ilAd{0%,34%{opacity:0;transform:translateY(-8px)}42%,66%{opacity:1;transform:none}72%,100%{opacity:0;transform:translateY(-8px)}}
@keyframes ilSf{0%,34%{transform:none}44%,66%{transform:translateY(88px)}74%,100%{transform:none}}
@keyframes ilDc{0%,32%{background:var(--ne);transform:scale(1)}34%{transform:scale(.8)}38%,66%{background:#5a4852;transform:scale(1)}68%{transform:scale(.8)}72%,100%{background:var(--ne);transform:scale(1)}}
@keyframes ilTp{0%,22%{opacity:0;transform:translate(10px,16px) scale(1.1)}28%{opacity:1;transform:none}32%{opacity:1;transform:scale(.86)}36%{opacity:1;transform:none}42%,54%{opacity:0;transform:translate(10px,16px) scale(1.1)}60%{opacity:1;transform:none}66%{opacity:1;transform:scale(.86)}70%{opacity:1;transform:none}78%,100%{opacity:0;transform:translate(10px,16px) scale(1.1)}}
@keyframes ilPa{0%,34%{opacity:1}38%,68%{opacity:0}72%,100%{opacity:1}}
@keyframes ilPb{0%,34%{opacity:0}38%,68%{opacity:1}72%,100%{opacity:0}}

/* 3 · giữ chấm: vòng tiến độ đầy, chấm chuyển đỏ, bảng điều khiển trượt lên */
.il-hd{left:256px;top:224px;animation:ilHd 7s ease-in-out infinite}
.il-hr{position:absolute;left:248px;top:216px;width:36px;height:36px}
.il-hr circle{fill:none;stroke-width:2}
.il-hr .t{stroke:rgba(255,238,246,.14)}
.il-hr .p{stroke-dasharray:101;stroke-dashoffset:101;transform:rotate(-90deg);transform-origin:50% 50%;transform-box:fill-box;animation:ilHr 7s ease-in-out infinite}
.il-fg.b{animation:ilHf 7s ease-in-out infinite}
.il-scr{position:absolute;inset:0;background:rgba(0,0,0,.4);opacity:0;animation:ilHc 7s ease-out infinite}
.il-sh3{position:absolute;left:8px;right:8px;bottom:8px;height:168px;padding:16px 0 8px;border-radius:20px;background:var(--s2);box-shadow:inset 0 0 0 1px var(--hl);transform:translateY(190px);animation:ilHs 7s cubic-bezier(.3,.7,.2,1) infinite}
.il-gb{position:absolute;top:8px;left:50%;width:32px;height:4px;margin-left:-16px;border-radius:2px;background:rgba(255,238,246,.2)}
.il-rw{display:flex;align-items:center;justify-content:space-between;gap:12px;height:48px;padding:0 20px;font:500 15px/1 var(--ff);color:#f7f0f4}
.il-rw+.il-rw{box-shadow:inset 0 1px 0 rgba(255,238,246,.06)}
.il-tg{position:relative;flex:none;width:44px;height:24px;border-radius:12px;background:rgba(255,238,246,.16)}
.il-tg b{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#f7f0f4}
.il-tg.on{background:var(--pk)}.il-tg.on b{transform:translateX(20px)}
.il-tg.a{animation:ilTg 7s linear infinite}.il-tg.a b{animation:ilKn 7s cubic-bezier(.4,0,.2,1) infinite}
.il-hp{animation:ilHp 7s ease-in-out infinite}
.il-hq{opacity:0;animation:ilHq 7s ease-in-out infinite}
@keyframes ilHd{0%,10%{background:var(--ne);transform:scale(1)}12%,30%{transform:scale(.88)}34%,90%{background:#ff5a64;transform:scale(1)}98%,100%{background:var(--ne);transform:scale(1)}}
@keyframes ilHr{0%,12%{stroke-dashoffset:101;stroke:#fff;opacity:1}32%{stroke-dashoffset:0;stroke:#ff5a64;opacity:1}40%{stroke-dashoffset:0;stroke:#ff5a64;opacity:1}46%,100%{stroke-dashoffset:0;stroke:#ff5a64;opacity:0}}
@keyframes ilHf{0%,4%{opacity:0;transform:translate(10px,16px) scale(1.1)}9%{opacity:1;transform:none}12%,32%{opacity:1;transform:scale(.88)}38%,100%{opacity:0;transform:translate(10px,16px) scale(1.1)}}
@keyframes ilHc{0%,38%{opacity:0}50%,88%{opacity:1}96%,100%{opacity:0}}
@keyframes ilHs{0%,38%{transform:translateY(190px)}50%,88%{transform:none}96%,100%{transform:translateY(190px)}}
@keyframes ilTg{0%,60%{background:rgba(255,238,246,.16)}66%,100%{background:var(--pk)}}
@keyframes ilKn{0%,60%{transform:none}66%,100%{transform:translateX(20px)}}
@keyframes ilHp{0%,4%{opacity:0}9%,32%{opacity:1}40%,100%{opacity:0}}
@keyframes ilHq{0%,50%{opacity:0}56%,88%{opacity:1}96%,100%{opacity:0}}

/* 4 · chọn phần tử, bấm Ẩn */
.il-pg4{height:196px}
.il-a4{left:16px;top:60px;width:268px;height:72px;animation:ilCw 6.5s cubic-bezier(.5,0,.2,1) infinite}
@keyframes ilCw{0%,46%{opacity:1;transform:none}58%,92%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
.il-dn{position:absolute;inset:0;animation:ilDn 6.5s cubic-bezier(.5,0,.2,1) infinite}
@keyframes ilDn{0%,46%{transform:none}58%,92%{transform:translateY(-88px)}100%{transform:none}}
.il-sel{position:absolute;left:16px;top:60px;width:268px;height:72px;border-radius:12px;box-shadow:0 0 0 2px var(--pk);opacity:0;animation:ilSel 6.5s ease-in-out infinite}
.il-tag{position:absolute;left:16px;top:36px;height:20px;padding:0 8px;border-radius:6px;background:var(--pk);color:#1a0710;font:500 11px/20px var(--ff);opacity:0;animation:ilSel 6.5s ease-in-out infinite}
@keyframes ilSel{0%,10%{opacity:0}16%,50%{opacity:1}54%,100%{opacity:0}}
.il-ab{position:absolute;left:34px;top:212px;width:232px;height:48px;padding:4px;border-radius:24px;background:var(--s2);box-shadow:inset 0 0 0 1px var(--hl);display:flex;gap:4px;opacity:0;animation:ilAb 6.5s ease-in-out infinite}
.il-ab span{flex:1;display:flex;align-items:center;justify-content:center;border-radius:20px;font:500 13px/1 var(--ff);color:rgba(247,240,244,.86)}
.il-ab span:first-child{background:#f7f0f4;color:#170a11}
@keyframes ilAb{0%,16%{opacity:0;transform:translateY(8px)}24%,52%{opacity:1;transform:none}58%,100%{opacity:0;transform:none}}
.il-fg.c{left:72px;top:224px;animation:ilF4 6.5s ease-in-out infinite}
@keyframes ilF4{0%,26%{opacity:0;transform:translate(10px,16px) scale(1.1)}32%{opacity:1;transform:none}40%{opacity:1;transform:scale(.86)}44%{opacity:1;transform:none}52%,100%{opacity:0;transform:translate(10px,16px) scale(1.1)}}
.il-t4{animation:ilT4 6.5s ease-in-out infinite}
@keyframes ilT4{0%,60%{opacity:0;transform:translateY(8px)}68%,92%{opacity:1;transform:none}98%,100%{opacity:0;transform:none}}

/* 5 · bảng ghi nhớ: một bề mặt, con số lớn, mỗi trang một thanh đầy dần */
.il-mm{position:absolute;left:0;top:0;width:300px;height:260px;border-radius:24px;overflow:hidden;background:var(--s1);box-shadow:inset 0 0 0 1px var(--hl)}
.il-mn strong{position:absolute;left:20px;top:16px;font:500 44px/48px var(--ff);letter-spacing:-.03em;font-variant-numeric:tabular-nums;color:#f7f0f4}
.il-mn small{position:absolute;left:20px;top:64px;font:400 13px/16px var(--ff);color:rgba(247,240,244,.62)}
.il-mr{position:absolute;left:0;width:300px;height:52px;box-shadow:inset 0 1px 0 rgba(255,238,246,.06)}
.il-mt{position:absolute;left:20px;top:10px;width:32px;height:32px;border-radius:10px;background:rgba(255,238,246,.08);box-shadow:inset 0 0 0 1px rgba(255,238,246,.06);font:italic 500 16px/32px var(--sf);text-align:center;color:#f7f0f4}
.il-mx{position:absolute;left:64px;right:56px;top:0;height:52px}
.il-mx span{position:absolute;left:0;top:11px;font:500 14px/16px var(--ff);color:#f7f0f4}
.il-mx u{position:absolute;left:0;right:0;top:33px;height:4px;border-radius:2px;background:rgba(255,238,246,.08);text-decoration:none;overflow:hidden}
.il-mx b{display:block;width:100%;height:100%;border-radius:2px;background:var(--pk);transform-origin:0 50%;transform:scaleX(0);animation:ilBf 6.5s cubic-bezier(.3,.7,.2,1) infinite;animation-delay:calc(var(--i) * .25s)}
.il-mr em{position:absolute;right:20px;top:18px;font:500 14px/16px var(--ff);font-style:normal;font-variant-numeric:tabular-nums;color:rgba(247,240,244,.62);opacity:0;animation:ilCt 6.5s ease-out infinite;animation-delay:calc(var(--i) * .25s)}
@keyframes ilBf{0%,8%{transform:scaleX(0)}34%,88%{transform:scaleX(var(--w))}96%,100%{transform:scaleX(0)}}
@keyframes ilCt{0%,14%{opacity:0}30%,88%{opacity:1}96%,100%{opacity:0}}
.il-bk{animation:ilBk 6.5s ease-in-out infinite}
@keyframes ilBk{0%,50%{opacity:0;transform:translateY(8px)}60%,88%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}
@media (prefers-reduced-motion:reduce){.ob *,.ob *::before,.ob *::after{animation-duration:.01s!important}}`;

            const css = document.createElement('style');
            css.textContent = OB_CSS;
            root.appendChild(css);

            const el = document.createElement('div');
            el.className = 'ob';
            el.setAttribute('popover', 'manual');
            el.innerHTML = `<div class="ob-bg"><i class="g1"></i><i class="g2"></i><i class="g3"></i></div><canvas class="ob-cv"></canvas>
                <div class="ob-in">
                    <div class="ob-bar"><b></b></div>
                    <div class="nv"><button class="nv-b ob-sk">Bỏ qua</button><i class="ai" style="--s:32px"></i><span class="nv-c ob-cn">1/${PAGES.length}</span></div>
                    <div class="ob-stage"></div>
                    <div class="ob-txt"><div class="ob-eb"></div><div class="ob-t"></div><div class="ob-s"></div></div>
                    <button class="bt ob-btn"><span class="ob-bl">Tiếp tục</span>${ic('chev', 18)}</button>
                </div>`;
            root.appendChild(el);
            obEl = el;
            syncBusy();

            const q = s => el.querySelector(s);
            const stage = q('.ob-stage'), tEl = q('.ob-t'), sEl = q('.ob-s'), eEl = q('.ob-eb'), btn = q('.ob-btn'), bl = q('.ob-bl');
            const barB = q('.ob-bar b'), cn = q('.ob-cn'), sk = q('.ob-sk');

            /* đốm hồng trôi chậm và nhấp nháy trên nền trơn; dừng khi tab ẩn, đứng yên nếu bật giảm chuyển động */
            const cv = q('.ob-cv'), cx = cv.getContext('2d');
            const DC = ['255,98,152', '240,71,122', '255,156,194'];
            let CW = 0, CH = 0, raf = 0, last = 0, dots = [];
            const seed = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                CW = el.clientWidth || window.innerWidth; CH = el.clientHeight || window.innerHeight;
                cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr);
                cx.setTransform(dpr, 0, 0, dpr, 0, 0);
                const n = Math.round(Math.min(64, Math.max(28, CW * CH / 14000)));
                dots = Array.from({ length: n }, () => ({
                    x: Math.random() * CW, y: Math.random() * CH, r: .6 + Math.random() * 1.5,
                    vy: -(4 + Math.random() * 10), vx: (Math.random() - .5) * 4,
                    ph: Math.random() * 6.28, sp: .4 + Math.random() * .9,
                    c: Math.random() < .8 ? DC[(Math.random() * 3) | 0] : '255,255,255'
                }));
            };
            const tick = t => {
                if (!RM) raf = requestAnimationFrame(tick);
                const dt = document.hidden || RM ? 0 : Math.min(.05, (t - last) / 1000);
                last = t;
                cx.clearRect(0, 0, CW, CH);
                for (const d of dots) {
                    d.y += d.vy * dt; d.x += d.vx * dt;
                    if (d.y < -4) { d.y = CH + 4; d.x = Math.random() * CW; }
                    if (d.x < -4) d.x = CW + 4; else if (d.x > CW + 4) d.x = -4;
                    const a = .25 + .65 * (.5 + .5 * Math.sin(t / 1000 * d.sp + d.ph));
                    cx.fillStyle = `rgba(${d.c},${a.toFixed(3)})`;
                    cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.2832); cx.fill();
                }
            };
            const startDots = () => { seed(); last = performance.now(); cancelAnimationFrame(raf); tick(last); };
            window.addEventListener('resize', seed);
            pressable(btn); pressable(sk);

            let cur = -1, busy = true, closing = false, vis = null, ws = [], tN = 0, prog = null, ebA = null;
            const stopProg = () => {
                if (prog) { prog.onfinish = null; tryQ(() => prog.commitStyles()); tryQ(() => prog.cancel()); prog = null; }
            };
            const barTo = n => {
                barB.style.transition = 'transform .5s ' + EASE;
                barB.style.transform = `scaleX(${n / PAGES.length})`;
            };
            const startProg = n => {
                stopProg();
                const N = PAGES.length;
                barB.style.transition = 'none';
                prog = barB.animate([{ transform: `scaleX(${n / N})` }, { transform: `scaleX(${(n + 1) / N})` }], { duration: PAGE_MS, easing: 'linear', fill: 'forwards' });
                prog.onfinish = () => { prog.onfinish = null; if (!closing && n < PAGES.length - 1 && !busy) go(n + 1); };
            };
            document.addEventListener('visibilitychange', () => { if (prog) tryQ(() => (document.hidden ? prog.pause() : prog.play())); });

            const fit = () => {
                const r = stage.getBoundingClientRect();
                if (!r.width) return;
                stage.style.setProperty('--k', Math.max(.5, Math.min(r.width / 332, r.height / 364, 1.1)).toFixed(3));
            };
            window.addEventListener('resize', fit);

            /* chữ vào: mờ → rõ, nhích lên 8px, lệch nhau 24ms; chữ ra: mờ dần */
            const IN_KF = RM ? [{ opacity: 0 }, { opacity: 1 }] : [
                { opacity: 0, transform: 'translate3d(0,8px,0)', filter: 'blur(8px)', textShadow: '0 0 14px rgba(255,255,255,.8)' },
                { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0)', textShadow: '0 0 0 rgba(255,255,255,0)' }];
            const OUT_KF = [{ opacity: 1 }, { opacity: 0 }];

            /* token bắt đầu bằng * → chữ nhấn (serif nghiêng, hồng) */
            const words = (box, text) => {
                box.textContent = '';
                let hl = false;
                return text.split(' ').map((tk, i, a) => {
                    if (tk.charAt(0) === '*') hl = true;
                    const close = tk.lastIndexOf('*') > 0;
                    const s = document.createElement('span');
                    s.className = hl ? 'w hl' : 'w';
                    s.textContent = tk.replace(/\*/g, '');
                    s.style.opacity = '0';
                    box.appendChild(s);
                    if (close) hl = false;
                    if (i < a.length - 1) box.appendChild(document.createTextNode(' '));
                    return s;
                });
            };
            const inWord = (w, delay) => {
                const a = w.animate(IN_KF, { duration: RM ? 200 : DUR, delay, easing: EASE, fill: 'both' });
                a.onfinish = () => { w.style.opacity = '1'; a.cancel(); };
            };

            const mount = i => {
                const v = document.createElement('div');
                v.className = 'ob-v';
                v.innerHTML = `<div class="ob-fr">${PAGES[i].v()}</div>`;
                stage.appendChild(v);
                fit();
                const a = v.animate(RM ? [{ opacity: 0 }, { opacity: 1 }] : [
                    { opacity: 0, transform: 'translate3d(0,16px,0) scale(.98)' },
                    { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }],
                    { duration: RM ? 200 : 480, easing: EASE, fill: 'both' });
                a.onfinish = () => a.cancel();
                return v;
            };
            const outV = v => {
                const a = v.animate(RM ? [{ opacity: 1 }, { opacity: 0 }] : [
                    { opacity: 1, transform: 'translate3d(0,0,0)' },
                    { opacity: 0, transform: 'translate3d(0,-8px,0)' }],
                    { duration: RM ? 160 : 240, easing: EASE, fill: 'forwards' });
                a.onfinish = () => v.remove();
            };

            async function go(n) {
                busy = true;
                stopProg();
                barTo(n);
                btn.classList.remove('on');
                if (cur >= 0) {
                    ws.forEach(w => w.animate(OUT_KF, { duration: RM ? 120 : 200, easing: 'ease-out', fill: 'forwards' }));
                    if (ebA) ebA.cancel();
                    ebA = eEl.animate(OUT_KF, { duration: RM ? 120 : 200, fill: 'forwards' });
                    if (vis) outV(vis);
                    await wait(RM ? 160 : 260);
                    if (closing) return;
                    vis = mount(n);
                    await wait(RM ? 120 : 160);
                } else {
                    vis = mount(n);
                    await wait(RM ? 160 : 240);
                }
                if (closing) return;
                cur = n;
                const last = n === PAGES.length - 1;
                bl.textContent = last ? 'Bắt đầu' : 'Tiếp tục';
                sk.textContent = last ? 'Đóng' : 'Bỏ qua';
                cn.textContent = (n + 1) + '/' + PAGES.length;
                const P = PAGES[n];
                eEl.textContent = P.e;
                if (ebA) ebA.cancel();
                ebA = eEl.animate(IN_KF, { duration: RM ? 160 : DUR, easing: EASE, fill: 'both' });
                const tw = words(tEl, P.t), sw = words(sEl, P.s);
                ws = [...tw, ...sw]; tN = tw.length;
                const sBase = tw.length * STEP + 80, sStep = 12;
                startProg(n);
                tw.forEach((w, i) => inWord(w, i * STEP));
                sw.forEach((w, i) => inWord(w, sBase + i * sStep));
                await wait(sBase + sw.length * sStep + (RM ? 200 : DUR) + 40);
                if (closing) return;
                busy = false;
                btn.classList.add('on');
            }

            function finish() {
                if (closing) return;
                closing = true;
                stopProg();
                el.classList.remove('show');
                setTimeout(() => {
                    cancelAnimationFrame(raf);
                    window.removeEventListener('resize', seed);
                    tryQ(() => el.hidePopover());
                    el.remove();
                    css.remove();
                    obEl = null;
                    syncBusy();
                    pingDot();
                }, 600);
            }

            bind(btn, 'click', () => {
                if (busy || closing || !btn.classList.contains('on')) return;
                if (cur >= PAGES.length - 1) finish(); else go(cur + 1);
            });
            bind(sk, 'click', () => finish());
            bind(el, 'touchmove', e => { if (e.cancelable) e.preventDefault(); });

            (async () => {
                await ready(delay == null ? 900 : delay);
                if (document.getElementById('gdar-land') || !el.isConnected) { css.remove(); el.remove(); obEl = null; syncBusy(); return; }
                reveal(el, () => { fit(); startDots(); go(0); });
            })();
        }

        uiReady = true;
        render();

        const prebuild = () => { try { build(); render(); } catch (e) {} };
        if (typeof requestIdleCallback === 'function') requestIdleCallback(prebuild, { timeout: 3000 });
        else setTimeout(prebuild, 1500);

        if (CONFIG.onboarding !== false) startWelcome();
    }

    initPicker();
    if (!IS_FRAME) initUI();
    await storeP;
})();
