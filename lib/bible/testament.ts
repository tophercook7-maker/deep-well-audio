import { BIBLE_CANONICAL_BOOK_IDS } from "@/lib/bible/chapter-counts";
import { getCanonicalBibleBooks } from "@/lib/bible/canonical-books";
import type { BibleBookDef } from "@/lib/study/bible-books";

/** Index of Matthew — first New Testament book in canonical order. */
export const BIBLE_NT_START_INDEX = Math.max(0, BIBLE_CANONICAL_BOOK_IDS.indexOf("MAT"));

export function getOldTestamentBooks(): BibleBookDef[] {
  const all = getCanonicalBibleBooks();
  const i = BIBLE_NT_START_INDEX > 0 ? BIBLE_NT_START_INDEX : all.length;
  return all.slice(0, i);
}

export function getNewTestamentBooks(): BibleBookDef[] {
  const all = getCanonicalBibleBooks();
  const i = BIBLE_NT_START_INDEX > 0 ? BIBLE_NT_START_INDEX : all.length;
  return all.slice(i);
}
