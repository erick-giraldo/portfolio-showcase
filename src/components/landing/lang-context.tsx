import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { content, type Lang } from "@/content/cv";

type LangContextValue = {
  lang: Lang;
  t: (typeof content)["es"];
  toggle: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "cv-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "es" ? "en" : "es";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ lang, t: content[lang], toggle }), [lang, toggle]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
