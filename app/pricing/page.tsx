import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getPremiumWaitlistMailto, hasStripeBillingConfigured } from "@/lib/env";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description: "Free listening forever. Premium via Stripe subscription.",
};

export default function PricingPage() {
  const mailto = getPremiumWaitlistMailto();
  const stripeReady = hasStripeBillingConfigured();

  return (
    <main className="container-shell max-w-3xl space-y-14 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Choose your pace</h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Deep Well Audio is free to explore and listen. Premium adds deeper study tools for people who want more structure and control.
          <span className="mt-2 block text-sm text-slate-400">
            Subscriptions are processed securely by Stripe—you are not charged until you complete checkout.
          </span>
        </p>
      </header>

      <section className="card border-line/90 p-6 sm:p-8" aria-labelledby="free-plan-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Always free</p>
        <h2 id="free-plan-heading" className="mt-2 text-2xl font-semibold text-white">
          Free
        </h2>
        <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-200">
          <li>· Browse the directory</li>
          <li>· Listen to sermons and podcasts</li>
          <li>· Save favorites</li>
          <li>· Continue listening &amp; recently played</li>
          <li>· Build your library</li>
        </ul>
        <Link
          href={"/signup" as Route}
          className="mt-6 inline-flex rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/35 hover:text-white"
        >
          Create free account
        </Link>
      </section>

      <section
        className="card border-accent/30 bg-accent/[0.04] p-6 sm:p-8"
        aria-labelledby="premium-plan-heading"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Premium</p>
        <h2 id="premium-plan-heading" className="mt-2 text-2xl font-semibold text-white">
          Deep Well Premium
        </h2>
        <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-200">
          <li>· Guided topic packs</li>
          <li>· Bookmarks and notes</li>
          <li>· Advanced filters</li>
          <li>· Deeper study tools</li>
          <li>· Future premium features</li>
        </ul>
        <div className="mt-6 rounded-2xl border border-line/70 bg-soft/20 px-4 py-3 text-sm text-slate-200">
          <p className="font-medium text-amber-100/90">Simple pricing</p>
          <p className="mt-1 text-muted">
            <span className="text-slate-200">$5/month</span> or <span className="text-slate-200">$49/year</span> — cancel anytime from Stripe
            (customer portal can be enabled in your Stripe Dashboard).
          </p>
        </div>
        <PricingPremiumCheckout stripeReady={stripeReady} />
      </section>

      <section
        id="notify"
        className="scroll-mt-28 rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/[0.06] via-soft/12 to-transparent p-8 sm:p-10"
        aria-labelledby="notify-heading"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Stay in the loop</p>
        <h2 id="notify-heading" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Join the Deep Well list
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Get notified when Premium and new study tools land. No spam—just thoughtful updates. Your email stays private and is never
          shown publicly. No payment on this step.
        </p>
        <Link
          href={"/join" as Route}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Get updates
        </Link>
        {mailto ? (
          <p className="mt-6 text-sm text-muted">
            Prefer to reach out directly?{" "}
            <a href={mailto} className="font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline">
              Send a message
            </a>
            .
          </p>
        ) : null}
      </section>
    </main>
  );
}
