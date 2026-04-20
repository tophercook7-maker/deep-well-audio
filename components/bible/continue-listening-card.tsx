"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Headphones, Play } from "lucide-react";
import {
  BIBLE_LISTEN_PREFS_UPDATED_EVENT,
  readBibleContinueListeningSnapshot,
} from "@/lib/bible/listen-preferences";
import { getBibleTtsPreset } from "@/lib/bible/bible-tts-voices";
import { getBibleBookByApiId } from "@/lib/study/bible-books";

export function ContinueListeningCard() {
  const [snap, setSnap] = useState<ReturnType<typeof readBibleContinueListeningSnapshot> | null>(() =>
    typeof window !== "undefined" ? readBibleContinueListeningSnapshot() : null,
  );

  useEffect(() => {
    const refresh = () => setSnap(readBibleContinueListeningSnapshot());
    refresh();
    window.addEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(BIBLE_LISTEN_PREFS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!snap?.canResume) return null;

  const book = getBibleBookByApiId(snap.bookId);
  const title = book ? `${book.label} ${snap.chapter}` : `Chapter ${snap.chapter}`;
  const voiceLabel = getBibleTtsPreset(snap.voiceKey)?.label;
  const pct =
    snap.durationSec > 0
      ? Math.min(100, Math.max(0, (snap.positionSec / snap.durationSec) * 100))
      : 0;

  const href =
    `/bible/listen?book=${encodeURIComponent(snap.bookId)}&chapter=${snap.chapter}` as Route;

  return (
    <div className="rounded-2xl border border-stone-700/45 bg-[rgba(9,12,18,0.6)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-600/50 bg-stone-950/50 text-stone-400">
            <Headphones className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">Continue listening</p>
            <p className="mt-1 truncate font-serif text-lg text-white">{title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Pick up where you left off
              {voiceLabel ? (
                <>
                  {" "}
                  · Voice: {voiceLabel}
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-xs sm:flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-stone-800/90">
            <div
              className="h-full rounded-full bg-stone-500/80 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <Link
            href={href}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent/85 px-4 text-sm font-medium text-slate-950 transition-opacity duration-200 ease-out hover:opacity-90 sm:w-auto sm:self-end"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Continue listening
          </Link>
        </div>
      </div>
    </div>
  );
}
