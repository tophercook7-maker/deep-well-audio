/**
 * Client-only: last opened passage in Study overlays (verse drawer / reader).
 * Kept in one module so /bible, dashboard, and overlays stay aligned.
 */
import { topicScriptureMap, type TopicKey } from "@/lib/study/topic-scripture-map";

export const STUDY_LAST_PASSAGE_KEY = "dwa-study-last";
export const STUDY_BIBLE_TOPIC_KEY = "dwa-study-bible-topic";

/** Dispatched when passage or Bible-topic continuity is written (same-tab listeners). */
export const STUDY_CONTINUITY_UPDATED_EVENT = "dwa-study-continuity-updated";

function notifyContinuityUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STUDY_CONTINUITY_UPDATED_EVENT));
}

export type StudyLastPassage = { q: string; t: string; label: string; openedAt?: number };

/** Last topic the user chose on /bible (for gentle “continue” hints). */
export type StudyLastBibleTopic = { key: TopicKey; at: number };

export function readStudyLastPassage(): StudyLastPassage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDY_LAST_PASSAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { q?: string; t?: string; label?: string; openedAt?: number };
    if (typeof o.q === "string" && o.q) {
      return {
        q: o.q,
        t: typeof o.t === "string" ? o.t : "web",
        label: o.label ?? o.q,
        openedAt: typeof o.openedAt === "number" ? o.openedAt : undefined,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStudyLastPassage(q: string, t: string, label: string): void {
  try {
    localStorage.setItem(
      STUDY_LAST_PASSAGE_KEY,
      JSON.stringify({ q, t, label, openedAt: Date.now() }),
    );
    notifyContinuityUpdated();
  } catch {
    /* ignore */
  }
}

export function readStudyLastBibleTopic(): StudyLastBibleTopic | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDY_BIBLE_TOPIC_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { key?: string; at?: number };
    if (typeof o.key === "string" && o.key in topicScriptureMap && typeof o.at === "number") {
      return { key: o.key as TopicKey, at: o.at };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStudyLastBibleTopic(key: TopicKey): void {
  try {
    localStorage.setItem(STUDY_BIBLE_TOPIC_KEY, JSON.stringify({ key, at: Date.now() }));
    notifyContinuityUpdated();
  } catch {
    /* ignore */
  }
}
