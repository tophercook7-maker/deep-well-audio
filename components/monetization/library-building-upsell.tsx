"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { CTA } from "@/lib/site-messaging";
import { PREMIUM_REINFORCEMENT_LINE } from "@/lib/monetization-messaging";
import { getSaveAttemptCount } from "@/lib/save-attempt-tracking";

const DISMISS_KEY = "deepwell:library-upsell-dismissed";

/**
 * For signed-in free users who’ve tried to save multiple times — conversion moment (spec §5).
 */
export function LibraryBuildingUpsell() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const sync = () => {
      try {
        if (localStorage.getItem(DISMISS_KEY) === "1") {
          setDismissed(true);
          setShow(false);
          return;
        }
      } catch {
        /* ignore */
      }
      setDismissed(false);
      setShow(getSaveAttemptCount() >= 2);
    };
    sync();
    window.addEventListener("deepwell:save-attempt-changed", sync);
    return () => window.removeEventListener("deepwell:save-attempt-changed", sync);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="rounded-2xl border border-accent/30 bg-[rgba(16,22,32,0.55)] px-5 py-4 shadow-[0_20px_48px_-28px_rgba(212,175,55,0.12)] backdrop-blur-sm sm:px-6">
      <p className="text-sm font-medium text-white">Your library is starting to take shape</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
        Keep everything in one place: saved teachings, notes, and listening rhythm—without losing what mattered.
      </p>
      <p className="mt-2 text-xs text-slate-500">{PREMIUM_REINFORCEMENT_LINE}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={"/pricing?intent=library_build" as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          {CTA.UPGRADE_TO_PREMIUM}
        </Link>
        <Link
          href={"/pricing" as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/80 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
        >
          {CTA.SEE_PREMIUM}
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(DISMISS_KEY, "1");
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
