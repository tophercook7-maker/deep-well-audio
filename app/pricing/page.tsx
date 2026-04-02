import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { BackButton } from "@/components/buttons/back-button";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { PricingBuiltInPublic } from "@/components/pricing/pricing-built-in-public";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { getPremiumWaitlistMailto, hasStripeBillingConfigured } from "@/lib/env";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Listen free. Premium adds bookmarks, guided paths, honest search, and full World Watch—tools for remembering and understanding, not more noise.",
};

function PremiumSubsection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-200">
        {items.map((line) => (
          <li key={line} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/75" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function PricingPage() {
  const mailto = getPremiumWaitlistMailto();
  const stripeReady = hasStripeBillingConfigured();
  const plan = await getUserPlan();

  return (
    <main className="container-shell max-w-3xl space-y-12 py-12 sm:space-y-14 sm:py-16">
      <ConversionPageBeacon page="pricing" />
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <header className="max-w-2xl">
        <DeepWellLogo
          variant="header"
          brandClassName="items-center sm:items-start mx-auto sm:mx-0 mb-6"
          className="object-center sm:object-left"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl">
          Built for people who don&apos;t want to stay at the surface
        </h1>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
          <p>You can listen for free.</p>
          <p>
            Premium is for when you don&apos;t want to forget what you heard, and you don&apos;t want the moment to pass without understanding it.
          </p>
        </div>
      </header>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="premium-gives-heading">
        <h2 id="premium-gives-heading" className="text-2xl font-semibold tracking-tight text-white">
          What Premium gives you
        </h2>
        <div className="mt-8 space-y-10">
          <PremiumSubsection
            title="Stay with what matters"
            items={[
              "Save teaching and return to it",
              "Mark the exact moment something stood out",
              "Keep track of what you're working through",
            ]}
          />
          <PremiumSubsection
            title="Walk through hard topics"
            items={[
              "Follow guided paths instead of jumping around",
              "Stay in one place long enough to understand it",
            ]}
          />
          <PremiumSubsection
            title="Search without being pushed"
            items={["Find what you're looking for", "No trending results", "No algorithm deciding what you should care about"]}
          />
          <PremiumSubsection
            title="World Watch (full access)"
            items={[
              "Complete video lens",
              "Full written digest for each story",
              "Scripture, notes, and takeaways included",
            ]}
          />
        </div>
      </section>

      <PricingBuiltInPublic />

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="free-stays-heading">
        <h2 id="free-stays-heading" className="text-2xl font-semibold tracking-tight text-white">
          What stays free
        </h2>
        <p className="mt-3 text-sm font-medium text-slate-200">You can always:</p>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-200">
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/75" aria-hidden />
            <span>Listen to teaching</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/75" aria-hidden />
            <span>Explore ministries</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/75" aria-hidden />
            <span>Browse topics</span>
          </li>
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-slate-300/95">Nothing is taken away.</p>
        <Link
          href={"/signup" as Route}
          className="mt-6 inline-flex rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/35 hover:text-white"
        >
          Create free account
        </Link>
      </section>

      <section
        className="card border-accent/30 p-6 sm:p-8"
        aria-labelledby="why-premium-heading"
      >
        <h2 id="why-premium-heading" className="text-2xl font-semibold tracking-tight text-white">
          Why people choose Premium
        </h2>
        <div className="mt-4 max-w-xl space-y-4 text-sm leading-relaxed text-slate-200/95 sm:text-base">
          <p>Not for more content. For a different way of using it.</p>
          <p>To slow down. To remember. To apply what they&apos;re hearing.</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href="#subscribe"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            View plans
          </a>
          <FunnelLink
            href={"/join" as Route}
            funnelEvent="join_list_click"
            funnelData={{ placement: "pricing_cta_secondary" }}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
          >
            Join the list instead
          </FunnelLink>
        </div>
      </section>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="subscribe-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Subscribe</p>
        <h2 id="subscribe-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Simple pricing
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200/95">
          Subscriptions run through Stripe—you are not charged until you complete checkout.
        </p>
        <div className="mt-6 rounded-2xl border border-line/55 bg-[rgba(15,20,28,0.34)] px-4 py-4 text-sm text-slate-100 backdrop-blur-md sm:px-5">
          <p className="mt-2 text-base font-semibold text-white">
            <span className="tabular-nums">$9</span>/month &nbsp;·&nbsp; <span className="tabular-nums">$90</span>/year
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cancel anytime through Stripe—links in your subscription receipts or email us for billing help.
          </p>
        </div>
        <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
        <p className="mt-6 max-w-prose text-center text-xs leading-relaxed text-slate-300/95 sm:text-left">
          Questions?{" "}
          <Link href={"/feedback" as Route} className="text-amber-200/75 underline-offset-2 hover:text-amber-100 hover:underline">
            Open the feedback form
          </Link>
          .
        </p>
      </section>

      <section
        id="notify"
        className="scroll-mt-28 rounded-3xl border border-accent/25 bg-gradient-to-br from-[rgba(12,16,24,0.48)] via-[rgba(10,14,20,0.34)] to-[rgba(8,11,17,0.26)] p-8 shadow-[0_18px_48px_-24px_rgba(0,0,0,0.42)] backdrop-blur-md backdrop-saturate-125 sm:p-10"
        aria-labelledby="notify-heading"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Email list</p>
        <h2 id="notify-heading" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Calm updates only
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          If you&apos;re not ready to subscribe, you can still get short notes when tools or options change. No spam; your email stays private.
        </p>
        <FunnelLink
          href={"/join" as Route}
          funnelEvent="join_list_click"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Join the list
        </FunnelLink>
        {mailto ? (
          <p className="mt-6 text-sm text-muted">
            Prefer email direct?{" "}
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
