import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getFavoriteEpisodeIds, countEpisodesByTopicTag, getEpisodesByTopicTag } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { EpisodeRow } from "@/components/episode-row";
import { BackButton } from "@/components/buttons/back-button";
import {
  getDiscoverTopicCards,
  getRelatedTopicCards,
  getTopicDefinition,
  normalizeTopicSlug,
} from "@/lib/topics";
import { getShowDisplayLabel } from "@/lib/display";
import type { EpisodeWithShow } from "@/lib/types";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { TopicPackSection } from "@/components/topics/topic-pack-section";
import { getTopicPack } from "@/lib/topic-packs";
import { resolveTopicPackSections } from "@/lib/topic-pack-resolve";

const EP_PAGE_LIMIT = 80;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = getTopicDefinition(slug);
  if (!def) return { title: "Topic · Deep Well Audio" };
  return {
    title: `${def.label} · Deep Well Audio`,
    description: def.description,
  };
}

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

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = normalizeTopicSlug(typeof raw === "string" ? raw : "");
  const meta = getTopicDefinition(slug);
  if (!meta) notFound();

  const [{ episodes, dataOk }, totalCount] = await Promise.all([
    getEpisodesByTopicTag(slug, EP_PAGE_LIMIT),
    countEpisodesByTopicTag(slug),
  ]);

  const discoverOthers = getDiscoverTopicCards()
    .filter((t) => t.slug !== meta.slug)
    .slice(0, 6);

  if (!dataOk) {
    return (
      <main className="container-shell py-12 sm:py-14">
        <div className="mb-6 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/explore" label="Back" />
        </div>
        <div className="card border-amber-400/25 bg-amber-500/5 p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Temporarily unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">We couldn&apos;t load this topic</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            The catalog may be offline. Try again soon, or return to Explore.
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

  let favoriteIds = new Set<string>();
  try {
    const user = await getSessionUser();
    if (user) favoriteIds = new Set(await getFavoriteEpisodeIds(user.id));
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const related = getRelatedTopicCards(meta.relatedSlugs).filter((t) => t.slug !== meta.slug);
  const sources = uniqueSources(episodes);
  const packDef = getTopicPack(meta.slug);
  const resolvedPackSections = packDef?.sections?.length ? resolveTopicPackSections(packDef, episodes) : null;
  const listed = episodes.length;
  const countLine =
    totalCount > 0 ? (totalCount > listed ? `${listed} recent of ${totalCount} episodes` : `${totalCount} episode${totalCount === 1 ? "" : "s"}`) : "No episodes yet";

  const isEndTimes = meta.slug === "end-times";
  const heroFrame = isEndTimes
    ? "card border-accent/35 bg-gradient-to-b from-accent/[0.08] via-soft/20 to-bg/90 p-8 sm:p-10"
    : "card border-line/90 bg-soft/20 p-8 sm:p-10";

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/explore" label="Back" />
      </div>

      <header className={heroFrame}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Topic</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{meta.label}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{meta.description}</p>
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
        <div className="mt-4">
          <Link
            href={`/explore?topic=${encodeURIComponent(meta.slug)}&view=episodes` as Route}
            className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-amber-50 transition hover:border-accent/55 hover:bg-accent/15"
          >
            Filter all of Explore by this topic
          </Link>
        </div>
        {related.length ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/60">Related topics</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}` as Route}
                  className="rounded-full border border-line/85 bg-soft/35 px-4 py-1.5 text-sm text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.07] hover:text-white"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <TopicPackSection topicSlug={meta.slug} resolvedSections={resolvedPackSections} />

      {sources.length > 0 ? (
        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Sources in this topic</p>
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

      <section className="mt-10">
        {episodes.length ? (
          <div className="space-y-4">
            {episodes.map((episode) => (
              <EpisodeRow
                key={episode.id}
                episode={episode}
                showSlug={episode.show?.slug}
                showOfficialUrl={episode.show?.official_url}
                favorited={favoriteIds.has(episode.id)}
                favoriteReturnPath={`/topics/${meta.slug}`}
                showFavorite
              />
            ))}
          </div>
        ) : (
          <div className="card border-dashed border-line/55 bg-soft/20 p-10 text-center">
            <p className="text-sm font-medium text-slate-200">Nothing tagged “{meta.label}” yet</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted">
              As RSS sync runs, episode-level tags fill in from feed keywords and curated seeds. Try a nearby topic, browse the directory, or
              run another sync.
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
              href={"/explore" as Route}
              className="mt-8 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
            >
              Open Explore
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
