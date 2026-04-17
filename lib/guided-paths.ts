import { getEpisodeDisplayTitle, getShowDisplayLabel } from "@/lib/display";
import type { TopicPackEpisodeSlot } from "@/lib/topic-packs";
import { resolveSectionEpisodes } from "@/lib/topic-pack-resolve";
import { getTopicDefinition } from "@/lib/topics";
import type { EpisodeWithShow } from "@/lib/types";

export type GuidedPathDefinition = {
  slug: string;
  /** Episode pool: tag on episodes used to resolve ordered slots. */
  topicSlug: string;
  /** Override page title; default is topic hub label. */
  titleOverride?: string;
  orderedSlots: TopicPackEpisodeSlot[];
};

export const GUIDED_PATH_DEFINITIONS: Record<string, GuidedPathDefinition> = {
  anxiety: {
    slug: "anxiety",
    topicSlug: "anxiety-and-trust",
    orderedSlots: [
      { title: "When worry runs ahead of you", matchTerms: ["worry", "anxiety"] },
      { title: "Fear answered with truth", matchTerms: ["fear", "afraid"] },
      { title: "Peace that holds", matchTerms: ["peace", "cast"] },
      { title: "Trust beyond what you can see", matchTerms: ["trust", "faithful"] },
    ],
  },
  suffering: {
    slug: "suffering",
    topicSlug: "suffering",
    orderedSlots: [
      { title: "Honest words for hard days", matchTerms: ["lament", "grief"] },
      { title: "God’s presence in pain", matchTerms: ["suffer", "comfort"] },
      { title: "Hope when answers are slow", matchTerms: ["hope", "promise"] },
      { title: "Perseverance with tenderness", matchTerms: ["persever", "endur"] },
    ],
  },
  identity: {
    slug: "identity",
    topicSlug: "identity-in-christ",
    orderedSlots: [
      { title: "Chosen and loved", matchTerms: ["chosen", "elect"] },
      { title: "A new name, a firm place", matchTerms: ["identity", "child"] },
      { title: "Union with Christ", matchTerms: ["union", "christ"] },
      { title: "Living from grace, not performance", matchTerms: ["grace", "adopt"] },
    ],
  },
  forgiveness: {
    slug: "forgiveness",
    topicSlug: "forgiveness",
    orderedSlots: [
      { title: "The heart of pardon", matchTerms: ["forgiv", "mercy"] },
      { title: "Reconciliation that heals", matchTerms: ["reconcil", "peace"] },
      { title: "Extending what we’ve received", matchTerms: ["neighbor", "love"] },
      { title: "Freedom from bitterness", matchTerms: ["bitter", "resent"] },
    ],
  },
  "knowing-god": {
    slug: "knowing-god",
    topicSlug: "knowing-god",
    orderedSlots: [
      { title: "Who God is", matchTerms: ["attributes", "character"] },
      { title: "His word and his works", matchTerms: ["scripture", "revelation"] },
      { title: "Drawing near in prayer", matchTerms: ["prayer", "seek"] },
      { title: "Delight in the Lord", matchTerms: ["know", "delight"] },
    ],
  },
};

export function getGuidedPathDefinition(slug: string): GuidedPathDefinition | null {
  const key = slug.trim().toLowerCase();
  return GUIDED_PATH_DEFINITIONS[key] ?? null;
}

export function getAllGuidedPathSlugs(): string[] {
  return Object.keys(GUIDED_PATH_DEFINITIONS);
}

export function getGuidedPathDisplayTitle(def: GuidedPathDefinition): string {
  if (def.titleOverride?.trim()) return def.titleOverride.trim();
  const topic = getTopicDefinition(def.slug) ?? getTopicDefinition(def.topicSlug);
  return topic?.label ?? def.slug;
}

export type GuidedPathLessonItem = {
  episode: EpisodeWithShow | null;
  title: string;
};

export function resolveGuidedPathLessons(def: GuidedPathDefinition, pool: EpisodeWithShow[]): GuidedPathLessonItem[] {
  const used = new Set<string>();
  const resolved = resolveSectionEpisodes(def.orderedSlots, pool, used);
  const byId = new Map(pool.map((e) => [e.id, e]));
  return resolved.map((r) => {
    const ep = r.episodeId ? (byId.get(r.episodeId) ?? null) : null;
    if (ep) {
      const showLabel = getShowDisplayLabel(ep.show?.title, ep.show?.slug);
      return { episode: ep, title: getEpisodeDisplayTitle(ep, showLabel) };
    }
    return { episode: null, title: r.displayTitle };
  });
}
