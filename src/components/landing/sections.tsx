import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Award, GitFork, GraduationCap, Mail, MapPin, Phone, Star } from "lucide-react";
import { GITHUB_USERNAME, profile } from "@/content/cv";
import { getGithubRepos } from "@/lib/github.functions";
import { useLang } from "./lang-context";
import { Reveal, Section, SectionHeading } from "./primitives";

export function StackSection() {
  const { t } = useLang();
  const marquee = t.stack.flatMap((g) => g.items).slice(0, 26);

  return (
    <Section id="stack">
      <SectionHeading {...t.sections.stack} />

      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max gap-3">
          {[...marquee, ...marquee].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground/85"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.stack.map((group, i) => (
          <Reveal key={group.category} delay={i * 0.05}>
            <div className="glass-panel h-full rounded-xl p-5 transition-colors hover:border-primary/60">
              <h3 className="font-display text-sm uppercase tracking-widest text-primary-glow">{group.category}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="rounded-md bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
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

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {t.projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08} className="h-full">
            <article className="group glass-panel flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/70">
              <span className="text-xs uppercase tracking-widest text-primary-glow">{p.year}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{p.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <li key={tag} className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                    {tag}
                  </li>
                ))}
              </ul>
              {p.href ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-glow"
                >
                  {t.cta.viewProject}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ReposSection() {
  const { t } = useLang();
  const fetchRepos = useServerFn(getGithubRepos);
  const { data } = useQuery({
    queryKey: ["github-repos", GITHUB_USERNAME],
    queryFn: () => fetchRepos({ data: { username: GITHUB_USERNAME } }),
    enabled: GITHUB_USERNAME.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  if (!GITHUB_USERNAME) return null;

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
              className="glass-panel flex h-full flex-col rounded-xl p-5 transition-all hover:-translate-y-1 hover:border-primary/70"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <GitFork className="h-4 w-4 text-primary-glow" />
                  {repo.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {repo.stars}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{repo.description ?? "—"}</p>
              {repo.language ? <span className="mt-4 text-xs text-primary-glow">{repo.language}</span> : null}
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

      <div className="mt-10 border-l border-border pl-6 sm:pl-10">
        {t.experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.08}>
            <div className="relative pb-12 last:pb-0">
              <span className="absolute -left-[31px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary sm:-left-[47px]">
                <span className="h-3 w-3 animate-ping rounded-full bg-primary/60" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-semibold text-foreground">{job.role}</h3>
                <span className="text-xs uppercase tracking-widest text-primary-glow">{job.period}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.company} · {job.location}
              </p>
              <ul className="mt-4 space-y-2.5">
                {job.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-glow" />
                    {b}
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

export function CredentialsSection() {
  const { t } = useLang();

  return (
    <Section id="credentials">
      <SectionHeading {...t.sections.credentials} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.certifications.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05} className="h-full">
            <div className="glass-panel h-full rounded-xl p-5 transition-colors hover:border-primary/60">
              <Award className="h-5 w-5 text-primary-glow" />
              <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.issuer}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {t.education.map((e, i) => (
          <Reveal key={e.title} delay={i * 0.05}>
            <div className="glass-panel rounded-xl p-5">
              <GraduationCap className="h-5 w-5 text-primary-glow" />
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.school}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-primary-glow">{e.period}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ContactSection() {
  const { t } = useLang();

  return (
    <Section id="contact">
      <Reveal>
        <div className="glow-ring relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-14">
          <div className="animate-aurora pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[110px]" />
          <div className="relative">
            <span className="text-xs uppercase tracking-[0.24em] text-primary-glow">{t.sections.contact.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">{t.sections.contact.title}</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t.sections.contact.subtitle}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Mail className="h-4 w-4" />
                {profile.email}
              </a>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
              >
                <Phone className="h-4 w-4" />
                {profile.phone}
              </a>
              <span className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">{t.languages}</p>
          </div>
        </div>
      </Reveal>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{t.footerNote}</span>
      </footer>
    </Section>
  );
}
