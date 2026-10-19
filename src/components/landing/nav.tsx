"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronsRight, Mail, Menu, Moon, Sun, X } from "lucide-react";
import { useLang } from "./lang-context";
import { useTheme } from "./theme-context";
import { cn } from "@/lib/utils";

/** Live clock for the profile location, rendered only after mount to keep SSR stable. */
function useClock(timeZone: string) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return "--:--";
  const time = now.toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")
      ?.value.replace("GMT", "UTC") ?? "";
  return `${time} ${offset}`;
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="status-pulse absolute inset-0 rounded-full bg-emerald-500" />
      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

export function Nav() {
  const { lang, t, profile } = useLang();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const clock = useClock("America/New_York");

  useEffect(() => {
    const ids = ["stack", "projects", "repos", "experience", "credentials", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0.01, 0.3] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const links = [
    { href: "#stack", label: t.nav.stack },
    { href: "#projects", label: t.nav.projects },
    { href: "#experience", label: t.nav.experience },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="header-in fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
      <div className="mx-auto w-full max-w-[54rem] overflow-hidden rounded-[1.4rem] bg-surface shadow-[0_30px_60px_-30px_rgb(18_18_18/0.35)] ring-1 ring-border/60">
        <nav className="flex h-14 items-center justify-between rounded-[1.4rem] bg-ink px-3 pl-5 text-ink-foreground">
          <a href="#top" className="flex items-baseline gap-2 font-display leading-none">
            <span className="text-xl font-bold tracking-[0.12em]">{profile.initials}</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.42em] text-white/60 sm:inline">
              {profile.name.split(" ")[0]}
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm transition-colors",
                  active === l.href ? "text-white" : "text-white/70 hover:text-white",
                )}
              >
                {active === l.href ? (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-lime"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={profile.cvUrl}
              download
              className="lime-cta inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
            >
              {t.cta.downloadCv}
              <ChevronsRight className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 md:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <div className="hidden h-10 items-center justify-between px-5 font-display text-[13px] font-medium text-foreground sm:flex">
          <span className="tabular-nums">
            {profile.location} | {clock}
          </span>
          <span className="inline-flex items-center gap-2">
            <StatusDot />
            {t.hero.badge}
          </span>
          <span>{lang === "es" ? "Remoto · Global" : "Remote · Worldwide"}</span>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-3 px-5 py-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-lg font-semibold text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

/** Floating corner controls: language + theme bottom-left, contact pill bottom-right. */
export function Dock() {
  const { lang, toggle, t, profile } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <>
      <div className="dock-in fixed bottom-4 left-4 z-50 flex items-center gap-2">
        <div className="flex rounded-2xl bg-surface-2/90 p-1 font-display text-sm font-semibold ring-1 ring-border/60 backdrop-blur">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => lang !== l && toggle()}
              className={cn(
                "relative rounded-xl px-3 py-1.5 transition-colors",
                lang === l ? "text-foreground" : "text-faint hover:text-foreground",
              )}
            >
              {lang === l ? (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 rounded-xl bg-surface shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative">{l === "en" ? "English" : "Español"}</span>
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-surface-2/90 text-foreground ring-1 ring-border/60 backdrop-blur"
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="absolute inline-flex"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <div className="dock-in fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <a
          href={`mailto:${profile.email}`}
          aria-label="Email"
          className="grid h-12 w-12 place-items-center rounded-full bg-surface-2/90 text-foreground ring-1 ring-border/60 backdrop-blur transition-transform hover:-translate-y-0.5"
        >
          <Mail className="h-4.5 w-4.5" />
        </a>
        <a
          href="#contact"
          className="ink-pill inline-flex h-12 items-center rounded-full px-6 text-sm font-medium hover:-translate-y-0.5"
        >
          {t.cta.contact}
        </a>
      </div>
    </>
  );
}
