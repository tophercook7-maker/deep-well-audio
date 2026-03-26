/**
 * Global player state shape and defaults.
 * Runtime state uses React context + `playerReducer` (`lib/player/reducer.ts`), not Zustand—this module is the single import surface for types/helpers.
 */
export type { PlayerStoreState, PlayerTrack, PlayerPlaybackKind } from "@/lib/player/types";
export { initialPlayerState } from "@/lib/player/types";
export { artworkUrlForSession, hasInlinePlayback } from "@/lib/player/utils";
