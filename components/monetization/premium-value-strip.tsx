import Link from "next/link";
import type { Route } from "next";
import { CTA } from "@/lib/site-messaging";

type Props = {
  /** Where this strip appears (copy tuning). */
  placement: "dashboard" | "library" | "notes";
  savedTeachingCount?: number;
  /** Set false for active Premium members (no upsell link). */
  showPricingLink?: boolean;
  className?: string;
};

export function PremiumValueStrip({
  placement,
  savedTeachingCount,
  showPricingLink = true,
  className = "",
}: Props) {
  const countLine =
    typeof savedTeachingCount === "number" && savedTeachingCount > 0 ? (
      <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
        You&apos;ve saved{" "}
        <span className="font-semibold tabular-nums text-amber-100/90">{savedTeachingCount}</span>{" "}
        teaching{savedTeachingCount === 1 ? "" : "s"} so far—your library is yours to return to.
      </p>
    ) : null;

  if (placement === "dashboard") {
    return (
      <div
        className={`rounded-2xl border border-line/50 bg-[rgba(9,12,18,0.45)] px-5 py-4 sm:px-6 ${className}`.trim()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Premium</p>
        <p className="mt-2 text-sm font-medium text-slate-100">Your saved library grows over time</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400/95">
          Each teaching you keep is a milestone you can walk back through—no pressure, just continuity.
        </p>
        {countLine}
      </div>
    );
  }

  if (placement === "notes") {
    return (
      <div
        className={`rounded-2xl border border-line/50 bg-[rgba(9,12,18,0.45)] px-5 py-4 sm:px-6 ${className}`.trim()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Notes</p>
        <p className="mt-2 text-sm font-medium text-slate-100">Your notes become a record of your growth</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400/95">
          Over time, they tell a quiet story of what God was pressing on you through teaching and Scripture.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-line/50 bg-[rgba(9,12,18,0.45)] px-5 py-4 sm:px-6 ${className}`.trim()}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Library</p>
      <p className="mt-2 text-sm font-medium text-slate-100">Everything you save stays here for you</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-400/95">
        Return when you need encouragement, clarity, or a reminder of what the Lord showed you.
      </p>
      {countLine}
      {showPricingLink ? (
        <Link
          href={"/pricing" as Route}
          className="mt-4 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
        >
          {CTA.SEE_PREMIUM}
        </Link>
      ) : null}
    </div>
  );
}
