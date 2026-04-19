import type { StudyTranslationId } from "@/lib/study/bible-api";
import { normalizeBibleTtsVoiceKey } from "@/lib/bible/bible-tts-voices";

const PREFIX = "deep-well-bible-listen";

export type BibleListenPrefs = {
  bookId: string;
  chapter: number;
  /** Verse for follow-along / scroll (1-based). */
  verse: number;
  translation: StudyTranslationId;
  /** Curated TTS preset id (e.g. warm-male). */
  voiceKey: string;
  rate: number;
  /** When true, advance to the next chapter after playback ends. */
  continueBook: boolean;
  /** Last playback position in seconds for the current chapter (same book/chapter/translation). */
  audioTimeSec: number;
};

const DEFAULTS: BibleListenPrefs = {
  bookId: "JHN",
  chapter: 1,
  verse: 1,
  translation: "web",
  voiceKey: normalizeBibleTtsVoiceKey(null),
  rate: 1,
  continueBook: false,
  audioTimeSec: 0,
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
  const rawVoice = j.voiceKey;
  const voiceKey =
    typeof rawVoice === "string" || rawVoice === null ? normalizeBibleTtsVoiceKey(rawVoice) : DEFAULTS.voiceKey;

  return {
    bookId: typeof j.bookId === "string" && j.bookId ? j.bookId : DEFAULTS.bookId,
    chapter: typeof j.chapter === "number" && j.chapter >= 1 ? Math.floor(j.chapter) : DEFAULTS.chapter,
    verse: typeof j.verse === "number" && j.verse >= 1 ? Math.floor(j.verse) : DEFAULTS.verse,
    translation:
      j.translation === "web" || j.translation === "kjv" || j.translation === "asv" ? j.translation : DEFAULTS.translation,
    voiceKey,
    rate: typeof j.rate === "number" && j.rate >= 0.5 && j.rate <= 1.75 ? j.rate : DEFAULTS.rate,
    continueBook: typeof j.continueBook === "boolean" ? j.continueBook : DEFAULTS.continueBook,
    audioTimeSec:
      typeof j.audioTimeSec === "number" && j.audioTimeSec >= 0 && j.audioTimeSec < 1e7 ? j.audioTimeSec : DEFAULTS.audioTimeSec,
  };
}

export function writeBibleListenPrefs(patch: Partial<BibleListenPrefs>): void {
  if (typeof window === "undefined") return;
  const next = { ...readBibleListenPrefs(), ...patch };
  if (patch.voiceKey !== undefined) {
    next.voiceKey = normalizeBibleTtsVoiceKey(patch.voiceKey);
  }
  try {
    window.localStorage.setItem(`${PREFIX}:v1`, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}
