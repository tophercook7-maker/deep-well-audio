"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type BibleNowPlayingMeta = {
  bookId: string;
  bookLabel: string;
  chapter: number;
  translationLabel: string;
};

type PassageEndHandler = () => void;

export type BibleNarrationPlayerApi = {
  duration: number;
  currentTime: number;
  playing: boolean;
  canPlay: boolean;
  isSourceLoaded: boolean;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromBlob: (blob: Blob) => Promise<void>;
  clearSource: () => void;
  seek: (t: number) => void;
  setPlaybackRate: (r: number) => void;
  play: () => void;
  pause: () => void;
  getDuration: () => number;
};

type BibleNarrationContextValue = {
  player: BibleNarrationPlayerApi;
  nowPlaying: BibleNowPlayingMeta | null;
  setNowPlaying: (meta: BibleNowPlayingMeta | null) => void;
  registerPassageEnd: (fn: PassageEndHandler | null) => void;
};

const BibleNarrationContext = createContext<BibleNarrationContextValue | null>(null);

function useNarrationEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastBlobUrl = useRef<string | null>(null);
  const passageEndRef = useRef<PassageEndHandler | null>(null);
  const pauseFadeRafRef = useRef<number | null>(null);
  const nominalVolumeRef = useRef(1);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isSourceLoaded, setIsSourceLoaded] = useState(false);

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
      passageEndRef.current?.();
    };

    a.addEventListener("timeupdate", syncTime);
    a.addEventListener("durationchange", syncDur);
    a.addEventListener("loadedmetadata", syncDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("canplay", onCanPlay);

    return () => {
      if (pauseFadeRafRef.current != null) {
        cancelAnimationFrame(pauseFadeRafRef.current);
        pauseFadeRafRef.current = null;
      }
      a.volume = nominalVolumeRef.current;
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

  const registerPassageEnd = useCallback((fn: PassageEndHandler | null) => {
    passageEndRef.current = fn;
  }, []);

  const loadFromUrl = useCallback((url: string): Promise<void> => {
    const a = audioRef.current;
    if (!a) return Promise.reject(new Error("Audio not ready"));

    return new Promise((resolve, reject) => {
      if (lastBlobUrl.current) {
        URL.revokeObjectURL(lastBlobUrl.current);
        lastBlobUrl.current = null;
      }

      const onOk = () => {
        a.removeEventListener("error", onBad);
        setCanPlay(true);
        setIsSourceLoaded(true);
        resolve();
      };
      const onBad = () => {
        a.removeEventListener("canplay", onOk);
        reject(new Error("Could not load audio"));
      };
      a.addEventListener("canplay", onOk, { once: true });
      a.addEventListener("error", onBad, { once: true });

      setCanPlay(false);
      setDuration(0);
      setCurrentTime(0);
      a.crossOrigin = "anonymous";
      a.src = url;
      a.load();
    });
  }, []);

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
        setIsSourceLoaded(true);
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
    if (pauseFadeRafRef.current != null) {
      cancelAnimationFrame(pauseFadeRafRef.current);
      pauseFadeRafRef.current = null;
    }
    a.volume = nominalVolumeRef.current;
    a.pause();
    a.removeAttribute("crossOrigin");
    a.removeAttribute("src");
    a.load();
    setCanPlay(false);
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    setIsSourceLoaded(false);
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

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (pauseFadeRafRef.current != null) {
      cancelAnimationFrame(pauseFadeRafRef.current);
      pauseFadeRafRef.current = null;
    }
    a.volume = nominalVolumeRef.current;
    void a.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (!a || a.paused) return;
    if (pauseFadeRafRef.current != null) {
      cancelAnimationFrame(pauseFadeRafRef.current);
      pauseFadeRafRef.current = null;
    }
    const restore = nominalVolumeRef.current;
    const start = performance.now();
    const durMs = 140;
    const tick = (now: number) => {
      const el = audioRef.current;
      if (!el) return;
      const t = Math.min(1, (now - start) / durMs);
      el.volume = restore * (1 - t);
      if (t < 1) {
        pauseFadeRafRef.current = requestAnimationFrame(tick);
      } else {
        el.pause();
        el.volume = restore;
        pauseFadeRafRef.current = null;
      }
    };
    pauseFadeRafRef.current = requestAnimationFrame(tick);
  }, []);

  const getDuration = useCallback(() => {
    const a = audioRef.current;
    return a && Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
  }, []);

  const player: BibleNarrationPlayerApi = useMemo(
    () => ({
      duration,
      currentTime,
      playing,
      canPlay,
      isSourceLoaded,
      loadFromUrl,
      loadFromBlob,
      clearSource,
      seek,
      setPlaybackRate,
      play,
      pause,
      getDuration,
    }),
    [
      duration,
      currentTime,
      playing,
      canPlay,
      isSourceLoaded,
      loadFromUrl,
      loadFromBlob,
      clearSource,
      seek,
      setPlaybackRate,
      play,
      pause,
      getDuration,
    ],
  );

  return { player, registerPassageEnd };
}

export function BibleNarrationProvider({ children }: { children: ReactNode }) {
  const { player, registerPassageEnd } = useNarrationEngine();
  const [nowPlaying, setNowPlaying] = useState<BibleNowPlayingMeta | null>(null);

  const value = useMemo(
    () => ({
      player,
      nowPlaying,
      setNowPlaying,
      registerPassageEnd,
    }),
    [player, nowPlaying, registerPassageEnd],
  );

  return <BibleNarrationContext.Provider value={value}>{children}</BibleNarrationContext.Provider>;
}

export function useBibleNarration(): BibleNarrationContextValue {
  const ctx = useContext(BibleNarrationContext);
  if (!ctx) {
    throw new Error("useBibleNarration must be used within BibleNarrationProvider");
  }
  return ctx;
}
