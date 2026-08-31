import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Download, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useLang } from "./lang-context";
import { useTheme } from "./theme-context";
import { Magnetic } from "./primitives";
import { cn } from "@/lib/utils";

export function Nav() {
  const { lang, t, toggle, profile } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["stack", "projects", "repos", "experience", "credentials", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
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
    <motion.header
      initial={reduced ? { opacity: 1 } : { y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3"
    >
      <nav
        className={cn(
          "mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-2xl px-3 pl-4 transition-all duration-500",
          scrolled ? "glass-card shadow-lg" : "border border-transparent bg-transparent",
        )}
      >
        <a href="#top" className="group flex items-center gap-2.5 font-display text-sm font-bold tracking-[0.16em]">
          <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-aurora text-[11px] text-primary-foreground">
            <span className="absolute inset-0 animate-pulse-ring rounded-lg bg-primary/40" />
            <span className="relative">{profile.initials}</span>
          </span>
          <span className="hidden text-foreground sm:inline">{profile.name.split(" ")[0]?.toUpperCase()}</span>
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-lg px-3 py-1.5 text-sm transition-colors",
                active === l.href ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active === l.href ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-primary/12 ring-1 ring-primary/25"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              ) : null}
              <span className="relative z-10">{l.label}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-border/80 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ y: 12, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -12, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inline-flex"
              >
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            onClick={toggle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            aria-label="Switch language"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "es" ? "EN" : "ES"}
          </button>

          <Magnetic className="hidden sm:inline-block">
            <a
              href={profile.cvUrl}
              download
              className="shine inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-[0_10px_30px_-12px_var(--primary)]"
            >
              <Download className="h-3.5 w-3.5" />
              {t.cta.downloadCv}
            </a>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card mx-auto mt-2 max-w-5xl rounded-2xl px-5 py-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a href={profile.cvUrl} download className="text-sm font-semibold text-aurora">
                {t.cta.downloadCv}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
