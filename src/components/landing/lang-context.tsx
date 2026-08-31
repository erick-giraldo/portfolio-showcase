import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Lang } from "@/content/cv";
import { supabase } from "@/integrations/supabase/client";
import { defaultSiteData, mergeSiteData, type Dict, type SiteProfile } from "@/lib/site-content";

type LangContextValue = {
  lang: Lang;
  t: Dict;
  profile: SiteProfile;
  toggle: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "cv-lang";

export function useSiteData() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("id", "default").maybeSingle();
      if (error) throw error;
      return mergeSiteData(data?.data ?? {});
    },
    staleTime: 60_000,
  });
  return data ?? defaultSiteData;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  const site = useSiteData();

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

  const value = useMemo(
    () => ({ lang, t: site[lang], profile: site.profile, toggle }),
    [lang, site, toggle],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
