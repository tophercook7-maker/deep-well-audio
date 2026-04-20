"use client";

import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BIBLE_CANONICAL_BOOK_IDS, getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { getCanonicalBibleBooks, getDefaultBibleBook } from "@/lib/bible/canonical-books";
import {
  buildChapterTtsText,
  timeForVerseStart,
  verseAtPlaybackTime,
} from "@/lib/bible/build-chapter-tts-text";
import { BIBLE_TTS_VOICE_PRESETS, normalizeBibleTtsVoiceKey } from "@/lib/bible/bible-tts-voices";
import {
  readBibleListenPrefs,
  shouldResumeFromSavedPosition,
  writeBibleListenPrefs,
} from "@/lib/bible/listen-preferences";
import { getBibleBookByApiId, type BibleBookDef } from "@/lib/study/bible-books";
import {
  type BibleApiPassageResponse,
  type BibleApiVerse,
  type StudyTranslationId,
  STUDY_TRANSLATIONS,
  studyTranslationShortLabel,
} from "@/lib/study/bible-api";
import { useBibleNarration } from "@/components/bible/bible-narration-context";
import { BibleListenControls } from "@/components/bible/bible-listen-controls";
import type { BibleSleepTimer } from "@/components/bible/bible-listen-sleep";
import { BiblePremiumAudioLock, type BiblePremiumAudioLockAudience } from "@/components/bible/bible-premium-audio-lock";
import { BibleHabitCalmAck } from "@/components/bible/bible-habit-calm-ack";
import { BibleReaderShell } from "@/components/bible/bible-reader-shell";
import { BibleStudyPanel } from "@/components/bible/bible-study-panel";
import { BibleVerseList } from "@/components/bible/bible-verse-list";
import { tryRecordHabitForDailyChapter } from "@/lib/bible/daily-habit";
import { useBibleVerseHashScroll } from "@/lib/bible/use-bible-verse-hash-scroll";
import { apiSlugToUrlBook, bibleChapterPath } from "@/lib/bible/navigation-urls";
import { createChapterReferenceKey, createVerseReferenceKey } from "@/lib/study/reference-keys";
import { verseRefKey } from "@/lib/study/reference-keys";
import type { UserPlan } from "@/lib/permissions";
import { resolveListenEndGuidance } from "@/lib/guidance/guided-next-step";
import { ListenCompletionGuidance } from "@/components/guidance/listen-completion-guidance";

class PremiumAudioBlockedError extends Error {
  constructor() {
    super("Premium required for Bible audio");
    this.name = "PremiumAudioBlockedError";
  }
}

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

type ListenProps = {
  signedIn: boolean;
};

export function BibleListenPageClient({ signedIn }: ListenProps) {
  const searchParams = useSearchParams();
  const hydratedFromUrl = useRef(false);

  const canonicalBooks = useMemo(() => getCanonicalBibleBooks(), []);
  const [bookId, setBookId] = useState(() => readBibleListenPrefs().bookId);
  const [chapter, setChapter] = useState(() => readBibleListenPrefs().chapter);
  const [translation, setTranslation] = useState<StudyTranslationId>(() => readBibleListenPrefs().translation);
  const [continueBook, setContinueBook] = useState(() => readBibleListenPrefs().continueBook);
  const [rate, setRate] = useState(() => readBibleListenPrefs().rate);
  const [voiceKey, setVoiceKey] = useState(() => normalizeBibleTtsVoiceKey(readBibleListenPrefs().voiceKey));
  const [followAlong, setFollowAlong] = useState(() => readBibleListenPrefs().followAlong);
  const [sleepTimer, setSleepTimer] = useState<BibleSleepTimer>("off");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [hlByVerse, setHlByVerse] = useState<Record<number, string>>({});
  const [noteByVerse, setNoteByVerse] = useState<Record<number, string>>({});

  const [passage, setPassage] = useState<BibleApiPassageResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ttsReady, setTtsReady] = useState<boolean | null>(null);
  const [ttsStatusMessage, setTtsStatusMessage] = useState<string | null>(null);
  const [listenPlan, setListenPlan] = useState<UserPlan | null>(null);
  const [narrationAllowed, setNarrationAllowed] = useState<boolean | null>(null);
  const [sessionPremiumBlocked, setSessionPremiumBlocked] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const [resumeVerse, setResumeVerse] = useState<number | null>(() => {
    const v = readBibleListenPrefs().verse;
    return typeof v === "number" && v >= 1 ? v : null;
  });

  const verseRefs = useRef<Map<number, HTMLElement | null>>(new Map());
  const lastFollowScrollVerse = useRef<number | null>(null);
  const pendingAutoPlay = useRef(false);
  const chapterTtsKeyRef = useRef<string>("");
  const lastAudioPersistWallMs = useRef(0);
  const AUDIO_PERSIST_INTERVAL_MS = 8000;
  const habitListenRecorded = useRef(false);
  const [habitAck, setHabitAck] = useState<string | null>(null);
  const [listenPassageEnded, setListenPassageEnded] = useState(false);
  const [readerReveal, setReaderReveal] = useState(true);
  const skipListenRevealAnimRef = useRef(true);

  const listenBookIdRef = useRef(bookId);
  const listenChapterRef = useRef(chapter);
  listenBookIdRef.current = bookId;
  listenChapterRef.current = chapter;

  const versesRef = useRef<BibleApiVerse[]>([]);

  const onPassageEnd = useCallback(() => {
    const list = versesRef.current;
    const lastV = list.length ? list[list.length - 1]!.verse : undefined;
    if (sleepTimer === "chapter") {
      if (typeof lastV === "number") setResumeVerse(lastV);
      writeBibleListenPrefs({ audioTimeSec: 0 });
      setSleepTimer("off");
      setListenPassageEnded(true);
      return;
    }
    if (!continueBook) {
      if (typeof lastV === "number") setResumeVerse(lastV);
      writeBibleListenPrefs({ audioTimeSec: 0 });
      setListenPassageEnded(true);
      return;
    }
    const next = nextChapterRef(listenBookIdRef.current, listenChapterRef.current);
    if (!next) {
      if (typeof lastV === "number") setResumeVerse(lastV);
      writeBibleListenPrefs({ audioTimeSec: 0 });
      setListenPassageEnded(true);
      return;
    }
    setListenPassageEnded(false);
    pendingAutoPlay.current = true;
    setBookId(next.bookId);
    setChapter(next.chapter);
    setResumeVerse(1);
    writeBibleListenPrefs({ bookId: next.bookId, chapter: next.chapter, verse: 1, audioTimeSec: 0 });
  }, [continueBook, sleepTimer]);

  const { player, setNowPlaying, registerPassageEnd } = useBibleNarration();
  const {
    clearSource,
    loadFromUrl,
    seek,
    play,
    pause,
    setPlaybackRate,
    getDuration,
    duration,
    currentTime,
    playing,
  } = player;

  useEffect(() => {
    registerPassageEnd(onPassageEnd);
    return () => registerPassageEnd(null);
  }, [onPassageEnd, registerPassageEnd]);

  useEffect(() => {
    if (sleepTimer === "off" || sleepTimer === "chapter") return;
    const mins = sleepTimer === "10" ? 10 : sleepTimer === "15" ? 15 : 30;
    const deadline = Date.now() + mins * 60 * 1000;
    const id = window.setInterval(() => {
      if (Date.now() >= deadline) {
        pause();
        setSleepTimer("off");
      }
    }, 500);
    return () => clearInterval(id);
  }, [sleepTimer, pause]);

  const book: BibleBookDef = getBibleBookByApiId(bookId) ?? getDefaultBibleBook();

  useEffect(() => {
    habitListenRecorded.current = false;
  }, [book.apiBookId, chapter]);

  useEffect(() => {
    setListenPassageEnded(false);
  }, [book.apiBookId, chapter]);

  useEffect(() => {
    if (playing) setListenPassageEnded(false);
  }, [playing]);

  useEffect(() => {
    if (!habitAck) return;
    const t = window.setTimeout(() => setHabitAck(null), 5200);
    return () => window.clearTimeout(t);
  }, [habitAck]);

  useEffect(() => {
    if (duration <= 0.25) return;
    if (currentTime / duration < 0.7) return;
    if (habitListenRecorded.current) return;
    const recorded = tryRecordHabitForDailyChapter(book.apiBookId, chapter);
    habitListenRecorded.current = true;
    if (recorded) setHabitAck("Chapter complete");
  }, [book.apiBookId, chapter, duration, currentTime]);

  useEffect(() => {
    if (!getBibleBookByApiId(bookId)) setBookId(getDefaultBibleBook().apiBookId);
  }, [bookId]);

  const maxChapter = getChapterCountForBookId(book.apiBookId);

  const verses = useMemo(() => (passage?.verses?.length ? sortVerses(passage.verses) : []), [passage]);
  versesRef.current = verses;

  useEffect(() => {
    if (skipListenRevealAnimRef.current) {
      skipListenRevealAnimRef.current = false;
      return;
    }
    setReaderReveal(false);
    if (loading || verses.length === 0) return;
    const t = window.setTimeout(() => setReaderReveal(true), 170);
    return () => window.clearTimeout(t);
  }, [bookId, chapter, loading, verses.length]);

  const ttsLayout = useMemo(
    () => buildChapterTtsText(verses, passage?.reference ?? null),
    [verses, passage?.reference],
  );

  const urlBook = useMemo(() => apiSlugToUrlBook(book.apiSlug), [book.apiSlug]);

  const listenEndGuidance = useMemo(
    () =>
      resolveListenEndGuidance({
        translation,
        urlBook,
        chapter,
        bookApiId: book.apiBookId,
        maxChapterInBook: maxChapter,
      }),
    [translation, urlBook, chapter, book.apiBookId, maxChapter],
  );

  useBibleVerseHashScroll({
    ready: verses.length > 0 && Boolean(passage),
    chapterKey: `${translation}:${urlBook}:${chapter}`,
  });

  const verseKeyFor = useCallback(
    (v: number) => createVerseReferenceKey({ translation, bookSlug: urlBook.toLowerCase(), chapter, verse: v }),
    [translation, urlBook, chapter],
  );

  const chapterRef = useMemo(
    () => createChapterReferenceKey(translation, urlBook.toLowerCase(), chapter),
    [translation, urlBook, chapter],
  );

  const sel = useMemo(
    () => (selectedVerse != null ? verses.find((x) => x.verse === selectedVerse) ?? null : null),
    [verses, selectedVerse],
  );

  const activeRef = sel
    ? verseRefKey({ translation, bookSlug: urlBook.toLowerCase(), chapter, verse: sel.verse })
    : chapterRef;

  const verseSharePayload = useMemo(() => {
    if (!sel) return null;
    return {
      verseText: sel.text,
      bookLabel: book.label,
      chapter,
      verse: sel.verse,
      translation,
      urlBook,
    };
  }, [sel, book.label, chapter, translation, urlBook]);

  const listenHref = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("book", book.apiBookId);
    sp.set("chapter", String(chapter));
    if (selectedVerse) sp.set("verse", String(selectedVerse));
    return `/bible/listen?${sp.toString()}` as Route;
  }, [book.apiBookId, chapter, selectedVerse]);

  useEffect(() => {
    setSelectedVerse(null);
  }, [book.apiBookId, chapter, translation]);

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
      setNoteDraft(typeof window !== "undefined" ? localStorage.getItem(`dw:note:${verseKeyFor(selectedVerse)}`) ?? "" : "");
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

  const registerVerseRef = useCallback((verse: number, el: HTMLDivElement | null) => {
    if (el) verseRefs.current.set(verse, el);
    else verseRefs.current.delete(verse);
  }, []);

  useEffect(() => {
    void fetch("/api/bible/audio/status")
      .then((r) => r.json())
      .then((d: { ready?: boolean; message?: string; plan?: UserPlan; narrationAllowed?: boolean }) => {
        setListenPlan(typeof d.plan === "string" ? d.plan : null);
        setNarrationAllowed(typeof d.narrationAllowed === "boolean" ? d.narrationAllowed : null);
        setTtsReady(Boolean(d.ready));
        setTtsStatusMessage(typeof d.message === "string" && d.message ? d.message : null);
      })
      .catch(() => {
        setListenPlan("guest");
        setNarrationAllowed(false);
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

  useEffect(() => {
    if (listenPlan === "premium" && narrationAllowed) setSessionPremiumBlocked(false);
  }, [listenPlan, narrationAllowed]);

  useEffect(() => {
    if (!passage) {
      setNowPlaying(null);
      return;
    }
    setNowPlaying({
      bookId: book.apiBookId,
      bookLabel: book.label,
      chapter,
      translationLabel: studyTranslationShortLabel(translation),
    });
  }, [passage, book.apiBookId, book.label, chapter, translation, setNowPlaying]);

  const playingVerse = useMemo(() => {
    if (!followAlong || !verses.length || !ttsLayout.textLength || !playing || duration <= 0) return null;
    return verseAtPlaybackTime(
      ttsLayout.verseRanges,
      ttsLayout.textLength,
      currentTime,
      duration,
    );
  }, [followAlong, verses.length, ttsLayout, playing, duration, currentTime]);

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
      followAlong,
    });
  }, [book.apiBookId, chapter, verseForStorage, translation, rate, voiceKey, continueBook, followAlong]);

  useEffect(() => {
    lastFollowScrollVerse.current = null;
  }, [chapterCacheKey]);

  useEffect(() => {
    if (!followAlong || !playing || playingVerse == null) return;
    if (lastFollowScrollVerse.current === playingVerse) return;
    lastFollowScrollVerse.current = playingVerse;
    const el = verseRefs.current.get(playingVerse);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [followAlong, playing, playingVerse]);

  useEffect(() => {
    if (!playing) return;
    const now = Date.now();
    if (now - lastAudioPersistWallMs.current < AUDIO_PERSIST_INTERVAL_MS) return;
    lastAudioPersistWallMs.current = now;
    const prefs = readBibleListenPrefs();
    writeBibleListenPrefs({
      audioTimeSec: currentTime,
      lastDurationSec: duration > 0.5 ? duration : prefs.lastDurationSec,
      lastPlayedAt: new Date().toISOString(),
    });
  }, [currentTime, playing, duration]);

  const resolveChapterAudioUrl = useCallback(async (): Promise<string> => {
    const body = {
      translation,
      book: book.apiBookId,
      chapter,
      voice: voiceKey,
    };
    const maxAttempts = 120;
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch("/api/bible/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as
        | { ok: true; audioUrl: string; cached?: boolean; voice?: string; reference?: string }
        | { ok: true; generating: true; retryAfterMs: number }
        | { ok: false; error?: string; message?: string; premiumRequired?: boolean; code?: string };

      if (res.status === 403 || (data && typeof data === "object" && "premiumRequired" in data && data.premiumRequired)) {
        throw new PremiumAudioBlockedError();
      }

      if (!data.ok) {
        const msg =
          typeof (data as { message?: string }).message === "string" && (data as { message: string }).message.trim()
            ? (data as { message: string }).message
            : typeof (data as { error?: string }).error === "string"
              ? (data as { error: string }).error
              : "Could not prepare narration";
        throw new Error(msg);
      }
      if ("audioUrl" in data && data.audioUrl) {
        return data.audioUrl;
      }
      if ("generating" in data && data.generating) {
        await new Promise((r) => setTimeout(r, data.retryAfterMs ?? 2000));
        continue;
      }
      throw new Error("Unexpected narration response");
    }
    throw new Error("Timed out while preparing narration");
  }, [translation, book.apiBookId, chapter, voiceKey]);

  const ensureAudioLoaded = useCallback(async () => {
    if (chapterTtsKeyRef.current === chapterCacheKey) return;
    if (narrationAllowed === false || sessionPremiumBlocked) {
      pause();
      clearSource();
      chapterTtsKeyRef.current = "";
      return;
    }
    setTtsLoading(true);
    setTtsError(null);
    try {
      let url: string;
      try {
        url = await resolveChapterAudioUrl();
      } catch (e1) {
        if (e1 instanceof PremiumAudioBlockedError) throw e1;
        await new Promise((r) => setTimeout(r, 400));
        url = await resolveChapterAudioUrl();
      }
      await loadFromUrl(url);
      chapterTtsKeyRef.current = chapterCacheKey;
    } catch (e) {
      if (e instanceof PremiumAudioBlockedError) {
        pause();
        clearSource();
        chapterTtsKeyRef.current = "";
        setSessionPremiumBlocked(true);
        setTtsError(null);
      } else {
        setTtsError(e instanceof Error ? e.message : "Audio failed");
        chapterTtsKeyRef.current = "";
      }
    } finally {
      setTtsLoading(false);
    }
  }, [
    chapterCacheKey,
    resolveChapterAudioUrl,
    loadFromUrl,
    narrationAllowed,
    sessionPremiumBlocked,
    pause,
    clearSource,
  ]);

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
      } else if (opts?.useSavedTime !== false && sameChapter && shouldResumeFromSavedPosition(prefs.audioTimeSec)) {
        seekTo = Math.min(prefs.audioTimeSec, Math.max(0, dur - 0.25));
      }

      seek(seekTo);
      play();
      writeBibleListenPrefs({ lastPlayedAt: new Date().toISOString() });
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

  const handleSeekAudio = useCallback(
    (verseNum: number) => {
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
        setResumeVerse(verseNum);
        writeBibleListenPrefs({ lastPlayedAt: new Date().toISOString() });
      })();
    },
    [ensureAudioLoaded, chapterCacheKey, getDuration, seek, play, ttsLayout.verseRanges, ttsLayout.textLength],
  );

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

  const showPremiumLock =
    sessionPremiumBlocked || (listenPlan != null && (listenPlan === "guest" || listenPlan === "free"));

  const lockAudience: BiblePremiumAudioLockAudience =
    listenPlan === "free" && !sessionPremiumBlocked ? "free" : "guest";

  const progressMax = duration || 0;

  const seekByDelta = useCallback(
    (deltaSec: number) => {
      const dur = progressMax;
      if (!dur) return;
      seek(Math.max(0, Math.min(dur, currentTime + deltaSec)));
    },
    [currentTime, progressMax, seek],
  );

  return (
    <div
      className={
        showPremiumLock
          ? "mx-auto max-w-3xl pb-[min(36rem,78svh)] sm:pb-72"
          : selectedVerse != null
            ? "mx-auto max-w-3xl pb-[min(34rem,78svh)] sm:pb-52"
            : "mx-auto max-w-3xl pb-44 sm:pb-40"
      }
    >
      <header className="space-y-4 border-b border-stone-700/50 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200">Listen · Bible</p>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-100 sm:text-[2.25rem]">Hear Scripture</h1>
        <p className="max-w-prose text-sm leading-relaxed text-stone-400">
          Full-chapter narration with natural voices. Each chapter is generated once per translation and voice, then streamed from our library—your
          reader, speed, and place are remembered on this device.
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

      {listenPlan === "premium" && ttsReady === false ? (
        <p className="mt-6 rounded-xl border border-amber-500/30 bg-stone-950/80 px-4 py-3 text-sm leading-relaxed text-amber-100/95">
          {ttsStatusMessage ??
            "Narration isn&apos;t ready yet. Check that ELEVENLABS_API_KEY and voice env vars are set, and Supabase Storage (bible-audio bucket) is configured."}
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
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <BibleReaderShell variant="reading" className="px-6 py-10 md:px-10 md:py-12">
                <div
                  className={`transition-opacity duration-500 ease-out motion-reduce:opacity-100 ${
                    readerReveal || verses.length === 0 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <header className="mb-8 text-center md:mb-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">{book.label}</p>
                    <h2 className="mt-2 font-serif text-lg font-normal leading-snug tracking-tight text-stone-800 sm:text-xl">
                      {passage.reference || `${book.label} ${chapter}`}
                    </h2>
                    <p className="mt-2 text-xs text-stone-500">{studyTranslationShortLabel(translation)}</p>
                    <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-stone-500">
                      Verse numbers move playback. Tap a verse to read or add notes—audio continues.
                    </p>
                  </header>
                  <BibleVerseList
                    verses={verses}
                    selectedVerse={selectedVerse}
                    playingVerse={playingVerse}
                    followAlongEnabled={followAlong}
                    hlByVerse={hlByVerse}
                    hasNote={hasNote}
                    onSelectVerse={setSelectedVerse}
                    onSeekAudio={handleSeekAudio}
                    registerVerseRef={registerVerseRef}
                    seekDisabled={!ttsReady || ttsLoading}
                  />
                  <div className="mt-8 min-h-[1.25rem] space-y-3">
                    <BibleHabitCalmAck message={habitAck} variant="chapterEnd" />
                    {habitAck ? (
                      <p className="text-center text-xs leading-relaxed text-stone-400/95">
                        Share a verse from this chapter by selecting it.
                      </p>
                    ) : null}
                    {listenPassageEnded ? (
                      <ListenCompletionGuidance resolved={listenEndGuidance} className="mt-6" />
                    ) : null}
                  </div>
                </div>
              </BibleReaderShell>
            </div>
            <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:border-l lg:border-stone-700/35 lg:pl-8">
              <BibleStudyPanel
                activeRef={activeRef}
                sel={sel}
                signedIn={signedIn}
                noteDraft={noteDraft}
                onNoteChange={setNoteDraft}
                onNoteBlur={() => void persistNote()}
                onHighlight={applyHighlight}
                listenHref={listenHref}
                hideListenLink
                share={verseSharePayload}
              />
            </aside>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-800/80 bg-[#0b0a09]/98 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          {selectedVerse != null ? (
            <div className="mb-2 max-h-[min(38vh,340px)] overflow-y-auto overscroll-contain border-b border-stone-700/90 pb-2 lg:hidden">
              <BibleStudyPanel
                compact
                activeRef={activeRef}
                sel={sel}
                signedIn={signedIn}
                noteDraft={noteDraft}
                onNoteChange={setNoteDraft}
                onNoteBlur={() => void persistNote()}
                onHighlight={applyHighlight}
                listenHref={listenHref}
                hideListenLink
                share={verseSharePayload}
              />
            </div>
          ) : null}
          <BibleListenControls
            showPremiumLock={showPremiumLock}
            premiumLockSlot={<BiblePremiumAudioLock audience={lockAudience} />}
            ttsLoading={ttsLoading}
            ttsError={ttsError}
            onRetryError={() => {
              setTtsError(null);
              chapterTtsKeyRef.current = "";
              void ensureAudioLoaded().then(() => play());
            }}
            currentTime={currentTime}
            progressMax={progressMax}
            onSeek={(t) => seek(t)}
            seekByDelta={seekByDelta}
            ttsReady={Boolean(ttsReady)}
            canOperate={verses.length > 0}
            playing={playing}
            onTogglePause={togglePause}
            bookLabel={book.label}
            chapter={chapter}
            displayVerseLine={
              <>
                {activeVerse != null ? (
                  <span className="font-normal text-stone-500"> · v{activeVerse}</span>
                ) : resumeVerse != null ? (
                  <span className="font-normal text-stone-500"> · from v{resumeVerse}</span>
                ) : null}
              </>
            }
            voiceLabel={voiceLabel}
            translationShort={studyTranslationShortLabel(translation)}
            onPrevChapter={goPrevChapter}
            onNextChapter={goNextChapter}
            loading={loading}
            rate={rate}
            onRateChange={setRate}
            voiceKey={voiceKey}
            onVoiceChange={(k) => {
              pause();
              clearSource();
              chapterTtsKeyRef.current = "";
              setVoiceKey(normalizeBibleTtsVoiceKey(k));
            }}
            voiceOptions={BIBLE_TTS_VOICE_PRESETS.map((v) => ({ id: v.id, label: v.label }))}
            continueBook={continueBook}
            onContinueBookChange={setContinueBook}
            followAlong={followAlong}
            onFollowAlongChange={(v) => {
              setFollowAlong(v);
              writeBibleListenPrefs({ followAlong: v });
            }}
            sleepTimer={sleepTimer}
            onSleepTimerChange={setSleepTimer}
          />
        </div>
      </div>
    </div>
  );
}
