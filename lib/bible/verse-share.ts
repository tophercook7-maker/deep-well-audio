import { chapterApiQuery } from "@/lib/bible/navigation-urls";
import { isStudyTranslationId, type StudyTranslationId } from "@/lib/study/bible-api";

export type BibleVerseSharePayload = {
  verseText: string;
  bookLabel: string;
  chapter: number;
  verse: number;
  translation: StudyTranslationId;
  urlBook: string;
};

export function formatVerseCitation(bookLabel: string, chapter: number, verse: number): string {
  return `${bookLabel} ${chapter}:${verse}`;
}

/** Public link to the chapter with a fragment the reader scrolls to (`#` + verse number). */
export function buildBibleVerseShareUrl(
  origin: string,
  translation: string,
  urlBook: string,
  chapter: number,
  verse: number,
): string {
  const t = isStudyTranslationId(translation) ? translation : "web";
  const b = encodeURIComponent(urlBook.toLowerCase());
  const base = `${origin.replace(/\/$/, "")}/bible/${t}/${b}/${chapter}`;
  return `${base}#${verse}`;
}

/**
 * Plain text for copy / system share: Scripture first, citation, then a single quiet link.
 */
export function buildVerseSharePlainText(opts: {
  verseText: string;
  bookLabel: string;
  chapter: number;
  verse: number;
  linkUrl?: string | null;
}): string {
  const body = opts.verseText.trim().replace(/\s+/g, " ");
  const cite = formatVerseCitation(opts.bookLabel, opts.chapter, opts.verse);
  const lines = [`"${body}"`, "", `— ${cite}`];
  if (opts.linkUrl) lines.push("", opts.linkUrl);
  return lines.join("\n");
}

export async function fetchVerseTextFromPassageApi(
  translation: StudyTranslationId,
  urlBook: string,
  chapter: number,
  verseNum: number,
): Promise<string | null> {
  const q = chapterApiQuery(urlBook, chapter);
  const res = await fetch(`/api/study/passage?q=${encodeURIComponent(q)}&t=${encodeURIComponent(translation)}`, {
    credentials: "same-origin",
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { verses?: { verse: number; text: string }[] };
  const hit = j.verses?.find((x) => x.verse === verseNum);
  return hit?.text?.trim() ? hit.text : null;
}
