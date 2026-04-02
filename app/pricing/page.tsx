import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { BackButton } from "@/components/buttons/back-button";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { hasStripeBillingConfigured } from "@/lib/env";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Listening is free. Premium adds tools to stay with what you hear—so it does not pass by and disappear.",
};

function PremiumItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300/95">{body}</p>
    </div>
  );
}

export default async function PricingPage() {
  const stripeReady = hasStripeBillingConfigured();
  const plan = await getUserPlan();

  return (
    <main className="container-shell max-w-2xl space-y-12 py-12 sm:space-y-14 sm:py-16">
      <ConversionPageBeacon page="pricing" />
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <header className="max-w-xl">
        <DeepWellLogo
          variant="header"
          brandClassName="items-center sm:items-start mx-auto sm:mx-0 mb-6"
          className="object-center sm:object-left"
        />
        <h1 className="text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl">
          Built for people who want to stay with what they hear
        </h1>
        <p className="mt-3 text-base font-normal leading-relaxed text-slate-400/95 sm:mt-4">
          For people who don&apos;t want to lose what they hear
        </p>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-300/95 sm:mt-6">
          <p>Listening is free.</p>
          <p>Premium adds tools to stay with it—so what you hear doesn&apos;t pass by and disappear.</p>
        </div>
      </header>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="premium-gives-heading">
        <h2 id="premium-gives-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          What Premium gives you
        </h2>
        <div className="mt-8 space-y-8">
          <PremiumItem title="Stay with what matters" body="Save moments. Add notes. Come back to them." />
          <PremiumItem
            title="Walk through hard topics"
            body="Follow guided paths instead of piecing it together alone."
          />
          <PremiumItem
            title="Search without being pushed"
            body="Find what you need without noise or manipulation."
          />
          <PremiumItem
            title="World Watch (full access)"
            body="See the full set and read the weekly digest."
          />
        </div>
      </section>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="free-stays-heading">
        <h2 id="free-stays-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          What stays free
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-300/95 sm:text-base">
          <p>You can listen without paying.</p>
          <p>Browse the full directory, explore topics, and find teaching from trusted ministries.</p>
          <p className="text-slate-200/95">Nothing is taken away.</p>
        </div>
      </section>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="subscribe-heading">
        <h2 id="subscribe-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Simple pricing
        </h2>
        <div className="mt-6 space-y-1 text-lg font-medium text-white sm:text-xl">
          <p>
            <span className="tabular-nums">$9</span>/month
          </p>
          <p className="text-sm font-normal text-slate-400">or</p>
          <p>
            <span className="tabular-nums">$90</span>/year
          </p>
        </div>
        <p className="mt-4 text-sm text-slate-400">No tiers. No upsells.</p>

        <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />

        <p className="mt-4 text-sm text-slate-400">Cancel anytime. No pressure.</p>

        <FunnelLink
          href={"/join" as Route}
          funnelEvent="join_list_click"
          funnelData={{ placement: "pricing_page" }}
          className="mt-4 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
        >
          Join the list instead →
        </FunnelLink>
      </section>
    </main>
  );
}
