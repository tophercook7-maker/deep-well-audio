import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";
import { resolveBookFromMatch, scriptureTagVerseAnchoredRegex } from "@/lib/study/bible-books";
import { isStudyTranslationId, type StudyTranslationId } from "@/lib/study/bible-api";

/**
 * Turn a single-line reference like "John 3:16" or "Philippians 4:6–7" into a reader URL with verse hash.
 * Returns null if the string does not match one anchored reference.
 */
export function parseScriptureRefToBibleHref(
  ref: string,
  translation: string = "web",
): string | null {
  const trimmed = ref.trim();
  if (!trimmed) return null;
  const m = scriptureTagVerseAnchoredRegex().exec(trimmed);
  if (!m) return null;
  const bookPart = m[1];
  const chapter = Number.parseInt(m[2]!, 10);
  const verse = Number.parseInt(m[3]!, 10);
  const book = resolveBookFromMatch(bookPart!);
  if (!book || !Number.isFinite(chapter) || !Number.isFinite(verse) || chapter < 1 || verse < 1) {
    return null;
  }
  const t = isStudyTranslationId(translation) ? translation : ("web" as StudyTranslationId);
  const urlBook = apiSlugToUrlBook(book.apiSlug);
  return `${bibleChapterPath(t, urlBook, chapter)}#${verse}`;
}
