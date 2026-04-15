import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { hasStripeBillingConfigured } from "@/lib/env";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description: "Listen for free. Subscribe to save teachings, keep notes, follow topics, and unlock full World Watch.",
};

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

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
              Free access. Premium continuity.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Listen freely. No account needed. Subscribe to save teachings, keep notes, follow topics, and unlock full World Watch.
            </p>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-5xl py-14 sm:py-16" aria-labelledby="pricing-plans-heading">
        <h2 id="pricing-plans-heading" className="sr-only">
          Plans
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col rounded-[26px] border border-line/50 bg-[rgba(10,14,20,0.55)] p-8 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-9">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Free</h3>
            <ul className="mt-8 flex-1 space-y-3">
              <Bullet>Listen</Bullet>
              <Bullet>Browse</Bullet>
              <Bullet>Explore topics</Bullet>
              <Bullet>Preview World Watch</Bullet>
            </ul>
            <div className="mt-10">
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.4)] px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                Start Listening
              </Link>
            </div>
          </div>

          <div
            id="premium"
            className="relative flex flex-col overflow-hidden rounded-[26px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.85)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_28px_64px_-32px_rgba(212,175,55,0.22)] backdrop-blur-md sm:p-9"
          >
            <div
              className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-accent/[0.06] blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Premium — $9/month</h3>
              <ul className="mt-8 flex-1 space-y-3">
                <Bullet>Save teachings</Bullet>
                <Bullet>Personal notes</Bullet>
                <Bullet>Follow topics</Bullet>
                <Bullet>Resume listening</Bullet>
                <Bullet>Full World Watch</Bullet>
              </ul>
              <p className="mt-8 text-base font-medium leading-relaxed text-slate-200/95">
                This isn&apos;t about more content. It&apos;s about keeping what matters.
              </p>
              <div className="mt-8">
                <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-3xl pb-8 pt-4 text-center sm:pt-6" aria-labelledby="pricing-reassurance-heading">
        <p id="pricing-reassurance-heading" className="text-sm text-slate-500">
          Cancel anytime. Subscriber sign-in unlocks your personal dashboard—no separate “free account” needed to listen.
        </p>
      </section>
    </main>
  );
}
