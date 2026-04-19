import Link from "next/link";
import type { Route } from "next";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";
import { getNewTestamentBooks, getOldTestamentBooks } from "@/lib/bible/testament";
import type { StudyTranslationId } from "@/lib/study/bible-api";

const DEFAULT_T: StudyTranslationId = "web";

type Props = {
  translation?: StudyTranslationId;
};

export function BibleBrowseBooks({ translation = DEFAULT_T }: Props) {
  const ot = getOldTestamentBooks();
  const nt = getNewTestamentBooks();

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-line/35 bg-[rgba(5,8,14,0.55)] px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="relative">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-white sm:text-[1.75rem]">Browse the canon</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          All sixty-six books in order—tap to open chapter one in the reader.
        </p>

        <div className="mt-8 space-y-10">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">Old Testament</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ot.map((b) => (
                <li key={b.apiBookId}>
                  <Link
                    href={bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1) as Route}
                    className="flex min-h-[44px] items-center rounded-xl border border-line/45 bg-[rgba(8,11,18,0.55)] px-3 py-2.5 text-sm text-slate-200/95 transition hover:border-accent/30 hover:bg-white/[0.03]"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">New Testament</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {nt.map((b) => (
                <li key={b.apiBookId}>
                  <Link
                    href={bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1) as Route}
                    className="flex min-h-[44px] items-center rounded-xl border border-line/45 bg-[rgba(8,11,18,0.55)] px-3 py-2.5 text-sm text-slate-200/95 transition hover:border-accent/30 hover:bg-white/[0.03]"
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
