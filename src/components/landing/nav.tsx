import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Languages, Menu, Moon, Sun, X } from "lucide-react";
import cvAsset from "@/assets/cv.pdf.asset.json";
import { profile } from "@/content/cv";
import { useLang } from "./lang-context";
import { useTheme } from "./theme-context";
import { cn } from "@/lib/utils";

export function Nav() {
  const { lang, t, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#stack", label: t.nav.stack },
    { href: "#projects", label: t.nav.projects },
    { href: "#experience", label: t.nav.experience },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel border-b border-border/70" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2 font-display text-sm font-bold tracking-widest">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            {profile.initials}
          </span>
          <span className="hidden text-foreground sm:inline">ERICK GIRALDO</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="relative z-10">{l.label}</span>
              <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-primary-glow transition-transform duration-300 hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
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
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            aria-label="Switch language"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "es" ? "EN" : "ES"}
          </button>

          <a
            href={cvAsset.url}
            download
            className="hidden items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5" />
            {t.cta.downloadCv}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="glass-panel border-t border-border px-5 py-4 md:hidden">
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
            <a href={cvAsset.url} download className="text-sm font-semibold text-primary-glow">
              {t.cta.downloadCv}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
