"use client";

import { PremiumActiveState } from "@/components/premium/premium-active-state";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";
import type { UserPlan } from "@/lib/permissions";
import { CTA } from "@/lib/site-messaging";

const btnPrimary =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-auto sm:min-w-[14rem]";

const btnSecondary =
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
    <div id="subscribe" className="mt-8 scroll-mt-28 space-y-6">
      <div className="rounded-[22px] border border-accent/35 bg-gradient-to-br from-accent/[0.12] to-[rgba(8,11,18,0.5)] p-6 shadow-[0_20px_48px_-28px_rgba(212,175,55,0.18)] sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Best for consistency</p>
        <p className="mt-2 text-lg font-semibold text-white">Annual billing</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-100/95">
          $90<span className="text-base font-normal text-slate-400">/year</span>
        </p>
        <p className="mt-2 text-sm text-emerald-200/90">Save about $18 compared to twelve monthly payments ($108).</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
          Most members choose annual for a steadier rhythm—one decision, then you can focus on listening.
        </p>
        <div className="mt-6">
          <StartCheckoutButton interval="yearly" disabled={!stripeReady} className={btnPrimary}>
            {CTA.UPGRADE_TO_PREMIUM} — annual
          </StartCheckoutButton>
        </div>
      </div>

      <div className="rounded-2xl border border-line/55 bg-[rgba(10,14,20,0.35)] p-5">
        <p className="text-sm font-medium text-slate-200">Prefer monthly?</p>
        <p className="mt-1 text-sm text-slate-500">$9/month — same features, flexible cadence.</p>
        <div className="mt-4">
          <StartCheckoutButton interval="monthly" disabled={!stripeReady} className={btnSecondary}>
            {CTA.UPGRADE_TO_PREMIUM} — monthly
          </StartCheckoutButton>
        </div>
      </div>

      {!stripeReady ? (
        <p className="max-w-md text-sm text-muted">Checkout is not available in this environment yet.</p>
      ) : (
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          Cancel anytime through Stripe. No pressure—stay only if Deep Well stays useful.
        </p>
      )}
    </div>
  );
}
