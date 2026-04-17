/** Client-only: how often the user has opened an episode page (meaningful repetition). */

const STORAGE_KEY = "deepwell:episode-visit-counts";
const MAX_IDS = 120;

function read(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return {};
    return j as Record<string, number>;
  } catch {
    return {};
  }
}

function write(next: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

/** Increment visit count for an episode; returns the new count. */
export function bumpEpisodePageVisit(episodeId: string): number {
  const id = episodeId.trim();
  if (!id) return 0;
  const cur = read();
  const n = (typeof cur[id] === "number" && Number.isFinite(cur[id]) ? cur[id]! : 0) + 1;
  const next = { ...cur, [id]: n };
  const keys = Object.keys(next);
  if (keys.length > MAX_IDS) {
    keys.sort((a, b) => (next[b] ?? 0) - (next[a] ?? 0));
    for (const k of keys.slice(MAX_IDS)) delete next[k];
  }
  write(next);
  return n;
}

export function getEpisodeVisitCount(episodeId: string): number {
  const id = episodeId.trim();
  if (!id) return 0;
  const n = read()[id];
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
