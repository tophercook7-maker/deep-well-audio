"use client";

import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Headphones, ScrollText, Search } from "lucide-react";
import { getTodaysDailyReading } from "@/lib/bible/daily-reading";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";

type Props = {
  /** Home: thumb-first row; hub: slightly denser strip under today’s card */
  variant?: "home" | "hub";
  /** Show link to Scripture search */
  showFindPassage?: boolean;
};

export function BibleDailyQuickActions({ variant = "home", showFindPassage = false }: Props) {
  const today = getTodaysDailyReading();
  const readTodayHref = bibleChapterPath("web", today.urlBook, today.chapter) as Route;
  const listenTodayHref =
    `/bible/listen?book=${encodeURIComponent(today.bookId)}&chapter=${today.chapter}` as Route;

  const isHome = variant === "home";

  return (
    <nav
      aria-label="Bible shortcuts"
      className={
        isHome
          ? "flex flex-col gap-3 border-t border-line/35 pt-5 sm:flex-row sm:flex-wrap sm:items-center"
          : "flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
      }
    >
      <div className="flex min-h-[48px] flex-1 flex-wrap gap-2 sm:min-w-0 sm:flex-[1_1_auto]">
        <Link
          href={readTodayHref}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-stone-600/55 bg-[rgba(9,12,18,0.45)] px-4 text-sm font-medium text-amber-100/90 transition-colors duration-200 ease-out hover:border-stone-500/70 sm:flex-initial sm:px-5"
        >
          <BookOpen className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Read
        </Link>
        <Link
          href={listenTodayHref}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent/88 px-4 text-sm font-medium text-slate-950 transition-opacity duration-200 ease-out hover:opacity-90 sm:flex-initial sm:px-5"
        >
          <Headphones className="h-4 w-4 shrink-0" aria-hidden />
          Listen
        </Link>
      </div>
      <div
        className={
          isHome
            ? "flex min-h-[48px] flex-wrap gap-2 border-line/25 sm:border-l sm:pl-3 sm:pt-0"
            : "flex min-h-[48px] flex-wrap gap-2 sm:gap-2.5"
        }
      >
        <Link
          href={"/bible" as Route}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-line/55 bg-[rgba(9,12,18,0.45)] px-4 text-sm font-medium text-amber-100/90 transition hover:border-accent/30 sm:flex-initial sm:min-w-[8.5rem]"
        >
          Open Bible
        </Link>
        <Link
          href={"/studies" as Route}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-line/55 bg-[rgba(9,12,18,0.45)] px-4 text-sm font-medium text-amber-100/90 transition hover:border-accent/30 sm:flex-initial sm:min-w-[8.5rem]"
        >
          <ScrollText className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Studies
        </Link>
        {showFindPassage ? (
          <Link
            href={"/bible/search" as Route}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-line/45 bg-[rgba(9,12,18,0.35)] px-4 text-sm font-medium text-slate-300/95 transition hover:border-accent/25 sm:flex-initial"
          >
            <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Find a passage
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
