import {
  getActiveCuratedYoutubeSourcesSorted,
  getCuratedYoutubeSourceById,
  getWorldWatchYoutubeSources,
  resolveCuratedYoutubeRssUrl,
  type CuratedYoutubeSource,
} from "@/data/curated-youtube-sources";
import { CURATED_CATEGORY_ORDER, isCuratedCategorySlug, type CuratedCategorySlug } from "@/lib/curated-teachings/categories";
import { fetchYoutubeChannelRssItems } from "@/lib/curated-teachings/fetch-youtube-rss";
import { fetchYoutubeChannelViaApi } from "@/lib/curated-teachings/youtube-api-curated";
import type { CuratedVideoItem, CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";
import { getOptionalYoutubeApiKey } from "@/lib/env";
import { unstable_cache } from "next/cache";

/** Align with `youtube-api-curated` fetch revalidate so cached HTML/API routes stay roughly in sync with Data API caching. */
const CURATED_AGGREGATE_CACHE_SECONDS = 900;

const DEFAULT_MAX_PER_SOURCE = 24;
/** WW pool: cap each source so a high-volume channel (e.g. TGC) does not crowd out commentary-first sources after merge. */
const WORLD_WATCH_MAX_PER_SOURCE = 10;
/** Bumps WW `unstable_cache` when ordering or caps change. */
const WORLD_WATCH_CACHE_ORDER_TAG = "rr-prio-v1";
const DEFAULT_MAX_TOTAL = 80;
const EXCERPT_MAX = 220;
const DESCRIPTION_MAX = 4000;

const ALL_SOURCES_CACHE_KEY = "__all__";

function truncateExcerpt(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function normalizeDescription(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (t.length <= DESCRIPTION_MAX) return t;
  return `${t.slice(0, DESCRIPTION_MAX - 1).trim()}…`;
}

function feedItemToVideoItem(item: CuratedYoutubeFeedItem): CuratedVideoItem {
  const source = getCuratedYoutubeSourceById(item.sourceId);
  const fallback = source?.thumbnailFallback ?? null;
  const thumb =
    item.thumbnailUrl ?? fallback ?? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
  const description = normalizeDescription(item.description);
  const excerpt = description ? truncateExcerpt(description, EXCERPT_MAX) : "";
  const url = `https://www.youtube.com/watch?v=${item.videoId}`;
  const categories = item.categorySlugs.length ? item.categorySlugs : [item.categorySlug];
  return {
    id: `${item.sourceId}:${item.videoId}`,
    title: item.title,
    url,
    embedUrl: `https://www.youtube.com/embed/${item.videoId}`,
    thumbnail: thumb,
    publishedAt: item.publishedAt,
    sourceId: item.sourceId,
    sourceName: item.sourceTitle,
    category: item.categorySlug,
    categories,
    tags: item.tags,
    description,
    excerpt,
    featured: item.featured,
    membersOnly: item.membersOnly,
    worldWatch: item.worldWatch,
    sortDate: item.publishedAt,
    videoId: item.videoId,
  };
}

function sortCategorySlugs(slugs: CuratedCategorySlug[]): CuratedCategorySlug[] {
  const order = CURATED_CATEGORY_ORDER;
  const uniq = [...new Set(slugs)];
  uniq.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return uniq;
}

function mergeFeedItems(primary: CuratedYoutubeFeedItem, secondary: CuratedYoutubeFeedItem): CuratedYoutubeFeedItem {
  const categorySlugs = sortCategorySlugs([...primary.categorySlugs, ...secondary.categorySlugs]);
  return {
    ...primary,
    categorySlugs,
    categorySlug: categorySlugs[0] ?? primary.categorySlug,
    tags: [...categorySlugs],
    featured: primary.featured || secondary.featured,
    worldWatch: primary.worldWatch || secondary.worldWatch,
    membersOnly: primary.membersOnly || secondary.membersOnly,
  };
}

function dedupeByVideoId(items: CuratedYoutubeFeedItem[]): CuratedYoutubeFeedItem[] {
  const sorted = [...items].sort((a, b) => {
    const t = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    if (t !== 0) return t;
    return a.sourcePriority - b.sourcePriority;
  });
  const map = new Map<string, CuratedYoutubeFeedItem>();
  for (const item of sorted) {
    const existing = map.get(item.videoId);
    if (!existing) map.set(item.videoId, item);
    else map.set(item.videoId, mergeFeedItems(existing, item));
  }
  return Array.from(map.values());
}

/**
 * World Watch only: after N-per-source caps, a pure global date sort still lets one chatty channel
 * own the top of the list. Round-robin in editorial `priority` order (lower = earlier slot in each cycle)
 * keeps the lens varied while each source stays internally newest-first — deterministic, not shuffled.
 */
function orderWorldWatchFeedItems(deduped: CuratedYoutubeFeedItem[]): CuratedYoutubeFeedItem[] {
  const bySource = new Map<string, CuratedYoutubeFeedItem[]>();
  for (const item of deduped) {
    const list = bySource.get(item.sourceId);
    if (list) list.push(item);
    else bySource.set(item.sourceId, [item]);
  }
  for (const list of bySource.values()) {
    list.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  const sourceIds = [...bySource.keys()].sort((a, b) => {
    const pa = getCuratedYoutubeSourceById(a)?.priority ?? 999;
    const pb = getCuratedYoutubeSourceById(b)?.priority ?? 999;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });
  const queues = sourceIds.map((id) => bySource.get(id)!);
  const out: CuratedYoutubeFeedItem[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

type IngestOutcome = {
  items: CuratedYoutubeFeedItem[];
  skipped: boolean;
  apiFallback: boolean;
  rssError: boolean;
};

async function ingestOneSourceWithMeta(
  source: CuratedYoutubeSource,
  maxPerSource: number,
  apiKey: string | null
): Promise<IngestOutcome> {
  const channelReady = Boolean(source.channelId?.trim());
  const useApiFirst = !source.rssOnly && Boolean(apiKey) && channelReady;
  let apiFallback = false;

  if (useApiFirst) {
    try {
      const items = await fetchYoutubeChannelViaApi(source, apiKey!, maxPerSource);
      console.info(
        "curated: YouTube API ingest ok",
        source.id,
        `items=${items.length}`,
        `channelId=${source.channelId ?? ""}`
      );
      if (items.length > 0) {
        return { items, skipped: false, apiFallback: false, rssError: false };
      }
      console.warn("curated: YouTube API returned 0 items, falling back to RSS", source.id);
      apiFallback = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("curated: YouTube API ingest failed, falling back to RSS", source.id, msg);
      apiFallback = true;
    }
  }

  const rssUrl = resolveCuratedYoutubeRssUrl(source);
  if (!rssUrl) {
    console.warn("curated: skip source (no channelId/rssUrl)", source.id);
    return { items: [], skipped: true, apiFallback, rssError: false };
  }
  try {
    const items = await fetchYoutubeChannelRssItems(source, rssUrl, maxPerSource);
    return { items, skipped: false, apiFallback, rssError: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("curated: RSS ingest failed", source.id, rssUrl, msg);
    return { items: [], skipped: false, apiFallback, rssError: true };
  }
}

/** Core ingest + merge for an explicit source list (used for full feed, single-source filter, and WW fallback). */
async function runIngestionForSources(
  sources: CuratedYoutubeSource[],
  maxPerSource: number,
  scopeLabel: string
): Promise<{ videos: CuratedVideoItem[] }> {
  const t0 = performance.now();
  const apiKey = getOptionalYoutubeApiKey();

  const outcomes = await Promise.all(sources.map((s) => ingestOneSourceWithMeta(s, maxPerSource, apiKey)));

  const skippedCount = outcomes.filter((o) => o.skipped).length;
  const apiFallbackCount = outcomes.filter((o) => o.apiFallback).length;
  const sourcesOk = outcomes.filter((o) => !o.skipped && !o.rssError).length;
  const durationMs = performance.now() - t0;

  const merged = outcomes.flatMap((o) => o.items);
  if (scopeLabel.startsWith("world-watch")) {
    const perSource = sources.map((s, i) => `${s.id}=${outcomes[i]?.items.length ?? 0}`);
    console.info(
      "curated: world-watch ingest detail",
      `scope=${scopeLabel}`,
      `sourceCount=${sources.length}`,
      `sourceIds=${sources.map((s) => s.id).join(",")}`,
      `perSource=${perSource.join(";")}`,
      `mergedRaw=${merged.length}`
    );
  }

  if (merged.length === 0) {
    console.info(
      "curated: aggregation summary",
      `scope=${scopeLabel}`,
      `sourcesOk=${sourcesOk}`,
      `apiFallbackCount=${apiFallbackCount}`,
      `skippedCount=${skippedCount}`,
      `durationMs=${Math.round(durationMs)}`,
      `videos=0`
    );
    return { videos: [] };
  }

  const deduped = dedupeByVideoId(merged);
  const ordered =
    scopeLabel.startsWith("world-watch") ? orderWorldWatchFeedItems(deduped) : deduped;
  if (!scopeLabel.startsWith("world-watch")) {
    ordered.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }
  const videos = ordered.map(feedItemToVideoItem);

  console.info(
    "curated: aggregation summary",
    `scope=${scopeLabel}`,
    `sourcesOk=${sourcesOk}`,
    `apiFallbackCount=${apiFallbackCount}`,
    `skippedCount=${skippedCount}`,
    `durationMs=${Math.round(durationMs)}`,
    `videos=${videos.length}`
  );

  return { videos };
}

async function runIngestionAndBuildVideos(
  maxPerSource: number,
  sourceIdFilter?: string
): Promise<{ videos: CuratedVideoItem[] }> {
  let sources = getActiveCuratedYoutubeSourcesSorted();
  if (sourceIdFilter) {
    const one = getCuratedYoutubeSourceById(sourceIdFilter);
    sources = one && one.active !== false ? [one] : [];
  }
  const scopeLabel = sourceIdFilter ?? ALL_SOURCES_CACHE_KEY;
  return runIngestionForSources(sources, maxPerSource, scopeLabel);
}

const getCuratedBaseVideosCached = unstable_cache(
  async (maxPerSource: number, sourceScope: string) => {
    const sourceIdFilter = sourceScope === ALL_SOURCES_CACHE_KEY ? undefined : sourceScope;
    return runIngestionAndBuildVideos(maxPerSource, sourceIdFilter);
  },
  ["curated-youtube-ingest"],
  { revalidate: CURATED_AGGREGATE_CACHE_SECONDS }
);

/** World Watch video lens uses its own cache so it never depends on merged `worldWatch` flags or a cold/empty all-sources cache. */
const getWorldWatchPoolCached = unstable_cache(
  async () => {
    const sources = getWorldWatchYoutubeSources();
    if (sources.length === 0) return { videos: [] as CuratedVideoItem[] };
    return runIngestionForSources(sources, WORLD_WATCH_MAX_PER_SOURCE, "world-watch-pool");
  },
  [
    "curated-youtube-world-watch-pool",
    `mps-${WORLD_WATCH_MAX_PER_SOURCE}`,
    WORLD_WATCH_CACHE_ORDER_TAG,
  ],
  { revalidate: CURATED_AGGREGATE_CACHE_SECONDS }
);

async function loadWorldWatchDedicatedVideoList(): Promise<CuratedVideoItem[]> {
  const sources = getWorldWatchYoutubeSources();
  if (sources.length === 0) return [];
  try {
    const row = await getWorldWatchPoolCached();
    if (row && Array.isArray(row.videos) && row.videos.length > 0) return row.videos;
    if (row && Array.isArray(row.videos) && row.videos.length === 0) {
      console.warn("curated: world-watch cache empty; direct ingest", sources.map((s) => s.id).join(","));
    } else {
      console.warn("curated: world-watch cache invalid shape; direct ingest");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("incrementalCache")) {
      console.warn("curated: world-watch unstable_cache unavailable; direct ingest", msg);
      const { videos } = await runIngestionForSources(sources, WORLD_WATCH_MAX_PER_SOURCE, "world-watch-direct");
      return videos;
    }
    throw e;
  }
  const { videos } = await runIngestionForSources(sources, WORLD_WATCH_MAX_PER_SOURCE, "world-watch-fallback");
  return videos;
}

async function getCuratedBaseVideos(maxPerSource: number, sourceIdFilter?: string): Promise<CuratedVideoItem[]> {
  const scope = sourceIdFilter ?? ALL_SOURCES_CACHE_KEY;
  try {
    const row = await getCuratedBaseVideosCached(maxPerSource, scope);
    if (row && Array.isArray(row.videos)) return row.videos;
    console.warn("curated: unstable_cache payload missing videos array; running direct ingest", scope);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("incrementalCache")) {
      console.warn("curated: unstable_cache unavailable; running direct ingest", msg);
      const { videos } = await runIngestionAndBuildVideos(maxPerSource, sourceIdFilter);
      return videos;
    }
    throw e;
  }
  const { videos } = await runIngestionAndBuildVideos(maxPerSource, sourceIdFilter);
  return videos;
}

function sortFeaturedFirst(pool: CuratedVideoItem[]): CuratedVideoItem[] {
  const featured = pool.filter((v) => v.featured);
  const rest = pool.filter((v) => !v.featured);
  return [...featured, ...rest];
}

export type AggregateCuratedOptions = {
  limit?: number;
  maxPerSource?: number;
  maxTotal?: number;
  sourceId?: string;
  category?: string;
  featuredOnly?: boolean;
  worldWatchOnly?: boolean;
  search?: string;
};

/**
 * Server-only: merge configured channels, normalize, dedupe by video ID, sort by date.
 * Uses YouTube Data API v3 first when `YOUTUBE_API_KEY` is set (unless `rssOnly` on the source); otherwise Atom RSS.
 * All-sources runs share `unstable_cache` (revalidate aligned with Data API fetches, currently 900s) keyed by maxPerSource + source scope.
 */
export async function getAggregatedCuratedYoutubeItems(
  options: AggregateCuratedOptions = {}
): Promise<CuratedVideoItem[]> {
  const limit = options.limit;
  const maxPerSource = options.maxPerSource ?? DEFAULT_MAX_PER_SOURCE;
  const maxTotal = options.maxTotal ?? DEFAULT_MAX_TOTAL;
  const sourceFilter = options.sourceId?.trim();
  const categoryFilter =
    options.category && isCuratedCategorySlug(options.category) ? options.category : undefined;
  const featuredOnly = options.featuredOnly === true;
  const worldWatchOnly = options.worldWatchOnly === true;
  const search = options.search?.trim().toLowerCase() ?? "";

  let videos: CuratedVideoItem[];
  if (worldWatchOnly && !sourceFilter) {
    videos = await loadWorldWatchDedicatedVideoList();
  } else {
    videos = await getCuratedBaseVideos(maxPerSource, sourceFilter);
    if (worldWatchOnly) {
      videos = videos.filter((v) => v.worldWatch);
    }
  }

  if (categoryFilter) {
    videos = videos.filter((v) => v.categories.includes(categoryFilter));
  }
  if (featuredOnly) {
    videos = videos.filter((v) => v.featured);
  }
  if (search) {
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(search) ||
        v.excerpt.toLowerCase().includes(search) ||
        v.sourceName.toLowerCase().includes(search)
    );
  }

  videos = videos.slice(0, maxTotal);

  if (typeof limit === "number" && limit >= 0) {
    return videos.slice(0, limit);
  }
  return videos;
}

export type HomepageCuratedSliceParams = {
  featuredCount: number;
  worldWatchLimit: number;
  recentlyAddedLimit: number;
};

async function getWorldWatchVideosForLens(sliceBeforeLimit: number, finalLimit: number): Promise<CuratedVideoItem[]> {
  const all = await loadWorldWatchDedicatedVideoList();
  return all.slice(0, sliceBeforeLimit).slice(0, finalLimit);
}

/** One ingest + cache hit serves all three homepage curated strips (caps must match previous `getHomepageFeaturedCuratedVideos` / `getWorldWatchYoutubeVideos` / `getRecentlyAddedCuratedVideos` behavior). */
export async function getHomepageCuratedVideoSlices(
  params: HomepageCuratedSliceParams
): Promise<{
  homepageFeaturedVideos: CuratedVideoItem[];
  worldWatchYoutube: CuratedVideoItem[];
  recentlyAddedCuratedPool: CuratedVideoItem[];
}> {
  const { featuredCount, worldWatchLimit, recentlyAddedLimit } = params;
  const featuredPoolMax = Math.max(featuredCount * 4, 24);
  const wwPoolMax = worldWatchLimit * 2;
  const recentPoolMax = Math.max(recentlyAddedLimit * 3, 48);

  const full = await getCuratedBaseVideos(DEFAULT_MAX_PER_SOURCE);

  const poolFeatured = full.slice(0, featuredPoolMax);
  const homepageFeaturedVideos = sortFeaturedFirst(poolFeatured).slice(0, featuredCount);

  const worldWatchYoutube = await getWorldWatchVideosForLens(wwPoolMax, worldWatchLimit);

  const recentlyAddedCuratedPool = full.slice(0, recentPoolMax).slice(0, recentlyAddedLimit);

  return { homepageFeaturedVideos, worldWatchYoutube, recentlyAddedCuratedPool };
}

/** Featured-first helper for the homepage strip (still obeys global date order among featured). */
export async function getHomepageFeaturedCuratedVideos(count: number): Promise<CuratedVideoItem[]> {
  const full = await getCuratedBaseVideos(DEFAULT_MAX_PER_SOURCE);
  const poolMax = Math.max(count * 4, 24);
  const pool = full.slice(0, poolMax);
  return sortFeaturedFirst(pool).slice(0, count);
}

export async function getWorldWatchYoutubeVideos(limit: number): Promise<CuratedVideoItem[]> {
  return getWorldWatchVideosForLens(limit * 2, limit);
}

/** Newest uploads across all active sources (for “Recently added”). */
export async function getRecentlyAddedCuratedVideos(limit: number): Promise<CuratedVideoItem[]> {
  const full = await getCuratedBaseVideos(DEFAULT_MAX_PER_SOURCE);
  const maxTotal = Math.max(limit * 3, 48);
  return full.slice(0, maxTotal).slice(0, limit);
}
