import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
  y = 26,
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
      initial={reduced ? { opacity: 1 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Card wrapper with pointer-tracked 3D tilt and a light that follows the cursor. */
export function Tilt({
  children,
  className,
  intensity = 8,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 150,
    damping: 18,
  });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    mx.set(nx - 0.5);
    my.set(ny - 0.5);
    px.set(nx * 100);
    py.set(ny * 100);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={reduced ? {} : { rotateX, rotateY, transformPerspective: 1000 }}
      className={cn("group/tilt relative", className)}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
        style={{
          background: useTransform(
            [px, py],
            ([x, y]) =>
              `radial-gradient(340px circle at ${x}% ${y}%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 65%)`,
          ),
        }}
      />
      {children}
    </motion.div>
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
        x.set(((e.clientX - r.left) / r.width - 0.5) * 14);
        y.set(((e.clientY - r.top) / r.height - 0.5) * 10);
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
    <Reveal className="max-w-2xl">
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-aurora">
        <span className="h-px w-10 bg-gradient-to-r from-primary to-aurora" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-semibold leading-[1.1] text-foreground sm:text-[2.6rem]">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
    </Reveal>
  );
}

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
    <section id={id} className={cn("mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:py-28", className)}>
      {children}
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
