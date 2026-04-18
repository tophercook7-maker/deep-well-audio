import Link from "next/link";
import type { Route } from "next";
import { EpisodeRow } from "@/components/episode-row";
import { resolveStudyTagsToCatalogTags } from "@/content/study/resolve-catalog-tags";
import { getEpisodesByTopicTags, getFavoriteEpisodeIds, type EpisodesByTopicTagsOptions } from "@/lib/queries";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

const LIMIT = 6;

type Props = {
  tags: string[];
  /** Study topic slug (e.g. `anxiety`) — prioritizes `study_support_topic_slugs` + evergreen in queries. */
  studyTopicSlug?: string | null;
  heading?: string;
  intro?: string;
};

/**
 * Supporting Deep Well audio—always below study content; de-emphasized visually.
 */
export async function StudySupportingTeachings({
  tags,
  studyTopicSlug = null,
  heading = "Related teaching for deeper study",
  intro = "Optional listening that overlaps these themes. The study above remains primary.",
}: Props) {
  const catalogTags = resolveStudyTagsToCatalogTags(tags);
  if (catalogTags.length === 0) return null;

  const opts: EpisodesByTopicTagsOptions | undefined =
    studyTopicSlug && studyTopicSlug.trim() ? { studyTopicSlug: studyTopicSlug.trim() } : undefined;
  const { episodes, dataOk } = await getEpisodesByTopicTags(catalogTags, LIMIT, opts);
  if (!dataOk || episodes.length === 0) return null;

  let favoriteIds = new Set<string>();
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    const user = await getSessionUser();
    plan = await getUserPlan();
    if (user) favoriteIds = new Set(await getFavoriteEpisodeIds(user.id));
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  return (
    <section
      className="mt-14 border-t border-line/45 pt-10"
      aria-labelledby="study-supporting-audio-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Supporting audio</p>
      <h2 id="study-supporting-audio-heading" className="mt-2 text-lg font-semibold text-slate-200 sm:text-xl">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{intro}</p>
      <div className="mt-6 space-y-3 opacity-95">
        {episodes.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            showSlug={episode.show?.slug}
            showOfficialUrl={episode.show?.official_url}
            favorited={favoriteIds.has(episode.id)}
            showFavorite
            showPremiumSaveFollowUp={plan !== "premium"}
          />
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Prefer topical hubs?{" "}
        <Link href={"/browse" as Route} className="font-medium text-amber-200/80 underline-offset-2 hover:underline">
          Browse the directory
        </Link>
        .
      </p>
    </section>
  );
}
