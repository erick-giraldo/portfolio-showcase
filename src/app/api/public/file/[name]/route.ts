import { supabase } from "@/integrations/supabase/client";

/**
 * Public read-only proxy for files stored in the `site-files` bucket.
 * The bucket's storage policy lets anyone read it, so the publishable key is enough,
 * and only objects from that bucket are reachable.
 */
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!name || name.includes("/") || name.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const { data, error } = await supabase.storage.from("site-files").download(name);
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
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    }
    return new Response(body.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}` },
    });
  }

  return new Response(body, { headers });
}
