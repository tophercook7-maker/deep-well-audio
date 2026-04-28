import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getFavoriteEpisodeIds, getSavedShowIds, getShowBySlug } from "@/lib/queries";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { EpisodeRow } from "@/components/episode-row";
import { SaveShowButton } from "@/components/buttons/save-show-button";
import { BackButton } from "@/components/buttons/back-button";
import { MeatyPill } from "@/components/buttons/meaty-pill";
import { SourceBadge } from "@/components/buttons/source-badge";
import { ShowOutboundLinks } from "@/components/shows/show-links";
import { categoryLabel } from "@/lib/format";
import { getShowDisplayLabel } from "@/lib/display";
import { clampSummary, stripHtmlToPlain } from "@/lib/present";
import { RemoteArtwork } from "@/components/artwork/remote-artwork";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";

type ShowRouteParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ShowRouteParams): Promise<Metadata> {
  const { slug } = await params;
  const { show } = await getShowBySlug(typeof slug === "string" ? slug : "");

  if (!show) {
    return {
      title: "Show not found",
      description: "This Deep Well Audio show could not be found.",
    };
  }

  const title = getShowDisplayLabel(show.title, show.slug);
  const description = clampSummary(show.summary || show.description || `${title} on Deep Well Audio.`, 160);
  const image = normalizeArtworkSrc(show.artwork_url) ?? FALLBACK_ARTWORK_PATH;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, alt: `${title} artwork` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ShowDetailPage({ params }: ShowRouteParams) {
  const { slug } = await params;
  const safeSlug = typeof slug === "string" ? slug : "";

  const { show, episodes, dataOk } = await getShowBySlug(safeSlug);

  if (!dataOk) {
    return (
      <main className="container-shell py-12 sm:py-14">
        <div className="mb-6 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/browse" label="Back" />
        </div>
        <div className="mt-8 card border-amber-400/25 bg-amber-500/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Temporarily unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">We couldn&apos;t load this program</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            The catalog may be disconnected or still starting. Your link could be fine—try again in a moment, or browse from Explore.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
            >
              Explore directory
            </Link>
            <Link href={"/" as Route} className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!show) {
    notFound();
  }

  let user = null;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  let favoriteIds = new Set<string>();
  let savedIds = new Set<string>();
  try {
    user = await getSessionUser();
    plan = await getUserPlan();
    if (user) {
      const [fav, sav] = await Promise.all([getFavoriteEpisodeIds(user.id), getSavedShowIds(user.id)]);
      favoriteIds = new Set(fav);
      savedIds = new Set(sav);
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const showPremiumSaveFollowUp = plan !== "premium";

  const yt = show.youtube_channel_id ? `https://www.youtube.com/channel/${show.youtube_channel_id}` : null;
  const tagList = Array.isArray(show.tags) ? show.tags : [];
  const showDisplayTitle = getShowDisplayLabel(show.title, show.slug);

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/browse" label="Back" />
      </div>

      <section className="card overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,160px)_1fr] lg:items-start lg:gap-10">
          <div className="overflow-hidden rounded-2xl border border-line/90 bg-soft/40 ring-1 ring-white/[0.04]">
            <RemoteArtwork
              src={show.artwork_url}
              alt={`${showDisplayTitle} artwork`}
              className="aspect-square h-full w-full"
              imgClassName="aspect-square h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">{categoryLabel(show.category)}</span>
              <SourceBadge source={show.source_type} />
              <MeatyPill score={show.meaty_score} />
            </div>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{showDisplayTitle}</h1>
                <p className="mt-3 text-base text-slate-300 sm:text-lg">{show.host}</p>
                <p className="mt-5 max-w-3xl leading-7 text-muted">{clampSummary(show.summary, 420)}</p>
                {show.description ? (
                  <p className="mt-4 max-w-3xl leading-7 text-muted">{clampSummary(stripHtmlToPlain(show.description), 520)}</p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  {tagList.slice(0, 12).map((tag) => (
                    <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 lg:items-end">
                <SaveShowButton
                  showId={show.id}
                  initial={savedIds.has(show.id)}
                  showPremiumSaveFollowUp={showPremiumSaveFollowUp}
                />
              </div>
            </div>

            <ShowOutboundLinks
              officialUrl={show.official_url}
              rssUrl={show.rss_url}
              youtubeChannelUrl={yt}
              appleUrl={show.apple_url}
              spotifyUrl={show.spotify_url}
            />
          </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Episodes</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Latest from this source</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">Newest items first—play in the bar or open the episode page.</p>
        </div>
        {episodes.length ? (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                showSlug={show.slug}
                showOfficialUrl={show.official_url}
                favorited={favoriteIds.has(episode.id)}
                showPremiumSaveFollowUp={showPremiumSaveFollowUp}
              />
            ))}
          </div>
        ) : (
          <div className="card border-dashed border-line/55 bg-soft/20 p-10 text-center text-sm leading-relaxed text-muted">
            Episodes are still being pulled in for this source. Run an RSS sync, or check your feed entry in{" "}
            <code className="rounded bg-soft px-1.5 py-0.5 text-xs text-slate-200">data/source-feeds.ts</code> if this stays empty.
          </div>
        )}
      </section>
    </main>
  );
}
