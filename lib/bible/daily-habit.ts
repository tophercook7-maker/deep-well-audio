/**
 * v1 Bible habit: quiet “rhythm” + today completion in localStorage (upgrade to DB later).
 * Resets are silent—no failure state in UI.
 */

import { getTodaysDailyReading } from "@/lib/bible/daily-reading";

const PREFIX = "deep-well-bible-habit";
const STORAGE_KEY = `${PREFIX}:v1`;

export const BIBLE_HABIT_UPDATED_EVENT = "deep-well:bible-habit-updated";

export type BibleHabitState = {
  /** YYYY-MM-DD (local) of last day user completed daily reading */
  lastCompletedDate: string | null;
  currentStreak: number;
};

const DEFAULT_STATE: BibleHabitState = {
  lastCompletedDate: null,
  currentStreak: 0,
};

export function getTodayLocalDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** Whole calendar days between two YYYY-MM-DD strings (a before b). Returns 0 if same day. */
export function calendarDaysBetween(aYmd: string, bYmd: string): number {
  const a = parseYmd(aYmd);
  const b = parseYmd(bYmd);
  const diff = b.getTime() - a.getTime();
  return Math.round(diff / 86400000);
}

function readRaw(): BibleHabitState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const j = JSON.parse(raw) as Partial<BibleHabitState>;
    return {
      lastCompletedDate:
        typeof j.lastCompletedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.lastCompletedDate)
          ? j.lastCompletedDate
          : null,
      currentStreak:
        typeof j.currentStreak === "number" && j.currentStreak >= 0 && j.currentStreak < 100000
          ? Math.floor(j.currentStreak)
          : 0,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeState(next: BibleHabitState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(BIBLE_HABIT_UPDATED_EVENT));
  } catch {
    /* quota */
  }
}

/**
 * If last completion was 2+ calendar days ago, rhythm count resets quietly (show 0).
 */
export function normalizeHabitStreak(): BibleHabitState {
  const s = readRaw();
  const today = getTodayLocalDateString();
  if (!s.lastCompletedDate) return s;
  if (s.lastCompletedDate === today) return s;
  const gap = calendarDaysBetween(s.lastCompletedDate, today);
  if (gap >= 2) {
    const next = { ...s, currentStreak: 0 };
    writeState(next);
    return next;
  }
  return s;
}

export function getBibleHabitState(): BibleHabitState {
  return normalizeHabitStreak();
}

export function isTodayHabitComplete(): boolean {
  const s = getBibleHabitState();
  const today = getTodayLocalDateString();
  return s.lastCompletedDate === today;
}

/**
 * Record that the user completed today’s reading (once per local day).
 * Rhythm count: +1 if yesterday was completed; else starts again at 1 (no UI shame).
 */
export function recordDailyReadingComplete(): void {
  const today = getTodayLocalDateString();
  const s = readRaw();
  if (s.lastCompletedDate === today) return;

  const yesterday = addCalendarDays(today, -1);
  let nextStreak: number;
  if (s.lastCompletedDate === yesterday) {
    nextStreak = (s.currentStreak || 0) + 1;
  } else {
    nextStreak = 1;
  }

  writeState({
    lastCompletedDate: today,
    currentStreak: nextStreak,
  });
}

function addCalendarDays(ymd: string, delta: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + delta);
  return getTodayLocalDateString(d);
}

/**
 * When read/listen matches today’s planned chapter (see `getTodaysDailyReading`).
 * @returns true if today was newly marked complete (for a calm one-line acknowledgment).
 */
export function tryRecordHabitForDailyChapter(bookId: string, chapter: number, now = new Date()): boolean {
  const plan = getTodaysDailyReading(now);
  if (plan.bookId !== bookId || plan.chapter !== chapter) return false;
  const today = getTodayLocalDateString(now);
  const s = readRaw();
  if (s.lastCompletedDate === today) return false;
  recordDailyReadingComplete();
  return true;
}
