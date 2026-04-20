"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { ContinueListeningCard } from "@/components/bible/continue-listening-card";
import { getTodaysDailyReading } from "@/lib/bible/daily-reading";
import { BIBLE_LISTEN_PREFS_UPDATED_EVENT, readBibleContinueListeningSnapshot } from "@/lib/bible/listen-preferences";

const QUICK = [
  { label: "John", bookId: "JHN" as const, chapter: 1 },
  { label: "Psalms", bookId: "PSA" as const, chapter: 1 },
  { label: "Proverbs", bookId: "PRO" as const, chapter: 1 },
  { label: "Romans", bookId: "ROM" as const, chapter: 1 },
];

type SectionProps = {
  /** When false, omit the resume card (e.g. already shown above on the Bible hub). */
  showContinueCard?: boolean;
};

export function BibleListeningHomeSection({ showContinueCard = true }: SectionProps) {
  const [canResume, setCanResume] = useState(() =>
    typeof window !== "undefined" ? readBibleContinueListeningSnapshot().canResume : false,
  );

  useEffect(() => {
    const refresh = () => setCanResume(readBibleContinueListeningSnapshot().canResume);
    refresh();
    window.addEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const today = getTodaysDailyReading();
  const listenToday =
    `/bible/listen?book=${encodeURIComponent(today.bookId)}&chapter=${today.chapter}` as Route;

  const resumeHref = useMemo(() => {
    if (typeof window === "undefined") return listenToday;
    const s = readBibleContinueListeningSnapshot();
    if (canResume && s.canResume) {
      return `/bible/listen?book=${encodeURIComponent(s.bookId)}&chapter=${s.chapter}` as Route;
    }
    return listenToday;
  }, [canResume, listenToday]);

  return (
    <section
      className="rounded-2xl border border-stone-800/45 bg-[rgba(7,10,16,0.42)] px-6 py-8 sm:px-8"
      aria-labelledby="bible-daily-listening-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Listen</p>
          <h2 id="bible-daily-listening-heading" className="mt-2 font-serif text-xl text-white sm:text-2xl">
            By book or chapter
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-400/95">
            Choose a book below or open the full listen experience—your place on this device is remembered.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {showContinueCard ? <ContinueListeningCard /> : null}

        <div>
          <p className="text-xs font-medium text-slate-500">Jump in</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={resumeHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-slate-950 hover:opacity-95"
            >
              {canResume ? "Continue listening" : "Today’s chapter"}
            </Link>
            {QUICK.map((q) => (
              <Link
                key={q.bookId}
                href={`/bible/listen?book=${q.bookId}&chapter=${q.chapter}` as Route}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-line/55 px-4 text-sm font-medium text-amber-100/90 hover:border-accent/35"
              >
                {q.label}
              </Link>
            ))}
            <Link
              href={"/bible/listen" as Route}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-line/40 px-4 text-sm font-medium text-slate-400/95 transition hover:border-accent/25 hover:text-amber-100/90"
            >
              Full listen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
