import type { PlayerAction } from "@/lib/player/actions";
import { initialPlayerState, type PlayerStoreState } from "@/lib/player/types";

export function playerReducer(state: PlayerStoreState, action: PlayerAction): PlayerStoreState {
  switch (action.type) {
    case "PLAY_TRACK": {
      const mode = action.mode ?? "replace";
      if (mode === "queue" && state.queue.length > 0) {
        return {
          ...state,
          queue: [...state.queue, action.track],
          visible: true,
          error: null,
        };
      }
      return {
        ...state,
        queue: [action.track],
        currentIndex: 0,
        visible: true,
        error: null,
        loading: true,
        currentTime: 0,
        duration: 0,
        isPlaying: true,
        canPlay: false,
      };
    }
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.playing };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.time };
    case "SET_DURATION":
      return { ...state, duration: action.duration };
    case "SET_VOLUME":
      return { ...state, volume: Math.min(1, Math.max(0, action.volume)) };
    case "SET_MUTED":
      return { ...state, muted: action.muted };
    case "TOGGLE_MUTED":
      return { ...state, muted: !state.muted };
    case "SET_EXPANDED":
      return { ...state, expanded: action.expanded };
    case "TOGGLE_EXPANDED":
      return { ...state, expanded: !state.expanded };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "CLOSE_PLAYER":
      return {
        ...initialPlayerState,
        volume: state.volume,
        muted: state.muted,
      };
    case "SEEK":
      return { ...state, currentTime: action.time };
    case "MEDIA_ENDED": {
      const next = state.currentIndex + 1;
      if (next < state.queue.length) {
        return {
          ...state,
          currentIndex: next,
          currentTime: 0,
          duration: 0,
          loading: true,
          isPlaying: true,
          error: null,
          canPlay: false,
        };
      }
      return {
        ...state,
        isPlaying: false,
        currentTime: 0,
      };
    }
    default:
      return state;
  }
}
