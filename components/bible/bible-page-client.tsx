"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useId, useState } from "react";
import { useAccountPlan } from "@/components/plan/plan-context";
import { useStudy, type StudySavedVerseListRow } from "@/components/study/study-provider";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";
import {
  readStudyLastPassage,
  readStudyLastBibleTopic,
  writeStudyLastBibleTopic,
  STUDY_CONTINUITY_UPDATED_EVENT,
  type StudyLastPassage,
  type StudyLastBibleTopic,
} from "@/lib/study/client-storage";
import { firstVerseRefForTopic, pickBiblePageContinueWinner } from "@/lib/study/bible-continue";
import {
  collapsePassagePreviewText,
  passagePreviewArgsForSavedVerse,
  passagePreviewKey,
} from "@/lib/study/passage-preview";
import { TopicScriptureLinks } from "@/components/study/topic-scripture-links";
import { STUDY_TOPIC_PICKER, topicScriptureMap, type TopicKey } from "@/lib/study/topic-scripture-map";
import { normalizeScriptureTagInput, parseScriptureTagForStudy, parseVerseContentKey } from "@/lib/study/refs";

type DashboardNote = {
  id: string;
  content_type: string;
  content_key: string;
  body: string;
  updated_at: string;
};

type DashboardPayload = {
  savedVerses: StudySavedVerseListRow[];
  recentNotes: DashboardNote[];
};

function noteBodyPreview(body: string): string {
  const t = body.replace(/\s+/g, " ").trim();
  if (!t) return "";
  const max = 160;
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function teachingEpisodeId(contentKey: string): string | null {
  const p = "teaching:episode:";
  if (!contentKey.startsWith(p)) return null;
  const rest = contentKey.slice(p.length).trim();
  return rest.length > 0 ? rest : null;
}

/** Quick-open picks for first-time visitors (same flow as typing a reference). */
const START_HERE_PASSAGES = ["John 3", "Psalm 23", "Romans 8", "Matthew 5", "Proverbs 3"] as const;

export function BiblePageClient() {
  const study = useStudy();
  const { plan } = useAccountPlan();

  const inputId = useId();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [lastLocal, setLastLocal] = useState<StudyLastPassage | null>(() =>
    typeof window !== "undefined" ? readStudyLastPassage() : null,
  );
  const [saved, setSaved] = useState<StudySavedVerseListRow[] | null>(null);
  const [recentNotes, setRecentNotes] = useState<DashboardNote[] | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [studyTopic, setStudyTopic] = useState<TopicKey | null>(null);
  const [lastBibleTopicSnap, setLastBibleTopicSnap] = useState<StudyLastBibleTopic | null>(() =>
    typeof window !== "undefined" ? readStudyLastBibleTopic() : null,
  );

  const refreshContinuity = useCallback(() => {
    setLastLocal(readStudyLastPassage());
    setLastBibleTopicSnap(readStudyLastBibleTopic());
  }, []);

  useEffect(() => {
    refreshContinuity();
    window.addEventListener(STUDY_CONTINUITY_UPDATED_EVENT, refreshContinuity);
    window.addEventListener("focus", refreshContinuity);
    return () => {
      window.removeEventListener(STUDY_CONTINUITY_UPDATED_EVENT, refreshContinuity);
      window.removeEventListener("focus", refreshContinuity);
    };
  }, [refreshContinuity]);

  useEffect(() => {
    if (plan !== "premium") {
      setSaved(null);
      setRecentNotes(null);
      return;
    }
    void (async () => {
      const res = await fetch("/api/study/dashboard", { credentials: "include" });
      if (!res.ok) {
        setSaved([]);
        setRecentNotes([]);
        return;
      }
      const j = (await res.json()) as DashboardPayload;
      setSaved((j.savedVerses ?? []).slice(0, 5));
      setRecentNotes((j.recentNotes ?? []).slice(0, 3));
    })();
  }, [plan]);

  useEffect(() => {
    if (!saved?.length) {
      setPreviews({});
      return;
    }
    const previewRows = saved.slice(0, 5);
    const ac = new AbortController();
    const tasks = previewRows
      .map((row) => {
        const a = passagePreviewArgsForSavedVerse(row);
        return a ? { row, ...a } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    let cancelled = false;
    void (async () => {
      const out: Record<string, string> = {};
      for (const { row, q, t } of tasks) {
        if (cancelled) break;
        try {
          const res = await fetch(`/api/study/passage?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`, {
            signal: ac.signal,
            credentials: "include",
          });
          if (!res.ok) continue;
          const j = (await res.json()) as { text?: string };
          if (typeof j.text !== "string" || !j.text.trim()) continue;
          const snippet = collapsePassagePreviewText(j.text);
          if (snippet) out[passagePreviewKey(q, t)] = snippet;
        } catch {
          /* aborted */
        }
      }
      if (!cancelled && Object.keys(out).length) setPreviews(out);
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [saved]);

  const openPassage = useCallback(() => {
    setErr(null);
    const s = normalizeScriptureTagInput(raw);
    if (!s) {
      setErr("Enter a passage reference.");
      return;
    }
    if (!parseScriptureTagForStudy(s)) {
      setErr("Try something like John 3, Romans 8, Psalm 23, or John 3:16.");
      return;
    }
    study.openFromScriptureTag(s, { teachingKey: null });
  }, [raw, study]);

  const reopenPassage = useCallback((p: StudyLastPassage) => {
    const s = normalizeScriptureTagInput(p.label);
    if (parseScriptureTagForStudy(s)) {
      study.openFromScriptureTag(s, { teachingKey: null, translation: p.t });
      return;
    }
    study.openReaderQuery(p.q.trim(), {
      translation: p.t,
      readingMode: "chapter",
    });
  }, [study]);

  const viewAllHref = "/library#saved-passages" as Route;

  const continueWinner = pickBiblePageContinueWinner({
    lastLocal,
    lastBibleTopic: lastBibleTopicSnap,
    recentNotes,
    plan,
  });

  const handleContinuePrimary = useCallback(() => {
    if (!continueWinner) return;
    if (continueWinner.kind === "passage") {
      reopenPassage(continueWinner.passage);
      return;
    }
    if (continueWinner.kind === "note") {
      study.openFromVerseContentKey(continueWinner.contentKey);
      return;
    }
    study.openFromScriptureTag(firstVerseRefForTopic(continueWinner.topicKey), { teachingKey: null });
  }, [continueWinner, reopenPassage, study]);

  const h2 = "text-base font-semibold text-white";
  const lead = "mt-2 max-w-prose text-sm leading-relaxed text-slate-400/95";

  return (
    <div className="mx-auto max-w-xl space-y-14 sm:space-y-16">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Study Scripture without losing your place</h1>
        <p className="max-w-prose text-base leading-relaxed text-slate-300/95">
          Read, save passages, and keep your study connected over time—continue where you left off, keep notes, and revisit saved verses.
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-slate-500/90">
          Open a reference or explore by topic. Scripture stays with you across sessions.
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-slate-500">
          <span className="text-slate-400/95">Browse</span> is for finding teaching.{" "}
          <span className="text-slate-400/95">Library</span> is for what you&apos;ve saved.{" "}
          <span className="text-slate-400/95">World Watch</span> connects news to Scripture. This page is for reading and study.
        </p>
        {plan === "premium" && saved !== null && recentNotes !== null ? (
          <div className="rounded-2xl border border-line/40 bg-[rgba(9,12,18,0.4)] px-4 py-3 text-sm text-slate-400/95">
            <span className="text-slate-500">Your study snapshot · </span>
            {saved.length} saved passage{saved.length !== 1 ? "s" : ""}
            {" · "}
            {recentNotes.length} recent note{recentNotes.length !== 1 ? "s" : ""} shown below
          </div>
        ) : null}
      </header>

      <section className="space-y-0" aria-labelledby="bible-open-heading">
        <h2 id="bible-open-heading" className={h2}>
          Open a passage
        </h2>
        <p className={lead}>Type a book and chapter, or a verse. Examples: John 3 · Romans 8 · Psalm 23 · John 3:16</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <label htmlFor={inputId} className="sr-only">
            Passage reference
          </label>
          <input
            id={inputId}
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setErr(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") openPassage();
            }}
            placeholder="John 3, Romans 8, Psalm 23, John 3:16…"
            autoComplete="off"
            className="min-h-[52px] w-full flex-1 rounded-2xl border border-line/60 bg-[rgba(8,11,17,0.55)] px-4 text-base text-slate-100 placeholder:text-slate-500 outline-none ring-accent/20 focus-visible:ring-2"
          />
          <button
            type="button"
            onClick={openPassage}
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-2xl bg-accent px-7 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Open in Study
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500">Enter a chapter or verse to open it in Study.</p>
        {err ? <p className="mt-2 text-sm text-amber-200/90">{err}</p> : null}
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Start here</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {START_HERE_PASSAGES.map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => {
                  setErr(null);
                  study.openFromScriptureTag(normalizeScriptureTagInput(ref), { teachingKey: null });
                }}
                className="inline-flex min-h-[40px] items-center rounded-full border border-line/50 bg-[rgba(9,12,18,0.4)] px-3.5 py-2 text-sm text-slate-200 transition hover:border-accent/28 hover:bg-white/[0.03]"
              >
                {ref}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-0" aria-labelledby="bible-study-by-topic-heading">
        <h2 id="bible-study-by-topic-heading" className={h2}>
          Study by topic
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Not sure where to start? Choose a topic.</p>
        <p className={lead}>
          Verses show up after you pick a topic—tap a reference to open it in Study.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {STUDY_TOPIC_PICKER.map(({ key, label }) => {
            const active = studyTopic === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (active) {
                    setStudyTopic(null);
                  } else {
                    writeStudyLastBibleTopic(key);
                    setStudyTopic(key);
                  }
                }}
                className={[
                  "min-h-[48px] rounded-full border px-4 py-2.5 text-sm transition",
                  active
                    ? "border-accent/45 bg-accent/12 text-amber-50"
                    : "border-line/50 bg-[rgba(9,12,18,0.4)] text-slate-200 hover:border-accent/25",
                ].join(" ")}
              >
                {label}
                {active ? <span className="sr-only"> (selected)</span> : null}
              </button>
            );
          })}
        </div>
        {studyTopic ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm leading-relaxed text-slate-500">{topicScriptureMap[studyTopic].description}</p>
            <p className="text-xs text-slate-500">Tap a verse to open Study.</p>
            <TopicScriptureLinks references={topicScriptureMap[studyTopic].verses} />
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Choose a topic to see related passages.</p>
        )}
      </section>

      <section className="space-y-0" aria-labelledby="bible-continue-heading">
        <h2 id="bible-continue-heading" className={h2}>
          Continue studying
        </h2>
        <p className={lead}>
          We use your last passage in Study on this device, your latest verse note when you&apos;re signed in with
          Premium, or the last topic you chose below—whichever was most recent.
        </p>
        {continueWinner ? (
          <button
            type="button"
            onClick={handleContinuePrimary}
            className="mt-5 w-full rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.45)] px-4 py-4 text-left transition hover:border-accent/30 hover:bg-white/[0.03]"
          >
            {continueWinner.kind === "passage" ? (
              <>
                <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Continue where you left off
                </span>
                <span className="mt-1.5 block text-base font-medium text-white">
                  Continue studying {continueWinner.passage.label || continueWinner.passage.q}
                </span>
                <span className="mt-2 block text-xs text-slate-500">Opens in Study</span>
              </>
            ) : continueWinner.kind === "note" ? (
              <>
                <span className="block text-base font-medium text-white">
                  Continue your note on {continueWinner.verseLabel}
                </span>
                <span className="mt-2 block text-xs text-slate-500">From your Bible study · Opens in Study</span>
              </>
            ) : (
              <>
                <span className="block text-base font-medium text-white">
                  Continue your study on {topicScriptureMap[continueWinner.topicKey].label}
                </span>
                <span className="mt-2 block text-xs text-slate-500">Opens a starting passage in Study</span>
              </>
            )}
          </button>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            After you open Scripture, save a note, or pick a topic below, your natural next step will show here.
          </p>
        )}
      </section>

      <section className="space-y-0" aria-labelledby="bible-saved-heading">
        <h2 id="bible-saved-heading" className={h2}>
          Saved passages
        </h2>
        <p className="mt-2 text-sm text-slate-500/95">Passages you wanted to keep close.</p>
        <p className={lead}>Verses and chapters you save in Bible Study show up here. The full list lives in Your Library.</p>
        {plan !== "premium" ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Save passages from any verse view with Premium.{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              See Premium
            </Link>
          </p>
        ) : saved === null ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : !saved.length ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            You haven&apos;t saved anything yet. Open a verse or chapter in Bible Study and tap save—passages you mark will gather here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {saved.slice(0, 5).map((row) => {
              const a = passagePreviewArgsForSavedVerse(row);
              const pk = a ? passagePreviewKey(a.q, a.t) : "";
              const preview = pk ? previews[pk] : undefined;
              const title = (row.passage_label ?? `${row.book_name} ${row.chapter}`).trim();
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => study.openFromSavedVerse(row)}
                    className="w-full rounded-2xl border border-line/45 bg-[rgba(9,12,18,0.4)] px-4 py-4 text-left transition hover:border-accent/25"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-slate-100">{title}</span>
                      <span className="text-xs text-slate-500">{studyTranslationShortLabel(row.translation_id)}</span>
                    </div>
                    {preview ? <p className="mt-2 text-sm leading-relaxed text-muted">{preview}</p> : null}
                    <span className="mt-2 block text-xs text-slate-500">Opens in Bible Study</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {plan === "premium" ? (
          <Link
            href={viewAllHref}
            className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
          >
            View all in Bible Study
          </Link>
        ) : null}
      </section>

      <section className="space-y-0" aria-labelledby="bible-notes-heading">
        <h2 id="bible-notes-heading" className={h2}>
          Recent study notes
        </h2>
        <p className={lead}>A quick look at notes you&apos;ve saved from Study—verse notes open right back to that passage.</p>
        {plan !== "premium" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Synced notes on this page are part of Premium.{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              See Premium
            </Link>
          </p>
        ) : recentNotes === null ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : !recentNotes.length ? (
          <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
            <p>No study notes yet.</p>
            <p>As you study and save notes, they&apos;ll show up here.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {recentNotes.map((n) => {
              const previewText = noteBodyPreview(n.body);
              const episodeId = n.content_type === "teaching" ? teachingEpisodeId(n.content_key) : null;

              if (n.content_key.startsWith("verse:")) {
                const verseHit = parseVerseContentKey(n.content_key);
                if (verseHit) {
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => study.openFromVerseContentKey(n.content_key)}
                        className="w-full rounded-2xl border border-line/40 bg-[rgba(9,12,18,0.35)] px-4 py-3.5 text-left transition hover:border-accent/22"
                      >
                        <p className="text-xs leading-relaxed text-slate-500">
                          From your study on {verseHit.passage.label}
                          <span className="text-slate-600"> · {studyTranslationShortLabel(verseHit.translationId)}</span>
                        </p>
                        {previewText ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/95">{previewText}</p>
                        ) : null}
                        <span className="mt-2 block text-xs text-slate-500">Opens this verse in Study</span>
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={n.id}>
                    <div className="cursor-default rounded-2xl border border-dashed border-line/25 bg-[rgba(9,12,18,0.2)] px-4 py-3.5 text-left">
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">Verse note</p>
                      {previewText ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/95">{previewText}</p>
                      ) : null}
                    </div>
                  </li>
                );
              }

              if (episodeId) {
                return (
                  <li key={n.id}>
                    <Link
                      href={`/episodes/${episodeId}` as Route}
                      className="block rounded-2xl border border-line/35 bg-[rgba(9,12,18,0.28)] px-4 py-3.5 transition hover:border-accent/22"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">From a teaching</p>
                      <p className="mt-1.5 text-xs text-slate-400/90">Podcast episode</p>
                      {previewText ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/95">{previewText}</p>
                      ) : null}
                    </Link>
                  </li>
                );
              }

              const isYoutubeTeaching =
                n.content_type === "teaching" && n.content_key.startsWith("teaching:youtube:");
              return (
                <li key={n.id}>
                  <div className="rounded-2xl border border-line/30 bg-[rgba(9,12,18,0.22)] px-4 py-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                      {isYoutubeTeaching ? "From a teaching" : "From your Bible study"}
                    </p>
                    {isYoutubeTeaching ? <p className="mt-1 text-xs text-slate-500/90">Curated video</p> : null}
                    {previewText ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/95">{previewText}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {plan === "premium" && recentNotes && recentNotes.length > 0 ? (
          <Link
            href={"/dashboard#notes" as Route}
            className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
          >
            All notes in Your Home
          </Link>
        ) : null}
      </section>

      <section className="space-y-0" aria-labelledby="bible-word-meaning-heading">
        <h2 id="bible-word-meaning-heading" className={h2}>
          Word meaning
        </h2>
        <p className={lead}>
          Optional, and easy to skip until you want it—after a verse is open, you can dig into important words: what they meant originally,
          how they sound, and a bit more to read if you like.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Key words in the verse", "Original meaning", "A little more detail"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-line/35 bg-[rgba(9,12,18,0.28)] px-3 py-1.5 text-xs text-slate-400/95"
            >
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => study.openFromScriptureTag("John 3:16", { teachingKey: null })}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.35)] px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/28 hover:bg-white/[0.04]"
        >
          Try it on John 3:16
        </button>
        <p className="mt-2 text-xs text-slate-500">Opens that verse in Study—then scroll to Key words under the text.</p>
      </section>
    </div>
  );
}
