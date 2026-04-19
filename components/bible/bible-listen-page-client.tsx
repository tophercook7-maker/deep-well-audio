"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { BIBLE_CANONICAL_BOOK_IDS, getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { getCanonicalBibleBooks, getDefaultBibleBook } from "@/lib/bible/canonical-books";
import { readBibleListenPrefs, writeBibleListenPrefs } from "@/lib/bible/listen-preferences";
import { getBibleBookByApiId, type BibleBookDef } from "@/lib/study/bible-books";
import {
  type BibleApiPassageResponse,
  type BibleApiVerse,
  type StudyTranslationId,
  STUDY_TRANSLATIONS,
  studyTranslationShortLabel,
} from "@/lib/study/bible-api";
import {
  resolveVoiceFromKey,
  useBibleSpeechPlayback,
  useEnglishSpeechVoices,
  voiceStorageKey,
} from "@/components/bible/use-bible-speech-playback";
import { BibleReaderShell } from "@/components/bible/bible-reader-shell";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";

function sortVerses(vs: BibleApiVerse[]): BibleApiVerse[] {
  return [...vs].sort((a, b) => a.verse - b.verse);
}

function indexOfFirstVerseAtOrAfter(verses: BibleApiVerse[], verseNum: number): number {
  const i = verses.findIndex((v) => v.verse >= verseNum);
  return i === -1 ? 0 : i;
}

function nextChapterRef(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const max = getChapterCountForBookId(bookId);
  if (chapter < max) return { bookId, chapter: chapter + 1 };
  const ix = BIBLE_CANONICAL_BOOK_IDS.indexOf(bookId);
  if (ix < 0 || ix >= BIBLE_CANONICAL_BOOK_IDS.length - 1) return null;
  return { bookId: BIBLE_CANONICAL_BOOK_IDS[ix + 1]!, chapter: 1 };
}

function prevChapterRef(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  if (chapter > 1) return { bookId, chapter: chapter - 1 };
  const ix = BIBLE_CANONICAL_BOOK_IDS.indexOf(bookId);
  if (ix <= 0) return null;
  const prevId = BIBLE_CANONICAL_BOOK_IDS[ix - 1]!;
  return { bookId: prevId, chapter: getChapterCountForBookId(prevId) };
}

export function BibleListenPageClient() {
  const searchParams = useSearchParams();
  const hydratedFromUrl = useRef(false);

  const canonicalBooks = useMemo(() => getCanonicalBibleBooks(), []);
  const [bookId, setBookId] = useState(() => readBibleListenPrefs().bookId);
  const [chapter, setChapter] = useState(() => readBibleListenPrefs().chapter);
  const [translation, setTranslation] = useState<StudyTranslationId>(() => readBibleListenPrefs().translation);
  const [continueBook, setContinueBook] = useState(() => readBibleListenPrefs().continueBook);
  const [rate, setRate] = useState(() => readBibleListenPrefs().rate);
  const [voiceKey, setVoiceKey] = useState<string | null>(() => readBibleListenPrefs().voiceKey);

  const [passage, setPassage] = useState<BibleApiPassageResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [resumeVerse, setResumeVerse] = useState<number | null>(() => {
    const v = readBibleListenPrefs().verse;
    return typeof v === "number" && v >= 1 ? v : null;
  });
  const verseRefs = useRef<Map<number, HTMLParagraphElement | null>>(new Map());
  const pendingAutoPlay = useRef(false);
  const { playing, activeVerse, playVerseRange, stop } = useBibleSpeechPlayback();
  const voices = useEnglishSpeechVoices();
  const selectedVoice = useMemo(() => resolveVoiceFromKey(voices, voiceKey), [voices, voiceKey]);

  const book: BibleBookDef = getBibleBookByApiId(bookId) ?? getDefaultBibleBook();

  useEffect(() => {
    if (!getBibleBookByApiId(bookId)) setBookId(getDefaultBibleBook().apiBookId);
  }, [bookId]);

  const maxChapter = getChapterCountForBookId(book.apiBookId);

  const verses = useMemo(() => (passage?.verses?.length ? sortVerses(passage.verses) : []), [passage]);

  const speechSupported = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  const chainComplete = useCallback(() => {
    if (!continueBook) return;
    const next = nextChapterRef(book.apiBookId, chapter);
    if (!next) return;
    pendingAutoPlay.current = true;
    setBookId(next.bookId);
    setChapter(next.chapter);
  }, [book.apiBookId, chapter, continueBook]);

  /** URL ?book=JHN&chapter=3&verse=16 — applied once. */
  useEffect(() => {
    if (hydratedFromUrl.current) return;
    const b = searchParams.get("book")?.trim().toUpperCase();
    const c = searchParams.get("chapter");
    const v = searchParams.get("verse");
    if (b && getBibleBookByApiId(b)) {
      setBookId(b);
      const cn = c ? Number.parseInt(c, 10) : NaN;
      if (Number.isFinite(cn) && cn >= 1) {
        const cap = getChapterCountForBookId(b);
        setChapter(Math.min(cn, cap));
      }
      const vn = v ? Number.parseInt(v, 10) : NaN;
      if (Number.isFinite(vn) && vn >= 1) setResumeVerse(vn);
    }
    hydratedFromUrl.current = true;
  }, [searchParams]);

  useEffect(() => {
    const ch = chapter;
    const cap = getChapterCountForBookId(book.apiBookId);
    if (ch > cap) setChapter(cap);
  }, [book.apiBookId, chapter]);

  const fetchPassage = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const q = `${book.apiSlug}+${chapter}`;
    try {
      const res = await fetch(`/api/study/passage?q=${encodeURIComponent(q)}&t=${encodeURIComponent(translation)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setPassage(null);
        setLoadError("Could not load this chapter. Try another translation or chapter.");
        return;
      }
      const data = (await res.json()) as BibleApiPassageResponse;
      setPassage(data);
    } catch {
      setPassage(null);
      setLoadError("Network error loading Scripture.");
    } finally {
      setLoading(false);
    }
  }, [book.apiSlug, chapter, translation]);

  useEffect(() => {
    void fetchPassage();
  }, [fetchPassage]);

  useEffect(() => {
    if (!pendingAutoPlay.current || loading) return;
    if (!speechSupported) {
      pendingAutoPlay.current = false;
      return;
    }
    if (!verses.length) {
      if (loadError) pendingAutoPlay.current = false;
      return;
    }
    if (verses[0]!.chapter !== chapter) return;
    pendingAutoPlay.current = false;
    playVerseRange(verses, 0, {
      rate,
      voice: selectedVoice,
      onRangeComplete: chainComplete,
    });
  }, [loading, verses, speechSupported, playVerseRange, rate, selectedVoice, chainComplete, chapter, loadError]);

  useEffect(() => {
    writeBibleListenPrefs({
      bookId: book.apiBookId,
      chapter,
      translation,
      rate,
      voiceKey,
      continueBook,
    });
  }, [book.apiBookId, chapter, translation, rate, voiceKey, continueBook]);

  useEffect(() => {
    const v = activeVerse;
    if (v == null) return;
    const el = verseRefs.current.get(v);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeVerse]);

  const handlePlayChapter = () => {
    if (!verses.length || !speechSupported) return;
    const start = resumeVerse != null ? indexOfFirstVerseAtOrAfter(verses, resumeVerse) : 0;
    setResumeVerse(null);
    playVerseRange(verses, start, {
      rate,
      voice: selectedVoice,
      onRangeComplete: chainComplete,
    });
  };

  const handlePlayFromVerse = (verseNum: number) => {
    if (!verses.length || !speechSupported) return;
    setResumeVerse(null);
    const start = indexOfFirstVerseAtOrAfter(verses, verseNum);
    playVerseRange(verses, start, {
      rate,
      voice: selectedVoice,
      onRangeComplete: chainComplete,
    });
  };

  const togglePause = () => {
    if (playing) {
      const v = activeVerse;
      stop();
      if (v != null) {
        setResumeVerse(v);
        writeBibleListenPrefs({ verse: v, bookId: book.apiBookId, chapter });
      }
      return;
    }
    handlePlayChapter();
  };

  const goNextChapter = () => {
    stop();
    const next = nextChapterRef(book.apiBookId, chapter);
    if (next) {
      setBookId(next.bookId);
      setChapter(next.chapter);
      setResumeVerse(1);
      writeBibleListenPrefs({ bookId: next.bookId, chapter: next.chapter, verse: 1 });
    }
  };

  const goPrevChapter = () => {
    stop();
    const prev = prevChapterRef(book.apiBookId, chapter);
    if (prev) {
      setBookId(prev.bookId);
      setChapter(prev.chapter);
      setResumeVerse(1);
      writeBibleListenPrefs({ bookId: prev.bookId, chapter: prev.chapter, verse: 1 });
    }
  };

  const readChapterHref = bibleChapterPath(translation, apiSlugToUrlBook(book.apiSlug), chapter) as Route;

  return (
    <div className="mx-auto max-w-3xl pb-36 sm:pb-32">
      <header className="space-y-4 border-b border-stone-700/50 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200">Listen · Bible</p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-100 sm:text-[2.25rem]">Hear Scripture read aloud</h1>
        <p className="max-w-prose text-sm leading-relaxed text-stone-400">
          Same chapter as the reader—verse by verse with your chosen voice. Private playback in your browser; preferences are remembered on this
          device.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href={"/bible" as Route} className="font-medium text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline">
            Bible home
          </Link>
          <Link href={readChapterHref} className="font-medium text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline">
            Read this chapter
          </Link>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[min(100%,200px)] flex-1 flex-col gap-1.5 text-xs font-medium text-stone-400">
          Book
          <select
            value={book.apiBookId}
            onChange={(e) => {
              stop();
              const id = e.target.value;
              setBookId(id);
              setChapter(1);
              setResumeVerse(1);
              writeBibleListenPrefs({ bookId: id, chapter: 1, verse: 1 });
            }}
            className="min-h-[48px] rounded-xl border border-stone-600 bg-stone-950 px-3 text-base text-stone-100 shadow-inner outline-none focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/25"
          >
            {canonicalBooks.map((b) => (
              <option key={b.apiBookId} value={b.apiBookId}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-full min-w-[100px] max-w-[120px] flex-col gap-1.5 text-xs font-medium text-stone-400 sm:w-auto">
          Chapter
          <select
            value={chapter}
            onChange={(e) => {
              stop();
              const n = Number.parseInt(e.target.value, 10);
              setChapter(n);
              setResumeVerse(1);
              writeBibleListenPrefs({ chapter: n, verse: 1 });
            }}
            className="min-h-[48px] rounded-xl border border-stone-600 bg-stone-950 px-3 text-base text-stone-100 shadow-inner outline-none focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/25"
          >
            {Array.from({ length: maxChapter }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[min(100%,160px)] flex-1 flex-col gap-1.5 text-xs font-medium text-stone-400">
          Translation
          <select
            value={translation}
            onChange={(e) => {
              stop();
              setTranslation(e.target.value as StudyTranslationId);
            }}
            className="min-h-[48px] rounded-xl border border-stone-600 bg-stone-950 px-3 text-base text-stone-100 shadow-inner outline-none focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/25"
          >
            {STUDY_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!speechSupported ? (
        <p className="mt-6 rounded-xl border border-amber-500/40 bg-stone-950 px-4 py-3 text-sm text-amber-100">
          Read-aloud isn&apos;t available in this environment. Try Safari, Chrome, or Edge on a recent version.
        </p>
      ) : null}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-stone-400">Loading chapter…</p>
        ) : loadError ? (
          <p className="text-sm font-medium text-amber-200">{loadError}</p>
        ) : passage ? (
          <div className="rounded-[1.5rem] bg-stone-950/35 p-1 ring-1 ring-stone-900/15 sm:p-1.5">
            <BibleReaderShell variant="reading" className="px-6 py-8 md:px-8 md:py-10">
              <div className="mb-8 text-center">
                <h2 className="font-serif text-xl text-stone-900 sm:text-2xl">
                  {passage.reference || `${book.label} ${chapter}`}
                </h2>
                <p className="mt-2 text-xs text-stone-600">{studyTranslationShortLabel(translation)} · read-aloud</p>
              </div>
              <div className="mx-auto max-w-none space-y-5 text-[1.0625rem] leading-[1.82] text-stone-950 md:text-[1.125rem] md:leading-[1.88]">
                {verses.map((v) => {
                  const active = activeVerse === v.verse;
                  return (
                    <p
                      key={`${v.book_id}-${v.chapter}-${v.verse}`}
                      ref={(el) => {
                        verseRefs.current.set(v.verse, el);
                      }}
                      className={[
                        "flex gap-3 rounded-r-lg border-l-[3px] py-1 pl-3 transition-colors",
                        active
                          ? "border-amber-700 bg-amber-50/95 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.12)]"
                          : "border-transparent hover:bg-stone-100/90",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => handlePlayFromVerse(v.verse)}
                        className="mt-0.5 w-7 shrink-0 select-none text-left font-serif text-[0.68rem] font-medium tabular-nums text-stone-500 hover:text-stone-800 md:w-8 md:text-[0.75rem]"
                        aria-label={`Play from verse ${v.verse}`}
                      >
                        {v.verse}
                      </button>
                      <span className="min-w-0">{v.text}</span>
                    </p>
                  );
                })}
              </div>
            </BibleReaderShell>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-700 bg-[#0a0c10] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePause}
              disabled={!speechSupported || !verses.length}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-slate-950 disabled:opacity-40"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" strokeWidth={2} /> : <Play className="h-5 w-5 pl-0.5" strokeWidth={2} />}
            </button>
            <div className="min-w-0 text-sm text-stone-300">
              <p className="truncate font-medium text-stone-100">
                {book.label} {chapter}
                {activeVerse != null ? (
                  <span className="font-normal text-stone-500"> · verse {activeVerse}</span>
                ) : resumeVerse != null ? (
                  <span className="font-normal text-stone-500"> · from v{resumeVerse}</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-stone-500">
                {selectedVoice ? selectedVoice.name : "Default voice"} · {studyTranslationShortLabel(translation)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={goPrevChapter}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-3 text-xs font-medium text-stone-200 hover:border-stone-500"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-3 text-xs font-medium text-stone-200 hover:border-stone-500"
              aria-label="Next chapter"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="flex items-center gap-2 text-xs text-stone-400">
              <span className="hidden sm:inline">Speed</span>
              <select
                value={rate}
                onChange={(e) => setRate(Number.parseFloat(e.target.value))}
                className="h-10 rounded-lg border border-stone-600 bg-stone-950 px-2 text-stone-100"
              >
                {[0.75, 0.85, 1, 1.1, 1.25, 1.4].map((r) => (
                  <option key={r} value={r}>
                    {r}×
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-[140px] max-w-[220px] flex-1 items-center gap-2 text-xs text-stone-400 sm:min-w-[180px]">
              <span className="hidden sm:inline">Voice</span>
              <select
                value={voiceKey ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setVoiceKey(val || null);
                  writeBibleListenPrefs({ voiceKey: val || null });
                }}
                className="h-10 min-w-0 flex-1 truncate rounded-lg border border-stone-600 bg-stone-950 px-2 text-stone-100"
              >
                <option value="">Auto (English)</option>
                {voices.map((v) => (
                  <option key={voiceStorageKey(v)} value={voiceStorageKey(v)}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className="mx-auto mt-3 flex max-w-3xl cursor-pointer items-center gap-2 text-xs text-stone-400">
          <input
            type="checkbox"
            checked={continueBook}
            onChange={(e) => {
              setContinueBook(e.target.checked);
              writeBibleListenPrefs({ continueBook: e.target.checked });
            }}
            className="rounded border-stone-600 bg-stone-900"
          />
          Continue into the next chapter when this one ends
        </label>
      </div>
    </div>
  );
}
