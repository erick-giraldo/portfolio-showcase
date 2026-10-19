import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChevronsRight, MapPin } from "lucide-react";
import { useLang } from "./lang-context";
import { useIntroDone } from "./effects";
import { Counter, Eyebrow, Magnetic, WordReveal } from "./primitives";
import { Silhouette } from "./silhouette";
import { cn } from "@/lib/utils";

const softSpring = { type: "spring", bounce: 0, duration: 0.9 } as const;
const eyebrow = ["Full Stack", "FinTech", "Cloud", "IT Infrastructure"];

function Portrait({ src, alt, play }: { src: string; alt: string; play: boolean }) {
  const { lang } = useLang();
  const hint = lang === "es" ? "Pasa el cursor · clic para revelar" : "Hover · click to reveal";
  const revealLabel = lang === "es" ? "Revelar foto" : "Reveal photo";
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <motion.div ref={ref} style={reduced ? {} : { y }} className="relative mx-auto w-full max-w-md">
      <div className="float-soft relative" style={{ ["--float-time" as string]: "8s" }}>
        <img src={src} alt={alt} className="sr-only" />
        <Silhouette
          src={src}
          play={play}
          hint={hint}
          revealLabel={revealLabel}
          className="aspect-[4/5] w-full [mask-image:linear-gradient(to_bottom,black_70%,transparent),linear-gradient(to_right,transparent,black_12%,black_90%,transparent)] [mask-composite:intersect]"
        />

        <motion.div
          initial={reduced ? false : { opacity: 0, x: -24 }}
          animate={play ? { opacity: 1, x: 0 } : {}}
          transition={{ ...softSpring, delay: 0.9 }}
          className="absolute -left-5 bottom-16"
        >
          <div
            className="float-soft aller-card px-4 py-3"
            style={{ ["--float-delay" as string]: "1.2s" }}
          >
            <p className="font-display text-2xl font-bold leading-none text-foreground">12+</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Years
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 24 }}
          animate={play ? { opacity: 1, x: 0 } : {}}
          transition={{ ...softSpring, delay: 1.05 }}
          className="absolute -right-4 top-10"
        >
          <div
            className="float-soft inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground"
            style={{ ["--float-delay" as string]: "2.4s" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            FinTech
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Tech names drifting past like the client-logo strip on allerstudio.com */
function LogoMarquee({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden border-y border-frame py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="animate-logo-marquee flex w-max items-center gap-14">
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="whitespace-nowrap font-display text-2xl font-bold uppercase tracking-[0.08em] text-faint/70 transition-colors hover:text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const { t, profile } = useLang();
  const reduced = useReducedMotion();
  const play = useIntroDone();
  const [activeMetric, setActiveMetric] = useState(0);
  const marquee = t.stack.flatMap((g) => g.items).slice(0, 14);

  // Cycle the highlighted metric, like the process nodes on allerstudio.com
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setActiveMetric((i) => (i + 1) % t.metrics.length), 1900);
    return () => window.clearInterval(id);
  }, [reduced, t.metrics.length]);

  const fadeUp = (delay: number) => ({
    initial: reduced ? false : ({ opacity: 0, y: 12 } as const),
    animate: play ? { opacity: 1, y: 0 } : {},
    transition: { ...softSpring, delay },
  });

  return (
    <section id="top" className="relative pt-36 sm:pt-44">
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div {...fadeUp(0.1)}>
              <Eyebrow>{eyebrow.join(" · ")}</Eyebrow>
            </motion.div>

            <h1 className="mt-6 text-[2.9rem] leading-[1] sm:text-6xl lg:text-[4.6rem]">
              <WordReveal
                text={profile.name}
                play={play}
                delay={0.15}
                className="block text-foreground"
              />
              <WordReveal
                text={t.hero.role}
                play={play}
                delay={0.35}
                className="mt-2 block text-[0.62em] leading-[1.1] text-faint"
              />
            </h1>

            <motion.p
              {...fadeUp(0.6)}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {t.hero.tagline}
            </motion.p>

            <motion.div {...fadeUp(0.75)} className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="ink-pill inline-flex items-center gap-3 rounded-full py-1.5 pl-6 pr-1.5 text-sm font-medium"
                >
                  {t.cta.contact}
                  <img
                    src={profile.portraitUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover object-top"
                  />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-surface-2 px-6 text-sm font-medium text-foreground ring-1 ring-border/60 transition-colors hover:bg-accent"
                >
                  {t.cta.linkedin}
                  <ChevronsRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            </motion.div>
          </div>

          <Portrait src={profile.portraitUrl} alt={profile.name} play={play} />
        </div>
      </div>

      <motion.div {...fadeUp(1)}>
        <LogoMarquee items={marquee} />
      </motion.div>

      <div className="mx-auto grid w-full max-w-6xl gap-3 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {t.metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...softSpring, delay: i * 0.08 }}
            onPointerEnter={() => setActiveMetric(i)}
            className={cn(
              "aller-card relative overflow-hidden p-6 transition-[transform,translate] duration-700",
              activeMetric === i && "-translate-y-1",
            )}
          >
            <p
              className={cn(
                "font-display text-5xl font-bold leading-none transition-colors duration-500",
                activeMetric === i ? "text-foreground" : "text-faint",
              )}
            >
              <Counter value={m.value} />
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{m.label}</p>
            <span
              className={cn(
                "absolute bottom-0 left-0 h-1 bg-lime transition-[width] duration-[1900ms] ease-linear",
                activeMetric === i ? "w-full" : "w-0 duration-300",
              )}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
