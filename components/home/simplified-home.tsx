import Link from "next/link";
import type { Route } from "next";
import { Check } from "lucide-react";
import type { EpisodeWithShow } from "@/lib/types";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { HomeStartListeningCard } from "@/components/home/home-start-listening-card";

const START_LISTENING_MAX = 8;

export type SimplifiedHomeProps = {
  /** Recent episodes for the “Start listening” row */
  startListening: EpisodeWithShow[];
};

export function SimplifiedHome({ startListening }: SimplifiedHomeProps) {
  const row = startListening.slice(0, START_LISTENING_MAX);

  return (
    <>
      {/* 1. Hero */}
      <section
        className="relative overflow-hidden border-b border-line/60"
        aria-labelledby="home-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(212,175,55,0.08),transparent_55%)]"
          aria-hidden
        />
        <div className="container-shell relative py-16 sm:py-20 lg:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">
            Deep Well Audio
          </p>
          <h1
            id="home-hero-heading"
            className="mt-4 max-w-[26ch] text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            Trusted Christian teaching, without the noise
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200/95 sm:text-xl">
            Listen freely. No account needed. Subscribe to save, organize, and stay with what matters.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_32px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              Start Listening
            </Link>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_hero" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 bg-[rgba(12,16,24,0.35)] px-7 py-3 text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:border-accent/35 hover:text-white"
            >
              See Premium
            </FunnelLink>
          </div>
        </div>
      </section>

      {/* 2. Three value cards */}
      <section className="border-b border-line/50 bg-[rgba(8,11,17,0.35)] py-16 sm:py-20" aria-labelledby="home-values-heading">
        <div className="container-shell">
          <h2 id="home-values-heading" className="sr-only">
            Why Deep Well
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Listen",
                text: "Browse and play trusted teaching instantly.",
              },
              {
                title: "Grow",
                text: "Follow topics that matter to your life.",
              },
              {
                title: "Stay Aware",
                text: "Understand the world through a biblical lens.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-[22px] border border-line/55 bg-[rgba(10,14,20,0.45)] p-7 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Start listening */}
      <section className="py-16 sm:py-20" aria-labelledby="home-start-heading">
        <div className="container-shell">
          <div className="mb-10 max-w-2xl">
            <h2 id="home-start-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Start Listening
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Jump in with a few picks from the catalog—no sign-up required.
            </p>
          </div>
          {row.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {row.map((ep) => (
                <HomeStartListeningCard key={ep.id} episode={ep} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line/60 bg-soft/15 px-5 py-6 text-sm text-muted">
              Content will appear here after your catalog syncs.{" "}
              <Link href="/browse" className="font-medium text-amber-200/90 underline-offset-2 hover:underline">
                Open Browse
              </Link>{" "}
              anytime.
            </p>
          )}
          <div className="mt-10">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              Browse everything
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Free vs Premium */}
      <section
        className="border-t border-line/50 bg-[rgba(7,10,16,0.4)] py-16 sm:py-20"
        aria-labelledby="home-plans-heading"
      >
        <div className="container-shell">
          <h2 id="home-plans-heading" className="sr-only">
            Free and Premium
          </h2>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-[22px] border border-line/55 bg-[rgba(10,14,20,0.5)] p-8 backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white">Free</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300/95">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Listen to teaching
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Browse topics
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Explore content freely
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Preview World Watch
                </li>
              </ul>
            </div>
            <div className="rounded-[22px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.75)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_24px_56px_-36px_rgba(212,175,55,0.15)] backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white">Premium — $9/month</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200/95">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Save teachings
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Take notes
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Follow topics
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Resume where you left off
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Unlock full World Watch
                </li>
              </ul>
              <p className="mt-6 text-base font-medium leading-relaxed text-slate-200/95">
                This isn&apos;t about more content. It&apos;s about keeping what matters.
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Free = access. Premium = continuity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="border-t border-line/55 bg-[rgba(7,10,16,0.55)] py-16 sm:py-20" aria-labelledby="home-final-heading">
        <div className="container-shell text-center">
          <h2 id="home-final-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start listening for free. Upgrade when you&apos;re ready.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_-12px_rgba(212,175,55,0.5)] transition hover:opacity-95"
            >
              Start Listening
            </Link>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_footer" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 px-8 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              Go Premium
            </FunnelLink>
          </div>
        </div>
      </section>
    </>
  );
}
