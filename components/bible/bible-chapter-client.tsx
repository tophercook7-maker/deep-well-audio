"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BibleApiPassageResponse, BibleApiVerse, StudyTranslationId } from "@/lib/study/bible-api";
import { STUDY_TRANSLATIONS, studyTranslationShortLabel } from "@/lib/study/bible-api";
import { getCanonicalBibleBooks } from "@/lib/bible/canonical-books";
import { getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { apiSlugToUrlBook, bibleChapterPath, resolveBookFromUrlSegment } from "@/lib/bible/navigation-urls";
import { createChapterReferenceKey, createVerseReferenceKey, verseRefKey } from "@/lib/study/reference-keys";
import { BookOpen, Headphones, Highlighter, StickyNote } from "lucide-react";

const HIGHLIGHTS = ["yellow", "green", "blue", "pink", "purple"] as const;

type Props = {
  passage: BibleApiPassageResponse;
  translation: StudyTranslationId;
  urlBook: string;
  chapter: number;
  signedIn: boolean;
};

function sortVerses(vs: BibleApiVerse[]) {
  return [...vs].sort((a, b) => a.verse - b.verse);
}

function highlightClass(c: string): string {
  switch (c) {
    case "yellow":
      return "bg-yellow-300/25 border-yellow-300/40";
    case "green":
      return "bg-emerald-400/15 border-emerald-400/35";
    case "blue":
      return "bg-sky-400/15 border-sky-400/35";
    case "pink":
      return "bg-pink-400/15 border-pink-400/35";
    case "purple":
      return "bg-violet-400/15 border-violet-400/35";
    case "orange":
      return "bg-orange-400/15 border-orange-400/35";
    default:
      return "bg-white/[0.04] border-white/10";
  }
}

export function BibleChapterClient({ passage, translation, urlBook, chapter, signedIn }: Props) {
  const book = resolveBookFromUrlSegment(urlBook);
  const verses = useMemo(() => sortVerses(passage.verses ?? []), [passage.verses]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [hlByVerse, setHlByVerse] = useState<Record<number, string>>({});
  const [noteByVerse, setNoteByVerse] = useState<Record<number, string>>({});
  const canonical = useMemo(() => getCanonicalBibleBooks(), []);

  const verseKeyFor = useCallback(
    (v: number) => createVerseReferenceKey({ translation, bookSlug: urlBook.toLowerCase(), chapter, verse: v }),
    [translation, urlBook, chapter]
  );

  const chapterRef = useMemo(
    () => createChapterReferenceKey(translation, urlBook.toLowerCase(), chapter),
    [translation, urlBook, chapter]
  );

  useEffect(() => {
    if (selectedVerse == null) {
      setNoteDraft("");
      return;
    }
    if (signedIn) {
      setNoteDraft(noteByVerse[selectedVerse] ?? "");
      return;
    }
    try {
      setNoteDraft(localStorage.getItem(`dw:note:${verseKeyFor(selectedVerse)}`) ?? "");
    } catch {
      setNoteDraft("");
    }
  }, [selectedVerse, verseKeyFor, signedIn, noteByVerse]);

  useEffect(() => {
    if (!signedIn) {
      try {
        const next: Record<number, string> = {};
        for (const v of verses) {
          const raw = localStorage.getItem(`dw:hl:${verseKeyFor(v.verse)}`);
          if (raw) next[v.verse] = raw === "orange" ? "purple" : raw;
        }
        setHlByVerse(next);
      } catch {
        setHlByVerse({});
      }
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await fetch(
        `/api/study-tools/highlights?translation_code=${encodeURIComponent(translation)}&book_slug=${encodeURIComponent(urlBook.toLowerCase())}`,
        { credentials: "include" }
      );
      if (!res.ok || cancelled) return;
      const j = (await res.json()) as {
        items: { verseNumber: number; color: string; chapterNumber: number }[];
      };
      const next: Record<number, string> = {};
      for (const h of j.items ?? []) {
        if (h.chapterNumber !== chapter) continue;
        next[h.verseNumber] = h.color;
      }
      if (!cancelled) setHlByVerse(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn, translation, urlBook, chapter, verses]);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    const prefix = `verse:${translation}:${urlBook.toLowerCase()}:${chapter}:`;
    void (async () => {
      const res = await fetch(`/api/study-tools/notes?reference_prefix=${encodeURIComponent(prefix)}`, {
        credentials: "include",
      });
      if (!res.ok || cancelled) return;
      const j = (await res.json()) as { items: { reference_key: string; note: string }[] };
      const next: Record<number, string> = {};
      for (const row of j.items ?? []) {
        const m = /^verse:[^:]+:[^:]+:\d+:(\d+)$/.exec(row.reference_key);
        if (m) next[Number(m[1])] = row.note;
      }
      if (!cancelled) setNoteByVerse(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, translation, urlBook, chapter]);

  useEffect(() => {
    if (!signedIn) return;
    void fetch("/api/study-tools/history", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_type: "bible_chapter",
        reference_key: chapterRef,
        progress: 0,
      }),
    });
  }, [signedIn, chapterRef]);

  const title = passage.reference || (book ? `${book.label} ${chapter}` : "Bible");

  const listenHref = useMemo(() => {
    const sp = new URLSearchParams();
    if (book) sp.set("book", book.apiBookId);
    sp.set("chapter", String(chapter));
    if (selectedVerse) sp.set("verse", String(selectedVerse));
    return `/bible/listen?${sp.toString()}` as Route;
  }, [book, chapter, selectedVerse]);

  const nextChapter = useMemo(() => {
    if (!book) return null;
    const max = getChapterCountForBookId(book.apiBookId);
    if (chapter < max) return bibleChapterPath(translation, urlBook, chapter + 1);
    const ix = canonical.findIndex((b) => b.apiBookId === book.apiBookId);
    if (ix < 0 || ix >= canonical.length - 1) return null;
    const nb = canonical[ix + 1]!;
    return bibleChapterPath(translation, apiSlugToUrlBook(nb.apiSlug), 1);
  }, [book, chapter, translation, urlBook, canonical]);

  const prevChapter = useMemo(() => {
    if (!book) return null;
    if (chapter > 1) return bibleChapterPath(translation, urlBook, chapter - 1);
    const ix = canonical.findIndex((b) => b.apiBookId === book.apiBookId);
    if (ix <= 0) return null;
    const pb = canonical[ix - 1]!;
    const pch = getChapterCountForBookId(pb.apiBookId);
    return bibleChapterPath(translation, apiSlugToUrlBook(pb.apiSlug), pch);
  }, [book, chapter, translation, urlBook, canonical]);

  const sel = selectedVerse != null ? verses.find((x) => x.verse === selectedVerse) : null;
  const activeRef = sel ? verseRefKey({ translation, bookSlug: urlBook.toLowerCase(), chapter, verse: sel.verse }) : chapterRef;

  const persistNote = useCallback(async () => {
    if (!sel) return;
    const key = verseKeyFor(sel.verse);
    if (signedIn) {
      await fetch("/api/study-tools/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_type: "verse", reference_key: key, note: noteDraft }),
      });
      setNoteByVerse((m) => ({ ...m, [sel.verse]: noteDraft }));
      return;
    }
    try {
      localStorage.setItem(`dw:note:${key}`, noteDraft);
    } catch {
      /* */
    }
  }, [sel, signedIn, noteDraft, verseKeyFor]);

  const applyHighlight = useCallback(
    async (c: string) => {
      if (!sel) return;
      const v = sel.verse;
      if (signedIn) {
        const res = await fetch("/api/study-tools/highlights", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            translation_code: translation,
            book_slug: urlBook.toLowerCase(),
            chapter_number: chapter,
            verse_number: v,
            color: c,
          }),
        });
        if (res.ok) setHlByVerse((m) => ({ ...m, [v]: c }));
        return;
      }
      try {
        localStorage.setItem(`dw:hl:${verseKeyFor(v)}`, c);
        setHlByVerse((m) => ({ ...m, [v]: c }));
      } catch {
        /* */
      }
    },
    [sel, signedIn, translation, urlBook, chapter, verseKeyFor]
  );

  const studyPanel = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Study</p>
      <div className="rounded-2xl border border-line/45 bg-[rgba(9,12,18,0.45)] p-4">
        <p className="text-xs text-slate-500">Reference key</p>
        <p className="mt-2 break-all font-mono text-xs text-amber-100/90">{activeRef}</p>
        {sel ? (
          <p className="mt-2 text-xs text-slate-500">
            Verse {sel.verse} selected — {signedIn ? "saved to your account" : "stored on this device"}.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Tap a verse number to anchor notes and highlights.</p>
        )}
      </div>
      <Link
        href={listenHref}
        className="flex items-center gap-2 rounded-xl border border-line/50 bg-[rgba(8,11,17,0.55)] px-4 py-3 text-sm text-slate-200 hover:border-accent/30"
      >
        <Headphones className="h-4 w-4 text-amber-200/80" aria-hidden />
        Listen along
      </Link>
      <div className="rounded-2xl border border-line/40 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Highlighter className="h-3.5 w-3.5" aria-hidden />
          Highlight
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HIGHLIGHTS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              disabled={!sel}
              onClick={() => void applyHighlight(c)}
              className={[
                "h-8 w-8 rounded-full border-2 border-white/20",
                c === "yellow" && "bg-yellow-300/90",
                c === "green" && "bg-emerald-400/90",
                c === "blue" && "bg-sky-400/90",
                c === "pink" && "bg-pink-400/90",
                c === "purple" && "bg-violet-500/90",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-line/40 p-4">
        <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          Note
        </p>
        <textarea
          disabled={!sel}
          placeholder={sel ? "Jot a thought…" : "Select a verse first"}
          className="mt-2 min-h-[88px] w-full rounded-xl border border-line/50 bg-[rgba(6,9,14,0.6)] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={() => void persistNote()}
        />
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={"/me/highlights" as Route}
          className="text-amber-200/85 underline-offset-2 hover:underline"
        >
          My highlights
        </Link>
        <Link href={"/me/notes" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
          My notes
        </Link>
      </div>
      <Link
        href={"/studies" as Route}
        className="inline-flex items-center gap-2 text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        Topical studies
      </Link>
    </>
  );

  return (
    <div>
      <div className="lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,280px)] lg:gap-8">
        <aside className="mb-8 space-y-4 lg:mb-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</p>
          <label className="block text-xs font-medium text-slate-500">
            Book
            <select
              className="mt-1.5 w-full rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 py-2.5 text-sm text-slate-100"
              value={book?.apiBookId ?? ""}
              onChange={(e) => {
                const b = canonical.find((x) => x.apiBookId === e.target.value);
                if (!b) return;
                window.location.href = bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1);
              }}
            >
              {canonical.map((b) => (
                <option key={b.apiBookId} value={b.apiBookId}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Chapter
            <select
              className="mt-1.5 w-full rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 py-2.5 text-sm text-slate-100"
              value={chapter}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10);
                window.location.href = bibleChapterPath(translation, urlBook, n);
              }}
            >
              {book &&
                Array.from({ length: getChapterCountForBookId(book.apiBookId) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Translation
            <select
              className="mt-1.5 w-full rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 py-2.5 text-sm text-slate-100"
              value={translation}
              onChange={(e) => {
                window.location.href = bibleChapterPath(e.target.value as StudyTranslationId, urlBook, chapter);
              }}
            >
              {STUDY_TRANSLATIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            {prevChapter ? (
              <Link
                href={prevChapter as Route}
                className="rounded-full border border-line/50 px-3 py-1.5 text-xs text-slate-300 hover:border-accent/30"
              >
                ← Prev
              </Link>
            ) : null}
            {nextChapter ? (
              <Link
                href={nextChapter as Route}
                className="rounded-full border border-line/50 px-3 py-1.5 text-xs text-slate-300 hover:border-accent/30"
              >
                Next →
              </Link>
            ) : null}
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-6 border-b border-line/40 pb-4">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{studyTranslationShortLabel(translation)}</p>
          </header>
          <div className="space-y-4 text-[1.05rem] leading-[1.75] text-slate-200/95 sm:text-lg">
            {verses.map((v) => {
              const active = selectedVerse === v.verse;
              const hl = hlByVerse[v.verse];
              return (
                <p
                  key={`${v.book_id}-${v.chapter}-${v.verse}`}
                  className={[
                    "rounded-lg border px-2 py-1 transition-colors",
                    hl ? highlightClass(hl) : "border-transparent",
                    active ? "ring-1 ring-accent/45 ring-offset-2 ring-offset-[#0b1220]" : "hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVerse(v.verse)}
                    className="mr-2 inline min-w-[2.5rem] align-top text-left text-sm font-semibold tabular-nums text-amber-200/80"
                  >
                    {v.verse}
                  </button>
                  <span>{v.text}</span>
                </p>
              );
            })}
          </div>
        </article>

        <aside className="mt-10 hidden space-y-5 border-t border-line/40 pt-8 lg:mt-0 lg:block lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          {studyPanel}
        </aside>
      </div>

      <details className="mt-8 rounded-2xl border border-line/45 bg-[rgba(8,11,17,0.35)] p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium text-slate-200">Study tools</summary>
        <div className="mt-4 space-y-5">{studyPanel}</div>
      </details>
    </div>
  );
}
