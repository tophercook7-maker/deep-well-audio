"use client";

import Link from "next/link";
import { ExternalLink, Loader2, Pause, Play } from "lucide-react";
import type { EpisodeRow as Episode, EpisodeWithShow } from "@/lib/types";
import { buildPlayerTrackFromEpisode } from "@/lib/player/build-track";
import { usePlayer } from "@/lib/player/context";

type Props = {
  episode: Episode | EpisodeWithShow;
  showTitle: string;
  showSlug?: string;
  showOfficialUrl?: string | null;
  showArtworkUrl?: string | null;
};

function showFromEpisode(ep: Episode | EpisodeWithShow): EpisodeWithShow["show"] | undefined {
  return "show" in ep ? ep.show : undefined;
}

function outboundClass() {
  return "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]";
}

function primaryClass() {
  return "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]";
}

export function EpisodePlayActions({ episode, showTitle, showSlug, showOfficialUrl, showArtworkUrl }: Props) {
  const { playTrack, dispatch, state, currentTrack } = usePlayer();
  const embedded = showFromEpisode(episode);

  const track = buildPlayerTrackFromEpisode(episode, {
    showTitle,
    showOfficialUrl: showOfficialUrl ?? embedded?.official_url ?? null,
    showArtworkUrl: showArtworkUrl ?? embedded?.artwork_url ?? null,
  });

  const isCurrent = currentTrack?.id === episode.id;
  const loadingThis = isCurrent && state.loading;
  const playingThis = isCurrent && state.isPlaying;

  if (track.playbackUrl) {
    return (
      <div className="flex flex-col gap-2 md:items-end">
        <button
          type="button"
          className={primaryClass()}
          disabled={loadingThis}
          onClick={() => {
            if (isCurrent) {
              dispatch({ type: "TOGGLE_PLAY" });
            } else {
              playTrack(track);
            }
          }}
        >
          {loadingThis ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          ) : playingThis ? (
            <Pause className="h-4 w-4 fill-current shrink-0" aria-hidden />
          ) : (
            <Play className="h-4 w-4 fill-current shrink-0" aria-hidden />
          )}
          {playingThis ? "Pause" : isCurrent ? "Resume" : "Play"}
        </button>
        <Link href={`/episodes/${episode.id}`} className={outboundClass()}>
          Episode page
        </Link>
        {track.externalUrl && track.externalUrl !== track.playbackUrl ? (
          <a href={track.externalUrl} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            {track.externalLabel}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        {showSlug ? (
          <Link href={`/shows/${showSlug}`} className={outboundClass()}>
            Show page
          </Link>
        ) : null}
      </div>
    );
  }

  if (track.externalUrl) {
    return (
      <div className="flex flex-col gap-2 md:items-end">
        <a href={track.externalUrl} target="_blank" rel="noreferrer noopener" className={primaryClass()}>
          {track.externalLabel}
          <ExternalLink className="h-4 w-4" />
        </a>
        <Link href={`/episodes/${episode.id}`} className={outboundClass()}>
          Episode page
        </Link>
        {showSlug ? (
          <Link href={`/shows/${showSlug}`} className={outboundClass()}>
            Show page
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:items-end text-right text-xs text-slate-500">
      <p>No audio link for this episode yet.</p>
      <Link href={`/episodes/${episode.id}`} className={outboundClass()}>
        Episode page
      </Link>
    </div>
  );
}
