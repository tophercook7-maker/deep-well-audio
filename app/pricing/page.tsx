import type { Route } from "next";
import Link from "next/link";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { hasStripeBillingConfigured } from "@/lib/env";
import { PREMIUM_MONTHLY_LABEL } from "@/lib/pricing-display";
import { CTA, SITE_POSITIONING } from "@/lib/site-messaging";
import { Check } from "lucide-react";

const PREMIUM_MEMORY_HOOKS = [
  {
    title: "Your Study Path",
    body: "A calm place to continue what you started, revisit what helped, and see the next teaching worth returning to.",
  },
  {
    title: "Saved Moments",
    body: "Mark the exact part of a teaching that hit home so it does not disappear into another tab or forgotten notebook.",
  },
  {
    title: "Weekly Deep Well Recap",
    body: "See what you listened to, what you saved, and the themes God kept bringing back across your week.",
  },
  {
    title: "Private study journal",
    body: "Keep notes, Scripture, questions, and quiet reflections beside the teaching that sparked them.",
  },
];

const PREMIUM_PATHWAYS = ["Anxiety & Peace", "Hearing God", "Purpose & Calling", "When Life Falls Apart", "Prayer", "Spiritual Warfare"];

const PREMIUM_WEEKLY_RECAP = [
  { label: "Listened", value: "42 min" },
  { label: "Saved", value: "3 moments" },
  { label: "Returned to", value: "Prayer" },
];

const PREMIUM_PROOF_NOTES = [
  "I finally have one place for the teachings I keep wanting to revisit.",
  "The value is not more noise. It is remembering what actually helped me.",
  "This feels less like another subscription and more like a quiet study rhythm.",
];

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Listen free. Premium is memory—save sermons, Scripture, notes, and reflections in one personal faith library.",
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
            <p className="mx-auto mb-4 inline-flex rounded-full border border-accent/25 bg-accent/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/85">
              Your personal faith library
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              Free to listen &amp; watch together. Premium remembers what moved you.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Exploring stays open on us. Become a Premium member when you want one quiet place for teachings, Scripture,
              notes, saved moments, and the spiritual trail you do not want to lose.
            </p>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-3xl py-12 sm:py-14" aria-labelledby="pricing-why-heading">
        <h2 id="pricing-why-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Most people don&apos;t need more sermons.
        </h2>
        <p className="mt-3 text-lg font-medium text-slate-200/95">They need to stop losing the ones that mattered.</p>
        <p className="mt-6 text-base leading-relaxed text-slate-400/95">
          Premium keeps your notes, Scripture, bookmarks, listening history, and reflections together so growth compounds
          instead of disappearing.
        </p>
      </section>

      <section className="container-shell max-w-3xl pb-4 sm:pb-6" aria-labelledby="pricing-objection-heading">
        <div className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.45)] p-6 backdrop-blur-md sm:p-8">
          <h2 id="pricing-objection-heading" className="text-lg font-semibold text-white sm:text-xl">
            Why pay when listening is free?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300/95 sm:text-base">
            Because Premium is not charging for content.
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-amber-100/90 sm:text-base">Premium is paying for memory.</p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-400/95">
            <li className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>The sermon is free.</span>
            </li>
            <li className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>
                The ability to save it, return to it, connect notes to it, follow its themes, and build a lasting spiritual
                library is what Premium provides.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="container-shell max-w-5xl py-8 pb-6 sm:pb-8" aria-labelledby="pricing-plans-heading">
        <h2 id="pricing-plans-heading" className="sr-only">
          Plans
        </h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col rounded-[26px] border border-line/50 bg-[rgba(10,14,20,0.55)] p-8 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-9">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">Free Discovery</h3>
            <ul className="mt-8 flex-1 space-y-3">
              {[
                "Browse trusted audio and video",
                "Listen without an account",
                "Explore studies and topics",
                "Preview World Watch",
              ].map((text) => (
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
                {CTA.START_LISTENING_FREE}
              </Link>
            </div>
          </div>

          <div
            id="premium"
            className="relative flex flex-col overflow-hidden rounded-[26px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.85)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_28px_64px_-32px_rgba(212,175,55,0.22)] backdrop-blur-md sm:p-9"
          >
            <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-accent/[0.06] blur-3xl" aria-hidden />
            <div className="relative">
              <p className="mb-3 inline-flex rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
                Built for return visits
              </p>
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Deep Well Premium</h3>
              <p className="mt-2 text-sm text-slate-500">{PREMIUM_MONTHLY_LABEL}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Save sermons and teachings",
                  "Private notes beside each teaching",
                  "Resume exactly where you left off",
                  "Bookmarks and topic collections",
                  "Full World Watch access",
                  "One unified faith library",
                ].map((text) => (
                  <li key={text} className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-slate-400/95">
                {SITE_POSITIONING.plansPositioning.split("\n").map((line, i) => (
                  <span key={line}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
              <div className="mt-8">
                <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-5xl py-12 sm:py-14" aria-labelledby="premium-hooks-heading">
        <div className="rounded-[28px] border border-accent/20 bg-[rgba(12,16,24,0.55)] p-6 shadow-[0_28px_70px_-42px_rgba(212,175,55,0.28)] backdrop-blur-md sm:p-8 lg:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/70">Why people come back</p>
            <h2 id="premium-hooks-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Premium is not just access. It is memory for your spiritual life.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400/95 sm:text-base">
              Deep Well should feel like the place that remembers the teaching, verse, note, and moment you needed when life got loud.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {PREMIUM_MEMORY_HOOKS.map((item) => (
              <article key={item.title} className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.44)] p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400/95">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-9 rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.38)] p-5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Premium topic packs</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400/95">
                  Curated pathways give people a reason to upgrade for the season they are actually walking through.
                </p>
              </div>
              <Link
                href={"/pricing#premium" as Route}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                Unlock your library
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {PREMIUM_PATHWAYS.map((pathway) => (
                <span key={pathway} className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-3 py-1.5 text-xs text-amber-100/85">
                  {pathway}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-5xl pb-12 pt-2 sm:pb-14" aria-labelledby="premium-preview-heading">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="rounded-[28px] border border-line/55 bg-[rgba(9,12,18,0.58)] p-6 backdrop-blur-md sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/70">Member preview</p>
            <h2 id="premium-preview-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Give people a glimpse of what Premium feels like after they join.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400/95">
              The paid side should show the emotional payoff: not just a button, but a quiet dashboard that keeps their growth from slipping away.
            </p>

            <div className="mt-7 rounded-[24px] border border-accent/20 bg-gradient-to-br from-[rgba(24,32,48,0.72)] to-[rgba(7,10,16,0.88)] p-5 shadow-[0_22px_54px_-34px_rgba(212,175,55,0.32)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-100/70">This week in your Deep Well</p>
                  <p className="mt-2 text-lg font-semibold text-white">You kept returning to peace, prayer, and courage.</p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-3 py-1 text-xs font-medium text-amber-100/85">
                  Founding Supporter
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {PREMIUM_WEEKLY_RECAP.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-line/45 bg-[rgba(5,8,14,0.42)] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-line/45 bg-[rgba(5,8,14,0.42)] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Saved moment</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-200">
                  18:42 — “Come back to the truth before you come back to the fear.”
                </p>
                <p className="mt-2 text-xs text-slate-500">Saved under Anxiety & Peace · Add reflection note</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-[28px] border border-accent/20 bg-[rgba(12,16,24,0.52)] p-6 backdrop-blur-md sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/70">Quiet proof</p>
            <h3 className="text-xl font-semibold tracking-tight text-white">The kind of reaction we want Premium to earn.</h3>
            <div className="space-y-3">
              {PREMIUM_PROOF_NOTES.map((note) => (
                <blockquote key={note} className="rounded-[20px] border border-line/55 bg-[rgba(8,11,18,0.44)] p-4 text-sm leading-relaxed text-slate-300/95">
                  “{note}”
                </blockquote>
              ))}
            </div>
            <div className="rounded-[20px] border border-amber-200/15 bg-amber-200/[0.06] p-4">
              <p className="text-sm font-semibold text-white">Early supporter hook</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400/95">
                Invite early members to become Founding Supporters. It gives them identity, belonging, and a reason to join while Deep Well is still being built in public.
              </p>
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
          Cancel anytime through Stripe. Listening stays free—Premium is for when you want Deep Well to remember for you.
        </p>
      </section>
    </main>
  );
}
