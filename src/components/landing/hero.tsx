import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowDown, ArrowUpRight, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import portrait from "@/assets/erick-portrait.png.asset.json";
import { profile } from "@/content/cv";
import { useLang } from "./lang-context";
import { Counter } from "./primitives";

const chips = ["React", "Next.js", "TypeScript", "NestJS", "Google Cloud", "Docker"];

function Portrait() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 140, damping: 16 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 140, damping: 16 });

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
      className="relative mx-auto w-full max-w-sm lg:max-w-none"
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="animate-float relative aspect-square w-full"
      >
        <div className="conic-ring absolute inset-0 rounded-[2rem]" />
        <div className="glass-panel relative h-full w-full overflow-hidden rounded-[2rem]">
          <img
            src={portrait.url}
            alt={`Retrato de ${profile.name}, Full Stack Developer`}
            width={1024}
            height={1024}
            className="h-full w-full object-cover object-top"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.06]" />
        </div>

        <motion.div
          style={{ transform: "translateZ(60px)" }}
          className="glass-panel absolute -bottom-5 -left-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-primary-glow" />
          <span className="text-xs font-semibold text-foreground">12+ años · FinTech</span>
        </motion.div>
        <motion.div
          style={{ transform: "translateZ(50px)" }}
          className="glass-panel absolute -right-3 top-6 rounded-xl px-3.5 py-2.5 shadow-lg"
        >
          <span className="text-xs font-semibold text-foreground">Google Cloud</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const words = profile.name.split(" ");

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_70%)]" />
      <div className="animate-aurora pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
      <div className="animate-aurora pointer-events-none absolute -right-32 top-40 h-[26rem] w-[26rem] rounded-full bg-primary-glow/15 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-6xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-glow" />
              </span>
              {t.hero.badge}
            </span>

            <h1 className="mt-6 flex flex-wrap gap-x-3 text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              {words.map((w, i) => (
                <motion.span
                  key={`${w}-${i}`}
                  className="text-gradient inline-block"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 26, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>
            <p className="mt-4 font-display text-lg text-foreground/90 sm:text-2xl">{t.hero.role}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.hero.tagline}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="glow-ring shine inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Mail className="h-4 w-4" />
                {t.cta.contact}
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                <Linkedin className="h-4 w-4" />
                {t.cta.linkedin}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            </div>

            <div className="mt-9 flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <motion.span
                  key={c}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                  className="rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <Portrait />
        </div>

        <motion.dl
          className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 lg:grid-cols-4"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {t.metrics.map((m) => (
            <div key={m.label} className="shine bg-surface px-6 py-7 transition-colors hover:bg-surface-2">
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</dt>
              <dd className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                <Counter value={m.value} />
              </dd>
            </div>
          ))}
        </motion.dl>

        <div className="mt-14 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          {t.hero.scroll}
        </div>
      </div>
    </section>
  );
}
