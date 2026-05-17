"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, X } from "lucide-react";
import { usePlayer } from "@/lib/player/context";
import { useAccountPlanOptional } from "@/components/plan/plan-context";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const safe = Math.floor(sec);
  const mins = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${mins}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Save a reflective moment in the global player (Premium only).
 */
export function PlayerBookmarkControl() {
  const router = useRouter();
  const { state, currentTrack } = usePlayer();
  const planCtx = useAccountPlanOptional();
  const premium = planCtx?.plan === "premium";
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [savedAck, setSavedAck] = useState(false);
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");
  const [note, setNote] = useState("");
  const [scriptureRef, setScriptureRef] = useState("");
  const [topic, setTopic] = useState("");

  const canBookmark =
    premium &&
    currentTrack?.playbackUrl &&
    currentTrack.id &&
    !state.error &&
    Number.isFinite(state.currentTime) &&
    state.currentTime >= 0;

  const resetForm = useCallback(() => {
    setQuote("");
    setNote("");
    setScriptureRef("");
    setTopic("");
  }, []);

  const saveMoment = useCallback(async () => {
    if (!canBookmark || !currentTrack?.id) return;
    setBusy(true);
    setHint(null);
    try {
      const res = await fetch("/api/premium/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episode_id: currentTrack.id,
          seconds: Math.floor(state.currentTime),
          quote,
          note,
          scriptureRef,
          topic,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setHint(data.error ?? "Could not save moment");
        return;
      }
      setSavedAck(true);
      setOpen(false);
      resetForm();
      router.refresh();
      window.setTimeout(() => setSavedAck(false), 3600);
    } catch {
      setHint("Network error");
    } finally {
      setBusy(false);
    }
  }, [canBookmark, currentTrack?.id, note, quote, resetForm, router, scriptureRef, state.currentTime, topic]);

  if (!premium) return null;

  return (
    <div className="relative flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => {
          setHint(null);
          setOpen((value) => !value);
        }}
        disabled={!canBookmark || busy}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line/90 text-amber-200/90 transition hover:border-accent/40 hover:bg-accent/10 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
        aria-label="Save this moment"
        aria-expanded={open}
        title={canBookmark ? "Save this moment" : "Play this episode inline to save a moment"}
      >
        <BookmarkPlus className="h-5 w-5" aria-hidden />
      </button>

      {open ? (
        <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-[120] w-[min(92vw,22rem)] -translate-x-1/2 rounded-2xl border border-accent/20 bg-[rgba(8,12,20,0.98)] p-4 text-left shadow-2xl backdrop-blur-md sm:left-auto sm:right-0 sm:translate-x-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">Save moment</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatTime(state.currentTime)}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{currentTrack?.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close saved moment form"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Quote or phrase</span>
              <input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                maxLength={500}
                placeholder="What line do you want to remember?"
                className="mt-1 w-full rounded-xl border border-line/70 bg-[rgba(10,14,20,0.72)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 placeholder:text-slate-600 focus-visible:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-300">Reflection note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Why did this stand out?"
                className="mt-1 w-full resize-y rounded-xl border border-line/70 bg-[rgba(10,14,20,0.72)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 placeholder:text-slate-600 focus-visible:ring-2"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Scripture</span>
                <input
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  maxLength={120}
                  placeholder="Psalm 46"
                  className="mt-1 w-full rounded-xl border border-line/70 bg-[rgba(10,14,20,0.72)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 placeholder:text-slate-600 focus-visible:ring-2"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-300">Topic</span>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={80}
                  placeholder="Peace"
                  className="mt-1 w-full rounded-xl border border-line/70 bg-[rgba(10,14,20,0.72)] px-3 py-2 text-sm text-slate-100 outline-none ring-accent/20 placeholder:text-slate-600 focus-visible:ring-2"
                />
              </label>
            </div>
          </div>

          {hint ? <p className="mt-3 text-xs font-medium text-amber-200/85">{hint}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void saveMoment()}
              disabled={!canBookmark || busy}
              className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Saving..." : "Save moment"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                void saveMoment();
              }}
              disabled={!canBookmark || busy}
              className="text-xs font-medium text-slate-400 underline-offset-2 transition hover:text-white hover:underline disabled:opacity-50"
            >
              Save timestamp only
            </button>
          </div>
        </div>
      ) : null}

      {savedAck ? (
        <span className="max-w-[10rem] text-center text-[10px] leading-snug text-emerald-400/90" role="status" aria-live="polite">
          <span className="block font-medium">Moment saved</span>
          <span className="mt-0.5 block text-slate-500">It can resurface in Your Home.</span>
        </span>
      ) : hint ? (
        <span className="text-[10px] font-medium leading-none text-amber-200/85" role="status" aria-live="polite">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
