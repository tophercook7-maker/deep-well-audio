import type { StudyTopicSlug } from "@/lib/study/catalog";
import type { StudyTopic } from "@/lib/study/types";
import { TOPIC_ENGINE_BY_SLUG } from "@/lib/studies/topic-registry";
import type { TopicEngineRecord } from "@/lib/studies/topic-types";

export function getTopicEngine(slug: string): TopicEngineRecord | null {
  const s = slug as StudyTopicSlug;
  return TOPIC_ENGINE_BY_SLUG[s] ?? null;
}

/** Curated related topics for discovery (falls back to catalog `relatedTopics` if needed). */
export function getCuratedRelatedTopicSlugs(topic: StudyTopic): string[] {
  const e = getTopicEngine(topic.slug);
  if (e?.relatedTopicSlugs?.length) return e.relatedTopicSlugs;
  return topic.relatedTopics;
}

export function getTopicSearchAliases(topic: StudyTopic): string[] {
  return getTopicEngine(topic.slug)?.searchAliases ?? [];
}

export function getTopicChapterTiers(slug: string) {
  return getTopicEngine(slug)?.chapterTiers ?? null;
}

export function getTopicQuickHelp(slug: string) {
  return getTopicEngine(slug)?.quickHelp ?? null;
}

export function getKeyRefSnippet(slug: string, refLine: string): string | undefined {
  const snippets = getTopicEngine(slug)?.keyRefSnippets;
  return snippets?.[refLine];
}

export function getFeaturedTopicSlugs(): string[] {
  return Object.values(TOPIC_ENGINE_BY_SLUG as Record<string, TopicEngineRecord>)
    .filter((r) => r.featured)
    .map((r) => r.slug);
}

export function getRecentlyExpandedTopicSlugs(): string[] {
  return Object.values(TOPIC_ENGINE_BY_SLUG as Record<string, TopicEngineRecord>)
    .filter((r) => r.recentlyExpanded)
    .map((r) => r.slug);
}

export function getQuickHelpHighlightSlugs(): string[] {
  return Object.values(TOPIC_ENGINE_BY_SLUG as Record<string, TopicEngineRecord>)
    .filter((r) => r.quickHelpHighlight)
    .map((r) => r.slug);
}
