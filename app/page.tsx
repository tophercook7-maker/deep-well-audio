import Link from "next/link";
import type { Route } from "next";
import { CATEGORY_OPTIONS } from "@/lib/types";
import {
  getActiveShowCount,
  getFeaturedShows,
  getHomeRecentEpisodes,
  getPublicEpisodeCount,
  probeCatalogBackend,
} from "@/lib/queries";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { ShowCard } from "@/components/show-card";
import { EpisodeRow } from "@/components/episode-row";
import { HomeSetupStatusPanel } from "@/components/home-setup-status";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { ArrowRight, BookOpen, Headphones, Mic2, ShieldCheck, Star } from "lucide-react";
import type { EpisodeWithShow, ShowWithMeta } from "@/lib/types";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";
import { getDiscoverTopicCards } from "@/lib/topics";

const HOMEPAGE_FEATURED_LIMIT = 6;
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
  let episodeCount = 0;
  let catalogProbe: Awaited<ReturnType<typeof probeCatalogBackend>> = "missing_env";
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    [featured, recentPool, showCount, episodeCount, catalogProbe, plan] = await Promise.all([
      getFeaturedShows(HOMEPAGE_FEATURED_LIMIT),
      getHomeRecentEpisodes(HOMEPAGE_RECENT_POOL),
      getActiveShowCount(),
      getPublicEpisodeCount(),
      hasPublicSupabaseEnv() ? probeCatalogBackend() : Promise.resolve("missing_env" as const),
      getUserPlan(),
    ]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page home:", e instanceof Error ? e.message : e);
  }
  const showSessionListening = canUseFeature("continue_listening", plan);
  const recentForSection = recentPool.slice(0, HOMEPAGE_RECENT_EPISODES);
  const quickListenEpisodes = pickQuickListenEpisodes(recentPool, featured, HOMEPAGE_QUICK_LIST_MAX);
  const hasContent = featured.length > 0 || recentPool.length > 0;

  return (
    <main>
      <section className="container-shell py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="tag">Curated Bible audio</span>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Find <span className="text-amber-200">rich Bible teaching</span> without digging through fluff.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Deep Well Audio brings together trusted sermons, podcasts, and apologetics from hand-picked RSS feeds—so you spend less time
              searching and more time listening. Create a free account to save favorites and whole shows to your library.
            </p>

            {hasPublicSupabaseEnv() && catalogProbe === "ok" && showCount > 0 ? (
              <p className="mt-5 inline-flex flex-wrap items-baseline gap-x-1 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-2 text-sm text-slate-200">
                <span className="text-lg font-semibold tabular-nums text-amber-100">{showCount}</span>
                <span>curated sources</span>
                {episodeCount > 0 ? (
                  <>
                    <span className="mx-1 text-slate-500">·</span>
                    <span className="text-lg font-semibold tabular-nums text-amber-100">{episodeCount}</span>
                    <span>episodes indexed</span>
                  </>
                ) : null}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Explore the directory
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-white"
              >
                Your library
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                showCount > 0
                  ? {
                      label: "Catalog",
                      value:
                        episodeCount > 0
                          ? `${showCount} live sources · ${episodeCount} episodes`
                          : `${showCount} live sources synced`,
                    }
                  : { label: "Curated", value: "Official feeds only" },
                { label: "Discovery", value: "Search, topics, meaty score" },
                { label: "Your picks", value: "Favorites & saved shows" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card border-line/90 p-5 transition-colors duration-200 hover:border-accent/25"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-100/70">{item.label}</p>
                  <p className="mt-2.5 font-medium leading-snug text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Topics</p>
            <p className="mt-2 text-sm text-muted">
              We&apos;re growing the list thoughtfully—more teachers and ministries are being added as feeds are verified.
            </p>
            <div className="mt-5 grid gap-4">
              {CATEGORY_OPTIONS.map((category) => (
                <Link
                  key={category.key}
                  href={`/explore?category=${category.key}` as Route}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-line bg-soft/40 p-4 text-inherit no-underline outline-none transition duration-200 hover:border-accent/45 hover:bg-accent/[0.06] hover:shadow-[0_0_24px_-4px_rgba(251,191,36,0.18)] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-accent/25 bg-accent/10 p-2 text-accent transition group-hover:border-accent/40 group-hover:bg-accent/15">
                      {category.key === "sermons" ? (
                        <Mic2 className="h-5 w-5" />
                      ) : category.key === "bible-teaching" ? (
                        <BookOpen className="h-5 w-5" />
                      ) : category.key === "apologetics" ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <Headphones className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{category.label}</p>
                      <p className="mt-0.5 text-sm text-amber-200/90 transition group-hover:text-amber-100">
                        Browse
                        <span className="ml-1 inline-block transition group-hover:translate-x-0.5" aria-hidden>
                          →
                        </span>
                      </p>
                    </div>
                  </div>
                  <Star className="h-4 w-4 shrink-0 text-amber-200/80 transition group-hover:text-amber-200" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContinueListeningSection enabled={showSessionListening} />
      <RecentlyPlayedSection enabled={showSessionListening} />

      <section id="topics" className="container-shell scroll-mt-28 py-8 sm:py-10">
        <div className="mb-6 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Browse by topic</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Topic collections</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Episode-level tags across your directory—different from program categories. Follow a theme (like end times or discernment)
            across many teachers.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {getDiscoverTopicCards().map((t) => (
            <div
              key={t.slug}
              className="group card border-line/90 p-5 transition hover:border-accent/35 hover:bg-accent/[0.04]"
            >
              <Link href={`/topics/${t.slug}` as Route} className="block no-underline">
                <p className="text-lg font-semibold text-white group-hover:text-amber-100">{t.label}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{t.description}</p>
                <p className="mt-4 text-xs font-medium text-amber-200/80">Open topic hub →</p>
              </Link>
              <p className="mt-2 text-xs">
                <Link
                  href={`/explore?topic=${encodeURIComponent(t.slug)}&view=episodes` as Route}
                  className="font-medium text-amber-200/70 underline-offset-2 transition hover:text-amber-100 hover:underline"
                >
                  Filter all Explore by this tag
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      {quickListenEpisodes.length > 0 ? (
        <section className="container-shell pb-10 pt-2 sm:pb-12 sm:pt-0" aria-labelledby="home-quick-list-heading">
          <div className="card overflow-hidden border-accent/25 bg-gradient-to-b from-accent/[0.07] via-soft/20 to-bg/80 p-6 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.55)] sm:p-8">
            <div className="mb-5 max-w-2xl sm:mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Listen</p>
              <h2 id="home-quick-list-heading" className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Start Listening in Seconds
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">No searching. Just press play.</p>
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
                Explore more →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <HomeSetupStatusPanel showCount={showCount} />

      <section className="container-shell section-divider py-12 sm:py-14">
        <div className="card border-accent/25 bg-soft/25 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold">What you&apos;ll find here</h2>
          <p className="mt-3 max-w-3xl text-muted">
            Sermons, long-form Bible teaching, and apologetics—all from sources we&apos;d recommend to a friend. We don&apos;t scrape the
            open web; every program is configured on purpose. More voices will join the directory as we grow.
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
            <li>• Save the messages you want to return to.</li>
            <li>• Hear Scripture opened seriously, not diluted.</li>
            <li>• Keep a single calm place for serious listening.</li>
          </ul>
        </div>
      </section>

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Featured sources</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Hand-picked teaching</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {featured.length > 0 && showCount > 0
                ? `Programs flagged featured in the directory—up to ${HOMEPAGE_FEATURED_LIMIT} at a time from your ${showCount} synced sources.`
                : "Once shows are marked featured in your catalog, they appear here first."}
            </p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 rounded-full border border-line/80 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-accent/35 hover:bg-accent/[0.06] hover:text-white"
          >
            Browse all sources →
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
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Recently published</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Newest episodes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
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
            <h2 className="mt-2 text-3xl font-semibold">Listen now. Save what lasts.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Sign in to favorite episodes and save whole shows—your library is yours across sessions. Everything stays inside this same
              warm, dark experience: content first, noise last.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Email sign-in via Supabase",
              "Favorites and saved shows",
              "Curated RSS ingestion",
              "Room to grow: more feeds, more features",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-line bg-soft/30 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
