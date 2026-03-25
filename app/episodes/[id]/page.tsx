import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getEpisodeById, getFavoriteEpisodeIds } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { EpisodeRow } from "@/components/episode-row";
import { BackButton } from "@/components/buttons/back-button";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const safeId = typeof id === "string" ? id : "";

  const { episode, dataOk } = await getEpisodeById(safeId);

  if (!dataOk) {
    return (
      <main className="container-shell py-14">
        <BackButton fallbackHref="/explore" label="Back" />
        <div className="mt-8 card border-amber-400/25 bg-amber-500/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Temporarily unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">We couldn&apos;t load this episode</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            The database may be offline or still configuring. Try again soon, or return to Explore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={"/explore" as Route}
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
  let favoriteIds = new Set<string>();
  try {
    user = await getSessionUser();
    if (user) {
      favoriteIds = new Set(await getFavoriteEpisodeIds(user.id));
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const backFallback = episode.show?.slug ? `/shows/${episode.show.slug}` : "/explore";
  const official = episode.show?.official_url ?? null;

  return (
    <main className="container-shell py-14">
      <BackButton fallbackHref={backFallback} label="Back" />

      <div className="mt-6">
        <EpisodeRow
          episode={episode}
          showSlug={episode.show?.slug}
          showOfficialUrl={official}
          favorited={favoriteIds.has(episode.id)}
          favoriteReturnPath={`/episodes/${episode.id}`}
        />
      </div>
    </main>
  );
}
