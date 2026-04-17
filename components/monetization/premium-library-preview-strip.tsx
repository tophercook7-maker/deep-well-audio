"use client";

import Link from "next/link";
import type { Route } from "next";
import { Lock } from "lucide-react";
import { CTA } from "@/lib/site-messaging";
import { PREMIUM_REINFORCEMENT_LINE } from "@/lib/monetization-messaging";

/** Lightweight preview of locked library rows for signed-in non‑Premium users. */
export function PremiumLibraryPreviewStrip() {
  return (
    <div className="rounded-[22px] border border-dashed border-line/55 bg-[rgba(8,11,16,0.4)] p-6 sm:p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Preview</p>
      <p className="mt-2 text-sm font-medium text-slate-200">What your library could hold</p>
      <div className="mt-4 space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-line/40 bg-[rgba(10,14,20,0.45)] px-4 py-3"
          >
            <span className="text-sm text-slate-500">Saved teaching · sample row</span>
            <Lock className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-slate-300/95">Continue building your library with Premium</p>
      <p className="mt-1 text-xs text-slate-500">{PREMIUM_REINFORCEMENT_LINE}</p>
      <Link
        href={"/pricing?intent=library_preview" as Route}
        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
      >
        {CTA.SEE_PREMIUM}
      </Link>
    </div>
  );
}
