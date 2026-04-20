import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import type { StudyTranslationId } from "@/lib/study/bible-api";

/** Next chapter in canon (same book) or null. Caller supplies max chapter for book. */
export function nextChapterInBookPath(
  translation: StudyTranslationId,
  urlBook: string,
  chapter: number,
  maxChapter: number,
): string | null {
  if (chapter < maxChapter) return bibleChapterPath(translation, urlBook, chapter + 1);
  return null;
}

export function listenChapterHref(bookApiId: string, chapter: number, verse?: number): string {
  const sp = new URLSearchParams();
  sp.set("book", bookApiId);
  sp.set("chapter", String(chapter));
  if (verse != null) sp.set("verse", String(verse));
  return `/bible/listen?${sp.toString()}`;
}
