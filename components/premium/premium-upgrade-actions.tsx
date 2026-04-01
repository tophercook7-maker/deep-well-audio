"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import { useAccountPlanOptional } from "@/components/plan/plan-context";
import { PremiumActiveState } from "@/components/premium/premium-active-state";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";
import { isClientCheckoutConfigured } from "@/lib/stripe-checkout-client";

const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-45";
const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45";

type Props = {
  className?: string;
  /** Alignment for flex container */
  align?: "center" | "start";
  /** Subtle line with link to /join (default true). Set false if the parent already promotes the list. */
  showJoinLink?: boolean;
  /** Passed to Vercel funnel events as `placement` (e.g. world_watch_teaser). */
  analyticsPlacement?: string;
};

/**
 * Subscribe opens Stripe Checkout when configured; "View plans" goes to pricing. Optional join hint for updates only.
 */
export function PremiumUpgradeActions({
  className = "",
  align = "center",
  showJoinLink = true,
  analyticsPlacement,
}: Props) {
  const ctx = useAccountPlanOptional();
  const plan = ctx?.plan ?? "guest";
  const justify = align === "center" ? "justify-center" : "justify-start";
  const checkoutOk = isClientCheckoutConfigured();
  const hintAlign = align === "center" ? "mx-auto text-center" : "text-left";
  const funnelPlacement = analyticsPlacement ? { placement: analyticsPlacement } : undefined;

  if (plan === "premium") {
    return <PremiumActiveState className={className} align={align} />;
  }

  return (
    <div className={className.trim()}>
      <div className={`flex flex-wrap gap-3 sm:gap-3.5 ${justify}`}>
        <button
          type="button"
          onClick={() => {
            trackFunnelEvent("premium_feature_click", {
              intent: "upgrade_modal",
              ...(analyticsPlacement ? { placement: analyticsPlacement } : {}),
            });
            ctx?.openUpgradeModal();
          }}
          className={btnGhost}
        >
          See what&apos;s included
        </button>
        <StartCheckoutButton interval="monthly" disabled={!checkoutOk} className={btnPrimary}>
          Subscribe — $9/month
        </StartCheckoutButton>
        <FunnelLink
          href={"/pricing#subscribe" as Route}
          funnelEvent="view_plans_click"
          funnelData={funnelPlacement}
          className={btnGhost}
        >
          View plans
        </FunnelLink>
      </div>
      {showJoinLink ? (
        <p className={`mt-3 max-w-md text-xs leading-relaxed text-muted ${hintAlign}`}>
          <FunnelLink
            href={"/join" as Route}
            funnelEvent="join_list_click"
            funnelData={funnelPlacement}
            className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            Join the Deep Well list
          </FunnelLink>
          <span className="text-slate-500"> — stay in the loop; your email stays private.</span>
        </p>
      ) : null}
    </div>
  );
}
