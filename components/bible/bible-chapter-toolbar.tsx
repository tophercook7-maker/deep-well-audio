"use client";

import Link from "next/link";
import type { Route } from "next";
import { BookMarked, ChevronLeft, ChevronRight, Headphones, Library } from "lucide-react";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { STUDY_TRANSLATIONS, studyTranslationShortLabel } from "@/lib/study/bible-api";

type Props = {
  chapter: number;
  translation: StudyTranslationId;
  onTranslationChange: (t: StudyTranslationId) => void;
  prevHref: Route | null;
  nextHref: Route | null;
  listenHref: Route;
  onOpenBookPicker: () => void;
  onOpenChapterPicker: () => void;
};

const btnBase =
  "inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium transition";
const btnActive = `${btnBase} border-stone-600 bg-stone-950 text-stone-100 shadow-sm hover:border-stone-500 hover:bg-stone-900`;
const btnDisabled = `${btnBase} cursor-not-allowed border-stone-800 bg-stone-950/80 text-stone-600`;

export function BibleChapterToolbar({
  chapter,
  translation,
  onTranslationChange,
  prevHref,
  nextHref,
  listenHref,
  onOpenBookPicker,
  onOpenChapterPicker,
}: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-700/60 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        {prevHref ? (
          <Link href={prevHref} className={btnActive}>
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            Previous
          </Link>
        ) : (
          <span className={btnDisabled}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </span>
        )}
        {nextHref ? (
          <Link href={nextHref} className={btnActive}>
            Next
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        ) : (
          <span className={btnDisabled}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        )}
        <button type="button" onClick={onOpenBookPicker} className={`${btnActive} gap-2 px-4`}>
          <Library className="h-4 w-4 text-amber-300" aria-hidden />
          Book
        </button>
        <button type="button" onClick={onOpenChapterPicker} className={`${btnActive} gap-2 px-4`}>
          <BookMarked className="h-4 w-4 text-amber-300" aria-hidden />
          Chapter {chapter}
        </button>
        <Link
          href={listenHref}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 shadow-sm transition hover:border-amber-400/60 hover:bg-amber-500/25"
        >
          <Headphones className="h-4 w-4 shrink-0 text-amber-200" aria-hidden />
          Listen
        </Link>
      </div>
      <label className="flex max-w-xs flex-col gap-1.5 text-xs font-medium text-stone-400">
        Translation
        <select
          className="min-h-[44px] rounded-xl border border-stone-600 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 shadow-inner outline-none ring-0 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          value={translation}
          onChange={(e) => onTranslationChange(e.target.value as StudyTranslationId)}
        >
          {STUDY_TRANSLATIONS.map((t) => (
            <option key={t.id} value={t.id} className="bg-stone-950">
              {t.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] font-normal text-stone-500">
          Currently reading · {studyTranslationShortLabel(translation)}
        </span>
      </label>
    </div>
  );
}
