import type { WorldWatchCategory } from "@/lib/world-watch/items";

const CATEGORIES = new Set<string>(["global", "faith_public_life", "culture", "prayer_watch", "other"]);

export function isWorldWatchCategory(v: unknown): v is WorldWatchCategory {
  return typeof v === "string" && CATEGORIES.has(v);
}

export function sanitizeWorldWatchTitle(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim();
  if (!t.length || t.length > 500) return null;
  return t;
}

export function sanitizeWorldWatchSlugInput(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim().toLowerCase();
  if (!t.length || t.length > 120) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t)) return null;
  return t;
}

export function sanitizeWorldWatchSummary(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim();
  if (!t.length || t.length > 12000) return null;
  return t;
}

export function sanitizeWorldWatchOptionalLong(v: unknown, max: number): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim();
  if (t.length > max) return null;
  return t.length ? t : null;
}

export function sanitizeWorldWatchOptionalUrl(v: unknown, max: number): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return null;
  const t = v.replace(/\u0000/g, "").trim();
  if (!t.length || t.length > max) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return t;
  } catch {
    return null;
  }
}

export function parseWorldWatchPublishedAt(v: unknown): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function parseWorldWatchIsPublished(v: unknown, defaultTrue: boolean): boolean {
  if (v === undefined) return defaultTrue;
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1) return true;
  if (v === "false" || v === 0) return false;
  return defaultTrue;
}

export function parseWorldWatchPinned(v: unknown, defaultFalse: boolean): boolean {
  if (v === undefined) return defaultFalse;
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1) return true;
  if (v === "false" || v === 0) return false;
  return defaultFalse;
}

/** Valid rank 0–999 or null (unpinned ordering). */
export function sanitizePinnedRankInput(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 999) return undefined;
  return n;
}
