import type { EpisodeWithShow } from "@/lib/types";
import type { TopicPackDefinition, TopicPackEpisodeSlot, TopicPackSectionDef } from "@/lib/topic-packs";

export type ResolvedPackEpisode = {
  displayTitle: string;
  episodeId?: string;
};

export type ResolvedTopicPackSection = {
  id: string;
  title: string;
  description: string;
  episodes: ResolvedPackEpisode[];
};

function lc(s: string) {
  return s.toLowerCase();
}

/** Pick catalog episodes for each slot; each episode used at most once. */
export function resolveSectionEpisodes(slots: TopicPackEpisodeSlot[], pool: EpisodeWithShow[], used: Set<string>): ResolvedPackEpisode[] {
  return slots.map((slot) => {
    if (slot.episodeId) {
      used.add(slot.episodeId);
      return { displayTitle: slot.title, episodeId: slot.episodeId };
    }
    const terms = (slot.matchTerms?.length ? slot.matchTerms : [slot.title]).map(lc);
    const hit =
      pool.find((ep) => !used.has(ep.id) && terms.some((term) => lc(ep.title).includes(term))) ?? undefined;
    if (hit) {
      used.add(hit.id);
      return { displayTitle: slot.title, episodeId: hit.id };
    }
    return { displayTitle: slot.title };
  });
}

/** Resolve all sections for a pack that defines `sections`, using the topic episode pool. */
export function resolveTopicPackSections(pack: TopicPackDefinition, pool: EpisodeWithShow[]): ResolvedTopicPackSection[] | null {
  if (!pack.sections?.length) return null;
  const used = new Set<string>();
  return pack.sections.map((section: TopicPackSectionDef) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    episodes: resolveSectionEpisodes(section.episodes, pool, used),
  }));
}
