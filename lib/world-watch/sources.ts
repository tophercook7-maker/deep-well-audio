import type { WorldWatchCategory } from "@/lib/world-watch/category";

export type WorldWatchRssSource = {
  id: string;
  name: string;
  category_hint: WorldWatchCategory;
  rss_url: string;
  enabled: boolean;
  /**
   * Ordering: lower runs first in ingest; also tie-breaks Premium feed order for items on the same day.
   * Pins always beat unpinned; among unpinned, newer `published_at` wins; same timestamp uses this priority.
   */
  priority: number;
  source_type: "rss";
  /**
   * When true, newly ingested RSS rows are published immediately (`is_published`, `ingestion_status = ready`).
   * Trusted Agency/UN-style feeds only; set false to send a source back to manual review.
   */
  auto_publish: boolean;
};

/**
 * Curated allowlist: official / public-interest syndication only (v1).
 * - UN News delivers steady global coverage; thematic feed adds environment / development context.
 * - WHO English news RSS supplies health-emergency and public-health items where available.
 *
 * FAO’s public RSS endpoints have been unstable; add an `enabled: true` FAO entry here once a
 * current `application/rss+xml` URL is confirmed—do not scrape HTML “news” pages.
 */
export const WORLD_WATCH_RSS_SOURCES: WorldWatchRssSource[] = [
  {
    id: "un-news-all-en",
    name: "UN News",
    category_hint: "global",
    rss_url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    enabled: true,
    priority: 10,
    source_type: "rss",
    auto_publish: true,
  },
  {
    id: "un-news-climate-en",
    name: "UN News · Climate & environment",
    category_hint: "global",
    rss_url: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
    enabled: true,
    priority: 20,
    source_type: "rss",
    auto_publish: true,
  },
  {
    id: "who-news-en",
    name: "WHO · News",
    category_hint: "global",
    rss_url: "https://www.who.int/rss-feeds/news-english.xml",
    enabled: true,
    priority: 30,
    source_type: "rss",
    auto_publish: true,
  },
  {
    id: "fao-news-placeholder",
    name: "FAO (disabled — set RSS URL)",
    category_hint: "global",
    rss_url: "https://www.fao.org/news/rss/rss.xml",
    enabled: false,
    priority: 40,
    source_type: "rss",
    auto_publish: false,
  },
];

/** Sort tie-break for Premium feed: lower value ranks earlier (after pins and `published_at`). Manual rows use 0. */
const MANUAL_OR_UNKNOWN_FEED_ORDER = 0;

export function getFeedOrderingPriority(sourceFeed: string | null | undefined): number {
  if (!sourceFeed) return MANUAL_OR_UNKNOWN_FEED_ORDER;
  const s = WORLD_WATCH_RSS_SOURCES.find((x) => x.id === sourceFeed);
  if (s) return s.priority;
  return 999;
}

export function getEnabledWorldWatchRssSources(): WorldWatchRssSource[] {
  return [...WORLD_WATCH_RSS_SOURCES].filter((s) => s.enabled).sort((a, b) => a.priority - b.priority);
}
