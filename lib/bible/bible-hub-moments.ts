/**
 * Soft “arrival” moments for the Bible hub — local only, no accounts.
 */

const HUB_LAST_VISIT = "deep-well-bible-hub:last-visit";
const HOME_RITUAL_LAST = "deep-well-home-ritual:last-visit";

const AWAY_DAYS = 7;

function parseIso(s: string): Date | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calendarDaysBetween(a: Date, b: Date): number {
  const utc = (x: Date) => Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  return Math.round((utc(b) - utc(a)) / 86400000);
}

/** First visit to hub, or last visit was AWAY_DAYS+ calendar days ago. Does not write storage. */
export function peekBibleHubEntryMoment(): "welcome" | "return" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HUB_LAST_VISIT);
    if (!raw) return "welcome";
    const last = parseIso(raw);
    if (!last) return "welcome";
    const days = calendarDaysBetween(last, new Date());
    return days >= AWAY_DAYS ? "return" : null;
  } catch {
    return null;
  }
}

/** Call when the user leaves the Bible hub (or ends a session there) so the next visit can feel like a return. */
export function touchBibleHubVisit(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HUB_LAST_VISIT, new Date().toISOString());
  } catch {
    /* */
  }
}

/** One quiet line on the home Scripture strip when returning after time away (not first open). */
export function peekHomeRitualReturnLine(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HOME_RITUAL_LAST);
    if (!raw) return null;
    const last = parseIso(raw);
    if (!last) return null;
    const days = calendarDaysBetween(last, new Date());
    return days >= AWAY_DAYS ? "Welcome back — continue where you left off." : null;
  } catch {
    return null;
  }
}

export function touchHomeRitualVisit(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOME_RITUAL_LAST, new Date().toISOString());
  } catch {
    /* */
  }
}
