import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getEpisodeById, getFavoriteEpisodeIds } from "@/lib/queries";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { getEpisodeBookmarks } from "@/lib/bookmarks";
import { getEpisodeNotes } from "@/lib/notes";
import { EpisodeRow } from "@/components/episode-row";
import { EpisodeBookmarksNotesClient } from "@/components/premium/episode-bookmarks-notes-client";
import { BookmarksNotesLockedPreview } from "@/components/premium/bookmarks-notes-locked-preview";
import { BackButton } from "@/components/buttons/back-button";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { episodeListDescription } from "@/lib/present";
import { EpisodeStudyBlock } from "@/components/study/episode-study-block";
import { TeachingScriptureBehind } from "@/components/study/teaching-scripture-behind";
import { EpisodeRevisitNudge } from "@/components/retention/episode-revisit-nudge";

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = typeof id === "string" ? id : "";

  const { episode, dataOk } = await getEpisodeById(safeId);

  if (!dataOk) {
    return (
      <main className="container-shell py-12 sm:py-14">
        <div className="mb-6 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/browse" label="Back" />
        </div>
        <div className="mt-8 card border-amber-400/25 bg-amber-500/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Temporarily unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">We couldn&apos;t load this episode</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            The database may be offline or still configuring. Try again soon, or return to Explore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
            >
              Explore
            </Link>
            <Link href={"/" as Route} className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!episode) {
    notFound();
  }

  let user = null;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  let favoriteIds = new Set<string>();
  let studyBookmarks: Awaited<ReturnType<typeof getEpisodeBookmarks>> = [];
  let studyNotes: Awaited<ReturnType<typeof getEpisodeNotes>> = [];
  try {
    user = await getSessionUser();
    plan = await getUserPlan();
    if (user) {
      favoriteIds = new Set(await getFavoriteEpisodeIds(user.id));
      if (plan === "premium") {
        [studyBookmarks, studyNotes] = await Promise.all([
          getEpisodeBookmarks(user.id, episode.id),
          getEpisodeNotes(user.id, episode.id),
        ]);
      }
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const backFallback = episode.show?.slug ? `/shows/${episode.show.slug}` : "/browse";
  const official = episode.show?.official_url ?? null;

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref={backFallback} label="Back" />
      </div>

      <EpisodeRevisitNudge episodeId={episode.id} />

      <div className="mt-2">
        <EpisodeRow
          episode={episode}
          showSlug={episode.show?.slug}
          showOfficialUrl={official}
          favorited={favoriteIds.has(episode.id)}
          layout="page"
          showPremiumSaveFollowUp={plan !== "premium"}
          episodePageNotes={user && plan === "premium" ? "premium" : "upsell"}
        />
      </div>

      <TeachingScriptureBehind
        scriptureTags={episode.scripture_tags ?? []}
        descriptionPlain={episodeListDescription(episode.description) ?? ""}
      />

      {plan === "premium" && user ? (
        <EpisodeBookmarksNotesClient
          episodeId={episode.id}
          initialBookmarks={studyBookmarks}
          initialNotes={studyNotes}
        />
      ) : (
        <BookmarksNotesLockedPreview />
      )}

      <EpisodeStudyBlock
        description={episodeListDescription(episode.description) ?? ""}
        episodeId={episode.id}
        plan={plan}
      />
    </main>
  );
}
