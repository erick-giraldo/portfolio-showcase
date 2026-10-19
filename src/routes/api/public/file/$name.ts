import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only proxy for files stored in the private `site-files` bucket.
 * Only serves objects from that bucket, so nothing else is reachable.
 */
export const Route = createFileRoute("/api/public/file/$name")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const name = params.name;
        if (!name || name.includes("/") || name.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("site-files").download(name);

        if (error || !data) return new Response("Not found", { status: 404 });

        const body = await data.arrayBuffer();
        const headers = {
          "content-type": data.type || "application/octet-stream",
          "cache-control": "public, max-age=300",
          "accept-ranges": "bytes",
        };

        // Byte ranges let the audio player seek inside uploaded tracks.
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
        if (range && (range[1] || range[2])) {
          const size = body.byteLength;
          const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
          const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          if (start >= size || start > end) {
            return new Response(null, {
              status: 416,
              headers: { "content-range": `bytes */${size}` },
            });
          }
          return new Response(body.slice(start, end + 1), {
            status: 206,
            headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}` },
          });
        }

        return new Response(body, { headers });
      },
    },
  },
});
