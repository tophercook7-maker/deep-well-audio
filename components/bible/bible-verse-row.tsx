"use client";

import type { BibleApiVerse } from "@/lib/study/bible-api";
import { Highlighter, StickyNote } from "lucide-react";

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

export type BibleVerseRowProps = {
  verse: BibleApiVerse;
  selectedVerse: number | null;
  /** Verse estimated from playback position (listen mode). */
  playingVerse: number | null;
  followAlongEnabled: boolean;
  hlByVerse: Record<number, string>;
  hasNote: (verse: number) => boolean;
  onSelectVerse: (verse: number) => void;
  /** When set (listen page), verse number seeks audio without requiring study selection. */
  onSeekAudio?: (verse: number) => void;
  /** Register DOM node for gentle scroll-into-view during follow-along. */
  registerVerseRef?: (verse: number, el: HTMLDivElement | null) => void;
  /** Disable verse number (e.g. audio loading). */
  seekDisabled?: boolean;
};

/**
 * One verse row for reading or listen: separate **playing** (soft) vs **selected** (notes/highlights, stronger) states.
 */
export function BibleVerseRow({
  verse,
  selectedVerse,
  playingVerse,
  followAlongEnabled,
  hlByVerse,
  hasNote,
  onSelectVerse,
  onSeekAudio,
  registerVerseRef,
  seekDisabled,
}: BibleVerseRowProps) {
  const v = verse.verse;
  const hl = hlByVerse[v];
  const note = hasNote(v);
  const isSelected = selectedVerse === v;
  const isPlaying = Boolean(followAlongEnabled && playingVerse != null && playingVerse === v);

  const baseRow = [
    "flex gap-3 rounded-r-lg border-l-[3px] py-1.5 pl-3 pr-2 transition-[background-color,border-color,box-shadow] duration-300 ease-out md:gap-4 md:pl-4",
    hl ? highlightClass(hl) : "border-transparent",
  ];

  if (isSelected && isPlaying) {
    baseRow.push("border-l-amber-800/70 bg-amber-50/80");
  } else if (isSelected) {
    baseRow.push("border-l-amber-800/60 bg-amber-50/75");
  } else if (isPlaying) {
    baseRow.push("border-l-amber-600/50 bg-amber-50/45");
  } else {
    baseRow.push("hover:bg-stone-100/85 hover:border-l-stone-300/70");
  }

  return (
    <div
      id={`verse-${v}`}
      ref={(el) => registerVerseRef?.(v, el)}
      className={baseRow.join(" ")}
    >
      <button
        type="button"
        onClick={() => (onSeekAudio ? onSeekAudio(v) : onSelectVerse(v))}
        disabled={seekDisabled}
        className="mt-0.5 w-7 shrink-0 select-none text-left font-serif text-[0.68rem] font-medium tabular-nums leading-none text-stone-500 hover:text-stone-800 disabled:opacity-40 md:w-8 md:text-[0.75rem]"
        aria-current={isSelected ? "true" : undefined}
        aria-label={onSeekAudio ? `Seek audio to verse ${v}` : `Select verse ${v}`}
      >
        {v}
      </button>
      <button
        type="button"
        onClick={() => onSelectVerse(v)}
        className="min-w-0 flex-1 cursor-pointer rounded-r-md text-left"
        aria-label={`Read verse ${v}`}
      >
        <p className="text-[1.08rem] font-normal leading-[1.92] tracking-[0.01em] text-stone-800 md:text-[1.125rem] md:leading-[1.96]">
          {verse.text}
        </p>
        {(hl || note) && (
          <div className="mt-2 flex items-center gap-2 text-stone-600">
            {hl ? <Highlighter className="h-3.5 w-3.5 text-stone-500" aria-hidden /> : null}
            {note ? <StickyNote className="h-3.5 w-3.5 text-stone-500" aria-hidden /> : null}
          </div>
        )}
      </button>
    </div>
  );
}
