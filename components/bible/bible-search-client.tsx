"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { STUDY_TRANSLATIONS, type StudyTranslationId } from "@/lib/study/bible-api";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";

type VerseHit = {
  reference: string;
  book_slug: string | null;
  chapter_number: number;
  verse_number: number;
  text: string;
  translation_code: string;
};

type SearchPayload = {
  verses: VerseHit[];
  referenceJump: { href: string; label: string; kind: "verse" | "chapter" } | null;
  ftsAvailable?: boolean;
  ftsError?: string;
};

export function BibleSearchClient({ initialQuery }: { initialQuery: string }) {
  const inputId = useId();
  const [q, setQ] = useState(initialQuery);
  const [translation, setTranslation] = useState<StudyTranslationId>("web");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchPayload | null>(null);

  const run = useCallback(async () => {
    const term = q.trim();
    if (term.length < 2) {
      setData({ verses: [], referenceJump: null });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bible/search?q=${encodeURIComponent(term)}&translation=${encodeURIComponent(translation)}`
      );
      const j = (await res.json()) as SearchPayload;
      setData(j);
    } catch {
      setData({ verses: [], referenceJump: null });
    } finally {
      setLoading(false);
    }
  }, [q, translation]);

  const bootstrapped = useRef(false);
  useEffect(() => {
    const term = initialQuery.trim();
    if (term.length < 2 || bootstrapped.current) return;
    bootstrapped.current = true;
    setQ(initialQuery);
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/bible/search?q=${encodeURIComponent(term)}&translation=${encodeURIComponent(translation)}`
        );
        const j = (await res.json()) as SearchPayload;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setData({ verses: [], referenceJump: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialQuery, translation]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Bible</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Search Scripture</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Jump to a reference (for example <span className="text-slate-200">John 3:16</span> or{" "}
          <span className="text-slate-200">Psalm 23</span>), or search words once verse text is indexed in the database.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-xs font-medium text-slate-500" htmlFor={inputId}>
          Search
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              id={inputId}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void run();
              }}
              placeholder="e.g. hope, Romans 8:28, Genesis 1"
              className="w-full rounded-2xl border border-line/80 bg-soft/30 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/45 focus:outline-none focus:ring-1 focus:ring-accent/35"
            />
          </div>
        </label>
        <label className="block w-full text-xs font-medium text-slate-500 sm:w-44">
          Translation
          <select
            className="mt-1.5 w-full rounded-2xl border border-line/80 bg-soft/30 px-3 py-3 text-sm text-slate-100"
            value={translation}
            onChange={(e) => setTranslation(e.target.value as StudyTranslationId)}
          >
            {STUDY_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {data?.ftsError ? (
        <p className="mt-4 text-sm text-amber-200/80">Search index note: {data.ftsError}</p>
      ) : null}

      {data?.referenceJump ? (
        <section className="mt-10 rounded-2xl border border-accent/30 bg-accent/[0.07] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/75">Open reference</p>
          <p className="mt-2 text-sm text-slate-400">{data.referenceJump.label}</p>
          <Link
            href={data.referenceJump.href as Route}
            className="mt-3 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 hover:opacity-95"
          >
            Go to chapter
          </Link>
        </section>
      ) : null}

      {data && data.verses.length > 0 ? (
        <section className="mt-10" aria-labelledby="bible-fts-results">
          <h2 id="bible-fts-results" className="text-lg font-semibold text-white">
            Verse matches
          </h2>
          <ul className="mt-4 space-y-3">
            {data.verses.map((v) => (
              <li key={`${v.book_slug ?? "x"}-${v.chapter_number}-${v.verse_number}`}>
                <Link
                  href={
                    v.book_slug
                      ? (bibleChapterPath(
                          v.translation_code as StudyTranslationId,
                          apiSlugToUrlBook(v.book_slug),
                          v.chapter_number
                        ) as Route)
                      : ("/bible/search" as Route)
                  }
                  className="block rounded-2xl border border-line/55 bg-soft/20 px-4 py-3 transition hover:border-accent/35"
                >
                  <p className="text-xs font-medium text-amber-200/80">
                    {v.reference}{" "}
                    <span className="text-slate-500">
                      ({v.translation_code.toUpperCase()})
                    </span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300/95">{v.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data && data.verses.length === 0 && !data.referenceJump && q.trim().length >= 2 && !loading ? (
        <p className="mt-10 text-sm text-slate-500">
          No verse index hits yet. Try a reference like <span className="text-slate-400">Matthew 5:3</span>, or open the{" "}
          <Link href="/bible" className="text-amber-200/85 underline-offset-2 hover:underline">
            Bible hub
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
