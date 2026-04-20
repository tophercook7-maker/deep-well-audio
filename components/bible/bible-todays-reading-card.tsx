"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { BookOpen, Flame, Headphones } from "lucide-react";
import { getTodaysDailyReading } from "@/lib/bible/daily-reading";
import {
  BIBLE_HABIT_UPDATED_EVENT,
  calendarDaysBetween,
  getBibleHabitState,
  getTodayLocalDateString,
  isTodayHabitComplete,
} from "@/lib/bible/daily-habit";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";

type Props = {
  /** When false, omit Read/Listen buttons (e.g. when a parent row provides shortcuts). */
  showActionButtons?: boolean;
};

function gentleInvitationLine(doneToday: boolean, lastCompletedDate: string | null): string {
  if (doneToday) {
    return "You spent time in the Word today.";
  }
  if (!lastCompletedDate) {
    return "A place to begin when you’re ready.";
  }
  const gap = calendarDaysBetween(lastCompletedDate, getTodayLocalDateString());
  if (gap >= 2) {
    return "Pick back up anytime — today’s chapter is here when you want it.";
  }
  return "Return when you’re ready — here’s a gentle next step.";
}

export function BibleTodaysReadingCard({ showActionButtons = true }: Props) {
  const [rhythmDays, setRhythmDays] = useState(0);
  const [doneToday, setDoneToday] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  const refresh = () => {
    const s = getBibleHabitState();
    setRhythmDays(s.currentStreak);
    setDoneToday(isTodayHabitComplete());
    setLastCompleted(s.lastCompletedDate);
  };

  useEffect(() => {
    refresh();
    window.addEventListener(BIBLE_HABIT_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(BIBLE_HABIT_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const today = getTodaysDailyReading();
  const readHref = bibleChapterPath("web", today.urlBook, today.chapter) as Route;
  const listenHref =
    `/bible/listen?book=${encodeURIComponent(today.bookId)}&chapter=${today.chapter}` as Route;

  const invitation = gentleInvitationLine(doneToday, lastCompleted);

  return (
    <section
      className="rounded-[1.35rem] border border-stone-700/45 bg-[rgba(8,11,18,0.72)] px-6 py-7 sm:px-8 sm:py-8"
      aria-labelledby="bible-todays-reading-title"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">Today&apos;s reading</p>
        <h2 id="bible-todays-reading-title" className="mt-3 font-serif text-2xl font-normal text-amber-50/95 sm:text-[1.65rem]">
          {today.referenceLabel}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{today.subtitle}</p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-500">{invitation}</p>

      {showActionButtons ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={readHref}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-line/50 bg-[rgba(9,12,18,0.6)] px-5 text-sm font-medium text-amber-100/90 transition-colors duration-200 ease-out hover:border-stone-600/60"
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
            Read ({studyTranslationShortLabel("web")})
          </Link>
          <Link
            href={listenHref}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-accent/90 px-5 text-sm font-medium text-slate-950 transition-opacity duration-200 ease-out hover:opacity-95"
          >
            <Headphones className="h-4 w-4 shrink-0" aria-hidden />
            Listen
          </Link>
        </div>
      ) : null}

      {rhythmDays > 0 ? (
        <p className="mt-6 border-t border-line/25 pt-4 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 shrink-0 text-amber-200/45" strokeWidth={1.75} aria-hidden />
            <span className="text-slate-500">
              {rhythmDays} day rhythm
              <span className="sr-only"> (consecutive days in Scripture)</span>
            </span>
          </span>
        </p>
      ) : null}
    </section>
  );
}
