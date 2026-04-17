"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { PREMIUM_REINFORCEMENT_LINE } from "@/lib/monetization-messaging";

const STORAGE_KEY = "deepwell:library-milestone-2-dismissed";

/** Shown once when the user crosses 2+ saved teachings — emotional ownership (retention, not a hard sell). */
export function LibraryBuildingMilestone({ savedCount }: { savedCount: number }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (savedCount < 2 || dismissed) return null;

  return (
    <div className="rounded-2xl border border-accent/30 bg-[rgba(16,22,32,0.55)] px-5 py-4 shadow-[0_20px_48px_-28px_rgba(212,175,55,0.12)] backdrop-blur-sm sm:px-6">
      <p className="text-sm font-medium text-white">Your library is starting to take shape</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
        Keep everything in one place—it grows with you: saved teachings, notes, and listening rhythm in a single calm hub.
      </p>
      <p className="mt-2 text-xs text-slate-500">{PREMIUM_REINFORCEMENT_LINE}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={"/library" as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Open Your Library
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 px-5 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
