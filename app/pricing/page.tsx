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
    "Listen free. Premium adds study tools, topic packs, World Watch, and advanced filters—$9/mo or $90/yr, calm Stripe checkout.",
};

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
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Listen freely. <span className="text-amber-200/95">Study more deeply.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          The full curated catalog is free to explore and listen to—no paywall on the teaching itself. Premium is for when you want{" "}
          <span className="text-slate-300">structure, clarity, and control</span>: hold onto what mattered, keep notes beside the audio, follow
          clear paths through hard topics, and filter your way to richer episodes without more endless scrolling.
          <span className="mt-3 block text-sm text-slate-300/95">
            Subscriptions run through Stripe—you are not charged until you complete checkout.
          </span>
        </p>
      </header>

      <section className="card border-line/85 p-6 sm:p-8" aria-labelledby="free-plan-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Always free</p>
        <h2 id="free-plan-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Free — listening first
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          The catalog stays open: serious Bible teaching and curated sources are here for everyone, without watering down what free means.
        </p>
        <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-slate-200">
          <li>· Listen freely to sermons, series, and teaching from hand-picked sources</li>
          <li>· Explore the full directory and topic hubs</li>
          <li>· Save favorites when you&apos;re signed in</li>
          <li>· Continue listening and pick up where you left off (signed in)</li>
          <li>· Build your library—favorite episodes and save whole shows to follow</li>
        </ul>
        <Link
          href={"/signup" as Route}
          className="mt-6 inline-flex rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-muted transition hover:border-accent/35 hover:text-white"
        >
          Create free account
        </Link>
      </section>

      <PricingBuiltInPublic />

      <section className="card border-accent/30 p-6 sm:p-8" aria-labelledby="premium-plan-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Premium</p>
        <h2 id="premium-plan-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Deep Well Premium
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          Go deeper with tools for serious listening, reflection, and study—including{" "}
          <span className="text-slate-300">full access to World Watch</span>, our calm read on faith and public life, alongside bookmarks, guided
          packs, and filters—all in one membership. The catalog itself stays free; Premium shapes how you keep and revisit what matters.
        </p>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-200">
          <li>
            · <span className="font-medium text-slate-100">World Watch</span> — member-only{" "}
            <span className="text-slate-300">written digest</span> on faith and public life, with optional study blocks (commentary, Scripture lines,
            discernment prompts, weekly takeaways) on select stories—thoughtful and unhurried, here on Deep Well.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Guided topic packs</span> —{" "}
            <span className="text-slate-300">clear paths through hard topics</span> with curated episodes, not an endless scroll.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Bookmarks and notes</span> — save key moments with timestamps and keep private reflections{" "}
            <span className="text-slate-300">beside the teaching</span>.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Advanced filters</span> — including meaty score on Explore, to surface richer episodes when
            you&apos;re ready to focus.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Deeper study tools</span> —{" "}
            <span className="text-slate-300">structure and control</span> around the same calm player you already use.
          </li>
        </ul>

        <div className="mt-6 rounded-2xl border border-accent/25 bg-[rgba(212,175,55,0.07)] px-4 py-4 backdrop-blur-sm sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/65">Built to be understood step by step</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            Example: our <span className="text-amber-100/90">End Times</span> pack—“End Times — A Clear Path Through the Confusion”—walks you
            from foundations through key passages and common misunderstandings to living with clarity, with trusted episodes matched from your
            catalog. <span className="text-slate-300">Move from confusion to clarity</span> without hype or a separate app.
          </p>
          <Link
            href={"/topics/end-times#end-times-pack" as Route}
            className="mt-3 inline-flex text-sm font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            See the End Times topic path →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-line/70 bg-[rgba(15,20,28,0.5)] px-4 py-4 text-sm text-slate-100 backdrop-blur-sm">
          <p className="font-medium text-amber-100/90">Simple pricing</p>
          <p className="mt-2 text-base font-semibold text-white">
            <span className="tabular-nums">$9</span>/month &nbsp;·&nbsp; <span className="tabular-nums">$90</span>/year
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cancel anytime through Stripe—links in your subscription receipts or email us for billing help. No separate add-on or second product.
          </p>
        </div>
        <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
        <p className="mt-6 max-w-prose text-center text-xs leading-relaxed text-slate-300/95 sm:text-left">
          Prefer a direct link?{" "}
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Stay in the loop</p>
        <h2 id="notify-heading" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Join the Deep Well list
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Not ready to subscribe? Join the list for calm updates when study tools evolve or billing options change. No spam—your email stays
          private, and this step never charges you.
        </p>
        <FunnelLink
          href={"/join" as Route}
          funnelEvent="join_list_click"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Get notified
        </FunnelLink>
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
