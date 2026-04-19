"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { BIBLE_CANONICAL_BOOK_IDS, getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { getCanonicalBibleBooks, getDefaultBibleBook } from "@/lib/bible/canonical-books";
import {
  buildChapterTtsText,
  timeForVerseStart,
  verseAtPlaybackTime,
} from "@/lib/bible/build-chapter-tts-text";
import { BIBLE_TTS_VOICE_PRESETS, normalizeBibleTtsVoiceKey } from "@/lib/bible/bible-tts-voices";
import { readBibleListenPrefs, writeBibleListenPrefs } from "@/lib/bible/listen-preferences";
import { getBibleBookByApiId, type BibleBookDef } from "@/lib/study/bible-books";
import {
  type BibleApiPassageResponse,
  type BibleApiVerse,
  type StudyTranslationId,
  STUDY_TRANSLATIONS,
  studyTranslationShortLabel,
} from "@/lib/study/bible-api";
import { useBibleNarrationAudio } from "@/components/bible/use-bible-narration-audio";
import { BibleReaderShell } from "@/components/bible/bible-reader-shell";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";

function sortVerses(vs: BibleApiVerse[]): BibleApiVerse[] {
  return [...vs].sort((a, b) => a.verse - b.verse);
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

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
  const [voiceKey, setVoiceKey] = useState(() => normalizeBibleTtsVoiceKey(readBibleListenPrefs().voiceKey));

  const [passage, setPassage] = useState<BibleApiPassageResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ttsReady, setTtsReady] = useState<boolean | null>(null);
  const [ttsStatusMessage, setTtsStatusMessage] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const [resumeVerse, setResumeVerse] = useState<number | null>(() => {
    const v = readBibleListenPrefs().verse;
    return typeof v === "number" && v >= 1 ? v : null;
  });

  const verseRefs = useRef<Map<number, HTMLParagraphElement | null>>(new Map());
  const pendingAutoPlay = useRef(false);
  const chapterTtsKeyRef = useRef<string>("");
  const lastAudioPersistWallMs = useRef(0);

  const listenBookIdRef = useRef(bookId);
  const listenChapterRef = useRef(chapter);
  listenBookIdRef.current = bookId;
  listenChapterRef.current = chapter;

  const versesRef = useRef<BibleApiVerse[]>([]);

  const onPassageEnd = useCallback(() => {
    const list = versesRef.current;
    const lastV = list.length ? list[list.length - 1]!.verse : undefined;
    if (!continueBook) {
      if (typeof lastV === "number") setResumeVerse(lastV);
      writeBibleListenPrefs({ audioTimeSec: 0 });
      return;
    }
    const next = nextChapterRef(listenBookIdRef.current, listenChapterRef.current);
    if (!next) {
      if (typeof lastV === "number") setResumeVerse(lastV);
      writeBibleListenPrefs({ audioTimeSec: 0 });
      return;
    }
    pendingAutoPlay.current = true;
    setBookId(next.bookId);
    setChapter(next.chapter);
    setResumeVerse(1);
    writeBibleListenPrefs({ bookId: next.bookId, chapter: next.chapter, verse: 1, audioTimeSec: 0 });
  }, [continueBook]);

  const narration = useBibleNarrationAudio({ onEnded: onPassageEnd });
  const {
    clearSource,
    loadFromBlob,
    seek,
    play,
    pause,
    setPlaybackRate,
    getDuration,
    duration,
    currentTime,
    playing,
  } = narration;

  const book: BibleBookDef = getBibleBookByApiId(bookId) ?? getDefaultBibleBook();

  useEffect(() => {
    if (!getBibleBookByApiId(bookId)) setBookId(getDefaultBibleBook().apiBookId);
  }, [bookId]);

  const maxChapter = getChapterCountForBookId(book.apiBookId);

  const verses = useMemo(() => (passage?.verses?.length ? sortVerses(passage.verses) : []), [passage]);
  versesRef.current = verses;

  const ttsLayout = useMemo(
    () => buildChapterTtsText(verses, passage?.reference ?? null),
    [verses, passage?.reference],
  );

  useEffect(() => {
    void fetch("/api/bible/tts/status")
      .then((r) => r.json())
      .then((d: { ready?: boolean; message?: string }) => {
        setTtsReady(Boolean(d.ready));
        setTtsStatusMessage(typeof d.message === "string" && d.message ? d.message : null);
      })
      .catch(() => {
        setTtsReady(false);
        setTtsStatusMessage("Could not reach narration service.");
      });
  }, []);

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

  const chapterCacheKey = useMemo(
    () => `${book.apiBookId}|${chapter}|${translation}|${voiceKey}`,
    [book.apiBookId, chapter, translation, voiceKey],
  );

  useEffect(() => {
    clearSource();
    chapterTtsKeyRef.current = "";
    setTtsError(null);
  }, [chapterCacheKey, clearSource]);

  useEffect(() => {
    setPlaybackRate(rate);
  }, [rate, setPlaybackRate]);

  const activeVerse = useMemo(() => {
    if (!verses.length || !ttsLayout.textLength) return null;
    if (playing && duration > 0) {
      return verseAtPlaybackTime(
        ttsLayout.verseRanges,
        ttsLayout.textLength,
        currentTime,
        duration,
      );
    }
    return resumeVerse;
  }, [
    verses.length,
    ttsLayout.verseRanges,
    ttsLayout.textLength,
    playing,
    duration,
    currentTime,
    resumeVerse,
  ]);

  const verseForStorage = (playing && activeVerse != null ? activeVerse : resumeVerse) ?? 1;

  useEffect(() => {
    writeBibleListenPrefs({
      bookId: book.apiBookId,
      chapter,
      verse: verseForStorage,
      translation,
      rate,
      voiceKey,
      continueBook,
    });
  }, [book.apiBookId, chapter, verseForStorage, translation, rate, voiceKey, continueBook]);

  useEffect(() => {
    if (!playing) return;
    const now = Date.now();
    if (now - lastAudioPersistWallMs.current < 3500) return;
    lastAudioPersistWallMs.current = now;
    writeBibleListenPrefs({ audioTimeSec: currentTime });
  }, [currentTime, playing]);

  useEffect(() => {
    const v = activeVerse;
    if (v == null) return;
    const el = verseRefs.current.get(v);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeVerse]);

  const fetchChapterAudio = useCallback(async (): Promise<Blob> => {
    const res = await fetch("/api/bible/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        verses,
        referenceLine: passage?.reference ?? null,
        voicePreset: voiceKey,
        cacheKey: chapterCacheKey,
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(j.error || "Could not generate narration");
    }
    return res.blob();
  }, [verses, passage?.reference, voiceKey, chapterCacheKey]);

  const ensureAudioLoaded = useCallback(async () => {
    if (chapterTtsKeyRef.current === chapterCacheKey) return;
    setTtsLoading(true);
    setTtsError(null);
    try {
      let blob: Blob;
      try {
        blob = await fetchChapterAudio();
      } catch (e1) {
        await new Promise((r) => setTimeout(r, 400));
        blob = await fetchChapterAudio();
        void e1;
      }
      await loadFromBlob(blob);
      chapterTtsKeyRef.current = chapterCacheKey;
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : "Audio failed");
      chapterTtsKeyRef.current = "";
    } finally {
      setTtsLoading(false);
    }
  }, [chapterCacheKey, fetchChapterAudio, loadFromBlob]);

  const startPlayback = useCallback(
    async (opts?: { fromVerse?: number; useSavedTime?: boolean }) => {
      if (!ttsReady || !verses.length) return;
      await ensureAudioLoaded();
      if (chapterTtsKeyRef.current !== chapterCacheKey) return;

      const prefs = readBibleListenPrefs();
      const sameChapter =
        prefs.bookId === book.apiBookId && prefs.chapter === chapter && prefs.translation === translation;

      const dur = getDuration();
      let seekTo = 0;
      if (opts?.fromVerse != null && dur > 0 && ttsLayout.textLength > 0) {
        seekTo = timeForVerseStart(ttsLayout.verseRanges, ttsLayout.textLength, opts.fromVerse, dur);
      } else if (opts?.useSavedTime !== false && sameChapter && prefs.audioTimeSec > 0.5) {
        seekTo = Math.min(prefs.audioTimeSec, Math.max(0, dur - 0.25));
      }

      seek(seekTo);
      play();
    },
    [
      ttsReady,
      verses.length,
      ensureAudioLoaded,
      chapterCacheKey,
      book.apiBookId,
      chapter,
      translation,
      getDuration,
      seek,
      play,
      ttsLayout.verseRanges,
      ttsLayout.textLength,
    ],
  );

  useEffect(() => {
    if (!pendingAutoPlay.current || loading || !ttsReady) return;
    if (!verses.length) {
      if (loadError) pendingAutoPlay.current = false;
      return;
    }
    if (verses[0]!.chapter !== chapter) return;
    pendingAutoPlay.current = false;
    void startPlayback({ fromVerse: 1, useSavedTime: false });
  }, [loading, verses, chapter, loadError, ttsReady, startPlayback]);

  const togglePause = () => {
    if (playing) {
      pause();
      const v =
        verseAtPlaybackTime(ttsLayout.verseRanges, ttsLayout.textLength, currentTime, duration) ?? activeVerse;
      if (v != null) setResumeVerse(v);
      writeBibleListenPrefs({ audioTimeSec: currentTime, verse: v ?? undefined });
      return;
    }
    void startPlayback({ useSavedTime: true });
  };

  const handlePlayFromVerse = (verseNum: number) => {
    setResumeVerse(null);
    void (async () => {
      await ensureAudioLoaded();
      if (chapterTtsKeyRef.current !== chapterCacheKey) return;
      const dur = getDuration();
      const t =
        dur > 0 && ttsLayout.textLength > 0
          ? timeForVerseStart(ttsLayout.verseRanges, ttsLayout.textLength, verseNum, dur)
          : 0;
      seek(t);
      play();
    })();
  };

  const goNextChapter = () => {
    pause();
    chapterTtsKeyRef.current = "";
    clearSource();
    const next = nextChapterRef(book.apiBookId, chapter);
    if (next) {
      setBookId(next.bookId);
      setChapter(next.chapter);
      setResumeVerse(1);
      writeBibleListenPrefs({ audioTimeSec: 0 });
    }
  };

  const goPrevChapter = () => {
    pause();
    chapterTtsKeyRef.current = "";
    clearSource();
    const prev = prevChapterRef(book.apiBookId, chapter);
    if (prev) {
      setBookId(prev.bookId);
      setChapter(prev.chapter);
      setResumeVerse(1);
      writeBibleListenPrefs({ audioTimeSec: 0 });
    }
  };

  const readChapterHref = useMemo(() => {
    const base = bibleChapterPath(translation, apiSlugToUrlBook(book.apiSlug), chapter);
    const v = activeVerse ?? resumeVerse;
    return (v != null && v >= 1 ? `${base}?verse=${v}` : base) as Route;
  }, [translation, book.apiSlug, chapter, activeVerse, resumeVerse]);

  const voiceLabel = BIBLE_TTS_VOICE_PRESETS.find((v) => v.id === voiceKey)?.label ?? "Narrator";

  const progressMax = duration || 0;

  return (
    <div className="mx-auto max-w-3xl pb-44 sm:pb-40">
      <header className="space-y-4 border-b border-stone-700/50 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200">Listen · Bible</p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-100 sm:text-[2.25rem]">Hear Scripture</h1>
        <p className="max-w-prose text-sm leading-relaxed text-stone-400">
          Full-chapter narration with natural voices. Audio is generated on demand for your session; your reader and speed are remembered on this
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
              pause();
              clearSource();
              chapterTtsKeyRef.current = "";
              const id = e.target.value;
              setBookId(id);
              setChapter(1);
              setResumeVerse(1);
              writeBibleListenPrefs({ audioTimeSec: 0 });
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
              pause();
              clearSource();
              chapterTtsKeyRef.current = "";
              const n = Number.parseInt(e.target.value, 10);
              setChapter(n);
              setResumeVerse(1);
              writeBibleListenPrefs({ audioTimeSec: 0 });
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
              pause();
              clearSource();
              chapterTtsKeyRef.current = "";
              setTranslation(e.target.value as StudyTranslationId);
              writeBibleListenPrefs({ audioTimeSec: 0 });
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

      {ttsReady === false ? (
        <p className="mt-6 rounded-xl border border-amber-500/40 bg-stone-950 px-4 py-3 text-sm text-amber-100">
          {ttsStatusMessage ??
            "Narration isn&apos;t available. Set ELEVENLABS_API_KEY and ELEVENLABS_DEFAULT_VOICE_ID on the server (see .env.example), or OPENAI_API_KEY as fallback."}
        </p>
      ) : null}

      <div className="mt-8" data-loading={loading ? "true" : "false"}>
        {loading ? (
          <div className="rounded-[1.5rem] bg-stone-950/35 p-1 ring-1 ring-stone-900/15">
            <div className="animate-pulse space-y-4 rounded-[1.35rem] bg-[#f7f3e9] px-6 py-10 md:px-8" aria-hidden>
              <div className="mx-auto h-7 w-48 rounded-md bg-stone-300/80" />
              <div className="mx-auto h-3 w-28 rounded-md bg-stone-200/90" />
              <div className="space-y-4 pt-6">
                {(["w-[92%]", "w-full", "w-[88%]", "w-[95%]", "w-[90%]", "w-[85%]"] as const).map((cls, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-4 w-7 shrink-0 rounded bg-stone-200" />
                    <div className={["h-4 rounded bg-stone-200/80", cls].join(" ")} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loadError ? (
          <p className="text-sm font-medium text-amber-200">{loadError}</p>
        ) : passage ? (
          <div className="rounded-[1.5rem] bg-stone-950/35 p-1 ring-1 ring-stone-900/15 sm:p-1.5">
            <BibleReaderShell variant="reading" className="px-6 py-8 md:px-8 md:py-10">
              <div className="mb-8 text-center">
                <h2 className="font-serif text-xl text-stone-900 sm:text-2xl">
                  {passage.reference || `${book.label} ${chapter}`}
                </h2>
                <p className="mt-2 text-xs text-stone-600">{studyTranslationShortLabel(translation)} · narration</p>
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
                        disabled={!ttsReady || ttsLoading}
                        className="mt-0.5 w-7 shrink-0 select-none text-left font-serif text-[0.68rem] font-medium tabular-nums text-stone-500 hover:text-stone-800 disabled:opacity-40 md:w-8 md:text-[0.75rem]"
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
        <div className="mx-auto max-w-3xl space-y-3">
          {ttsLoading ? (
            <p className="text-center text-xs text-stone-500">Preparing narration…</p>
          ) : ttsError ? (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-200">
              <span className="truncate">{ttsError}</span>
              <button
                type="button"
                onClick={() => {
                  setTtsError(null);
                  chapterTtsKeyRef.current = "";
                  void ensureAudioLoaded().then(() => play());
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-600 px-2 py-1 text-stone-200 hover:border-stone-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : null}

          <div className="flex w-full items-center gap-3">
            <span className="w-10 shrink-0 tabular-nums text-[11px] text-stone-500">{formatClock(currentTime)}</span>
            <label htmlFor="bible-listen-progress" className="sr-only">
              Playback position
            </label>
            <input
              id="bible-listen-progress"
              type="range"
              min={0}
              max={progressMax || 1}
              step={0.1}
              value={Math.min(currentTime, progressMax || 0)}
              disabled={!progressMax || !ttsReady}
              onChange={(e) => seek(Number.parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-800 accent-amber-500 disabled:opacity-40"
            />
            <span className="w-10 shrink-0 text-right tabular-nums text-[11px] text-stone-500">{formatClock(progressMax)}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePause}
                disabled={!ttsReady || !verses.length || ttsLoading}
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
                  {voiceLabel} · {studyTranslationShortLabel(translation)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                onClick={goPrevChapter}
                disabled={loading}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-3 text-xs font-medium text-stone-200 hover:border-stone-500 disabled:opacity-40"
                aria-label="Previous chapter"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <button
                type="button"
                onClick={goNextChapter}
                disabled={loading}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-600 bg-stone-900 px-3 text-xs font-medium text-stone-200 hover:border-stone-500 disabled:opacity-40"
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
                  {(
                    [
                      [0.75, "0.75× · calm"],
                      [0.85, "0.85× · gentle"],
                      [1, "1× · natural"],
                      [1.1, "1.1× · steady"],
                      [1.25, "1.25× · brisk"],
                      [1.4, "1.4× · quicker"],
                    ] as const
                  ).map(([r, label]) => (
                    <option key={r} value={r}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-[160px] max-w-[240px] flex-1 items-center gap-2 text-xs text-stone-400 sm:min-w-[200px]">
                <span className="hidden sm:inline">Voice</span>
                <select
                  value={voiceKey}
                  onChange={(e) => {
                    pause();
                    clearSource();
                    chapterTtsKeyRef.current = "";
                    setVoiceKey(normalizeBibleTtsVoiceKey(e.target.value));
                  }}
                  disabled={!ttsReady}
                  className="h-10 min-w-0 flex-1 truncate rounded-lg border border-stone-600 bg-stone-950 px-2 text-stone-100 disabled:opacity-50"
                >
                  {BIBLE_TTS_VOICE_PRESETS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <label className="mx-auto mt-3 flex max-w-3xl cursor-pointer items-center gap-2 text-xs text-stone-400">
          <input
            type="checkbox"
            checked={continueBook}
            onChange={(e) => setContinueBook(e.target.checked)}
            className="rounded border-stone-600 bg-stone-900"
          />
          Continue into the next chapter when this one ends
        </label>
      </div>
    </div>
  );
}
