/**
 * Display-time labeling for episodes and shows (UI + optional sync coalescing).
 * Does not change how players resolve URLs—only human-readable titles.
 */

import { formatDate } from "@/lib/format";
import { stripHtmlToPlain } from "@/lib/present";

const WEAK_EPISODE_TITLES = new Set([
  "",
  "program",
  "episode",
  "episodes",
  "audio",
  "untitled",
  "untitled episode",
  "new episode",
  "no title",
  "unknown",
  "default",
  "podcast",
  "show",
  "rss",
  "feed",
  "media",
  "video",
  "untitled video",
]);

const WEAK_SHOW_TITLES = new Set([
  "",
  "program",
  "programs",
  "podcast",
  "podcasts",
  "show",
  "shows",
  "audio",
  "series",
  "untitled",
  "default",
  "rss",
  "feed",
  "channel",
]);

function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** True when a title is empty or an obvious generic placeholder. */
export function isWeakEpisodeTitle(raw: string | null | undefined): boolean {
  const t = normalizeWhitespace(raw ?? "").toLowerCase();
  if (!t) return true;
  if (t.length <= 1) return true;
  if (WEAK_EPISODE_TITLES.has(t)) return true;
  if (/^episode\s*#?\d*$/i.test(t)) return true;
  if (/^#\d+$/.test(t)) return true;
  if (/^part\s*\d+$/i.test(t)) return true;
  return false;
}

function isWeakShowTitle(raw: string | null | undefined): boolean {
  const t = normalizeWhitespace(raw ?? "").toLowerCase();
  if (!t) return true;
  if (t.length <= 1) return true;
  if (WEAK_SHOW_TITLES.has(t)) return true;
  return false;
}

/** Turn a URL slug into readable Title Case for fallback labeling. */
export function humanizeSlug(slug: string | null | undefined): string {
  const s = slug?.trim();
  if (!s) return "";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Reliable show/source label for UI and fallbacks.
 * Weak DB titles like "program" become slug-derived text or "Source".
 */
export function getShowDisplayLabel(showTitle: string | null | undefined, slug?: string | null): string {
  const raw = normalizeWhitespace(showTitle ?? "");
  if (raw && !isWeakShowTitle(raw)) return raw;
  const fromSlug = humanizeSlug(slug ?? "");
  if (fromSlug) return fromSlug;
  return "Source";
}

/** Remove "Show Name - " / "Show Name: " prefix when it duplicates the show label. */
export function stripRedundantShowPrefix(title: string, showLabel: string): string {
  const t = normalizeWhitespace(title);
  const s = normalizeWhitespace(showLabel);
  if (!t || !s) return t;
  const tl = t.toLowerCase();
  const sl = s.toLowerCase();
  const patterns = [`${sl}:`, `${sl} -`, `${sl} –`, `${sl} —`, `${sl} |`, `${sl}/`];
  for (const p of patterns) {
    if (tl.startsWith(p)) {
      const rest = t.slice(p.length).trim();
      if (rest && !isWeakEpisodeTitle(rest)) return rest;
    }
  }
  if (tl === sl) return "";
  if (tl === `${sl} podcast` || tl === `${sl} audio`) return "";
  return t;
}

function firstTitleLikeLineFromDescription(description: string | null | undefined, maxLen = 96): string | null {
  const plain = stripHtmlToPlain(description);
  if (!plain) return null;
  const oneLine = plain.split(/\n+/)[0]?.trim() ?? "";
  if (!oneLine) return null;
  let line = oneLine;
  if (line.length > maxLen) {
    const cut = line.slice(0, maxLen - 1);
    const sp = cut.lastIndexOf(" ");
    line = (sp > 24 ? cut.slice(0, sp) : cut).trim();
    line = `${line}…`;
  }
  if (isWeakEpisodeTitle(line)) return null;
  return line;
}

/**
 * Episode heading for lists and detail (prefers meaningful title; never shows bare "program").
 */
export function getEpisodeDisplayTitle(
  episode: {
    title: string;
    description: string | null;
    published_at: string | null;
  },
  showLabel: string
): string {
  const raw = normalizeWhitespace(episode.title);
  let candidate = stripRedundantShowPrefix(raw, showLabel);
  if (!candidate) candidate = raw;
  if (!isWeakEpisodeTitle(candidate)) return candidate;

  const fromDesc = firstTitleLikeLineFromDescription(episode.description);
  if (fromDesc) return fromDesc;

  const dateStr = formatDate(episode.published_at);
  const show = showLabel && showLabel !== "Source" ? showLabel : "";

  if (show && dateStr && dateStr !== "—") return `${show} · ${dateStr}`;
  if (show) return `${show} · Episode`;
  if (dateStr && dateStr !== "—") return `Episode · ${dateStr}`;
  return "Episode";
}

/**
 * Storage fallback when RSS item title is missing or generic (next sync writes cleaner rows).
 */
export function coalesceEpisodeTitleForStorage(
  rawTitle: string,
  showTitle: string,
  publishedAt: string | null | undefined,
  showSlug?: string | null
): string {
  const t = normalizeWhitespace(rawTitle);
  if (t && !isWeakEpisodeTitle(t)) return t;
  const show = getShowDisplayLabel(showTitle, showSlug);
  const d = formatDate(publishedAt ?? null);
  if (show !== "Source" && d !== "—") return `${show} · ${d}`;
  if (d !== "—") return `Episode · ${d}`;
  if (show !== "Source") return `${show} · Episode`;
  return "Episode";
}
