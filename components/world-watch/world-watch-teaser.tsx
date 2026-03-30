import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

/**
 * Shown to guests and free accounts. PremiumUpgradeActions already links to checkout and /pricing#subscribe.
 */
export function WorldWatchTeaser() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="card border-line/80 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Globe className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
            <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Clarity without the noise</h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
              World Watch is a measured read on faith and public life—scripturally grounded, calm, and written for people who already love serious
              Bible teaching. The full edition lives here on Deep Well for <span className="text-slate-300">Premium members</span>; take your time,
              return when you want, and let it prompt prayer more than anxiety.
            </p>
          </div>
        </div>
        <ul className="mt-6 space-y-2.5 border-t border-line/50 pt-6 text-sm leading-[1.65] text-slate-300">
          <li>· What happened, what it may mean for neighbors and institutions, and how to pray and stay grounded.</li>
          <li>· Hand-picked links with a short note on why each might matter for a Christian listener—not an endless feed.</li>
          <li>· A gentle prompt to carry into the week, in the same spirit of slow, thoughtful study Deep Well stands for.</li>
        </ul>
        <p className="mt-5 max-w-prose text-xs leading-relaxed text-slate-400">
          Something missing or unclear?{" "}
          <Link href={"/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline">
            Send feedback on World Watch
          </Link>
          —we read every note.
        </p>
      </section>

      <section
        className="card border-accent/25 bg-gradient-to-br from-accent/[0.06] via-soft/15 to-transparent p-6 sm:p-8"
        aria-labelledby="ww-upgrade-heading"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Member access</p>
        <h2 id="ww-upgrade-heading" className="mt-2 text-lg font-semibold text-white sm:text-xl">
          World Watch is part of Premium
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          One calm membership unlocks World Watch together with bookmarks, notes, topic packs, and the rest—not a separate product or another
          login. Use <span className="text-slate-300">View plans</span> for the full picture, or subscribe when you&apos;re ready.
        </p>
        <PremiumUpgradeActions className="mt-6" align="start" showJoinLink={false} />
        <p className="mt-5 max-w-prose text-xs leading-relaxed text-slate-400">
          Cancel anytime through Stripe—billing links are in your Stripe receipts, or contact us if you need a hand.
        </p>
      </section>
    </div>
  );
}
