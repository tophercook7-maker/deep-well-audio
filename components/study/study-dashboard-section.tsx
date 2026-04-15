"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, History, Sparkles } from "lucide-react";
import { parseScriptureTagForStudy, parseVerseContentKey } from "@/lib/study/refs";
import {
  collapsePassagePreviewText,
  passagePreviewArgsForSavedVerse,
  passagePreviewArgsFromVerseContentKey,
  passagePreviewKey,
} from "@/lib/study/passage-preview";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";
import { useStudyOptional, type StudySavedVerseListRow } from "@/components/study/study-provider";
import { DEFAULT_READER_QUERY } from "@/components/study/study-provider";

const LS_LAST = "dwa-study-last";

type DashboardNote = {
  id: string;
  content_type: string;
  content_key: string;
  body: string;
  updated_at: string;
};

type DashboardPayload = {
  recentNotes: DashboardNote[];
  savedVerses: StudySavedVerseListRow[];
  recentHistory: Array<{ passage_ref: string; translation_id: string; opened_at: string }>;
};

type LocalLast = { q: string; t: string; label: string };

function readLastLocal(): LocalLast | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_LAST);
    if (!raw) return null;
    const o = JSON.parse(raw) as { q?: string; t?: string; label?: string };
    if (typeof o.q === "string" && o.q) return { q: o.q, t: typeof o.t === "string" ? o.t : "web", label: o.label ?? o.q };
  } catch {
    /* ignore */
  }
  return null;
}

function parseIsoTs(iso?: string): number {
  if (!iso) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

function pickTier1SavedOrHistory(data: DashboardPayload): { kind: "saved"; row: StudySavedVerseListRow } | { kind: "history"; row: DashboardPayload["recentHistory"][number] } | null {
  type Cand =
    | { kind: "saved"; row: StudySavedVerseListRow; t: number }
    | { kind: "history"; row: DashboardPayload["recentHistory"][number]; t: number };
  const cands: Cand[] = [];
  const saved = data.savedVerses[0];
  if (saved) cands.push({ kind: "saved", row: saved, t: parseIsoTs(saved.created_at) });
  const hist = data.recentHistory[0];
  if (hist && parseScriptureTagForStudy(hist.passage_ref)) {
    cands.push({ kind: "history", row: hist, t: parseIsoTs(hist.opened_at) });
  }
  if (cands.length === 0) return null;
  cands.sort((a, b) => b.t - a.t);
  const top = cands[0];
  return top.kind === "saved" ? { kind: "saved", row: top.row } : { kind: "history", row: top.row };
}

function savedRowTitle(row: StudySavedVerseListRow): string {
  return (row.passage_label ?? `${row.book_name} ${row.chapter}:${row.verse_from}`).trim();
}

function savedRowKindCue(row: StudySavedVerseListRow): string {
  return row.entry_kind === "reader" ? "Chapter reading" : "Verse view";
}

function teachingNoteLabel(): string {
  return "From a teaching";
}

const rowBtn =
  "w-full rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-line/45 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/35";

const inlineOpen =
  "shrink-0 rounded-lg border border-line/50 px-2.5 py-1 text-[11px] font-medium text-amber-100/90 transition hover:border-accent/35 hover:bg-white/[0.04]";

export function StudyDashboardSection() {
  const study = useStudyOptional();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastLocal, setLastLocal] = useState<LocalLast | null>(null);
  const [passagePreviews, setPassagePreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    queueMicrotask(() => {
      setLastLocal(readLastLocal());
    });
  }, []);

  const load = useCallback(() => {
    void (async () => {
      setErr(null);
      const res = await fetch("/api/study/dashboard", { credentials: "include" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? "Could not load study");
        setData(null);
        return;
      }
      setData((await res.json()) as DashboardPayload);
    })();
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const ac = new AbortController();
    const byKey = new Map<string, { q: string; t: string }>();
    for (const v of data.savedVerses.slice(0, 6)) {
      const a = passagePreviewArgsForSavedVerse(v);
      if (a) byKey.set(passagePreviewKey(a.q, a.t), a);
    }
    for (const n of data.recentNotes.slice(0, 5)) {
      const a = passagePreviewArgsFromVerseContentKey(n.content_key);
      if (a) byKey.set(passagePreviewKey(a.q, a.t), a);
    }
    const tasks = [...byKey.values()];
    if (tasks.length === 0) {
      setPassagePreviews({});
      return;
    }

    setPassagePreviews({});
    let cancelled = false;
    const concurrency = 3;
    let nextIndex = 0;
    const snippets = new Array<string | undefined>(tasks.length);

    const worker = async () => {
      while (!cancelled) {
        const i = nextIndex++;
        if (i >= tasks.length) break;
        const { q, t } = tasks[i];
        try {
          const res = await fetch(`/api/study/passage?q=${encodeURIComponent(q)}&t=${encodeURIComponent(t)}`, {
            signal: ac.signal,
          });
          if (!res.ok) continue;
          const j = (await res.json()) as { text?: string };
          if (typeof j.text !== "string" || !j.text.trim()) continue;
          const snippet = collapsePassagePreviewText(j.text);
          if (snippet) snippets[i] = snippet;
        } catch {
          /* aborted or network */
        }
      }
    };

    void Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())).then(() => {
      if (cancelled) return;
      const out: Record<string, string> = {};
      tasks.forEach((task, idx) => {
        const s = snippets[idx];
        if (s) out[passagePreviewKey(task.q, task.t)] = s;
      });
      if (Object.keys(out).length) setPassagePreviews(out);
    });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [data]);

  const continueTarget = useMemo(() => {
    if (!data) return { phase: "loading" as const };
    const t1 = pickTier1SavedOrHistory(data);
    if (t1) {
      if (t1.kind === "saved") {
        return {
          phase: "ready" as const,
          label: savedRowTitle(t1.row),
          hint: "Your most recent saved passage",
          onOpen: () => study?.openFromSavedVerse(t1.row),
        };
      }
      return {
        phase: "ready" as const,
        label: t1.row.passage_ref,
        hint: "Recently opened in Study",
        onOpen: () => study?.openFromScriptureTag(t1.row.passage_ref, { translation: t1.row.translation_id }),
      };
    }
    const verseNote = data.recentNotes.find((n) => n.content_key.startsWith("verse:"));
    const parsedVerseNote = verseNote ? parseVerseContentKey(verseNote.content_key) : null;
    if (verseNote && parsedVerseNote) {
      return {
        phase: "ready" as const,
        label: parsedVerseNote.passage.label,
        hint: "Linked to your latest verse note",
        onOpen: () => study?.openFromVerseContentKey(verseNote.content_key),
      };
    }
    if (lastLocal) {
      return {
        phase: "ready" as const,
        label: lastLocal.label,
        hint: "Last passage on this device",
        onOpen: () => study?.openReaderQuery(lastLocal.q, { translation: lastLocal.t, title: lastLocal.label }),
      };
    }
    return { phase: "empty" as const };
  }, [data, lastLocal, study]);

  return (
    <section id="study" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/[0.08] text-sky-100">
          <BookOpen className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Study</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Your private space for saved passages, notes, and recent reading—organized in one calm view.
            </p>
          </div>

          {err ? <p className="text-sm text-amber-200/85">{err}</p> : null}

          <div className="rounded-[20px] border border-line/45 bg-[rgba(8,11,16,0.35)] p-1 sm:p-2">
            <div className="rounded-2xl border border-line/35 bg-soft/[0.07] px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Continue studying</p>
              {continueTarget.phase === "loading" ? (
                <p className="mt-3 text-sm text-muted">Loading…</p>
              ) : continueTarget.phase === "ready" && continueTarget.onOpen ? (
                <button
                  type="button"
                  onClick={() => continueTarget.onOpen?.()}
                  className="mt-3 w-full rounded-2xl border border-line/55 bg-[rgba(10,14,20,0.5)] px-4 py-3.5 text-left text-sm text-slate-100 transition hover:border-accent/30"
                >
                  <span className="block font-medium text-white">{continueTarget.label}</span>
                  <span className="mt-1 block text-xs text-muted">{continueTarget.hint}</span>
                </button>
              ) : (
                <p className="mt-3 text-sm text-muted">Open a passage from Browse or a teaching—your rhythm will gather here.</p>
              )}
              {study && continueTarget.phase !== "loading" ? (
                <button
                  type="button"
                  onClick={() => study.openReaderQuery(DEFAULT_READER_QUERY, { title: "Psalm 1" })}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-100/90 transition hover:border-accent/45"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Open Psalm 1
                </button>
              ) : null}
            </div>

            <div className="mt-2 divide-y divide-line/40 rounded-2xl border border-line/30 bg-[rgba(7,10,15,0.25)]">
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Saved passages</p>
                {!data ? (
                  <p className="mt-3 text-sm text-muted">Loading…</p>
                ) : data.savedVerses.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Passages you save from Study appear here.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {data.savedVerses.slice(0, 6).map((v) => {
                      const pv = passagePreviewArgsForSavedVerse(v);
                      const pk = pv ? passagePreviewKey(pv.q, pv.t) : "";
                      const preview = pk ? passagePreviews[pk] : undefined;
                      return (
                        <li key={v.id}>
                          {study ? (
                            <button type="button" onClick={() => study.openFromSavedVerse(v)} className={rowBtn}>
                              <span className="block font-medium text-slate-100/95">{savedRowTitle(v)}</span>
                              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                                <span>{studyTranslationShortLabel(v.translation_id)}</span>
                                <span className="text-slate-600">·</span>
                                <span className="text-slate-500/95">{savedRowKindCue(v)}</span>
                              </span>
                              {preview ? (
                                <span className="mt-1.5 block line-clamp-1 text-[11px] leading-snug text-slate-500/70">
                                  {preview}
                                </span>
                              ) : null}
                            </button>
                          ) : (
                            <div className={rowBtn}>
                              <span className="block font-medium text-slate-100/95">{savedRowTitle(v)}</span>
                              <span className="mt-1 text-[11px] text-slate-500">
                                {studyTranslationShortLabel(v.translation_id)} · {savedRowKindCue(v)}
                              </span>
                              {preview ? (
                                <span className="mt-1.5 block line-clamp-1 text-[11px] leading-snug text-slate-500/70">
                                  {preview}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
                {!data ? (
                  <p className="mt-3 text-sm text-muted">Loading…</p>
                ) : data.recentNotes.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Notes you write in Study show up here.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {data.recentNotes.slice(0, 5).map((n) => {
                      const verseHit = n.content_key.startsWith("verse:") ? parseVerseContentKey(n.content_key) : null;
                      const pv = passagePreviewArgsFromVerseContentKey(n.content_key);
                      const pk = pv ? passagePreviewKey(pv.q, pv.t) : "";
                      const preview = pk ? passagePreviews[pk] : undefined;
                      const isTeaching = n.content_type === "teaching";

                      if (verseHit) {
                        return (
                          <li
                            key={n.id}
                            className="rounded-xl border border-line/40 bg-[rgba(10,14,20,0.3)] px-3 py-2.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 border-l border-amber-400/25 pl-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500/90">
                                  Your note
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-amber-200/78">{verseHit.passage.label}</p>
                                {preview ? (
                                  <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-slate-500/72">
                                    {preview}
                                  </p>
                                ) : null}
                                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-200/92">{n.body}</p>
                              </div>
                              {study ? (
                                <button
                                  type="button"
                                  onClick={() => study.openFromVerseContentKey(n.content_key)}
                                  className={inlineOpen}
                                >
                                  Open
                                </button>
                              ) : null}
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={n.id}
                          className="rounded-xl border border-line/25 bg-[rgba(10,14,20,0.16)] px-3 py-2.5"
                        >
                          {isTeaching ? (
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">{teachingNoteLabel()}</p>
                          ) : null}
                          <p className={`line-clamp-2 text-sm leading-snug ${isTeaching ? "mt-1 text-slate-500/88" : "text-slate-400/90"}`}>
                            {n.body}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
                {!data ? (
                  <p className="mt-3 text-sm text-muted">Loading…</p>
                ) : data.recentHistory.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Passages you open in Study will list here.</p>
                ) : (
                  <ul className="mt-4 space-y-1">
                    {data.recentHistory.slice(0, 6).map((h) => {
                      const canOpen = study != null && parseScriptureTagForStudy(h.passage_ref) != null;
                      return (
                        <li key={`${h.passage_ref}-${h.opened_at}`}>
                          {canOpen && study ? (
                            <button
                              type="button"
                              className={rowBtn}
                              onClick={() => study.openFromScriptureTag(h.passage_ref, { translation: h.translation_id })}
                            >
                              <span className="flex items-start gap-2">
                                <History className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                                <span>
                                  <span className="block text-sm text-slate-200/95">{h.passage_ref}</span>
                                  <span className="mt-0.5 block text-[11px] text-slate-500">
                                    {studyTranslationShortLabel(h.translation_id)}
                                  </span>
                                </span>
                              </span>
                            </button>
                          ) : (
                            <span className="block px-3 py-2 text-sm text-slate-400/90">{h.passage_ref}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
