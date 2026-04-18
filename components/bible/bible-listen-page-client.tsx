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

  return (
    <div className="mx-auto max-w-3xl pb-36 sm:pb-32">
      <header className="space-y-3 border-b border-line/45 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Bible</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Read & listen</h1>
        <p className="max-w-prose text-sm leading-relaxed text-slate-400">
          Read the chapter while your device reads it aloud, verse by verse. Choose a translation and voice. Playback uses your
          browser&apos;s speech voices—calm and private, no account required.
        </p>
        <Link
          href={"/bible" as Route}
          className="inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
        >
          Bible study hub
        </Link>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[min(100%,200px)] flex-1 flex-col gap-1.5 text-xs font-medium text-slate-500">
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
            className="min-h-[48px] rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 text-base text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
          >
            {canonicalBooks.map((b) => (
              <option key={b.apiBookId} value={b.apiBookId}>
                {b.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-full min-w-[100px] max-w-[120px] flex-col gap-1.5 text-xs font-medium text-slate-500 sm:w-auto">
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
            className="min-h-[48px] rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 text-base text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
          >
            {Array.from({ length: maxChapter }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[min(100%,160px)] flex-1 flex-col gap-1.5 text-xs font-medium text-slate-500">
          Translation
          <select
            value={translation}
            onChange={(e) => {
              stop();
              setTranslation(e.target.value as StudyTranslationId);
            }}
            className="min-h-[48px] rounded-xl border border-line/55 bg-[rgba(8,11,17,0.55)] px-3 text-base text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
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
        <p className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Read-aloud isn&apos;t available in this environment. Try Safari, Chrome, or Edge on a recent version.
        </p>
      ) : null}

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-slate-500">Loading chapter…</p>
        ) : loadError ? (
          <p className="text-sm text-amber-200/85">{loadError}</p>
        ) : passage ? (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {passage.reference || `${book.label} ${chapter}`}
              </h2>
              <span className="text-xs text-slate-500">{studyTranslationShortLabel(translation)} · read-aloud</span>
            </div>
            <div className="space-y-3 text-[1.05rem] leading-[1.75] text-slate-200/95 sm:text-lg sm:leading-[1.8]">
              {verses.map((v) => {
                const active = activeVerse === v.verse;
                return (
                  <p
                    key={`${v.book_id}-${v.chapter}-${v.verse}`}
                    ref={(el) => {
                      verseRefs.current.set(v.verse, el);
                    }}
                    className={[
                      "rounded-lg px-1 py-0.5 transition-colors",
                      active ? "bg-accent/15 text-amber-50 ring-1 ring-accent/35" : "hover:bg-white/[0.03]",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => handlePlayFromVerse(v.verse)}
                      className="mr-2 inline min-w-[2.25rem] select-none text-left align-top text-xs font-semibold tabular-nums text-slate-500 hover:text-amber-200/90"
                      aria-label={`Play from verse ${v.verse}`}
                    >
                      {v.verse}
                    </button>
                    <span>{v.text}</span>
                  </p>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/50 bg-[rgba(6,9,14,0.92)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(6,9,14,0.85)] sm:px-6">
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
            <div className="min-w-0 text-sm text-slate-300">
              <p className="truncate font-medium text-slate-100">
                {book.label} {chapter}
                {activeVerse != null ? (
                  <span className="font-normal text-slate-500"> · verse {activeVerse}</span>
                ) : resumeVerse != null ? (
                  <span className="font-normal text-slate-500"> · from v{resumeVerse}</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-slate-500">
                {selectedVoice ? selectedVoice.name : "Default voice"} · {studyTranslationShortLabel(translation)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={goPrevChapter}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-line/50 px-3 text-xs font-medium text-slate-300 hover:border-accent/30"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={goNextChapter}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-line/50 px-3 text-xs font-medium text-slate-300 hover:border-accent/30"
              aria-label="Next chapter"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Speed</span>
              <select
                value={rate}
                onChange={(e) => setRate(Number.parseFloat(e.target.value))}
                className="h-10 rounded-lg border border-line/50 bg-[rgba(8,11,17,0.8)] px-2 text-slate-200"
              >
                {[0.75, 0.85, 1, 1.1, 1.25, 1.4].map((r) => (
                  <option key={r} value={r}>
                    {r}×
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-[140px] max-w-[220px] flex-1 items-center gap-2 text-xs text-slate-500 sm:min-w-[180px]">
              <span className="hidden sm:inline">Voice</span>
              <select
                value={voiceKey ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setVoiceKey(val || null);
                  writeBibleListenPrefs({ voiceKey: val || null });
                }}
                className="h-10 min-w-0 flex-1 truncate rounded-lg border border-line/50 bg-[rgba(8,11,17,0.8)] px-2 text-slate-200"
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

        <label className="mx-auto mt-3 flex max-w-3xl cursor-pointer items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={continueBook}
            onChange={(e) => {
              setContinueBook(e.target.checked);
              writeBibleListenPrefs({ continueBook: e.target.checked });
            }}
            className="rounded border-line/60"
          />
          Continue into the next chapter when this one ends
        </label>
      </div>
    </div>
  );
}
