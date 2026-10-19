"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import {
  ArrowUpRight,
  Award,
  ChevronsRight,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import type { Repo } from "@/lib/github";
import { cn } from "@/lib/utils";
import { useLang } from "./lang-context";
import { Eyebrow, Magnetic, Reveal, ScrubText, Section, SectionHeading } from "./primitives";

export function StackSection() {
  const { t } = useLang();

  return (
    <Section id="stack">
      <SectionHeading {...t.sections.stack} />

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {t.stack.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.06} className="h-full">
            <div className="aller-card group flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-border transition-colors duration-500 group-hover:bg-lime" />
              </div>
              <h3 className="mt-4 text-2xl leading-tight text-foreground">{group.category}</h3>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-8">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ProjectsSection() {
  const { t } = useLang();

  return (
    <Section id="projects">
      <SectionHeading {...t.sections.projects} />

      <div className="mt-14 space-y-3">
        {t.projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06}>
            <article className="aller-card group grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_1fr] lg:items-start lg:gap-10">
              <span className="font-display text-5xl font-bold leading-none text-faint/60 transition-colors duration-500 group-hover:text-lime">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                  {p.year}
                </span>
                <h3 className="mt-3 text-3xl leading-tight text-foreground">{p.name}</h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-border/80 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex h-full flex-col">
                <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                {p.href || p.repo ? (
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {p.href ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="ink-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                      >
                        {t.cta.viewProject}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ) : null}
                    {p.repo ? (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <Github className="h-3.5 w-3.5" />
                        {t.cta.viewRepo}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ReposSection() {
  const { t, profile } = useLang();
  const username = profile.githubUser;

  const { data } = useQuery({
    queryKey: ["github-repos", username],
    queryFn: async (): Promise<Repo[]> => {
      const res = await fetch(`/api/github-repos?username=${encodeURIComponent(username)}`);
      return res.ok ? res.json() : [];
    },
    enabled: username.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  if (!username) return null;

  return (
    <Section id="repos">
      <SectionHeading {...t.sections.repos} />
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((repo, i) => (
          <Reveal key={repo.id} delay={i * 0.05} className="h-full">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer noopener"
              className="aller-card flex h-full flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Github className="h-4 w-4" />
                  {repo.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {repo.stars}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{repo.description ?? "—"}</p>
              {repo.language ? (
                <span className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                  {repo.language}
                </span>
              ) : null}
            </a>
          </Reveal>
        ))}
        {data && data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.reposEmpty}</p>
        ) : null}
      </div>
    </Section>
  );
}

function TimelineNode({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reached = useInView(ref, { margin: "0px 0px -50% 0px" });

  return (
    <div ref={ref} className="relative pb-6 last:pb-0">
      <span
        className={cn(
          "absolute -left-[37px] top-8 h-3 w-3 rounded-full border-2 transition-colors duration-500 sm:-left-[53px]",
          reached ? "border-foreground bg-lime" : "border-border bg-background",
        )}
      />
      {children}
    </div>
  );
}

export function ExperienceSection() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.6", "end 0.6"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <Section id="experience">
      <SectionHeading {...t.sections.experience} />

      <div ref={listRef} className="relative mt-14 pl-8 sm:pl-12">
        <span aria-hidden className="absolute left-[5px] top-0 h-full w-px bg-border" />
        <motion.span
          aria-hidden
          className="absolute left-[5px] top-0 h-full w-px origin-top bg-foreground"
          style={reduced ? {} : { scaleY }}
        />
        {t.experience.map((job, i) => (
          <TimelineNode key={job.company}>
            <Reveal delay={i * 0.04}>
              <div className="aller-card p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl text-foreground">{job.role}</h3>
                  <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                    {job.period}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {job.company} · {job.location}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {job.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-lime" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </TimelineNode>
        ))}
      </div>
    </Section>
  );
}

export function CredentialsSection() {
  const { t } = useLang();

  return (
    <Section id="credentials">
      <SectionHeading {...t.sections.credentials} />

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.certifications.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05} className="h-full">
            <div className="aller-card group h-full p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-foreground transition-colors duration-500 group-hover:bg-lime group-hover:text-[#121212]">
                <Award className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg leading-snug text-foreground">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.issuer}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {t.education.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.05}>
            <div className="aller-card group p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-foreground transition-colors duration-500 group-hover:bg-lime group-hover:text-[#121212]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl text-foreground">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.school}</p>
              <p className="mt-3 inline-block rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                {e.period}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ContactSection() {
  const { t, profile } = useLang();

  const secondary =
    "inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15";

  return (
    <Section id="contact" className="pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-14 dark:ring-1 dark:ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_80%_20%,black,transparent_70%)]" />
          <div className="float-soft pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/25 blur-[90px]" />
          <div className="relative">
            <Eyebrow className="text-white">{t.sections.contact.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
              <ScrubText text={t.sections.contact.title} />
            </h2>
            <p className="mt-4 max-w-xl text-white/60">{t.sections.contact.subtitle}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="lime-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  <Mail className="h-4 w-4" />
                  {profile.email}
                  <ChevronsRight className="h-4 w-4" />
                </a>
              </Magnetic>
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className={secondary}>
                <Phone className="h-4 w-4" />
                {profile.phone}
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className={secondary}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              {profile.github ? (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={secondary}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/55">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
              <span>{t.languages}</span>
            </div>
          </div>
        </div>
      </Reveal>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{t.footerNote}</span>
      </footer>
    </Section>
  );
}
