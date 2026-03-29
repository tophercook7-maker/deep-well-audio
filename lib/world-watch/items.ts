import type { SupabaseClient } from "@supabase/supabase-js";

/** Rows safe to render on the Premium World Watch page (no internal-only columns). */
export type WorldWatchItemPublic = {
  id: string;
  published_at: string;
  title: string;
  slug: string;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  summary: string;
  reflection: string | null;
  category: string | null;
};

/** Full row for admin list / edit (includes draft fields). */
export type WorldWatchItemAdminRow = WorldWatchItemPublic & {
  created_at: string;
  updated_at: string;
  is_published: boolean;
};

const SELECT_PUBLIC =
  "id, published_at, title, slug, source_name, source_url, image_url, summary, reflection, category";

/**
 * Load published items for Premium members. Call only after `canUseFeature("world_watch", plan)`;
 * uses service role — never expose this result to non-premium routes.
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
    .limit(limit);

  if (error) {
    console.error("[world-watch] fetchPublishedWorldWatchItems", error.message);
    return [];
  }

  return (data ?? []) as WorldWatchItemPublic[];
}

export type WorldWatchCategory = "global" | "faith_public_life" | "culture" | "prayer_watch" | "other";

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
