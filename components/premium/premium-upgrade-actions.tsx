"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { useAccountPlanOptional } from "@/components/plan/plan-context";
import { PremiumActiveState } from "@/components/premium/premium-active-state";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";
import { isClientCheckoutConfigured } from "@/lib/stripe-checkout-client";
import { CTA } from "@/lib/site-messaging";

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
 * Checkout uses Upgrade to Premium; secondary link uses See Premium for comparison. Optional join hint for updates only.
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
        <StartCheckoutButton interval="monthly" disabled={!checkoutOk} className={btnPrimary}>
          {CTA.UPGRADE_TO_PREMIUM} — $9/mo
        </StartCheckoutButton>
        <FunnelLink
          href={"/pricing#subscribe" as Route}
          funnelEvent="view_plans_click"
          funnelData={funnelPlacement}
          className={btnGhost}
        >
          {CTA.SEE_PREMIUM}
        </FunnelLink>
      </div>
      <p className={`mt-3 max-w-md text-xs leading-relaxed text-slate-500 ${hintAlign}`}>
        Cancel anytime. No tricks—just a calmer way to keep growing.
      </p>
      {showJoinLink ? (
        <div className={`mt-3 max-w-md space-y-1 text-xs leading-relaxed text-muted ${hintAlign}`}>
          <p>
            <FunnelLink
              href={"/join" as Route}
              funnelEvent="join_list_click"
              funnelData={funnelPlacement}
              className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
            >
              Short updates. No spam.
            </FunnelLink>
          </p>
          <p className="text-slate-500">Your email stays private.</p>
        </div>
      ) : null}
    </div>
  );
}
