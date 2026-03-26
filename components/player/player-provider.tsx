"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { PlayerTrack } from "@/lib/player/types";
import { initialPlayerState } from "@/lib/player/types";
import { playerReducer } from "@/lib/player/reducer";
import { PlayerContext } from "@/lib/player/context";
import { GlobalPlayer } from "@/components/player/global-player";

const VOLUME_KEY = "deep-well-audio-volume";
const MUTED_KEY = "deep-well-audio-muted";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const v = localStorage.getItem(VOLUME_KEY);
      if (v != null) {
        const n = Number(v);
        if (!Number.isNaN(n)) dispatch({ type: "SET_VOLUME", volume: n });
      }
      const m = localStorage.getItem(MUTED_KEY);
      if (m === "1") dispatch({ type: "SET_MUTED", muted: true });
    } catch {
      /* ignore */
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(state.volume));
      localStorage.setItem(MUTED_KEY, state.muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [state.volume, state.muted]);

  const currentTrack =
    state.queue.length > 0 && state.currentIndex >= 0 && state.currentIndex < state.queue.length
      ? state.queue[state.currentIndex]!
      : null;

  const playTrack = useCallback((track: PlayerTrack, mode: "replace" | "queue" = "replace") => {
    dispatch({ type: "PLAY_TRACK", track, mode });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      audioRef,
      playTrack,
      currentTrack,
    }),
    [state, playTrack, currentTrack]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <GlobalPlayer />
    </PlayerContext.Provider>
  );
}
