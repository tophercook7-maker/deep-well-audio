import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import type { Metadata } from "next";
import { getFavoriteEpisodeIds, countEpisodesByTopicTags, getEpisodesByTopicTags } from "@/lib/queries";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { EpisodeRow } from "@/components/episode-row";
import { BackButton } from "@/components/buttons/back-button";
import {
  getAllTopicSlugs,
  getDiscoverTopicCards,
  getRelatedTopicCards,
  getTopicCatalogTags,
  getTopicDefinition,
  getTopicPageH1,
  getTopicSeoDescription,
  getTopicSeoTitle,
  getTopicWhyItMatters,
  normalizeTopicSlug,
} from "@/lib/topics";
import { getShowDisplayLabel } from "@/lib/display";
import type { EpisodeWithShow } from "@/lib/types";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { TopicPackSection } from "@/components/topics/topic-pack-section";
import { TopicFollowToggle } from "@/components/topics/topic-follow-toggle";
import { TopicVisitTracker } from "@/components/topics/topic-visit-tracker";
import { TopicReturnRhythm } from "@/components/retention/topic-return-rhythm";
import { getTopicPack } from "@/lib/topic-packs";
import { resolveTopicPackSections } from "@/lib/topic-pack-resolve";
import { TopicSeoCta } from "@/components/topics/topic-seo-cta";
import { TopicHubViewBeacon } from "@/components/topics/topic-hub-view-beacon";
import { InlineLinkParagraph } from "@/components/topics/inline-link-paragraph";
import { TopicMidAccountCta } from "@/components/topics/topic-mid-account-cta";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";

const EP_PAGE_LIMIT = 80;
const FEATURED_MAX = 10;

function uniqueSources(episodes: EpisodeWithShow[], max = 8) {
  const seen = new Set<string>();
  const out: { slug: string; label: string }[] = [];
  for (const ep of episodes) {
    const slug = ep.show?.slug;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, label: getShowDisplayLabel(ep.show?.title, slug) });
    if (out.length >= max) break;
  }
  return out;
}

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const def = getTopicDefinition(slug);
  if (!def) return { title: "Topic · Deep Well Audio" };
  const title = getTopicSeoTitle(def);
  const description = getTopicSeoDescription(def);
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}/topics/${def.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Deep Well Audio",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = normalizeTopicSlug(typeof raw === "string" ? raw : "");
  const meta = getTopicDefinition(slug);
  if (!meta) notFound();

  const catalogTags = getTopicCatalogTags(meta);

  const [{ episodes, dataOk }, totalCount] = await Promise.all([
    getEpisodesByTopicTags(catalogTags, EP_PAGE_LIMIT),
    countEpisodesByTopicTags(catalogTags),
  ]);

  const discoverOthers = getDiscoverTopicCards()
    .filter((t) => t.slug !== meta.slug)
    .slice(0, 6);

  if (!dataOk) {
    return (
      <main className="container-shell py-12 sm:py-14">
        <TopicHubViewBeacon slug={meta.slug} />
        <div className="mb-6 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/browse" label="Back" />
        </div>
        <div className="card border-amber-400/25 bg-amber-500/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Temporarily unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">We couldn&apos;t load this topic</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            The catalog may be offline. Try again soon, or return to Explore.
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

  let favoriteIds = new Set<string>();
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    const user = await getSessionUser();
    plan = await getUserPlan();
    if (user) favoriteIds = new Set(await getFavoriteEpisodeIds(user.id));
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const related = getRelatedTopicCards(meta.relatedSlugs).filter((t) => t.slug !== meta.slug);
  const relatedExtras = meta.relatedExtraLinks?.filter((l) => l.href?.trim() && l.label?.trim()) ?? [];
  const sources = uniqueSources(episodes);
  const packDef = getTopicPack(meta.slug);
  const resolvedPackSections = packDef?.sections?.length ? resolveTopicPackSections(packDef, episodes) : null;
  const listed = episodes.length;
  const countLine =
    totalCount > 0
      ? totalCount > listed
        ? `${listed} recent of ${totalCount} episodes`
        : `${totalCount} episode${totalCount === 1 ? "" : "s"}`
      : "No episodes yet";

  const featured = episodes.slice(0, Math.min(FEATURED_MAX, Math.max(episodes.length, 0)));
  const more = episodes.length > featured.length ? episodes.slice(featured.length) : [];

  const why = getTopicWhyItMatters(meta);
  const featuredMainHeading = meta.featuredSectionHeading ?? "Featured teachings";
  const featuredSubline =
    meta.featuredSectionSubline ??
    "A curated slice of recent episodes tagged for this topic—hand-built from catalog metadata, not recommendations.";
  const isEndTimes = meta.slug === "end-times";
  const heroFrame = isEndTimes
    ? "card border-accent/35 bg-gradient-to-b from-accent/[0.08] via-soft/20 to-bg/90 p-8 sm:p-10"
    : "card border-line/90 bg-soft/20 p-8 sm:p-10";

  return (
    <main className="container-shell py-12 sm:py-14">
      <TopicHubViewBeacon slug={meta.slug} />
      <TopicVisitTracker slug={meta.slug} />
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/browse" label="Back" />
      </div>

      <header className={heroFrame}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Topic</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{getTopicPageH1(meta)}</h1>
        {meta.introParagraphs?.length ? (
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-slate-300/95">
            {meta.introParagraphs.map((p, i) => (
              <p key={i}>
                <InlineLinkParagraph text={p} />
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{meta.description}</p>
        )}
        {meta.spotlight ? (
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{meta.spotlight}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line/50 pt-5 text-sm text-muted">
          <span className="font-medium text-amber-100/90">{countLine}</span>
          <span className="hidden text-slate-600 sm:inline" aria-hidden>
            ·
          </span>
          <span>Newest first</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <TopicFollowToggle slug={meta.slug} label={meta.label} />
          <Link
            href={`/browse?topic=${encodeURIComponent(catalogTags[0] ?? meta.slug)}&view=episodes` as Route}
            className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-amber-50 transition hover:border-accent/55 hover:bg-accent/15"
          >
            Open this tag in Explore
          </Link>
        </div>
      </header>

      {why.length > 0 ? (
        <section className="mt-12 max-w-3xl border-b border-line/35 pb-10" aria-labelledby="why-it-matters-heading">
          <h2 id="why-it-matters-heading" className="text-xl font-semibold text-white sm:text-2xl">
            Why this matters
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300/95">
            {why.map((p, i) => (
              <p key={i}>
                <InlineLinkParagraph text={p} />
              </p>
            ))}
          </div>
          <div className="mt-8 border-t border-line/40 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Also explore</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-amber-200/90">
              <li>
                <Link href={"/bible" as Route} className="underline-offset-4 hover:underline">
                  Bible Study
                </Link>
              </li>
              <li>
                <Link href={"/world-watch" as Route} className="underline-offset-4 hover:underline">
                  World Watch
                </Link>
              </li>
              <li>
                <Link href={"/browse" as Route} className="underline-offset-4 hover:underline">
                  Explore the directory
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      {(meta.relatedScriptureRefs?.length ?? 0) > 0 ? (
        <section className="mt-10 max-w-3xl" aria-labelledby="related-scripture-heading">
          <h2 id="related-scripture-heading" className="text-xl font-semibold text-white sm:text-2xl">
            Related Scripture
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-300/95 marker:text-amber-200/70 sm:list-outside sm:pl-5">
            {(meta.relatedScriptureRefs ?? []).map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {meta.showMidPageSaveCta ? <TopicMidAccountCta /> : null}

      {featured.length > 0 ? (
        <section className="mt-12" aria-labelledby="featured-teachings-heading">
          <h2 id="featured-teachings-heading" className="text-xl font-semibold text-white sm:text-2xl">
            {featuredMainHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400/95">{featuredSubline}</p>
          <div className="mt-6 space-y-4">
            {featured.map((episode) => (
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
        </section>
      ) : null}

      {(meta.howToUseBullets?.length ?? 0) > 0 ? (
        <section className="mt-10 max-w-3xl border-t border-line/40 pt-8" aria-labelledby="how-to-use-heading">
          <h2 id="how-to-use-heading" className="text-xl font-semibold text-white sm:text-2xl">
            How to use this
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-300/95 marker:text-amber-200/70 sm:list-outside sm:pl-5">
            {(meta.howToUseBullets ?? []).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {why.length === 0 ? (
        <section className="mt-10 max-w-3xl border-t border-line/40 pt-8" aria-label="Also explore">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Also explore</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-amber-200/90">
            <li>
              <Link href={"/bible" as Route} className="underline-offset-4 hover:underline">
                Bible Study
              </Link>
            </li>
            <li>
              <Link href={"/world-watch" as Route} className="underline-offset-4 hover:underline">
                World Watch
              </Link>
            </li>
            <li>
              <Link href={"/browse" as Route} className="underline-offset-4 hover:underline">
                Explore the directory
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {related.length > 0 || relatedExtras.length > 0 ? (
        <section className="mt-12" aria-labelledby="related-topics-heading">
          <h2 id="related-topics-heading" className="text-xl font-semibold text-white sm:text-2xl">
            Related topics
          </h2>
          <p className="mt-2 text-sm text-slate-500">Keep moving inside the site—each hub is written to be read, not skimmed.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {related.map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}` as Route}
                className="rounded-full border border-line/85 bg-soft/35 px-4 py-1.5 text-sm text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.07] hover:text-white"
              >
                {t.label}
              </Link>
            ))}
            {relatedExtras.map((l) => (
              <Link
                key={l.href}
                href={l.href as Route}
                className="rounded-full border border-line/85 bg-soft/35 px-4 py-1.5 text-sm text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.07] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12">
        <TopicReturnRhythm slug={meta.slug} label={meta.label} previewEpisodes={episodes} favoritedEpisodeIds={favoriteIds} />
      </div>

      <div className="mt-10">
        <TopicPackSection topicSlug={meta.slug} resolvedSections={resolvedPackSections} />
      </div>

      {sources.length > 0 ? (
        <section className="mt-12" aria-labelledby="topic-sources-heading">
          <h2 id="topic-sources-heading" className="text-lg font-semibold text-white">
            Sources in this topic
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map((s) => (
              <Link
                key={s.slug}
                href={`/shows/${s.slug}` as Route}
                className="rounded-full border border-line/80 px-3 py-1 text-sm text-slate-300 transition hover:border-accent/35 hover:text-white"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {more.length > 0 ? (
        <section className="mt-12" aria-labelledby="more-teachings-heading">
          <h2 id="more-teachings-heading" className="text-xl font-semibold text-white sm:text-2xl">
            More teachings
          </h2>
          <p className="mt-2 text-sm text-slate-500">Same topic tag in the catalog—scroll at your own pace.</p>
          <div className="mt-6 space-y-4">
            {more.map((episode) => (
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
        </section>
      ) : null}

      <div className="mt-12">
        <TopicSeoCta
          heading={meta.ctaHeading}
          supportLine={meta.ctaSupportLine}
          showPremiumLink={meta.ctaShowPremiumLink !== false}
        />
      </div>

      {episodes.length === 0 ? (
        <div className="card mt-12 border-dashed border-line/55 bg-soft/20 p-10 text-center">
          <p className="text-sm font-medium text-slate-200">Nothing tagged for “{meta.label}” yet</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
            As your directory syncs, episode-level tags fill in from feed keywords and curated seeds. Try a nearby topic, browse the directory, or run
            another sync.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {related.slice(0, 4).map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}` as Route}
                className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-amber-50 hover:border-accent/50"
              >
                {t.label}
              </Link>
            ))}
            {relatedExtras.slice(0, 2).map((l) => (
              <Link
                key={l.href}
                href={l.href as Route}
                className="rounded-full border border-line/80 px-4 py-2 text-sm text-muted hover:border-accent/30 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            {discoverOthers.slice(0, 4).map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}` as Route}
                className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-accent/30 hover:text-white"
              >
                {t.label}
              </Link>
            ))}
          </div>
          <Link
            href={"/browse" as Route}
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
          >
            Open Explore
          </Link>
        </div>
      ) : null}
    </main>
  );
}
