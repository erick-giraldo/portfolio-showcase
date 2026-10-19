"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/*
 * ASCII glyph field that blooms around the pointer over empty page background,
 * shimmering while the mouse moves — the cursor effect from allerstudio.com.
 * Cells over text, media, opaque surfaces, the header or [data-cursor-skip] stay clear.
 */

const GLYPHS = ".:-=+*#%@";
const CELL = 10;
const RADIUS = 200;
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const palettes = {
  light: {
    base: "#dadee2",
    accents: [
      { color: "#646aed", share: 0.01 },
      { color: "#d5fe00", share: 0.02 },
      { color: "#121212", share: 0.1 },
    ],
  },
  dark: {
    base: "#2e2e2e",
    accents: [
      { color: "#646aed", share: 0.01 },
      { color: "#d5fe00", share: 0.02 },
      { color: "#f2f4f5", share: 0.1 },
    ],
  },
};

/** Deterministic hash noise in [0, 1). */
function hash(x: number, y: number, z: number) {
  const v = Math.sin(127.1 * x + 311.7 * y + 74.7 * z) * 43758.5453;
  return v - Math.floor(v);
}

function subscribeQuery(cb: () => void) {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function hasOpaqueBackground(el: Element, cache: WeakMap<Element, boolean>) {
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    let opaque = cache.get(n);
    if (opaque === undefined) {
      const m = getComputedStyle(n).backgroundColor.match(/rgba?\(([^)]+)\)/);
      const alpha = m ? Number(m[1]!.split(/[,/ ]+/).filter(Boolean)[3] ?? 1) : 0;
      opaque = alpha > 0.5;
      cache.set(n, opaque);
    }
    if (opaque) return true;
  }
  return false;
}

function isOverGlyph(x: number, y: number) {
  let node: Node | null = null;
  let offset = 0;
  if ("caretPositionFromPoint" in document) {
    const pos = (
      document as Document & {
        caretPositionFromPoint(x: number, y: number): { offsetNode: Node; offset: number } | null;
      }
    ).caretPositionFromPoint(x, y);
    node = pos?.offsetNode ?? null;
    offset = pos?.offset ?? 0;
  } else {
    const range = (
      document as Document & { caretRangeFromPoint?(x: number, y: number): Range | null }
    ).caretRangeFromPoint?.(x, y);
    node = range?.startContainer ?? null;
    offset = range?.startOffset ?? 0;
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const length = node.textContent?.length ?? 0;
  const range = document.createRange();
  for (const i of [offset - 1, offset]) {
    if (i < 0 || i >= length) continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2) return true;
  }
  return false;
}

export function CursorField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const enabled = useSyncExternalStore(
    subscribeQuery,
    () => matchMedia(QUERY).matches,
    () => false,
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!enabled || !canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    let dpr = 1;
    const resize = () => {
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
    let bgCache = new WeakMap<Element, boolean>();
    let genStart = performance.now();
    let budgetEnd = 0;
    let skipRects: DOMRect[] = [];
    const cells = new Map<number, { value: boolean; gen: number }>();
    const invalidate = () => {
      gen++;
      bgCache = new WeakMap();
      genStart = performance.now();
    };

    const visible = (cx: number, cy: number, x: number, y: number): boolean | undefined => {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
      if (skipRects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom))
        return false;
      const key = cx * 100003 + cy;
      const hit = cells.get(key);
      if (hit?.gen === gen) return hit.value;
      if (performance.now() > budgetEnd) return hit?.value;
      const el = document.elementFromPoint(x, y);
      const value =
        !!el &&
        !el.closest("img, video, svg, canvas, iframe, input, textarea, select") &&
        !hasOpaqueBackground(el, bgCache) &&
        !isOverGlyph(x, y);
      if (cells.size > 60000) cells.clear();
      cells.set(key, { value, gen });
      return value;
    };

    const frame = (now: number) => {
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
      skipRects = [...document.querySelectorAll("header, [data-cursor-skip]")].map((e) =>
        e.getBoundingClientRect(),
      );

      const palette = document.documentElement.classList.contains("dark")
        ? palettes.dark
        : palettes.light;
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

      for (let cx = x0; cx <= x1; cx++) {
        for (let cy = y0; cy <= y1; cy++) {
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
          for (const a of palette.accents) {
            if (pick < a.share) {
              color = a.color;
              break;
            }
            pick -= a.share;
          }
          g.fillStyle = color;
          g.globalAlpha = Math.min(1, 1.4 * strength);
          g.fillText(GLYPHS[idx]!, ax - scrollX + dx, ay - scrollY + dy);
        }
      }
      g.globalAlpha = 1;

      const settled = inside && !pending && motion < 0.01 && presence > 0.995;
      if (!settled) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
      inside = true;
      kick();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        inside = false;
        kick();
      }
    };
    const onResize = () => {
      resize();
      invalidate();
      kick();
    };
    let debounce = 0;
    const onMutate = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(invalidate, 100);
    };
    const observer = new MutationObserver(onMutate);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(debounce);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 h-screen w-screen"
    />
  );
}
