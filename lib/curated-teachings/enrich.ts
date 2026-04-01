import type { CuratedYoutubeSource } from "@/data/curated-youtube-sources";
import { CURATED_CATEGORY_ORDER, type CuratedCategorySlug } from "@/lib/curated-teachings/categories";
import type { CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";

function uniqueCategoriesSlugs(defaults: CuratedCategorySlug[]): CuratedCategorySlug[] {
  const order = CURATED_CATEGORY_ORDER;
  const uniq = [...new Set(defaults)];
  uniq.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return uniq;
}

type FeedCore = Omit<
  CuratedYoutubeFeedItem,
  "featured" | "worldWatch" | "membersOnly" | "categorySlug" | "categorySlugs" | "tags"
>;

export function applySourceToFeedItem(core: FeedCore, source: CuratedYoutubeSource): CuratedYoutubeFeedItem {
  const fallback: CuratedCategorySlug = "bible-foundations";
  const categorySlugs = uniqueCategoriesSlugs(
    source.categoryDefaults.length ? source.categoryDefaults : [fallback]
  );
  const primary = categorySlugs[0] ?? fallback;
  return {
    ...core,
    featured: source.isFeatured,
    worldWatch: source.isWorldWatchSource,
    membersOnly: source.membersOnlyDefault,
    categorySlug: primary,
    categorySlugs,
    tags: categorySlugs,
  };
}
