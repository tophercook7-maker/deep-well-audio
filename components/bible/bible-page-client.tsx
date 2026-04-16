"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useId, useState } from "react";
import { useAccountPlan } from "@/components/plan/plan-context";
import { useStudy, type StudySavedVerseListRow } from "@/components/study/study-provider";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";
import { readStudyLastPassage, type StudyLastPassage } from "@/lib/study/client-storage";
import {
  collapsePassagePreviewText,
  passagePreviewArgsForSavedVerse,
  passagePreviewKey,
} from "@/lib/study/passage-preview";
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

export function BiblePageClient() {
  const study = useStudy();
  const { plan } = useAccountPlan();

  const inputId = useId();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [lastLocal, setLastLocal] = useState<StudyLastPassage | null>(null);
  const [saved, setSaved] = useState<StudySavedVerseListRow[] | null>(null);
  const [recentNotes, setRecentNotes] = useState<DashboardNote[] | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    setLastLocal(readStudyLastPassage());
  }, []);

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

  const reopenLast = useCallback(() => {
    if (!lastLocal) return;
    const s = normalizeScriptureTagInput(lastLocal.label);
    if (parseScriptureTagForStudy(s)) {
      study.openFromScriptureTag(s, { teachingKey: null, translation: lastLocal.t });
      return;
    }
    study.openReaderQuery(lastLocal.q.trim(), {
      translation: lastLocal.t,
      readingMode: "chapter",
    });
  }, [lastLocal, study]);

  const viewAllHref = "/library#saved-passages" as Route;

  const lastLine = lastLocal ? lastLocal.label || lastLocal.q : null;

  return (
    <div className="mx-auto max-w-xl space-y-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Bible Study</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Read Scripture, explore meaning, and keep your study in one place.
        </p>
      </header>

      <section aria-labelledby="bible-open-heading">
        <h2 id="bible-open-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Open a passage
        </h2>
        <p className="mt-2 text-sm text-muted">Examples: John 3 · Romans 8 · Psalm 23 · John 3:16</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
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
            placeholder="John 3 or John 3:16"
            autoComplete="off"
            className="min-h-[48px] w-full flex-1 rounded-2xl border border-line/60 bg-[rgba(8,11,17,0.55)] px-4 text-base text-slate-100 placeholder:text-slate-500 outline-none ring-accent/20 focus-visible:ring-2"
          />
          <button
            type="button"
            onClick={openPassage}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-accent px-6 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Open
          </button>
        </div>
        {err ? <p className="mt-3 text-sm text-amber-200/90">{err}</p> : null}
      </section>

      <section aria-labelledby="bible-continue-heading">
        <h2 id="bible-continue-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Continue studying
        </h2>
        {lastLine ? (
          <button
            type="button"
            onClick={reopenLast}
            className="mt-4 w-full rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.45)] px-4 py-4 text-left text-sm text-slate-200 transition hover:border-accent/30 hover:bg-white/[0.03]"
          >
            <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">Last opened</span>
            <span className="mt-1 block font-medium text-white">{lastLine}</span>
          </button>
        ) : (
          <p className="mt-3 text-sm text-muted">Open a passage above—your last spot will show up here on this device.</p>
        )}
      </section>

      <section aria-labelledby="bible-saved-heading">
        <h2 id="bible-saved-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Saved passages
        </h2>
        {plan !== "premium" ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Save passages from any verse view with Premium.{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              View plans
            </Link>
          </p>
        ) : saved === null ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : !saved.length ? (
          <p className="mt-3 text-sm text-muted">No saved passages yet—save one from a verse or chapter reader.</p>
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
            View all in My Study
          </Link>
        ) : null}
      </section>

      <section aria-labelledby="bible-notes-heading">
        <h2 id="bible-notes-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Recent Study Notes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pick up where you left off in your notes and verse study.
        </p>
        {plan !== "premium" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Synced notes on this page are part of Premium.{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
              View plans
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
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-sky-200/75">Verse note</span>
                          <span className="text-[10px] text-slate-500">{studyTranslationShortLabel(verseHit.translationId)}</span>
                        </div>
                        <p className="mt-1.5 font-medium text-slate-100">{verseHit.passage.label}</p>
                        {previewText ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300/95">{previewText}</p>
                        ) : null}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={n.id}>
                    <div className="rounded-2xl border border-line/35 bg-[rgba(9,12,18,0.25)] px-4 py-3.5">
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
                      {isYoutubeTeaching ? "From a teaching" : "Note"}
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
            All notes on Dashboard
          </Link>
        ) : null}
      </section>

      <section aria-labelledby="bible-word-meaning-heading">
        <h2 id="bible-word-meaning-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Word Meaning
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tap key words in a verse to explore original meaning, pronunciation, and study detail.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400/95">
          When a verse is open, you&apos;ll see <span className="text-slate-300/95">Key words</span>—pick one to read the original term, how it
          sounds, and a short explanation. Nothing heavy; just enough to go deeper when you want.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Original meaning", "Greek / Hebrew word study", "Key word detail"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-line/40 bg-[rgba(9,12,18,0.3)] px-3 py-1.5 text-xs text-slate-300/95"
            >
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => study.openFromScriptureTag("John 3:16", { teachingKey: null })}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.35)] px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/28 hover:bg-white/[0.04]"
        >
          Open a passage to explore word meaning
        </button>
        <p className="mt-2 text-xs text-slate-500">Opens John 3:16 in Study—then tap a key word below the verse text.</p>
      </section>
    </div>
  );
}
