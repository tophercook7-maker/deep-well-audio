import type { StudyTranslationId } from "@/lib/study/bible-api";

const PREFIX = "deep-well-bible-listen";

export type BibleListenPrefs = {
  bookId: string;
  chapter: number;
  /** Verse to scroll to / start playback from (1-based). */
  verse: number;
  translation: StudyTranslationId;
  /** `SpeechSynthesisVoice.voiceURI` when available, else `${name}|${lang}`. */
  voiceKey: string | null;
  rate: number;
  /** When true, advance to the next chapter after the last verse finishes. */
  continueBook: boolean;
};

const DEFAULTS: BibleListenPrefs = {
  bookId: "JHN",
  chapter: 1,
  verse: 1,
  translation: "web",
  voiceKey: null,
  rate: 1,
  continueBook: false,
};

function readJson(): Partial<BibleListenPrefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:v1`);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<BibleListenPrefs>;
  } catch {
    return {};
  }
}

export function readBibleListenPrefs(): BibleListenPrefs {
  const j = readJson();
  return {
    bookId: typeof j.bookId === "string" && j.bookId ? j.bookId : DEFAULTS.bookId,
    chapter: typeof j.chapter === "number" && j.chapter >= 1 ? Math.floor(j.chapter) : DEFAULTS.chapter,
    verse: typeof j.verse === "number" && j.verse >= 1 ? Math.floor(j.verse) : DEFAULTS.verse,
    translation:
      j.translation === "web" || j.translation === "kjv" || j.translation === "asv" ? j.translation : DEFAULTS.translation,
    voiceKey: typeof j.voiceKey === "string" || j.voiceKey === null ? j.voiceKey : DEFAULTS.voiceKey,
    rate: typeof j.rate === "number" && j.rate >= 0.5 && j.rate <= 1.75 ? j.rate : DEFAULTS.rate,
    continueBook: typeof j.continueBook === "boolean" ? j.continueBook : DEFAULTS.continueBook,
  };
}

export function writeBibleListenPrefs(patch: Partial<BibleListenPrefs>): void {
  if (typeof window === "undefined") return;
  const next = { ...readBibleListenPrefs(), ...patch };
  try {
    window.localStorage.setItem(`${PREFIX}:v1`, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
