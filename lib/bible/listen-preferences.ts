import type { StudyTranslationId } from "@/lib/study/bible-api";
import { normalizeBibleTtsVoiceKey } from "@/lib/bible/bible-tts-voices";

const PREFIX = "deep-well-bible-listen";

/** Fired on `window` after `writeBibleListenPrefs` updates storage (same tab). */
export const BIBLE_LISTEN_PREFS_UPDATED_EVENT = "deep-well:bible-listen-prefs";

export type BibleListenPrefs = {
  bookId: string;
  chapter: number;
  /** Verse for follow-along / scroll (1-based). */
  verse: number;
  translation: StudyTranslationId;
  /** Curated TTS preset id (e.g. warm-male). */
  voiceKey: string;
  rate: number;
  /** When true, advance to the next chapter after playback ends (autoplay). */
  continueBook: boolean;
  /** Last playback position in seconds for the current chapter (same book/chapter/translation). */
  audioTimeSec: number;
  /** ISO 8601 timestamp — last meaningful listen session (position save or play). */
  lastPlayedAt: string | null;
  /** Last known full-chapter duration (seconds), for continue-listening progress UI. */
  lastDurationSec: number;
  /** Approximate verse follow-along highlighting while audio plays. */
  followAlong: boolean;
};

const DEFAULTS: BibleListenPrefs = {
  bookId: "JHN",
  chapter: 1,
  verse: 1,
  translation: "web",
  voiceKey: normalizeBibleTtsVoiceKey(null),
  rate: 1,
  continueBook: true,
  audioTimeSec: 0,
  lastPlayedAt: null,
  lastDurationSec: 0,
  followAlong: true,
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

  const lastPlayedAt =
    typeof j.lastPlayedAt === "string" && j.lastPlayedAt.trim() ? j.lastPlayedAt.trim() : DEFAULTS.lastPlayedAt;
  const lastDurationSec =
    typeof j.lastDurationSec === "number" && j.lastDurationSec >= 0 && j.lastDurationSec < 1e7
      ? j.lastDurationSec
      : DEFAULTS.lastDurationSec;

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
    lastPlayedAt,
    lastDurationSec,
    followAlong: typeof j.followAlong === "boolean" ? j.followAlong : DEFAULTS.followAlong,
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
    window.dispatchEvent(new Event(BIBLE_LISTEN_PREFS_UPDATED_EVENT));
  } catch {
    /* quota / private mode */
  }
}

const RESUME_MIN_SEC = 5;

/** Whether saved position is worth resuming (not a fresh start). */
export function shouldResumeFromSavedPosition(positionSec: number): boolean {
  return typeof positionSec === "number" && Number.isFinite(positionSec) && positionSec >= RESUME_MIN_SEC;
}

export type BibleContinueListeningSnapshot = {
  bookId: string;
  chapter: number;
  translation: StudyTranslationId;
  voiceKey: string;
  positionSec: number;
  durationSec: number;
  lastPlayedAt: string | null;
  /** True when we have enough saved position to offer “resume where you left off”. */
  canResume: boolean;
};

export function readBibleContinueListeningSnapshot(): BibleContinueListeningSnapshot {
  const p = readBibleListenPrefs();
  const canResume = shouldResumeFromSavedPosition(p.audioTimeSec) && Boolean(p.lastPlayedAt);
  return {
    bookId: p.bookId,
    chapter: p.chapter,
    translation: p.translation,
    voiceKey: p.voiceKey,
    positionSec: p.audioTimeSec,
    durationSec: p.lastDurationSec,
    lastPlayedAt: p.lastPlayedAt,
    canResume,
  };
}
