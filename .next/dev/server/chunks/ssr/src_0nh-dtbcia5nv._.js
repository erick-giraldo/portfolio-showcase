module.exports = [
(()=>{"use strict";return[
"[project]/src/components/landing/cursor-field.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CursorField",
    ()=>CursorField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
/*
 * ASCII glyph field that blooms around the pointer over empty page background,
 * shimmering while the mouse moves — the cursor effect from allerstudio.com.
 * Cells over text, media, opaque surfaces, the header or [data-cursor-skip] stay clear.
 */ const GLYPHS = ".:-=+*#%@";
const CELL = 10;
const RADIUS = 200;
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const palettes = {
    light: {
        base: "#dadee2",
        accents: [
            {
                color: "#646aed",
                share: 0.01
            },
            {
                color: "#d5fe00",
                share: 0.02
            },
            {
                color: "#121212",
                share: 0.1
            }
        ]
    },
    dark: {
        base: "#2e2e2e",
        accents: [
            {
                color: "#646aed",
                share: 0.01
            },
            {
                color: "#d5fe00",
                share: 0.02
            },
            {
                color: "#f2f4f5",
                share: 0.1
            }
        ]
    }
};
/** Deterministic hash noise in [0, 1). */ function hash(x, y, z) {
    const v = Math.sin(127.1 * x + 311.7 * y + 74.7 * z) * 43758.5453;
    return v - Math.floor(v);
}
function subscribeQuery(cb) {
    const mq = matchMedia(QUERY);
    mq.addEventListener("change", cb);
    return ()=>mq.removeEventListener("change", cb);
}
function hasOpaqueBackground(el, cache) {
    for(let n = el; n && n !== document.body; n = n.parentElement){
        let opaque = cache.get(n);
        if (opaque === undefined) {
            const m = getComputedStyle(n).backgroundColor.match(/rgba?\(([^)]+)\)/);
            const alpha = m ? Number(m[1].split(/[,/ ]+/).filter(Boolean)[3] ?? 1) : 0;
            opaque = alpha > 0.5;
            cache.set(n, opaque);
        }
        if (opaque) return true;
    }
    return false;
}
function isOverGlyph(x, y) {
    let node = null;
    let offset = 0;
    if ("caretPositionFromPoint" in document) {
        const pos = document.caretPositionFromPoint(x, y);
        node = pos?.offsetNode ?? null;
        offset = pos?.offset ?? 0;
    } else {
        const range = document.caretRangeFromPoint?.(x, y);
        node = range?.startContainer ?? null;
        offset = range?.startOffset ?? 0;
    }
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;
    const length = node.textContent?.length ?? 0;
    const range = document.createRange();
    for (const i of [
        offset - 1,
        offset
    ]){
        if (i < 0 || i >= length) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2) return true;
    }
    return false;
}
function CursorField() {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const enabled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeQuery, ()=>matchMedia(QUERY).matches, ()=>false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = ref.current;
        if (!enabled || !canvas) return;
        const g = canvas.getContext("2d");
        if (!g) return;
        let dpr = 1;
        const resize = ()=>{
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(innerWidth * dpr);
            canvas.height = Math.round(innerHeight * dpr);
        };
        resize();
        let px = -1e4;
        let py = -1e4;
        let inside = false;
        let presence = 0; // eases toward 1 while the pointer is on the page
        let motion = 0; // eases toward 1 while the pointer is moving
        let phase = 0;
        let lastMove = 0;
        let last = performance.now();
        let raf = 0;
        // Visibility cache keyed by page-space cell, invalidated by generation.
        let gen = 0;
        let bgCache = new WeakMap();
        let genStart = performance.now();
        let budgetEnd = 0;
        let skipRects = [];
        const cells = new Map();
        const invalidate = ()=>{
            gen++;
            bgCache = new WeakMap();
            genStart = performance.now();
        };
        const visible = (cx, cy, x, y)=>{
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
            if (skipRects.some((r)=>x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) return false;
            const key = cx * 100003 + cy;
            const hit = cells.get(key);
            if (hit?.gen === gen) return hit.value;
            if (performance.now() > budgetEnd) return hit?.value;
            const el = document.elementFromPoint(x, y);
            const value = !!el && !el.closest("img, video, svg, canvas, iframe, input, textarea, select") && !hasOpaqueBackground(el, bgCache) && !isOverGlyph(x, y);
            if (cells.size > 60000) cells.clear();
            cells.set(key, {
                value,
                gen
            });
            return value;
        };
        const frame = (now)=>{
            raf = 0;
            const dt = Math.min(Math.max(now - last, 0) / 1000, 0.1);
            last = Math.max(now, last);
            presence += (Number(inside) - presence) * (1 - Math.exp(-dt * (inside ? 10 : 3)));
            presence = Math.min(Math.max(presence, 0), 1);
            const moving = now - lastMove < 120;
            motion += (Number(moving) - motion) * (1 - Math.exp(-dt * (moving ? 20 : 8)));
            phase += 12 * dt * motion;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.clearRect(0, 0, innerWidth, innerHeight);
            if (presence < 0.002 && !inside) return;
            if (performance.now() - genStart > 2000) invalidate();
            budgetEnd = performance.now() + 3;
            skipRects = [
                ...document.querySelectorAll("header, [data-cursor-skip]")
            ].map((e)=>e.getBoundingClientRect());
            const palette = document.documentElement.classList.contains("dark") ? palettes.dark : palettes.light;
            g.font = "500 8px ui-monospace, SFMono-Regular, Menlo, monospace";
            g.textAlign = "center";
            g.textBaseline = "middle";
            let pending = false;
            const ax = px + scrollX;
            const ay = py + scrollY;
            const x0 = Math.floor((ax - RADIUS) / CELL);
            const x1 = Math.ceil((ax + RADIUS) / CELL);
            const y0 = Math.floor((ay - RADIUS) / CELL);
            const y1 = Math.ceil((ay + RADIUS) / CELL);
            for(let cx = x0; cx <= x1; cx++){
                for(let cy = y0; cy <= y1; cy++){
                    const dx = CELL * cx - ax;
                    const dy = CELL * cy - ay;
                    const dist = Math.hypot(dx, dy);
                    if (dist >= RADIUS) continue;
                    const ok = visible(cx, cy, CELL * cx - scrollX, CELL * cy - scrollY);
                    if (ok === undefined) pending = true;
                    if (!ok) continue;
                    const u = 1 - dist / RADIUS;
                    const strength = u * u * (3 - 2 * u) * presence;
                    const tick = Math.floor(phase * (0.5 + hash(cx, cy, 7)) + 10 * hash(cx, cy, 8));
                    let idx = Math.round(strength * (GLYPHS.length - 1));
                    const r = hash(cx, cy, tick);
                    if (r < 0.07) idx = Math.floor(hash(cx, cy, tick + 0.3) * GLYPHS.length);
                    else if (r < 0.35) idx += Math.round((hash(cx, cy, tick + 0.6) - 0.5) * 4);
                    idx = Math.min(Math.max(idx, 0), GLYPHS.length - 1);
                    let color = palette.base;
                    let pick = hash(cx, cy, tick + 0.9);
                    for (const a of palette.accents){
                        if (pick < a.share) {
                            color = a.color;
                            break;
                        }
                        pick -= a.share;
                    }
                    g.fillStyle = color;
                    g.globalAlpha = Math.min(1, 1.4 * strength);
                    g.fillText(GLYPHS[idx], ax - scrollX + dx, ay - scrollY + dy);
                }
            }
            g.globalAlpha = 1;
            const settled = inside && !pending && motion < 0.01 && presence > 0.995;
            if (!settled) raf = requestAnimationFrame(frame);
        };
        const kick = ()=>{
            if (raf) return;
            last = performance.now();
            raf = requestAnimationFrame(frame);
        };
        const onMove = (e)=>{
            if (e.pointerType !== "mouse") return;
            px = e.clientX;
            py = e.clientY;
            lastMove = performance.now();
            inside = true;
            kick();
        };
        const onOut = (e)=>{
            if (!e.relatedTarget) {
                inside = false;
                kick();
            }
        };
        const onResize = ()=>{
            resize();
            invalidate();
            kick();
        };
        let debounce = 0;
        const onMutate = ()=>{
            window.clearTimeout(debounce);
            debounce = window.setTimeout(invalidate, 100);
        };
        const observer = new MutationObserver(onMutate);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        window.addEventListener("pointermove", onMove, {
            passive: true
        });
        document.addEventListener("mouseout", onOut);
        window.addEventListener("scroll", kick, {
            passive: true
        });
        window.addEventListener("resize", onResize);
        return ()=>{
            cancelAnimationFrame(raf);
            window.clearTimeout(debounce);
            observer.disconnect();
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("mouseout", onOut);
            window.removeEventListener("scroll", kick);
            window.removeEventListener("resize", onResize);
        };
    }, [
        enabled
    ]);
    if (!enabled) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: ref,
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0 z-40 h-screen w-screen"
    }, void 0, false, {
        fileName: "[project]/src/components/landing/cursor-field.tsx",
        lineNumber: 279,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/effects.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FrameRails",
    ()=>FrameRails,
    "IntroLoader",
    ()=>IntroLoader,
    "useIntroDone",
    ()=>useIntroDone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/intro-script.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function useIntroDone() {
    const [done, setDone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (document.documentElement.classList.contains(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_KEY"])) {
            setDone(true);
            return;
        }
        const onDone = ()=>setDone(true);
        window.addEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_EVENT"], onDone);
        return ()=>window.removeEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_EVENT"], onDone);
    }, []);
    return done;
}
const readouts = [
    "Components",
    "Variables",
    "Runtime",
    "Interfaces",
    "Deploy"
];
function IntroLoader() {
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const root = document.documentElement;
        if (root.classList.contains(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_KEY"])) {
            setVisible(false);
            return;
        }
        const duration = 1900;
        const start = performance.now();
        let raf = 0;
        let timer = 0;
        const tick = (now)=>{
            const t = Math.min(1, (now - start) / duration);
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            setProgress(Math.round(eased * 100));
            if (t < 1) {
                raf = requestAnimationFrame(tick);
                return;
            }
            timer = window.setTimeout(()=>{
                try {
                    sessionStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_KEY"], "1");
                } catch  {
                // Private mode: the intro just plays again next visit.
                }
                setVisible(false);
                root.classList.remove("is-loading");
                root.classList.add(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_KEY"]);
                window.dispatchEvent(new Event(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$intro$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTRO_EVENT"]));
            }, 260);
        };
        raf = requestAnimationFrame(tick);
        return ()=>{
            cancelAnimationFrame(raf);
            window.clearTimeout(timer);
        };
    }, []);
    const pad = (n)=>String(n).padStart(3, "0");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: visible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
            id: "intro-loader",
            "aria-hidden": true,
            exit: {
                y: "-100%"
            },
            transition: {
                duration: 0.9,
                ease: [
                    0.76,
                    0,
                    0.24,
                    1
                ]
            },
            className: "fixed inset-0 z-[100] flex flex-col justify-between bg-background px-6 py-6 font-display text-foreground sm:px-10 sm:py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between text-[11px] uppercase tracking-[0.28em] text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "EGM // Portfolio"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/effects.tsx",
                            lineNumber: 83,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                "Build ",
                                new Date().getFullYear()
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/effects.tsx",
                            lineNumber: 84,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/effects.tsx",
                    lineNumber: 82,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "space-y-1.5 text-sm uppercase tracking-[0.18em]",
                            children: [
                                readouts.map((r, i)=>{
                                    const local = Math.max(0, Math.min(100, progress * 1.6 - i * 14));
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: "flex w-64 justify-between text-muted-foreground",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: r
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/effects.tsx",
                                                lineNumber: 93,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: local >= 100 ? "text-foreground" : undefined,
                                                children: [
                                                    pad(Math.round(local)),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/effects.tsx",
                                                lineNumber: 94,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, r, true, {
                                        fileName: "[project]/src/components/landing/effects.tsx",
                                        lineNumber: 92,
                                        columnNumber: 19
                                    }, this);
                                }),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "pt-3 text-foreground",
                                    children: [
                                        "Status // ",
                                        progress < 100 ? "Initializing" : "Ready"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/effects.tsx",
                                    lineNumber: 100,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/effects.tsx",
                            lineNumber: 88,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-[22vw] font-semibold leading-[0.8] tracking-tight sm:text-[12rem]",
                            children: [
                                pad(progress),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-faint",
                                    children: "%"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/effects.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/effects.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/effects.tsx",
                    lineNumber: 87,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute inset-x-0 bottom-0 h-1.5 origin-left bg-lime",
                    style: {
                        transform: `scaleX(${progress / 100})`
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/effects.tsx",
                    lineNumber: 110,
                    columnNumber: 11
                }, this)
            ]
        }, "intro", true, {
            fileName: "[project]/src/components/landing/effects.tsx",
            lineNumber: 74,
            columnNumber: 9
        }, this) : null
    }, void 0, false, {
        fileName: "[project]/src/components/landing/effects.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
function FrameRails() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "aria-hidden": true,
        className: "pointer-events-none fixed inset-0 z-0 px-3 sm:px-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto h-full w-full max-w-[84rem] border-x border-frame"
        }, void 0, false, {
            fileName: "[project]/src/components/landing/effects.tsx",
            lineNumber: 124,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/effects.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/hero.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Hero",
    ()=>Hero
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-scroll.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-transform.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-right.js [app-ssr] (ecmascript) <export default as ChevronsRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/lang-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$effects$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/effects.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/primitives.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$silhouette$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/silhouette.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
const softSpring = {
    type: "spring",
    bounce: 0,
    duration: 0.9
};
const eyebrow = [
    "Full Stack",
    "FinTech",
    "Cloud",
    "IT Infrastructure"
];
function Portrait({ src, alt, play }) {
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const hint = lang === "es" ? "Pasa el cursor · clic para revelar" : "Hover · click to reveal";
    const revealLabel = lang === "es" ? "Revelar foto" : "Reveal photo";
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { scrollYProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useScroll"])({
        target: ref,
        offset: [
            "start start",
            "end start"
        ]
    });
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransform"])(scrollYProgress, [
        0,
        1
    ], [
        0,
        90
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        ref: ref,
        style: reduced ? {} : {
            y
        },
        className: "relative mx-auto w-full max-w-md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "float-soft relative",
            style: {
                ["--float-time"]: "8s"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: src,
                    alt: alt,
                    className: "sr-only"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$silhouette$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Silhouette"], {
                    src: src,
                    play: play,
                    hint: hint,
                    revealLabel: revealLabel,
                    className: "aspect-[4/5] w-full [mask-image:linear-gradient(to_bottom,black_70%,transparent),linear-gradient(to_right,transparent,black_12%,black_90%,transparent)] [mask-composite:intersect]"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                    initial: reduced ? false : {
                        opacity: 0,
                        x: -24
                    },
                    animate: play ? {
                        opacity: 1,
                        x: 0
                    } : {},
                    transition: {
                        ...softSpring,
                        delay: 0.9
                    },
                    className: "absolute -left-5 bottom-16",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "float-soft aller-card px-4 py-3",
                        style: {
                            ["--float-delay"]: "1.2s"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-display text-2xl font-bold leading-none text-foreground",
                                children: "12+"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground",
                                children: "Years"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 47,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/hero.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                    initial: reduced ? false : {
                        opacity: 0,
                        x: 24
                    },
                    animate: play ? {
                        opacity: 1,
                        x: 0
                    } : {},
                    transition: {
                        ...softSpring,
                        delay: 1.05
                    },
                    className: "absolute -right-4 top-10",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "float-soft inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground",
                        style: {
                            ["--float-delay"]: "2.4s"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-1.5 w-1.5 rounded-full bg-lime"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this),
                            "FinTech"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/hero.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/hero.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/hero.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
/** Tech names drifting past like the client-logo strip on allerstudio.com */ function LogoMarquee({ items }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative overflow-hidden border-y border-frame py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "animate-logo-marquee flex w-max items-center gap-14",
            children: [
                ...items,
                ...items
            ].map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "whitespace-nowrap font-display text-2xl font-bold uppercase tracking-[0.08em] text-faint/70 transition-colors hover:text-foreground",
                    children: item
                }, `${item}-${i}`, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 78,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/components/landing/hero.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/hero.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}
function Hero() {
    const { t, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$effects$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIntroDone"])();
    const [activeMetric, setActiveMetric] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const marquee = t.stack.flatMap((g)=>g.items).slice(0, 14);
    // Cycle the highlighted metric, like the process nodes on allerstudio.com
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (reduced) return;
        const id = window.setInterval(()=>setActiveMetric((i)=>(i + 1) % t.metrics.length), 1900);
        return ()=>window.clearInterval(id);
    }, [
        reduced,
        t.metrics.length
    ]);
    const fadeUp = (delay)=>({
            initial: reduced ? false : {
                opacity: 0,
                y: 12
            },
            animate: play ? {
                opacity: 1,
                y: 0
            } : {},
            transition: {
                ...softSpring,
                delay
            }
        });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "top",
        className: "relative pt-36 sm:pt-44",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                    ...fadeUp(0.1),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Eyebrow"], {
                                        children: eyebrow.join(" · ")
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/hero.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/hero.tsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "mt-6 text-[2.9rem] leading-[1] sm:text-6xl lg:text-[4.6rem]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WordReveal"], {
                                            text: profile.name,
                                            play: play,
                                            delay: 0.15,
                                            className: "block text-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/hero.tsx",
                                            lineNumber: 120,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WordReveal"], {
                                            text: t.hero.role,
                                            play: play,
                                            delay: 0.35,
                                            className: "mt-2 block text-[0.62em] leading-[1.1] text-faint"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/hero.tsx",
                                            lineNumber: 126,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/hero.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].p, {
                                    ...fadeUp(0.6),
                                    className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg",
                                    children: t.hero.tagline
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/hero.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                                    ...fadeUp(0.75),
                                    className: "mt-9 flex flex-wrap items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Magnetic"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `mailto:${profile.email}`,
                                                className: "ink-pill inline-flex items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 text-sm font-medium",
                                                children: [
                                                    t.cta.contact,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: profile.portraitUrl,
                                                        alt: "",
                                                        className: "h-9 w-9 rounded-full object-cover object-top"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/hero.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/hero.tsx",
                                                lineNumber: 143,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/hero.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Magnetic"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: profile.linkedin,
                                                target: "_blank",
                                                rel: "noreferrer noopener",
                                                className: "group inline-flex h-12 items-center gap-2 rounded-full bg-surface-2 px-6 text-sm font-medium text-foreground ring-1 ring-border/60 transition-colors hover:bg-accent",
                                                children: [
                                                    t.cta.linkedin,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__["ChevronsRight"], {
                                                        className: "h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/hero.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/hero.tsx",
                                                lineNumber: 156,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/hero.tsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/hero.tsx",
                                                    lineNumber: 167,
                                                    columnNumber: 17
                                                }, this),
                                                profile.location
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/hero.tsx",
                                            lineNumber: 166,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/hero.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/hero.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Portrait, {
                            src: profile.portraitUrl,
                            alt: profile.name,
                            play: play
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/hero.tsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/hero.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                ...fadeUp(1),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoMarquee, {
                    items: marquee
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/hero.tsx",
                    lineNumber: 178,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/hero.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto grid w-full max-w-6xl gap-3 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4",
                children: t.metrics.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        initial: reduced ? false : {
                            opacity: 0,
                            y: 12
                        },
                        whileInView: {
                            opacity: 1,
                            y: 0
                        },
                        viewport: {
                            once: true,
                            margin: "-60px"
                        },
                        transition: {
                            ...softSpring,
                            delay: i * 0.08
                        },
                        onPointerEnter: ()=>setActiveMetric(i),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("aller-card relative overflow-hidden p-6 transition-[transform,translate] duration-700", activeMetric === i && "-translate-y-1"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("font-display text-5xl font-bold leading-none transition-colors duration-500", activeMetric === i ? "text-foreground" : "text-faint"),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Counter"], {
                                    value: m.value
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/hero.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 text-sm text-muted-foreground",
                                children: m.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 203,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute bottom-0 left-0 h-1 bg-lime transition-[width] duration-[1900ms] ease-linear", activeMetric === i ? "w-full" : "w-0 duration-300")
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/hero.tsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this)
                        ]
                    }, m.label, true, {
                        fileName: "[project]/src/components/landing/hero.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/landing/hero.tsx",
                lineNumber: 181,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/hero.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/intro-script.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INTRO_EVENT",
    ()=>INTRO_EVENT,
    "INTRO_KEY",
    ()=>INTRO_KEY,
    "introBootstrapScript",
    ()=>introBootstrapScript
]);
const INTRO_KEY = "intro-seen";
const INTRO_EVENT = "intro:done";
const introBootstrapScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('${INTRO_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('${INTRO_KEY}');}else{d.classList.add('is-loading');}}catch(e){d.classList.add('${INTRO_KEY}');}})();`;
}),
"[project]/src/components/landing/lang-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LangProvider",
    ()=>LangProvider,
    "useLang",
    ()=>useLang,
    "useSiteData",
    ()=>useSiteData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/integrations/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/site-content.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const LangContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const STORAGE_KEY = "cv-lang";
function useSiteData() {
    const { data } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "site-content"
        ],
        queryFn: async ()=>{
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("site_content").select("data").eq("id", "default").maybeSingle();
            if (error) throw error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeSiteData"])(data?.data ?? {});
        },
        staleTime: 60_000
    });
    return data ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$site$2d$content$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultSiteData"];
}
function LangProvider({ children }) {
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("es");
    const site = useSiteData();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "es" || stored === "en") setLang(stored);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.documentElement.lang = lang;
    }, [
        lang
    ]);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setLang((prev)=>{
            const next = prev === "es" ? "en" : "es";
            window.localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            lang,
            t: site[lang],
            profile: site.profile,
            toggle
        }), [
        lang,
        site,
        toggle
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LangContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/landing/lang-context.tsx",
        lineNumber: 71,
        columnNumber: 10
    }, this);
}
function useLang() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LangContext);
    if (!ctx) throw new Error("useLang must be used within LangProvider");
    return ctx;
}
}),
"[project]/src/components/landing/nav.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dock",
    ()=>Dock,
    "Nav",
    ()=>Nav,
    "StatusDot",
    ()=>StatusDot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-right.js [app-ssr] (ecmascript) <export default as ChevronsRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/lang-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/theme-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
/** Live clock for the profile location, rendered only after mount to keep SSR stable. */ function useClock(timeZone) {
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setNow(new Date());
        const id = window.setInterval(()=>setNow(new Date()), 30_000);
        return ()=>window.clearInterval(id);
    }, []);
    if (!now) return "--:--";
    const time = now.toLocaleTimeString("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit"
    });
    const offset = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset"
    }).formatToParts(now).find((p)=>p.type === "timeZoneName")?.value.replace("GMT", "UTC") ?? "";
    return `${time} ${offset}`;
}
function StatusDot({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex h-2 w-2", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "status-pulse absolute inset-0 rounded-full bg-emerald-500"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/nav.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "relative h-2 w-2 rounded-full bg-emerald-500"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/nav.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/nav.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
function Nav() {
    const { lang, t, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const clock = useClock("America/New_York");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const ids = [
            "stack",
            "projects",
            "repos",
            "experience",
            "credentials",
            "contact"
        ];
        const observer = new IntersectionObserver((entries)=>{
            const visible = entries.filter((e)=>e.isIntersecting).sort((a, b)=>b.intersectionRatio - a.intersectionRatio);
            if (visible[0]) setActive(`#${visible[0].target.id}`);
        }, {
            rootMargin: "-45% 0px -45% 0px",
            threshold: [
                0.01,
                0.3
            ]
        });
        ids.forEach((id)=>{
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return ()=>observer.disconnect();
    }, []);
    const links = [
        {
            href: "#stack",
            label: t.nav.stack
        },
        {
            href: "#projects",
            label: t.nav.projects
        },
        {
            href: "#experience",
            label: t.nav.experience
        },
        {
            href: "#contact",
            label: t.nav.contact
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "header-in fixed inset-x-0 top-3 z-50 px-3 sm:top-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto w-full max-w-[54rem] overflow-hidden rounded-[1.4rem] bg-surface shadow-[0_30px_60px_-30px_rgb(18_18_18/0.35)] ring-1 ring-border/60",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "flex h-14 items-center justify-between rounded-[1.4rem] bg-ink px-3 pl-5 text-ink-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "#top",
                            className: "flex items-baseline gap-2 font-display leading-none",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xl font-bold tracking-[0.12em]",
                                    children: profile.initials
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden text-[10px] font-medium uppercase tracking-[0.42em] text-white/60 sm:inline",
                                    children: profile.name.split(" ")[0]
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden items-center gap-1 md:flex",
                            children: links.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: l.href,
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative px-3 py-1.5 text-sm transition-colors", active === l.href ? "text-white" : "text-white/70 hover:text-white"),
                                    children: [
                                        active === l.href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                            layoutId: "nav-dot",
                                            className: "absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-lime",
                                            transition: {
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/nav.tsx",
                                            lineNumber: 92,
                                            columnNumber: 19
                                        }, this) : null,
                                        l.label
                                    ]
                                }, l.href, true, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: profile.cvUrl,
                                    download: true,
                                    className: "lime-cta inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold",
                                    children: [
                                        t.cta.downloadCv,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__["ChevronsRight"], {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/nav.tsx",
                                            lineNumber: 110,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setOpen((v)=>!v),
                                    className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 md:hidden",
                                    "aria-label": "Menu",
                                    children: open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/nav.tsx",
                                        lineNumber: 117,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/nav.tsx",
                                        lineNumber: 117,
                                        columnNumber: 51
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/nav.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "hidden h-10 items-center justify-between px-5 font-display text-[13px] font-medium text-foreground sm:flex",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "tabular-nums",
                            children: [
                                profile.location,
                                " | ",
                                clock
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusDot, {}, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                t.hero.badge
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: lang === "es" ? "Remoto · Global" : "Remote · Worldwide"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/nav.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                    children: open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        initial: {
                            height: 0
                        },
                        animate: {
                            height: "auto"
                        },
                        exit: {
                            height: 0
                        },
                        transition: {
                            type: "spring",
                            bounce: 0,
                            duration: 0.5
                        },
                        className: "overflow-hidden md:hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3 px-5 py-4",
                            children: links.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: l.href,
                                    onClick: ()=>setOpen(false),
                                    className: "font-display text-lg font-semibold text-foreground",
                                    children: l.label
                                }, l.href, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 144,
                                    columnNumber: 19
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 142,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/nav.tsx",
                        lineNumber: 135,
                        columnNumber: 13
                    }, this) : null
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/nav.tsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/landing/nav.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/nav.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
function Dock() {
    const { lang, toggle, t, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const { theme, toggle: toggleTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$theme$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "dock-in fixed bottom-4 left-4 z-50 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex rounded-2xl bg-surface-2/90 p-1 font-display text-sm font-semibold ring-1 ring-border/60 backdrop-blur",
                        children: [
                            "en",
                            "es"
                        ].map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>lang !== l && toggle(),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative rounded-xl px-3 py-1.5 transition-colors", lang === l ? "text-foreground" : "text-faint hover:text-foreground"),
                                children: [
                                    lang === l ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                        layoutId: "lang-pill",
                                        className: "absolute inset-0 rounded-xl bg-surface shadow-sm",
                                        transition: {
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/nav.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "relative",
                                        children: l === "en" ? "English" : "Español"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/nav.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, l, true, {
                                fileName: "[project]/src/components/landing/nav.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/nav.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleTheme,
                        className: "relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-surface-2/90 text-foreground ring-1 ring-border/60 backdrop-blur",
                        "aria-label": theme === "dark" ? "Light mode" : "Dark mode",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                            mode: "wait",
                            initial: false,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                initial: {
                                    y: 14,
                                    opacity: 0
                                },
                                animate: {
                                    y: 0,
                                    opacity: 1
                                },
                                exit: {
                                    y: -14,
                                    opacity: 0
                                },
                                transition: {
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.35
                                },
                                className: "absolute inline-flex",
                                children: theme === "dark" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 205,
                                    columnNumber: 35
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/nav.tsx",
                                    lineNumber: 205,
                                    columnNumber: 66
                                }, this)
                            }, theme, false, {
                                fileName: "[project]/src/components/landing/nav.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/nav.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/nav.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "dock-in fixed bottom-4 right-4 z-50 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `mailto:${profile.email}`,
                        "aria-label": "Email",
                        className: "grid h-12 w-12 place-items-center rounded-full bg-surface-2/90 text-foreground ring-1 ring-border/60 backdrop-blur transition-transform hover:-translate-y-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                            className: "h-4.5 w-4.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/nav.tsx",
                            lineNumber: 217,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/nav.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "#contact",
                        className: "ink-pill inline-flex h-12 items-center rounded-full px-6 text-sm font-medium hover:-translate-y-0.5",
                        children: t.cta.contact
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/nav.tsx",
                        lineNumber: 219,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/nav.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/nav.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/primitives.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Counter",
    ()=>Counter,
    "Eyebrow",
    ()=>Eyebrow,
    "Magnetic",
    ()=>Magnetic,
    "Reveal",
    ()=>Reveal,
    "ScrubText",
    ()=>ScrubText,
    "Section",
    ()=>Section,
    "SectionHeading",
    ()=>SectionHeading,
    "WordReveal",
    ()=>WordReveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-scroll.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-transform.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
/** Soft spring with no overshoot — the "up" reveal on allerstudio.com. */ const softSpring = {
    type: "spring",
    bounce: 0,
    duration: 0.9
};
function Reveal({ children, delay = 0, className, y = 12 }) {
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: className,
        initial: reduced ? {
            opacity: 1
        } : {
            opacity: 0,
            y
        },
        whileInView: {
            opacity: 1,
            y: 0
        },
        viewport: {
            once: true,
            margin: "-60px"
        },
        transition: {
            ...softSpring,
            delay
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
function WordReveal({ text, className, wordClassName, delay = 0, play }) {
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-60px"
    });
    const active = play ?? inView;
    const words = text.split(" ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: ref,
        className: className,
        children: words.map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-block overflow-hidden pb-[0.08em] align-bottom",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-block", wordClassName?.(i)),
                        initial: reduced ? false : {
                            y: "110%",
                            opacity: 0
                        },
                        animate: active ? {
                            y: "0%",
                            opacity: 1
                        } : {},
                        transition: {
                            ...softSpring,
                            delay: delay + i * 0.045
                        },
                        children: w
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/primitives.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this),
                    i < words.length - 1 ? " " : null
                ]
            }, `${w}-${i}`, true, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
function ScrubWord({ word, progress, range }) {
    const opacity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransform"])(progress, range, [
        0.28,
        1
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
        style: {
            opacity
        },
        className: "inline",
        children: [
            word,
            " "
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
function ScrubText({ text, className }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const { scrollYProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useScroll"])({
        target: ref,
        offset: [
            "start 0.9",
            "start 0.4"
        ]
    });
    const progress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(scrollYProgress, {
        stiffness: 140,
        damping: 30,
        mass: 0.4
    });
    const words = text.split(" ");
    if (reduced) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: text
    }, void 0, false, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 108,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: ref,
        className: className,
        children: words.map((w, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrubWord, {
                word: w,
                progress: progress,
                range: [
                    i / words.length,
                    Math.min(1, (i + 1.5) / words.length)
                ]
            }, `${w}-${i}`, false, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
function Magnetic({ children, className }) {
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(0, {
        stiffness: 220,
        damping: 18
    });
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(0, {
        stiffness: 220,
        damping: 18
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-block", className),
        style: {
            x,
            y
        },
        onPointerMove: (e)=>{
            if (reduced) return;
            const r = e.currentTarget.getBoundingClientRect();
            x.set(((e.clientX - r.left) / r.width - 0.5) * 10);
            y.set(((e.clientY - r.top) / r.height - 0.5) * 8);
        },
        onPointerLeave: ()=>{
            x.set(0);
            y.set(0);
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
function Eyebrow({ children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-2.5 text-sm font-medium text-foreground", className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "h-1.5 w-5 rounded-full bg-lime"
            }, void 0, false, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
function SectionHeading({ eyebrow, title, subtitle }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Eyebrow, {
                            children: eyebrow
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/primitives.tsx",
                            lineNumber: 179,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/primitives.tsx",
                        lineNumber: 178,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mt-5 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[3.4rem]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrubText, {
                            text: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/primitives.tsx",
                            lineNumber: 182,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/primitives.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
                delay: 0.15,
                className: "lg:pt-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "max-w-md text-base leading-relaxed text-muted-foreground",
                    children: subtitle
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/primitives.tsx",
                    lineNumber: 186,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
}
function Section({ id, children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: id,
        className: "relative scroll-mt-28",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": true,
                className: "relative border-t border-frame",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative mx-auto h-0 w-full max-w-[84rem] px-3 sm:px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "cross-mark -left-[7px] -top-[8px] sm:left-[17px]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/primitives.tsx",
                            lineNumber: 206,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "cross-mark -right-[7px] -top-[8px] sm:right-[17px]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/primitives.tsx",
                            lineNumber: 207,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/primitives.tsx",
                    lineNumber: 205,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 204,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28", className),
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/landing/primitives.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
function Counter({ value }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        once: true,
        margin: "-60px"
    });
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.,]/g, "");
    const [display, setDisplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(reduced ? numeric : 0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!inView || reduced || !Number.isFinite(numeric)) {
            setDisplay(numeric);
            return;
        }
        let frame = 0;
        const total = 56;
        const tick = ()=>{
            frame += 1;
            const progress = 1 - Math.pow(1 - frame / total, 3);
            setDisplay(Math.round(numeric * progress));
            if (frame < total) raf = requestAnimationFrame(tick);
        };
        let raf = requestAnimationFrame(tick);
        return ()=>cancelAnimationFrame(raf);
    }, [
        inView,
        numeric,
        reduced
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        ref: ref,
        children: [
            display.toLocaleString("en-US"),
            suffix
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/primitives.tsx",
        lineNumber: 243,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/sections.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContactSection",
    ()=>ContactSection,
    "CredentialsSection",
    ()=>CredentialsSection,
    "ExperienceSection",
    ()=>ExperienceSection,
    "ProjectsSection",
    ()=>ProjectsSection,
    "ReposSection",
    ()=>ReposSection,
    "StackSection",
    ()=>StackSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/use-in-view.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-scroll.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js [app-ssr] (ecmascript) <export default as ArrowUpRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/award.js [app-ssr] (ecmascript) <export default as Award>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-right.js [app-ssr] (ecmascript) <export default as ChevronsRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/github.js [app-ssr] (ecmascript) <export default as Github>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-ssr] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$linkedin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Linkedin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/linkedin.js [app-ssr] (ecmascript) <export default as Linkedin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-ssr] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-ssr] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/lang-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/primitives.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function StackSection() {
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "stack",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SectionHeading"], {
                ...t.sections.stack
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
                children: t.stack.map((group, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        delay: i * 0.06,
                        className: "h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "aller-card group flex h-full flex-col p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground",
                                            children: String(i + 1).padStart(2, "0")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 35,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "h-1.5 w-1.5 rounded-full bg-border transition-colors duration-500 group-hover:bg-lime"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 38,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 34,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mt-4 text-2xl leading-tight text-foreground",
                                    children: group.category
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 40,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "mt-auto flex flex-wrap gap-1.5 pt-8",
                                    children: group.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground",
                                            children: item
                                        }, item, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 43,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 41,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 33,
                            columnNumber: 13
                        }, this)
                    }, group.category, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
function ProjectsSection() {
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "projects",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SectionHeading"], {
                ...t.sections.projects
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-14 space-y-3",
                children: t.projects.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        delay: i * 0.06,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                            className: "aller-card group grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_1fr] lg:items-start lg:gap-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display text-5xl font-bold leading-none text-faint/60 transition-colors duration-500 group-hover:text-lime",
                                    children: String(i + 1).padStart(2, "0")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 70,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground",
                                            children: p.year
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 74,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "mt-3 text-3xl leading-tight text-foreground",
                                            children: p.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 77,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "mt-4 flex flex-wrap gap-1.5",
                                            children: p.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "rounded-full border border-border/80 px-2.5 py-0.5 text-[11px] text-muted-foreground",
                                                    children: tag
                                                }, tag, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 78,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-full flex-col",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm leading-relaxed text-muted-foreground",
                                            children: p.description
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 90,
                                            columnNumber: 17
                                        }, this),
                                        p.href || p.repo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 flex flex-wrap items-center gap-3",
                                            children: [
                                                p.href ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: p.href,
                                                    target: "_blank",
                                                    rel: "noreferrer noopener",
                                                    className: "ink-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium",
                                                    children: [
                                                        t.cta.viewProject,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpRight$3e$__["ArrowUpRight"], {
                                                            className: "h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sections.tsx",
                                                            lineNumber: 101,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 94,
                                                    columnNumber: 23
                                                }, this) : null,
                                                p.repo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: p.repo,
                                                    target: "_blank",
                                                    rel: "noreferrer noopener",
                                                    className: "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__["Github"], {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sections.tsx",
                                                            lineNumber: 111,
                                                            columnNumber: 25
                                                        }, this),
                                                        t.cta.viewRepo
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 23
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 92,
                                            columnNumber: 19
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 89,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this)
                    }, p.name, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
function ReposSection() {
    const { t, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const username = profile.githubUser;
    const { data } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "github-repos",
            username
        ],
        queryFn: async ()=>{
            const res = await fetch(`/api/github-repos?username=${encodeURIComponent(username)}`);
            return res.ok ? res.json() : [];
        },
        enabled: username.length > 0,
        staleTime: 60 * 60 * 1000
    });
    if (!username) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "repos",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SectionHeading"], {
                ...t.sections.repos
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
                children: [
                    (data ?? []).map((repo, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                            delay: i * 0.05,
                            className: "h-full",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: repo.url,
                                target: "_blank",
                                rel: "noreferrer noopener",
                                className: "aller-card flex h-full flex-col p-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-2 font-display text-lg font-semibold text-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__["Github"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sections.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 19
                                                    }, this),
                                                    repo.name
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sections.tsx",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sections.tsx",
                                                        lineNumber: 160,
                                                        columnNumber: 19
                                                    }, this),
                                                    repo.stars
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sections.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 154,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-3 flex-1 text-sm text-muted-foreground",
                                        children: repo.description ?? "—"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this),
                                    repo.language ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "h-1.5 w-1.5 rounded-full bg-lime"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/sections.tsx",
                                                lineNumber: 167,
                                                columnNumber: 19
                                            }, this),
                                            repo.language
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/sections.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this)
                        }, repo.id, false, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)),
                    data && data.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: t.reposEmpty
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 175,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
function TimelineNode({ children }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$use$2d$in$2d$view$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])(ref, {
        margin: "0px 0px -50% 0px"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "relative pb-6 last:pb-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute -left-[37px] top-8 h-3 w-3 rounded-full border-2 transition-colors duration-500 sm:-left-[53px]", reached ? "border-foreground bg-lime" : "border-border bg-background")
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, this);
}
function ExperienceSection() {
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const reduced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    const listRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { scrollYProgress } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$scroll$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useScroll"])({
        target: listRef,
        offset: [
            "start 0.6",
            "end 0.6"
        ]
    });
    const scaleY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpring"])(scrollYProgress, {
        stiffness: 120,
        damping: 28,
        mass: 0.4
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "experience",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SectionHeading"], {
                ...t.sections.experience
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: listRef,
                className: "relative mt-14 pl-8 sm:pl-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "absolute left-[5px] top-0 h-full w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                        "aria-hidden": true,
                        className: "absolute left-[5px] top-0 h-full w-px origin-top bg-foreground",
                        style: reduced ? {} : {
                            scaleY
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    t.experience.map((job, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(TimelineNode, {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                                delay: i * 0.04,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "aller-card p-6 sm:p-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap items-baseline justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-2xl text-foreground",
                                                    children: job.role
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground",
                                                    children: job.period
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 221,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1.5 text-sm text-muted-foreground",
                                            children: [
                                                job.company,
                                                " · ",
                                                job.location
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 227,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "mt-5 space-y-2.5",
                                            children: job.bullets.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "flex gap-3 text-sm leading-relaxed text-muted-foreground",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "mt-2 h-1 w-3 shrink-0 rounded-full bg-lime"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sections.tsx",
                                                            lineNumber: 236,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: b
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sections.tsx",
                                                            lineNumber: 237,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, b, true, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 220,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/sections.tsx",
                                lineNumber: 219,
                                columnNumber: 13
                            }, this)
                        }, job.company, false, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 218,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 207,
        columnNumber: 5
    }, this);
}
function CredentialsSection() {
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "credentials",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SectionHeading"], {
                ...t.sections.credentials
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 255,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
                children: t.certifications.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        delay: i * 0.05,
                        className: "h-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "aller-card group h-full p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-foreground transition-colors duration-500 group-hover:bg-lime group-hover:text-[#121212]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Award$3e$__["Award"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 262,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 261,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mt-5 text-lg leading-snug text-foreground",
                                    children: c.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 264,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-muted-foreground",
                                    children: c.issuer
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 260,
                            columnNumber: 13
                        }, this)
                    }, c.name, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 259,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 grid gap-3 sm:grid-cols-2",
                children: t.education.map((e, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        delay: i * 0.05,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "aller-card group p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-foreground transition-colors duration-500 group-hover:bg-lime group-hover:text-[#121212]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 276,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mt-5 text-xl text-foreground",
                                    children: e.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 278,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-muted-foreground",
                                    children: e.school
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 279,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-3 inline-block rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground",
                                    children: e.period
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 274,
                            columnNumber: 13
                        }, this)
                    }, e.title, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 273,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 254,
        columnNumber: 5
    }, this);
}
function ContactSection() {
    const { t, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const secondary = "inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Section"], {
        id: "contact",
        className: "pb-28",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative overflow-hidden rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-14 dark:ring-1 dark:ring-white/10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_70%)]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 301,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "float-soft pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/25 blur-[90px]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 302,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Eyebrow"], {
                                    className: "text-white",
                                    children: t.sections.contact.eyebrow
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 304,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrubText"], {
                                        text: t.sections.contact.title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sections.tsx",
                                        lineNumber: 306,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 305,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 max-w-xl text-white/60",
                                    children: t.sections.contact.subtitle
                                }, void 0, false, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 308,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-10 flex flex-wrap gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$primitives$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Magnetic"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `mailto:${profile.email}`,
                                                className: "lime-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sections.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 19
                                                    }, this),
                                                    profile.email,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsRight$3e$__["ChevronsRight"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sections.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sections.tsx",
                                                lineNumber: 312,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 311,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: `tel:${profile.phone.replace(/\s/g, "")}`,
                                            className: secondary,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 17
                                                }, this),
                                                profile.phone
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: profile.linkedin,
                                            target: "_blank",
                                            rel: "noreferrer noopener",
                                            className: secondary,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$linkedin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Linkedin$3e$__["Linkedin"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 17
                                                }, this),
                                                "LinkedIn"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 325,
                                            columnNumber: 15
                                        }, this),
                                        profile.github ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: profile.github,
                                            target: "_blank",
                                            rel: "noreferrer noopener",
                                            className: secondary,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__["Github"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 341,
                                                    columnNumber: 19
                                                }, this),
                                                "GitHub"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 335,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 310,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-12 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/55",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/landing/sections.tsx",
                                                    lineNumber: 349,
                                                    columnNumber: 17
                                                }, this),
                                                profile.location
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 348,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: t.languages
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sections.tsx",
                                            lineNumber: 352,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/landing/sections.tsx",
                                    lineNumber: 347,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/landing/sections.tsx",
                            lineNumber: 303,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/landing/sections.tsx",
                    lineNumber: 300,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 299,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "© ",
                            new Date().getFullYear(),
                            " ",
                            profile.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 359,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: t.footerNote
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sections.tsx",
                        lineNumber: 362,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sections.tsx",
                lineNumber: 358,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sections.tsx",
        lineNumber: 298,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/silhouette.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Silhouette",
    ()=>Silhouette
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const STEP = 2; // sample spacing in px of the sampling canvas
const SAMPLE_W = 300;
/*
 * Navy backdrop key. Measured on the portrait: backdrop pixels are clearly blue
 * (b − max(r, g) ≈ 12–40, b / max(r, g) ≥ 1.7) while the black hair and shirt stay
 * near neutral (difference ≤ 10), so both cues together separate them.
 */ function backdropScore(r, g, b) {
    const top = Math.max(r, g);
    const diff = Math.min(1, Math.max(0, (b - top - 8) / 6));
    const ratio = Math.min(1, Math.max(0, (b / (top + 1) - 1.45) / 0.4));
    return diff * ratio;
}
function isBackdrop(r, g, b) {
    return backdropScore(r, g, b) > 0.5;
}
function drawCropped(img, width, height) {
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const g = off.getContext("2d", {
        willReadFrequently: true
    });
    if (!g) return null;
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    g.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    return {
        off,
        g
    };
}
/** Portrait with the studio backdrop keyed to transparent, cropped like the particle field. */ function makeCutout(img, aspect) {
    const width = 720;
    const height = Math.round(width / aspect);
    const drawn = drawCropped(img, width, height);
    if (!drawn) return Promise.resolve(null);
    const frame = drawn.g.getImageData(0, 0, width, height);
    const d = frame.data;
    for(let i = 0; i < d.length; i += 4)d[i + 3] = Math.round(255 * (1 - backdropScore(d[i], d[i + 1], d[i + 2])));
    drawn.g.putImageData(frame, 0, 0);
    return new Promise((resolve)=>drawn.off.toBlob((blob)=>resolve(blob ? URL.createObjectURL(blob) : null), "image/png"));
}
function buildParticles(img, aspect) {
    // Crop the square portrait to the container aspect (object-cover, centered).
    const sw = SAMPLE_W;
    const sh = Math.round(SAMPLE_W / aspect);
    const drawn = drawCropped(img, sw, sh);
    if (!drawn) return [];
    const { data } = drawn.g.getImageData(0, 0, sw, sh);
    const particles = [];
    for(let y = 0; y < sh; y += STEP){
        for(let x = 0; x < sw; x += STEP){
            const jx = Math.min(sw - 1, x + Math.floor(Math.random() * STEP));
            const jy = Math.min(sh - 1, y + Math.floor(Math.random() * STEP));
            const i = (jy * sw + jx) * 4;
            const r = data[i];
            const gr = data[i + 1];
            const b = data[i + 2];
            if (isBackdrop(r, gr, b)) continue;
            const lum = (0.299 * r + 0.587 * gr + 0.114 * b) / 255;
            // Stipple: darker areas keep more dots so the face still reads.
            if (Math.random() > 0.55 + (1 - lum) * 0.45) continue;
            const nx = jx / sw;
            const ny = jy / sh;
            const fromCenter = Math.hypot(nx - 0.5, (ny - 0.42) * 1.2);
            // Dust sheds from the right shoulder and the upper-right edge.
            const dustChance = Math.max(0, nx - 0.5) * 0.7 + (ny < 0.55 && nx > 0.58 ? 0.12 : 0);
            particles.push({
                hx: nx,
                hy: ny,
                depth: Math.max(-1, 1 - fromCenter * 2.4),
                tone: lum,
                size: 0.9 + Math.random() * 0.9,
                lime: Math.random() < 0.012,
                dust: Math.random() < dustChance,
                seed: Math.random() * 1000,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0
            });
        }
    }
    return particles;
}
function Silhouette({ src, className, play, hint, revealLabel }) {
    const wrapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const playRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(play);
    const revealedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const redrawRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(()=>{});
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cutout, setCutout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [revealed, setRevealed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    playRef.current = play;
    revealedRef.current = revealed;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>redrawRef.current(), [
        revealed
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>()=>void (cutout && URL.revokeObjectURL(cutout)), [
        cutout
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const g = canvas.getContext("2d");
        if (!g) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let particles = [];
        let w = 0;
        let h = 0;
        let dpr = 1;
        let raf = 0;
        let running = false;
        let assembledAt = 0;
        const pointer = {
            x: 0,
            y: 0,
            tx: 0,
            ty: 0,
            px: -1e4,
            py: -1e4
        };
        // Lens that uncovers the photo: follows the pointer on hover, swells to full on click.
        const lens = {
            x: 0,
            y: 0,
            r: 0
        };
        const resize = ()=>{
            const r = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width;
            h = r.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
        };
        const scatter = ()=>{
            for (const p of particles){
                const a = Math.random() * Math.PI * 2;
                const d = (0.4 + Math.random() * 0.8) * Math.max(w, h);
                p.x = w / 2 + Math.cos(a) * d;
                p.y = h / 2 + Math.sin(a) * d;
                p.vx = 0;
                p.vy = 0;
            }
        };
        const draw = (now)=>{
            raf = 0;
            const t = now / 1000;
            const dark = document.documentElement.classList.contains("dark");
            const playing = playRef.current || reduced;
            if (playing && !assembledAt) assembledAt = now;
            const settle = assembledAt ? Math.min(1, (now - assembledAt) / 1600) : 0;
            pointer.x += (pointer.tx - pointer.x) * 0.05;
            pointer.y += (pointer.ty - pointer.y) * 0.05;
            const breathe = 1 + Math.sin(t * 0.9) * 0.008;
            const sway = Math.sin(t * 0.35) * 0.012;
            const hovering = pointer.px >= 0 && pointer.px <= w && pointer.py >= 0 && pointer.py <= h;
            const full = Math.hypot(w, h);
            const isRevealed = revealedRef.current;
            const targetR = isRevealed ? full : hovering && !reduced ? 120 : 0;
            const ease = reduced ? 1 : isRevealed ? 0.06 : 0.14;
            lens.r += (targetR - lens.r) * ease;
            if (lens.r < 0.5) lens.r = 0;
            const cx = isRevealed ? w / 2 : pointer.px;
            const cy = isRevealed ? h * 0.42 : pointer.py;
            if (hovering || isRevealed) {
                lens.x += (cx - lens.x) * (reduced || lens.r < 2 ? 1 : 0.25);
                lens.y += (cy - lens.y) * (reduced || lens.r < 2 ? 1 : 0.25);
            }
            wrap.style.setProperty("--mx", `${lens.x}px`);
            wrap.style.setProperty("--my", `${lens.y}px`);
            wrap.style.setProperty("--r", `${lens.r}px`);
            const revealAmount = Math.min(1, lens.r / (full * 0.8));
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.clearRect(0, 0, w, h);
            for (const p of particles){
                // Home point with breathing, idle sway and pointer-driven head turn.
                const turn = (pointer.x * 18 + sway * w) * (0.4 + p.depth * 0.6);
                const tilt = pointer.y * 10 * (0.4 + p.depth * 0.6);
                let tx = w / 2 + (p.hx - 0.5) * w * breathe + turn;
                let ty = h * 0.98 - (0.98 - p.hy) * h * breathe + tilt;
                if (p.dust) {
                    // Dust drifts up and right on a loop, then re-forms at its home spot.
                    const life = ((t * 0.12 + p.seed) % 1 + 1) % 1;
                    const drift = life * life;
                    tx += drift * (140 + p.seed % 90) + Math.sin(t * 2 + p.seed) * 6 * drift;
                    ty -= drift * (110 + p.seed % 70);
                }
                const k = reduced ? 1 : 0.06 + settle * 0.04;
                p.vx = (p.vx + (tx - p.x) * k) * 0.82;
                p.vy = (p.vy + (ty - p.y) * k) * 0.82;
                // Pointer repulsion.
                const dx = p.x - pointer.px;
                const dy = p.y - pointer.py;
                const d2 = dx * dx + dy * dy;
                if (d2 < 4900) {
                    const f = (1 - Math.sqrt(d2) / 70) * 3.2;
                    const inv = 1 / Math.max(1, Math.sqrt(d2));
                    p.vx += dx * inv * f;
                    p.vy += dy * inv * f;
                }
                // Particles part around the lens like a ripple.
                let lensFade = 1;
                if (lens.r > 1) {
                    const lx = p.x - lens.x;
                    const ly = p.y - lens.y;
                    const ld = Math.hypot(lx, ly);
                    if (ld < lens.r * 1.15) {
                        const push = (1 - ld / (lens.r * 1.15)) * (isRevealed ? 1.4 : 2.2);
                        p.vx += lx / Math.max(1, ld) * push;
                        p.vy += ly / Math.max(1, ld) * push;
                    }
                    const edge = Math.min(1, Math.max(0, (ld - lens.r * 0.55) / (lens.r * 0.6)));
                    lensFade = edge * edge * (3 - 2 * edge);
                }
                p.x += p.vx;
                p.y += p.vy;
                let alpha = (playing ? 0.25 + settle * 0.75 : 0) * lensFade * (1 - revealAmount);
                if (p.dust) alpha *= 1 - ((t * 0.12 + p.seed) % 1 + 1) % 1 * 0.9;
                if (p.lime) g.fillStyle = "#d5fe00";
                else {
                    // Shadow figure: mostly ink with the portrait's light areas lifted a little.
                    const v = dark ? 170 + p.tone * 85 : 14 + p.tone * 55;
                    g.fillStyle = `rgb(${v},${v},${v})`;
                }
                g.globalAlpha = alpha * (p.lime ? 1 : 0.7 + (dark ? p.tone : 1 - p.tone) * 0.3);
                g.fillRect(p.x, p.y, p.size, p.size);
            }
            g.globalAlpha = 1;
            if (running && !reduced) raf = requestAnimationFrame(draw);
        };
        const drawStatic = ()=>{
            if (!particles.length || !reduced) return;
            running = true;
            draw(performance.now());
            running = false;
        };
        redrawRef.current = drawStatic;
        const start = ()=>{
            if (running) return;
            running = true;
            raf = requestAnimationFrame(draw);
        };
        const stop = ()=>{
            running = false;
            cancelAnimationFrame(raf);
        };
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        img.onload = ()=>{
            resize();
            particles = buildParticles(img, w / h || 0.8);
            void makeCutout(img, w / h || 0.8).then(setCutout);
            if (reduced) {
                for (const p of particles){
                    p.x = w / 2 + (p.hx - 0.5) * w;
                    p.y = p.hy * h;
                }
                running = true;
                draw(performance.now());
                running = false;
            } else {
                scatter();
            }
            setReady(true);
            if (!reduced) start();
        };
        const onMove = (e)=>{
            const r = canvas.getBoundingClientRect();
            pointer.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
            pointer.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
            pointer.px = e.clientX - r.left;
            pointer.py = e.clientY - r.top;
        };
        const onLeave = ()=>{
            pointer.px = -1e4;
            pointer.py = -1e4;
        };
        const io = new IntersectionObserver(([entry])=>{
            if (!particles.length || reduced) return;
            if (entry?.isIntersecting && !document.hidden) start();
            else stop();
        });
        io.observe(canvas);
        const onVisibility = ()=>document.hidden ? stop() : particles.length && !reduced && start();
        const ro = new ResizeObserver(()=>{
            if (!particles.length) return;
            resize();
            if (reduced) {
                running = true;
                draw(performance.now());
                running = false;
            }
        });
        ro.observe(canvas);
        window.addEventListener("pointermove", onMove, {
            passive: true
        });
        document.documentElement.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVisibility);
        return ()=>{
            stop();
            io.disconnect();
            ro.disconnect();
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [
        src
    ]);
    const lensMask = "radial-gradient(circle var(--r, 0px) at var(--mx, 50%) var(--my, 50%), #000 55%, transparent 100%)";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: wrapRef,
        role: "button",
        tabIndex: 0,
        "aria-pressed": revealed,
        "aria-label": revealLabel,
        "data-cursor-skip": true,
        onClick: ()=>setRevealed((v)=>!v),
        onKeyDown: (e)=>{
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setRevealed((v)=>!v);
            }
        },
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("group/sil relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-lime", className),
        children: [
            cutout ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: cutout,
                alt: "",
                "aria-hidden": true,
                draggable: false,
                className: "pointer-events-none absolute inset-0 h-full w-full select-none",
                style: {
                    maskImage: lensMask,
                    WebkitMaskImage: lensMask
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/silhouette.tsx",
                lineNumber: 397,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                "aria-hidden": true,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative h-full w-full transition-opacity duration-1000 ease-out", ready ? "opacity-100" : "opacity-0")
            }, void 0, false, {
                fileName: "[project]/src/components/landing/silhouette.tsx",
                lineNumber: 406,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur transition-opacity duration-500", ready && !revealed ? "opacity-0 group-hover/sil:opacity-100 group-focus-visible/sil:opacity-100" : "opacity-0"),
                children: hint
            }, void 0, false, {
                fileName: "[project]/src/components/landing/silhouette.tsx",
                lineNumber: 414,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/silhouette.tsx",
        lineNumber: 377,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/sound.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AMBIENT_SRC",
    ()=>AMBIENT_SRC,
    "SoundEffects",
    ()=>SoundEffects,
    "SoundWidget",
    ()=>SoundWidget,
    "useSound",
    ()=>useSound
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/motion/dist/es/react.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music-2.js [app-ssr] (ecmascript) <export default as Music2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-ssr] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-back.js [app-ssr] (ecmascript) <export default as SkipBack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-ssr] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume1$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-1.js [app-ssr] (ecmascript) <export default as Volume1>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.js [app-ssr] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.js [app-ssr] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/lang-context.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
/*
 * UI sound effects + soundtrack player, modeled on allerstudio.com.
 * Effects and the "ambient" entry are synthesized with WebAudio; other entries are
 * tracks the admin uploads. One master switch silences everything.
 */ const PREF_KEY = "sound";
const VOLUME_KEY = "sound-volume";
const AMBIENT_SRC = "ambient:";
let state = {
    enabled: true,
    playing: false,
    index: 0,
    playlist: [
        {
            title: "Ambient",
            src: AMBIENT_SRC
        }
    ],
    volume: 0.6,
    time: 0,
    duration: 0
};
const listeners = new Set();
let ctx = null;
let master = null;
let musicBus = null;
let analyser = null;
let audioEl = null; // the element currently in use
let routedEl = null;
let plainEl = null;
let ambientStop = null;
function emit(patch) {
    state = {
        ...state,
        ...patch
    };
    listeners.forEach((l)=>l());
}
function subscribe(l) {
    listeners.add(l);
    return ()=>listeners.delete(l);
}
function read(key) {
    try {
        return localStorage.getItem(key);
    } catch  {
        return null;
    }
}
function write(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch  {
    // Storage blocked: the choice lasts for this page view only.
    }
}
/** AudioContext can only start after a user gesture. */ function unlock() {
    if (ctx) {
        if (ctx.state === "suspended") void ctx.resume();
        return;
    }
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    master = ctx.createGain();
    master.connect(ctx.destination);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.78;
    analyser.connect(master);
    musicBus = ctx.createGain();
    musicBus.gain.value = state.volume;
    musicBus.connect(analyser);
}
function blip(kind) {
    if (!state.enabled || !ctx || !master || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(master);
    if (kind === "hover") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(2100, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.05);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.035, t + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        osc.start(t);
        osc.stop(t + 0.08);
        return;
    }
    // Click: a pitched tick layered over a tiny filtered noise burst.
    osc.type = "triangle";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.start(t);
    osc.stop(t + 0.12);
    const len = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i = 0; i < len; i++)data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const noise = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const ng = ctx.createGain();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    ng.gain.value = 0.05;
    noise.buffer = buffer;
    noise.connect(hp).connect(ng).connect(master);
    noise.start(t);
}
/** Slow generative pad: detuned saws through a breathing low-pass, cycling four chords. */ function startAmbient() {
    if (!ctx || !musicBus || ambientStop) return;
    const audio = ctx;
    const out = audio.createGain();
    out.gain.setValueAtTime(0.0001, audio.currentTime);
    out.gain.exponentialRampToValueAtTime(0.09, audio.currentTime + 3);
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.8;
    const lfo = audio.createOscillator();
    const lfoGain = audio.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    const delay = audio.createDelay(1);
    const feedback = audio.createGain();
    delay.delayTime.value = 0.42;
    feedback.gain.value = 0.35;
    filter.connect(out);
    filter.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(out);
    out.connect(musicBus);
    // Am9 → Fmaj7 → C(add9) → G6, in Hz
    const chords = [
        [
            110,
            164.81,
            196,
            246.94,
            261.63
        ],
        [
            87.31,
            174.61,
            220,
            261.63,
            329.63
        ],
        [
            130.81,
            196,
            261.63,
            293.66,
            329.63
        ],
        [
            98,
            146.83,
            196,
            246.94,
            329.63
        ]
    ];
    const voices = chords[0].map((f)=>[
            -6,
            6
        ].map((detune)=>{
            const o = audio.createOscillator();
            o.type = "sawtooth";
            o.frequency.value = f;
            o.detune.value = detune;
            o.connect(filter);
            o.start();
            return o;
        }));
    let step = 0;
    const id = window.setInterval(()=>{
        step = (step + 1) % chords.length;
        const t = audio.currentTime;
        voices.forEach((pair, i)=>pair.forEach((o)=>o.frequency.setTargetAtTime(chords[step][i], t, 1.2)));
    }, 8000);
    ambientStop = ()=>{
        window.clearInterval(id);
        const t = audio.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        window.setTimeout(()=>{
            voices.flat().forEach((o)=>o.stop());
            lfo.stop();
            out.disconnect();
        }, 900);
        ambientStop = null;
    };
}
function createAudio() {
    const el = new Audio();
    el.preload = "none";
    el.addEventListener("timeupdate", ()=>el === audioEl && emit({
            time: el.currentTime
        }));
    el.addEventListener("loadedmetadata", ()=>el === audioEl && emit({
            duration: Number.isFinite(el.duration) ? el.duration : 0
        }));
    el.addEventListener("ended", ()=>el === audioEl && skip(1));
    el.addEventListener("error", ()=>el === audioEl && state.playing && skip(1));
    return el;
}
/**
 * Same-origin tracks play through an element wired into the analyser (real spectrum, bus volume).
 * Cross-origin URLs use a plain element: routing them without CORS headers would play silence.
 */ function audioFor(src) {
    const sameOrigin = new URL(src, location.href).origin === location.origin;
    if (sameOrigin && ctx && musicBus) {
        if (!routedEl) {
            routedEl = createAudio();
            ctx.createMediaElementSource(routedEl).connect(musicBus);
        }
        routedEl.volume = 1;
        return routedEl;
    }
    plainEl ??= createAudio();
    plainEl.volume = state.volume;
    return plainEl;
}
function stopAll() {
    ambientStop?.();
    audioEl?.pause();
}
function playIndex(index) {
    unlock();
    const entry = state.playlist[index];
    if (!entry) return;
    stopAll();
    if (!state.enabled) setEnabled(true);
    emit({
        index,
        playing: true,
        time: 0,
        duration: 0
    });
    if (entry.src === AMBIENT_SRC) {
        startAmbient();
        return;
    }
    const el = audioFor(entry.src);
    audioEl = el;
    if (el.src !== new URL(entry.src, location.href).href) el.src = entry.src;
    el.currentTime = 0;
    void el.play().catch(()=>emit({
            playing: false
        }));
}
function pause() {
    stopAll();
    emit({
        playing: false
    });
}
function toggle() {
    if (state.playing) pause();
    else if (state.playlist[state.index]?.src === AMBIENT_SRC || !audioEl?.src) playIndex(state.index);
    else {
        unlock();
        if (!state.enabled) setEnabled(true);
        emit({
            playing: true
        });
        void audioEl.play().catch(()=>emit({
                playing: false
            }));
    }
}
function skip(dir) {
    const n = state.playlist.length;
    if (!n) return;
    playIndex((state.index + dir + n) % n);
}
function seek(fraction) {
    if (audioEl && state.duration) audioEl.currentTime = fraction * state.duration;
}
function setVolume(volume) {
    write(VOLUME_KEY, String(volume));
    if (musicBus && ctx) musicBus.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    if (plainEl) plainEl.volume = volume;
    emit({
        volume
    });
}
function setEnabled(enabled) {
    write(PREF_KEY, enabled ? "on" : "off");
    if (!enabled) {
        stopAll();
        emit({
            enabled,
            playing: false
        });
        return;
    }
    emit({
        enabled
    });
}
function setPlaylist(tracks, active, ambientTitle) {
    const playlist = [
        {
            title: ambientTitle,
            src: AMBIENT_SRC
        },
        ...tracks.filter((t)=>t.src)
    ];
    const sameList = playlist.length === state.playlist.length && playlist.every((e, i)=>e.src === state.playlist[i]?.src);
    if (sameList) {
        emit({
            playlist
        });
        return;
    }
    if (state.playing) pause();
    audioEl = null;
    emit({
        playlist,
        index: Math.min(Math.max(active, 0), playlist.length - 1),
        time: 0,
        duration: 0
    });
}
function useSound() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, ()=>state, ()=>state);
}
function SoundEffects() {
    const site = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSiteData"])();
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setPlaylist(site.music.tracks, site.music.active, lang === "es" ? "Ambiente generativo" : "Generative ambient");
    }, [
        site.music,
        lang
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const storedVolume = Number(read(VOLUME_KEY));
        emit({
            enabled: read(PREF_KEY) !== "off",
            volume: Number.isFinite(storedVolume) && read(VOLUME_KEY) !== null ? storedVolume : state.volume
        });
        const interactive = "a, button, [role='button'], summary, input[type='range']";
        let lastHover = null;
        const onDown = ()=>unlock();
        const onOver = (e)=>{
            if (e.pointerType !== "mouse") return;
            const el = e.target?.closest(interactive) ?? null;
            if (el && el !== lastHover) blip("hover");
            lastHover = el;
        };
        const onClick = (e)=>{
            if (e.target?.closest(interactive)) blip("click");
        };
        window.addEventListener("pointerdown", onDown, {
            passive: true
        });
        window.addEventListener("keydown", onDown);
        document.addEventListener("pointerover", onOver, {
            passive: true
        });
        document.addEventListener("click", onClick, true);
        return ()=>{
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("keydown", onDown);
            document.removeEventListener("pointerover", onOver);
            document.removeEventListener("click", onClick, true);
            pause();
        };
    }, []);
    return null;
}
/** Spectrum bars from the analyser; falls back to a synthetic wave when no data flows. */ function Visualizer({ playing, bars = 20, className }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const root = ref.current;
        if (!root) return;
        const nodes = [
            ...root.children
        ];
        const data = new Uint8Array(32);
        let raf = 0;
        const frame = (now)=>{
            let energy = 0;
            if (analyser && playing) {
                analyser.getByteFrequencyData(data);
                energy = data.reduce((a, b)=>a + b, 0);
            }
            nodes.forEach((node, i)=>{
                let v;
                if (!playing) v = 0.12;
                else if (energy > 0) v = Math.max(0.12, (data[Math.floor(i / nodes.length * 24)] ?? 0) / 255);
                else v = 0.25 + 0.6 * Math.abs(Math.sin(now / 380 + i * 0.7) * Math.cos(now / 910 + i * 0.3));
                node.style.transform = `scaleY(${v.toFixed(3)})`;
            });
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return ()=>cancelAnimationFrame(raf);
    }, [
        playing
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        "aria-hidden": true,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-end gap-[3px]", className),
        children: Array.from({
            length: bars
        }, (_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "h-full flex-1 origin-bottom rounded-full bg-current transition-transform duration-75",
                style: {
                    transform: "scaleY(0.12)"
                }
            }, i, false, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 455,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/landing/sound.tsx",
        lineNumber: 453,
        columnNumber: 5
    }, this);
}
const spectrum = new Uint8Array(32);
/** Normalized spectrum (0..1 per bin) plus overall energy; synthetic motion when no data flows. */ function sample(playing, now, out) {
    let sum = 0;
    if (analyser && playing) {
        analyser.getByteFrequencyData(spectrum);
        for(let i = 0; i < out.length; i++)sum += spectrum[i];
    }
    for(let i = 0; i < out.length; i++){
        if (!playing) out[i] = 0.04;
        else if (sum > 0) out[i] = Math.min(1, (spectrum[i] / 255 * (1 + i * 0.12)) ** 0.65);
        else out[i] = 0.2 + 0.5 * Math.abs(Math.sin(now / 420 + i * 0.55) * Math.cos(now / 1300 + i * 0.2));
    }
    let energy = 0;
    for(let i = 0; i < 10; i++)energy += out[i];
    return energy / 10;
}
const reducedMotion = ()=>("TURBOPACK compile-time value", "undefined") !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Mirrored, glowing waveform drawn on canvas. Also publishes `--energy` on `energyTarget`. */ function Spectrum({ playing, energyTarget, className }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = ref.current;
        const g = canvas?.getContext("2d");
        if (!canvas || !g) return;
        const bins = 24;
        const raw = new Float32Array(bins);
        const smooth = new Float32Array(bins).fill(0.04);
        const still = reducedMotion();
        let energy = 0;
        let raf = 0;
        const frame = (now)=>{
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (canvas.width !== Math.round(w * dpr)) {
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
            }
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.clearRect(0, 0, w, h);
            const e = sample(playing && !still, now, raw);
            energy += (e - energy) * 0.15;
            energyTarget?.current?.style.setProperty("--energy", energy.toFixed(3));
            for(let i = 0; i < bins; i++)smooth[i] += (raw[i] - smooth[i]) * 0.25;
            // Symmetric around the center: low frequencies in the middle, highs at the edges.
            const pts = [];
            const n = bins * 2 - 1;
            for(let k = 0; k < n; k++){
                const bin = Math.abs(k - (bins - 1));
                pts.push([
                    k / (n - 1) * w,
                    Math.max(0.03, smooth[bin]) * (h / 2 - 2)
                ]);
            }
            const mid = h / 2;
            const trace = (sign)=>{
                g.moveTo(0, mid);
                for(let k = 0; k < pts.length - 1; k++){
                    const [x0, y0] = pts[k];
                    const [x1, y1] = pts[k + 1];
                    g.quadraticCurveTo(x0, mid - sign * y0, (x0 + x1) / 2, mid - sign * (y0 + y1) / 2);
                }
                g.lineTo(w, mid);
            };
            const fill = g.createLinearGradient(0, 0, 0, h);
            fill.addColorStop(0, "rgb(213 254 0 / 0)");
            fill.addColorStop(0.5, "rgb(213 254 0 / 0.55)");
            fill.addColorStop(1, "rgb(213 254 0 / 0)");
            g.beginPath();
            trace(1);
            trace(-1);
            g.fillStyle = fill;
            g.fill();
            g.shadowColor = "rgb(213 254 0 / 0.8)";
            g.shadowBlur = 8 + energy * 16;
            g.strokeStyle = "#d5fe00";
            g.lineWidth = 1.5;
            g.beginPath();
            trace(1);
            g.stroke();
            g.shadowBlur = 0;
            if ("TURBOPACK compile-time truthy", 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return ()=>cancelAnimationFrame(raf);
    }, [
        playing,
        energyTarget
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: ref,
        "aria-hidden": true,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("block w-full", className)
    }, void 0, false, {
        fileName: "[project]/src/components/landing/sound.tsx",
        lineNumber: 572,
        columnNumber: 10
    }, this);
}
/** Spinning "record" whose glow and scale follow the music energy. */ function Disc({ playing, ambient }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative grid h-14 w-14 shrink-0 place-items-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": true,
                className: "absolute inset-0 rounded-full bg-lime/40 blur-xl transition-opacity duration-500",
                style: {
                    opacity: playing ? "calc(0.25 + var(--energy, 0) * 0.9)" : 0,
                    transform: "scale(calc(1 + var(--energy, 0) * 0.5))"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 579,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": true,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 rounded-full ring-1 ring-white/15 animate-spin-slow", !playing && "[animation-play-state:paused]"),
                style: {
                    background: "repeating-radial-gradient(circle at center, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px), conic-gradient(from 0deg, #1d1d1d, #3a3a3a 15%, #121212 35%, #2b2b2b 60%, #121212 80%, #1d1d1d)",
                    animationDuration: "6s"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 587,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "relative grid h-5 w-5 place-items-center rounded-full bg-lime text-ink shadow-[0_0_12px_rgb(213_254_0/0.6)]",
                style: {
                    transform: playing ? "scale(calc(1 + var(--energy, 0) * 0.25))" : undefined
                },
                children: ambient ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                    className: "h-2.5 w-2.5"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/sound.tsx",
                    lineNumber: 603,
                    columnNumber: 20
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music2$3e$__["Music2"], {
                    className: "h-2.5 w-2.5"
                }, void 0, false, {
                    fileName: "[project]/src/components/landing/sound.tsx",
                    lineNumber: 603,
                    columnNumber: 59
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 599,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sound.tsx",
        lineNumber: 578,
        columnNumber: 5
    }, this);
}
/** Draggable progress bar with a hover time preview; arrow keys seek ±5 s. */ function Scrubber({ time, duration, label }) {
    const [hover, setHover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [drag, setDrag] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const progress = drag ?? (duration ? time / duration : 0);
    const at = (e)=>{
        const r = e.currentTarget.getBoundingClientRect();
        return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "slider",
                tabIndex: 0,
                "aria-label": label,
                "aria-valuemin": 0,
                "aria-valuemax": Math.round(duration),
                "aria-valuenow": Math.round(time),
                "aria-valuetext": fmt(time),
                onPointerDown: (e)=>{
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDrag(at(e));
                },
                onPointerMove: (e)=>{
                    setHover(at(e));
                    if (drag !== null) setDrag(at(e));
                },
                onPointerUp: (e)=>{
                    if (drag !== null) seek(at(e));
                    setDrag(null);
                },
                onPointerLeave: ()=>setHover(null),
                onKeyDown: (e)=>{
                    if (!duration) return;
                    const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
                    if (step) {
                        e.preventDefault();
                        seek(Math.min(1, Math.max(0, (time + step) / duration)));
                    }
                },
                className: "group relative h-4 w-full cursor-pointer touch-none outline-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10 transition-[height] group-hover:h-1.5"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 653,
                        columnNumber: 9
                    }, this),
                    hover !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15 group-hover:h-1.5",
                        style: {
                            width: `${hover * 100}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 655,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-lime/60 to-lime shadow-[0_0_10px_rgb(213_254_0/0.55)] transition-[height] group-hover:h-1.5",
                        style: {
                            width: `${progress * 100}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 660,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgb(213_254_0/0.25)] transition-transform group-hover:scale-100 group-focus-visible:scale-100", drag !== null ? "scale-110" : "scale-0"),
                        style: {
                            left: `${progress * 100}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 664,
                        columnNumber: 9
                    }, this),
                    hover !== null && duration ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "pointer-events-none absolute -top-6 -translate-x-1/2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink",
                        style: {
                            left: `${hover * 100}%`
                        },
                        children: fmt(hover * duration)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 672,
                        columnNumber: 11
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 622,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1 flex justify-between text-[10px] tabular-nums text-white/45",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: fmt(drag !== null ? drag * duration : time)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 681,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: duration ? `-${fmt(Math.max(0, duration - time))}` : "--:--"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 682,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 680,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sound.tsx",
        lineNumber: 621,
        columnNumber: 5
    }, this);
}
const fmt = (s)=>`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/** `lg` and up (true/false), or null before mount so the server render stays neutral. */ function useDesktop() {
    const [desktop, setDesktop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const mql = window.matchMedia("(min-width: 1024px)");
        const sync = ()=>setDesktop(mql.matches);
        sync();
        mql.addEventListener("change", sync);
        return ()=>mql.removeEventListener("change", sync);
    }, []);
    return desktop;
}
function SoundWidget() {
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$lang$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLang"])();
    const s = useSound();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const es = lang === "es";
    const entry = s.playlist[s.index];
    const ambient = entry?.src === AMBIENT_SRC;
    const VolumeIcon = s.volume === 0 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"] : s.volume < 0.5 ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$1$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume1$3e$__["Volume1"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"];
    const card = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const desktop = useDesktop();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        const onKey = (e)=>e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return ()=>window.removeEventListener("keydown", onKey);
    }, [
        open
    ]);
    // The rail is transformed (dock-in, centering), so the mobile sheet renders in a portal
    // to be positioned against the viewport.
    const place = (node)=>desktop === null ? null : desktop ? node : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$dom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPortal"])(node, document.body);
    const motionProps = desktop ? {
        initial: {
            opacity: 0,
            x: -20,
            scale: 0.94,
            filter: "blur(6px)"
        },
        animate: {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: "blur(0px)"
        },
        exit: {
            opacity: 0,
            x: -20,
            scale: 0.94,
            filter: "blur(6px)"
        }
    } : {
        initial: {
            opacity: 0,
            y: 56,
            filter: "blur(6px)"
        },
        animate: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
        },
        exit: {
            opacity: 0,
            y: 56,
            filter: "blur(6px)"
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-cursor-skip": true,
        className: "dock-in fixed bottom-[4.75rem] left-4 z-50 flex items-center gap-2 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-row-reverse gap-1 rounded-2xl bg-surface-2/90 p-1 font-display text-sm font-semibold ring-1 ring-border/60 backdrop-blur lg:flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "hidden px-2.5 pt-1.5 text-xs font-medium text-muted-foreground lg:block",
                        children: es ? "Sonido" : "Sound"
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 748,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            unlock();
                            setEnabled(!s.enabled);
                        },
                        "aria-pressed": s.enabled,
                        className: "flex items-center justify-between gap-2 rounded-xl bg-surface px-2.5 py-1.5 text-foreground shadow-sm",
                        children: [
                            s.enabled ? "On" : "Off",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Visualizer, {
                                playing: s.enabled && s.playing,
                                bars: 4,
                                className: "h-3 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/sound.tsx",
                                lineNumber: 760,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 751,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setOpen((v)=>!v),
                        "aria-expanded": open,
                        "aria-label": es ? "Reproductor" : "Player",
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center justify-center rounded-xl px-2.5 py-1.5 transition-colors", open ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music2$3e$__["Music2"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/landing/sound.tsx",
                            lineNumber: 771,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 762,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 747,
                columnNumber: 7
            }, this),
            place(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: [
                    open && !desktop ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                        type: "button",
                        "aria-label": es ? "Cerrar reproductor" : "Close player",
                        onClick: ()=>setOpen(false),
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        exit: {
                            opacity: 0
                        },
                        className: "fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
                    }, "backdrop", false, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 778,
                        columnNumber: 13
                    }, this) : null,
                    open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].div, {
                        ref: card,
                        "data-cursor-skip": true,
                        ...motionProps,
                        transition: {
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.55
                        },
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("overflow-hidden rounded-[28px] bg-ink/95 p-4 text-ink-foreground shadow-[0_30px_70px_-25px_rgb(0_0_0/0.7)] ring-1 ring-white/10 backdrop-blur-xl", desktop ? "relative w-80 origin-left" : "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[61] mx-auto max-w-md"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                className: "pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-lime/25 blur-3xl transition-opacity duration-700",
                                style: {
                                    opacity: s.playing ? "calc(0.35 + var(--energy, 0) * 0.9)" : 0.15,
                                    transform: "scale(calc(0.9 + var(--energy, 0) * 0.4))"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/sound.tsx",
                                lineNumber: 804,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": true,
                                className: "pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(120%_80%_at_100%_100%,rgb(255_255_255/0.06),transparent_60%)]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/landing/sound.tsx",
                                lineNumber: 812,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.24em] text-white/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "inline-flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "relative flex h-1.5 w-1.5",
                                                        children: [
                                                            s.playing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "absolute inset-0 animate-ping rounded-full bg-lime/70"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                                lineNumber: 822,
                                                                columnNumber: 25
                                                            }, this) : null,
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative h-1.5 w-1.5 rounded-full", s.playing ? "bg-lime" : "bg-white/30")
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                                lineNumber: 824,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 820,
                                                        columnNumber: 21
                                                    }, this),
                                                    s.playing ? es ? "Sonando" : "Now playing" : "Soundtrack"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 819,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "tabular-nums",
                                                        children: [
                                                            String(s.index + 1).padStart(2, "0"),
                                                            " /",
                                                            " ",
                                                            String(s.playlist.length).padStart(2, "0")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 834,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setOpen(false),
                                                        "aria-label": es ? "Cerrar" : "Close",
                                                        className: "grid h-6 w-6 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 843,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 838,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 833,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 818,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Disc, {
                                                playing: s.playing,
                                                ambient: ambient
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 849,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-0 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative overflow-hidden whitespace-nowrap font-display text-lg font-bold uppercase leading-tight tracking-wide [mask-image:linear-gradient(90deg,#000_85%,transparent)]",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                            mode: "wait",
                                                            initial: false,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                                                initial: {
                                                                    y: 14,
                                                                    opacity: 0
                                                                },
                                                                animate: {
                                                                    y: 0,
                                                                    opacity: 1
                                                                },
                                                                exit: {
                                                                    y: -14,
                                                                    opacity: 0
                                                                },
                                                                transition: {
                                                                    duration: 0.25
                                                                },
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-block", (entry?.title.length ?? 0) > 16 && s.playing && "player-marquee"),
                                                                children: entry?.title || "—"
                                                            }, entry?.src ?? "none", false, {
                                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                                lineNumber: 853,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 852,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 851,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-0.5 truncate text-[11px] uppercase tracking-[0.18em] text-white/40",
                                                        children: ambient ? es ? "En vivo · generado en tu navegador" : "Live · generated in your browser" : es ? `Pista ${String(s.index).padStart(2, "0")}` : `Track ${String(s.index).padStart(2, "0")}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 868,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 850,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 848,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Spectrum, {
                                        playing: s.playing,
                                        energyTarget: card,
                                        className: "mt-3 h-14"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 880,
                                        columnNumber: 17
                                    }, this),
                                    ambient ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Scrubber, {
                                            time: s.time,
                                            duration: s.duration,
                                            label: es ? "Buscar" : "Seek"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/landing/sound.tsx",
                                            lineNumber: 884,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 883,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                                                        whileTap: {
                                                            scale: 0.85
                                                        },
                                                        onClick: ()=>skip(-1),
                                                        "aria-label": es ? "Anterior" : "Previous",
                                                        className: "grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__["SkipBack"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 896,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 890,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                                                        whileTap: {
                                                            scale: 0.88
                                                        },
                                                        whileHover: {
                                                            scale: 1.06
                                                        },
                                                        onClick: toggle,
                                                        "aria-label": s.playing ? es ? "Pausar" : "Pause" : es ? "Reproducir" : "Play",
                                                        className: "lime-cta relative grid h-12 w-12 place-items-center rounded-full",
                                                        style: {
                                                            boxShadow: s.playing ? "0 0 calc(10px + var(--energy, 0) * 30px) rgb(213 254 0 / 0.55)" : undefined
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                            mode: "popLayout",
                                                            initial: false,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                                                initial: {
                                                                    scale: 0.4,
                                                                    opacity: 0,
                                                                    rotate: -45
                                                                },
                                                                animate: {
                                                                    scale: 1,
                                                                    opacity: 1,
                                                                    rotate: 0
                                                                },
                                                                exit: {
                                                                    scale: 0.4,
                                                                    opacity: 0,
                                                                    rotate: 45
                                                                },
                                                                transition: {
                                                                    duration: 0.18
                                                                },
                                                                className: "grid place-items-center",
                                                                children: s.playing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                                                    className: "h-[18px] w-[18px] fill-current"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/landing/sound.tsx",
                                                                    lineNumber: 922,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                    className: "ml-0.5 h-[18px] w-[18px] fill-current"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/landing/sound.tsx",
                                                                    lineNumber: 924,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, s.playing ? "pause" : "play", false, {
                                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                                lineNumber: 913,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 912,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 898,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].button, {
                                                        whileTap: {
                                                            scale: 0.85
                                                        },
                                                        onClick: ()=>skip(1),
                                                        "aria-label": es ? "Siguiente" : "Next",
                                                        className: "grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 935,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 929,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 889,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-white/70",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setVolume(s.volume === 0 ? 0.6 : 0),
                                                        "aria-label": es ? "Silenciar" : "Mute",
                                                        className: "transition-colors hover:text-white",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(VolumeIcon, {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 945,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 939,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "range",
                                                        min: 0,
                                                        max: 1,
                                                        step: 0.01,
                                                        value: s.volume,
                                                        onChange: (e)=>setVolume(Number(e.target.value)),
                                                        "aria-label": es ? "Volumen" : "Volume",
                                                        className: "player-range w-20",
                                                        style: {
                                                            ["--fill"]: `${s.volume * 100}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/landing/sound.tsx",
                                                        lineNumber: 947,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 938,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 888,
                                        columnNumber: 17
                                    }, this),
                                    s.playlist.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "mt-4 max-h-40 space-y-0.5 overflow-y-auto border-t border-white/10 pt-3 [scrollbar-width:thin]",
                                        children: s.playlist.map((t, i)=>{
                                            const current = i === s.index;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>playIndex(i),
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs transition-colors", current ? "text-lime" : "text-white/65 hover:text-white"),
                                                    children: [
                                                        current ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$motion$2f$dist$2f$es$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["motion"].span, {
                                                            layoutId: "player-active",
                                                            transition: {
                                                                type: "spring",
                                                                bounce: 0.2,
                                                                duration: 0.45
                                                            },
                                                            className: "absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-lime/20"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 975,
                                                            columnNumber: 31
                                                        }, this) : null,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "relative w-4 tabular-nums text-white/35",
                                                            children: String(i + 1).padStart(2, "0")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 981,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "relative flex-1 truncate",
                                                            children: t.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 984,
                                                            columnNumber: 29
                                                        }, this),
                                                        current && s.playing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Visualizer, {
                                                            playing: true,
                                                            bars: 3,
                                                            className: "relative h-2.5 w-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 986,
                                                            columnNumber: 31
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                            className: "relative h-3 w-3 opacity-0 transition-opacity [button:hover_&]:opacity-60"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/landing/sound.tsx",
                                                            lineNumber: 988,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/landing/sound.tsx",
                                                    lineNumber: 967,
                                                    columnNumber: 27
                                                }, this)
                                            }, `${t.src}-${i}`, false, {
                                                fileName: "[project]/src/components/landing/sound.tsx",
                                                lineNumber: 966,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/landing/sound.tsx",
                                        lineNumber: 962,
                                        columnNumber: 19
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/landing/sound.tsx",
                                lineNumber: 817,
                                columnNumber: 15
                            }, this)
                        ]
                    }, "player", true, {
                        fileName: "[project]/src/components/landing/sound.tsx",
                        lineNumber: 790,
                        columnNumber: 13
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/landing/sound.tsx",
                lineNumber: 776,
                columnNumber: 9
            }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/landing/sound.tsx",
        lineNumber: 743,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/landing/theme-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$theme$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/landing/theme-script.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function apply(theme) {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.setTimeout(()=>root.classList.remove("theme-transition"), 500);
}
function ThemeProvider({ children }) {
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("light");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = window.localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$theme$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_STORAGE_KEY"]);
        const initial = stored === "light" || stored === "dark" ? stored : "light";
        setTheme(initial);
        apply(initial);
    }, []);
    const toggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setTheme((prev)=>{
            const next = prev === "dark" ? "light" : "dark";
            window.localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$landing$2f$theme$2d$script$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_STORAGE_KEY"], next);
            apply(next);
            return next;
        });
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            theme,
            toggle
        }), [
        theme,
        toggle
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/landing/theme-context.tsx",
        lineNumber: 52,
        columnNumber: 10
    }, this);
}
function useTheme() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
}),
"[project]/src/components/landing/theme-script.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "THEME_STORAGE_KEY",
    ()=>THEME_STORAGE_KEY,
    "themeBootstrapScript",
    ()=>themeBootstrapScript
]);
const THEME_STORAGE_KEY = "cv-theme";
const themeBootstrapScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark';document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
}),
"[project]/src/content/cv.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITHUB_USERNAME",
    ()=>GITHUB_USERNAME,
    "content",
    ()=>content,
    "profile",
    ()=>profile
]);
const GITHUB_USERNAME = "";
const profile = {
    name: "Erick Giraldo Muñoz",
    initials: "EG",
    location: "Holbrook, NY",
    phone: "+1 860 549 7679",
    email: "egiraldom@outlook.com",
    linkedin: "https://linkedin.com/in/egiraldom"
};
const content = {
    es: {
        nav: {
            about: "Perfil",
            stack: "Stack",
            projects: "Proyectos",
            repos: "GitHub",
            experience: "Experiencia",
            contact: "Contacto"
        },
        cta: {
            downloadCv: "Descargar CV",
            contact: "Contactar",
            linkedin: "LinkedIn",
            viewProject: "Ver proyecto",
            viewRepo: "Repositorio"
        },
        hero: {
            badge: "Disponible para nuevas oportunidades",
            role: "Full Stack Developer & IT Infrastructure",
            tagline: "12+ años construyendo y sosteniendo plataformas FinTech: React, Next.js, TypeScript, NestJS y Google Cloud, con foco en resiliencia de APIs, seguridad e identidad.",
            scroll: "Desplázate"
        },
        metrics: [
            {
                value: "12+",
                label: "Años de experiencia"
            },
            {
                value: "1000+",
                label: "Usuarios activos soportados"
            },
            {
                value: "6+",
                label: "Años en rol dual Dev/IT"
            },
            {
                value: "50%",
                label: "Reducción de backlog de tickets"
            }
        ],
        sections: {
            stack: {
                eyebrow: "Capacidades",
                title: "Stack tecnológico",
                subtitle: "Herramientas y prácticas que uso a diario en entornos críticos de FinTech."
            },
            projects: {
                eyebrow: "Trabajo",
                title: "Proyectos destacados",
                subtitle: "Productos end-to-end: arquitectura, backend, frontend y despliegue en la nube."
            },
            repos: {
                eyebrow: "Código",
                title: "Repositorios en GitHub",
                subtitle: "Repositorios públicos, ordenados por relevancia."
            },
            experience: {
                eyebrow: "Trayectoria",
                title: "Experiencia profesional",
                subtitle: "Desarrollo de producto e infraestructura, en paralelo."
            },
            credentials: {
                eyebrow: "Formación",
                title: "Certificaciones y educación",
                subtitle: "Aprendizaje continuo en desarrollo, seguridad e IA."
            },
            contact: {
                eyebrow: "Contacto",
                title: "Trabajemos juntos",
                subtitle: "Abierto a roles Full Stack, Frontend senior y posiciones híbridas Dev/IT."
            }
        },
        stack: [
            {
                category: "Frontend",
                items: [
                    "React.js",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Custom Hooks",
                    "memo / useMemo / useCallback"
                ]
            },
            {
                category: "Arquitectura Next.js",
                items: [
                    "SSR",
                    "SSG",
                    "ISR",
                    "React Server Components",
                    "Middleware",
                    "CDN Caching",
                    "SEO"
                ]
            },
            {
                category: "TypeScript",
                items: [
                    "Strict typing",
                    "Generics",
                    "Discriminated unions",
                    "Utility types"
                ]
            },
            {
                category: "Backend y datos",
                items: [
                    "Node.js",
                    "NestJS",
                    "PostgreSQL",
                    "MongoDB",
                    "Diseño de APIs"
                ]
            },
            {
                category: "APIs y resiliencia",
                items: [
                    "REST",
                    "OpenAPI",
                    "Interceptors",
                    "Retry logic",
                    "Timeouts",
                    "Fallback / degradación"
                ]
            },
            {
                category: "Autenticación y seguridad",
                items: [
                    "OAuth2 / OIDC",
                    "JWT",
                    "Refresh tokens",
                    "2FA",
                    "Okta",
                    "Azure AD B2C",
                    "CIAM"
                ]
            },
            {
                category: "Cloud y DevOps",
                items: [
                    "Docker",
                    "Google Cloud Run",
                    "CI/CD",
                    "Git workflows",
                    "Turborepo",
                    "pnpm"
                ]
            },
            {
                category: "Tiempo real y pagos",
                items: [
                    "WebSockets",
                    "Stripe API",
                    "Firebase Cloud Messaging"
                ]
            },
            {
                category: "Observabilidad",
                items: [
                    "Logs estructurados",
                    "Métricas",
                    "Trazas distribuidas",
                    "Gestión de incidentes"
                ]
            },
            {
                category: "Infraestructura e identidad",
                items: [
                    "Microsoft 365",
                    "Intune",
                    "Jamf",
                    "Kaseya",
                    "ZScaler",
                    "VPN",
                    "Windows Server"
                ]
            }
        ],
        projects: [
            {
                name: "Crypto Portfolio Tracker",
                year: "Full-stack",
                description: "Aplicación full-stack construida en ~1 semana con 4–5 funcionalidades core sobre ~10 endpoints. Arquitectura dual Backend-for-Frontend (BFF), precios en tiempo real por WebSocket vía Coinbase, autenticación JWT y notificaciones push con Firebase, sobre PostgreSQL con separación de esquemas.",
                tags: [
                    "NestJS",
                    "Next.js",
                    "Flutter",
                    "WebSockets",
                    "JWT",
                    "PostgreSQL",
                    "Firebase"
                ]
            },
            {
                name: "Areia Bela — Vacation Rental Booking",
                year: "En desarrollo",
                description: "Plataforma de reservas para alquiler vacacional en monorepo (pnpm + Turborepo). Versión core en ~1 mes con 4–5 funcionalidades y 10+ endpoints. Desplegada en Google Cloud Run, con pagos Stripe y verificación de firma de webhooks.",
                tags: [
                    "Next.js",
                    "NestJS",
                    "Turborepo",
                    "GCP Cloud Run",
                    "Stripe",
                    "Webhooks"
                ]
            },
            {
                name: "Banexcoin Bcore — Crypto Exchange",
                year: "Producción",
                description: "CMS e integraciones frontend para banexcoin.com y Banexcoin Bolivia, soportando funcionalidad core de exchange: flujos de trading, verificación de identidad (KYC) y conversión de pagos con stablecoins vía QR.",
                tags: [
                    "React",
                    "Next.js",
                    "CMS",
                    "KYC",
                    "Trading",
                    "Stablecoins"
                ],
                href: "https://banexcoin.com"
            }
        ],
        experience: [
            {
                company: "Banexcoin SA",
                role: "Full Stack Developer & IT Infrastructure Manager",
                period: "Nov 2019 – Presente",
                location: "Lima, Perú",
                bullets: [
                    "Desarrollo de aplicaciones web internas con React.js, Next.js, TypeScript, NestJS y Tailwind CSS para una plataforma FinTech con 1,000+ usuarios activos, aplicando SSR, SSG e ISR según el caso de uso.",
                    "Patrones avanzados de TypeScript (strict typing, generics, discriminated unions, utility types) para mejorar seguridad y mantenibilidad del código.",
                    "Capa de cliente HTTP con wrappers e interceptors: retry logic, timeouts y patrones de fallback/degradación para consumo resiliente de APIs.",
                    "Flujos de autenticación seguros con JWT, 2FA y OAuth2/OIDC, incluyendo ciclo de vida de access y refresh tokens en contextos SSR y CSR; gestión de identidad con Okta.",
                    "Optimización de performance y SEO: bundle optimization, middleware, estrategias de caché en CDN y routing de Next.js.",
                    "Observabilidad con logs estructurados, métricas y trazas para resolución de incidentes en entornos FinTech.",
                    "Soporte técnico Tier 1–3 para ~45 usuarios y dispositivos (Windows y macOS): −30 min en tiempo medio de resolución y −50% en backlog de tickets.",
                    "Gestión del ciclo de vida de activos IT y endpoints con Intune, Jamf y Kaseya."
                ]
            },
            {
                company: "Corsurp SAC",
                role: "IT Infrastructure Manager",
                period: "May 2013 – Sep 2019",
                location: "Lima, Perú",
                bullets: [
                    "Diagnóstico de hardware, software y conectividad de red en múltiples sedes, reduciendo el downtime operativo con soporte proactivo.",
                    "Administración de entornos Windows Server y soporte de onboarding/offboarding con documentación de sistemas.",
                    "Inventario de activos IT y gestión del ciclo de vida de estaciones de trabajo alineado a estándares de seguridad.",
                    "Soporte de sistemas VoIP, accesos remotos y operaciones técnicas de usuario final."
                ]
            }
        ],
        certifications: [
            {
                name: "CompTIA A+",
                issuer: "En curso"
            },
            {
                name: "Desarrollo Seguro con Flutter",
                issuer: "Certificación"
            },
            {
                name: "AI Fluency: Framework & Foundations",
                issuer: "Anthropic"
            },
            {
                name: "Claude 101",
                issuer: "Anthropic"
            }
        ],
        education: [
            {
                title: "Full Stack Development",
                school: "Coderhouse — Buenos Aires, Argentina",
                period: "2022 – 2023"
            },
            {
                title: "Network & Communications Engineering",
                school: "ISIL Institute — Lima, Perú",
                period: "2016 – 2021"
            }
        ],
        languages: "Español — Nativo · Inglés — Básico",
        reposEmpty: "No hay repositorios públicos para mostrar por ahora.",
        footerNote: "Diseñado y construido por Erick Giraldo Muñoz"
    },
    en: {
        nav: {
            about: "Profile",
            stack: "Stack",
            projects: "Projects",
            repos: "GitHub",
            experience: "Experience",
            contact: "Contact"
        },
        cta: {
            downloadCv: "Download CV",
            contact: "Get in touch",
            linkedin: "LinkedIn",
            viewProject: "View project",
            viewRepo: "Repository"
        },
        hero: {
            badge: "Open to new opportunities",
            role: "Full Stack Developer & IT Infrastructure",
            tagline: "12+ years building and sustaining FinTech platforms: React, Next.js, TypeScript, NestJS and Google Cloud, with a focus on API resilience, security and identity.",
            scroll: "Scroll"
        },
        metrics: [
            {
                value: "12+",
                label: "Years of experience"
            },
            {
                value: "1000+",
                label: "Active users supported"
            },
            {
                value: "6+",
                label: "Years in dual Dev/IT role"
            },
            {
                value: "50%",
                label: "Support backlog reduction"
            }
        ],
        sections: {
            stack: {
                eyebrow: "Capabilities",
                title: "Technology stack",
                subtitle: "Tools and practices I use daily in business-critical FinTech environments."
            },
            projects: {
                eyebrow: "Work",
                title: "Featured projects",
                subtitle: "End-to-end products: architecture, backend, frontend and cloud deployment."
            },
            repos: {
                eyebrow: "Code",
                title: "GitHub repositories",
                subtitle: "Public repositories, sorted by relevance."
            },
            experience: {
                eyebrow: "Track record",
                title: "Professional experience",
                subtitle: "Product development and infrastructure, in parallel."
            },
            credentials: {
                eyebrow: "Learning",
                title: "Certifications & education",
                subtitle: "Continuous learning across development, security and AI."
            },
            contact: {
                eyebrow: "Contact",
                title: "Let's work together",
                subtitle: "Open to Full Stack, Senior Frontend and hybrid Dev/IT roles."
            }
        },
        stack: [
            {
                category: "Frontend",
                items: [
                    "React.js",
                    "Next.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "Custom Hooks",
                    "memo / useMemo / useCallback"
                ]
            },
            {
                category: "Next.js architecture",
                items: [
                    "SSR",
                    "SSG",
                    "ISR",
                    "React Server Components",
                    "Middleware",
                    "CDN caching",
                    "SEO"
                ]
            },
            {
                category: "TypeScript",
                items: [
                    "Strict typing",
                    "Generics",
                    "Discriminated unions",
                    "Utility types"
                ]
            },
            {
                category: "Backend & data",
                items: [
                    "Node.js",
                    "NestJS",
                    "PostgreSQL",
                    "MongoDB",
                    "API design"
                ]
            },
            {
                category: "APIs & resilience",
                items: [
                    "REST",
                    "OpenAPI",
                    "Interceptors",
                    "Retry logic",
                    "Timeouts",
                    "Fallback / degradation"
                ]
            },
            {
                category: "Auth & security",
                items: [
                    "OAuth2 / OIDC",
                    "JWT",
                    "Refresh tokens",
                    "2FA",
                    "Okta",
                    "Azure AD B2C",
                    "CIAM"
                ]
            },
            {
                category: "Cloud & DevOps",
                items: [
                    "Docker",
                    "Google Cloud Run",
                    "CI/CD",
                    "Git workflows",
                    "Turborepo",
                    "pnpm"
                ]
            },
            {
                category: "Real-time & payments",
                items: [
                    "WebSockets",
                    "Stripe API",
                    "Firebase Cloud Messaging"
                ]
            },
            {
                category: "Observability",
                items: [
                    "Structured logging",
                    "Metrics",
                    "Distributed tracing",
                    "Incident response"
                ]
            },
            {
                category: "Infrastructure & identity",
                items: [
                    "Microsoft 365",
                    "Intune",
                    "Jamf",
                    "Kaseya",
                    "ZScaler",
                    "VPN",
                    "Windows Server"
                ]
            }
        ],
        projects: [
            {
                name: "Crypto Portfolio Tracker",
                year: "Full-stack",
                description: "Full-stack app built in ~1 week, delivering 4–5 core features across ~10 API endpoints. Dual Backend-for-Frontend (BFF) architecture, real-time WebSocket price feeds via Coinbase, JWT authentication and Firebase push notifications, backed by PostgreSQL with schema separation.",
                tags: [
                    "NestJS",
                    "Next.js",
                    "Flutter",
                    "WebSockets",
                    "JWT",
                    "PostgreSQL",
                    "Firebase"
                ]
            },
            {
                name: "Areia Bela — Vacation Rental Booking",
                year: "In progress",
                description: "Whole-home vacation rental booking platform in a monorepo (pnpm + Turborepo). Core version built in ~1 month with 4–5 features and 10+ endpoints. Deployed on Google Cloud Run, with Stripe payments and webhook signature verification.",
                tags: [
                    "Next.js",
                    "NestJS",
                    "Turborepo",
                    "GCP Cloud Run",
                    "Stripe",
                    "Webhooks"
                ]
            },
            {
                name: "Banexcoin Bcore — Crypto Exchange",
                year: "Production",
                description: "CMS and front-end integrations for banexcoin.com and Banexcoin Bolivia, supporting core exchange functionality: trading flows, KYC identity verification and QR-based stablecoin payment conversion.",
                tags: [
                    "React",
                    "Next.js",
                    "CMS",
                    "KYC",
                    "Trading",
                    "Stablecoins"
                ],
                href: "https://banexcoin.com"
            }
        ],
        experience: [
            {
                company: "Banexcoin SA",
                role: "Full Stack Developer & IT Infrastructure Manager",
                period: "Nov 2019 – Present",
                location: "Lima, Peru",
                bullets: [
                    "Built internal web applications with React.js, Next.js, TypeScript, NestJS and Tailwind CSS for a FinTech platform with 1,000+ active users, applying SSR, SSG and ISR per use case.",
                    "Applied advanced TypeScript patterns (strict typing, generics, discriminated unions, utility types) to improve code safety and maintainability.",
                    "Designed an HTTP client layer with wrappers and interceptors: retry logic, timeouts and fallback/degradation patterns for resilient API consumption.",
                    "Implemented secure auth flows with JWT, 2FA and OAuth2/OIDC, including access and refresh token lifecycle in SSR and CSR contexts; identity management with Okta.",
                    "Performance and SEO optimization: bundle optimization, middleware, CDN caching strategies and Next.js routing.",
                    "Observability with structured logs, metrics and traces to support incident resolution in FinTech environments.",
                    "Tier 1–3 support for ~45 users and devices (Windows and macOS): −30 min average resolution time and −50% ticket backlog.",
                    "IT asset lifecycle and endpoint administration with Intune, Jamf and Kaseya."
                ]
            },
            {
                company: "Corsurp SAC",
                role: "IT Infrastructure Manager",
                period: "May 2013 – Sep 2019",
                location: "Lima, Peru",
                bullets: [
                    "Troubleshot hardware, software and network connectivity across multiple locations, reducing downtime through proactive support.",
                    "Managed Windows Server environments and supported onboarding/offboarding with system administration and documentation.",
                    "Maintained IT asset inventory and workstation lifecycle aligned with company security standards.",
                    "Supported VoIP systems, remote access technologies and end-user technical operations."
                ]
            }
        ],
        certifications: [
            {
                name: "CompTIA A+",
                issuer: "In progress"
            },
            {
                name: "Secure Flutter Development",
                issuer: "Certification"
            },
            {
                name: "AI Fluency: Framework & Foundations",
                issuer: "Anthropic"
            },
            {
                name: "Claude 101",
                issuer: "Anthropic"
            }
        ],
        education: [
            {
                title: "Full Stack Development",
                school: "Coderhouse — Buenos Aires, Argentina",
                period: "2022 – 2023"
            },
            {
                title: "Network & Communications Engineering",
                school: "ISIL Institute — Lima, Peru",
                period: "2016 – 2021"
            }
        ],
        languages: "Spanish — Native · English — Basic",
        reposEmpty: "No public repositories to show yet.",
        footerNote: "Designed and built by Erick Giraldo Muñoz"
    }
};
}),
"[project]/src/integrations/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
function isNewSupabaseApiKey(value) {
    return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
    return (input, init)=>{
        const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
        if (init?.headers) {
            new Headers(init.headers).forEach((value, key)=>headers.set(key, value));
        }
        // New Supabase API keys are opaque strings, not bearer JWTs.
        if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
            headers.delete("Authorization");
        }
        headers.set("apikey", supabaseKey);
        return fetch(input, {
            ...init,
            headers
        });
    };
}
function createSupabaseClient() {
    // Inlined at build time by Next.js, so the same values work in the browser and on the server.
    const SUPABASE_URL = ("TURBOPACK compile-time value", "https://ocrfahiiebjjfehidydj.supabase.co");
    const SUPABASE_PUBLISHABLE_KEY = ("TURBOPACK compile-time value", "sb_publishable_ZwUPQxvwQESuyM2UooqzOQ_Wh3y9KUp");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const isBrowser = ("TURBOPACK compile-time value", "undefined") !== "undefined";
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: {
            fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY)
        },
        auth: {
            persistSession: isBrowser,
            autoRefreshToken: isBrowser
        }
    });
}
let _supabase;
const supabase = new Proxy({}, {
    get (_, prop, receiver) {
        if (!_supabase) _supabase = createSupabaseClient();
        return Reflect.get(_supabase, prop, receiver);
    }
});
}),
"[project]/src/lib/site-content.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultSiteData",
    ()=>defaultSiteData,
    "langs",
    ()=>langs,
    "mergeSiteData",
    ()=>mergeSiteData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/cv.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$cv$2e$pdf$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/cv.pdf.asset.json.[json].cjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$erick$2d$portrait$2e$png$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/erick-portrait.png.asset.json.[json].cjs [app-ssr] (ecmascript)");
;
;
;
const defaultSiteData = {
    profile: {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["profile"],
        github: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GITHUB_USERNAME"] ? `https://github.com/${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GITHUB_USERNAME"]}` : "",
        githubUser: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GITHUB_USERNAME"],
        cvUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$cv$2e$pdf$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].url,
        portraitUrl: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$erick$2d$portrait$2e$png$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].url
    },
    music: {
        tracks: [],
        active: 0
    },
    es: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["content"].es,
    en: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$cv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["content"].en
};
const isPlainObject = (value)=>typeof value === "object" && value !== null && !Array.isArray(value);
function mergeSiteData(overrides) {
    const merge = (base, patch)=>{
        if (patch === undefined || patch === null) return base;
        if (isPlainObject(base) && isPlainObject(patch)) {
            const out = {
                ...base
            };
            for (const key of Object.keys(patch))out[key] = merge(base[key], patch[key]);
            return out;
        }
        return patch;
    };
    return merge(defaultSiteData, overrides);
}
const langs = [
    "es",
    "en"
];
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
]})(),
"[project]/src/assets/cv.pdf.asset.json.[json].cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "version": 1,
    "asset_id": "32d906fc-9a20-4d1b-a410-6e8d60666e0c",
    "project_id": "a073b421-7827-4c53-973c-0a8ade3c5542",
    "url": "/Erick_Giraldo_CV.pdf",
    "r2_key": "a/v1/a073b421-7827-4c53-973c-0a8ade3c5542/32d906fc-9a20-4d1b-a410-6e8d60666e0c/Erick_Giraldo_CV.pdf",
    "original_filename": "Erick_Giraldo_CV.pdf",
    "size": 305779,
    "content_type": "application/pdf",
    "created_at": "2026-08-28T21:36:59Z"
};
}),
"[project]/src/assets/erick-portrait.png.asset.json.[json].cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "version": 1,
    "asset_id": "73a7f443-982d-43d7-b295-3b330398308d",
    "project_id": "a073b421-7827-4c53-973c-0a8ade3c5542",
    "url": "/erick-portrait.png",
    "r2_key": "a/v1/a073b421-7827-4c53-973c-0a8ade3c5542/73a7f443-982d-43d7-b295-3b330398308d/erick-portrait.png",
    "original_filename": "erick-portrait.png",
    "size": 1351952,
    "content_type": "image/png",
    "created_at": "2026-08-28T21:47:54Z"
};
}),
];

//# sourceMappingURL=src_0nh-dtbcia5nv._.js.map