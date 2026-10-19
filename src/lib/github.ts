export type Repo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  topics: string[];
};

/** Top public repos for a user: no forks or archived, most starred first. Server-only (uses fetch caching). */
export async function fetchGithubRepos(username: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "cv-landing" },
      next: { revalidate: 3600 },
    },
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
}
