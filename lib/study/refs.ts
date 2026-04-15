import type { BibleBookDef } from "@/lib/study/bible-books";
import {
  BIBLE_BOOKS,
  getBibleBookByApiId,
  resolveBookFromMatch,
  scriptureDetectionRegex,
  scriptureTagVerseAnchoredRegex,
} from "@/lib/study/bible-books";

export type ParsedPassage = {
  book: BibleBookDef;
  chapter: number;
  verseFrom: number;
  verseTo: number;
  /** Human label e.g. "John 3:16" */
  label: string;
  /** bible-api query e.g. "john+3:16" or "john+3:16-18" */
  apiQuery: string;
  /** Stable key for DB: JHN:3:16 or JHN:3:16-18 */
  verseKey: string;
};

export function buildPassageLabel(bookLabel: string, chapter: number, verseFrom: number, verseTo: number): string {
  if (verseTo !== verseFrom) return `${bookLabel} ${chapter}:${verseFrom}–${verseTo}`;
  return `${bookLabel} ${chapter}:${verseFrom}`;
}

export function parsePassageFromParts(
  book: BibleBookDef,
  chapter: number,
  verseFrom: number,
  verseTo?: number
): ParsedPassage | null {
  if (chapter < 1 || verseFrom < 1) return null;
  const vTo = verseTo != null && verseTo >= verseFrom ? verseTo : verseFrom;
  const range = vTo === verseFrom ? `${verseFrom}` : `${verseFrom}-${vTo}`;
  const apiQuery = `${book.apiSlug}+${chapter}:${range}`;
  const label = buildPassageLabel(book.label, chapter, verseFrom, vTo);
  const verseKey =
    vTo === verseFrom ? `${book.apiBookId}:${chapter}:${verseFrom}` : `${book.apiBookId}:${chapter}:${verseFrom}-${vTo}`;
  return { book, chapter, verseFrom, verseTo: vTo, label, apiQuery, verseKey };
}

/** Find scripture references in plain text (non-overlapping, left-to-right). */
export function findScriptureRefs(text: string): ParsedPassage[] {
  if (!text) return [];
  const re = scriptureDetectionRegex();
  re.lastIndex = 0;
  const out: ParsedPassage[] = [];
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(text)) !== null) {
    const bookPart = m[1];
    const chapter = Number(m[2]);
    const v1 = Number(m[3]);
    const v2 = m[4] != null && m[4] !== "" ? Number(m[4]) : undefined;
    const book = resolveBookFromMatch(bookPart);
    if (!book || !Number.isFinite(chapter) || !Number.isFinite(v1)) continue;
    const parsed = parsePassageFromParts(book, chapter, v1, v2);
    if (!parsed) continue;
    if (seen.has(parsed.verseKey)) continue;
    seen.add(parsed.verseKey);
    out.push(parsed);
  }
  return out;
}

export function verseContentKey(translationId: string, verseKey: string): string {
  return `verse:${translationId}:${verseKey}`;
}

/**
 * Inverse of `verseContentKey`: parse a stored `verse:…` key back into passage + translation.
 * Returns null if the key is not verse-shaped or cannot be parsed.
 */
export function parseVerseContentKey(
  contentKey: string
): { passage: ParsedPassage; translationId: string } | null {
  if (!contentKey.startsWith("verse:")) return null;
  const rest = contentKey.slice("verse:".length);
  const idx = rest.indexOf(":");
  if (idx <= 0) return null;
  const translationId = rest.slice(0, idx);
  const verseKey = rest.slice(idx + 1);
  const mk = /^([A-Z0-9]+):(\d+):(\d+)(?:-(\d+))?$/.exec(verseKey);
  if (!mk) return null;
  const book = getBibleBookByApiId(mk[1]);
  if (!book) return null;
  const chapter = Number(mk[2]);
  const vFrom = Number(mk[3]);
  const vTo = mk[4] != null ? Number(mk[4]) : undefined;
  const passage = parsePassageFromParts(book, chapter, vFrom, vTo);
  if (!passage) return null;
  return { passage, translationId };
}

export function teachingContentKey(kind: "episode" | "youtube", id: string): string {
  return `teaching:${kind}:${id}`;
}

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MAX_TAG_LEN = 96;

/**
 * Normalize RSS / human-entered scripture tag strings: unicode dashes, spacing,
 * and missing spaces before/after digits ("Romans8" → "Romans 8", "1Cor13:1" → "1 Cor 13:1").
 */
export function normalizeScriptureTagInput(raw: string): string {
  let s = raw
    .trim()
    .replace(/\u2013|\u2014|\u2212/g, "-")
    .replace(/\s+/g, " ");
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/([A-Za-z])(\d)/g, "$1 $2");
    s = s.replace(/(\d)([A-Za-z])/g, "$1 $2");
  }
  return s.replace(/\s+/g, " ").trim();
}

/** How to open Study from a metadata pill (verse drawer vs reader sheet). */
export type StudyEntryFromTag =
  | { kind: "verse"; passage: ParsedPassage }
  | { kind: "reader"; apiQuery: string; title: string };

type PatternBook = { pattern: string; book: BibleBookDef };

let _chapterTagPatterns: PatternBook[] | null = null;

function chapterTagPatternsSorted(): PatternBook[] {
  if (_chapterTagPatterns) return _chapterTagPatterns;
  const flat: PatternBook[] = [];
  for (const book of BIBLE_BOOKS) {
    for (const pattern of book.patterns) {
      flat.push({ pattern, book });
    }
  }
  flat.sort((a, b) => b.pattern.length - a.pattern.length);
  _chapterTagPatterns = flat;
  return flat;
}

/**
 * Parse a `scripture_tags` string (or similar) into a Study entry.
 * Verse-shaped tags → verse drawer (strict single-reference match). Chapter-only → reader sheet.
 * Malformed or ambiguous strings return null (stay non-clickable).
 */
export function parseScriptureTagForStudy(raw: string): StudyEntryFromTag | null {
  const s = normalizeScriptureTagInput(raw);
  if (!s || s.length > MAX_TAG_LEN) return null;

  const verseRe = scriptureTagVerseAnchoredRegex();
  const mv = s.match(verseRe);
  if (mv) {
    const bookPart = mv[1];
    const chapter = Number(mv[2]);
    const v1 = Number(mv[3]);
    const v2 = mv[4] != null && mv[4] !== "" ? Number(mv[4]) : undefined;
    const book = resolveBookFromMatch(bookPart);
    if (!book || !Number.isFinite(chapter) || !Number.isFinite(v1)) return null;
    if (chapter < 1 || chapter > 200 || v1 < 1 || v1 > 200) return null;
    if (v2 !== undefined && (!Number.isFinite(v2) || v2 < v1 || v2 > 200)) return null;
    const passage = parsePassageFromParts(book, chapter, v1, v2);
    if (!passage) return null;
    return { kind: "verse", passage };
  }

  for (const { pattern, book } of chapterTagPatternsSorted()) {
    const re = new RegExp(`^${escapeRx(pattern)}\\s+(\\d{1,3})$`, "i");
    const m = s.match(re);
    if (!m) continue;
    const chapter = Number(m[1]);
    if (!Number.isFinite(chapter) || chapter < 1 || chapter > 200) continue;
    const apiQuery = `${book.apiSlug}+${chapter}`;
    return { kind: "reader", apiQuery, title: `${book.label} ${chapter}` };
  }

  return null;
}
