/** Client-only: light counts of topic hub opens (no AI — rhythm and continuity). */

const STORAGE_KEY = "deepwell:topic-hub-visits";

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
    /* ignore */
  }
}

export function bumpTopicHubVisit(slug: string): number {
  const s = slug.trim();
  if (!s) return 0;
  const cur = read();
  const n = (typeof cur[s] === "number" && Number.isFinite(cur[s]) ? cur[s]! : 0) + 1;
  write({ ...cur, [s]: n });
  return n;
}

export function getTopicHubVisitCount(slug: string): number {
  const s = slug.trim();
  if (!s) return 0;
  const n = read()[s];
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}
