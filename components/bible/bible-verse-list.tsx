"use client";

import type { BibleApiVerse } from "@/lib/study/bible-api";
import { Highlighter, StickyNote } from "lucide-react";

/** Highlight chips tuned for the warm paper reading surface (opaque, readable). */
function highlightClass(c: string): string {
  switch (c) {
    case "yellow":
      return "bg-amber-100/95 border-amber-300/90";
    case "green":
      return "bg-emerald-50 border-emerald-300/80";
    case "blue":
      return "bg-sky-50 border-sky-300/80";
    case "pink":
      return "bg-rose-50 border-rose-300/75";
    case "purple":
      return "bg-violet-50 border-violet-300/80";
    case "orange":
      return "bg-orange-50 border-orange-300/80";
    default:
      return "bg-stone-100 border-stone-300/80";
  }
}

type Props = {
  verses: BibleApiVerse[];
  selectedVerse: number | null;
  hlByVerse: Record<number, string>;
  hasNote: (verse: number) => boolean;
  onSelectVerse: (verse: number) => void;
};

export function BibleVerseList({ verses, selectedVerse, hlByVerse, hasNote, onSelectVerse }: Props) {
  return (
    <div className="mx-auto w-full max-w-none space-y-5 md:space-y-6">
      {verses.map((v) => {
        const active = selectedVerse === v.verse;
        const hl = hlByVerse[v.verse];
        const note = hasNote(v.verse);
        return (
          <div
            key={`${v.book_id}-${v.chapter}-${v.verse}`}
            className={[
              "flex gap-3 rounded-r-lg border-l-[3px] py-1 pl-3 pr-2 transition-colors md:gap-4 md:pl-4",
              hl ? highlightClass(hl) : "border-transparent",
              active
                ? "border-l-amber-700 bg-amber-50/95 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.12)]"
                : "hover:bg-stone-100/90 hover:border-l-stone-300/80",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => onSelectVerse(v.verse)}
              className="mt-0.5 w-7 shrink-0 select-none text-left font-serif text-[0.68rem] font-medium tabular-nums leading-none text-stone-500 hover:text-stone-800 md:w-8 md:text-[0.75rem]"
              aria-current={active ? "true" : undefined}
            >
              {v.verse}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[1.0625rem] font-normal leading-[1.82] tracking-[0.01em] text-stone-950 md:text-[1.125rem] md:leading-[1.88]">
                {v.text}
              </p>
              {(hl || note) && (
                <div className="mt-2 flex items-center gap-2 text-stone-600">
                  {hl ? <Highlighter className="h-3.5 w-3.5 text-stone-500" aria-hidden /> : null}
                  {note ? <StickyNote className="h-3.5 w-3.5 text-stone-500" aria-hidden /> : null}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
