/** Client-only: count Premium-gated save attempts (e.g. favorite) for gentle conversion moments. */

export const SAVE_ATTEMPT_KEY = "deepwell:save-attempt-count";

export function getSaveAttemptCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = parseInt(localStorage.getItem(SAVE_ATTEMPT_KEY) ?? "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function incrementSaveAttemptCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = getSaveAttemptCount() + 1;
    localStorage.setItem(SAVE_ATTEMPT_KEY, String(next));
    window.dispatchEvent(new CustomEvent("deepwell:save-attempt-changed"));
    return next;
  } catch {
    return 0;
  }
}
