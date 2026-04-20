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
  "inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ease-out";
const btnActive = `${btnBase} border-stone-600/70 bg-stone-950/95 text-stone-200 hover:border-stone-500/80 hover:bg-stone-900`;
const btnDisabled = `${btnBase} cursor-not-allowed border-stone-800/80 bg-stone-950/70 text-stone-600`;

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
    <div className="flex flex-col gap-5 border-b border-stone-700/40 pb-6">
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
          <Library className="h-4 w-4 text-stone-400" aria-hidden />
          Book
        </button>
        <button type="button" onClick={onOpenChapterPicker} className={`${btnActive} gap-2 px-4`}>
          <BookMarked className="h-4 w-4 text-stone-400" aria-hidden />
          Chapter {chapter}
        </button>
        <Link
          href={listenHref}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-stone-600/60 bg-stone-900/90 px-4 py-2 text-sm font-medium text-stone-200 transition-colors duration-200 ease-out hover:border-stone-500/70 hover:bg-stone-900"
        >
          <Headphones className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
          Listen
        </Link>
      </div>
      <label className="flex max-w-xs flex-col gap-1.5 text-xs font-medium text-stone-500">
        Translation
        <select
          className="min-h-[44px] rounded-xl border border-stone-600/70 bg-stone-950 px-3 py-2.5 text-sm text-stone-200 outline-none transition-colors duration-200 focus:border-stone-500 focus:ring-1 focus:ring-stone-600/40"
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
          Reading · {studyTranslationShortLabel(translation)}
        </span>
      </label>
    </div>
  );
}
