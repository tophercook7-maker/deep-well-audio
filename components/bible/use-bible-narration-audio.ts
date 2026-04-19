"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BibleNarrationAudioCallbacks = {
  onEnded?: () => void;
};

/**
 * HTML5 audio for narrated Bible chapters (MP3 from TTS API).
 */
export function useBibleNarrationAudio(callbacks?: BibleNarrationAudioCallbacks) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastBlobUrl = useRef<string | null>(null);
  const onEndedRef = useRef(callbacks?.onEnded);
  onEndedRef.current = callbacks?.onEnded;

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const a = new Audio();
    a.preload = "auto";
    audioRef.current = a;

    const syncTime = () => setCurrentTime(a.currentTime);
    const syncDur = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onCanPlay = () => setCanPlay(true);
    const onEnded = () => {
      setPlaying(false);
      syncTime();
      onEndedRef.current?.();
    };

    a.addEventListener("timeupdate", syncTime);
    a.addEventListener("durationchange", syncDur);
    a.addEventListener("loadedmetadata", syncDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("canplay", onCanPlay);

    return () => {
      a.pause();
      a.removeEventListener("timeupdate", syncTime);
      a.removeEventListener("durationchange", syncDur);
      a.removeEventListener("loadedmetadata", syncDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("canplay", onCanPlay);
      a.src = "";
      audioRef.current = null;
      if (lastBlobUrl.current) {
        URL.revokeObjectURL(lastBlobUrl.current);
        lastBlobUrl.current = null;
      }
    };
  }, []);

  /** Assign MP3 blob and wait until the browser can play it. */
  const loadFromBlob = useCallback((blob: Blob): Promise<void> => {
    const a = audioRef.current;
    if (!a) return Promise.reject(new Error("Audio not ready"));

    return new Promise((resolve, reject) => {
      if (lastBlobUrl.current) {
        URL.revokeObjectURL(lastBlobUrl.current);
        lastBlobUrl.current = null;
      }
      const url = URL.createObjectURL(blob);
      lastBlobUrl.current = url;

      const onOk = () => {
        a.removeEventListener("error", onBad);
        setCanPlay(true);
        resolve();
      };
      const onBad = () => {
        a.removeEventListener("canplay", onOk);
        reject(new Error("Could not decode audio"));
      };
      a.addEventListener("canplay", onOk, { once: true });
      a.addEventListener("error", onBad, { once: true });

      setCanPlay(false);
      setDuration(0);
      setCurrentTime(0);
      a.src = url;
      a.load();
    });
  }, []);

  const clearSource = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src");
    a.load();
    setCanPlay(false);
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    if (lastBlobUrl.current) {
      URL.revokeObjectURL(lastBlobUrl.current);
      lastBlobUrl.current = null;
    }
  }, []);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    const next = Math.max(0, Math.min(t, Number.isFinite(a.duration) ? a.duration : t));
    a.currentTime = next;
    setCurrentTime(next);
  }, []);

  const setPlaybackRate = useCallback((r: number) => {
    const a = audioRef.current;
    if (a) a.playbackRate = r;
  }, []);

  const play = useCallback(() => audioRef.current?.play().catch(() => {}), []);
  const pause = useCallback(() => audioRef.current?.pause(), []);

  const getDuration = useCallback(() => {
    const a = audioRef.current;
    return a && Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
  }, []);

  return {
    duration,
    currentTime,
    playing,
    canPlay,
    loadFromBlob,
    clearSource,
    seek,
    setPlaybackRate,
    play,
    pause,
    getDuration,
  };
}
