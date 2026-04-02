"use client";

import { useEffect, useState, useCallback } from "react";

/** After dismiss, the banner stays hidden in this browser. */
const STORAGE_DISMISS = "dwa_explore_start_here_v1";

export function ExploreFirstVisitBanner() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setShow(localStorage.getItem(STORAGE_DISMISS) !== "1");
      } catch {
        setShow(false);
      }
    });
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_DISMISS, "1");
    } catch {
      /* ignore quota / private mode */
    }
    setShow(false);
  }, []);

  if (show !== true) return null;

  return (
    <div
      className="relative mt-6 max-w-2xl rounded-xl border border-line/70 bg-soft/20 px-4 py-3.5 pr-11 text-left sm:px-5 sm:py-4"
      role="region"
      aria-label="Getting started"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-label="Dismiss"
      >
        <span className="block text-lg leading-none" aria-hidden>
          ×
        </span>
      </button>
      <p className="text-sm font-medium text-slate-100">Start here</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
        Pick one message and listen all the way through.
        <br />
        Save anything you want to come back to.
      </p>
    </div>
  );
}
