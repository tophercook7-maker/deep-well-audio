import { isStudyTranslationId } from "@/lib/study/bible-api";
import { getBibleBookByApiId } from "@/lib/study/bible-books";
import { parsePassageFromParts, parseVerseContentKey } from "@/lib/study/refs";

/** Fields needed to resolve a bible-api query for preview text. */
export type PassagePreviewRowInput = {
  book_id: string;
  chapter: number;
  verse_from: number;
  verse_to: number;
  translation_id: string;
  entry_kind?: "verse" | "reader" | null;
};

export function passagePreviewKey(q: string, translationId: string): string {
  return `${q.trim()}###${translationId}`;
}

export function passagePreviewArgsForSavedVerse(row: PassagePreviewRowInput): { q: string; t: string } | null {
  const book = getBibleBookByApiId(row.book_id);
  if (!book) return null;
  const t = isStudyTranslationId(row.translation_id) ? row.translation_id : "web";
  if (row.entry_kind === "reader") {
    return { q: `${book.apiSlug}+${row.chapter}`, t };
  }
  const passage = parsePassageFromParts(book, row.chapter, row.verse_from, row.verse_to);
  if (!passage) return null;
  return { q: passage.apiQuery, t };
}

export function passagePreviewArgsFromVerseContentKey(contentKey: string): { q: string; t: string } | null {
  const hit = parseVerseContentKey(contentKey);
  if (!hit) return null;
  const t = isStudyTranslationId(hit.translationId) ? hit.translationId : "web";
  return { q: hit.passage.apiQuery, t };
}

/** Single-line style excerpt for dashboard rows (no newlines). */
export function collapsePassagePreviewText(raw: string, maxChars = 128): string {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars - 1).trimEnd();
  const end = cut.replace(/[,;:]\s*$/, "").trimEnd();
  return `${end}…`;
}
