import type { PlayerTrack } from "@/lib/player/types";

export type PlayerAction =
  | { type: "PLAY_TRACK"; track: PlayerTrack; mode?: "replace" | "queue" }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_PLAYING"; playing: boolean }
  | { type: "SET_CURRENT_TIME"; time: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_MUTED"; muted: boolean }
  | { type: "TOGGLE_MUTED" }
  | { type: "SET_EXPANDED"; expanded: boolean }
  | { type: "TOGGLE_EXPANDED" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_CAN_PLAY"; canPlay: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "CLOSE_PLAYER" }
  | { type: "MEDIA_ENDED" }
  | { type: "SEEK"; time: number };
