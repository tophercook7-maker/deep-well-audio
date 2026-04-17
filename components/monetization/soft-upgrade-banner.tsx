"use client";

import Link from "next/link";
import type { Route } from "next";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecentlyPlayedEntries, LISTENING_PROGRESS_EVENT } from "@/lib/listening-progress";
import { getSaveAttemptCount } from "@/lib/save-attempt-tracking";
import { useAccountPlanOptional } from "@/components/plan/plan-context";
import { CTA } from "@/lib/site-messaging";

const DISMISS_KEY = "deepwell:soft-upgrade-dismiss-until";
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const MIN_PLAYS = 2;

export function SoftUpgradeBanner() {
  const ctx = useAccountPlanOptional();
  const plan = ctx?.plan ?? "guest";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (plan !== "free") {
      setVisible(false);
      return;
    }
    const sync = () => {
      try {
        const until = localStorage.getItem(DISMISS_KEY);
        if (until && Date.now() < parseInt(until, 10)) {
          setVisible(false);
          return;
        }
      } catch {
        /* ignore */
      }
      const recent = getRecentlyPlayedEntries(8);
      const attempts = getSaveAttemptCount();
      setVisible(recent.length >= MIN_PLAYS || attempts >= 1);
    };
    sync();
    window.addEventListener(LISTENING_PROGRESS_EVENT, sync);
    window.addEventListener("deepwell:save-attempt-changed", sync);
    return () => {
      window.removeEventListener(LISTENING_PROGRESS_EVENT, sync);
      window.removeEventListener("deepwell:save-attempt-changed", sync);
    };
  }, [plan]);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + COOLDOWN_MS));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="border-b border-line/45 bg-[rgba(10,14,20,0.55)] backdrop-blur-md">
      <div className="container-shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-relaxed text-slate-200/95">
          <span className="font-medium text-white">Start keeping what matters</span>
          <span className="text-slate-400"> — save teachings and pick up where you left off when you&apos;re ready.</span>
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={"/pricing?intent=soft" as Route}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            {CTA.SEE_PREMIUM}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-line/75 px-3 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
