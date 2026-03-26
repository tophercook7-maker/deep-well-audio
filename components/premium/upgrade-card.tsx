"use client";

import Link from "next/link";
import type { Route } from "next";
import { Sparkles } from "lucide-react";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

export function UpgradeCard({ className = "" }: { className?: string }) {
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
          <h3 className="mt-1.5 text-lg font-semibold text-white">Go deeper with Deep Well</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            <li>· Guided study playlists</li>
            <li>· Save notes &amp; bookmarks</li>
            <li>· Deep topic collections</li>
            <li>· Advanced filtering</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            <span className="text-slate-300">$5/month</span> or <span className="text-slate-300">$49/year</span> via Stripe Checkout.
          </p>
          <PremiumUpgradeActions className="mt-5" align="start" />
          <Link
            href={"/pricing#notify" as Route}
            className="mt-3 inline-block text-xs font-medium text-amber-200/80 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            Join interest list (optional) →
          </Link>
        </div>
      </div>
    </div>
  );
}
