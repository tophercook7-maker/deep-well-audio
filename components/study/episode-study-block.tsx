"use client";

import { useMemo, useState, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { findScriptureRefs, teachingContentKey } from "@/lib/study/refs";
import { useStudyOptional } from "@/components/study/study-provider";
import { DEFAULT_READER_QUERY } from "@/components/study/study-provider";
import type { UserPlan } from "@/lib/permissions";
import { NotePrompt } from "@/components/monetization/named-prompts";

export function EpisodeStudyBlock({
  description,
  episodeId,
  plan,
}: {
  description: string;
  episodeId: string;
  plan: UserPlan;
}) {
  const study = useStudyOptional();
  const refs = useMemo(() => findScriptureRefs(description), [description]);
  const first = refs[0] ?? null;
  if (!study) return null;

  return (
    <div className="mt-8 rounded-2xl border border-line/55 bg-[rgba(10,14,20,0.35)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">Scripture</p>
          <p className="mt-1 text-sm text-muted">Scripture in this teaching is tappable—stay with the text without leaving the page.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            first
              ? study.openReader(first, { title: first.label })
              : study.openReaderQuery(DEFAULT_READER_QUERY, { title: "Psalm 1" })
          }
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100/95 transition hover:border-accent/55"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Open Bible
        </button>
      </div>
      {description ? (
        <p className="mt-3 text-xs text-muted">Verse references in the description above open in the reader when tapped.</p>
      ) : null}
      <StudyTeachingNoteRow episodeId={episodeId} plan={plan} />
    </div>
  );
}

function StudyTeachingNoteRow({
  episodeId,
  plan,
}: {
  episodeId: string;
  plan: UserPlan;
}) {
  const key = teachingContentKey("episode", episodeId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [premiumGate, setPremiumGate] = useState(false);

  const save = useCallback(async () => {
    setHint(null);
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (plan === "guest") {
      setHint("Sign in to attach a saved note to this teaching.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/study/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content_type: "teaching",
          content_key: key,
          body: trimmed,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        if (res.status === 403 && j.code === "premium_required") {
          setPremiumGate(true);
          setHint(null);
          return;
        }
        setHint(j.error ?? "Could not save");
        return;
      }
      setDraft("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }, [draft, key, plan]);

  return (
    <div className="mt-5 border-t border-line/40 pt-4">
      <button
        type="button"
        onClick={() =>
          setOpen((o) => {
            const next = !o;
            if (!next) setPremiumGate(false);
            return next;
          })
        }
        className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/80 transition hover:text-amber-50"
      >
        Add note on this teaching
      </button>
      {open ? (
        <div className="mt-3 rounded-xl border border-line/55 bg-soft/10 p-4">
          {premiumGate ? (
            <NotePrompt
              intent="episode_note"
              onDismiss={() => setPremiumGate(false)}
              className="mb-4"
            />
          ) : null}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={8000}
            placeholder="What stood out? What will you carry into the week?"
            className="w-full resize-y rounded-xl border border-line/70 bg-[rgba(10,14,20,0.5)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 focus-visible:ring-2"
          />
          {plan === "guest" ? <p className="mt-2 text-xs text-muted">Sign in to save. Premium keeps unlimited study notes.</p> : null}
          {plan === "free" ? <p className="mt-2 text-xs text-muted">Free accounts can keep up to two saved study notes.</p> : null}
          {hint ? <p className="mt-2 text-xs text-amber-200/90">{hint}</p> : null}
          <button
            type="button"
            disabled={busy || !draft.trim()}
            onClick={() => void save()}
            className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-45"
          >
            Save note
          </button>
        </div>
      ) : null}
    </div>
  );
}
