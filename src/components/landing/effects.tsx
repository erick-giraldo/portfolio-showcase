import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const INTRO_KEY = "intro-seen";
const INTRO_EVENT = "intro:done";

/** Inline script: skips the intro loader for repeat visits or reduced motion before paint. */
export const introBootstrapScript = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('${INTRO_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('${INTRO_KEY}');}else{d.classList.add('is-loading');}}catch(e){d.classList.add('${INTRO_KEY}');}})();`;

/** True once the intro loader has cleared, so entrance animations can start. */
export function useIntroDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains(INTRO_KEY)) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(INTRO_EVENT, onDone);
    return () => window.removeEventListener(INTRO_EVENT, onDone);
  }, []);

  return done;
}

const readouts = ["Components", "Variables", "Runtime", "Interfaces", "Deploy"];

/** Full-screen boot sequence: system readouts and a counter racing to 100%. */
export function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains(INTRO_KEY)) {
      setVisible(false);
      return;
    }

    const duration = 1900;
    const start = performance.now();
    let raf = 0;
    let timer = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      timer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          // Private mode: the intro just plays again next visit.
        }
        setVisible(false);
        root.classList.remove("is-loading");
        root.classList.add(INTRO_KEY);
        window.dispatchEvent(new Event(INTRO_EVENT));
      }, 260);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  const pad = (n: number) => String(n).padStart(3, "0");

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          id="intro-loader"
          key="intro"
          aria-hidden
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-background px-6 py-6 font-display text-foreground sm:px-10 sm:py-8"
        >
          <div className="flex items-start justify-between text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>EGM // Portfolio</span>
            <span>Build {new Date().getFullYear()}</span>
          </div>

          <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end">
            <ul className="space-y-1.5 text-sm uppercase tracking-[0.18em]">
              {readouts.map((r, i) => {
                const local = Math.max(0, Math.min(100, progress * 1.6 - i * 14));
                return (
                  <li key={r} className="flex w-64 justify-between text-muted-foreground">
                    <span>{r}</span>
                    <span className={local >= 100 ? "text-foreground" : undefined}>
                      {pad(Math.round(local))}%
                    </span>
                  </li>
                );
              })}
              <li className="pt-3 text-foreground">
                Status // {progress < 100 ? "Initializing" : "Ready"}
              </li>
            </ul>
            <p className="text-[22vw] font-semibold leading-[0.8] tracking-tight sm:text-[12rem]">
              {pad(progress)}
              <span className="text-faint">%</span>
            </p>
          </div>

          <span
            className="absolute inset-x-0 bottom-0 h-1.5 origin-left bg-lime"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Thin vertical frame lines that run the full page height at the content edges. */
export function FrameRails() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 px-3 sm:px-6">
      <div className="mx-auto h-full w-full max-w-[84rem] border-x border-frame" />
    </div>
  );
}
