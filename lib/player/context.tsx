"use client";

import { createContext, useContext } from "react";
import type { PlayerStoreState, PlayerTrack } from "@/lib/player/types";
import type { PlayerAction } from "@/lib/player/actions";

export type PlayerContextValue = {
  state: PlayerStoreState;
  dispatch: React.Dispatch<PlayerAction>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (track: PlayerTrack, mode?: "replace" | "queue") => void;
  currentTrack: PlayerTrack | null;
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
