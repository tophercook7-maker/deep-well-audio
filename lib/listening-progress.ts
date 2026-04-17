/**
 * Client-safe listening history: per-episode progress + recent queue in localStorage.
 * Key: deepwell:progress — fails silently if storage is unavailable.
 */

import type { PlayerTrack } from "@/lib/player/types";
import { bumpWeeklyListening } from "@/lib/weekly-listening";

export const LISTENING_PROGRESS_STORAGE_KEY = "deepwell:progress";
export const LISTENING_PROGRESS_EVENT = "deepwell:progress-updated";

const STORE_VERSION = 1 as const;
const MAX_EPISODE_ENTRIES = 48;
const MAX_RECENT_IDS = 10;

export const MIN_RESUME_SECONDS = 10;
export const NEAR_END_RATIO = 0.92;
export const MIN_REMAINING_SECONDS = 20;

export type ListeningProgressEntry = {
  track: PlayerTrack;
  currentTime: number;
  duration: number;
  lastPlayedAt: number;
};

type ListeningStore = {
  v: typeof STORE_VERSION;
  byId: Record<string, ListeningProgressEntry>;
  recentIds: string[];
};

function safeNow(): number {
  return Date.now();
}

function notifyListeners(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(LISTENING_PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function stripResumeFromTrack(track: PlayerTrack): PlayerTrack {
  const copy = { ...track };
  delete copy.resumeAtSeconds;
  return copy;
}

function readStore(): ListeningStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LISTENING_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListeningStore;
    if (parsed?.v !== STORE_VERSION || typeof parsed.byId !== "object" || !Array.isArray(parsed.recentIds)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(store: ListeningStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LISTENING_PROGRESS_STORAGE_KEY, JSON.stringify(store));
    notifyListeners();
  } catch {
    /* quota / private mode */
  }
}

function pruneEpisodes(byId: Record<string, ListeningProgressEntry>): Record<string, ListeningProgressEntry> {
  const ids = Object.keys(byId);
  if (ids.length <= MAX_EPISODE_ENTRIES) return byId;
  const sorted = ids.sort((a, b) => (byId[b]!.lastPlayedAt ?? 0) - (byId[a]!.lastPlayedAt ?? 0));
  const drop = sorted.slice(MAX_EPISODE_ENTRIES);
  const next = { ...byId };
  for (const id of drop) delete next[id];
  return next;
}

function effectiveDuration(entry: ListeningProgressEntry): number {
  if (entry.duration > 0 && Number.isFinite(entry.duration)) return entry.duration;
  const rss = entry.track.durationSeconds;
  if (rss != null && rss > 0 && Number.isFinite(rss)) return rss;
  return 0;
}

/** True when saved progress should appear in "Continue listening". */
export function isEligibleForContinue(entry: ListeningProgressEntry): boolean {
  const t = entry.currentTime;
  if (!Number.isFinite(t) || t < MIN_RESUME_SECONDS) return false;
  const dur = effectiveDuration(entry);
  if (dur > 0) {
    if (t / dur >= NEAR_END_RATIO) return false;
    if (dur - t < MIN_REMAINING_SECONDS) return false;
  }
  return true;
}

/** Seconds to seek when starting playback, or null to start from the beginning. */
export function getResumeSecondsForEpisode(episodeId: string, rssDurationSeconds: number | null | undefined): number | null {
  const store = readStore();
  if (!store) return null;
  const entry = store.byId[episodeId];
  if (!entry) return null;
  const t = entry.currentTime;
  if (!Number.isFinite(t) || t < MIN_RESUME_SECONDS) return null;
  const dur =
    entry.duration > 0 && Number.isFinite(entry.duration)
      ? entry.duration
      : rssDurationSeconds && rssDurationSeconds > 0
        ? rssDurationSeconds
        : effectiveDuration(entry);
  if (dur > 0) {
    if (t / dur >= NEAR_END_RATIO) return null;
    if (dur - t < MIN_REMAINING_SECONDS) return null;
  }
  return t;
}

export function saveListeningProgress(track: PlayerTrack, currentTime: number, duration: number): void {
  if (typeof window === "undefined" || !track?.id) return;
  const ct = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const d = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const prev = readStore();
  const prevTime = prev?.byId[track.id]?.currentTime;
  const prevT = Number.isFinite(prevTime) ? (prevTime as number) : 0;
  bumpWeeklyListening(track.id, ct, prevT);
  const byId = { ...(prev?.byId ?? {}) };
  const storedTrack = stripResumeFromTrack(track);
  byId[track.id] = {
    track: storedTrack,
    currentTime: ct,
    duration: d,
    lastPlayedAt: safeNow(),
  };
  writeStore({
    v: STORE_VERSION,
    byId: pruneEpisodes(byId),
    recentIds: prev?.recentIds ?? [],
  });
}

/** Call when the user begins playback so Recently played stays ordered. Optional `track` seeds a row before the first progress save. */
export function touchRecentPlayback(episodeId: string, track?: PlayerTrack | null): void {
  if (typeof window === "undefined" || !episodeId) return;
  const prev = readStore();
  let byId = { ...(prev?.byId ?? {}) };
  const rest = (prev?.recentIds ?? []).filter((id) => id !== episodeId);
  const recentIds = [episodeId, ...rest].slice(0, MAX_RECENT_IDS);
  const now = safeNow();
  const existing = byId[episodeId];
  if (existing) {
    byId[episodeId] = { ...existing, lastPlayedAt: now };
  } else if (track) {
    byId[episodeId] = {
      track: stripResumeFromTrack(track),
      currentTime: 0,
      duration: 0,
      lastPlayedAt: now,
    };
    byId = pruneEpisodes(byId);
  }
  writeStore({
    v: STORE_VERSION,
    byId,
    recentIds,
  });
}

export function getContinueListeningEntries(max = 5): ListeningProgressEntry[] {
  const store = readStore();
  if (!store) return [];
  const rows = Object.values(store.byId).filter(isEligibleForContinue);
  rows.sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0));
  return rows.slice(0, max);
}

export function getRecentlyPlayedEntries(max = 8): ListeningProgressEntry[] {
  const store = readStore();
  if (!store) return [];
  const out: ListeningProgressEntry[] = [];
  for (const id of store.recentIds) {
    const row = store.byId[id];
    if (row) out.push(row);
    if (out.length >= max) break;
  }
  return out;
}

/** Track sent to the player to resume at the stored position. */
export function trackWithResume(entry: ListeningProgressEntry): PlayerTrack {
  const base = stripResumeFromTrack(entry.track);
  const seek = getResumeSecondsForEpisode(entry.track.id, entry.track.durationSeconds ?? null);
  if (seek == null) return base;
  return { ...base, resumeAtSeconds: seek };
}

export function flushProgressFromAudio(track: PlayerTrack | null, mediaEl: HTMLMediaElement | null): void {
  if (!track || !mediaEl) return;
  const t = mediaEl.currentTime;
  const d = mediaEl.duration;
  const duration = Number.isFinite(d) && d > 0 ? d : track.durationSeconds ?? 0;
  saveListeningProgress(track, t, duration);
}
