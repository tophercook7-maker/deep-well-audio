/** Client-only: last time the user opened the World Watch page (for soft return hooks). */

export const WORLD_WATCH_LAST_VISIT_KEY = "deepwell:ww-last-visit-ms";

export function getLastWorldWatchVisitMs(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORLD_WATCH_LAST_VISIT_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function markWorldWatchVisitedNow(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORLD_WATCH_LAST_VISIT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}
