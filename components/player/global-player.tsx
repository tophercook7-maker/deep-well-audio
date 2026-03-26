"use client";

import { useCallback, useEffect, useRef } from "react";
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

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalPlayer() {
  const { state, dispatch, audioRef, currentTrack } = usePlayer();
  const seekRectRef = useRef<HTMLDivElement>(null);

  const playbackUrl = currentTrack?.playbackUrl ?? null;
  const visible = state.visible && currentTrack && playbackUrl;

  const applySeek = useCallback(
    (t: number) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(t)) return;
      el.currentTime = t;
      dispatch({ type: "SET_CURRENT_TIME", time: t });
    },
    [audioRef, dispatch]
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

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.setProperty("--dwa-player-h", "0px");
      return;
    }
    const h = state.expanded ? "148px" : "92px";
    document.documentElement.style.setProperty("--dwa-player-h", h);
    return () => {
      document.documentElement.style.setProperty("--dwa-player-h", "0px");
    };
  }, [visible, state.expanded]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !playbackUrl) return;

    const onTime = () => dispatch({ type: "SET_CURRENT_TIME", time: el.currentTime });
    const onMeta = () => {
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) dispatch({ type: "SET_DURATION", duration: d });
    };
    const onPlayEv = () => dispatch({ type: "SET_PLAYING", playing: true });
    const onPauseEv = () => dispatch({ type: "SET_PLAYING", playing: false });
    const onEnded = () => dispatch({ type: "MEDIA_ENDED" });
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
  }, [playbackUrl, audioRef, dispatch]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !playbackUrl) return;
    el.volume = state.volume;
    el.muted = state.muted;
  }, [state.volume, state.muted, playbackUrl, audioRef]);

  useEffect(() => {
    const el = audioRef.current;
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
  }, [state.isPlaying, playbackUrl, audioRef, dispatch]);

  useEffect(() => {
    const el = audioRef.current;
    if (!visible && el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
  }, [visible, audioRef]);

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
    const el = audioRef.current;
    if (!bar || !el || !canSeek) return;
    const r = bar.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - r.left), r.width);
    applySeek((x / r.width) * state.duration);
  };

  return (
    <>
      <audio ref={audioRef} preload="metadata" className="hidden" playsInline />

      <div
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-accent/25 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.45)]"
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(11,18,32,0.99) 100%)",
        }}
        role="region"
        aria-label="Now playing"
      >
        {state.expanded ? (
          <div className="container-shell mx-auto mb-2 max-w-4xl text-xs text-slate-400">
            {state.queue.length > 1 ? (
              <p>Playing queue ({state.queue.length} tracks) — next starts automatically.</p>
            ) : (
              <p className="text-slate-500">Deep Well Audio</p>
            )}
          </div>
        ) : null}

        <div className="container-shell mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-panel sm:h-14 sm:w-14">
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
              <p className="truncate text-sm font-semibold text-slate-50">{currentTrack.title}</p>
              <p className="truncate text-xs text-amber-100/70">{currentTrack.subtitle}</p>
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
                  <div className="relative h-2.5 w-full rounded-full bg-line/80">
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-accent/90"
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
