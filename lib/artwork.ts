/**
 * Branded placeholder path (served from /public). Use when artwork is missing or failed to load.
 */
export const FALLBACK_ARTWORK_PATH = "/fallback-artwork.svg";

/** Accepts only http(s) URLs suitable for remote <img> src. */
export function normalizeArtworkSrc(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  if (lower === "null" || lower === "undefined") return null;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return null;
}
