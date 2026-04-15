import type { ParsedPassage } from "@/lib/study/refs";

/**
 * Future: saved verse highlights in Study. Keep anchors aligned with `ParsedPassage.verseKey`
 * and translation id so server rows and UI can sync without reshaping `ParsedPassage`.
 *
 * Surfaces already expose stable hooks: `data-study-verse-key` / `data-study-translation` on the
 * verse drawer passage block, `data-study-reader-surface` on the reader scroller, and per-line
 * keys on reader verse buttons—enough to layer highlights later without restructuring layout.
 */
export type StudyVerseHighlightAnchorV0 = {
  version: 0;
  verseKey: ParsedPassage["verseKey"];
  translationId: string;
  /** Optional word index within the rendered verse string (future) */
  wordIndex?: number;
};

export type StudyVerseHighlightPlanV0 = {
  version: 0;
  items: StudyVerseHighlightAnchorV0[];
};
