import { supabase } from "@/integrations/supabase/client";

// Called daily by Vercel Cron (see vercel.json) so the free Supabase project
// never sits idle long enough to be paused. It runs a real database query.
export async function GET(request: Request) {
  const secret = process.env["CRON_SECRET"];
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("site_content").select("id").limit(1);
  if (error) {
    console.error("[keep-alive] Supabase query failed:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json(
    { ok: true, at: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}
