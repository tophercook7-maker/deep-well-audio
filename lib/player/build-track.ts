import type { EpisodeRow, EpisodeWithShow } from "@/lib/types";
import { normalizeArtworkSrc } from "@/lib/artwork";
import { getEpisodeDisplayTitle, getShowDisplayLabel } from "@/lib/display";
import { getOutboundListenUrl, getOutboundLabel } from "@/lib/episode-playback";
import type { PlayerPlaybackKind, PlayerTrack } from "@/lib/player/types";
import {
  isLikelyDirectAudioFile,
  isLikelyDirectVideoFile,
  isYouTubeOrHostedPlayer,
} from "@/lib/player/utils";

export function buildPlayerTrackFromEpisode(
  episode: EpisodeRow | EpisodeWithShow,
  opts: { showTitle: string; showOfficialUrl?: string | null; showArtworkUrl?: string | null }
): PlayerTrack {
  const audio = episode.audio_url?.trim() || null;
  const video = episode.video_url?.trim() || null;
  const epPage = episode.episode_url?.trim() || null;
  const official = opts.showOfficialUrl?.trim() || null;

  const show = "show" in episode ? episode.show : undefined;
  const showLabel = getShowDisplayLabel(opts.showTitle, show?.slug);
  const displayTitle = getEpisodeDisplayTitle(episode, showLabel);

  const art =
    normalizeArtworkSrc(episode.artwork_url) ??
    normalizeArtworkSrc(opts.showArtworkUrl) ??
    normalizeArtworkSrc(show?.artwork_url) ??
    null;

  let playbackUrl: string | null = null;
  let playbackKind: PlayerPlaybackKind | null = null;
  let externalUrl: string | null = null;
  let externalLabel = "Open source";

  if (audio) {
    playbackUrl = audio;
    playbackKind = "audio";
    externalUrl = epPage ?? getOutboundListenUrl(episode, official);
    externalLabel = epPage ? "Episode page" : getOutboundLabel(episode);
  } else if (video && !isYouTubeOrHostedPlayer(video)) {
    if (isLikelyDirectVideoFile(video) || isLikelyDirectAudioFile(video)) {
      playbackUrl = video;
      playbackKind = "video-file";
    }
    externalUrl = video;
    externalLabel = "Watch";
  } else if (video && isYouTubeOrHostedPlayer(video)) {
    externalUrl = video;
    externalLabel = "Watch";
  } else if (epPage) {
    externalUrl = epPage;
    externalLabel = "Listen on source";
  } else if (official) {
    externalUrl = official;
    externalLabel = "Official source";
  }

  if (!playbackUrl && !externalUrl) {
    externalUrl = null;
    externalLabel = "Unavailable";
  }

  return {
    id: episode.id,
    title: displayTitle,
    subtitle: showLabel,
    showSlug: show?.slug,
    audioUrl: audio,
    videoUrl: video,
    episodeUrl: epPage,
    artworkUrl: art,
    sourceType: episode.source_type,
    durationSeconds: episode.duration_seconds,
    playbackUrl,
    playbackKind,
    externalUrl,
    externalLabel,
  };
}
