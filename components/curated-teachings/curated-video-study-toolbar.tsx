"use client";

import Link from "next/link";
import type { Route } from "next";
import { Bookmark, CheckCircle2, NotebookPen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UserPlan } from "@/lib/permissions";
import { canUseFeature } from "@/lib/permissions";
import { useCuratedStudyBatchMeta, useCuratedStudyRow } from "@/components/curated-teachings/curated-study-batch-context";

export function CuratedVideoStudyToolbar({
  videoId,
  sourceId,
  title,
  plan,
  loginNext,
  /** When false, hide the guest sign-in strip (e.g. show once per grid, not on every card). */
  showGuestLoginHint = true,
}: {
  videoId: string;
  sourceId: string;
  title: string;
  plan: UserPlan;
  loginNext: string;
  showGuestLoginHint?: boolean;
}) {
  const meta = useCuratedStudyBatchMeta();
  const row = useCuratedStudyRow(videoId);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const enabled = plan !== "guest" && canUseFeature("curated_library", plan);

  useEffect(() => {
    setNoteDraft(row.note);
  }, [row.note]);

  const refresh = meta?.refresh;

  const toggleSave = useCallback(async () => {
    if (!enabled || busy) return;
    setBusy(true);
    try {
      if (row.saved) {
        const res = await fetch(`/api/curated/saved?video_id=${encodeURIComponent(videoId)}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
      } else {
        const res = await fetch("/api/curated/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            video_id: videoId,
            source_id: sourceId,
            title,
          }),
        });
        if (!res.ok) return;
        void fetch("/api/curated/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ video_id: videoId, source_id: sourceId, opened: true }),
        }).catch(() => {});
      }
      refresh?.();
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, refresh, row.saved, sourceId, title, videoId]);

  const openNotes = useCallback(() => {
    if (!enabled) return;
    setNoteDraft(row.note);
    dialogRef.current?.showModal();
    void fetch("/api/curated/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ video_id: videoId, source_id: sourceId, opened: true }),
    }).catch(() => {});
  }, [enabled, row.note, sourceId, videoId]);

  const saveNote = useCallback(async () => {
    if (!enabled || busy) return;
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const res = await fetch("/api/curated/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          video_id: videoId,
          source_id: sourceId,
          title,
          note_content: trimmed,
        }),
      });
      if (res.ok) refresh?.();
      dialogRef.current?.close();
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, noteDraft, refresh, sourceId, title, videoId]);

  const deleteNote = useCallback(async () => {
    if (!enabled || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/curated/notes?video_id=${encodeURIComponent(videoId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setNoteDraft("");
        refresh?.();
      }
      dialogRef.current?.close();
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, refresh, videoId]);

  const markComplete = useCallback(async () => {
    if (!enabled || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/curated/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ video_id: videoId, source_id: sourceId, completed: true }),
      });
      if (res.ok) refresh?.();
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, refresh, sourceId, videoId]);

  if (plan === "guest") {
    if (!showGuestLoginHint) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 border-t border-line/40 pt-3 text-[11px] text-slate-500">
        <Link
          href={`/login?next=${encodeURIComponent(loginNext)}` as Route}
          className="font-medium text-amber-200/80 underline-offset-2 hover:text-amber-100 hover:underline"
        >
          Sign in
        </Link>
        <span>to save and add notes.</span>
      </div>
    );
  }

  if (!enabled) return null;

  const completed = row.progress?.completed === true;
  const hasNote = row.note.trim().length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-t border-line/40 pt-3">
        <button
          type="button"
          onClick={() => void toggleSave()}
          disabled={busy}
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition disabled:opacity-45",
            row.saved
              ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
              : "border-line/70 text-slate-300 hover:border-accent/35 hover:text-white",
          ].join(" ")}
        >
          <Bookmark className={`h-3.5 w-3.5 ${row.saved ? "fill-amber-200/35" : ""}`} aria-hidden />
          {row.saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={openNotes}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-line/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 transition hover:border-accent/35 hover:text-white disabled:opacity-45"
        >
          <NotebookPen className="h-3.5 w-3.5" aria-hidden />
          Notes{hasNote ? " ·" : ""}
        </button>
        <button
          type="button"
          onClick={() => void markComplete()}
          disabled={busy || completed}
          className="inline-flex items-center gap-1.5 rounded-full border border-line/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 transition hover:border-emerald-400/35 hover:text-emerald-100/95 disabled:opacity-45"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          {completed ? "Completed" : "Mark done"}
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line/80 bg-[rgba(11,18,32,0.97)] p-0 text-slate-100 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop:bg-black/60"
        onClose={() => setNoteDraft(row.note)}
      >
        <div className="border-b border-line/60 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">Private note</p>
          <p className="mt-2 line-clamp-2 text-sm font-medium text-white">{title}</p>
        </div>
        <div className="px-5 py-4">
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={8}
            maxLength={12000}
            className="mt-1 w-full resize-y rounded-xl border border-line/75 bg-soft/25 px-3 py-2.5 text-sm text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
            placeholder="Reflections, verses to revisit, questions for study…"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !noteDraft.trim()}
              onClick={() => void saveNote()}
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-45"
            >
              Save note
            </button>
            <button
              type="button"
              disabled={busy || !hasNote}
              onClick={() => void deleteNote()}
              className="rounded-full border border-line/80 px-4 py-2 text-xs font-medium text-slate-300 disabled:opacity-45"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-full border border-transparent px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
