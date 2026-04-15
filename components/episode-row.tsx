import Link from "next/link";
import { Play } from "lucide-react";
import type { EpisodeRow as Episode, EpisodeWithShow } from "@/lib/types";
import { FavoriteButton } from "@/components/buttons/favorite-button";
import { EpisodeAddNoteAction } from "@/components/episodes/episode-add-note-action";
import { EpisodeListenSaveHint } from "@/components/episodes/episode-listen-save-hint";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { EpisodePlayActions } from "@/components/player/episode-play-actions";
import { formatDate, formatDuration } from "@/lib/format";
import { getEpisodeDisplayTitle, getShowDisplayLabel } from "@/lib/display";
import { episodeListDescription } from "@/lib/present";
import { formatTopicTagLabel } from "@/lib/topic-infer";
import { getTopicDefinition, normalizeTopicSlug } from "@/lib/topics";
import { ScriptureLinkedText } from "@/components/study/scripture-linked-text";
import { ScriptureTagPills } from "@/components/study/scripture-tag-pills";
import { teachingContentKey } from "@/lib/study/refs";

type Props = {
  episode: Episode | EpisodeWithShow;
  showSlug?: string;
  showOfficialUrl?: string | null;
  favorited?: boolean;
  showFavorite?: boolean;
  /** Richer layout for full episode page. */
  layout?: "list" | "page";
  /** Non-premium: quiet Premium note after saving (from server). */
  showPremiumSaveFollowUp?: boolean;
  /** Episode page only: Add note next to Save (premium = jump to notes; else calm upsell). */
  episodePageNotes?: "premium" | "upsell";
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
  layout = "list",
  showPremiumSaveFollowUp = false,
  episodePageNotes,
}: Props) {
  const embeddedShow = showFromEpisode(episode);
  const resolvedSlug = showSlug ?? embeddedShow?.slug;
  const showLabel = getShowDisplayLabel(embeddedShow?.title, resolvedSlug);
  const displayTitle = getEpisodeDisplayTitle(episode, showLabel);
  const descriptionPlain = episodeListDescription(episode.description);

  const isPage = layout === "page";
  const shell = isPage
    ? "card flex flex-col gap-6 p-6 transition-colors duration-200 hover:border-accent/25 sm:gap-7 sm:p-8"
    : "card flex flex-col gap-5 p-5 transition-colors duration-200 hover:border-accent/20 md:flex-row md:items-start md:justify-between";

  const mainRow = (
    <>
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
            <>
              <p
                className={`mt-2 text-sm leading-6 text-muted ${isPage ? "" : "line-clamp-3"}`}
              >
                {isPage ? (
                  <ScriptureLinkedText text={descriptionPlain} teachingKey={teachingContentKey("episode", episode.id)} />
                ) : (
                  descriptionPlain
                )}
              </p>
              {isPage ? (
                <EpisodeListenSaveHint
                  episodeId={episode.id}
                  initialFavorited={favorited}
                  hasDescription
                  showPremiumSaveFollowUp={showPremiumSaveFollowUp}
                />
              ) : null}
            </>
          ) : isPage ? (
            <EpisodeListenSaveHint
              episodeId={episode.id}
              initialFavorited={favorited}
              hasDescription={false}
              showPremiumSaveFollowUp={showPremiumSaveFollowUp}
            />
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
            <ScriptureTagPills tags={episode.scripture_tags ?? []} teachingKey={teachingContentKey("episode", episode.id)} />
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
        {showFavorite || (isPage && episodePageNotes) ? (
          <div className="flex w-full flex-col items-stretch gap-2 md:items-end">
            <div className="flex flex-wrap items-start justify-end gap-2">
              {showFavorite ? (
                <FavoriteButton
                  episodeId={episode.id}
                  initial={favorited}
                  showPremiumSaveFollowUp={showPremiumSaveFollowUp}
                />
              ) : null}
              {isPage && episodePageNotes ? (
                <EpisodeAddNoteAction episodeId={episode.id} mode={episodePageNotes} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div className={shell}>
      {isPage ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">{mainRow}</div>
      ) : (
        mainRow
      )}
    </div>
  );
}
