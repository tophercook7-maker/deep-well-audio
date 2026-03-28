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
  | "world_watch";

const PREMIUM_ONLY = new Set<FeatureKey>([
  "playlists",
  "bookmarks",
  "topic_packs",
  "advanced_filters",
  "world_watch",
]);

const FREE_AND_UP = new Set<FeatureKey>(["save", "continue_listening"]);

export function canUseFeature(feature: FeatureKey, plan: UserPlan): boolean {
  if (plan === "premium") return true;
  if (PREMIUM_ONLY.has(feature)) return false;
  if (FREE_AND_UP.has(feature)) return plan === "free";
  return false;
}
