import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
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

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Left-rail sound control with an expandable soundtrack player. */
export function SoundWidget() {
  const { lang } = useLang();
  const s = useSound();
  const [open, setOpen] = useState(false);
  const es = lang === "es";
  const entry = s.playlist[s.index];
  const ambient = entry?.src === AMBIENT_SRC;
  const VolumeIcon = s.volume === 0 ? VolumeX : s.volume < 0.5 ? Volume1 : Volume2;
  const progress = s.duration ? s.time / s.duration : 0;

  return (
    <div
      data-cursor-skip
      className="dock-in fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 items-center gap-2 lg:flex"
    >
      <div className="flex flex-col gap-1 rounded-2xl bg-surface-2/90 p-1 font-display text-sm font-semibold ring-1 ring-border/60 backdrop-blur">
        <span className="px-2.5 pt-1.5 text-xs font-medium text-muted-foreground">
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

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="w-72 origin-left overflow-hidden rounded-3xl bg-ink p-4 text-ink-foreground shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)] ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.24em] text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", s.playing ? "bg-lime" : "bg-white/30")}
                />
                {es ? "Soundtrack" : "Soundtrack"}
              </span>
              <span className="tabular-nums">
                {String(s.index + 1).padStart(2, "0")} /{" "}
                {String(s.playlist.length).padStart(2, "0")}
              </span>
            </div>

            <div className="relative mt-3 overflow-hidden whitespace-nowrap font-display text-xl font-bold uppercase tracking-wide">
              <span
                className={cn(
                  "inline-block",
                  (entry?.title.length ?? 0) > 18 && s.playing && "player-marquee",
                )}
              >
                {entry?.title || "—"}
              </span>
            </div>

            <Visualizer playing={s.playing} className="mt-3 h-12 text-lime" />

            {ambient ? (
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
                {es ? "En vivo · generado en tu navegador" : "Live · generated in your browser"}
              </p>
            ) : (
              <div className="mt-3">
                <button
                  type="button"
                  aria-label={es ? "Buscar" : "Seek"}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    seek((e.clientX - r.left) / r.width);
                  }}
                  className="group relative block h-3 w-full"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/15" />
                  <span
                    className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-lime"
                    style={{ width: `${progress * 100}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white transition-transform group-hover:scale-100"
                    style={{ left: `${progress * 100}%` }}
                  />
                </button>
                <div className="mt-1 flex justify-between text-[10px] tabular-nums text-white/45">
                  <span>{fmt(s.time)}</span>
                  <span>{s.duration ? fmt(s.duration) : "--:--"}</span>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skip(-1)}
                  aria-label={es ? "Anterior" : "Previous"}
                  className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={toggle}
                  aria-label={s.playing ? (es ? "Pausar" : "Pause") : es ? "Reproducir" : "Play"}
                  className="lime-cta grid h-11 w-11 place-items-center rounded-full"
                >
                  {s.playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <button
                  onClick={() => skip(1)}
                  aria-label={es ? "Siguiente" : "Next"}
                  className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 text-white/70">
                <button
                  type="button"
                  onClick={() => setVolume(s.volume === 0 ? 0.6 : 0)}
                  aria-label={es ? "Silenciar" : "Mute"}
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
              <ul className="mt-4 max-h-36 space-y-0.5 overflow-y-auto border-t border-white/10 pt-3">
                {s.playlist.map((t, i) => (
                  <li key={`${t.src}-${i}`}>
                    <button
                      onClick={() => playIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/10",
                        i === s.index ? "text-lime" : "text-white/70",
                      )}
                    >
                      <span className="w-4 tabular-nums text-white/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 truncate">{t.title}</span>
                      {i === s.index && s.playing ? (
                        <Visualizer playing bars={3} className="h-2.5 w-3" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <button
              onClick={() => setOpen(false)}
              aria-label={es ? "Cerrar" : "Close"}
              className="mx-auto mt-2 flex text-white/30 transition-colors hover:text-white/70"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
