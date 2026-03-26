"use client";

import Link from "next/link";
import type { Route } from "next";
import { useAccountPlanOptional } from "@/components/plan/plan-context";
import { StartCheckoutButton } from "@/components/stripe/start-checkout-button";

const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-45";
const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45";

type Props = {
  className?: string;
  /** Alignment for flex container */
  align?: "center" | "start";
};

/**
 * Subscribe opens Stripe Checkout (when configured); otherwise button stays disabled and “View plans” explains pricing.
 */
export function PremiumUpgradeActions({ className = "", align = "center" }: Props) {
  const ctx = useAccountPlanOptional();
  const justify = align === "center" ? "justify-center" : "justify-start";
  const publishable = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <div className={`flex flex-wrap gap-3 ${justify} ${className}`.trim()}>
      <button type="button" onClick={() => ctx?.openUpgradeModal()} className={btnGhost}>
        See Premium
      </button>
      <StartCheckoutButton interval="monthly" disabled={!publishable} className={btnPrimary}>
        Subscribe — $5/mo
      </StartCheckoutButton>
      <Link href={"/pricing#subscribe" as Route} className={btnGhost}>
        All plans
      </Link>
    </div>
  );
}
