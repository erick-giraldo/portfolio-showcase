import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, LogOut, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/landing/theme-context";
import { defaultSiteData, mergeSiteData, type SiteData } from "@/lib/site-content";
import type { Lang } from "@/content/cv";

const title = "Panel de administración — Erick Giraldo";
const description = "Editor privado de textos, enlaces y archivos del portafolio.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type TabId = "perfil" | "textos" | "listas" | "archivos";

const tabs: { id: TabId; label: string }[] = [
  { id: "perfil", label: "Perfil y enlaces" },
  { id: "textos", label: "Textos" },
  { id: "listas", label: "Listas" },
  { id: "archivos", label: "Archivos" },
];

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary";

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea rows={rows} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <textarea
        rows={16}
        spellCheck={false}
        className={`${inputClass} font-mono text-xs leading-relaxed`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "JSON inválido");
          }
        }}
      />
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, user, loading } = useAuth();
  const [tab, setTab] = useState<TabId>("perfil");
  const [lang, setLang] = useState<Lang>("es");
  const [draft, setDraft] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("claim_admin");
      if (error) throw error;
      return Boolean(data);
    },
  });

  const { data: remote } = useQuery({
    queryKey: ["site-content-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("id", "default").maybeSingle();
      if (error) throw error;
      return mergeSiteData(data?.data ?? {});
    },
  });

  useEffect(() => {
    if (remote && !draft) setDraft(remote);
  }, [remote, draft]);

  const current = draft ?? defaultSiteData;
  const dict = current[lang];

  const setProfile = (key: keyof SiteData["profile"], value: string) =>
    setDraft({ ...current, profile: { ...current.profile, [key]: value } });

  const setDict = (patch: Partial<SiteData["es"]>) =>
    setDraft({ ...current, [lang]: { ...dict, ...patch } });

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_content")
        .update({ data: current as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq("id", "default");
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Cambios publicados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File, kind: "cv" | "portrait") => {
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const name = `${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-files").upload(name, file, { upsert: true });
      if (error) throw error;
      const url = `/api/public/file/${name}`;
      setProfile(kind === "cv" ? "cvUrl" : "portraitUrl", url);
      toast.success("Archivo subido. Recuerda guardar los cambios.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir el archivo");
    } finally {
      setUploading(null);
    }
  };

  const headingKeys = useMemo(() => Object.keys(dict.sections) as (keyof typeof dict.sections)[], [dict.sections]);

  if (loading || roleLoading || !draft) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div className="glass-card max-w-sm rounded-3xl p-8">
          <h1 className="font-display text-xl font-semibold text-foreground">Sin permisos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta no tiene rol de administrador. Pide acceso al propietario del sitio.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-5 rounded-xl border border-border px-4 py-2 text-sm text-foreground"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <main className="relative min-h-screen px-5 py-10">
        <div className="aurora-mesh pointer-events-none absolute inset-x-0 top-0 h-80 opacity-30" />
        <div className="relative mx-auto w-full max-w-4xl">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Ver el sitio
              </a>
              <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">Panel de contenido</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Salir
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          </header>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`rounded-xl px-3.5 py-2 text-sm transition-colors ${
                  tab === tb.id
                    ? "bg-primary/15 text-foreground ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {tab !== "perfil" && tab !== "archivos" ? (
            <div className="mt-4 inline-flex rounded-xl border border-border p-1">
              {(["es", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                    lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          ) : null}

          <div className="glass-card mt-6 space-y-5 rounded-3xl p-6">
            {tab === "perfil" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre" value={current.profile.name} onChange={(v) => setProfile("name", v)} />
                <Field label="Iniciales" value={current.profile.initials} onChange={(v) => setProfile("initials", v)} />
                <Field label="Ubicación" value={current.profile.location} onChange={(v) => setProfile("location", v)} />
                <Field label="Teléfono" value={current.profile.phone} onChange={(v) => setProfile("phone", v)} />
                <Field label="Email" value={current.profile.email} onChange={(v) => setProfile("email", v)} />
                <Field label="LinkedIn (URL)" value={current.profile.linkedin} onChange={(v) => setProfile("linkedin", v)} />
                <Field label="GitHub (URL)" value={current.profile.github} onChange={(v) => setProfile("github", v)} />
                <Field
                  label="Usuario de GitHub (para repos)"
                  value={current.profile.githubUser}
                  onChange={(v) => setProfile("githubUser", v)}
                />
              </div>
            ) : null}

            {tab === "textos" ? (
              <div className="space-y-4">
                <Field label="Badge del hero" value={dict.hero.badge} onChange={(v) => setDict({ hero: { ...dict.hero, badge: v } })} />
                <Field label="Rol / título" value={dict.hero.role} onChange={(v) => setDict({ hero: { ...dict.hero, role: v } })} />
                <Field
                  label="Tagline"
                  textarea
                  rows={4}
                  value={dict.hero.tagline}
                  onChange={(v) => setDict({ hero: { ...dict.hero, tagline: v } })}
                />
                <Field label="Idiomas (pie de contacto)" value={dict.languages} onChange={(v) => setDict({ languages: v })} />
                <Field label="Nota del footer" value={dict.footerNote} onChange={(v) => setDict({ footerNote: v })} />

                <div className="grid gap-4 sm:grid-cols-2">
                  {headingKeys.map((key) => (
                    <div key={key} className="rounded-2xl border border-border/70 p-4">
                      <p className="mb-3 font-display text-xs uppercase tracking-[0.18em] text-aurora">{key}</p>
                      <div className="space-y-3">
                        <Field
                          label="Eyebrow"
                          value={dict.sections[key].eyebrow}
                          onChange={(v) =>
                            setDict({ sections: { ...dict.sections, [key]: { ...dict.sections[key], eyebrow: v } } })
                          }
                        />
                        <Field
                          label="Título"
                          value={dict.sections[key].title}
                          onChange={(v) =>
                            setDict({ sections: { ...dict.sections, [key]: { ...dict.sections[key], title: v } } })
                          }
                        />
                        <Field
                          label="Subtítulo"
                          textarea
                          rows={2}
                          value={dict.sections[key].subtitle}
                          onChange={(v) =>
                            setDict({ sections: { ...dict.sections, [key]: { ...dict.sections[key], subtitle: v } } })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {tab === "listas" ? (
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground">
                  Edita las listas en formato JSON. Los cambios se validan mientras escribes.
                </p>
                <JsonField
                  label={`Métricas (${lang})`}
                  value={dict.metrics}
                  onChange={(v) => setDict({ metrics: v as typeof dict.metrics })}
                />
                <JsonField
                  label={`Proyectos (${lang})`}
                  value={dict.projects}
                  onChange={(v) => setDict({ projects: v as typeof dict.projects })}
                />
                <JsonField
                  label={`Experiencia (${lang})`}
                  value={dict.experience}
                  onChange={(v) => setDict({ experience: v as typeof dict.experience })}
                />
                <JsonField
                  label={`Stack (${lang})`}
                  value={dict.stack}
                  onChange={(v) => setDict({ stack: v as typeof dict.stack })}
                />
                <JsonField
                  label={`Certificaciones (${lang})`}
                  value={dict.certifications}
                  onChange={(v) => setDict({ certifications: v as typeof dict.certifications })}
                />
                <JsonField
                  label={`Educación (${lang})`}
                  value={dict.education}
                  onChange={(v) => setDict({ education: v as typeof dict.education })}
                />
              </div>
            ) : null}

            {tab === "archivos" ? (
              <div className="space-y-6">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">CV en PDF</p>
                  <p className="mt-1 text-xs text-muted-foreground">Actual: {current.profile.cvUrl}</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:border-primary">
                    {uploading === "cv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Subir PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void upload(f, "cv");
                      }}
                    />
                  </label>
                  <Field label="O pega una URL" value={current.profile.cvUrl} onChange={(v) => setProfile("cvUrl", v)} />
                </div>

                <div>
                  <p className="font-display text-sm font-semibold text-foreground">Foto de perfil</p>
                  <img
                    src={current.profile.portraitUrl}
                    alt="Retrato actual"
                    className="mt-3 h-28 w-24 rounded-xl object-cover"
                  />
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:border-primary">
                    {uploading === "portrait" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void upload(f, "portrait");
                      }}
                    />
                  </label>
                  <Field
                    label="O pega una URL"
                    value={current.profile.portraitUrl}
                    onChange={(v) => setProfile("portraitUrl", v)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}
