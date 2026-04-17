"use client";

import { useCallback } from "react";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { X } from "lucide-react";
import { useAccountPlan } from "@/components/plan/plan-context";
import { PremiumActiveState } from "@/components/premium/premium-active-state";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";
import { isClientCheckoutConfigured } from "@/lib/stripe-checkout-client";
import { CTA } from "@/lib/site-messaging";

const btnPrimary =
  "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none";
const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpgradeModal({ open, onOpenChange }: Props) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const checkoutOk = isClientCheckoutConfigured();
  const { plan } = useAccountPlan();

  if (!open) return null;

  if (plan === "premium") {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-premium-title"
      >
        <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={close} />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-line/90 bg-[#0f172a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div id="upgrade-modal-premium-title" className="sr-only">
            Premium membership active
          </div>
          <PremiumActiveState align="start" />
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={close} className={btnGhost}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={close} />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-line/90 bg-[#0f172a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8">
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Premium</p>
        <h2 id="upgrade-modal-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          Premium adds tools to stay with what you hear.
        </h2>
        <p className="mt-3 text-sm leading-[1.65] text-muted">Billing runs through Stripe.</p>

        <p className="mt-6 rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-amber-100/90">
          <span className="font-semibold text-white">Best for consistency:</span> annual is $90/year (save about $18 vs. monthly).
          <span className="mt-1 block text-xs text-muted">
            Secure checkout with Stripe. Cancel anytime—no long-term lock-in.
          </span>
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-stretch">
            <StartCheckoutButton interval="yearly" disabled={!checkoutOk} className={btnPrimary}>
              {CTA.UPGRADE_TO_PREMIUM} — annual
            </StartCheckoutButton>
            <StartCheckoutButton interval="monthly" disabled={!checkoutOk} className={btnGhost}>
              Monthly · $9/mo
            </StartCheckoutButton>
          </div>
          {!checkoutOk ? (
            <p className="text-center text-xs text-muted">
              Checkout needs Stripe keys, price IDs, and <span className="text-slate-400">NEXT_PUBLIC_SITE_URL</span> in this environment.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button type="button" onClick={close} className={`${btnGhost} order-2 sm:order-1`}>
              Maybe later
            </button>
            <FunnelLink
              href={"/join" as Route}
              funnelEvent="join_list_click"
              onClick={close}
              className={`${btnGhost} order-3 whitespace-normal text-center sm:order-2 sm:whitespace-nowrap`}
            >
              Short updates. No spam.
            </FunnelLink>
            <FunnelLink
              href={"/pricing#subscribe" as Route}
              funnelEvent="view_plans_click"
              onClick={close}
              className={`${btnGhost} order-1 text-center sm:order-3`}
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
        </div>
      </div>
    </div>
  );
}
