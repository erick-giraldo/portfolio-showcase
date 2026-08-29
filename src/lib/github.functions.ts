import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Repo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  topics: string[];
};

export const getGithubRepos = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ username: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<Repo[]> => {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(data.username)}/repos?per_page=100&sort=updated`,
      { headers: { Accept: "application/vnd.github+json", "User-Agent": "cv-landing" } },
    );

    if (!res.ok) {
      console.error(`GitHub request failed [${res.status}]: ${await res.text()}`);
      return [];
    }

    const raw = (await res.json()) as Array<{
      id: number;
      name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      html_url: string;
      fork: boolean;
      archived: boolean;
      topics?: string[];
    }>;

    return raw
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        topics: r.topics ?? [],
      }));
  });
