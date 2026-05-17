"use client";

import { useMemo, useState, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { findScriptureRefs, teachingContentKey } from "@/lib/study/refs";
import { useStudyOptional } from "@/components/study/study-provider";
import { DEFAULT_READER_QUERY } from "@/components/study/study-provider";
import type { UserPlan } from "@/lib/permissions";
import { NotePrompt } from "@/components/monetization/named-prompts";

const DEFAULT_BREAKDOWN = {
  mainIdea: "This teaching is here to help you slow down, listen carefully, and connect what you heard back to Scripture and everyday life.",
  plainEnglish: "Instead of just playing the episode and moving on, use this section to name the main point, notice the Bible passages behind it, and decide what one step of obedience could look like today.",
  application: [
    "What truth do I need to remember after hearing this?",
    "Where does this teaching challenge the way I am thinking or living?",
    "What is one simple step I can practice this week?",
  ],
  questions: [
    "What sentence or idea stayed with me?",
    "What does this reveal about God, people, or the way faith works in real life?",
    "What would change if I actually lived this out?",
  ],
};

function compactDescription(description: string) {
  return description.replace(/\s+/g, " ").trim();
}

function buildPlainEnglishSummary(description: string) {
  const clean = compactDescription(description);
  if (!clean) return DEFAULT_BREAKDOWN.plainEnglish;
  const firstSentence = clean.match(/.*?[.!?](?:\s|$)/)?.[0]?.trim();
  const summary = firstSentence || clean.slice(0, 220);
  return summary.length > 260 ? `${summary.slice(0, 257).trim()}...` : summary;
}

function buildMainIdea(description: string, refs: ReturnType<typeof findScriptureRefs>) {
  if (refs.length) {
    return `This teaching points you back to ${refs[0].label} and invites you to connect the message with real decisions, fears, habits, and prayers.`;
  }
  const clean = compactDescription(description);
  if (!clean) return DEFAULT_BREAKDOWN.mainIdea;
  return "This teaching is worth studying slowly: listen for the main truth, the Scripture underneath it, and the practical step it asks of you.";
}

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
  const plainEnglish = useMemo(() => buildPlainEnglishSummary(description), [description]);
  const mainIdea = useMemo(() => buildMainIdea(description, refs), [description, refs]);
  const scriptureLabels = refs.slice(0, 6).map((ref) => ref.label);
  if (!study) return null;

  return (
    <section className="mt-8 rounded-[28px] border border-accent/20 bg-[rgba(10,14,20,0.46)] p-5 shadow-[0_24px_60px_-42px_rgba(212,175,55,0.28)] sm:p-6" aria-labelledby="episode-study-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">Bible Study Breakdown</p>
          <h2 id="episode-study-heading" className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Plain-English study guide for this teaching
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Not just notes. This lays out what the teaching is saying, where Scripture fits, and how to carry it into real life.
          </p>
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

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.42)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">Main idea</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300/95">{mainIdea}</p>
        </article>

        <article className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.42)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">In plain English</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300/95">{plainEnglish}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.34)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">Key Scripture</p>
          {scriptureLabels.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {scriptureLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const ref = refs.find((r) => r.label === label);
                    if (ref) study.openReader(ref, { title: ref.label });
                  }}
                  className="rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100/90 transition hover:border-amber-200/35"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
              No verse references were found in the description yet. Use the Bible button to open a starting passage while you study.
            </p>
          )}
        </article>

        <article className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.34)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">Real-life application</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300/95">
            {DEFAULT_BREAKDOWN.application.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.34)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">Questions to sit with</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300/95">
            {DEFAULT_BREAKDOWN.questions.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-4 rounded-[22px] border border-amber-200/15 bg-amber-200/[0.055] p-5">
        <p className="text-sm font-semibold text-white">5-minute recap rhythm</p>
        <div className="mt-3 grid gap-3 text-sm leading-relaxed text-slate-300/95 md:grid-cols-3">
          <p><span className="font-medium text-amber-100/90">1.</span> Name the main truth.</p>
          <p><span className="font-medium text-amber-100/90">2.</span> Open the key Scripture.</p>
          <p><span className="font-medium text-amber-100/90">3.</span> Save one note you can live this week.</p>
        </div>
      </div>

      <StudyTeachingNoteRow episodeId={episodeId} plan={plan} />
    </section>
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
