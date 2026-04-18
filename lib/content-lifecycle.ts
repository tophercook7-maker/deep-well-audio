/**
 * Content lifecycle (episodes, World Watch): featured vs evergreen vs archived vs retired.
 * User-facing copy stays natural; these labels are editorial/engineering only.
 */

import type { EpisodeLifecycleStatus, EpisodeRow, EpisodeWithShow } from "@/lib/types";

export type { EpisodeLifecycleStatus } from "@/lib/types";

export function normalizeEpisodeLifecycleStatus(raw: string | null | undefined): EpisodeLifecycleStatus {
  if (raw === "current" || raw === "archived" || raw === "retired") return raw;
  return "evergreen";
}

export function isEpisodeRetired(ep: Pick<EpisodeRow, "lifecycle_status">): boolean {
  return normalizeEpisodeLifecycleStatus(ep.lifecycle_status) === "retired";
}

export function isFeaturedUntilActive(featuredUntil: string | null | undefined): boolean {
  if (!featuredUntil) return false;
  const t = Date.parse(featuredUntil);
  return Number.isFinite(t) && t > Date.now();
}

function episodePublishedTs(ep: EpisodeWithShow): number {
  const raw = ep.published_at;
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

const LIFECYCLE_RANK: Record<EpisodeLifecycleStatus, number> = {
  evergreen: 0,
  current: 1,
  archived: 2,
  retired: 9,
};

/**
 * Homepage “Start listening” pool: active featured window first, then evergreen priority,
 * then lifecycle (evergreen/current before archived), then recency.
 */
export function sortEpisodesForFeaturedPool(episodes: EpisodeWithShow[]): EpisodeWithShow[] {
  return [...episodes].sort((a, b) => {
    const aFeat = isFeaturedUntilActive(a.featured_until) ? 1 : 0;
    const bFeat = isFeaturedUntilActive(b.featured_until) ? 1 : 0;
    if (aFeat !== bFeat) return bFeat - aFeat;

    const ap = a.evergreen_priority ?? 0;
    const bp = b.evergreen_priority ?? 0;
    if (ap !== bp) return bp - ap;

    const ar = LIFECYCLE_RANK[normalizeEpisodeLifecycleStatus(a.lifecycle_status)];
    const br = LIFECYCLE_RANK[normalizeEpisodeLifecycleStatus(b.lifecycle_status)];
    if (ar !== br) return ar - br;

    return episodePublishedTs(b) - episodePublishedTs(a);
  });
}

/**
 * Study “related teaching”: study-support links for this topic first, then evergreen,
 * de-emphasize purely timely/current unless still relevant; archived last among matches.
 */
export function sortEpisodesForStudySupport(episodes: EpisodeWithShow[], studyTopicSlug: string | null): EpisodeWithShow[] {
  const slug = studyTopicSlug?.trim().toLowerCase() ?? "";
  return [...episodes].sort((a, b) => {
    const aSup = slug && (a.study_support_topic_slugs ?? []).some((s) => s.toLowerCase() === slug) ? 1 : 0;
    const bSup = slug && (b.study_support_topic_slugs ?? []).some((s) => s.toLowerCase() === slug) ? 1 : 0;
    if (aSup !== bSup) return bSup - aSup;

    const ar = LIFECYCLE_RANK[normalizeEpisodeLifecycleStatus(a.lifecycle_status)];
    const br = LIFECYCLE_RANK[normalizeEpisodeLifecycleStatus(b.lifecycle_status)];
    /** Prefer evergreen over current for study adjacency unless study-support matched (already handled). */
    if (ar !== br) return ar - br;

    const ap = a.evergreen_priority ?? 0;
    const bp = b.evergreen_priority ?? 0;
    if (ap !== bp) return bp - ap;

    return episodePublishedTs(b) - episodePublishedTs(a);
  });
}

export function filterEpisodesExcludingRetired<T extends Pick<EpisodeRow, "lifecycle_status">>(episodes: T[]): T[] {
  return episodes.filter((e) => !isEpisodeRetired(e));
}
