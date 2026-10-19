"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/lib/site-content";
import { useLang, useSiteData } from "./lang-context";

/*
 * UI sound effects + soundtrack player, modeled on allerstudio.com.
 * Effects and the "ambient" entry are synthesized with WebAudio; other entries are
 * tracks the admin uploads. One master switch silences everything.
 */

const PREF_KEY = "sound";
const VOLUME_KEY = "sound-volume";
export const AMBIENT_SRC = "ambient:";

type Entry = MusicTrack;

type State = {
  enabled: boolean;
  playing: boolean;
  index: number;
  playlist: Entry[];
  volume: number;
  time: number;
  duration: number;
};

let state: State = {
  enabled: true,
  playing: false,
  index: 0,
  playlist: [{ title: "Ambient", src: AMBIENT_SRC }],
  volume: 0.6,
  time: 0,
  duration: 0,
};
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let audioEl: HTMLAudioElement | null = null; // the element currently in use
let routedEl: HTMLAudioElement | null = null;
let plainEl: HTMLAudioElement | null = null;
let ambientStop: (() => void) | null = null;

function emit(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}

/** AudioContext can only start after a user gesture. */
function unlock() {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

function blip(kind: "hover" | "click") {
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
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
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

/** Slow generative pad: detuned saws through a breathing low-pass, cycling four chords. */
function startAmbient() {
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
    [110, 164.81, 196, 246.94, 261.63],
    [87.31, 174.61, 220, 261.63, 329.63],
    [130.81, 196, 261.63, 293.66, 329.63],
    [98, 146.83, 196, 246.94, 329.63],
  ];
  const voices = chords[0]!.map((f) =>
    [-6, 6].map((detune) => {
      const o = audio.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = detune;
      o.connect(filter);
      o.start();
      return o;
    }),
  );

  let step = 0;
  const id = window.setInterval(() => {
    step = (step + 1) % chords.length;
    const t = audio.currentTime;
    voices.forEach((pair, i) =>
      pair.forEach((o) => o.frequency.setTargetAtTime(chords[step]![i]!, t, 1.2)),
    );
  }, 8000);

  ambientStop = () => {
    window.clearInterval(id);
    const t = audio.currentTime;
    out.gain.cancelScheduledValues(t);
    out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    window.setTimeout(() => {
      voices.flat().forEach((o) => o.stop());
      lfo.stop();
      out.disconnect();
    }, 900);
    ambientStop = null;
  };
}

function createAudio() {
  const el = new Audio();
  el.preload = "none";
  el.addEventListener("timeupdate", () => el === audioEl && emit({ time: el.currentTime }));
  el.addEventListener(
    "loadedmetadata",
    () => el === audioEl && emit({ duration: Number.isFinite(el.duration) ? el.duration : 0 }),
  );
  el.addEventListener("ended", () => el === audioEl && skip(1));
  el.addEventListener("error", () => el === audioEl && state.playing && skip(1));
  return el;
}

/**
 * Same-origin tracks play through an element wired into the analyser (real spectrum, bus volume).
 * Cross-origin URLs use a plain element: routing them without CORS headers would play silence.
 */
function audioFor(src: string) {
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

function playIndex(index: number) {
  unlock();
  const entry = state.playlist[index];
  if (!entry) return;
  stopAll();
  if (!state.enabled) setEnabled(true);
  emit({ index, playing: true, time: 0, duration: 0 });

  if (entry.src === AMBIENT_SRC) {
    startAmbient();
    return;
  }
  const el = audioFor(entry.src);
  audioEl = el;
  if (el.src !== new URL(entry.src, location.href).href) el.src = entry.src;
  el.currentTime = 0;
  void el.play().catch(() => emit({ playing: false }));
}

function pause() {
  stopAll();
  emit({ playing: false });
}

function toggle() {
  if (state.playing) pause();
  else if (state.playlist[state.index]?.src === AMBIENT_SRC || !audioEl?.src)
    playIndex(state.index);
  else {
    unlock();
    if (!state.enabled) setEnabled(true);
    emit({ playing: true });
    void audioEl.play().catch(() => emit({ playing: false }));
  }
}

function skip(dir: 1 | -1) {
  const n = state.playlist.length;
  if (!n) return;
  playIndex((state.index + dir + n) % n);
}

function seek(fraction: number) {
  if (audioEl && state.duration) audioEl.currentTime = fraction * state.duration;
}

function setVolume(volume: number) {
  write(VOLUME_KEY, String(volume));
  if (musicBus && ctx) musicBus.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
  if (plainEl) plainEl.volume = volume;
  emit({ volume });
}

function setEnabled(enabled: boolean) {
  write(PREF_KEY, enabled ? "on" : "off");
  if (!enabled) {
    stopAll();
    emit({ enabled, playing: false });
    return;
  }
  emit({ enabled });
}

function setPlaylist(tracks: MusicTrack[], active: number, ambientTitle: string) {
  const playlist = [{ title: ambientTitle, src: AMBIENT_SRC }, ...tracks.filter((t) => t.src)];
  const sameList =
    playlist.length === state.playlist.length &&
    playlist.every((e, i) => e.src === state.playlist[i]?.src);
  if (sameList) {
    emit({ playlist });
    return;
  }
  if (state.playing) pause();
  audioEl = null;
  emit({
    playlist,
    index: Math.min(Math.max(active, 0), playlist.length - 1),
    time: 0,
    duration: 0,
  });
}

export function useSound() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

/** Global listeners: unlock audio on first gesture, blip on interactive hover/click. */
export function SoundEffects() {
  const site = useSiteData();
  const { lang } = useLang();

  useEffect(() => {
    setPlaylist(
      site.music.tracks,
      site.music.active,
      lang === "es" ? "Ambiente generativo" : "Generative ambient",
    );
  }, [site.music, lang]);

  useEffect(() => {
    const storedVolume = Number(read(VOLUME_KEY));
    emit({
      enabled: read(PREF_KEY) !== "off",
      volume:
        Number.isFinite(storedVolume) && read(VOLUME_KEY) !== null ? storedVolume : state.volume,
    });

    const interactive = "a, button, [role='button'], summary, input[type='range']";
    let lastHover: Element | null = null;

    const onDown = () => unlock();
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest(interactive) ?? null;
      if (el && el !== lastHover) blip("hover");
      lastHover = el;
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(interactive)) blip("click");
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("keydown", onDown);
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onDown);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick, true);
      pause();
    };
  }, []);

  return null;
}

/** Spectrum bars from the analyser; falls back to a synthetic wave when no data flows. */
function Visualizer({
  playing,
  bars = 20,
  className,
}: {
  playing: boolean;
  bars?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = [...root.children] as HTMLElement[];
    const data = new Uint8Array(32);
    let raf = 0;
    const frame = (now: number) => {
      let energy = 0;
      if (analyser && playing) {
        analyser.getByteFrequencyData(data);
        energy = data.reduce((a, b) => a + b, 0);
      }
      nodes.forEach((node, i) => {
        let v: number;
        if (!playing) v = 0.12;
        else if (energy > 0)
          v = Math.max(0.12, (data[Math.floor((i / nodes.length) * 24)] ?? 0) / 255);
        else
          v = 0.25 + 0.6 * Math.abs(Math.sin(now / 380 + i * 0.7) * Math.cos(now / 910 + i * 0.3));
        node.style.transform = `scaleY(${v.toFixed(3)})`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div ref={ref} aria-hidden className={cn("flex items-end gap-[3px]", className)}>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="h-full flex-1 origin-bottom rounded-full bg-current transition-transform duration-75"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}

const spectrum = new Uint8Array(32);

/** Normalized spectrum (0..1 per bin) plus overall energy; synthetic motion when no data flows. */
function sample(playing: boolean, now: number, out: Float32Array) {
  let sum = 0;
  if (analyser && playing) {
    analyser.getByteFrequencyData(spectrum);
    for (let i = 0; i < out.length; i++) sum += spectrum[i]!;
  }
  for (let i = 0; i < out.length; i++) {
    if (!playing) out[i] = 0.04;
    // Perceptual curve + high-frequency tilt so quiet upper bins still move.
    else if (sum > 0) out[i] = Math.min(1, ((spectrum[i]! / 255) * (1 + i * 0.12)) ** 0.65);
    else
      out[i] =
        0.2 + 0.5 * Math.abs(Math.sin(now / 420 + i * 0.55) * Math.cos(now / 1300 + i * 0.2));
  }
  let energy = 0;
  for (let i = 0; i < 10; i++) energy += out[i]!;
  return energy / 10;
}

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Mirrored, glowing waveform drawn on canvas. Also publishes `--energy` on `energyTarget`. */
function Spectrum({
  playing,
  energyTarget,
  className,
}: {
  playing: boolean;
  energyTarget?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const bins = 24;
    const raw = new Float32Array(bins);
    const smooth = new Float32Array(bins).fill(0.04);
    const still = reducedMotion();
    let energy = 0;
    let raf = 0;

    const frame = (now: number) => {
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
      for (let i = 0; i < bins; i++) smooth[i]! += (raw[i]! - smooth[i]!) * 0.25;

      // Symmetric around the center: low frequencies in the middle, highs at the edges.
      const pts: [number, number][] = [];
      const n = bins * 2 - 1;
      for (let k = 0; k < n; k++) {
        const bin = Math.abs(k - (bins - 1));
        pts.push([(k / (n - 1)) * w, Math.max(0.03, smooth[bin]!) * (h / 2 - 2)]);
      }
      const mid = h / 2;
      const trace = (sign: 1 | -1) => {
        g.moveTo(0, mid);
        for (let k = 0; k < pts.length - 1; k++) {
          const [x0, y0] = pts[k]!;
          const [x1, y1] = pts[k + 1]!;
          g.quadraticCurveTo(x0, mid - sign * y0, (x0 + x1) / 2, mid - (sign * (y0 + y1)) / 2);
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

      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, energyTarget]);

  return <canvas ref={ref} aria-hidden className={cn("block w-full", className)} />;
}

/** Spinning "record" whose glow and scale follow the music energy. */
function Disc({ playing, ambient }: { playing: boolean; ambient: boolean }) {
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-lime/40 blur-xl transition-opacity duration-500"
        style={{
          opacity: playing ? "calc(0.25 + var(--energy, 0) * 0.9)" : 0,
          transform: "scale(calc(1 + var(--energy, 0) * 0.5))",
        }}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full ring-1 ring-white/15 animate-spin-slow",
          !playing && "[animation-play-state:paused]",
        )}
        style={{
          background:
            "repeating-radial-gradient(circle at center, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px), conic-gradient(from 0deg, #1d1d1d, #3a3a3a 15%, #121212 35%, #2b2b2b 60%, #121212 80%, #1d1d1d)",
          animationDuration: "6s",
        }}
      />
      <span
        className="relative grid h-5 w-5 place-items-center rounded-full bg-lime text-ink shadow-[0_0_12px_rgb(213_254_0/0.6)]"
        style={{ transform: playing ? "scale(calc(1 + var(--energy, 0) * 0.25))" : undefined }}
      >
        {ambient ? <Sparkles className="h-2.5 w-2.5" /> : <Music2 className="h-2.5 w-2.5" />}
      </span>
    </div>
  );
}

/** Draggable progress bar with a hover time preview; arrow keys seek ±5 s. */
function Scrubber({ time, duration, label }: { time: number; duration: number; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const progress = drag ?? (duration ? time / duration : 0);

  const at = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };

  return (
    <div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={fmt(time)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(at(e));
        }}
        onPointerMove={(e) => {
          setHover(at(e));
          if (drag !== null) setDrag(at(e));
        }}
        onPointerUp={(e) => {
          if (drag !== null) seek(at(e));
          setDrag(null);
        }}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (!duration) return;
          const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
          if (step) {
            e.preventDefault();
            seek(Math.min(1, Math.max(0, (time + step) / duration)));
          }
        }}
        className="group relative h-4 w-full cursor-pointer touch-none outline-none"
      >
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10 transition-[height] group-hover:h-1.5" />
        {hover !== null ? (
          <span
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15 group-hover:h-1.5"
            style={{ width: `${hover * 100}%` }}
          />
        ) : null}
        <span
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-lime/60 to-lime shadow-[0_0_10px_rgb(213_254_0/0.55)] transition-[height] group-hover:h-1.5"
          style={{ width: `${progress * 100}%` }}
        />
        <span
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgb(213_254_0/0.25)] transition-transform group-hover:scale-100 group-focus-visible:scale-100",
            drag !== null ? "scale-110" : "scale-0",
          )}
          style={{ left: `${progress * 100}%` }}
        />
        {hover !== null && duration ? (
          <span
            className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink"
            style={{ left: `${hover * 100}%` }}
          >
            {fmt(hover * duration)}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-white/45">
        <span>{fmt(drag !== null ? drag * duration : time)}</span>
        <span>{duration ? `-${fmt(Math.max(0, duration - time))}` : "--:--"}</span>
      </div>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** `lg` and up (true/false), or null before mount so the server render stays neutral. */
function useDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  return desktop;
}

/**
 * Sound control with an expandable soundtrack player: a left rail with a side card on desktop,
 * a floating pill above the bottom dock with a bottom sheet on smaller screens.
 */
export function SoundWidget() {
  const { lang } = useLang();
  const s = useSound();
  const [open, setOpen] = useState(false);
  const es = lang === "es";
  const entry = s.playlist[s.index];
  const ambient = entry?.src === AMBIENT_SRC;
  const VolumeIcon = s.volume === 0 ? VolumeX : s.volume < 0.5 ? Volume1 : Volume2;
  const card = useRef<HTMLDivElement>(null);
  const desktop = useDesktop();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The rail is transformed (dock-in, centering), so the mobile sheet renders in a portal
  // to be positioned against the viewport.
  const place = (node: ReactNode) =>
    desktop === null ? null : desktop ? node : createPortal(node, document.body);

  const motionProps = desktop
    ? {
        initial: { opacity: 0, x: -20, scale: 0.94, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, x: -20, scale: 0.94, filter: "blur(6px)" },
      }
    : {
        initial: { opacity: 0, y: 56, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: 56, filter: "blur(6px)" },
      };

  return (
    <div
      data-cursor-skip
      className="dock-in fixed bottom-[4.75rem] left-4 z-50 flex items-center gap-2 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
    >
      <div className="flex flex-row-reverse gap-1 rounded-2xl bg-surface-2/90 p-1 font-display text-sm font-semibold ring-1 ring-border/60 backdrop-blur lg:flex-col">
        <span className="hidden px-2.5 pt-1.5 text-xs font-medium text-muted-foreground lg:block">
          {es ? "Sonido" : "Sound"}
        </span>
        <button
          onClick={() => {
            unlock();
            setEnabled(!s.enabled);
          }}
          aria-pressed={s.enabled}
          className="flex items-center justify-between gap-2 rounded-xl bg-surface px-2.5 py-1.5 text-foreground shadow-sm"
        >
          {s.enabled ? "On" : "Off"}
          <Visualizer playing={s.enabled && s.playing} bars={4} className="h-3 w-4" />
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={es ? "Reproductor" : "Player"}
          className={cn(
            "flex items-center justify-center rounded-xl px-2.5 py-1.5 transition-colors",
            open ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Music2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {place(
        <AnimatePresence>
          {open && !desktop ? (
            <motion.button
              key="backdrop"
              type="button"
              aria-label={es ? "Cerrar reproductor" : "Close player"}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            />
          ) : null}
          {open ? (
            <motion.div
              key="player"
              ref={card}
              data-cursor-skip
              {...motionProps}
              transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
              className={cn(
                "overflow-hidden rounded-[28px] bg-ink/95 p-4 text-ink-foreground shadow-[0_30px_70px_-25px_rgb(0_0_0/0.7)] ring-1 ring-white/10 backdrop-blur-xl",
                desktop
                  ? "relative w-80 origin-left"
                  : "fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[61] mx-auto max-w-md",
              )}
            >
              {/* Ambient glow that breathes with the music. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-lime/25 blur-3xl transition-opacity duration-700"
                style={{
                  opacity: s.playing ? "calc(0.35 + var(--energy, 0) * 0.9)" : 0.15,
                  transform: "scale(calc(0.9 + var(--energy, 0) * 0.4))",
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(120%_80%_at_100%_100%,rgb(255_255_255/0.06),transparent_60%)]"
              />

              <div className="relative">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.24em] text-white/50">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {s.playing ? (
                        <span className="absolute inset-0 animate-ping rounded-full bg-lime/70" />
                      ) : null}
                      <span
                        className={cn(
                          "relative h-1.5 w-1.5 rounded-full",
                          s.playing ? "bg-lime" : "bg-white/30",
                        )}
                      />
                    </span>
                    {s.playing ? (es ? "Sonando" : "Now playing") : "Soundtrack"}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">
                      {String(s.index + 1).padStart(2, "0")} /{" "}
                      {String(s.playlist.length).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => setOpen(false)}
                      aria-label={es ? "Cerrar" : "Close"}
                      className="grid h-6 w-6 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Disc playing={s.playing} ambient={ambient} />
                  <div className="min-w-0 flex-1">
                    <div className="relative overflow-hidden whitespace-nowrap font-display text-lg font-bold uppercase leading-tight tracking-wide [mask-image:linear-gradient(90deg,#000_85%,transparent)]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={entry?.src ?? "none"}
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -14, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            "inline-block",
                            (entry?.title.length ?? 0) > 16 && s.playing && "player-marquee",
                          )}
                        >
                          {entry?.title || "—"}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.18em] text-white/40">
                      {ambient
                        ? es
                          ? "En vivo · generado en tu navegador"
                          : "Live · generated in your browser"
                        : es
                          ? `Pista ${String(s.index).padStart(2, "0")}`
                          : `Track ${String(s.index).padStart(2, "0")}`}
                    </p>
                  </div>
                </div>

                <Spectrum playing={s.playing} energyTarget={card} className="mt-3 h-14" />

                {ambient ? null : (
                  <div className="mt-2">
                    <Scrubber time={s.time} duration={s.duration} label={es ? "Buscar" : "Seek"} />
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => skip(-1)}
                      aria-label={es ? "Anterior" : "Previous"}
                      className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <SkipBack className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      whileHover={{ scale: 1.06 }}
                      onClick={toggle}
                      aria-label={
                        s.playing ? (es ? "Pausar" : "Pause") : es ? "Reproducir" : "Play"
                      }
                      className="lime-cta relative grid h-12 w-12 place-items-center rounded-full"
                      style={{
                        boxShadow: s.playing
                          ? "0 0 calc(10px + var(--energy, 0) * 30px) rgb(213 254 0 / 0.55)"
                          : undefined,
                      }}
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={s.playing ? "pause" : "play"}
                          initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
                          transition={{ duration: 0.18 }}
                          className="grid place-items-center"
                        >
                          {s.playing ? (
                            <Pause className="h-[18px] w-[18px] fill-current" />
                          ) : (
                            <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => skip(1)}
                      aria-label={es ? "Siguiente" : "Next"}
                      className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <SkipForward className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <label className="flex items-center gap-2 text-white/70">
                    <button
                      type="button"
                      onClick={() => setVolume(s.volume === 0 ? 0.6 : 0)}
                      aria-label={es ? "Silenciar" : "Mute"}
                      className="transition-colors hover:text-white"
                    >
                      <VolumeIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={s.volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label={es ? "Volumen" : "Volume"}
                      className="player-range w-20"
                      style={{ ["--fill" as string]: `${s.volume * 100}%` }}
                    />
                  </label>
                </div>

                {s.playlist.length > 1 ? (
                  <ul className="mt-4 max-h-40 space-y-0.5 overflow-y-auto border-t border-white/10 pt-3 [scrollbar-width:thin]">
                    {s.playlist.map((t, i) => {
                      const current = i === s.index;
                      return (
                        <li key={`${t.src}-${i}`}>
                          <button
                            onClick={() => playIndex(i)}
                            className={cn(
                              "relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                              current ? "text-lime" : "text-white/65 hover:text-white",
                            )}
                          >
                            {current ? (
                              <motion.span
                                layoutId="player-active"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                                className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-lime/20"
                              />
                            ) : null}
                            <span className="relative w-4 tabular-nums text-white/35">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="relative flex-1 truncate">{t.title}</span>
                            {current && s.playing ? (
                              <Visualizer playing bars={3} className="relative h-2.5 w-3" />
                            ) : (
                              <Play className="relative h-3 w-3 opacity-0 transition-opacity [button:hover_&]:opacity-60" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
      )}
    </div>
  );
}
