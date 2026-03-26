"use client";

import { createContext, useContext } from "react";
import type { PlayerStoreState, PlayerTrack } from "@/lib/player/types";
import type { PlayerAction } from "@/lib/player/actions";

export type PlayerContextValue = {
  state: PlayerStoreState;
  dispatch: React.Dispatch<PlayerAction>;
  /** Shared `<audio>` / `<video>` element for the current resource */
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  playTrack: (track: PlayerTrack, mode?: "replace" | "queue") => void;
  currentTrack: PlayerTrack | null;
  /** Seek the active media element and sync player state (Premium bookmarks, etc.) */
  seekTo: (seconds: number) => void;
};

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function usePlayerOptional() {
  return useContext(PlayerContext);
}
