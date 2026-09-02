import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Boxes,
  Cloud,
  Code2,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { getGithubRepos } from "@/lib/github.functions";
import { useLang } from "./lang-context";
import { Magnetic, Reveal, Section, SectionHeading, Tilt } from "./primitives";

export function StackSection() {
  const { t } = useLang();
  const all = t.stack.flatMap((g) => g.items);
  const rowA = all.slice(0, Math.ceil(all.length / 2));
  const rowB = all.slice(Math.ceil(all.length / 2));

  const Row = ({ items, reverse }: { items: string[]; reverse?: boolean }) => (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className={`flex w-max gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="glass-panel whitespace-nowrap rounded-full px-4 py-2 font-mono text-[13px] text-foreground/85"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <Section id="stack">
      <SectionHeading {...t.sections.stack} />

      <div className="mt-10 space-y-3">
        <Row items={rowA} />
        <Row items={rowB} reverse />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.stack.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.05}>
            <Tilt intensity={5} className="h-full">
              <div className="glass-card h-full rounded-2xl p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/12 text-aurora ring-1 ring-primary/20">
                    <Boxes className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-[13px] uppercase tracking-[0.16em] text-foreground">
                    {group.category}
                  </h3>
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md bg-surface-2/80 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Tilt>
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

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {t.projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08} className="h-full">
            <Tilt intensity={6} className="h-full">
              <article className="group glass-card flex h-full flex-col rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-aurora ring-1 ring-primary/20">
                    <Code2 className="h-3.5 w-3.5" />
                    {p.year}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{p.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md border border-border/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {p.href || p.repo ? (
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {p.href ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-aurora"
                      >
                        {t.cta.viewProject}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    ) : null}
                    {p.repo ? (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
                        {t.cta.viewRepo}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ReposSection() {
  const { t, profile } = useLang();
  const username = profile.githubUser;
  const fetchRepos = useServerFn(getGithubRepos);
  const { data } = useQuery({
    queryKey: ["github-repos", username],
    queryFn: () => fetchRepos({ data: { username } }),
    enabled: username.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  if (!username) return null;

  return (
    <Section id="repos">
      <SectionHeading {...t.sections.repos} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((repo, i) => (
          <Reveal key={repo.id} delay={i * 0.05} className="h-full">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer noopener"
              className="glass-card flex h-full flex-col rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <Github className="h-4 w-4 text-aurora" />
                  {repo.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {repo.stars}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{repo.description ?? "—"}</p>
              {repo.language ? <span className="mt-4 font-mono text-xs text-aurora">{repo.language}</span> : null}
            </a>
          </Reveal>
        ))}
        {data && data.length === 0 ? <p className="text-sm text-muted-foreground">{t.reposEmpty}</p> : null}
      </div>
    </Section>
  );
}

export function ExperienceSection() {
  const { t } = useLang();

  return (
    <Section id="experience">
      <SectionHeading {...t.sections.experience} />

      <div className="relative mt-12 pl-8 sm:pl-12">
        <motion.span
          aria-hidden
          className="absolute left-0 top-0 w-px origin-top bg-gradient-to-b from-primary via-aurora to-transparent"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%" }}
        />
        {t.experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.08}>
            <div className="relative pb-14 last:pb-0">
              <span className="absolute -left-[38px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary sm:-left-[54px]">
                <span className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-aurora/70" />
              </span>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold text-foreground">{job.role}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-aurora">{job.period}</span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {job.company} · {job.location}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-aurora/80" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.certifications.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05} className="h-full">
            <Tilt intensity={7} className="h-full">
              <div className="glass-card h-full rounded-2xl p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-aurora/20 text-aurora ring-1 ring-primary/20">
                  <Award className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-4 font-display text-sm font-semibold text-foreground">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.issuer}</p>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {t.education.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.05}>
            <div className="glass-card rounded-2xl p-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-aurora ring-1 ring-primary/20">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.school}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-aurora">{e.period}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ContactSection() {
  const { t, profile } = useLang();

  return (
    <Section id="contact">
      <Reveal>
        <div className="glass-card glow-ring relative overflow-hidden rounded-[2rem] p-8 sm:p-14">
          <div className="aurora-mesh animate-aurora pointer-events-none absolute -right-32 -top-32 h-96 w-96 opacity-60" />
          <div className="relative">
            <span className="text-[11px] uppercase tracking-[0.28em] text-aurora">{t.sections.contact.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-[2.6rem]">{t.sections.contact.title}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t.sections.contact.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </a>
              </Magnetic>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="glass-panel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                <Phone className="h-4 w-4 text-aurora" />
                {profile.phone}
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="glass-panel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                <Linkedin className="h-4 w-4 text-aurora" />
                LinkedIn
              </a>
              {profile.github ? (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="glass-panel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
                >
                  <Github className="h-4 w-4 text-aurora" />
                  GitHub
                </a>
              ) : null}
              <span className="glass-panel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            </div>

            <p className="mt-7 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="h-4 w-4 text-aurora" />
              {t.languages}
            </p>
          </div>
        </div>
      </Reveal>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>{t.footerNote}</span>
      </footer>
    </Section>
  );
}
