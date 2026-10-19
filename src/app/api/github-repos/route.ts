import { z } from "zod";
import { fetchGithubRepos } from "@/lib/github";

const query = z.object({ username: z.string().min(1).max(39) });

export async function GET(request: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "username is required" }, { status: 400 });

  const repos = await fetchGithubRepos(parsed.data.username);
  return Response.json(repos, {
    headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
