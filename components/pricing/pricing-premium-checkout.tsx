"use client";

import { PremiumActiveState } from "@/components/premium/premium-active-state";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";
import type { UserPlan } from "@/lib/permissions";

const btnPrimary =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-auto sm:min-w-[12rem]";

const btnYearly =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-line/90 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 sm:w-auto sm:min-w-[12rem]";

type Props = {
  stripeReady: boolean;
  plan: UserPlan;
};

export function PricingPremiumCheckout({ stripeReady, plan }: Props) {
  if (plan === "premium") {
    return (
      <div id="subscribe" className="mt-8 scroll-mt-28 space-y-4">
        <PremiumActiveState align="start" />
      </div>
    );
  }

  return (
    <div id="subscribe" className="mt-8 scroll-mt-28 space-y-3">
      <StartCheckoutButton interval="monthly" disabled={!stripeReady} className={btnPrimary}>
        Go Premium
      </StartCheckoutButton>
      <StartCheckoutButton interval="yearly" disabled={!stripeReady} className={btnYearly}>
        $90/year
      </StartCheckoutButton>
      {!stripeReady ? (
        <p className="max-w-md text-sm text-muted">Checkout is not available in this environment yet.</p>
      ) : null}
    </div>
  );
}
