import Link from "next/link";
import type { Route } from "next";
import { CATEGORY_OPTIONS } from "@/lib/types";
import {
  exploreEpisodes,
  exploreShows,
  getActiveShowCount,
  getFeaturedShows,
  getHomeRecentEpisodes,
  getPublicEpisodeCount,
  probeCatalogBackend,
} from "@/lib/queries";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isCategoryKey } from "@/lib/normalizers";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { ShowCard } from "@/components/show-card";
import { EpisodeRow } from "@/components/episode-row";
import { ExploreEmptyState } from "@/components/explore/empty-state";

function toInt(v: string | undefined, fallback?: number) {
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

/** Build /explore link keeping filters but dropping category (and invalid ?category= values). */
function exploreHrefWithoutCategory(sp: Record<string, string | string[] | undefined>): string {
  const p = new URLSearchParams();
  const q = typeof sp.q === "string" ? sp.q : "";
  const source = typeof sp.source === "string" ? sp.source : "";
  const view = typeof sp.view === "string" ? sp.view : "";
  const meaty = typeof sp.meaty === "string" ? sp.meaty : "";
  if (q.trim()) p.set("q", q);
  if (source && source !== "all") p.set("source", source);
  if (view && view !== "shows") p.set("view", view);
  if (meaty) p.set("meaty", meaty);
  const qs = p.toString();
  return qs ? `/explore?${qs}` : "/explore";
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const categoryParam = typeof sp.category === "string" ? sp.category : "";
  const category = isCategoryKey(categoryParam) ? categoryParam : "";
  const categoryUnrecognized = Boolean(categoryParam && !category);
  const source = typeof sp.source === "string" ? sp.source : "all";
  const view = typeof sp.view === "string" && sp.view === "episodes" ? "episodes" : "shows";
  const meatyMin = toInt(typeof sp.meaty === "string" ? sp.meaty : undefined);

  const filters = {
    q,
    category: category || undefined,
    sourceType: source,
    meatyMin,
  };

  const hasActiveFilters = Boolean(
    q.trim() || category || (source && source !== "all") || typeof meatyMin === "number"
  );

  const activeCategoryLabel = category
    ? (CATEGORY_OPTIONS.find((c) => c.key === category)?.label ?? category)
    : null;

  let showCount = 0;
  let episodeCount = 0;
  let showsRaw: Awaited<ReturnType<typeof exploreShows>> = [];
  let episodes: Awaited<ReturnType<typeof exploreEpisodes>> = [];
  let featuredPreview: Awaited<ReturnType<typeof getFeaturedShows>> = [];
  let recentPreview: Awaited<ReturnType<typeof getHomeRecentEpisodes>> = [];
  let catalogProbe: Awaited<ReturnType<typeof probeCatalogBackend>> = "missing_env";

  try {
    [catalogProbe, showCount, episodeCount, showsRaw, episodes, featuredPreview, recentPreview] = await Promise.all([
      probeCatalogBackend(),
      getActiveShowCount(),
      getPublicEpisodeCount(),
      view === "shows" ? exploreShows(filters) : Promise.resolve([]),
      view === "episodes" ? exploreEpisodes(filters) : Promise.resolve([]),
      view === "shows" && !hasActiveFilters ? getFeaturedShows(6) : Promise.resolve([]),
      view === "shows" && !hasActiveFilters ? getHomeRecentEpisodes(8) : Promise.resolve([]),
    ]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page explore:", e instanceof Error ? e.message : e);
  }

  const featuredIds = new Set(featuredPreview.map((s) => s.id));
  const shows =
    view === "shows" && !hasActiveFilters && featuredPreview.length > 0
      ? (() => {
          const rest = showsRaw.filter((s) => !featuredIds.has(s.id));
          return rest.length > 0 ? rest : showsRaw;
        })()
      : showsRaw;

  return (
    <main className="container-shell py-14">
      <div className="mb-10">
        <span className="tag">Explore</span>
        <h1 className="mt-4 text-4xl font-semibold">Find your next listen</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Curated sermons, podcasts, and biblical teaching in one directory. Search, filter by topic and source, or browse featured picks.
        </p>
        {hasPublicSupabaseEnv() && catalogProbe === "ok" && showCount > 0 ? (
          <div className="mt-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.12] via-transparent to-transparent px-6 py-5 shadow-glow">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Live catalog</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl font-semibold text-white sm:text-3xl">
              <span className="tabular-nums text-amber-100">{showCount}</span>
              <span className="text-lg font-normal text-slate-200 sm:text-xl">
                {showCount === 1 ? "curated source" : "curated sources"}
              </span>
              {episodeCount > 0 ? (
                <>
                  <span className="hidden text-slate-500 sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="tabular-nums text-amber-100">{episodeCount}</span>
                  <span className="text-lg font-normal text-slate-200 sm:text-xl">episodes indexed</span>
                </>
              ) : null}
            </p>
          </div>
        ) : hasPublicSupabaseEnv() && catalogProbe === "ok" ? (
          <p className="mt-3 text-sm text-muted">No sources yet—run a sync to fill the directory.</p>
        ) : null}
        {category && activeCategoryLabel ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-1.5 text-sm text-amber-50">
              <span className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Topic</span>
              {activeCategoryLabel}
            </span>
            <Link
              href={exploreHrefWithoutCategory(sp) as Route}
              className="text-sm text-amber-200/90 underline-offset-4 transition hover:text-white hover:underline"
            >
              Clear topic
            </Link>
          </div>
        ) : null}
        {categoryUnrecognized ? (
          <p className="mt-3 text-sm text-muted">
            That topic isn&apos;t recognized—showing the full directory. Use the category menu below to pick a topic.
          </p>
        ) : null}
      </div>

      {hasPublicSupabaseEnv() && catalogProbe === "error" ? (
        <div className="card mb-8 border-amber-400/30 bg-amber-500/5 p-4 text-sm text-amber-100/90">
          <p className="font-medium text-white">Catalog temporarily unavailable</p>
          <p className="mt-2 text-muted">
            We couldn&apos;t reach the database. Filters may return empty results until the connection is restored—this page will still load.
          </p>
        </div>
      ) : null}

      {hasPublicSupabaseEnv() && catalogProbe === "missing_env" ? (
        <div className="card mb-8 border-line bg-soft/20 p-4 text-sm text-muted">
          Directory data needs Supabase environment variables. The layout you see is safe; add keys and restart to browse real shows.
        </div>
      ) : null}

      <form className="card mb-10 grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-6" method="get">
        <label className="lg:col-span-2">
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Title, host, or topic"
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Category</span>
          <select
            name="category"
            defaultValue={category}
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-3 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          >
            <option value="">All</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Source</span>
          <select
            name="source"
            defaultValue={source}
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-3 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          >
            <option value="all">All</option>
            <option value="rss">RSS</option>
            <option value="youtube">YouTube</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Min meaty</span>
          <select
            name="meaty"
            defaultValue={typeof meatyMin === "number" ? String(meatyMin) : ""}
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-3 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          >
            <option value="">Any</option>
            {[0, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs uppercase tracking-wide text-amber-100/70">View</span>
          <select
            name="view"
            defaultValue={view}
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-3 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
          >
            <option value="shows">Shows</option>
            <option value="episodes">Recent episodes</option>
          </select>
        </label>

        <div className="md:col-span-2 lg:col-span-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Apply filters
          </button>
          <Link
            href="/explore"
            className="inline-flex items-center rounded-full border border-line px-5 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-white"
          >
            Reset
          </Link>
        </div>
      </form>

      {view === "shows" && !hasActiveFilters && (featuredPreview.length > 0 || recentPreview.length > 0) ? (
        <div className="mb-12 space-y-10">
          {featuredPreview.length > 0 ? (
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Featured sources</p>
                  <h2 className="mt-2 text-2xl font-semibold">Start with these hand-picked programs</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted">
                    Editorial highlights from your catalog—each card opens the full show and episode list.
                  </p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredPreview.map((show) => (
                  <ShowCard key={show.id} show={show} highlightFeatured />
                ))}
              </div>
            </section>
          ) : null}

          {recentPreview.length > 0 ? (
            <section>
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Latest audio</p>
                <h2 className="mt-2 text-2xl font-semibold">Recently published episodes</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">Sorted by publish date—newest from any synced source.</p>
              </div>
              <div className="space-y-4">
                {recentPreview.map((episode) => (
                  <EpisodeRow
                    key={episode.id}
                    episode={episode}
                    showSlug={episode.show?.slug}
                    showOfficialUrl={episode.show?.official_url}
                    showFavorite={false}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {view === "shows" ? (
        shows.length ? (
          <section>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">
                {hasActiveFilters ? "Matching sources" : "Curated sources"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{hasActiveFilters ? "Results" : "Program directory"}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                {hasActiveFilters
                  ? "Shows and ministries that match your filters. Open one to browse its episodes."
                  : "Each card is a hand-picked feed (a show or ministry), not a single episode. Episodes live on the show page."}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        ) : showCount === 0 ? (
          <ExploreEmptyState
            variant="empty-catalog"
            message="The directory is ready—waiting on your first sync."
            detail="Run the RSS sync from your machine so these curated feeds can populate your Supabase database."
          />
        ) : (
          <ExploreEmptyState
            message="No shows match what you asked for."
            detail="Try clearing one filter, loosening the meaty score, or searching a shorter phrase."
          />
        )
      ) : episodes.length ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Episodes</h2>
          {episodes.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              showSlug={episode.show?.slug}
              showOfficialUrl={episode.show?.official_url}
              showFavorite={false}
            />
          ))}
        </section>
      ) : showCount === 0 ? (
        <ExploreEmptyState
          variant="empty-catalog"
          message="No episodes yet—sync your feeds first."
          detail="Episodes appear automatically once RSS ingestion has written to your database."
        />
      ) : (
        <ExploreEmptyState
          message="No episodes match these filters."
          detail="Switch back to shows or reset filters to see what was recently ingested."
        />
      )}
    </main>
  );
}
