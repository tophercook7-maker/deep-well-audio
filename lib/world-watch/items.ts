import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorldWatchCategory } from "@/lib/world-watch/category";
import { getFeedOrderingPriority } from "@/lib/world-watch/sources";

/**
 * World Watch — hybrid feed (`world_watch_items`): manual curation plus syndicated RSS (mostly auto-published).
 * Premium page uses service role reads only after `canUseFeature("world_watch", plan)`.
 */

export type WorldWatchSourceType = "manual" | "rss";

export type WorldWatchIngestionStatus = "review" | "ready";

/** Rows safe to render on the Premium World Watch page (no internal-only columns). */
export type WorldWatchItemPublic = {
  id: string;
  published_at: string;
  title: string;
  slug: string;
  source_name: string | null;
  source_url: string | null;
  /** Manual override image; takes precedence over `external_image_url` when rendering. */
  image_url: string | null;
  external_image_url: string | null;
  summary: string;
  reflection: string | null;
  category: string | null;
  pinned: boolean;
  pinned_rank: number | null;
  /** RSS source id when `source_type` is rss; null for manual items. Used for feed ordering tie-breaks only. */
  source_feed: string | null;
};

/** Full row for admin list / edit (includes draft fields). */
export type WorldWatchItemAdminRow = WorldWatchItemPublic & {
  created_at: string;
  updated_at: string;
  is_published: boolean;
  source_type: WorldWatchSourceType;
  source_guid: string | null;
  canonical_url: string | null;
  ingestion_status: WorldWatchIngestionStatus;
};

const SELECT_PUBLIC =
  "id, published_at, title, slug, source_name, source_url, image_url, external_image_url, summary, reflection, category, pinned, pinned_rank, source_feed";

export function worldWatchHeroImage(item: {
  image_url?: string | null;
  external_image_url?: string | null;
}): string | null {
  const manual = typeof item.image_url === "string" ? item.image_url.trim() : "";
  if (manual) return manual;
  const ext = typeof item.external_image_url === "string" ? item.external_image_url.trim() : "";
  return ext.length ? ext : null;
}

function sortPublishedItems(rows: WorldWatchItemPublic[]): WorldWatchItemPublic[] {
  return [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned && b.pinned) {
      const ar = a.pinned_rank ?? 10_000;
      const br = b.pinned_rank ?? 10_000;
      if (ar !== br) return ar - br;
    }
    const ta = new Date(a.published_at).getTime();
    const tb = new Date(b.published_at).getTime();
    if (ta !== tb) return tb - ta;
    const pa = getFeedOrderingPriority(a.source_feed ?? null);
    const pb = getFeedOrderingPriority(b.source_feed ?? null);
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Load published items for Premium members.
 * Order: pinned first (`pinned_rank` asc), then newest `published_at`, then source `priority` (see sources.ts).
 * With no pins, the first row is the lead story (newest + feed priority tie-break).
 */
export async function fetchPublishedWorldWatchItems(
  admin: SupabaseClient,
  limit = 50
): Promise<WorldWatchItemPublic[]> {
  const { data, error } = await admin
    .from("world_watch_items")
    .select(SELECT_PUBLIC)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(Math.min(limit * 2, 120));

  if (error) {
    console.error("[world-watch] fetchPublishedWorldWatchItems", error.message);
    return [];
  }

  const rows = (data ?? []) as WorldWatchItemPublic[];
  return sortPublishedItems(rows).slice(0, limit);
}

export type { WorldWatchCategory };

export const WORLD_WATCH_CATEGORY_OPTIONS: { value: WorldWatchCategory | ""; label: string }[] = [
  { value: "", label: "— None —" },
  { value: "global", label: "Global" },
  { value: "faith_public_life", label: "Faith & public life" },
  { value: "culture", label: "Culture" },
  { value: "prayer_watch", label: "Prayer watch" },
  { value: "other", label: "Other" },
];

export function worldWatchCategoryLabel(category: string | null | undefined): string | null {
  if (!category) return null;
  const row = WORLD_WATCH_CATEGORY_OPTIONS.find((o) => o.value === category);
  return row?.label ?? null;
}
