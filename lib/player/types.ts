/**
 * Global persistent player domain types.
 */

export type PlayerPlaybackKind = "audio" | "video-file";

/** Normalized track for the site-wide player (episode-sourced or future sources). */
export type PlayerTrack = {
  id: string;
  title: string;
  /** Show / source display name */
  subtitle: string;
  audioUrl: string | null;
  videoUrl: string | null;
  episodeUrl: string | null;
  artworkUrl: string | null;
  sourceType: string;
  durationSeconds?: number | null;
  /** Resolved URL for the shared `<audio>` element when inline playback is supported */
  playbackUrl: string | null;
  playbackKind: PlayerPlaybackKind | null;
  /** Page or file to open when inline playback is unavailable or fails */
  externalUrl: string | null;
  externalLabel: string;
};

export type PlayerStoreState = {
  queue: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  expanded: boolean;
  /** False after user dismisses until a new track plays */
  visible: boolean;
  loading: boolean;
  error: string | null;
  /** True after `canplay` for the current resource; false while buffering initial data */
  canPlay: boolean;
};

export const initialPlayerState: PlayerStoreState = {
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  expanded: false,
  visible: false,
  loading: false,
  error: null,
  canPlay: false,
};
