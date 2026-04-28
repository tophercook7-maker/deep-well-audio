import { BookMarked } from "lucide-react";

/**
 * Quiet Premium invitation: written digest + study depth without hard sell.
 */
export function WorldWatchMemberStudyCue({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={[
        "rounded-2xl border border-line/50 bg-[rgba(12,16,22,0.55)] backdrop-blur-md",
        compact ? "px-4 py-3 sm:px-6 sm:py-5" : "px-5 py-4 sm:px-6 sm:py-5",
      ].join(" ")}
      aria-label="Premium World Watch study notes"
    >
      <div className={["flex flex-wrap items-start", compact ? "gap-2.5 sm:gap-4" : "gap-3 sm:gap-4"].join(" ")}>
        <div
          className={[
            "flex shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.06] text-amber-200/75",
            compact ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10",
          ].join(" ")}
          aria-hidden
        >
          <BookMarked className={compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={compact ? "text-xs leading-[1.6] text-slate-400 sm:text-sm sm:leading-[1.65]" : "text-sm leading-[1.65] text-slate-400"}>
            Premium includes the <span className="text-slate-300">written digest</span>—curated links with reflection—plus optional study blocks
            (commentary, Scripture lines, and takeaways) when we&apos;ve prepared them for a story.
          </p>
        </div>
      </div>
    </aside>
  );
}
