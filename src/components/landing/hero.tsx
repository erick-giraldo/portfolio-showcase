import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowDown, ArrowUpRight, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { useLang } from "./lang-context";
import { Counter, Magnetic } from "./primitives";

const chips = ["React", "Next.js", "TypeScript", "NestJS", "Google Cloud", "Docker"];

function Portrait({ src, alt }: { src: string; alt: string }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 140, damping: 16 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 140, damping: 16 });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={reduced ? {} : { rotateX, rotateY, transformPerspective: 1100 }}
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="animate-spin-slow pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[conic-gradient(from_0deg,transparent_0deg,var(--primary)_90deg,var(--aurora)_190deg,transparent_300deg)] opacity-40 blur-2xl" />
      <div className="conic-ring relative overflow-hidden rounded-[2rem]">
        <div className="glass-card overflow-hidden rounded-[2rem] p-2">
          <img
            src={src}
            alt={alt}
            loading="eager"
            className="aspect-[4/5] w-full rounded-[1.6rem] object-cover object-top"
          />
        </div>
      </div>

      <motion.div
        className="glass-card animate-float absolute -left-6 bottom-14 rounded-xl px-3.5 py-2.5"
        initial={reduced ? { opacity: 1 } : { opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <p className="font-display text-lg font-semibold text-foreground">12+</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Years</p>
      </motion.div>

      <motion.div
        className="glass-card animate-float absolute -right-4 top-10 rounded-xl px-3.5 py-2.5 [animation-delay:1.5s]"
        initial={reduced ? { opacity: 1 } : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.85, duration: 0.6 }}
      >
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-aurora">
          <Sparkles className="h-3.5 w-3.5" />
          FinTech
        </p>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const { t, profile } = useLang();
  const reduced = useReducedMotion();
  const words = profile.name.split(" ");

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div className="animate-aurora pointer-events-none absolute -top-52 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[150px]" />
      <div className="animate-aurora-slow pointer-events-none absolute -right-40 top-32 h-[28rem] w-[28rem] rounded-full bg-aurora/15 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-6xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="glass-panel inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-aurora">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aurora" />
              </span>
              {t.hero.badge}
            </span>

            <h1 className="mt-6 flex flex-wrap gap-x-3 text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
              {words.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  className="text-gradient inline-block"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <p className="mt-5 font-display text-lg text-foreground/90 sm:text-2xl">{t.hero.role}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.hero.tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="glow-ring shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {t.cta.contact}
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group glass-card inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-foreground"
                >
                  <Linkedin className="h-4 w-4 text-aurora" />
                  {t.cta.linkedin}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-aurora" />
                {profile.location}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <motion.span
                  key={c}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                  className="rounded-full border border-border/80 bg-surface-2/70 px-3 py-1 font-mono text-[11px] tracking-tight text-muted-foreground"
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <Portrait src={profile.portraitUrl} alt={profile.name} />
        </div>

        <div className="mt-16 grid gap-3 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {t.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07 }}
              className="glass-card group rounded-2xl p-5"
            >
              <p className="font-display text-3xl font-semibold text-foreground">
                <Counter value={m.value} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{m.label}</p>
              <span className="mt-3 block h-px w-10 bg-gradient-to-r from-primary to-aurora transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <span className="inline-flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            {t.hero.scroll}
            <ArrowDown className="h-4 w-4 animate-bounce text-aurora" />
          </span>
        </div>
      </div>
    </section>
  );
}
