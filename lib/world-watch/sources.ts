import type { WorldWatchCategory } from "@/lib/world-watch/items";

export type WorldWatchRssSource = {
  id: string;
  name: string;
  category_hint: WorldWatchCategory;
  rss_url: string;
  enabled: boolean;
  /** Lower runs first among enabled sources in one ingest pass. */
  priority: number;
  source_type: "rss";
  /**
   * When true, new items from this feed may be created as published (v1 keeps all false).
   * Reserved for trusted internal mirrors only—not used in v1.
   */
  safe_for_auto_publish: boolean;
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
    safe_for_auto_publish: false,
  },
  {
    id: "un-news-climate-en",
    name: "UN News · Climate & environment",
    category_hint: "global",
    rss_url: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
    enabled: true,
    priority: 20,
    source_type: "rss",
    safe_for_auto_publish: false,
  },
  {
    id: "who-news-en",
    name: "WHO · News",
    category_hint: "global",
    rss_url: "https://www.who.int/rss-feeds/news-english.xml",
    enabled: true,
    priority: 30,
    source_type: "rss",
    safe_for_auto_publish: false,
  },
  {
    id: "fao-news-placeholder",
    name: "FAO (disabled — set RSS URL)",
    category_hint: "global",
    rss_url: "https://www.fao.org/news/rss/rss.xml",
    enabled: false,
    priority: 40,
    source_type: "rss",
    safe_for_auto_publish: false,
  },
];

export function getEnabledWorldWatchRssSources(): WorldWatchRssSource[] {
  return [...WORLD_WATCH_RSS_SOURCES].filter((s) => s.enabled).sort((a, b) => a.priority - b.priority);
}
