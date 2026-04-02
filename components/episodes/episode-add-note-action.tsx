"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  episodeId: string;
  mode: "premium" | "upsell";
};

export function EpisodeAddNoteAction({ episodeId, mode }: Props) {
  const router = useRouter();
  const [upsellOpen, setUpsellOpen] = useState(false);

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!savedFlash) return;
    const t = window.setTimeout(() => setSavedFlash(false), 2200);
    return () => window.clearTimeout(t);
  }, [savedFlash]);

  const btnClass =
    "inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]";

  async function saveNote() {
    const body = draft.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/premium/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode_id: episodeId, body }),
      });
      const data = (await res.json().catch((): object => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not save note");
        return;
      }
      setDraft("");
      setSavedFlash(true);
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "premium") {
    return (
      <div className="flex w-full max-w-[18rem] flex-col items-end gap-2">
        {!premiumOpen ? (
          <button type="button" className={btnClass} onClick={() => setPremiumOpen(true)}>
            Add note
          </button>
        ) : (
          <div className="w-full animate-dwa-hint-reveal rounded-xl border border-line/75 bg-soft/15 p-3">
            <label htmlFor={`episode-inline-note-${episodeId}`} className="sr-only">
              Note
            </label>
            <textarea
              id={`episode-inline-note-${episodeId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="What stood out to you?"
              disabled={busy}
              className="w-full resize-y rounded-lg border border-line/80 bg-bg/50 px-2.5 py-2 text-xs leading-relaxed text-slate-100 outline-none ring-accent/25 placeholder:text-slate-500 focus:ring-2 disabled:opacity-60"
            />
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={busy || !draft.trim()}
                onClick={() => void saveNote()}
                className="inline-flex min-h-[36px] items-center rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                {busy ? "Saving…" : "Save note"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setPremiumOpen(false);
                  setDraft("");
                  setErr(null);
                  setSavedFlash(false);
                }}
                className="text-[11px] text-slate-500 underline decoration-white/10 underline-offset-2 transition hover:text-slate-400"
              >
                Cancel
              </button>
            </div>
            {savedFlash ? (
              <p className="mt-2 text-right text-[11px] font-medium text-slate-300" role="status">
                Saved
              </p>
            ) : null}
            {err ? <p className="mt-2 text-right text-[11px] text-amber-200/90">{err}</p> : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button type="button" className={btnClass} onClick={() => setUpsellOpen((v) => !v)}>
        Add note
      </button>
      {upsellOpen ? (
        <div className="max-w-[14.5rem] text-right animate-dwa-hint-reveal">
          <p className="text-[11px] leading-snug text-slate-400/95">Add notes to what you hear</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-500/90">Keep track of what matters</p>
          <p className="mt-2 text-[10px] leading-snug text-slate-500/75">
            <Link
              href={"/pricing" as Route}
              className="text-slate-400/85 underline decoration-white/10 underline-offset-[3px] transition hover:text-slate-300 hover:decoration-white/20"
            >
              View plans →
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
