import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { BackButton } from "@/components/buttons/back-button";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getPremiumWaitlistMailto, hasStripeBillingConfigured } from "@/lib/env";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Listen and explore the curated catalog free. Premium adds bookmarks, notes, topic packs, and advanced filters for a deeper study experience.",
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
        <DeepWellLogo variant="inline" className="mb-6 h-9 max-w-[280px] opacity-95 sm:h-10 sm:max-w-[300px]" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Listen freely. <span className="text-amber-200/95">Study more deeply.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          The full curated catalog is free to explore and listen to—no paywall on the teaching itself. Premium is for when you want{" "}
          <span className="text-slate-300">structure, clarity, and control</span>: hold onto what mattered, keep notes beside the audio, follow
          clear paths through hard topics, and filter your way to richer episodes without more endless scrolling.
          <span className="mt-3 block text-sm text-slate-400">
            Subscriptions run through Stripe—you are not charged until you complete checkout.
          </span>
        </p>
      </header>

      <section className="card border-line/90 p-6 sm:p-8" aria-labelledby="free-plan-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Always free</p>
        <h2 id="free-plan-heading" className="mt-2 text-2xl font-semibold text-white">
          Free — listening first
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
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

      <section
        className="card border-accent/30 bg-accent/[0.04] p-6 sm:p-8"
        aria-labelledby="premium-plan-heading"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/65">Premium</p>
        <h2 id="premium-plan-heading" className="mt-2 text-2xl font-semibold text-white">
          Premium — a better study experience
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Premium doesn&apos;t gate the teaching—it adds <span className="text-slate-300">structure and control</span> for people who want
          to go deeper than play-and-forget: keep your place in hard passages, capture thoughts beside the audio, and walk ordered paths
          through weighty subjects.
        </p>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-200">
          <li>
            · <span className="font-medium text-slate-100">Bookmarks</span> — save key moments with timestamps and{" "}
            <span className="text-slate-300">return to what mattered</span> without scrubbing the whole message again.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Private notes</span> — reflections tied to each episode so you{" "}
            <span className="text-slate-300">keep your study in one place</span>.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Topic packs</span> —{" "}
            <span className="text-slate-300">follow a clear path through difficult topics</span> with guided sections and curated episodes, not
            a flat scroll.
          </li>
          <li>
            · <span className="font-medium text-slate-100">Advanced filters</span> — including meaty score on Explore, so you can surface
            deeper teaching faster when you&apos;re ready to focus.
          </li>
        </ul>

        <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/[0.05] px-4 py-4 sm:px-5">
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

        <div className="mt-6 rounded-2xl border border-line/70 bg-soft/20 px-4 py-4 text-sm text-slate-200">
          <p className="font-medium text-amber-100/90">Pricing</p>
          <p className="mt-2 text-base font-semibold text-white">
            <span className="tabular-nums">$5</span>/month &nbsp;·&nbsp; <span className="tabular-nums">$49</span>/year
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cancel anytime from Stripe when your customer portal is enabled in the Dashboard.
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
