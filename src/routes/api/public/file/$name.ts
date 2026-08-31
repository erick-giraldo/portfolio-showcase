import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only proxy for files stored in the private `site-files` bucket.
 * Only serves objects from that bucket, so nothing else is reachable.
 */
export const Route = createFileRoute("/api/public/file/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = params.name;
        if (!name || name.includes("/") || name.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("site-files").download(name);

        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
