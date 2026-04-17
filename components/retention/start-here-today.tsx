"use client";

import Link from "next/link";
import type { Route } from "next";
import { Compass, Headphones, Library } from "lucide-react";

/**
 * Simple entry points for signed-in users — reduces friction without “smart” routing.
 */
export function StartHereToday() {
  return (
    <div className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.45)] p-5 backdrop-blur-sm sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Today</p>
      <h2 className="mt-2 text-lg font-semibold text-white">Start here today</h2>
      <p className="mt-1 text-sm text-slate-500">Take your time—choose a gentle next step.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        <li>
          <Link
            href={"/dashboard#continue" as Route}
            className="flex h-full flex-col rounded-2xl border border-line/55 bg-[rgba(8,11,16,0.45)] p-4 transition hover:border-accent/30"
          >
            <Headphones className="h-5 w-5 text-amber-200/80" aria-hidden />
            <span className="mt-3 text-sm font-medium text-slate-100">Continue listening</span>
            <span className="mt-1 text-xs text-muted">Resume where you left off</span>
          </Link>
        </li>
        <li>
          <Link
            href={"/library" as Route}
            className="flex h-full flex-col rounded-2xl border border-line/55 bg-[rgba(8,11,16,0.45)] p-4 transition hover:border-accent/30"
          >
            <Library className="h-5 w-5 text-amber-200/80" aria-hidden />
            <span className="mt-3 text-sm font-medium text-slate-100">Return to saved</span>
            <span className="mt-1 text-xs text-muted">Teaching and study you kept</span>
          </Link>
        </li>
        <li>
          <Link
            href={"/browse" as Route}
            className="flex h-full flex-col rounded-2xl border border-line/55 bg-[rgba(8,11,16,0.45)] p-4 transition hover:border-accent/30"
          >
            <Compass className="h-5 w-5 text-amber-200/80" aria-hidden />
            <span className="mt-3 text-sm font-medium text-slate-100">Explore a topic</span>
            <span className="mt-1 text-xs text-muted">Browse by theme</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
