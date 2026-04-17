"use client";

import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { useMemo } from "react";
import { getLastWorldWatchVisitMs } from "@/lib/world-watch-visit-client";

export type WorldWatchTeaser = {
  id: string;
  title: string;
  slug: string;
  published_at: string;
};

export function WorldWatchReturnNudge({ latest }: { latest: WorldWatchTeaser | null }) {
  const isNewSinceVisit = useMemo(() => {
    if (!latest?.published_at) return false;
    const last = getLastWorldWatchVisitMs();
    if (last == null) return false;
    const pub = new Date(latest.published_at).getTime();
    return Number.isFinite(pub) && pub > last;
  }, [latest]);

  if (!latest) {
    return (
      <div className="rounded-2xl border border-dashed border-line/50 bg-[rgba(8,11,16,0.35)] px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">World Watch</p>
        <p className="mt-2 text-sm text-muted">When new digest items publish, you&apos;ll see them here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.4)] px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line/70 bg-soft/30 text-amber-200/85">
          <Globe className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Latest World Watch</p>
          {isNewSinceVisit ? (
            <p className="mt-1 text-xs font-medium text-emerald-200/85">New since your last visit</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">A steady read on faith and public life</p>
          )}
          <p className="mt-2 line-clamp-2 text-sm font-medium text-white">{latest.title}</p>
          <Link
            href={"/world-watch" as Route}
            className="mt-3 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
          >
            Open World Watch
          </Link>
        </div>
      </div>
    </div>
  );
}
