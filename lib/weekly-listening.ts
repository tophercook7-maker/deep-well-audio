/**
 * Calm weekly listening stats (client-only, localStorage).
 * No streaks — a gentle sense of continuity and rhythm.
 */

import { mondayWeekIdUtc } from "@/lib/week-boundaries";

const STORAGE_KEY = "deepwell:weekly-listening";

type WeeklyStore = {
  /** ISO date string for Monday 00:00 UTC of current calendar week (stable bucket). */
  weekId: string;
  /** Approximate unique episodes touched while playing this week. */
  episodeIds: string[];
  /** Total listening seconds accumulated this week (delta-based). */
  totalSeconds: number;
};

function readWeekly(): WeeklyStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as WeeklyStore;
    if (!j?.weekId || !Array.isArray(j.episodeIds) || typeof j.totalSeconds !== "number") return null;
    return j;
  } catch {
    return null;
  }
}

function writeWeekly(store: WeeklyStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

/**
 * Call when listening progress advances. Caps large jumps (seeks) so stats stay honest.
 */
export function bumpWeeklyListening(episodeId: string, newTimeSec: number, prevTimeSec: number): void {
  if (!episodeId || !Number.isFinite(newTimeSec)) return;
  const prevT = Number.isFinite(prevTimeSec) ? Math.max(0, prevTimeSec) : 0;
  const rawDelta = Math.max(0, newTimeSec - prevT);
  const delta = Math.min(rawDelta, 45);
  if (delta < 0.25) return;

  const weekId = mondayWeekIdUtc();
  let cur = readWeekly();
  if (!cur || cur.weekId !== weekId) {
    cur = { weekId, episodeIds: [], totalSeconds: 0 };
  }

  const episodeIds = cur.episodeIds.includes(episodeId) ? [...cur.episodeIds] : [...cur.episodeIds, episodeId];

  writeWeekly({
    weekId,
    episodeIds,
    totalSeconds: cur.totalSeconds + delta,
  });
}

export type WeeklyListeningSummary = {
  teachingCount: number;
  minutesRounded: number;
  hasActivity: boolean;
};

export function getWeeklyListeningSummary(): WeeklyListeningSummary {
  const cur = readWeekly();
  const weekId = mondayWeekIdUtc();
  if (!cur || cur.weekId !== weekId) {
    return { teachingCount: 0, minutesRounded: 0, hasActivity: false };
  }
  const teachingCount = cur.episodeIds.length;
  const minutesRounded = Math.max(0, Math.round(cur.totalSeconds / 60));
  return {
    teachingCount,
    minutesRounded,
    hasActivity: teachingCount > 0 || minutesRounded > 0,
  };
}

export function formatWeeklyListeningLine(summary: WeeklyListeningSummary): string {
  if (!summary.hasActivity) {
    return "Listen this week and a gentle summary will appear here.";
  }
  const parts: string[] = [];
  if (summary.teachingCount <= 0) {
    parts.push(`You've listened about ${summary.minutesRounded} minute${summary.minutesRounded === 1 ? "" : "s"} this week`);
  } else if (summary.minutesRounded <= 0) {
    parts.push(
      `You've returned to ${summary.teachingCount} teaching${summary.teachingCount === 1 ? "" : "s"} this week`,
    );
  } else {
    parts.push(
      `You've listened to ${summary.teachingCount} teaching${summary.teachingCount === 1 ? "" : "s"} this week · about ${summary.minutesRounded} minute${summary.minutesRounded === 1 ? "" : "s"}`,
    );
  }
  return parts.join(" — ");
}
