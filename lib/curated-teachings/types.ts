import type { CuratedCategorySlug } from "@/lib/curated-teachings/categories";
import type { CuratedYoutubeSourceType } from "@/data/curated-youtube-sources";

/** Raw-ish row from RSS or YouTube Data API before merge. */
export type CuratedYoutubeFeedItem = {
  videoId: string;
  title: string;
  watchUrl: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  description: string | null;
  channelName: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: CuratedYoutubeSourceType;
  sourcePriority: number;
  featured: boolean;
  worldWatch: boolean;
  membersOnly: boolean;
  /** Primary category (first in editorial order among assigned slugs). */
  categorySlug: CuratedCategorySlug;
  /** All categories this item appears under (union if the same video appeared from multiple sources). */
  categorySlugs: CuratedCategorySlug[];
  tags: string[];
};

/**
 * Canonical curated video (UI + future DB/API). Same shape whether ingested via RSS or Data API.
 */
export type CuratedVideoItem = {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnail: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  /** Primary category for sorting and default labeling */
  category: CuratedCategorySlug;
  categories: CuratedCategorySlug[];
  tags: string[];
  /** Normalized video description (bounded length); cards use `excerpt`. */
  description: string | null;
  excerpt: string;
  featured: boolean;
  membersOnly: boolean;
  worldWatch: boolean;
  sortDate: string;
  videoId: string;
};

/** @deprecated Use CuratedVideoItem */
export type CuratedTeaching = CuratedVideoItem;
