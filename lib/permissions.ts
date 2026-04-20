/**
 * Feature gating by account tier.
 *
 * Listening, browse, explore, podcast playback, and in-page YouTube embeds stay available to all users.
 * `world_watch` gates the full World Watch *written* digest and related premium surfaces—not third-party YouTube clips on `/world-watch`.
 * `curated_library` gates saves/notes/progress APIs only; watching curated YouTube does not use this flag.
 */

export type UserPlan = "guest" | "free" | "premium";

export type FeatureKey =
  | "save"
  | "continue_listening"
  | "playlists"
  | "bookmarks"
  | "topic_packs"
  | "advanced_filters"
  /** Full World Watch written digest (teaser/preview for non-premium is handled in page loaders). */
  | "world_watch"
  /** Curated library tools (save, notes, progress) are premium-only */
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

/** Premium unlocks everything; guests and free users get `false` for any `PREMIUM_ONLY` feature. */
export function canUseFeature(feature: FeatureKey, plan: UserPlan): boolean {
  if (plan === "premium") return true;
  if (PREMIUM_ONLY.has(feature)) return false;
  return false;
}
