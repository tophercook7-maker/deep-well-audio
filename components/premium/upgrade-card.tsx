"use client";

import { Sparkles } from "lucide-react";
import { PREMIUM_MONTHLY_LABEL, PREMIUM_YEARLY_LABEL } from "@/lib/pricing-display";
import { SITE_POSITIONING } from "@/lib/site-messaging";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

export function UpgradeCard({ className = "", showJoinLink = true }: { className?: string; showJoinLink?: boolean }) {
  return (
    <div
      className={`card border-accent/25 bg-gradient-to-br from-accent/[0.08] via-soft/20 to-transparent p-6 sm:p-7 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Premium</p>
          <p className="mt-1.5 text-lg font-semibold leading-snug text-white">{SITE_POSITIONING.headline}</p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            <span className="text-slate-300">{PREMIUM_MONTHLY_LABEL}</span> or <span className="text-slate-300">{PREMIUM_YEARLY_LABEL}</span> through Stripe. Cancel anytime
            through Stripe—use links in your subscription emails from Stripe, or reach out for billing help.
          </p>
          <PremiumUpgradeActions className="mt-5" align="start" showJoinLink={showJoinLink} />
        </div>
      </div>
    </div>
  );
}
