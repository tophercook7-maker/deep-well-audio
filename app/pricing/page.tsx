import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { BackButton } from "@/components/buttons/back-button";
import { PricingPremiumCheckout } from "@/components/pricing/pricing-premium-checkout";
import { getUserPlan } from "@/lib/auth";
import { hasStripeBillingConfigured } from "@/lib/env";
import type { UserPlan } from "@/lib/permissions";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing · Deep Well Audio",
  description:
    "Start free. Upgrade when you want a steadier place to save, organize, and stay with trusted Bible teaching.",
};

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-slate-300/95">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function startFreeHref(plan: UserPlan): Route {
  if (plan === "guest") return "/signup?next=/explore" as Route;
  return "/explore" as Route;
}

function startFreeLabel(plan: UserPlan) {
  if (plan === "guest") return "Start Free";
  return "Continue free";
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
              Simple access to teaching worth keeping
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Deep Well helps you listen with intention, save what matters, and come back to it without getting lost in noise.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
              Start free. Upgrade when you want a steadier place to save, organize, and stay with what matters.
            </p>
          </header>
        </div>
      </div>

      <section className="container-shell max-w-5xl py-14 sm:py-16" aria-labelledby="pricing-intro-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-intro-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start where you are
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
            Some people just want a calmer place to listen.
            <br className="hidden sm:inline" /> Others want to build a personal library they can return to again and again.
          </p>
          <p className="mt-4 text-base font-medium text-slate-200/95">Deep Well gives you both.</p>
        </div>
      </section>

      <section className="border-t border-line/40 bg-[rgba(8,11,17,0.35)] py-14 sm:py-16" aria-labelledby="pricing-plans-heading">
        <div className="container-shell max-w-5xl">
          <h2 id="pricing-plans-heading" className="sr-only">
            Plans
          </h2>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Free */}
            <div className="flex flex-col rounded-[26px] border border-line/50 bg-[rgba(10,14,20,0.55)] p-8 shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white sm:text-2xl">Free</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">A simple place to explore trusted teaching.</p>
              <ul className="mt-8 flex-1 space-y-3">
                <Bullet>Browse trusted ministries</Bullet>
                <Bullet>Listen to curated teaching</Bullet>
                <Bullet>Explore guided topics</Bullet>
                <Bullet>Get a feel for Deep Well before committing</Bullet>
              </ul>
              <div className="mt-10">
                <Link
                  href={startFreeHref(plan)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.4)] px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
                >
                  {startFreeLabel(plan)}
                </Link>
              </div>
            </div>

            {/* Premium */}
            <div
              id="premium"
              className="relative flex flex-col overflow-hidden rounded-[26px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.85)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_28px_64px_-32px_rgba(212,175,55,0.22)] backdrop-blur-md sm:p-9"
            >
              <div
                className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-accent/[0.06] blur-3xl"
                aria-hidden
              />
              <div className="relative">
                <h3 className="text-xl font-semibold text-white sm:text-2xl">Premium</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
                  For people who want to keep what matters and stay with it.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  <span className="tabular-nums text-slate-200/95">$9</span>/month or{" "}
                  <span className="tabular-nums text-slate-200/95">$90</span>/year · Cancel anytime.
                </p>
                <ul className="mt-8 flex-1 space-y-3">
                  <Bullet>Save teachings to your personal library</Bullet>
                  <Bullet>Return to what helped you most</Bullet>
                  <Bullet>Organize your listening</Bullet>
                  <Bullet>Build a steady rhythm over time</Bullet>
                  <Bullet>Keep meaningful teaching in one place</Bullet>
                </ul>
                <div className="mt-10">
                  <PricingPremiumCheckout stripeReady={stripeReady} plan={plan} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell max-w-3xl py-14 sm:py-16" aria-labelledby="why-upgrade-heading">
        <h2 id="why-upgrade-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Premium is not about getting more noise
        </h2>
        <p className="mt-5 text-base leading-relaxed text-slate-300/95">It&apos;s about keeping what mattered.</p>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Deep Well Premium is for people who do not want their best listening moments to disappear into a stream they may never find again.
        </p>
        <ul className="mt-8 space-y-3">
          <Bullet>Save teachings worth revisiting</Bullet>
          <Bullet>Build a personal library over time</Bullet>
          <Bullet>Stay closer to what you&apos;re learning</Bullet>
          <Bullet>Make your listening intentional</Bullet>
        </ul>
      </section>

      <section
        className="border-t border-line/40 bg-[rgba(7,10,16,0.45)] py-14 sm:py-16"
        aria-labelledby="reassurance-heading"
      >
        <div className="container-shell mx-auto max-w-2xl text-center">
          <h2 id="reassurance-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            No pressure. Just a better way to stay with truth.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95">
            Start free and see if Deep Well fits how you listen and grow.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Upgrade only when you&apos;re ready for something more permanent.
          </p>
        </div>
      </section>

      <section className="container-shell max-w-4xl pb-4 pt-4 sm:pt-6" aria-labelledby="pricing-final-heading">
        <div className="rounded-[26px] border border-line/45 bg-[rgba(10,14,20,0.5)] px-6 py-10 text-center shadow-[0_20px_50px_-36px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-10">
          <h2 id="pricing-final-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start free. Grow deeper when you are ready.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={startFreeHref(plan)}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              Start Free
            </Link>
            <a
              href="#subscribe"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-line/90 px-7 py-3 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
            >
              View Premium
            </a>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            <FunnelLink
              href={"/join" as Route}
              funnelEvent="join_list_click"
              funnelData={{ placement: "pricing_page" }}
              className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
            >
              Short updates. No noise.
            </FunnelLink>
          </p>
        </div>
      </section>
    </main>
  );
}
