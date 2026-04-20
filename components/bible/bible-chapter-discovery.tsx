"use client";

import Link from "next/link";
import type { Route } from "next";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import { relatedChaptersForChapter, topicHintsForChapter } from "@/lib/bible/chapter-topic-hints";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

type Props = {
  translation: StudyTranslationId;
  urlBook: string;
  chapter: number;
  bookLabel?: string;
  prevChapterHref?: Route | null;
  nextChapterHref?: Route | null;
  /** When the guidance strip already shows “read next”, hide duplicate next link */
  omitNextChapter?: boolean;
  /** Topic slugs already linked in guidance — hide those chips here */
  omitTopicSlugs?: string[];
};

/**
 * Subtle discovery: topical studies + related chapters (when configured). Keeps session depth without noise.
 */
export function BibleChapterDiscovery({
  translation,
  urlBook,
  chapter,
  bookLabel,
  prevChapterHref,
  nextChapterHref,
  omitNextChapter = false,
  omitTopicSlugs = [],
}: Props) {
  const topics = topicHintsForChapter(urlBook, chapter).filter((t) => !omitTopicSlugs.includes(t.slug));
  const related = relatedChaptersForChapter(urlBook, chapter);
  const showNext = Boolean(nextChapterHref) && !omitNextChapter;
  const hasNav = Boolean(prevChapterHref || showNext);
  if (topics.length === 0 && related.length === 0 && !hasNav) return null;

  return (
    <aside className="mt-12 border-t border-stone-300/60 pt-10" aria-labelledby="bible-discover-more">
      <h2 id="bible-discover-more" className="font-serif text-lg font-normal text-stone-700">
        More to explore
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Scripture first—then optional paths for study and context.
      </p>

      {hasNav ? (
        <section className="mt-6" aria-labelledby="bible-continue-book">
          <h3 id="bible-continue-book" className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Continue in {bookLabel ?? "this book"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {prevChapterHref ? (
              <Link
                href={prevChapterHref}
                className="text-stone-600 underline-offset-[0.2em] transition hover:text-stone-800 hover:underline"
              >
                ← Previous chapter
              </Link>
            ) : null}
            {showNext && nextChapterHref ? (
              <Link
                href={nextChapterHref}
                className="text-stone-600 underline-offset-[0.2em] transition hover:text-stone-800 hover:underline"
              >
                Next chapter →
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {topics.length > 0 ? (
        <section className="mt-6" aria-labelledby="bible-related-topics">
          <h3 id="bible-related-topics" className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            On this topic
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={STUDIES_PLATFORM_ROUTES.topic(t.slug) as Route}
                  className="inline-flex rounded-full border border-stone-400/70 bg-white/60 px-3 py-1.5 text-sm text-stone-700 transition hover:border-amber-800/35 hover:bg-amber-50/50"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-8" aria-labelledby="bible-related-passages">
          <h3 id="bible-related-passages" className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Related passages
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {related.map((r) => {
              const base = bibleChapterPath(translation, r.urlBook, r.chapter) as Route;
              const href = (r.verse != null ? `${base}#${r.verse}` : base) as Route;
              return (
                <li key={`${r.urlBook}-${r.chapter}-${r.label}`}>
                  <Link href={href} className="text-amber-900/90 underline-offset-[0.2em] transition hover:text-amber-950 hover:underline">
                    {r.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
