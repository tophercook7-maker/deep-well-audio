import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft } from "lucide-react";
import {
  CURATED_YOUTUBE_SOURCES,
  getActiveCuratedYoutubeSourcesSorted,
  getCuratedYoutubeSourceById,
} from "@/data/curated-youtube-sources";
import { getAggregatedCuratedYoutubeItems } from "@/lib/curated-teachings/aggregate";
import { getCuratedCategoriesForNav, isCuratedCategorySlug } from "@/lib/curated-teachings/categories";
import { CuratedVideoGridWithStudy } from "@/components/curated-teachings/curated-video-grid-with-study";
import { CuratedSectionShell } from "@/components/home/curated-section-shell";
import { getUserPlan } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Curated Bible teachings",
  description:
    "Carefully selected Bible teachings, sermons, apologetics, and Christian resources from trusted voices—organized by category and refreshed on a calm rhythm.",
};

export default async function CuratedTeachingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.source;
  const rawSource = Array.isArray(raw) ? raw[0] : raw;
  const sourceRow = typeof rawSource === "string" ? getCuratedYoutubeSourceById(rawSource) : undefined;
  const requestedSource = sourceRow && sourceRow.active !== false ? rawSource : undefined;

  const rawCat = sp.category;
  const rawCategory = Array.isArray(rawCat) ? rawCat[0] : rawCat;
  const category =
    typeof rawCategory === "string" && isCuratedCategorySlug(rawCategory) ? rawCategory : undefined;

  const rawFeat = sp.featured;
  const featVal = Array.isArray(rawFeat) ? rawFeat[0] : rawFeat;
  const featuredOnly = featVal === "1" || featVal === "true";

  const rawQ = sp.q;
  const q = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const search = typeof q === "string" ? q : undefined;

  const [plan, all] = await Promise.all([
    getUserPlan(),
    getAggregatedCuratedYoutubeItems({
      sourceId: requestedSource,
      category,
      featuredOnly,
      search,
    }),
  ]);

  const activeSources = getActiveCuratedYoutubeSourcesSorted();
  const showSourceFilters = activeSources.length > 1;
  const activeSourceCount = CURATED_YOUTUBE_SOURCES.filter((s) => s.active !== false).length;
  const categories = getCuratedCategoriesForNav();

  const buildHref = (p: {
    source?: string | null;
    category?: string | null;
    featured?: boolean | null;
    q?: string | null;
  }): Route => {
    const u = new URLSearchParams();
    const s = p.source === null ? undefined : p.source ?? requestedSource;
    const c = p.category === null ? undefined : p.category ?? category;
    const f = p.featured === null ? false : p.featured ?? featuredOnly;
    const qu = p.q === null ? undefined : p.q ?? search;
    if (s) u.set("source", s);
    if (c) u.set("category", c);
    if (f) u.set("featured", "1");
    if (qu?.trim()) u.set("q", qu.trim());
    const qs = u.toString();
    return (qs ? `/curated-teachings?${qs}` : "/curated-teachings") as Route;
  };

  return (
    <main className="pb-20 sm:pb-24">
      <div className="container-shell border-b border-line/30 py-8 sm:py-10">
        <Link
          href={"/" as Route}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-200/80 transition hover:text-amber-100"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Home
        </Link>

        <CuratedSectionShell className="mt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/70">Curated library</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Curated teachings</h1>
          <p className="mt-4 max-w-2xl text-sm leading-[1.75] text-muted sm:text-[0.9375rem]">
            Explore a growing collection of carefully selected Bible teachings, sermons, apologetics, and Christian resources from trusted
            voices. Everything is aggregated on the server, deduped, and gently cached—so browsing stays fast and composed.
          </p>
          {plan === "guest" ? (
            <p className="mt-4 max-w-2xl text-sm text-slate-200/90">
              <Link href={"/login?next=/curated-teachings" as Route} className="font-medium text-amber-200/85 hover:underline">
                Sign in
              </Link>{" "}
              to continue where you left off and access member-only features.{" "}
              <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 hover:underline">
                Premium
              </Link>{" "}
              adds deeper World Watch, notes, and bookmarks.
            </p>
          ) : null}
        </CuratedSectionShell>

        <div className="mt-8 rounded-[1.25rem] border border-line/40 bg-[rgba(12,16,24,0.26)] p-4 shadow-[0_14px_36px_-22px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-5">
        <form action="/curated-teachings" method="get" className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
          {requestedSource ? <input type="hidden" name="source" value={requestedSource} /> : null}
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {featuredOnly ? <input type="hidden" name="featured" value="1" /> : null}
          <label className="sr-only" htmlFor="curated-search-q">
            Search titles
          </label>
          <input
            id="curated-search-q"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search title or channel…"
            className="min-h-[44px] w-full rounded-full border border-line/70 bg-[rgba(15,20,28,0.38)] px-4 py-2 text-sm text-slate-100 outline-none ring-accent/25 backdrop-blur-sm focus:ring-2"
          />
          <button
            type="submit"
            className="min-h-[44px] shrink-0 rounded-full border border-accent/40 bg-accent/[0.1] px-5 py-2 text-sm font-medium text-amber-100 transition hover:border-accent/55"
          >
            Search
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={buildHref({ category: null, featured: null })}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              !category && !featuredOnly
                ? "border-accent/45 bg-accent/[0.1] text-amber-100"
                : "border-line/70 text-slate-300/95 hover:border-accent/35 hover:text-slate-100",
            ].join(" ")}
          >
            All
          </Link>
          <Link
            href={buildHref({ category: null, featured: !featuredOnly })}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              featuredOnly
                ? "border-accent/45 bg-accent/[0.1] text-amber-100"
                : "border-line/70 text-slate-300/95 hover:border-accent/35 hover:text-slate-100",
            ].join(" ")}
          >
            Featured channels
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Categories">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({ category: c.slug, featured: null })}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                category === c.slug
                  ? "border-accent/45 bg-accent/[0.1] text-amber-100"
                  : "border-line/70 text-slate-300/95 hover:border-accent/35 hover:text-slate-100",
              ].join(" ")}
            >
              {c.shortLabel}
            </Link>
          ))}
        </div>

        {showSourceFilters ? (
          <nav className="mt-4 flex flex-wrap gap-2 border-t border-line/30 pt-4" aria-label="Filter by channel">
            <Link
              href={buildHref({ source: null, category: null, featured: null })}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                !requestedSource
                  ? "border-accent/45 bg-accent/[0.1] text-amber-100"
                  : "border-line/70 text-slate-300/95 hover:border-accent/35 hover:text-slate-100",
              ].join(" ")}
            >
              All channels
            </Link>
            {activeSources.map((s) => (
              <Link
                key={s.id}
                href={buildHref({ source: s.id, category: null, featured: null })}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  requestedSource === s.id
                    ? "border-accent/45 bg-accent/[0.1] text-amber-100"
                    : "border-line/70 text-slate-300/95 hover:border-accent/35 hover:text-slate-100",
                ].join(" ")}
              >
                {s.title}
              </Link>
            ))}
          </nav>
        ) : null}
        </div>
      </div>

      <div className="container-shell py-10 sm:py-12">
        {all.length === 0 ? (
          <div className="card border-dashed border-line/55 bg-soft/15 p-10 text-center text-sm text-muted">
            No videos match these filters. Try clearing search, or confirm feeds in{" "}
            <code className="rounded bg-soft px-1.5 py-0.5 text-xs text-slate-200">data/curated-youtube-sources.ts</code>{" "}
            ({activeSourceCount} active source{activeSourceCount === 1 ? "" : "s"}).
          </div>
        ) : (
          <CuratedVideoGridWithStudy
            items={all}
            plan={plan}
            loginNext="/curated-teachings"
            thumbnailPriorityFirstN={2}
            gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          />
        )}
      </div>
    </main>
  );
}
