import { getStudyTopic } from "@/lib/study";
import { CROSS_CHAPTER_RELATED, TOPIC_ENGINE_BY_SLUG } from "@/lib/studies/topic-registry";
import type { TopicChapterCard } from "@/lib/studies/topic-types";

export type ChapterTopicHint = { slug: string; label: string };

export type RelatedChapterLink = TopicChapterCard;

export function chapterTopicHintsKey(urlBook: string, chapter: number): string {
  return `${urlBook.toLowerCase()}:${chapter}`;
}

function addHint(map: Map<string, ChapterTopicHint[]>, urlBook: string, chapter: number, slug: string, label: string) {
  const key = chapterTopicHintsKey(urlBook, chapter);
  const prev = map.get(key) ?? [];
  if (prev.some((h) => h.slug === slug)) return;
  prev.push({ slug, label });
  map.set(key, prev);
}

function walkTier(map: Map<string, ChapterTopicHint[]>, slug: string, label: string, cards: TopicChapterCard[]) {
  for (const c of cards) {
    addHint(map, c.urlBook, c.chapter, slug, label);
  }
}

function buildChapterTopicHintMap(): Map<string, ChapterTopicHint[]> {
  const map = new Map<string, ChapterTopicHint[]>();
  for (const record of Object.values(TOPIC_ENGINE_BY_SLUG)) {
    const label = getStudyTopic(record.slug)?.title ?? record.slug;
    walkTier(map, record.slug, label, record.chapterTiers.primary);
    walkTier(map, record.slug, label, record.chapterTiers.supporting);
    walkTier(map, record.slug, label, record.chapterTiers.relatedPassages);
  }
  for (const [k, hints] of map) {
    hints.sort((a, b) => a.label.localeCompare(b.label));
    map.set(k, hints);
  }
  return map;
}

const CHAPTER_TOPIC_HINT_MAP = buildChapterTopicHintMap();

export function topicHintsForChapter(urlBook: string, chapter: number): ChapterTopicHint[] {
  return CHAPTER_TOPIC_HINT_MAP.get(chapterTopicHintsKey(urlBook, chapter)) ?? [];
}

export function relatedChaptersForChapter(urlBook: string, chapter: number): RelatedChapterLink[] {
  return CROSS_CHAPTER_RELATED[chapterTopicHintsKey(urlBook, chapter)] ?? [];
}

/** Topics that reference a given chapter anywhere in their tier lists (for diagnostics / future APIs). */
export function topicSlugsLinkingToChapter(urlBook: string, chapter: number): string[] {
  const key = chapterTopicHintsKey(urlBook, chapter);
  const hints = CHAPTER_TOPIC_HINT_MAP.get(key) ?? [];
  return hints.map((h) => h.slug);
}
