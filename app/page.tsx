import Link from "next/link";
import type { Route } from "next";
import { CATEGORY_OPTIONS } from "@/lib/types";
import { getActiveShowCount, getFeaturedShows, getHomeRecentEpisodes } from "@/lib/queries";
import { ShowCard } from "@/components/show-card";
import { EpisodeRow } from "@/components/episode-row";
import { HomeSetupStatusPanel } from "@/components/home-setup-status";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { ArrowRight } from "lucide-react";
import type { EpisodeWithShow, ShowWithMeta } from "@/lib/types";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";
import { getDiscoverTopicCards } from "@/lib/topics";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { createServiceClient } from "@/lib/db";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { HomePremiumValue } from "@/components/home/home-premium-value";
import { HomeFeedbackNote } from "@/components/home/home-feedback-note";
import { HomeJoinCta } from "@/components/home/home-join-cta";
import { HomeFeaturedCurated } from "@/components/home/home-featured-curated";
import { HomeCategoryCuratedPreview } from "@/components/home/home-category-curated-preview";
import { HomeRecentlyAddedCurated } from "@/components/home/home-recently-added-curated";
import { HomeWorldWatchHub } from "@/components/home/home-world-watch-hub";
import { HomeGuidedPaths } from "@/components/home/home-guided-paths";
import { HomeStartHereToday } from "@/components/home/home-start-here-today";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { getHomepageCuratedVideoSlices } from "@/lib/curated-teachings/aggregate";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";

/** Featured strip: calm cap between 3–6 items. */
const HOMEPAGE_FEATURED_LIMIT = 5;
/** Homepage World Watch YouTube pool (must match prior `getWorldWatchYoutubeVideos(12)`). */
const HOMEPAGE_CURATED_WW_YT_LIMIT = 12;
/** Homepage “recently added” curated pool before featured-ID dedupe (prior `getRecentlyAddedCuratedVideos(16)`). */
const HOMEPAGE_CURATED_RECENT_SEED = 16;
const HOMEPAGE_RECENT_EPISODES = 8;
/** Fetch a few extra rows so quick-list can prefer featured sources without starving the recent list. */
const HOMEPAGE_RECENT_POOL = 14;
const HOMEPAGE_QUICK_LIST_MAX = 5;

/** Prefer newest episodes from featured shows, then fill with latest overall (deduped). */
function pickQuickListenEpisodes(
  episodes: EpisodeWithShow[],
  featured: ShowWithMeta[],
  max: number
): EpisodeWithShow[] {
  if (episodes.length === 0 || max <= 0) return [];
  const featuredSlugs = new Set(featured.map((s) => s.slug).filter(Boolean));
  const fromFeatured = episodes.filter((ep) => ep.show?.slug && featuredSlugs.has(ep.show.slug));
  const rest = episodes.filter((ep) => !ep.show?.slug || !featuredSlugs.has(ep.show.slug));
  const merged = [...fromFeatured, ...rest];
  const seen = new Set<string>();
  const out: EpisodeWithShow[] = [];
  for (const ep of merged) {
    if (out.length >= max) break;
    if (seen.has(ep.id)) continue;
    seen.add(ep.id);
    out.push(ep);
  }
  return out;
}

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedShows>> = [];
  let recentPool: Awaited<ReturnType<typeof getHomeRecentEpisodes>> = [];
  let showCount = 0;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  let worldWatchPreview: WorldWatchItemPublic[] = [];
  let homepageFeaturedVideos: CuratedVideoItem[] = [];
  let worldWatchYoutube: CuratedVideoItem[] = [];
  let recentlyAddedCuratedPool: CuratedVideoItem[] = [];
  try {
    const adminClient = createServiceClient();
    const [featuredRes, recentPoolRes, showCountRes, planRes, worldWatchPreviewRes, curatedSlices] = await Promise.all([
      getFeaturedShows(HOMEPAGE_FEATURED_LIMIT),
      getHomeRecentEpisodes(HOMEPAGE_RECENT_POOL),
      getActiveShowCount(),
      getUserPlan(),
      adminClient
        ? fetchPublishedWorldWatchItems(adminClient, 3, { audience: "teaser" }).catch((err) => {
            console.error("home world watch preview:", err instanceof Error ? err.message : err);
            return [] as WorldWatchItemPublic[];
          })
        : Promise.resolve([] as WorldWatchItemPublic[]),
      getHomepageCuratedVideoSlices({
        featuredCount: HOMEPAGE_FEATURED_LIMIT,
        worldWatchLimit: HOMEPAGE_CURATED_WW_YT_LIMIT,
        recentlyAddedLimit: HOMEPAGE_CURATED_RECENT_SEED,
      }).catch((err) => {
        console.error("home curated slices:", err instanceof Error ? err.message : err);
        return {
          homepageFeaturedVideos: [] as CuratedVideoItem[],
          worldWatchYoutube: [] as CuratedVideoItem[],
          recentlyAddedCuratedPool: [] as CuratedVideoItem[],
        };
      }),
    ]);
    featured = featuredRes;
    recentPool = recentPoolRes;
    showCount = showCountRes;
    plan = planRes;
    worldWatchPreview = worldWatchPreviewRes;
    homepageFeaturedVideos = curatedSlices.homepageFeaturedVideos;
    worldWatchYoutube = curatedSlices.worldWatchYoutube;
    recentlyAddedCuratedPool = curatedSlices.recentlyAddedCuratedPool;
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page home:", e instanceof Error ? e.message : e);
  }
  const showSessionListening = canUseFeature("continue_listening", plan);
  const recentForSection = recentPool.slice(0, HOMEPAGE_RECENT_EPISODES);
  const quickListenEpisodes = pickQuickListenEpisodes(recentPool, featured, HOMEPAGE_QUICK_LIST_MAX);
  const hasContent = featured.length > 0 || recentPool.length > 0;
  const recentlyAddedCap = plan === "guest" ? 4 : 8;
  const featuredIds = new Set(homepageFeaturedVideos.map((v) => v.videoId));
  const startHereFeaturedVideo = homepageFeaturedVideos[0] ?? null;
  const homepageFeaturedVideosForGrid = startHereFeaturedVideo ? homepageFeaturedVideos.slice(1) : homepageFeaturedVideos;
  const recentlyAddedCurated = recentlyAddedCuratedPool
    .filter((v) => !featuredIds.has(v.videoId))
    .slice(0, recentlyAddedCap);

  const worldWatchDigestPreview = worldWatchPreview.slice(0, plan === "guest" ? 2 : 3);

  return (
    <main>
      <section className="container-shell py-12 sm:py-16 lg:py-20">
        <div className="min-w-0 max-w-4xl">
            <div className="relative mx-auto mb-6 max-w-md lg:mx-0 lg:max-w-lg">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(12rem,42vw)] w-[min(24rem,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.14),transparent_68%)] opacity-90 blur-[2px]"
                aria-hidden
              />
              <div className="relative flex justify-center lg:justify-start">
                <DeepWellLogo
                  variant="inline"
                  showWordmark
                  brandClassName="mx-auto items-center lg:mx-0 lg:items-start"
                  className="!max-h-12 w-auto sm:!max-h-14 md:!max-h-[4.25rem]"
                />
              </div>
            </div>
            <span className="tag">Deep Well Audio</span>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:mt-6 sm:text-5xl lg:text-6xl">
              Clarity for what you hear.
              <br />
              Clarity for what you face.
            </h1>
            <p className="mt-4 max-w-3xl text-2xl font-semibold leading-snug text-white sm:mt-5 sm:text-3xl lg:mt-6 lg:text-[2.125rem] lg:leading-tight">
              A place to listen and stay with it
            </p>
            <p className="mt-4 max-w-2xl text-base leading-[1.65] text-slate-200/95 sm:mt-5 sm:text-lg">
              Sermons and teaching from trusted ministries, with tools to help you keep what mattered.
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-[1.65] text-slate-100/95 sm:mt-6">
              Scripture-grounded teaching, sermons, and careful help for thinking through the world around you.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-[1.65] text-slate-100/95 sm:mt-6">
              Deep Well brings together Bible teaching, sermons, and apologetics from ministries we trust.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-[1.65] text-slate-100/95">
              Listening is free.
              <br />
              If you sign in, what you save stays with you.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-slate-200/95 sm:text-base">
              Free gives you access to the teaching.
              <br />
              Premium helps you stay with it — save what matters, follow topics more carefully, and read World Watch when public life starts asking
              for your attention.
            </p>
            <p className="mt-4 max-w-2xl text-xs font-medium uppercase tracking-[0.16em] text-slate-300/90">
              Trusted ministries · Careful curation · Room to think, pray, and act
            </p>

            <p className="mt-5 inline-flex flex-wrap items-baseline gap-x-1 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-2 text-sm text-slate-200">
              24 trusted ministries · 1,000+ teachings ready to explore
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9">
              <FunnelLink
                href={"/explore" as Route}
                funnelEvent="start_listening_click"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.45)]"
              >
                Start listening
                <ArrowRight className="h-4 w-4" />
              </FunnelLink>
              <FunnelLink
                href={"/explore" as Route}
                funnelEvent="explore_teaching_click"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/90 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
              >
                Browse teaching
              </FunnelLink>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-slate-300/90">
              Listen without an account.
              <br />
              Sign in if you want your library to stay with you.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200/90">
              <FunnelLink
                href={"/join" as Route}
                funnelEvent="join_list_click"
                funnelData={{ placement: "home_hero" }}
                className="font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline"
              >
                Short updates. No noise.
              </FunnelLink>
              <br />
              Your email stays private.
            </p>
        </div>
      </section>

      <section className="container-shell section-divider py-10 sm:py-12" aria-labelledby="home-start-heading">
        <div className="max-w-2xl">
          <h2 id="home-start-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start with what you need
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-slate-200/95">
            You don&apos;t have to take everything in at once.
            <br />
            Choose where to begin and stay there.
          </p>
          <p className="mt-4 text-sm leading-[1.65] text-slate-400">
            Themes that help you stay oriented, not overwhelmed.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_OPTIONS.map((category) => (
            <Link
              key={category.key}
              href={`/explore?category=${category.key}` as Route}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line/80 bg-[rgba(15,20,28,0.42)] px-4 py-3.5 text-inherit no-underline outline-none transition duration-200 hover:border-accent/40 hover:bg-accent/[0.06] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <span className="font-medium text-white">{category.label}</span>
              <span className="shrink-0 text-sm text-amber-200/90 transition group-hover:text-amber-100">
                Explore <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <HomeStartHereToday plan={plan} featuredVideo={startHereFeaturedVideo} />

      <HomeGuidedPaths />

      <HomeFeaturedCurated items={homepageFeaturedVideosForGrid} plan={plan} />

      <HomeCategoryCuratedPreview />

      <HomeWorldWatchHub youtubeItems={worldWatchYoutube} digestItems={worldWatchDigestPreview} plan={plan} />

      <HomeRecentlyAddedCurated items={recentlyAddedCurated} plan={plan} />

      <RevealOnScroll>
        <HomeJoinCta plan={plan} />
      </RevealOnScroll>

      <ContinueListeningSection enabled={showSessionListening} />
      <RecentlyPlayedSection enabled={showSessionListening} />

      <RevealOnScroll>
        <section id="topics" className="container-shell section-divider scroll-mt-28 py-10 sm:py-12">
          <div className="mb-7 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Topic collections</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getDiscoverTopicCards().map((t) => (
              <FunnelLink
                key={t.slug}
                href={`/topics/${t.slug}` as Route}
                funnelEvent="topic_card_click"
                funnelData={{ slug: t.slug }}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line/80 bg-[rgba(15,20,28,0.35)] px-4 py-3.5 no-underline outline-none transition hover:border-accent/35 hover:bg-accent/[0.04] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <span className="font-medium text-white group-hover:text-amber-100/95">{t.label}</span>
                <span className="shrink-0 text-sm text-amber-200/90 transition group-hover:text-amber-100">
                  Explore <span aria-hidden>→</span>
                </span>
              </FunnelLink>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {quickListenEpisodes.length > 0 ? (
        <section className="container-shell pb-10 pt-2 sm:pb-12 sm:pt-0" aria-labelledby="home-quick-list-heading">
          <div className="card overflow-hidden border-accent/25 bg-gradient-to-b from-accent/[0.08] via-soft/12 to-[rgba(10,14,22,0.36)] p-6 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.48)] backdrop-blur-md sm:p-8">
            <div className="mb-6 max-w-2xl sm:mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Listen</p>
              <h2 id="home-quick-list-heading" className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Start listening in seconds
              </h2>
              <p className="mt-3 text-sm leading-[1.65] text-muted sm:text-base">No searching. Just press play.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {quickListenEpisodes.map((episode) => (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  showSlug={episode.show?.slug}
                  showOfficialUrl={episode.show?.official_url}
                  showFavorite={false}
                />
              ))}
            </div>
            <div className="mt-5 border-t border-line/55 pt-4 sm:mt-6 sm:pt-5">
              <Link
                href={"/explore" as Route}
                className="inline-flex text-sm font-medium text-amber-200/90 underline-offset-4 transition hover:text-white hover:underline"
              >
                Explore →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <HomeSetupStatusPanel showCount={showCount} />

      <section className="container-shell section-divider py-12 sm:py-14">
        <div className="card border-accent/25 bg-soft/15 p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/70">The catalog</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">What you&apos;ll find here</h2>
          <p className="mt-4 max-w-3xl text-sm leading-[1.65] text-muted sm:text-base">
            Sermons, long-form Bible teaching, and apologetics from ministries we&apos;d recommend to a friend. Curated sources only—no random
            content from the open web. Every feed is added on purpose.
          </p>
          <ul className="mt-6 grid gap-3 text-sm leading-relaxed text-slate-200/95 sm:grid-cols-2">
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              Save the messages you want to return to.
            </li>
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              Hear Scripture opened seriously, not diluted.
            </li>
            <li className="flex gap-2 sm:col-span-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              Keep a single calm place for serious listening.
            </li>
          </ul>
        </div>
      </section>

      <RevealOnScroll delayMs={40}>
        <HomePremiumValue />
      </RevealOnScroll>

      {!hasContent && showCount === 0 ? (
        <section className="container-shell py-10">
          <div className="card border-accent/25 bg-accent/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">First-time setup</p>
            <h2 className="mt-3 text-2xl font-semibold">You&apos;re one sync away from a full directory</h2>
            <p className="mt-3 max-w-2xl text-muted">
              With Supabase connected, run a protected RSS sync. Episodes and artwork will land in your project automatically from the
              feeds in{" "}
              <code className="rounded bg-soft px-1 text-xs text-slate-200">data/source-feeds.ts</code>.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-bg p-4 text-xs text-slate-200">
              curl -X POST -H &quot;Authorization: Bearer $SYNC_API_SECRET&quot; http://localhost:3000/api/sync/all
            </pre>
          </div>
        </section>
      ) : null}

      <section id="featured" className="container-shell section-divider py-12 sm:py-14">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">Featured sources</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Hand-picked teaching</h2>
            <p className="mt-3 max-w-2xl text-sm leading-[1.65] text-muted">
              {featured.length > 0 && showCount > 0
                ? `Programs flagged featured in the directory—up to ${HOMEPAGE_FEATURED_LIMIT} at a time from your ${showCount} synced sources.`
                : "Once shows are marked featured in your catalog, they appear here first."}
            </p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 rounded-full border border-line/80 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-accent/35 hover:bg-accent/[0.06] hover:text-white"
          >
            Explore →
          </Link>
        </div>

        {featured.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((show) => (
              <ShowCard key={show.id} show={show} highlightFeatured />
            ))}
          </div>
        ) : (
          <div className="card border-dashed border-line/55 bg-soft/20 p-10 text-center text-sm text-muted">
            Featured programs will show here after your first successful sync—or you can flag shows as featured in Supabase.
          </div>
        )}
      </section>

      <section className="container-shell section-divider py-12 sm:py-14">
        <div className="mb-9">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">Recently published</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Newest episodes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-[1.65] text-muted">
            Latest episodes by publish date across every synced feed—open one to listen or save it for later.
          </p>
        </div>

        {recentForSection.length ? (
          <div className="space-y-4">
            {recentForSection.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                showSlug={episode.show?.slug}
                showOfficialUrl={episode.show?.official_url}
                showFavorite={false}
              />
            ))}
          </div>
        ) : (
          <div className="card border-dashed border-line/55 bg-soft/20 p-10 text-center text-sm text-muted">
            Once ingestion runs, the latest episodes from your curated feeds will appear here.
          </div>
        )}
      </section>

      <section className="container-shell section-divider py-12 pb-24 sm:py-14">
        <div className="card grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Accounts</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Listen now. Save what lasts.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-muted sm:text-base">
              When you want lists that follow you across devices, sign in to favorite episodes and save whole shows—optional, never required to
              listen. Same calm, content-first experience.
            </p>
            <div className="mt-6">
              <HomeFeedbackNote />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Email sign-in via Supabase",
              "Favorites and saved shows",
              "Curated RSS ingestion",
              "Premium when you choose it",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-line/80 bg-[rgba(15,20,28,0.45)] p-4 text-sm leading-snug text-slate-100 backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
