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
import { Search } from "lucide-react";
import { BROWSE_CATEGORY_CARDS } from "@/lib/browse-discovery";
import { RemoteArtwork } from "@/components/artwork/remote-artwork";
import { getShowDisplayLabel } from "@/lib/display";

export const metadata = {
  title: "Browse",
  description: "Discover trusted Bible teaching—search, topics, and sources. Listen freely without an account.",
};

function toInt(v: string | undefined, fallback?: number) {
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

function buildBrowseHref(
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
  return (qs ? `/browse?${qs}` : "/browse") as Route;
}

export default async function BrowsePage({
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
      view === "shows" && !hasActiveFilters ? getFeaturedShows(12) : Promise.resolve([]),
      view === "shows" && !hasActiveFilters ? getHomeRecentEpisodes(8) : Promise.resolve([]),
    ]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page browse:", e instanceof Error ? e.message : e);
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
        <span className="tag">Browse</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Discover teaching</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-100/95">
          Search the catalog, open a topic, or start with a trusted source. Listen freely—no account needed.
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
              href={buildBrowseHref(sp, { dropCategory: true })}
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
                href={buildBrowseHref(sp, { dropTopic: true })}
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
        <div className="flex flex-col gap-2 border-b border-line/40 pb-5 md:col-span-2 lg:col-span-6 md:flex-row md:items-start md:justify-between">
          <p className="text-sm font-medium text-slate-200/95">Search &amp; filters</p>
          <p className="text-xs leading-relaxed text-muted md:max-w-md md:text-right">
            Start here, then scroll to topics and hand-picked sources below.
          </p>
        </div>
        <label className="lg:col-span-2">
          <span className="text-xs uppercase tracking-wide text-amber-100/70">Search</span>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-amber-200/90"
              strokeWidth={2.5}
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search shows, episodes, or topics"
              autoComplete="off"
              className="w-full rounded-2xl border border-line bg-soft/40 py-3.5 pl-11 pr-4 text-base text-text outline-none ring-accent/30 focus:ring-2 [&::-webkit-search-cancel-button]:opacity-70 md:py-4 md:text-lg"
            />
          </div>
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
            href="/browse"
            className="inline-flex min-h-[44px] items-center rounded-full border border-line/90 px-6 py-2.5 text-sm text-muted transition hover:border-accent/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0"
          >
            Reset
          </Link>
        </div>
      </form>

      <section id="browse-categories" className="scroll-mt-28 mb-12">
        <div className="mb-6 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Categories</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Browse by topic</h2>
          <p className="mt-2 text-sm text-muted">Open recent episodes tagged for each theme.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BROWSE_CATEGORY_CARDS.map((c) => {
            const chipParams = new URLSearchParams();
            chipParams.set("topic", c.slug);
            chipParams.set("view", "episodes");
            const href = (`/browse?${chipParams.toString()}`) as Route;
            return (
              <Link
                key={c.slug}
                href={href}
                className="flex min-h-[3.5rem] items-center rounded-2xl border border-line/80 bg-[rgba(10,14,22,0.45)] px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/40 hover:bg-accent/[0.06]"
              >
                {c.label}
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Want more? See{" "}
          <Link href="/topics/end-times" className="text-amber-200/85 underline-offset-2 hover:underline">
            topic hubs
          </Link>{" "}
          for longer guides.
        </p>
      </section>

      {view === "shows" && !hasActiveFilters && featuredPreview.length > 0 ? (
        <section className="mb-12" aria-labelledby="browse-teachers-heading">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Teachers &amp; sources</p>
            <h2 id="browse-teachers-heading" className="mt-2 text-2xl font-semibold text-white">
              Trusted voices
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">Tap a source to open its episodes.</p>
          </div>
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-1">
            {featuredPreview.map((show) => {
              const label = getShowDisplayLabel(show.title, show.slug);
              return (
                <Link
                  key={show.id}
                  href={`/shows/${show.slug}` as Route}
                  className="flex min-w-[11rem] shrink-0 items-center gap-3 rounded-2xl border border-line/70 bg-[rgba(9,12,18,0.55)] px-3 py-2.5 transition hover:border-accent/35"
                >
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line/50 bg-soft/40">
                    <RemoteArtwork
                      src={show.artwork_url}
                      alt=""
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="min-w-0 text-sm font-medium leading-snug text-slate-100">{label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {view === "shows" && !hasActiveFilters && (featuredPreview.length > 0 || recentPreview.length > 0) ? (
        <div className="mb-12 space-y-12">
          {recentPreview.length > 0 ? (
            <section>
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Recently added</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">New in the catalog</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">Newest episodes from synced sources.</p>
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

          {featuredPreview.length > 0 ? (
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Popular</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Hand-picked programs</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted">Editorial highlights—open a show to browse its episodes.</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredPreview.map((show) => (
                  <ShowCard key={show.id} show={show} highlightFeatured />
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
