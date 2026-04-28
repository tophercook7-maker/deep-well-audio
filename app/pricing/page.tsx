import type { Route } from "next";
import Link from "next/link";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { hasStripeBillingConfigured } from "@/lib/env";
import { Check } from "lucide-react";
import { CTA } from "@/lib/site-messaging";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Free to listen. Premium to keep teachings, notes, and Scripture in one place—and return to what shaped you.",
};

export default async function PricingPage() {
  const stripeReady = hasStripeBillingConfigured();
  const plan = await getUserPlan();

  return (
    <main className="pb-20">
      <ConversionPageBeacon page="pricing" />

      <div className="relative overflow-hidden border-b border-line/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.07),transparent_50%)]">
        <div className="container-shell max-w-5xl py-10 sm:py-12">
          <div className="border-b border-line/40 pb-6">
            <BackButton fallbackHref="/" label="Back" />
          </div>
          <header className="mx-auto max-w-3xl pt-8 text-center sm:pt-10">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              Free to listen. Premium to keep what matters.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Deep Well is free to explore. Premium is for people who don&apos;t want to lose what helped them grow.
            </p>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-3xl py-12 sm:py-14" aria-labelledby="pricing-why-heading">
        <h2 id="pricing-why-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Most people don&apos;t need more sermons. They need to stop losing the ones that mattered.
        </h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-400/95">
          {["Keep teachings that shaped you", "Store your notes in one place", "Return to what helped you grow", "Build a steady rhythm of listening and study"].map((text) => (
            <li key={text} className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-shell max-w-5xl pb-6 sm:pb-8" aria-labelledby="pricing-plans-heading">
        <h2 id="pricing-plans-heading" className="sr-only">
          Plans
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col rounded-[26px] border border-line/50 bg-[rgba(10,14,20,0.55)] p-8 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-9">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Free</h3>
            <ul className="mt-8 flex-1 space-y-3">
              {["Browse teaching", "Listen anytime", "Explore topics", "Preview World Watch"].map((text) => (
                <li key={text} className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.4)] px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                {CTA.LISTEN_FREE}
              </Link>
            </div>
          </div>

          <div
            id="premium"
            className="relative flex flex-col overflow-hidden rounded-[26px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.85)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_28px_64px_-32px_rgba(212,175,55,0.22)] backdrop-blur-md sm:p-9"
          >
            <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />
            <div className="relative">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Deep Well Premium</h3>
              <p className="mt-2 text-sm text-slate-500">$9/month or save with annual billing</p>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Save teachings and build your library",
                  "Take and revisit notes",
                  "Resume where you left off",
                  "Follow topics that matter to you",
                  "Full World Watch digest",
                ].map((text) => (
                  <li key={text} className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-slate-400/95">
                Annual is for people who want a steadier rhythm, not another month of starting over.
              </p>
              <div className="mt-8">
                <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-5xl pb-10 pt-4 sm:pb-12" aria-labelledby="pricing-future-tiers-heading">
        <h2 id="pricing-future-tiers-heading" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Other ways we may grow with you
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400/95">
          We&apos;re not stacking noisy tiers. If we add simpler or higher-touch options, they&apos;ll stay optional and clear—never a maze.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Foundation (exploring)</p>
            <p className="mt-3 text-sm font-medium text-white">A lighter way to save teaching</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
              We&apos;re considering a lower entry (around $5/mo) focused on saving and library basics—without full notes or the full World Watch digest.
              Not in checkout yet; we&apos;ll ship it when billing stays as calm as the product.
            </p>
            <Link
              href={"/feedback" as Route}
              className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
            >
              Share what would help you
            </Link>
          </div>
          <div className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Partner / Supporter</p>
            <p className="mt-3 text-sm font-medium text-white">For those who want to go deeper and help sustain the work</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
              A future higher tier (think $15–20/mo) could bundle everything in Premium with early access and quiet supporter recognition—
              supportive, not transactional.
            </p>
            <Link
              href={"/feedback" as Route}
              className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
            >
              Tell us you&apos;re interested
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-3xl pb-8 pt-4 text-center sm:pt-6" aria-labelledby="pricing-reassurance-heading">
        <p id="pricing-reassurance-heading" className="text-sm text-slate-500">
          Cancel anytime through Stripe. No pressure—your sign-in unlocks saves and study tools when you upgrade; listening stays free
          without a separate step.
        </p>
      </section>
    </main>
  );
}
