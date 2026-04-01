import {
  getActiveCuratedYoutubeSourcesSorted,
  getCuratedYoutubeSourceById,
  resolveCuratedYoutubeRssUrl,
  type CuratedYoutubeSource,
} from "@/data/curated-youtube-sources";
import { CURATED_CATEGORY_ORDER, isCuratedCategorySlug, type CuratedCategorySlug } from "@/lib/curated-teachings/categories";
import { fetchYoutubeChannelRssItems } from "@/lib/curated-teachings/fetch-youtube-rss";
import { fetchYoutubeChannelViaApi } from "@/lib/curated-teachings/youtube-api-curated";
import type { CuratedVideoItem, CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";
import { getOptionalYoutubeApiKey } from "@/lib/env";

const DEFAULT_MAX_PER_SOURCE = 24;
const DEFAULT_MAX_TOTAL = 80;
const EXCERPT_MAX = 220;
const DESCRIPTION_MAX = 4000;

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

async function ingestOneSource(
  source: CuratedYoutubeSource,
  maxPerSource: number,
  apiKey: string | null
): Promise<CuratedYoutubeFeedItem[]> {
  const channelReady = Boolean(source.channelId?.trim());
  const useApiFirst = !source.rssOnly && Boolean(apiKey) && channelReady;

  if (useApiFirst) {
    try {
      const items = await fetchYoutubeChannelViaApi(source, apiKey!, maxPerSource);
      console.info(
        "curated: YouTube API ingest ok",
        source.id,
        `items=${items.length}`,
        `channelId=${source.channelId ?? ""}`
      );
      return items;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("curated: YouTube API ingest failed, falling back to RSS", source.id, msg);
    }
  }

  const rssUrl = resolveCuratedYoutubeRssUrl(source);
  if (!rssUrl) {
    console.warn("curated: skip source (no channelId/rssUrl)", source.id);
    return [];
  }
  try {
    return await fetchYoutubeChannelRssItems(source, rssUrl, maxPerSource);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("curated: RSS ingest failed", source.id, rssUrl, msg);
    return [];
  }
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

  const apiKey = getOptionalYoutubeApiKey();

  let sources = getActiveCuratedYoutubeSourcesSorted();
  if (sourceFilter) {
    const one = getCuratedYoutubeSourceById(sourceFilter);
    sources = one && one.active !== false ? [one] : [];
  }

  const buckets = await Promise.all(sources.map((s) => ingestOneSource(s, maxPerSource, apiKey)));

  const merged = buckets.flat();
  if (merged.length === 0) return [];

  const deduped = dedupeByVideoId(merged);
  deduped.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  let videos = deduped.map(feedItemToVideoItem);

  if (categoryFilter) {
    videos = videos.filter((v) => v.categories.includes(categoryFilter));
  }
  if (featuredOnly) {
    videos = videos.filter((v) => v.featured);
  }
  if (worldWatchOnly) {
    videos = videos.filter((v) => v.worldWatch);
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

/** Featured-first helper for the homepage strip (still obeys global date order among featured). */
export async function getHomepageFeaturedCuratedVideos(count: number): Promise<CuratedVideoItem[]> {
  const pool = await getAggregatedCuratedYoutubeItems({
    maxTotal: Math.max(count * 4, 24),
  });
  const featured = pool.filter((v) => v.featured);
  const rest = pool.filter((v) => !v.featured);
  const merged = [...featured, ...rest];
  return merged.slice(0, count);
}

export async function getWorldWatchYoutubeVideos(limit: number): Promise<CuratedVideoItem[]> {
  return getAggregatedCuratedYoutubeItems({ worldWatchOnly: true, limit, maxTotal: limit * 2 });
}

/** Newest uploads across all active sources (for “Recently added”). */
export async function getRecentlyAddedCuratedVideos(limit: number): Promise<CuratedVideoItem[]> {
  return getAggregatedCuratedYoutubeItems({
    limit,
    maxTotal: Math.max(limit * 3, 48),
  });
}
