"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { useAccountPlanOptional } from "@/components/plan/plan-context";

const SCORES = [0, 5, 6, 7, 8, 9, 10] as const;

type Props = {
  /** Value applied to catalog queries (premium only). */
  defaultApplied: string;
  /** True when URL had meaty but plan cannot apply it */
  showStrippedNotice?: boolean;
};

export function ExploreMeatyField({ defaultApplied, showStrippedNotice }: Props) {
  const account = useAccountPlanOptional();
  const plan = account?.plan ?? "guest";
  const openUpgradeModal = account?.openUpgradeModal;
  const locked = plan !== "premium";

  if (!locked) {
    return (
      <label>
        <span className="text-xs uppercase tracking-wide text-amber-100/70">Min meaty</span>
        <select
          name="meaty"
          defaultValue={defaultApplied}
          className="mt-2 w-full rounded-2xl border border-line bg-soft/40 px-3 py-3 text-sm text-text outline-none ring-accent/30 focus:ring-2"
        >
          <option value="">Any</option>
          {SCORES.map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div>
      <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-100/70">
        Min meaty
        <span className="rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-amber-100/90">
          Premium
        </span>
      </span>
      <input type="hidden" name="meaty" value="" />
      {openUpgradeModal ? (
        <button
          type="button"
          onClick={() => {
            trackFunnelEvent("premium_feature_click", { intent: "meaty_filter" });
            openUpgradeModal();
          }}
          className="mt-2 flex min-h-[48px] w-full items-center justify-between rounded-2xl border border-line/80 bg-soft/25 px-3 py-3 text-left text-sm text-muted transition hover:border-accent/35 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
        >
          <span>Any — filter by meaty score with Premium</span>
          <span className="text-accent" aria-hidden>
            →
          </span>
        </button>
      ) : (
        <FunnelLink
          href={"/pricing" as Route}
          funnelEvent="view_plans_click"
          className="mt-2 flex min-h-[48px] w-full items-center justify-between rounded-2xl border border-line/80 bg-soft/25 px-3 py-3 text-left text-sm text-muted transition hover:border-accent/35 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45"
        >
          <span>Any — View plans for meaty filters</span>
          <span className="text-accent" aria-hidden>
            →
          </span>
        </FunnelLink>
      )}
      {showStrippedNotice ? (
        <p className="mt-2 text-xs text-amber-200/80">
          A minimum meaty score was in the link, but only Premium applies that filter. Everything else still works as usual.
        </p>
      ) : null}
    </div>
  );
}
