export const STUDY_TRANSLATIONS = [
  { id: "web", shortLabel: "WEB", label: "Clear English (WEB)" },
  { id: "kjv", shortLabel: "KJV", label: "King James (KJV)" },
  { id: "asv", shortLabel: "ASV", label: "Classic literal (ASV)" },
] as const;

export function studyTranslationShortLabel(translationId: string): string {
  const row = STUDY_TRANSLATIONS.find((t) => t.id === translationId);
  return row?.shortLabel ?? translationId.toUpperCase();
}

export type StudyTranslationId = (typeof STUDY_TRANSLATIONS)[number]["id"];

export type BibleApiVerse = {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

export type BibleApiPassageResponse = {
  reference: string;
  verses: BibleApiVerse[];
  text: string;
  translation_id: string;
  translation_name?: string;
};

const BASE = "https://bible-api.com";

export function isStudyTranslationId(x: string): x is StudyTranslationId {
  return STUDY_TRANSLATIONS.some((t) => t.id === x);
}

export async function fetchPassage(
  apiQuery: string,
  translationId: string,
  opts?: { cache?: RequestCache }
): Promise<BibleApiPassageResponse | null> {
  const t = isStudyTranslationId(translationId) ? translationId : "web";
  const q = apiQuery.trim().replace(/\s+/g, "+");
  if (!q) return null;
  const url = `${BASE}/${q}?translation=${encodeURIComponent(t)}`;
  const cache = opts?.cache ?? "default";
  const res = await fetch(url, cache === "default" ? { next: { revalidate: 3600 } } : { cache: "no-store" });
  if (!res.ok) return null;
  try {
    return (await res.json()) as BibleApiPassageResponse;
  } catch {
    return null;
  }
}
