"use client";

import { useEffect, useRef } from "react";
import type { PlayerTrack } from "@/lib/player/types";
import { artworkUrlForSession } from "@/lib/player/utils";

const SKIP = 15;

type Args = {
  track: PlayerTrack | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
};

function clearMediaSession() {
  try {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  } catch {
    /* ignore */
  }
}

export function useMediaSession({
  track,
  isPlaying,
  duration,
  position,
  onPlay,
  onPause,
  onSeek,
}: Args) {
  const posRef = useRef(position);
  const durRef = useRef(duration);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onSeekRef = useRef(onSeek);

  posRef.current = position;
  durRef.current = duration;
  onPlayRef.current = onPlay;
  onPauseRef.current = onPause;
  onSeekRef.current = onSeek;

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (!track?.playbackUrl) {
      clearMediaSession();
      return;
    }

    const origin = window.location.origin;
    const art = artworkUrlForSession(track.artworkUrl, origin);

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.subtitle,
        artwork: [
          { src: art, sizes: "512x512", type: "image/png" },
          { src: art, sizes: "256x256", type: "image/png" },
        ],
      });
    } catch {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.subtitle,
        });
      } catch {
        /* ignore */
      }
    }

    try {
      navigator.mediaSession.setActionHandler("play", () => onPlayRef.current());
      navigator.mediaSession.setActionHandler("pause", () => onPauseRef.current());
      navigator.mediaSession.setActionHandler("seekbackward", (d) => {
        const sec = d.seekOffset ?? SKIP;
        const p = posRef.current;
        onSeekRef.current(Math.max(0, p - sec));
      });
      navigator.mediaSession.setActionHandler("seekforward", (d) => {
        const sec = d.seekOffset ?? SKIP;
        const p = posRef.current;
        const dur = durRef.current || p + sec;
        onSeekRef.current(Math.min(dur, p + sec));
      });
    } catch {
      /* unsupported */
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
      } catch {
        /* ignore */
      }
      clearMediaSession();
    };
  }, [track?.id, track?.playbackUrl, track?.title, track?.subtitle, track?.artworkUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if (!track?.playbackUrl) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying, track?.playbackUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if (!track?.playbackUrl || duration <= 0 || !Number.isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(duration, Math.max(0, position)),
      });
    } catch {
      /* ignore */
    }
  }, [track?.playbackUrl, duration, position]);
}
