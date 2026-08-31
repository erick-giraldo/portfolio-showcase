import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Slim gradient progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary via-aurora to-primary-glow"
    />
  );
}

/** Soft light that follows the pointer, adding depth to the page background. */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (el) el.style.transform = `translate3d(${e.clientX - 320}px, ${e.clientY - 320}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 h-[640px] w-[640px] rounded-full bg-primary/8 blur-[130px] will-change-transform dark:bg-primary/14"
    />
  );
}

/** Page-wide aurora mesh, faint grid and falling light beams. */
export function AuroraBackdrop() {
  const beams = [
    { left: "12%", delay: "0s", duration: "9s" },
    { left: "34%", delay: "2.4s", duration: "11s" },
    { left: "58%", delay: "1.2s", duration: "8s" },
    { left: "81%", delay: "3.6s", duration: "12s" },
  ];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="grid-backdrop absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_78%)]" />
      <div className="aurora-mesh animate-aurora-slow absolute -top-1/3 left-1/2 h-[130vh] w-[140vw] -translate-x-1/2 opacity-40 dark:opacity-55" />
      {beams.map((b) => (
        <span
          key={b.left}
          className="animate-beam absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-aurora/50 to-transparent"
          style={{ left: b.left, animationDelay: b.delay, animationDuration: b.duration }}
        />
      ))}
      <div className="noise-overlay absolute inset-0 opacity-[0.04]" />
    </div>
  );
}
