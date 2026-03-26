"use client";

import { useCallback, useEffect, useRef, type Ref } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { usePlayer } from "@/lib/player/context";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import { useMediaSession } from "@/hooks/use-media-session";
import type { PlayerTrack } from "@/lib/player/types";
import {
  flushProgressFromAudio,
  MIN_RESUME_SECONDS,
  MIN_REMAINING_SECONDS,
  NEAR_END_RATIO,
  saveListeningProgress,
  touchRecentPlayback,
} from "@/lib/listening-progress";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalPlayer() {
  const { state, dispatch, mediaRef, currentTrack } = usePlayer();
  const seekRectRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<PlayerTrack | null>(null);
  const resumeAppliedKeyRef = useRef<string | null>(null);
  const wasPlayingRef = useRef(false);

  const playbackUrl = currentTrack?.playbackUrl ?? null;
  const visible = state.visible && currentTrack && playbackUrl;

  useEffect(() => {
    trackRef.current = currentTrack ?? null;
  }, [currentTrack]);

  useEffect(() => {
    resumeAppliedKeyRef.current = null;
  }, [playbackUrl]);

  const applySeek = useCallback(
    (t: number) => {
      const el = mediaRef.current;
      if (!el || !Number.isFinite(t)) return;
      el.currentTime = t;
      dispatch({ type: "SET_CURRENT_TIME", time: t });
    },
    [mediaRef, dispatch]
  );

  const onPlay = useCallback(() => dispatch({ type: "SET_PLAYING", playing: true }), [dispatch]);
  const onPause = useCallback(() => dispatch({ type: "SET_PLAYING", playing: false }), [dispatch]);

  useMediaSession({
    track: visible ? currentTrack : null,
    isPlaying: state.isPlaying,
    duration: state.duration,
    position: state.currentTime,
    onPlay,
    onPause,
    onSeek: applySeek,
  });

  /** Apply saved resume position once per load. */
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !playbackUrl || !currentTrack?.resumeAtSeconds) return;
    const seek = currentTrack.resumeAtSeconds;
    if (!Number.isFinite(seek) || seek < MIN_RESUME_SECONDS) return;
    if (!state.canPlay && el.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;

    const key = `${currentTrack.id}:${playbackUrl}:${seek}`;
    if (resumeAppliedKeyRef.current === key) return;

    const dur =
      el.duration > 0 && Number.isFinite(el.duration)
        ? el.duration
        : currentTrack.durationSeconds && currentTrack.durationSeconds > 0
          ? currentTrack.durationSeconds
          : 0;
    if (dur > 0) {
      if (seek / dur >= NEAR_END_RATIO || dur - seek < MIN_REMAINING_SECONDS) {
        resumeAppliedKeyRef.current = key;
        return;
      }
    }

    try {
      el.currentTime = seek;
      dispatch({ type: "SET_CURRENT_TIME", time: seek });
    } catch {
      resumeAppliedKeyRef.current = key;
      return;
    }
    resumeAppliedKeyRef.current = key;
  }, [
    playbackUrl,
    state.canPlay,
    currentTrack?.id,
    currentTrack?.resumeAtSeconds,
    currentTrack?.durationSeconds,
    dispatch,
    mediaRef,
    currentTrack,
  ]);

  useEffect(() => {
    if (!visible || !playbackUrl || !state.isPlaying) return;
    const id = window.setInterval(() => {
      const tr = trackRef.current;
      const el = mediaRef.current;
      if (!tr || !el) return;
      const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : tr.durationSeconds ?? 0;
      saveListeningProgress(tr, el.currentTime, dur);
    }, 5000);
    return () => window.clearInterval(id);
  }, [visible, playbackUrl, state.isPlaying, mediaRef]);

  useEffect(() => {
    if (!visible || !playbackUrl || state.isPlaying) return;
    const tr = trackRef.current;
    const el = mediaRef.current;
    if (!tr || !el) return;
    const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : tr.durationSeconds ?? 0;
    saveListeningProgress(tr, el.currentTime, dur);
  }, [visible, playbackUrl, state.isPlaying, mediaRef]);

  useEffect(() => {
    const flush = () => {
      flushProgressFromAudio(trackRef.current, mediaRef.current);
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mediaRef]);

  useEffect(() => {
    if (state.isPlaying && !wasPlayingRef.current && currentTrack?.id) {
      touchRecentPlayback(currentTrack.id, currentTrack);
      const el = mediaRef.current;
      if (el && Number.isFinite(el.currentTime)) {
        const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : currentTrack.durationSeconds ?? 0;
        saveListeningProgress(currentTrack, el.currentTime, dur);
      }
    }
    wasPlayingRef.current = state.isPlaying;
  }, [state.isPlaying, currentTrack, mediaRef]);

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty("--dwa-player-h", "0px");
      return;
    }
    const h = state.expanded ? "164px" : "100px";
    document.documentElement.style.setProperty("--dwa-player-h", h);
    return () => {
      document.documentElement.style.setProperty("--dwa-player-h", "0px");
    };
  }, [visible, state.expanded]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !playbackUrl) return;

    const onTime = () => dispatch({ type: "SET_CURRENT_TIME", time: el.currentTime });
    const onMeta = () => {
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) dispatch({ type: "SET_DURATION", duration: d });
    };
    const onPlayEv = () => dispatch({ type: "SET_PLAYING", playing: true });
    const onPauseEv = () => dispatch({ type: "SET_PLAYING", playing: false });
    const onEnded = () => {
      const elEnd = mediaRef.current;
      const tr = trackRef.current;
      if (elEnd && tr && Number.isFinite(elEnd.duration) && elEnd.duration > 0) {
        saveListeningProgress(tr, elEnd.duration, elEnd.duration);
      }
      dispatch({ type: "MEDIA_ENDED" });
    };
    const onWaiting = () => {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_CAN_PLAY", canPlay: false });
    };
    const onCanPlay = () => {
      dispatch({ type: "SET_LOADING", loading: false });
      dispatch({ type: "SET_CAN_PLAY", canPlay: true });
    };
    const onError = () => {
      dispatch({
        type: "SET_ERROR",
        error: "Could not play this source. Try opening it externally.",
      });
      dispatch({ type: "SET_PLAYING", playing: false });
      dispatch({ type: "SET_LOADING", loading: false });
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlayEv);
    el.addEventListener("pause", onPauseEv);
    el.addEventListener("ended", onEnded);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("error", onError);

    if (el.src !== playbackUrl) {
      el.src = playbackUrl;
      el.load();
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });
      dispatch({ type: "SET_CAN_PLAY", canPlay: false });
    }

    el.volume = state.volume;
    el.muted = state.muted;

    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlayEv);
      el.removeEventListener("pause", onPauseEv);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", onError);
    };
    // Volume/muted: separate effect below — avoids rebinding listeners every slider tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl, mediaRef, dispatch]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !playbackUrl) return;
    el.volume = state.volume;
    el.muted = state.muted;
  }, [state.volume, state.muted, playbackUrl, mediaRef]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !playbackUrl) return;

    if (state.isPlaying) {
      const p = el.play();
      if (p !== undefined) {
        p.catch(() => {
          dispatch({
            type: "SET_ERROR",
            error: "Tap play again — your browser blocked autoplay until you interact with the page.",
          });
          dispatch({ type: "SET_PLAYING", playing: false });
        });
      }
    } else {
      el.pause();
    }
  }, [state.isPlaying, playbackUrl, mediaRef, dispatch]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!visible && el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
  }, [visible, mediaRef]);

  if (!visible || !currentTrack) return null;

  const art = normalizeArtworkSrc(currentTrack.artworkUrl);
  const fallbackSrc = FALLBACK_ARTWORK_PATH;
  const rssDuration =
    currentTrack.durationSeconds != null && currentTrack.durationSeconds > 0
      ? currentTrack.durationSeconds
      : 0;
  const effectiveDuration = state.duration > 0 ? state.duration : rssDuration;
  const canSeek = state.duration > 0;
  const pct =
    state.duration > 0
      ? Math.min(100, (state.currentTime / state.duration) * 100)
      : rssDuration > 0
        ? Math.min(100, (state.currentTime / rssDuration) * 100)
        : 0;

  const seekFromClientX = (clientX: number) => {
    const bar = seekRectRef.current;
    const el = mediaRef.current;
    if (!bar || !el || !canSeek) return;
    const r = bar.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - r.left), r.width);
    applySeek((x / r.width) * state.duration);
  };

  const isVideoFile = currentTrack?.playbackKind === "video-file";

  return (
    <>
      {isVideoFile ? (
        <video
          ref={mediaRef as Ref<HTMLVideoElement>}
          preload="metadata"
          className="hidden"
          playsInline
        />
      ) : (
        <audio
          ref={mediaRef as Ref<HTMLAudioElement>}
          preload="metadata"
          className="hidden"
          playsInline
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-accent/10"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(8,14,26,0.995) 100%)",
        }}
        role="region"
        aria-label="Now playing"
      >
        {state.expanded ? (
          <div className="container-shell mx-auto mb-2 max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Now playing</p>
            {state.queue.length > 1 ? (
              <p className="mt-1 text-xs text-slate-400">
                Queue · {state.queue.length} tracks — next starts automatically.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Deep Well Audio</p>
            )}
          </div>
        ) : null}

        <div className="container-shell mx-auto flex max-w-4xl flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
            <div
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line/90 bg-panel transition-[box-shadow] duration-300 sm:h-14 sm:w-14 ${
                state.isPlaying
                  ? "shadow-[0_0_0_1px_rgba(212,175,55,0.35),0_4px_20px_rgba(0,0,0,0.35)]"
                  : "shadow-sm"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={art ?? fallbackSrc}
                alt={`Artwork for ${currentTrack.title}`}
                className="h-full w-full object-cover"
                width={56}
                height={56}
              />
            </div>
            <div className="min-w-0 flex-1">
              {!state.expanded ? (
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/60">
                  Now playing
                </p>
              ) : null}
              <p className="truncate text-sm font-semibold leading-tight text-slate-50">{currentTrack.title}</p>
              <p className="mt-0.5 truncate text-xs leading-5 text-amber-100/75">{currentTrack.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-[2] flex-col gap-2">
            <div className="flex items-center justify-center gap-3 sm:justify-center">
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_PLAY" })}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-accent text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                aria-label={
                  state.loading && !state.isPlaying
                    ? "Loading audio"
                    : state.isPlaying
                      ? "Pause playback"
                      : "Play"
                }
                aria-busy={state.loading && !state.isPlaying}
              >
                {state.loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : state.isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" aria-hidden />
                ) : (
                  <Play className="h-5 w-5 fill-current" aria-hidden />
                )}
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px] tabular-nums text-slate-400 sm:max-w-md">
                <span className="w-10 shrink-0 text-right">{formatTime(state.currentTime)}</span>
                <div
                  ref={seekRectRef}
                  className={`relative flex h-11 min-h-[44px] flex-1 cursor-pointer items-center rounded-md py-2 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] ${!canSeek ? "cursor-not-allowed opacity-80" : ""}`}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(0, Math.floor(effectiveDuration))}
                  aria-valuenow={Math.floor(state.currentTime)}
                  aria-valuetext={`${formatTime(state.currentTime)} of ${formatTime(effectiveDuration)}`}
                  aria-disabled={!canSeek}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (!canSeek || state.duration <= 0) return;
                    const d = state.duration;
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      applySeek(Math.min(d, state.currentTime + 5));
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      applySeek(Math.max(0, state.currentTime - 5));
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      applySeek(0);
                    } else if (e.key === "End") {
                      e.preventDefault();
                      applySeek(d);
                    }
                  }}
                  onClick={(e) => seekFromClientX(e.clientX)}
                  onPointerDown={(e) => {
                    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                    seekFromClientX(e.clientX);
                  }}
                  onPointerMove={(e) => {
                    if (!(e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) return;
                    seekFromClientX(e.clientX);
                  }}
                  onPointerUp={(e) => {
                    try {
                      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                    } catch {
                      /* ignore */
                    }
                  }}
                  onPointerCancel={(e) => {
                    try {
                      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  <div className="relative h-2 w-full rounded-full bg-line/70 ring-1 ring-inset ring-black/20">
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent/95 to-amber-200/90"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0">{formatTime(effectiveDuration)}</span>
              </div>
            </div>

            {state.error ? (
              <p className="text-center text-xs text-amber-200/90 sm:text-left">{state.error}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            {currentTrack.externalUrl ? (
              <a
                href={currentTrack.externalUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-line px-4 text-xs text-slate-300 transition hover:border-accent/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
              >
                <span className="max-w-[7rem] truncate">{currentTrack.externalLabel}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </a>
            ) : null}

            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_MUTED" })}
                className="rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                aria-label={state.muted ? "Unmute audio" : "Mute audio"}
                aria-pressed={state.muted}
              >
                {state.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.volume}
                onChange={(e) => dispatch({ type: "SET_VOLUME", volume: Number(e.target.value) })}
                className="player-vol h-9 w-24 min-h-[44px] accent-[#d4af37]"
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(state.volume * 100)}
                aria-valuetext={`${Math.round(state.volume * 100)} percent`}
              />
            </div>

            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_EXPANDED" })}
              className="rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
              aria-expanded={state.expanded}
              aria-label={state.expanded ? "Collapse player details" : "Expand player details"}
            >
              {state.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: "CLOSE_PLAYER" })}
              className="rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-amber-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
              aria-label="Close player and stop queue"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2 px-1 sm:hidden">
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_MUTED" })}
            className="rounded-full p-2.5 text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
            aria-label={state.muted ? "Unmute audio" : "Mute audio"}
            aria-pressed={state.muted}
          >
            {state.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={state.volume}
            onChange={(e) => dispatch({ type: "SET_VOLUME", volume: Number(e.target.value) })}
            className="player-vol h-9 min-h-[44px] flex-1 accent-[#d4af37]"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.volume * 100)}
            aria-valuetext={`${Math.round(state.volume * 100)} percent`}
          />
        </div>
      </div>
    </>
  );
}
