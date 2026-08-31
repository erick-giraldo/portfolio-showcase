import { supabase } from "@/integrations/supabase/client";

/**
 * Local stand-in for the `@/integrations/lovable` module that `routes/auth.tsx`
 * imports: the Lovable project references it but does not ship it, so the route
 * fails to resolve. It delegates to the Supabase client already configured here
 * and keeps the call shape auth.tsx expects.
 */
export type OAuthProvider = "google" | "github" | "azure";

export type OAuthOptions = {
  /** Where the provider sends the browser back to after consent. */
  redirect_uri?: string;
};

export type OAuthResult = {
  error: Error | null;
  /** True when the browser is being navigated to the provider. */
  redirected: boolean;
};

async function signInWithOAuth(
  provider: OAuthProvider,
  options: OAuthOptions = {},
): Promise<OAuthResult> {
  const redirectTo =
    options.redirect_uri ?? (typeof window === "undefined" ? undefined : window.location.origin);

  const { data, error } = await supabase.auth.signInWithOAuth(
    redirectTo ? { provider, options: { redirectTo } } : { provider },
  );

  if (error) return { error, redirected: false };
  return { error: null, redirected: Boolean(data?.url) };
}

export const lovable = {
  auth: { signInWithOAuth },
};
