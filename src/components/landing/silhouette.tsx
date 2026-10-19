import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Particle silhouette built from the portrait at runtime: the navy studio backdrop is
 * keyed out, the figure becomes a stippled shadow that breathes, turns toward the pointer,
 * scatters where the cursor touches it and sheds dust off one shoulder — a 2D take on
 * the WebGL figure in the allerstudio.com hero.
 */

type Particle = {
  hx: number; // home position, normalized 0..1
  hy: number;
  depth: number; // -1..1, nearer parts move more with the pointer
  tone: number; // 0 = ink, 1 = paper
  size: number;
  lime: boolean;
  dust: boolean;
  seed: number;
  x: number; // live position, px
  y: number;
  vx: number;
  vy: number;
};

const STEP = 2; // sample spacing in px of the sampling canvas
const SAMPLE_W = 300;

/*
 * Navy backdrop key. Measured on the portrait: backdrop pixels are clearly blue
 * (b − max(r, g) ≈ 12–40, b / max(r, g) ≥ 1.7) while the black hair and shirt stay
 * near neutral (difference ≤ 10), so both cues together separate them.
 */
function backdropScore(r: number, g: number, b: number) {
  const top = Math.max(r, g);
  const diff = Math.min(1, Math.max(0, (b - top - 8) / 6));
  const ratio = Math.min(1, Math.max(0, (b / (top + 1) - 1.45) / 0.4));
  return diff * ratio;
}

function isBackdrop(r: number, g: number, b: number) {
  return backdropScore(r, g, b) > 0.5;
}

function drawCropped(img: HTMLImageElement, width: number, height: number) {
  const off = document.createElement("canvas");
  off.width = width;
  off.height = height;
  const g = off.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  g.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
  return { off, g };
}

/** Portrait with the studio backdrop keyed to transparent, cropped like the particle field. */
function makeCutout(img: HTMLImageElement, aspect: number): Promise<string | null> {
  const width = 720;
  const height = Math.round(width / aspect);
  const drawn = drawCropped(img, width, height);
  if (!drawn) return Promise.resolve(null);
  const frame = drawn.g.getImageData(0, 0, width, height);
  const d = frame.data;
  for (let i = 0; i < d.length; i += 4)
    d[i + 3] = Math.round(255 * (1 - backdropScore(d[i]!, d[i + 1]!, d[i + 2]!)));
  drawn.g.putImageData(frame, 0, 0);
  return new Promise((resolve) =>
    drawn.off.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), "image/png"),
  );
}

function buildParticles(img: HTMLImageElement, aspect: number) {
  // Crop the square portrait to the container aspect (object-cover, centered).
  const sw = SAMPLE_W;
  const sh = Math.round(SAMPLE_W / aspect);
  const drawn = drawCropped(img, sw, sh);
  if (!drawn) return [];
  const { data } = drawn.g.getImageData(0, 0, sw, sh);

  const particles: Particle[] = [];
  for (let y = 0; y < sh; y += STEP) {
    for (let x = 0; x < sw; x += STEP) {
      const jx = Math.min(sw - 1, x + Math.floor(Math.random() * STEP));
      const jy = Math.min(sh - 1, y + Math.floor(Math.random() * STEP));
      const i = (jy * sw + jx) * 4;
      const r = data[i]!;
      const gr = data[i + 1]!;
      const b = data[i + 2]!;
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
        vy: 0,
      });
    }
  }
  return particles;
}

export function Silhouette({
  src,
  className,
  play,
  hint,
  revealLabel,
}: {
  src: string;
  className?: string;
  play: boolean;
  hint: string;
  revealLabel: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playRef = useRef(play);
  const revealedRef = useRef(false);
  const redrawRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [cutout, setCutout] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  playRef.current = play;
  revealedRef.current = revealed;

  useEffect(() => redrawRef.current(), [revealed]);
  useEffect(() => () => void (cutout && URL.revokeObjectURL(cutout)), [cutout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let assembledAt = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };
    // Lens that uncovers the photo: follows the pointer on hover, swells to full on click.
    const lens = { x: 0, y: 0, r: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    const scatter = () => {
      for (const p of particles) {
        const a = Math.random() * Math.PI * 2;
        const d = (0.4 + Math.random() * 0.8) * Math.max(w, h);
        p.x = w / 2 + Math.cos(a) * d;
        p.y = h / 2 + Math.sin(a) * d;
        p.vx = 0;
        p.vy = 0;
      }
    };

    const draw = (now: number) => {
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

      for (const p of particles) {
        // Home point with breathing, idle sway and pointer-driven head turn.
        const turn = (pointer.x * 18 + sway * w) * (0.4 + p.depth * 0.6);
        const tilt = pointer.y * 10 * (0.4 + p.depth * 0.6);
        let tx = w / 2 + (p.hx - 0.5) * w * breathe + turn;
        let ty = h * 0.98 - (0.98 - p.hy) * h * breathe + tilt;

        if (p.dust) {
          // Dust drifts up and right on a loop, then re-forms at its home spot.
          const life = (((t * 0.12 + p.seed) % 1) + 1) % 1;
          const drift = life * life;
          tx += drift * (140 + (p.seed % 90)) + Math.sin(t * 2 + p.seed) * 6 * drift;
          ty -= drift * (110 + (p.seed % 70));
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
            p.vx += (lx / Math.max(1, ld)) * push;
            p.vy += (ly / Math.max(1, ld)) * push;
          }
          const edge = Math.min(1, Math.max(0, (ld - lens.r * 0.55) / (lens.r * 0.6)));
          lensFade = edge * edge * (3 - 2 * edge);
        }

        p.x += p.vx;
        p.y += p.vy;

        let alpha = (playing ? 0.25 + settle * 0.75 : 0) * lensFade * (1 - revealAmount);
        if (p.dust) alpha *= 1 - ((((t * 0.12 + p.seed) % 1) + 1) % 1) * 0.9;
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

    const drawStatic = () => {
      if (!particles.length || !reduced) return;
      running = true;
      draw(performance.now());
      running = false;
    };
    redrawRef.current = drawStatic;

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      resize();
      particles = buildParticles(img, w / h || 0.8);
      void makeCutout(img, w / h || 0.8).then(setCutout);
      if (reduced) {
        for (const p of particles) {
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

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = Math.max(
        -1,
        Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)),
      );
      pointer.ty = Math.max(
        -1,
        Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)),
      );
      pointer.px = e.clientX - r.left;
      pointer.py = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.px = -1e4;
      pointer.py = -1e4;
    };

    const io = new IntersectionObserver(([entry]) => {
      if (!particles.length || reduced) return;
      if (entry?.isIntersecting && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : particles.length && !reduced && start());
    const ro = new ResizeObserver(() => {
      if (!particles.length) return;
      resize();
      if (reduced) {
        running = true;
        draw(performance.now());
        running = false;
      }
    });
    ro.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src]);

  const lensMask =
    "radial-gradient(circle var(--r, 0px) at var(--mx, 50%) var(--my, 50%), #000 55%, transparent 100%)";

  return (
    <div
      ref={wrapRef}
      role="button"
      tabIndex={0}
      aria-pressed={revealed}
      aria-label={revealLabel}
      data-cursor-skip
      onClick={() => setRevealed((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRevealed((v) => !v);
        }
      }}
      className={cn(
        "group/sil relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-lime",
        className,
      )}
    >
      {cutout ? (
        <img
          src={cutout}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{ maskImage: lensMask, WebkitMaskImage: lensMask }}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "relative h-full w-full transition-opacity duration-1000 ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/60 backdrop-blur transition-opacity duration-500",
          ready && !revealed
            ? "opacity-0 group-hover/sil:opacity-100 group-focus-visible/sil:opacity-100"
            : "opacity-0",
        )}
      >
        {hint}
      </span>
    </div>
  );
}
