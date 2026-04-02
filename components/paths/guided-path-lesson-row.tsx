"use client";

import Link from "next/link";
import type { Route } from "next";
import { ExternalLink, Loader2, Pause, Play } from "lucide-react";
import type { EpisodeWithShow } from "@/lib/types";
import { buildPlayerTrackFromEpisode } from "@/lib/player/build-track";
import { getShowDisplayLabel } from "@/lib/display";
import { usePlayer } from "@/lib/player/context";

type Props = {
  index: number;
  title: string;
  episode: EpisodeWithShow | null;
};

export function GuidedPathLessonRow({ index, title, episode }: Props) {
  const { playTrack, dispatch, state, currentTrack } = usePlayer();

  if (!episode) {
    return (
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
        <span className="w-6 shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-500">{index}</span>
        <p className="min-w-0 flex-1 text-sm font-medium text-slate-400">{title}</p>
      </div>
    );
  }

  const showLabel = getShowDisplayLabel(episode.show?.title, episode.show?.slug);
  const track = buildPlayerTrackFromEpisode(episode, {
    showTitle: showLabel,
    showOfficialUrl: episode.show?.official_url ?? null,
    showArtworkUrl: episode.show?.artwork_url ?? null,
  });

  const isCurrent = currentTrack?.id === episode.id;
  const loadingThis = isCurrent && state.loading;
  const playingThis = isCurrent && state.isPlaying;
  const canPlayInApp = Boolean(track.playbackUrl);

  function handleActivate() {
    if (!canPlayInApp) return;
    if (isCurrent) {
      dispatch({ type: "TOGGLE_PLAY" });
    } else {
      playTrack(track);
    }
  }

  if (canPlayInApp) {
    return (
      <button
        type="button"
        onClick={handleActivate}
        disabled={loadingThis}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition hover:bg-soft/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 sm:px-5"
      >
        <span className="w-6 shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-500">{index}</span>
        <span className="min-w-0 flex-1 text-sm font-medium text-white">{title}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-amber-200/90">
          {loadingThis ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="sr-only">Loading</span>
            </>
          ) : playingThis ? (
            <>
              <Pause className="h-4 w-4 fill-current" aria-hidden />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" aria-hidden />
              Play
            </>
          )}
        </span>
      </button>
    );
  }

  if (track.externalUrl) {
    return (
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
        <span className="w-6 shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-500">{index}</span>
        <p className="min-w-0 flex-1 text-sm font-medium text-white">{title}</p>
        <a
          href={track.externalUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-amber-200/90 underline-offset-2 hover:text-amber-100 hover:underline"
        >
          Play
          <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
      <span className="w-6 shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-500">{index}</span>
      <Link
        href={`/episodes/${episode.id}` as Route}
        className="min-w-0 flex-1 text-sm font-medium text-white underline-offset-2 hover:text-amber-100 hover:underline"
      >
        {title}
      </Link>
    </div>
  );
}
