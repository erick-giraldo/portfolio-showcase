"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/components/landing/theme-context";
import { useAuth } from "@/hooks/useAuth";

export function AuthPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/admin");
  }, [loading, session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu correo si se pide confirmación.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    // Native Supabase OAuth: the provider must be enabled in the Supabase project.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) {
      toast.error(
        provider === "google"
          ? "No se pudo iniciar sesión con Google"
          : "No se pudo iniciar sesión con Apple",
      );
    }
  };

  return (
    <ThemeProvider>
      <main className="relative grid min-h-screen place-items-center px-5 py-16">
        <div className="aurora-mesh animate-aurora pointer-events-none absolute inset-0 opacity-40" />
        <div className="glass-card relative w-full max-w-sm rounded-3xl p-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-aurora text-primary-foreground">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">
            {mode === "signin" ? "Entrar al panel" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo el administrador puede editar el contenido del sitio.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-xl border border-border bg-surface-2/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl border border-border bg-surface-2/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy}
              className="shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Entrar" : "Registrarme"}
            </button>
          </form>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => oauth("google")}
              className="rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              Google
            </button>
            <button
              onClick={() => oauth("apple")}
              className="rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              Apple
            </button>
          </div>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "¿No tienes cuenta? Crear una" : "Ya tengo cuenta"}
          </button>
        </div>
      </main>
    </ThemeProvider>
  );
}
