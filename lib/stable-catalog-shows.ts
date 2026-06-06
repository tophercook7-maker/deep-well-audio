import type { SupabaseClient } from "@supabase/supabase-js";
import { sourceFeeds } from "@/data/source-feeds";

/** Slug for Grace Church Hot Springs — stable YouTube catalog (not a rotating cycle). */
export const GRACE_CHURCH_SHOW_SLUG = "grace-church-hot-springs";

/**
 * Shows that accumulate episodes over time and stay visible outside catalog cycle rotation.
 * Derived from `stableCatalog: true` in `data/source-feeds.ts`.
 */
export const STABLE_CATALOG_SHOW_SLUGS: readonly string[] = sourceFeeds
  .filter((seed) => seed.stableCatalog === true && seed.showSlug?.trim())
  .map((seed) => seed.showSlug!.trim());

export function isStableCatalogShowSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return STABLE_CATALOG_SHOW_SLUGS.includes(slug.trim());
}

/** Grace Church YouTube channel ID from `data/source-feeds.ts`. */
export function getGraceChurchYoutubeChannelId(): string | null {
  const seed = sourceFeeds.find((s) => s.showSlug === GRACE_CHURCH_SHOW_SLUG);
  return seed?.youtubeChannelId?.trim() ?? null;
}

export async function loadStableCatalogShowIds(supabase: SupabaseClient): Promise<string[]> {
  if (!STABLE_CATALOG_SHOW_SLUGS.length) return [];

  const { data, error } = await supabase
    .from("shows")
    .select("id")
    .in("slug", [...STABLE_CATALOG_SHOW_SLUGS])
    .eq("is_active", true);

  if (error) {
    console.error("stable-catalog-shows:loadStableCatalogShowIds", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
}

/** All non-retired episode IDs for stable catalog shows (always visible in browse/search). */
export async function loadStableCatalogEpisodeIds(supabase: SupabaseClient): Promise<string[]> {
  const showIds = await loadStableCatalogShowIds(supabase);
  if (!showIds.length) return [];

  const { data, error } = await supabase
    .from("episodes")
    .select("id")
    .in("show_id", showIds)
    .neq("lifecycle_status", "retired");

  if (error) {
    console.error("stable-catalog-shows:loadStableCatalogEpisodeIds", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.id as string);
}

/** Union cycle snapshot episode IDs with stable-catalog episodes. */
export async function mergeCycleAndStableEpisodeIds(
  supabase: SupabaseClient,
  cycleEpisodeIds: string[]
): Promise<string[]> {
  const stableIds = await loadStableCatalogEpisodeIds(supabase);
  if (!stableIds.length) return cycleEpisodeIds;
  return [...new Set([...cycleEpisodeIds, ...stableIds])];
}
