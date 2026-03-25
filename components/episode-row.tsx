import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import type { EpisodeRow as Episode, EpisodeWithShow } from "@/lib/types";
import { FavoriteButton } from "@/components/buttons/favorite-button";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { SimpleAudioPlayer } from "@/components/player/simple-audio";
import { formatDate, formatDuration } from "@/lib/format";
import { episodeListDescription } from "@/lib/present";

type Props = {
  episode: Episode | EpisodeWithShow;
  showSlug?: string;
  showOfficialUrl?: string | null;
  favorited?: boolean;
  showFavorite?: boolean;
  /** Passed to Favorite when login redirect is needed (e.g. current show URL). */
  favoriteReturnPath?: string;
};

function showFromEpisode(ep: Episode | EpisodeWithShow): EpisodeWithShow["show"] | undefined {
  return "show" in ep ? ep.show : undefined;
}

function outboundClass() {
  return "inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-white";
}

function listenPrimaryClass() {
  return "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90";
}

export function EpisodeRow({
  episode,
  showSlug,
  showOfficialUrl,
  favorited = false,
  showFavorite = true,
  favoriteReturnPath,
}: Props) {
  const audio = episode.audio_url?.trim() || null;
  const video = episode.video_url?.trim() || null;
  const epLink = episode.episode_url?.trim() || null;
  const official = showOfficialUrl?.trim() || null;
  const embeddedShow = showFromEpisode(episode);
  const resolvedSlug = showSlug ?? embeddedShow?.slug;
  const resolvedShowTitle = embeddedShow?.title;
  const descriptionPlain = episodeListDescription(episode.description);

  return (
    <div className="card flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-1 items-start gap-4">
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-slate-950">
          <Play className="h-5 w-5 fill-current" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge source={episode.source_type} />
            <MeatyPill score={episode.meaty_score} />
          </div>
          {resolvedShowTitle ? (
            <p className="mt-2 text-sm font-medium text-amber-100/90">
              {resolvedSlug ? (
                <Link href={`/shows/${resolvedSlug}`} className="hover:text-white hover:underline">
                  {resolvedShowTitle}
                </Link>
              ) : (
                resolvedShowTitle
              )}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(episode.published_at)}
            {episode.duration_seconds != null ? ` · ${formatDuration(episode.duration_seconds)}` : null}
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            <Link href={`/episodes/${episode.id}`} className="hover:text-amber-100">
              {episode.title}
            </Link>
          </h3>
          {descriptionPlain ? (
            <p className="mt-2 text-sm leading-6 text-muted line-clamp-3">{descriptionPlain}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {(episode.topic_tags ?? []).slice(0, 8).map((topic) => (
              <span key={topic} className="rounded-full border border-line px-3 py-1 text-xs text-slate-300">
                {topic}
              </span>
            ))}
            {(episode.scripture_tags ?? []).slice(0, 6).map((verse) => (
              <span
                key={verse}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-amber-200"
              >
                {verse}
              </span>
            ))}
          </div>

          {audio ? <SimpleAudioPlayer src={audio} title={episode.title} /> : null}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:items-end">
        <Link href={`/episodes/${episode.id}`} className={listenPrimaryClass()}>
          <Play className="h-4 w-4 fill-current" aria-hidden />
          Listen
        </Link>

        {showFavorite ? (
          <FavoriteButton episodeId={episode.id} initial={favorited} returnPath={favoriteReturnPath} />
        ) : null}

        {video ? (
          <a href={video} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            Watch
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {audio && epLink ? (
          <a href={epLink} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            Open episode page
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {!video && epLink && !audio ? (
          <a href={epLink} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            Listen / open
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {!epLink && !video && audio ? (
          <a href={audio} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            Open audio file
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {!video && !epLink && !audio && official ? (
          <a href={official} target="_blank" rel="noreferrer noopener" className={outboundClass()}>
            Official source
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        {showSlug ? (
          <Link href={`/shows/${showSlug}`} className={outboundClass()}>
            Show page
            <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
