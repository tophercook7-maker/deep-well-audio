/**
 * Cross-cluster bridges: emotional life ↔ foundational truth.
 * Each list is max 3 slugs; used by `TopicBridgeSection` on study topic pages.
 */

/** Struggle / emotion topics → foundational topics (shown after key Scriptures). */
export const TOPIC_BRIDGE_GROUND_TRUTH: Partial<Record<string, string[]>> = {
  anxiety: ["faith", "identity-in-christ", "grace"],
  fear: ["faith", "identity-in-christ", "grace"],
  peace: ["grace", "salvation", "faith"],
  prayer: ["faith", "salvation", "grace"],
  grief: ["faith", "salvation", "grace"],
};

/** Foundational topics → life / emotion topics (shown after key Scriptures). */
export const TOPIC_BRIDGE_WALK_LIFE: Partial<Record<string, string[]>> = {
  salvation: ["anxiety", "fear", "prayer"],
  faith: ["anxiety", "fear", "prayer"],
  grace: ["peace", "anxiety", "forgiveness"],
  "identity-in-christ": ["fear", "anxiety", "peace"],
  gospel: ["anxiety", "fear", "peace"],
};

export function groundTruthBridgeSlugs(slug: string): string[] | null {
  const s = TOPIC_BRIDGE_GROUND_TRUTH[slug];
  return s && s.length > 0 ? s : null;
}

export function walkLifeBridgeSlugs(slug: string): string[] | null {
  const s = TOPIC_BRIDGE_WALK_LIFE[slug];
  return s && s.length > 0 ? s : null;
}
