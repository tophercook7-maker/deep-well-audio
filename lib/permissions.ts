/**
 * Feature gating by account tier. Listening / browse / explore stay open for everyone.
 */

export type UserPlan = "guest" | "free" | "premium";

export type FeatureKey =
  | "save"
  | "continue_listening"
  | "playlists"
  | "bookmarks"
  | "topic_packs"
  | "advanced_filters"
  | "world_watch"
  /** Curated YouTube: saves, notes, progress (signed-in free + premium). */
  | "curated_library";

const PREMIUM_ONLY = new Set<FeatureKey>([
  "save",
  "continue_listening",
  "curated_library",
  "playlists",
  "bookmarks",
  "topic_packs",
  "advanced_filters",
  "world_watch",
]);

export function canUseFeature(feature: FeatureKey, plan: UserPlan): boolean {
  if (plan === "premium") return true;
  if (PREMIUM_ONLY.has(feature)) return false;
  return false;
}
