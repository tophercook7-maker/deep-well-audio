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
  resolveExploreTopicSlug,
} from "@/lib/queries";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isCategoryKey } from "@/lib/normalizers";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { ShowCard } from "@/components/show-card";
import { EpisodeRow } from "@/components/episode-row";
import { ExploreEmptyState } from "@/components/explore/empty-state";
import { BackButton } from "@/components/buttons/back-button";
import { getDiscoverTopicCards, getTopicDefinition, normalizeTopicSlug } from "@/lib/topics";
import { getUserPlan } from "@/lib/auth";
import { ExploreMeatyField } from "@/components/premium/explore-meaty-field";

function toInt(v: string | undefined, fallback?: number) {
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function buildExploreHref(
  sp: Record<string, string | string[] | undefined>,
  opts?: { dropCategory?: boolean; dropTopic?: boolean; dropQ?: boolean }
): Route {
  const p = new URLSearchParams();
  const qVal = typeof sp.q === "string" ? sp.q : "";
  const topicVal = typeof sp.topic === "string" ? sp.topic : "";
  const catVal = typeof sp.category === "string" ? sp.category : "";
  const sourceVal = typeof sp.source === "string" ? sp.source : "";
  const viewVal = typeof sp.view === "string" ? sp.view : "";
  const meatyVal = typeof sp.meaty === "string" ? sp.meaty : "";

  if (!opts?.dropQ && qVal.trim()) p.set("q", qVal.trim());
  if (!opts?.dropTopic && topicVal.trim()) {
    const ns = normalizeTopicSlug(topicVal);
    if (getTopicDefinition(ns)) p.set("topic", ns);
  }
  if (!opts?.dropCategory && catVal && isCategoryKey(catVal)) p.set("category", catVal);
  if (sourceVal && sourceVal !== "all") p.set("source", sourceVal);
  if (viewVal && viewVal !== "shows") p.set("view", viewVal);
  if (meatyVal) p.set("meaty", meatyVal);

  const qs = p.toString();
  return (qs ? `/explore?${qs}` : "/explore") as Route;
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
  const topicParamRaw = typeof sp.topic === "string" ? sp.topic : "";
  const topicSlugResolved = resolveExploreTopicSlug({ topic: topicParamRaw });
  const topicUnrecognized = Boolean(topicParamRaw.trim() && !topicSlugResolved);
  const source = typeof sp.source === "string" ? sp.source : "all";
  const viewParam = typeof sp.view === "string" ? sp.view : "";
  const view =
    viewParam === "episodes" ? "episodes" : viewParam === "shows" ? "shows" : topicSlugResolved ? "episodes" : "shows";
  const meatyFromUrl = toInt(typeof sp.meaty === "string" ? sp.meaty : undefined);
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }
  const meatyPremium = plan === "premium";
  const meatyMin = meatyPremium ? meatyFromUrl : undefined;
  const meatyApplies = meatyPremium && typeof meatyFromUrl === "number";
  const meatyStripped = !meatyPremium && typeof meatyFromUrl === "number";

  const activeTopicMeta = topicSlugResolved ? getTopicDefinition(topicSlugResolved) : null;

  const filters = {
    q,
    category: category || undefined,
    sourceType: source,
    meatyMin,
    topic: topicParamRaw || undefined,
  };

  const hasActiveFilters = Boolean(
    q.trim() ||
      category ||
      (source && source !== "all") ||
      meatyApplies ||
      Boolean(topicSlugResolved)
  );

  const activeCategoryLabel = category
    ? (CATEGORY_OPTIONS.find((c) => c.key === category)?.label ?? category)
    : null;

  const exploreTopicChips = getDiscoverTopicCards();

  function formatFilterSummary(): string | null {
    const parts: string[] = [];
    if (q.trim()) parts.push(`Search “${q.trim()}”`);
    if (activeCategoryLabel) parts.push(activeCategoryLabel);
    if (meatyApplies && typeof meatyFromUrl === "number") parts.push(`Meaty ${meatyFromUrl}+`);
    if (source && source !== "all") parts.push(source === "rss" ? "RSS" : source === "youtube" ? "YouTube" : "Hybrid");
    if (!parts.length) return null;
    return parts.join(" · ");
  }

  const filterSummary = formatFilterSummary();
  const emptyRelatedTopics = topicSlugResolved
    ? getTopicDefinition(topicSlugResolved)?.relatedSlugs
        .map((s) => getTopicDefinition(s))
        .filter((t): t is NonNullable<typeof t> => t != null)
        .slice(0, 5) ?? []
    : exploreTopicChips.slice(0, 5);

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
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-8 border-b border-line/50 pb-6">
        <BackButton fallbackHref="/" label="Back" />
      </div>
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
              <span className="text-xs uppercase tracking-[0.2em] text-amber-200/70">Category</span>
              {activeCategoryLabel}
            </span>
            <Link
              href={buildExploreHref(sp, { dropCategory: true })}
              className="text-sm text-amber-200/90 underline-offset-4 transition hover:text-white hover:underline"
            >
              Clear category
            </Link>
          </div>
        ) : null}
        {activeTopicMeta ? (
          <div className="mt-4 max-w-3xl rounded-2xl border border-line/80 bg-soft/25 px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Topic tag</p>
                <p className="mt-1 text-lg font-semibold text-white">{activeTopicMeta.label}</p>
              </div>
              <Link
                href={buildExploreHref(sp, { dropTopic: true })}
                className="shrink-0 text-sm text-amber-200/90 underline-offset-4 transition hover:text-white hover:underline"
              >
                Clear topic
              </Link>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{activeTopicMeta.description}</p>
            <p className="mt-3 text-xs text-slate-500">
              Showing episodes tagged in catalog data
              {view === "shows" ? "—switch view to “Recent episodes” for the full episode list." : "."}
            </p>
          </div>
        ) : null}
        {categoryUnrecognized ? (
          <p className="mt-3 text-sm text-muted">
            That category isn&apos;t recognized—showing the full directory. Use the category menu below to pick one.
          </p>
        ) : null}
        {topicUnrecognized ? (
          <p className="mt-3 text-sm text-muted">
            That topic tag isn&apos;t in the catalog metadata—filters ignored for topic. Use the chips below or a known slug
            (e.g. <code className="rounded bg-soft px-1 text-xs">end-times</code>).
          </p>
        ) : null}
        {filterSummary ? (
          <p className="mt-5 text-sm text-slate-300">
            <span className="font-medium text-amber-100/90">Now showing: </span>
            {filterSummary}
          </p>
        ) : null}
      </div>

      <section id="topic-collections" className="scroll-mt-28 mb-10">
        <div className="mb-5 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Topics</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Explore by topic tag</h2>
          <p className="mt-2 text-sm text-muted">
            Jump into recent episodes tagged in <code className="rounded bg-soft px-1 text-xs">topic_tags</code>, or open the editorial topic hub
            for longer intro copy and related links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {exploreTopicChips.map((t) => {
            const active = topicSlugResolved === t.slug;
            const chipParams = new URLSearchParams();
            chipParams.set("topic", t.slug);
            chipParams.set("view", "episodes");
            if (q.trim()) chipParams.set("q", q.trim());
            if (category) chipParams.set("category", category);
            if (source && source !== "all") chipParams.set("source", source);
            if (typeof meatyMin === "number") chipParams.set("meaty", String(meatyMin));
            const href = (`/explore?${chipParams.toString()}`) as Route;
            return (
              <Link
                key={t.slug}
                href={href}
                className={
                  active
                    ? "inline-flex items-center rounded-full border border-accent/55 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(251,191,36,0.45)] transition hover:border-accent/70"
                    : "inline-flex items-center rounded-full border border-line/90 bg-soft/30 px-4 py-2.5 text-sm font-medium text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.08] hover:text-white"
                }
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line/40 pt-4 text-xs text-muted">
          <span className="uppercase tracking-[0.18em] text-amber-200/50">Hubs</span>
          {getDiscoverTopicCards().map((t) => (
            <Link key={`hub-${t.slug}`} href={`/topics/${t.slug}` as Route} className="text-amber-200/80 hover:text-white hover:underline">
              {t.label}
            </Link>
          ))}
        </div>
      </section>

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

      <form
        className="card mb-10 grid gap-5 p-6 md:grid-cols-2 md:p-7 lg:grid-cols-6"
        method="get"
      >
        {topicSlugResolved ? <input type="hidden" name="topic" value={normalizeTopicSlug(topicParamRaw)} /> : null}
        <label className="lg:col-span-2">
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Show, episode, host, or topic"
            autoComplete="off"
            className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-4 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2 [&::-webkit-search-cancel-button]:opacity-70"
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

        <ExploreMeatyField
          defaultApplied={meatyPremium && typeof meatyFromUrl === "number" ? String(meatyFromUrl) : ""}
          showStrippedNotice={meatyStripped}
        />

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

        <div className="md:col-span-2 lg:col-span-6 flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0"
          >
            Apply filters
          </button>
          <Link
            href="/explore"
            className="inline-flex min-h-[44px] items-center rounded-full border border-line/90 px-6 py-2.5 text-sm text-muted transition hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0"
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
                {activeTopicMeta
                  ? "Sources with at least one episode tagged for this topic—open a show to see matching episodes in context."
                  : hasActiveFilters
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
            relatedTopics={emptyRelatedTopics}
          />
        )
      ) : episodes.length ? (
        <section className="space-y-5">
          <div className="mb-1 border-b border-line/40 pb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Episodes</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {activeTopicMeta ? activeTopicMeta.label : q.trim() ? "Search results" : "Results"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {q.trim() ? (
                <>
                  For: <span className="font-medium text-slate-200">{q.trim()}</span>
                  {activeTopicMeta ? (
                    <>
                      {" "}
                      · scoped to <span className="font-medium text-slate-200">{activeTopicMeta.label}</span>
                    </>
                  ) : null}
                  {" "}
                  —newest first.
                </>
              ) : activeTopicMeta ? (
                <>Newest episodes tagged for this topic—tap a row for the full episode page.</>
              ) : (
                <>Newest matches for your filters—tap a row for the full episode page.</>
              )}
            </p>
          </div>
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
          detail="Try another topic chip, clear the search box, or switch to shows. You can also reset and browse the full directory."
          relatedTopics={emptyRelatedTopics}
        />
      )}
    </main>
  );
}
