import Link from "next/link";
import type { Route } from "next";
import { BookMarked } from "lucide-react";

/**
 * Quiet invitation for guests / free users: written digest + study depth without hard sell.
 */
export function WorldWatchMemberStudyCue() {
  return (
    <aside
      className="rounded-2xl border border-line/50 bg-[rgba(12,16,22,0.55)] px-5 py-4 backdrop-blur-md sm:px-6 sm:py-5"
      aria-label="Member study"
    >
      <div className="flex flex-wrap items-start gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.06] text-amber-200/75"
          aria-hidden
        >
          <BookMarked className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-[1.65] text-slate-400">
            Members also receive the{" "}
            <span className="text-slate-300">written digest</span>—curated links with reflection—plus optional study blocks (commentary, Scripture
            lines, and takeaways) when we&apos;ve prepared them for a story. No pressure;{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/80 underline-offset-2 transition hover:text-amber-100 hover:underline">
              see plans
            </Link>{" "}
            whenever you want to read that layer.
          </p>
        </div>
      </div>
    </aside>
  );
}
