"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BibleApiPassageResponse, BibleApiVerse, StudyTranslationId } from "@/lib/study/bible-api";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";
import { getCanonicalBibleBooks } from "@/lib/bible/canonical-books";
import { getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { apiSlugToUrlBook, bibleChapterPath, resolveBookFromUrlSegment } from "@/lib/bible/navigation-urls";
import { createChapterReferenceKey, createVerseReferenceKey, verseRefKey } from "@/lib/study/reference-keys";
import { BibleBookPicker } from "@/components/bible/bible-book-picker";
import { BibleChapterPicker } from "@/components/bible/bible-chapter-picker";
import { BibleChapterToolbar } from "@/components/bible/bible-chapter-toolbar";
import { BibleReaderShell } from "@/components/bible/bible-reader-shell";
import { BibleStudyPanel } from "@/components/bible/bible-study-panel";
import { BibleVerseList } from "@/components/bible/bible-verse-list";
import type { BibleBookDef } from "@/lib/study/bible-books";

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

export function BibleChapterClient({ passage, translation, urlBook, chapter, signedIn }: Props) {
  const book = resolveBookFromUrlSegment(urlBook);
  const verses = useMemo(() => sortVerses(passage.verses ?? []), [passage.verses]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [hlByVerse, setHlByVerse] = useState<Record<number, string>>({});
  const [noteByVerse, setNoteByVerse] = useState<Record<number, string>>({});
  const canonical = useMemo(() => getCanonicalBibleBooks(), []);
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);

  const verseKeyFor = useCallback(
    (v: number) => createVerseReferenceKey({ translation, bookSlug: urlBook.toLowerCase(), chapter, verse: v }),
    [translation, urlBook, chapter],
  );

  const chapterRef = useMemo(
    () => createChapterReferenceKey(translation, urlBook.toLowerCase(), chapter),
    [translation, urlBook, chapter],
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
        { credentials: "include" },
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
    [sel, signedIn, translation, urlBook, chapter, verseKeyFor],
  );

  const go = useCallback((path: string) => {
    window.location.href = path;
  }, []);

  const onTranslationChange = useCallback(
    (t: StudyTranslationId) => {
      go(bibleChapterPath(t, urlBook, chapter));
    },
    [go, urlBook, chapter],
  );

  const onPickBook = useCallback(
    (b: BibleBookDef) => {
      go(bibleChapterPath(translation, apiSlugToUrlBook(b.apiSlug), 1));
    },
    [go, translation],
  );

  const onPickChapter = useCallback(
    (n: number) => {
      go(bibleChapterPath(translation, urlBook, n));
    },
    [go, translation, urlBook],
  );

  const hasNote = useCallback(
    (v: number) => {
      const fromMap = noteByVerse[v];
      if (fromMap && fromMap.trim()) return true;
      if (!signedIn) {
        try {
          return Boolean(localStorage.getItem(`dw:note:${verseKeyFor(v)}`)?.trim());
        } catch {
          return false;
        }
      }
      return false;
    },
    [noteByVerse, signedIn, verseKeyFor],
  );

  const studyPanelProps = {
    activeRef,
    sel: sel ?? null,
    signedIn,
    noteDraft,
    onNoteChange: setNoteDraft,
    onNoteBlur: () => void persistNote(),
    onHighlight: (c: string) => void applyHighlight(c),
    listenHref,
  };

  const toolbar = book ? (
    <BibleChapterToolbar
      chapter={chapter}
      translation={translation}
      onTranslationChange={onTranslationChange}
      prevHref={(prevChapter as Route) ?? null}
      nextHref={(nextChapter as Route) ?? null}
      listenHref={listenHref}
      onOpenBookPicker={() => setBookPickerOpen(true)}
      onOpenChapterPicker={() => setChapterPickerOpen(true)}
    />
  ) : null;

  return (
    <div>
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,300px)] lg:gap-10 lg:items-start">
        <div className="order-1 min-w-0 lg:order-none lg:col-start-2 lg:row-start-1">
          <div className="rounded-[1.5rem] bg-stone-950/35 p-1 ring-1 ring-stone-900/15 sm:p-1.5">
            <BibleReaderShell className="px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
              <header className="mb-10 text-center">
                {book ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-600">{book.label}</p>
                ) : null}
                <h2 className="mt-3 font-serif text-[1.85rem] font-normal leading-tight text-stone-950 md:text-[2.05rem]">{title}</h2>
                <p className="mt-3 text-sm text-stone-600">{studyTranslationShortLabel(translation)}</p>
              </header>
              <BibleVerseList
                verses={verses}
                selectedVerse={selectedVerse}
                hlByVerse={hlByVerse}
                hasNote={hasNote}
                onSelectVerse={setSelectedVerse}
              />
            </BibleReaderShell>
          </div>
        </div>

        <aside className="order-2 space-y-4 lg:order-none lg:sticky lg:top-28 lg:col-start-1 lg:row-start-1">
          {toolbar}
          <Link
            href={"/bible" as Route}
            className="inline-flex text-sm font-medium text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline"
          >
            ← Bible home
          </Link>
        </aside>

        <aside className="order-3 hidden lg:order-none lg:col-start-3 lg:row-start-1 lg:block lg:sticky lg:top-28 lg:border-l lg:border-stone-700/50 lg:pl-8">
          <BibleStudyPanel {...studyPanelProps} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-700 bg-[#0a0c10] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] lg:hidden">
        {selectedVerse != null ? (
          <BibleStudyPanel {...studyPanelProps} compact />
        ) : (
          <p className="text-center text-sm leading-relaxed text-stone-400">
            Tap a verse number for highlights and notes, or{" "}
            <Link href={listenHref} className="font-medium text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline">
              listen to this chapter
            </Link>
            .
          </p>
        )}
      </div>
      <div className={selectedVerse != null ? "h-40 lg:hidden" : "h-20 lg:hidden"} aria-hidden />

      {book ? (
        <>
          <BibleBookPicker
            open={bookPickerOpen}
            onClose={() => setBookPickerOpen(false)}
            currentBookId={book.apiBookId}
            onSelect={onPickBook}
          />
          <BibleChapterPicker
            open={chapterPickerOpen}
            onClose={() => setChapterPickerOpen(false)}
            bookLabel={book.label}
            chapter={chapter}
            chapterCount={getChapterCountForBookId(book.apiBookId)}
            onSelectChapter={onPickChapter}
          />
        </>
      ) : null}
    </div>
  );
}
