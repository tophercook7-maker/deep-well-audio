"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, ChevronRight, X } from "lucide-react";
import { useAccountPlan } from "@/components/plan/plan-context";
import { useStudy, type StudyReaderState } from "@/components/study/study-provider";
import type { BibleApiPassageResponse, StudyTranslationId } from "@/lib/study/bible-api";
import { STUDY_TRANSLATIONS } from "@/lib/study/bible-api";
import type { ParsedPassage } from "@/lib/study/refs";
import { parsePassageFromParts, verseContentKey } from "@/lib/study/refs";
import { resolveBookFromMatch } from "@/lib/study/bible-books";
import { keywordsForPassage, type StudyKeyword } from "@/lib/study/keywords";
import { STUDY_PREMIUM_UPGRADE } from "@/lib/study/copy";
/** Future saved highlights: align with `lib/study/highlight-anchor.ts` and `data-study-verse-key` below. */
const LS_LAST = "dwa-study-last";

function writeLastPassage(q: string, t: string, label: string) {
  try {
    localStorage.setItem(LS_LAST, JSON.stringify({ q, t, label }));
  } catch {
    /* ignore */
  }
}

async function fetchPassageClient(q: string, t: string): Promise<BibleApiPassageResponse | null> {
  const res = await fetch(`/api/study/passage?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return (await res.json()) as BibleApiPassageResponse;
}

export function StudyOverlays() {
  const study = useStudy();
  return (
    <>
      {study.versePassage ? (
        <VerseDrawer
          key={`${study.versePassage.verseKey}-${study.verseTranslation}`}
          passage={study.versePassage}
          translation={study.verseTranslation}
        />
      ) : null}
      {study.reader ? (
        <ReaderDrawer
          key={`${study.reader.apiQuery}-${study.reader.translation}-${study.reader.readingMode ?? ""}`}
          state={study.reader}
        />
      ) : null}
    </>
  );
}

function VerseDrawer({ passage, translation }: { passage: ParsedPassage; translation: string }) {
  const { closeVerse, openReader } = useStudy();
  const { plan, openUpgradeModal } = useAccountPlan();
  const baseId = useId();
  const [t, setT] = useState<StudyTranslationId>((translation as StudyTranslationId) || "web");
  const [data, setData] = useState<BibleApiPassageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [kwPick, setKwPick] = useState<StudyKeyword | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteHint, setNoteHint] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareRows, setCompareRows] = useState<BibleApiPassageResponse[] | null>(null);
  const [compareBusy, setCompareBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setData(null);
      const d = await fetchPassageClient(passage.apiQuery, t);
      if (cancelled) return;
      setData(d);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [passage.apiQuery, t]);

  useEffect(() => {
    writeLastPassage(passage.apiQuery, t, passage.label);
  }, [passage.apiQuery, passage.label, t]);

  useEffect(() => {
    if (plan !== "premium") return;
    void fetch("/api/study/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ passage_ref: passage.label, translation_id: t }),
    }).catch(() => {});
  }, [passage.label, plan, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVerse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeVerse]);

  const keywordLimit = plan === "premium" ? 5 : 2;
  const keywords = useMemo(() => keywordsForPassage(passage, keywordLimit), [passage, keywordLimit]);

  const onSaveVerse = useCallback(async () => {
    if (plan !== "premium") {
      openUpgradeModal();
      return;
    }
    const v0 = data?.verses?.[0];
    if (!v0) return;
    const res = await fetch("/api/study/saved-verses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        book_id: v0.book_id,
        book_name: v0.book_name,
        chapter: passage.chapter,
        verse_from: passage.verseFrom,
        verse_to: passage.verseTo,
        translation_id: t,
        passage_label: passage.label,
        entry_kind: "verse",
      }),
    });
    if (res.status === 403) {
      openUpgradeModal();
      return;
    }
  }, [data?.verses, openUpgradeModal, passage.chapter, passage.label, passage.verseFrom, passage.verseTo, plan, t]);

  const onSaveNote = useCallback(async () => {
    setNoteHint(null);
    const trimmed = noteDraft.trim();
    if (!trimmed) return;

    if (plan === "guest") {
      setNoteHint("Sign in to keep a note with this passage.");
      return;
    }

    setNoteBusy(true);
    try {
      const contentKey = verseContentKey(t, passage.verseKey);
      const res = await fetch("/api/study/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content_type: "verse",
          content_key: contentKey,
          body: trimmed,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        if (res.status === 403 && j.code === "premium_required") {
          openUpgradeModal();
        }
        setNoteHint(j.error ?? "Could not save");
        return;
      }
      setNoteDraft("");
      setNoteOpen(false);
    } finally {
      setNoteBusy(false);
    }
  }, [noteDraft, openUpgradeModal, passage.verseKey, plan, t]);

  const openCompare = useCallback(async () => {
    if (plan !== "premium") {
      openUpgradeModal();
      return;
    }
    setCompareOpen(true);
    if (compareRows) return;
    setCompareBusy(true);
    try {
      const rows = await Promise.all(
        STUDY_TRANSLATIONS.map((tr) => fetchPassageClient(passage.apiQuery, tr.id))
      );
      setCompareRows(rows.filter(Boolean) as BibleApiPassageResponse[]);
    } finally {
      setCompareBusy(false);
    }
  }, [compareRows, openUpgradeModal, passage.apiQuery, plan]);

  const verseText = useMemo(() => {
    if (!data?.verses?.length) return "";
    return data.verses
      .map((v) => v.text.replace(/\s+/g, " ").trim())
      .join(" ");
  }, [data]);

  return (
    <div className="fixed inset-0 z-[220] flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close study panel" onClick={closeVerse} />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-line/60 bg-[rgba(8,11,16,0.97)] shadow-[-12px_0_48px_rgba(0,0,0,0.55)] backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line/50 px-5 py-4">
          <div>
            <p id={`${baseId}-title`} className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
              Open in Study
            </p>
            <p className="mt-1.5 text-lg font-semibold text-white">{passage.label}</p>
            <p className="mt-1 text-xs text-muted">Listen. Read. Understand. Keep what matters.</p>
          </div>
          <button
            type="button"
            onClick={closeVerse}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor={`${baseId}-trans`}>
            Translation
          </label>
          <select
            id={`${baseId}-trans`}
            value={t}
            onChange={(e) => setT(e.target.value as StudyTranslationId)}
            className="mt-1.5 w-full rounded-xl border border-line/70 bg-soft/20 px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
          >
            {STUDY_TRANSLATIONS.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>

          <div
            className="mt-5 rounded-2xl border border-line/55 bg-soft/10 p-4"
            data-study-verse-key={passage.verseKey}
            data-study-translation={t}
          >
            {loading ? (
              <p className="text-sm text-muted">Loading passage…</p>
            ) : verseText ? (
              <p className="text-[0.95rem] leading-[1.75] text-slate-100/95">{verseText}</p>
            ) : (
              <p className="text-sm text-amber-200/85">This reference could not be loaded just now.</p>
            )}
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Key words</p>
            <p className="mt-1 text-xs text-muted">See what important words really mean—tap a word.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k.surface + k.original}
                  type="button"
                  onClick={() => setKwPick((cur) => (cur?.surface === k.surface ? null : k))}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    kwPick?.surface === k.surface
                      ? "border-accent/50 bg-accent/15 text-amber-50"
                      : "border-line/70 text-slate-200 hover:border-accent/35",
                  ].join(" ")}
                >
                  {k.surface}
                </button>
              ))}
            </div>
            {kwPick ? (
              <div className="mt-3 rounded-xl border border-line/60 bg-[rgba(12,16,22,0.65)] p-4 text-sm leading-relaxed text-slate-100/95">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/75">Original meaning</p>
                <p className="mt-2 font-medium text-white">
                  {kwPick.original} <span className="text-muted">({kwPick.language})</span>
                </p>
                <p className="mt-1 text-xs text-amber-100/80">{kwPick.transliteration}</p>
                <p className="mt-0.5 text-xs text-slate-500">Sounds like: {kwPick.pronunciation}</p>
                <p className="mt-3 text-slate-200/95">{kwPick.shortDefinition}</p>
                <p className="mt-2 text-slate-400/95">{kwPick.expanded}</p>
                {kwPick.relatedVerses?.length ? (
                  <p className="mt-3 text-xs text-slate-500">Echoed elsewhere: {kwPick.relatedVerses.join(" · ")}</p>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">More cross-references are coming for other passages.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => setNoteOpen((o) => !o)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line/75 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/40"
            >
              Add note
            </button>
            {noteOpen ? (
              <div className="rounded-2xl border border-line/55 bg-soft/10 p-4">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={5}
                  maxLength={8000}
                  placeholder="A thought, a prayer, a question to revisit…"
                  className="w-full resize-y rounded-xl border border-line/70 bg-[rgba(10,14,20,0.5)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
                />
                {plan === "guest" ? (
                  <p className="mt-2 text-xs text-muted">Notes clear when you leave. Sign in to keep them.</p>
                ) : plan === "free" ? (
                  <p className="mt-2 text-xs text-muted">Free accounts can keep up to two saved study notes.</p>
                ) : null}
                {noteHint ? <p className="mt-2 text-xs text-amber-200/90">{noteHint}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={noteBusy || !noteDraft.trim()}
                    onClick={() => void onSaveNote()}
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-45"
                  >
                    Save note
                  </button>
                  {plan === "guest" ? (
                    <Link
                      href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}` as Route}
                      className="rounded-full border border-line/80 px-4 py-2 text-xs font-medium text-slate-200"
                    >
                      Sign in
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void onSaveVerse()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line/75 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/40"
            >
              Save this verse
            </button>

            <button
              type="button"
              onClick={() => void openCompare()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line/75 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/40"
            >
              Compare translations
              {plan !== "premium" ? <span className="text-[10px] uppercase tracking-wider text-slate-500">Premium</span> : null}
            </button>
            {compareOpen ? (
              <div className="rounded-2xl border border-line/55 bg-soft/10 p-4">
                {plan !== "premium" ? (
                  <p className="text-sm text-muted">{STUDY_PREMIUM_UPGRADE}</p>
                ) : compareBusy ? (
                  <p className="text-sm text-muted">Loading translations…</p>
                ) : (
                  <div className="space-y-4">
                    {(compareRows ?? []).map((row) => (
                      <div key={row.translation_id}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">
                          {row.translation_name ?? row.translation_id}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-100/95">
                          {row.verses.map((v) => v.text.replace(/\s+/g, " ").trim()).join(" ")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                closeVerse();
                openReader(passage, { translation: t, title: passage.label });
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent/15 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-accent/25"
            >
              Read wider context
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ReaderDrawer({ state }: { state: StudyReaderState }) {
  const { closeReader, openVerse } = useStudy();
  const [t, setT] = useState<StudyTranslationId>((state.translation as StudyTranslationId) || "web");
  const [data, setData] = useState<BibleApiPassageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      const d = await fetchPassageClient(state.apiQuery, t);
      if (cancelled) return;
      setData(d);
      setLoading(false);
      if (d?.reference) {
        writeLastPassage(state.apiQuery, t, d.reference);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.apiQuery, t]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReader();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeReader]);

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close reader" onClick={closeReader} />
      <div className="relative z-10 flex max-h-[min(92vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line/60 bg-[rgba(8,11,16,0.98)] shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-md sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-line/50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-amber-200/80" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">Study</p>
              <p className="truncate text-base font-semibold text-white">{state.title ?? data?.reference ?? "Reading"}</p>
              {state.readingMode === "chapter" ? (
                <p className="mt-1.5 text-xs leading-snug text-slate-400/95">
                  You&apos;re reading the whole chapter—scroll at your own pace. Tap a verse anytime to open it in the side panel.
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={closeReader}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-line/40 px-5 py-3">
          <label className="sr-only" htmlFor="reader-trans">
            Translation
          </label>
          <select
            id="reader-trans"
            value={t}
            onChange={(e) => setT(e.target.value as StudyTranslationId)}
            className="w-full rounded-xl border border-line/70 bg-soft/20 px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 focus-visible:ring-2 sm:max-w-xs"
          >
            {STUDY_TRANSLATIONS.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Scripture text is served for personal reading from a public-domain-friendly API (WEB/KJV/ASV). It is not a licensed
            commercial translation bundle.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6" data-study-reader-surface={state.apiQuery}>
          {loading ? (
            <div className="space-y-5 py-1" aria-busy="true" aria-label="Loading passage">
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="space-y-3">
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-[92%] animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-[88%] animate-pulse rounded bg-white/[0.05]" />
                <div className="h-3 w-[95%] animate-pulse rounded bg-white/[0.05]" />
              </div>
              <p className="pt-0.5 text-xs leading-relaxed text-slate-500">Loading this passage…</p>
            </div>
          ) : data?.verses?.length ? (
            <div className="space-y-5">
              {data.verses.map((v) => (
                <VerseLine
                  key={`${v.book_id}-${v.chapter}-${v.verse}`}
                  v={v}
                  translationId={t}
                  onOpen={(p) => {
                    closeReader();
                    openVerse(p, { translation: t });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-line/45 bg-soft/15 px-4 py-6 text-center">
              <p className="text-sm leading-snug text-slate-200/95">This passage didn&apos;t load.</p>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
                Try another translation above, or close and open the passage again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerseLine({
  v,
  onOpen,
  translationId,
}: {
  v: BibleApiPassageResponse["verses"][number];
  onOpen: (p: ParsedPassage) => void;
  translationId: string;
}) {
  const { book_name, chapter, verse, text } = v;
  const verseKey = `${v.book_id}:${chapter}:${verse}`;
  const handle = () => {
    const book = resolveBookFromMatch(book_name);
    if (!book) return;
    const p = parsePassageFromParts(book, chapter, verse);
    if (p) onOpen(p);
  };
  return (
    <button
      type="button"
      onClick={handle}
      data-study-verse-key={verseKey}
      data-study-translation={translationId}
      className="block w-full rounded-2xl border border-transparent px-1 py-2 text-left text-[1.02rem] leading-[1.8] text-slate-100/95 transition hover:border-line/50 hover:bg-white/[0.03]"
    >
      <span className="mr-2 font-semibold text-amber-200/85">{verse}</span>
      <span>{text.replace(/\s+/g, " ").trim()}</span>
      <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Tap verse · Open in Study</span>
    </button>
  );
}
