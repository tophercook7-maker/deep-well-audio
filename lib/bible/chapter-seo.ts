import type { BibleApiVerse } from "@/lib/study/bible-api";

/** Meta description for chapter pages: verse count + short excerpt from the opening verse. */
export function buildChapterMetaDescription(opts: {
  bookLabel: string;
  chapter: number;
  translationLabel: string;
  verses: BibleApiVerse[];
}): string {
  const n = opts.verses.length;
  const sorted = [...opts.verses].sort((a, b) => a.verse - b.verse);
  const first = sorted[0]?.text?.replace(/\s+/g, " ").trim() ?? "";
  const excerpt = first.length > 155 ? `${first.slice(0, 152)}…` : first;
  const base = `Read ${opts.bookLabel} chapter ${opts.chapter} (${opts.translationLabel}) — ${n} verses. Free online Bible text.`;
  if (!excerpt) return base;
  return `${base} ${excerpt}`.slice(0, 320);
}
