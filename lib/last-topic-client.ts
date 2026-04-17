/** Remember last topic hub opened (for “Return to this topic”). */

export const LAST_TOPIC_SLUG_KEY = "deepwell:last-topic-slug";

export function setLastOpenedTopicSlug(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const s = slug.trim();
    if (!s) return;
    localStorage.setItem(LAST_TOPIC_SLUG_KEY, s);
  } catch {
    /* ignore */
  }
}

export function getLastOpenedTopicSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LAST_TOPIC_SLUG_KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}
