import { BIBLE_BOOKS, getBibleBookByApiId } from "@/lib/study/bible-books";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { isStudyTranslationId } from "@/lib/study/bible-api";

/** URL uses hyphens; bible-api uses `+` between words. */
export function apiSlugToUrlBook(slug: string): string {
  return slug.replace(/\+/g, "-");
}

export function urlBookToApiSlug(urlBook: string): string {
  return urlBook.trim().replace(/-/g, "+");
}

export function bibleChapterPath(translation: string, urlBook: string, chapter: number): string {
  const t = isStudyTranslationId(translation) ? translation : "web";
  const b = encodeURIComponent(urlBook.toLowerCase());
  return `/bible/${t}/${b}/${chapter}`;
}

/** Build bible-api.com query for a full chapter: `john+3`. */
export function chapterApiQuery(urlBook: string, chapter: number): string {
  const apiSlug = urlBookToApiSlug(urlBook);
  return `${apiSlug}+${chapter}`;
}

export function resolveBookFromUrlSegment(urlBook: string) {
  const apiSlug = urlBookToApiSlug(decodeURIComponent(urlBook));
  return BIBLE_BOOKS.find((b) => b.apiSlug.toLowerCase() === apiSlug.toLowerCase()) ?? null;
}

export function bookLabelFromUrlBook(urlBook: string): string | null {
  const b = resolveBookFromUrlSegment(urlBook);
  return b?.label ?? null;
}

export function assertTranslation(t: string): StudyTranslationId {
  return isStudyTranslationId(t) ? t : "web";
}
