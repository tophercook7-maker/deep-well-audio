import { BIBLE_BOOKS, getBibleBookByApiId, type BibleBookDef } from "@/lib/study/bible-books";

/**
 * Resolve `book` from API / client: api book id (e.g. JHN), or bible-api slug form (john, 1+john, 1-john).
 */
export function resolveBibleBookFromClientParam(book: string): BibleBookDef | null {
  const raw = book.trim();
  if (!raw) return null;

  const byId = getBibleBookByApiId(raw) ?? getBibleBookByApiId(raw.toUpperCase());
  if (byId) return byId;

  const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rawC = compact(raw);

  for (const b of BIBLE_BOOKS) {
    if (b.apiBookId.toLowerCase() === raw.toLowerCase()) return b;
    if (compact(b.apiSlug) === rawC) return b;
    if (b.apiSlug.replace(/\+/g, "-").toLowerCase() === raw.toLowerCase()) return b;
  }

  return null;
}

/** Storage + DB segment: hyphenated lowercase (e.g. 1-john, psalms, song-of-songs). */
export function bibleAudioBookSlug(book: BibleBookDef): string {
  return book.apiSlug.replace(/\+/g, "-").toLowerCase();
}
