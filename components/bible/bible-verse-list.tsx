"use client";

import type { BibleApiVerse } from "@/lib/study/bible-api";
import { BibleVerseRow } from "@/components/bible/bible-verse-row";

type Props = {
  verses: BibleApiVerse[];
  selectedVerse: number | null;
  hlByVerse: Record<number, string>;
  hasNote: (verse: number) => boolean;
  onSelectVerse: (verse: number) => void;
  /** Listen mode: verse aligned to current audio time (approximate). */
  playingVerse?: number | null;
  /** When false, playing verse is not highlighted. */
  followAlongEnabled?: boolean;
  onSeekAudio?: (verse: number) => void;
  registerVerseRef?: (verse: number, el: HTMLDivElement | null) => void;
  seekDisabled?: boolean;
};

export function BibleVerseList({
  verses,
  selectedVerse,
  hlByVerse,
  hasNote,
  onSelectVerse,
  playingVerse = null,
  followAlongEnabled = false,
  onSeekAudio,
  registerVerseRef,
  seekDisabled,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-none space-y-6 md:space-y-7">
      {verses.map((v) => (
        <BibleVerseRow
          key={`${v.book_id}-${v.chapter}-${v.verse}`}
          verse={v}
          selectedVerse={selectedVerse}
          playingVerse={playingVerse}
          followAlongEnabled={followAlongEnabled}
          hlByVerse={hlByVerse}
          hasNote={hasNote}
          onSelectVerse={onSelectVerse}
          onSeekAudio={onSeekAudio}
          registerVerseRef={registerVerseRef}
          seekDisabled={seekDisabled}
        />
      ))}
    </div>
  );
}
