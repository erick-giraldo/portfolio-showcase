"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft spring with no overshoot — the "up" reveal on allerstudio.com. */
const softSpring = { type: "spring", bounce: 0, duration: 0.9 } as const;

export function Reveal({
  children,
  delay = 0,
  className,
  y = 12,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...softSpring, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Splits text into words that rise out of a clipped line, staggered left to right. */
export function WordReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  play,
}: {
  text: string;
  className?: string;
  wordClassName?: (index: number) => string | undefined;
  delay?: number;
  /** Controlled playback; when omitted the words reveal on scroll into view. */
  play?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const active = play ?? inView;
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={cn("inline-block", wordClassName?.(i))}
            initial={reduced ? false : { y: "110%", opacity: 0 }}
            animate={active ? { y: "0%", opacity: 1 } : {}}
            transition={{ ...softSpring, delay: delay + i * 0.045 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function ScrubWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.28, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/** Heading whose words fill from grey to ink as it scrolls through the viewport. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.4"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const words = text.split(" ");

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord
          key={`${w}-${i}`}
          word={w}
          progress={progress}
          range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]}
        />
      ))}
    </span>
  );
}

/** Button/link wrapper that leans toward the cursor. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * 10);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 8);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Small lime dash + label used above section headings. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-sm font-medium text-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-5 rounded-full bg-lime" />
      {children}
    </span>
  );
}

/** Aller layout: big scrubbed heading on the left, muted copy on the right. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
      <div>
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <h2 className="mt-5 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[3.4rem]">
          <ScrubText text={title} />
        </h2>
      </div>
      <Reveal delay={0.15} className="lg:pt-12">
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      </Reveal>
    </div>
  );
}

/** Section framed by a full-bleed hairline with crosshair marks at the frame edges. */
export function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className="relative scroll-mt-28">
      <div aria-hidden className="relative border-t border-frame">
        <div className="relative mx-auto h-0 w-full max-w-[84rem] px-3 sm:px-6">
          <span className="cross-mark -left-[7px] -top-[8px] sm:left-[17px]" />
          <span className="cross-mark -right-[7px] -top-[8px] sm:right-[17px]" />
        </div>
      </div>
      <div className={cn("mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28", className)}>
        {children}
      </div>
    </section>
  );
}

export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.,]/g, "");
  const [display, setDisplay] = useState(reduced ? numeric : 0);

  useEffect(() => {
    if (!inView || reduced || !Number.isFinite(numeric)) {
      setDisplay(numeric);
      return;
    }
    let frame = 0;
    const total = 56;
    const tick = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(Math.round(numeric * progress));
      if (frame < total) raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, reduced]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
