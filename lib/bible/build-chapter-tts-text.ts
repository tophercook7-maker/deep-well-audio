import type { BibleApiVerse } from "@/lib/study/bible-api";

export type VerseCharRange = {
  verse: number;
  startChar: number;
  endChar: number;
};

/**
 * Single narration block for TTS (full chapter). Verse ranges map approximate playback position to verses.
 */
export function buildChapterTtsText(
  verses: BibleApiVerse[],
  referenceLine?: string | null,
): { text: string; verseRanges: VerseCharRange[]; textLength: number } {
  const sorted = [...verses].sort((a, b) => a.verse - b.verse);
  const verseRanges: VerseCharRange[] = [];
  const chunks: string[] = [];
  let offset = 0;

  if (referenceLine?.trim()) {
    const head = referenceLine.trim();
    chunks.push(head);
    offset = head.length + 1;
  }

  for (const v of sorted) {
    const bit = `${v.verse} ${v.text.replace(/\s+/g, " ").trim()}`;
    verseRanges.push({ verse: v.verse, startChar: offset, endChar: offset + bit.length });
    chunks.push(bit);
    offset += bit.length + 1;
  }

  const text = chunks.join(" ");
  return { text, verseRanges, textLength: text.length };
}

/** Approximate verse from playback position (linear by character — good enough for follow-along). */
export function verseAtPlaybackTime(
  verseRanges: VerseCharRange[],
  textLength: number,
  currentTime: number,
  duration: number,
): number | null {
  if (!verseRanges.length || !textLength || !duration || duration <= 0) return null;
  const ratio = Math.min(1, Math.max(0, currentTime / duration));
  const charIndex = Math.floor(ratio * textLength);
  for (const r of verseRanges) {
    if (charIndex >= r.startChar && charIndex < r.endChar) return r.verse;
  }
  return verseRanges[verseRanges.length - 1]!.verse;
}

export function timeForVerseStart(
  verseRanges: VerseCharRange[],
  textLength: number,
  verse: number,
  duration: number,
): number {
  if (!duration || !textLength) return 0;
  const r = verseRanges.find((x) => x.verse === verse);
  if (!r) return 0;
  return (r.startChar / textLength) * duration;
}
