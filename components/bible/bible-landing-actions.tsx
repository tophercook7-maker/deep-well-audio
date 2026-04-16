"use client";

import Link from "next/link";
import type { Route } from "next";
import { BookMarked, BookOpen, Search } from "lucide-react";
import { useStudy } from "@/components/study/study-provider";
import { getBibleBookByApiId } from "@/lib/study/bible-books";
import { parsePassageFromParts } from "@/lib/study/refs";

type Props = {
  savedPassagesHref: string;
  savedPassagesLabel: string;
};

export function BibleLandingActions({ savedPassagesHref, savedPassagesLabel }: Props) {
  const { openReaderQuery, openVerse } = useStudy();

  const openSampleChapter = () => {
    openReaderQuery("psalms+1", { readingMode: "chapter", title: "Psalm 1" });
  };

  const openSampleVerse = () => {
    const book = getBibleBookByApiId("JHN");
    if (!book) return;
    const passage = parsePassageFromParts(book, 3, 16);
    if (!passage) return;
    openVerse(passage, { teachingKey: null });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/[0.1] text-sky-100">
          <BookOpen className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Read Scripture</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Open the chapter reader with translation controls—calm, full-width reading without leaving Deep Well.
        </p>
        <button
          type="button"
          onClick={openSampleChapter}
          className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
        >
          Open Psalm 1
        </button>
      </div>

      <div className="flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Search className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Study tools</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Verse lookup, translation compare, notes, and saves—start from a familiar passage to see the drawer.
        </p>
        <button
          type="button"
          onClick={openSampleVerse}
          className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
        >
          Open John 3:16
        </button>
      </div>

      <div className="flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-7 sm:col-span-2 lg:col-span-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[rgba(12,16,24,0.5)] text-slate-200">
          <BookMarked className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Saved passages &amp; notes</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Your private list and verse-linked notes live on your Library and Dashboard. Jump there when you want continuity, not a new reading session.
        </p>
        <Link
          href={savedPassagesHref as Route}
          className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
        >
          {savedPassagesLabel}
        </Link>
      </div>
    </div>
  );
}
