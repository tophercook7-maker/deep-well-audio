import Link from "next/link";
import type { Route } from "next";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";
import { getNewTestamentBooks, getOldTestamentBooks } from "@/lib/bible/testament";
import type { StudyTranslationId } from "@/lib/study/bible-api";

const DEFAULT_T: StudyTranslationId = "web";

const QUICK_STARTS: { label: string; bookSlug: string; chapter: number }[] = [
  { label: "John", bookSlug: "john", chapter: 1 },
  { label: "Psalms", bookSlug: "psalms", chapter: 1 },
  { label: "Proverbs", bookSlug: "proverbs", chapter: 1 },
  { label: "Romans", bookSlug: "romans", chapter: 1 },
];

type Props = {
  translation?: StudyTranslationId;
  /** Featured one-tap starts above OT / NT lists */
  showQuickStarts?: boolean;
};

export function BibleBrowseBooks({ translation = DEFAULT_T, showQuickStarts = true }: Props) {
  const ot = getOldTestamentBooks();
  const nt = getNewTestamentBooks();

  return (
    <section
      className="rounded-2xl border border-stone-800/45 bg-[rgba(5,8,14,0.48)] px-5 py-9 sm:px-8 sm:py-11"
      aria-labelledby="bible-browse-books-heading"
    >
      <div>
        <h2 id="bible-browse-books-heading" className="font-serif text-2xl font-normal tracking-tight text-white sm:text-[1.75rem]">
          Open a book
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          All sixty-six books in canonical order—tap a name to begin in the reader.
        </p>

        {showQuickStarts ? (
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">Quick starts</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {QUICK_STARTS.map((q) => (
                <li key={q.label}>
                  <Link
                    href={bibleChapterPath(translation, q.bookSlug, q.chapter) as Route}
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-line/45 bg-[rgba(8,11,18,0.65)] px-4 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/32 hover:bg-white/[0.03]"
                  >
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 space-y-10">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">Old Testament</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ot.map((b) => (
                <li key={b.apiBookId}>
                  <Link
                    href={bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1) as Route}
                    className="flex min-h-[44px] items-center rounded-xl border border-stone-800/50 bg-[rgba(8,11,18,0.45)] px-3 py-2.5 text-sm text-slate-200/95 transition-colors duration-200 ease-out hover:border-stone-600/55"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">New Testament</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {nt.map((b) => (
                <li key={b.apiBookId}>
                  <Link
                    href={bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1) as Route}
                    className="flex min-h-[44px] items-center rounded-xl border border-stone-800/50 bg-[rgba(8,11,18,0.45)] px-3 py-2.5 text-sm text-slate-200/95 transition-colors duration-200 ease-out hover:border-stone-600/55"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
