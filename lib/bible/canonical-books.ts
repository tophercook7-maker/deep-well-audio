import { BIBLE_CANONICAL_BOOK_IDS } from "@/lib/bible/chapter-counts";
import { BIBLE_BOOKS, getBibleBookByApiId, type BibleBookDef } from "@/lib/study/bible-books";

/** All 66 books in traditional order for navigation pickers. */
export function getCanonicalBibleBooks(): BibleBookDef[] {
  const out: BibleBookDef[] = [];
  for (const id of BIBLE_CANONICAL_BOOK_IDS) {
    const b = getBibleBookByApiId(id);
    if (b) out.push(b);
  }
  return out;
}

export function getDefaultBibleBook(): BibleBookDef {
  return BIBLE_BOOKS.find((b) => b.apiBookId === "JHN") ?? BIBLE_BOOKS[0]!;
}
