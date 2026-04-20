import { getTodaysBibleListenPick } from "@/lib/bible/daily-plan";
import { apiSlugToUrlBook } from "@/lib/bible/navigation-urls";
import { getBibleBookByApiId } from "@/lib/study/bible-books";

export type TodaysDailyReading = {
  /** API book id, e.g. JHN */
  bookId: string;
  /** URL segment for `/bible/[t]/[book]/[ch]` */
  urlBook: string;
  chapter: number;
  /** e.g. "John 14" */
  referenceLabel: string;
  /** Short book label for display */
  bookLabel: string;
  /** Card heading */
  cardTitle: string;
  /** Supporting line under the reference */
  subtitle: string;
};

/**
 * Linear daily plan (v1): Gospel of John, one chapter per calendar day, cycling 1–21.
 * Same calendar logic as `getTodaysBibleListenPick` in `daily-plan.ts`.
 */
export function getTodaysDailyReading(now = new Date()): TodaysDailyReading {
  const pick = getTodaysBibleListenPick(now);
  const book = getBibleBookByApiId(pick.bookId);
  if (!book) {
    throw new Error("Daily reading: John not found in canon.");
  }
  const urlBook = apiSlugToUrlBook(book.apiSlug);
  return {
    bookId: pick.bookId,
    urlBook,
    chapter: pick.chapter,
    referenceLabel: pick.referenceLabel,
    bookLabel: book.label,
    cardTitle: "Today's Reading",
    /** Invitation, not a checklist */
    subtitle: "Through John’s Gospel — one chapter at a time, at your pace",
  };
}
