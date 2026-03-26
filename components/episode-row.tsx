import Link from "next/link";
import { Play } from "lucide-react";
import type { EpisodeRow as Episode, EpisodeWithShow } from "@/lib/types";
import { FavoriteButton } from "@/components/buttons/favorite-button";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { EpisodePlayActions } from "@/components/player/episode-play-actions";
import { formatDate, formatDuration } from "@/lib/format";
import { getEpisodeDisplayTitle, getShowDisplayLabel } from "@/lib/display";
import { episodeListDescription } from "@/lib/present";
import { formatTopicTagLabel } from "@/lib/topic-infer";
import { getTopicDefinition, normalizeTopicSlug } from "@/lib/topics";

type Props = {
  episode: Episode | EpisodeWithShow;
  showSlug?: string;
  showOfficialUrl?: string | null;
  favorited?: boolean;
  showFavorite?: boolean;
  /** Passed to Favorite when login redirect is needed (e.g. current show URL). */
  favoriteReturnPath?: string;
  /** Richer layout for full episode page. */
  layout?: "list" | "page";
};

function showFromEpisode(ep: Episode | EpisodeWithShow): EpisodeWithShow["show"] | undefined {
  return "show" in ep ? ep.show : undefined;
}

export function EpisodeRow({
  episode,
  showSlug,
  showOfficialUrl,
  favorited = false,
  showFavorite = true,
  favoriteReturnPath,
  layout = "list",
}: Props) {
  const embeddedShow = showFromEpisode(episode);
  const resolvedSlug = showSlug ?? embeddedShow?.slug;
  const showLabel = getShowDisplayLabel(embeddedShow?.title, resolvedSlug);
  const displayTitle = getEpisodeDisplayTitle(episode, showLabel);
  const descriptionPlain = episodeListDescription(episode.description);

  const isPage = layout === "page";
  const shell = isPage
    ? "card flex flex-col gap-6 p-6 transition-colors duration-200 hover:border-accent/25 sm:gap-7 sm:p-8 md:flex-row md:items-start md:justify-between"
    : "card flex flex-col gap-5 p-5 transition-colors duration-200 hover:border-accent/20 md:flex-row md:items-start md:justify-between";

  return (
    <div className={shell}>
      <div className="flex flex-1 items-start gap-4 sm:gap-5">
        <div
          className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent ring-1 ring-accent/40 ${
            isPage ? "h-14 w-14" : "h-12 w-12"
          }`}
        >
          <Play className={`fill-current opacity-90 ${isPage ? "h-6 w-6" : "h-5 w-5"}`} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge source={episode.source_type} />
            <MeatyPill score={episode.meaty_score} />
          </div>
          {showLabel ? (
            <p className="mt-2 text-sm font-medium text-amber-100/90">
              {resolvedSlug ? (
                <Link href={`/shows/${resolvedSlug}`} className="hover:text-white hover:underline">
                  {showLabel}
                </Link>
              ) : (
                showLabel
              )}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(episode.published_at)}
            {episode.duration_seconds != null ? ` · ${formatDuration(episode.duration_seconds)}` : null}
          </p>
          <h3
            className={`mt-1 font-semibold leading-snug tracking-tight text-slate-50 ${
              isPage ? "text-xl sm:text-2xl" : "text-lg"
            }`}
          >
            <Link href={`/episodes/${episode.id}`} className="hover:text-amber-100">
              {displayTitle}
            </Link>
          </h3>
          {descriptionPlain ? (
            <p className="mt-2 text-sm leading-6 text-muted line-clamp-3">{descriptionPlain}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(episode.topic_tags ?? []).slice(0, 5).map((topic) => {
              const def = getTopicDefinition(normalizeTopicSlug(topic));
              const pill =
                "rounded-full border border-line/80 bg-soft/30 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 transition hover:border-accent/40 hover:text-amber-100/85";
              const label = formatTopicTagLabel(topic);
              return def ? (
                <Link key={topic} href={`/topics/${def.slug}`} className={`inline-flex ${pill}`}>
                  {label}
                </Link>
              ) : (
                <span key={topic} className={pill}>
                  {label}
                </span>
              );
            })}
            {(episode.scripture_tags ?? []).slice(0, 6).map((verse) => (
              <span
                key={verse}
                className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-amber-200"
              >
                {verse}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:items-end">
        <EpisodePlayActions
          episode={episode}
          showTitle={showLabel}
          showSlug={resolvedSlug}
          showOfficialUrl={showOfficialUrl ?? embeddedShow?.official_url ?? null}
          showArtworkUrl={embeddedShow?.artwork_url ?? null}
        />
        {showFavorite ? (
          <FavoriteButton episodeId={episode.id} initial={favorited} returnPath={favoriteReturnPath} />
        ) : null}
      </div>
    </div>
  );
}
