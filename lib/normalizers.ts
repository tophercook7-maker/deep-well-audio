import { createHash } from "crypto";
import type { CategoryKey } from "@/lib/types";

const SLUG_MAX = 80;

export function slugify(input: string, suffix?: string): string {
  const base = input
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
  const core = base || "item";
  if (!suffix) return core;
  return `${core}-${suffix}`.slice(0, SLUG_MAX + 12);
}

export function shortHash(input: string, len = 8): string {
  return createHash("sha256").update(input).digest("hex").slice(0, len);
}

/** Stable episode id for dedupe: prefer RSS guid/link; else deterministic hash (no schema change). */
export function stableEpisodeExternalId(input: {
  showSlug: string;
  feedUrl: string;
  guid?: string | null;
  link?: string | null;
  title: string;
  publishedAt?: string | null;
}): string {
  const raw = (input.guid || "").trim();
  if (raw.length > 0) return raw.slice(0, 500);
  const link = (input.link || "").trim();
  if (link.length > 0) return link.slice(0, 500);
  const basis = `${input.showSlug}|${input.feedUrl}|${input.title}|${input.publishedAt || ""}`;
  return `dw:${shortHash(basis, 40)}`;
}

export function parseDurationToSeconds(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const t = raw.trim();
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const parts = t.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

const MEATY_HINTS = [
  "doctrine",
  "theolog",
  "apolog",
  "scripture",
  "bible",
  "reform",
  "covenant",
  "exposit",
  "sermon",
  "systematic",
  "romans",
  "genesis",
  "revelation",
  "ecclesiology",
  "sanctif",
  "atonement",
];

export function inferMeatyScore(input: {
  title: string;
  description?: string | null;
  durationSeconds?: number | null;
  tags?: string[];
  category?: string;
  base?: number;
}): number {
  let score = Math.min(10, Math.max(0, input.base ?? 0));
  const blob = `${input.title} ${input.description ?? ""} ${input.tags?.join(" ") ?? ""} ${input.category ?? ""}`.toLowerCase();

  let hits = 0;
  for (const h of MEATY_HINTS) {
    if (blob.includes(h)) hits += 1;
  }
  score = Math.min(10, score + Math.min(3, Math.floor(hits / 2)));

  const dur = input.durationSeconds ?? 0;
  if (dur >= 3600) score = Math.min(10, score + 1);
  else if (dur >= 2700) score = Math.min(10, score + 1);

  return score;
}

export function isCategoryKey(v: string): v is CategoryKey {
  return ["sermons", "bible-teaching", "apologetics", "church-history", "spiritual-growth"].includes(v);
}

export function fallbackEpisodeDescription(title: string, hostHint?: string): string {
  const h = hostHint ? ` from ${hostHint}` : "";
  return `Episode: ${title}${h}.`;
}
