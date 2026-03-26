"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";

const btnPrimary =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:w-auto";

type Props = {
  stripeReady: boolean;
};

export function PricingPremiumCheckout({ stripeReady }: Props) {
  return (
    <div id="subscribe" className="mt-6 scroll-mt-28 space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-200/60">Subscribe</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <StartCheckoutButton interval="monthly" disabled={!stripeReady} className={btnPrimary}>
          Monthly — $5/month
        </StartCheckoutButton>
        <StartCheckoutButton interval="yearly" disabled={!stripeReady} className={btnPrimary}>
          Yearly — $49/year
        </StartCheckoutButton>
      </div>
      {!stripeReady ? (
        <>
          <p className="text-sm leading-relaxed text-muted">
            Checkout isn&apos;t connected in this deployment yet—buttons stay disabled until Stripe keys and prices are configured on the
            server. Listening and exploring stay fully free meanwhile.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <FunnelLink
              href={"/join" as Route}
              funnelEvent="join_list_click"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            >
              Get notified
            </FunnelLink>
            <a
              href="#notify"
              className="text-sm font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
            >
              About the email list
            </a>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted">
          Secure payment via Stripe Checkout. You can manage billing from your Stripe customer portal when enabled.
        </p>
      )}
      {stripeReady ? (
        <p className="text-xs leading-relaxed text-muted">
          Not ready to subscribe?{" "}
          <FunnelLink
            href={"/join" as Route}
            funnelEvent="join_list_click"
            className="font-medium text-amber-200/80 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            Join the Deep Well list
          </FunnelLink>{" "}
          to stay in the loop—your email stays private.
        </p>
      ) : null}
    </div>
  );
}
