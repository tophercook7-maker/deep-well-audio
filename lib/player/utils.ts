import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import type { PlayerTrack } from "@/lib/player/types";

export function isYouTubeOrHostedPlayer(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("youtube.com/") ||
    u.includes("youtu.be/") ||
    u.includes("vimeo.com/") ||
    u.includes("player.vimeo.com")
  );
}

export function isLikelyDirectAudioFile(url: string): boolean {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp3|m4a|aac|ogg|opus|wav|flac)(\b|$)/i.test(path);
}

export function isLikelyDirectVideoFile(url: string): boolean {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|m4v|mov)(\b|$)/i.test(path);
}

export function hasInlinePlayback(track: PlayerTrack | null | undefined): boolean {
  return Boolean(track?.playbackUrl);
}

/** Absolute artwork URL for Media Session (falls back to site + fallback asset). */
export function artworkUrlForSession(artworkUrl: string | null, origin: string): string {
  const fallback = `${origin.replace(/\/$/, "")}${FALLBACK_ARTWORK_PATH}`;
  const n = normalizeArtworkSrc(artworkUrl);
  if (n) return n;
  return fallback;
}
