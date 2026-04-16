/**
 * Client-only: last opened passage in Study overlays (verse drawer / reader).
 * Kept in one module so /bible, dashboard, and overlays stay aligned.
 */
export const STUDY_LAST_PASSAGE_KEY = "dwa-study-last";

export type StudyLastPassage = { q: string; t: string; label: string };

export function readStudyLastPassage(): StudyLastPassage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDY_LAST_PASSAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { q?: string; t?: string; label?: string };
    if (typeof o.q === "string" && o.q) {
      return { q: o.q, t: typeof o.t === "string" ? o.t : "web", label: o.label ?? o.q };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStudyLastPassage(q: string, t: string, label: string): void {
  try {
    localStorage.setItem(STUDY_LAST_PASSAGE_KEY, JSON.stringify({ q, t, label }));
  } catch {
    /* ignore */
  }
}
