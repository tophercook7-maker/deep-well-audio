import { getBibleBookByApiId } from "@/lib/study/bible-books";

/** Local-midnight day index (stable per calendar day in the user’s timezone). */
function localDayIndex(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

const PLAN_ANCHOR_DAY = localDayIndex(new Date(2026, 0, 1));
const JOHN_CHAPTERS = 21;

export type DailyBibleListenPick = {
  bookId: "JHN";
  chapter: number;
  /** e.g. "John 14" */
  referenceLabel: string;
  /** 0-based day offset from anchor */
  dayOffset: number;
};

/**
 * Light daily plan: one chapter of John per calendar day, cycling John 1–21.
 * Same chapter for everyone on a given local date (anchor-based offset).
 */
export function getTodaysBibleListenPick(now = new Date()): DailyBibleListenPick {
  const dayOffset = localDayIndex(now) - PLAN_ANCHOR_DAY;
  const chapter = ((((dayOffset % JOHN_CHAPTERS) + JOHN_CHAPTERS) % JOHN_CHAPTERS) + 1) as number;
  const book = getBibleBookByApiId("JHN")!;
  return {
    bookId: "JHN",
    chapter,
    referenceLabel: `${book.label} ${chapter}`,
    dayOffset,
  };
}
