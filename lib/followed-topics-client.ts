/**
 * Lightweight topic "follow" list (localStorage). Complements catalog favorites.
 * Keys are normalized topic slugs from `lib/topics`.
 */

export const FOLLOWED_TOPICS_KEY = "deepwell:followed-topic-slugs";
const MAX = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOLLOWED_TOPICS_KEY);
    if (!raw) return [];
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    return j.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FOLLOWED_TOPICS_KEY, JSON.stringify(slugs.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("deepwell:followed-topics-changed"));
  } catch {
    /* ignore */
  }
}

export function getFollowedTopicSlugs(): string[] {
  return read();
}

export function isTopicFollowed(slug: string): boolean {
  return read().includes(slug);
}

/** Returns new followed state. */
export function toggleFollowedTopic(slug: string): boolean {
  const s = slug.trim();
  if (!s) return false;
  const cur = read();
  const has = cur.includes(s);
  const next = has ? cur.filter((x) => x !== s) : [...cur, s].slice(-MAX);
  write(next);
  return !has;
}
