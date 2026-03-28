import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

export function WorldWatchTeaser() {
  return (
    <div className="space-y-10">
      <section className="card border-line/80 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Globe className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">A calmer read on faith and the world</h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
              Each week, Premium members get a short, careful briefing—context without alarmism, and a path back to Scripture and prayer. The
              email lands in your inbox; the full edition stays here when you want to reread or share a section.
            </p>
          </div>
        </div>
        <ul className="mt-6 space-y-2 border-t border-line/50 pt-6 text-sm leading-relaxed text-slate-300">
          <li>· Three lenses we use: what happened, what it means for neighbors and institutions, how to pray and stay grounded.</li>
          <li>· Curated links—not an endless feed—with a note on why each piece might matter for a Christian listener.</li>
          <li>· A closing prompt to take into the week, tied to the same habit of slow study Deep Well stands for.</li>
        </ul>
      </section>

      <section
        className="card border-accent/25 bg-gradient-to-br from-accent/[0.06] via-soft/15 to-transparent p-6 sm:p-8"
        aria-labelledby="ww-upgrade-heading"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Premium</p>
        <h2 id="ww-upgrade-heading" className="mt-2 text-lg font-semibold text-white sm:text-xl">
          World Watch is included in Premium
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          One Premium subscription unlocks World Watch on the site and the weekly email—same checkout and account as the rest of Premium. There
          isn&apos;t a separate membership or add-on to buy.
        </p>
        <PremiumUpgradeActions className="mt-6" align="start" showJoinLink={false} />
        <Link
          href={"/pricing" as Route}
          className="mt-5 inline-flex text-sm font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline"
        >
          View full pricing and what else Premium includes →
        </Link>
      </section>
    </div>
  );
}
