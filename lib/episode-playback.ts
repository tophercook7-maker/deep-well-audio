import type { EpisodeRow } from "@/lib/types";
import { FALLBACK_ARTWORK_PATH } from "@/lib/artwork";

export const DEFAULT_SHOW_ARTWORK = FALLBACK_ARTWORK_PATH;

/** Open-in-browser priority: audio (direct file) → video → episode page → show official. */
export function getOutboundListenUrl(episode: EpisodeRow, showOfficialUrl?: string | null): string | null {
  if (episode.audio_url?.trim()) return episode.audio_url.trim();
  if (episode.video_url?.trim()) return episode.video_url.trim();
  if (episode.episode_url?.trim()) return episode.episode_url.trim();
  if (showOfficialUrl?.trim()) return showOfficialUrl.trim();
  return null;
}

export function getOutboundLabel(episode: EpisodeRow): string {
  if (episode.audio_url?.trim()) return "Open audio";
  if (episode.video_url?.trim()) return "Watch";
  if (episode.episode_url?.trim()) return "Listen / open";
  return "Open source";
}
