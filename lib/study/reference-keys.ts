/**
 * Stable reference keys for Bible and study content (storage, APIs, URLs).
 *
 * Examples:
 * - verse:kjv:john:3:16
 * - chapter:kjv:psalms:23
 * - topic:anxiety
 * - lesson:peace-in-anxiety  (global lesson slug)
 * - lesson:anxiety:peace-in-anxiety (legacy compound form, still parsed)
 */

export type VerseRefParts = {
  translation: string;
  bookSlug: string;
  chapter: number;
  verse: number;
};

export type ParsedReferenceKey =
  | { kind: "verse"; translation: string; bookSlug: string; chapter: number; verse: number }
  | { kind: "chapter"; translation: string; bookSlug: string; chapter: number }
  | { kind: "topic"; slug: string }
  | { kind: "lesson"; lessonSlug: string; topicSlug?: string };

/** @deprecated Use createVerseReferenceKey */
export function verseRefKey(parts: VerseRefParts): string {
  return createVerseReferenceKey(parts);
}

export function createVerseReferenceKey(parts: VerseRefParts): string {
  const t = parts.translation.trim().toLowerCase();
  const b = parts.bookSlug.trim().toLowerCase().replace(/\s+/g, "-");
  return `verse:${t}:${b}:${parts.chapter}:${parts.verse}`;
}

/** @deprecated Use createChapterReferenceKey */
export function chapterRefKey(translation: string, bookSlug: string, chapter: number): string {
  return createChapterReferenceKey(translation, bookSlug, chapter);
}

export function createChapterReferenceKey(translation: string, bookSlug: string, chapter: number): string {
  const t = translation.trim().toLowerCase();
  const b = bookSlug.trim().toLowerCase().replace(/\s+/g, "-");
  return `chapter:${t}:${b}:${chapter}`;
}

/** @deprecated Use createTopicReferenceKey */
export function topicRefKey(topicSlug: string): string {
  return createTopicReferenceKey(topicSlug);
}

export function createTopicReferenceKey(topicSlug: string): string {
  return `topic:${topicSlug.trim().toLowerCase()}`;
}

/**
 * Preferred: single globally unique lesson slug (e.g. `anxiety--intro` or CMS slug).
 * @deprecated compound form — use createLessonReferenceKey(slug) only
 */
export function lessonRefKey(topicSlug: string, lessonSlug: string): string {
  return `lesson:${topicSlug.trim().toLowerCase()}:${lessonSlug.trim().toLowerCase()}`;
}

export function createLessonReferenceKey(lessonSlug: string): string {
  return `lesson:${lessonSlug.trim().toLowerCase()}`;
}

export function parseVerseRefKey(key: string): VerseRefParts | null {
  const m = /^verse:([^:]+):([^:]+):(\d+):(\d+)$/.exec(key.trim());
  if (!m) return null;
  return {
    translation: m[1]!,
    bookSlug: m[2]!,
    chapter: Number.parseInt(m[3]!, 10),
    verse: Number.parseInt(m[4]!, 10),
  };
}

export function parseReferenceKey(raw: string): ParsedReferenceKey | null {
  const key = raw.trim();
  if (!key) return null;

  const verse = /^verse:([^:]+):([^:]+):(\d+):(\d+)$/.exec(key);
  if (verse) {
    return {
      kind: "verse",
      translation: verse[1]!,
      bookSlug: verse[2]!,
      chapter: Number.parseInt(verse[3]!, 10),
      verse: Number.parseInt(verse[4]!, 10),
    };
  }

  const ch = /^chapter:([^:]+):([^:]+):(\d+)$/.exec(key);
  if (ch) {
    return {
      kind: "chapter",
      translation: ch[1]!,
      bookSlug: ch[2]!,
      chapter: Number.parseInt(ch[3]!, 10),
    };
  }

  const topic = /^topic:([^:]+)$/.exec(key);
  if (topic) {
    return { kind: "topic", slug: topic[1]! };
  }

  const lessonCompound = /^lesson:([^:]+):([^:]+)$/.exec(key);
  if (lessonCompound) {
    return { kind: "lesson", topicSlug: lessonCompound[1]!, lessonSlug: lessonCompound[2]! };
  }

  const lessonSingle = /^lesson:([^:]+)$/.exec(key);
  if (lessonSingle) {
    return { kind: "lesson", lessonSlug: lessonSingle[1]! };
  }

  return null;
}
