import Link from "next/link";
import type { Route } from "next";
import { Search } from "lucide-react";
import { STUDY_CATEGORY_LABELS, getAllStudyTopics, getStudyLesson, getStudyTopic, searchStudyCatalog } from "@/lib/study";
import {
  STUDIES_HUB_CATEGORY_LABELS,
  STUDIES_HUB_CATEGORY_ORDER,
  STUDIES_HUB_CATEGORY_TOPICS,
} from "@/lib/studies/hub-categories";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

const r = STUDIES_PLATFORM_ROUTES;

const FEATURED_PATHS = [
  ["anxiety", "anxiety-and-trust"],
  ["faith", "what-biblical-faith-is"],
  ["prayer", "prayer-and-dependence"],
  ["salvation", "salvation-by-grace-through-faith"],
] as const;

type Props = { initialQuery: string; formAction: string };

export function StudiesHub({ initialQuery, formAction }: Props) {
  const qRaw = initialQuery.trim();
  const results = qRaw ? searchStudyCatalog(qRaw, 28) : [];
  const allTopics = getAllStudyTopics();

  return (
    <>
      <header className="max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Studies</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Topical Bible study library</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300/95">
          Scripture-first lessons for life issues and spiritual formation—organized by category, saved to your account, and built for returning often.
        </p>
      </header>

      <form action={formAction} method="get" className="mt-10 max-w-2xl" role="search">
        <label htmlFor="studies-hub-search" className="sr-only">
          Search study topics and lessons
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              id="studies-hub-search"
              name="q"
              type="search"
              defaultValue={qRaw}
              placeholder="Search topics, lessons, or references (e.g. Romans 8, anxiety, identity in Christ)…"
              className="w-full rounded-2xl border border-line/80 bg-soft/30 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/45 focus:outline-none focus:ring-1 focus:ring-accent/35"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Search
          </button>
        </div>
      </form>

      {qRaw ? (
        <section className="mt-12" aria-labelledby="studies-results-heading">
          <h2 id="studies-results-heading" className="text-xl font-semibold text-white">
            Results for &ldquo;{qRaw}&rdquo;
          </h2>
          <p className="mt-2 text-sm text-slate-500">Topics are listed before lessons when scores are close.</p>
          {results.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No study topics or lessons matched. Try different words or browse categories below.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {results.map((hit) =>
                hit.kind === "topic" ? (
                  <li key={`t-${hit.topic.slug}`}>
                    <Link
                      href={r.topic(hit.topic.slug) as Route}
                      className="block rounded-2xl border border-line/60 bg-soft/25 px-5 py-4 transition hover:border-accent/35 hover:bg-soft/40"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Topic</span>
                      <span className="mt-1 block text-lg font-semibold text-amber-100/95">{hit.topic.title}</span>
                      <span className="mt-1 block text-sm text-slate-400">{hit.topic.shortDescription}</span>
                    </Link>
                  </li>
                ) : (
                  <li key={`l-${hit.topic.slug}-${hit.lesson.slug}`}>
                    <Link
                      href={r.lesson(hit.topic.slug, hit.lesson.slug) as Route}
                      className="block rounded-2xl border border-line/60 bg-soft/25 px-5 py-4 transition hover:border-accent/35 hover:bg-soft/40"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Lesson</span>
                      <span className="mt-1 block text-lg font-semibold text-amber-100/95">{hit.lesson.title}</span>
                      <span className="mt-1 block text-sm text-slate-400">
                        {hit.topic.title} · {hit.lesson.shortDescription}
                      </span>
                    </Link>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      ) : null}

      {!qRaw ? (
        <section className="mt-14 border-t border-line/40 pt-12" aria-labelledby="studies-major-topics-heading">
          <h2 id="studies-major-topics-heading" className="text-xl font-semibold text-white sm:text-2xl">
            Start with major topics
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Guided tracks with context, key passages, and structured lessons.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {allTopics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={r.topic(t.slug) as Route}
                  className="block h-full rounded-2xl border border-line/55 bg-[rgba(12,16,24,0.45)] px-5 py-4 transition hover:border-accent/35 hover:bg-soft/30"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/65">
                    {STUDY_CATEGORY_LABELS[t.category]}
                  </span>
                  <span className="mt-1 block font-semibold text-amber-50/95">{t.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-400">{t.shortDescription}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`${qRaw ? "mt-14" : "mt-14"} border-t border-line/40 pt-12`} aria-labelledby="studies-categories-heading">
        <h2 id="studies-categories-heading" className="text-xl font-semibold text-white sm:text-2xl">
          Browse by category
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Life struggles, relationships, purpose, spiritual warfare, and gospel foundations—each category opens into focused topics.
        </p>
        <div className="mt-8 space-y-10">
          {STUDIES_HUB_CATEGORY_ORDER.map((cat) => {
            const slugs = STUDIES_HUB_CATEGORY_TOPICS[cat];
            const topics = slugs.map((s) => getStudyTopic(s)).filter((x): x is NonNullable<typeof x> => x != null);
            if (topics.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                  <Link href={r.category(cat) as Route} className="hover:underline">
                    {STUDIES_HUB_CATEGORY_LABELS[cat]}
                  </Link>
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {topics.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={r.topic(t.slug) as Route}
                        className="block h-full rounded-2xl border border-line/55 bg-[rgba(12,16,24,0.45)] px-5 py-4 transition hover:border-accent/35 hover:bg-soft/30"
                      >
                        <span className="font-semibold text-amber-50/95">{t.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-400">{t.shortDescription}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14 border-t border-line/40 pt-10" aria-labelledby="studies-featured-heading">
        <h2 id="studies-featured-heading" className="text-lg font-semibold text-white">
          Featured lessons
        </h2>
        <p className="mt-2 text-sm text-slate-500">Entry points across several themes—each lesson stands on Scripture and reflection.</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {FEATURED_PATHS.map(([topicSlug, lessonSlug]) => {
            const les = getStudyLesson(topicSlug, lessonSlug);
            const label = les?.title ?? lessonSlug;
            return (
              <li key={`${topicSlug}-${lessonSlug}`}>
                <Link
                  href={r.lesson(topicSlug, lessonSlug) as Route}
                  className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 max-w-2xl text-sm leading-relaxed text-slate-500" aria-labelledby="studies-paths-note">
        <h2 id="studies-paths-note" className="sr-only">
          Study paths
        </h2>
        <p>
          Prefer the classic URL? You can still use <Link href={"/study" as Route}>/study</Link> — it mirrors this library. Multi-part series and saved plans will
          layer in over time.
        </p>
      </section>
    </>
  );
}
