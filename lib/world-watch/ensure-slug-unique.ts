import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyWorldWatchTitle, uniqueWorldWatchSlugSuffix } from "@/lib/world-watch/slug";

/** Returns a slug not present in `world_watch_items` (tries base + random suffixes). */
export async function ensureUniqueWorldWatchSlug(
  admin: SupabaseClient,
  titleForFallback: string,
  preferredSlug: string | null
): Promise<string> {
  let base = preferredSlug?.trim().toLowerCase() || slugifyWorldWatchTitle(titleForFallback);
  if (!base.length) base = "item";

  let candidate = base;
  for (let attempt = 0; attempt < 12; attempt++) {
    const { data, error } = await admin.from("world_watch_items").select("id").eq("slug", candidate).maybeSingle();
    if (error) {
      console.error("[world-watch] ensureUniqueWorldWatchSlug lookup", error.message);
      candidate = `${base}-${uniqueWorldWatchSlugSuffix()}`;
      continue;
    }
    if (!data) return candidate;
    candidate = `${base}-${uniqueWorldWatchSlugSuffix()}`;
  }
  return `${base}-${uniqueWorldWatchSlugSuffix()}${uniqueWorldWatchSlugSuffix()}`;
}
