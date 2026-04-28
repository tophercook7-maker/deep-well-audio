import Link from "next/link";
import type { Route } from "next";
import { Bookmark, BookOpen, Check, FileText, Headphones, Library, Search, ScrollText } from "lucide-react";
import type { EpisodeWithShow } from "@/lib/types";
import type { UserPlan } from "@/lib/permissions";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { HomeStartListeningCard } from "@/components/home/home-start-listening-card";
import { HomeDailyScriptureRitual } from "@/components/home/home-daily-scripture-ritual";
import { CTA, SITE_POSITIONING } from "@/lib/site-messaging";
import { SignedInHabitBand } from "@/components/retention/signed-in-habit-band";

const START_LISTENING_MAX = 8;

export type SimplifiedHomeProps = {
  /** Recent episodes for the featured row */
  startListening: EpisodeWithShow[];
  /** Live catalog stats when available */
  showCount?: number;
  episodeCount?: number;
  /** Signed-in habit surfaces (Continue, activity, momentum, etc.) */
  sessionUser?: boolean;
  plan?: UserPlan;
  worldWatchLatest?: { id: string; title: string; slug: string; published_at: string } | null;
};

export function SimplifiedHome({
  startListening,
  showCount = 0,
  episodeCount = 0,
  sessionUser = false,
  plan = "guest",
  worldWatchLatest = null,
}: SimplifiedHomeProps) {
  const row = startListening.slice(0, START_LISTENING_MAX);
  const statsLine =
    showCount > 0 && episodeCount > 0
      ? `${showCount} trusted sources · ${episodeCount.toLocaleString()}+ teachings`
      : "Curated sources · Trusted voices · No account required";

  return (
    <>
      {/* Daily ritual — Scripture first */}
      <section
        className="relative overflow-hidden border-b border-line/45 bg-[rgba(5,8,14,0.42)]"
        aria-labelledby="home-ritual-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_75%_at_50%_-15%,rgba(212,175,55,0.08),transparent_58%)]"
          aria-hidden
        />
        <div className="container-shell relative py-12 sm:py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">Deep Well Audio</p>
          <h1
            id="home-ritual-heading"
            className="mt-4 max-w-[26ch] font-serif text-[1.85rem] font-normal leading-[1.15] tracking-tight text-white sm:text-[2.15rem]"
          >
            {sessionUser ? "Welcome back" : "Return to Scripture"}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400/95">
            {sessionUser
              ? "Ready to continue? Pick up where you left off—or open Scripture whenever it feels right."
              : "Listen, read, and study in one calm place. Stay grounded in the Word at your pace."}
          </p>
          <div className="mt-10 max-w-2xl">
            <HomeDailyScriptureRitual />
          </div>
        </div>
      </section>

      {/* Secondary links — support the habit, don’t compete */}
      <section className="border-b border-line/40 bg-[rgba(7,10,16,0.32)] py-10 sm:py-12" aria-labelledby="home-more-heading">
        <div className="container-shell">
          <h2 id="home-more-heading" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            More
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            <li>
              <Link
                href={"/studies" as Route}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/50 bg-[rgba(9,12,18,0.35)] px-4 py-2.5 text-sm font-medium text-amber-100/90 transition hover:border-accent/28"
              >
                <ScrollText className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Studies
              </Link>
            </li>
            <li>
              <Link
                href={"/bible" as Route}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/50 bg-[rgba(9,12,18,0.35)] px-4 py-2.5 text-sm font-medium text-amber-100/90 transition hover:border-accent/28"
              >
                <BookOpen className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Open Bible
              </Link>
            </li>
            <li>
              <Link
                href={"/search" as Route}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/45 bg-[rgba(9,12,18,0.28)] px-4 py-2.5 text-sm font-medium text-slate-300/95 transition hover:border-accent/22"
              >
                <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Search
              </Link>
            </li>
            <li>
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/45 bg-[rgba(9,12,18,0.28)] px-4 py-2.5 text-sm font-medium text-slate-300/95 transition hover:border-accent/22"
              >
                Browse teachings
              </Link>
            </li>
            {sessionUser ? (
              <>
                <li>
                  <Link
                    href={"/me/bookmarks" as Route}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/45 bg-[rgba(9,12,18,0.28)] px-4 py-2.5 text-sm font-medium text-slate-300/95 transition hover:border-accent/22"
                  >
                    <Bookmark className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    Bookmarks
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/me/notes" as Route}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/45 bg-[rgba(9,12,18,0.28)] px-4 py-2.5 text-sm font-medium text-slate-300/95 transition hover:border-accent/22"
                  >
                    <FileText className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    Notes
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/library" as Route}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/45 bg-[rgba(9,12,18,0.28)] px-4 py-2.5 text-sm font-medium text-slate-300/95 transition hover:border-accent/22"
                  >
                    <Library className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    Library
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
          <p className="mt-8 text-sm text-slate-500">{statsLine}</p>
        </div>
      </section>

      {sessionUser ? (
        <section className="border-b border-line/40 bg-[rgba(6,9,15,0.38)] py-10 sm:py-12" aria-label="Teaching and library">
          <div className="container-shell space-y-6">
            <SignedInHabitBand
              plan={plan}
              worldWatchLatest={worldWatchLatest}
              showContinueModule={false}
              hidePickUpContinueRow
            />
          </div>
        </section>
      ) : null}

      {/* The problem */}
      <section
        className="border-b border-line/50 bg-[rgba(8,11,17,0.42)] py-16 sm:py-20"
        aria-labelledby="home-problem-heading"
      >
        <div className="container-shell">
          <h2 id="home-problem-heading" className="max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            You don&apos;t need more content. You need a way to keep what matters.
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "You hear something powerful, then lose it",
              "You mean to go back, but never do",
              "Your notes, passages, and sermons are scattered",
            ].map((t) => (
              <li
                key={t}
                className="rounded-[20px] border border-line/45 bg-[rgba(10,14,20,0.5)] px-5 py-5 text-sm leading-relaxed text-slate-300/95"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-slate-400/95">
            Deep Well helps you return to what mattered.
          </p>
        </div>
      </section>

      {/* Brand line — below ritual */}
      <section className="border-b border-line/40 py-14 sm:py-16" aria-labelledby="home-brand-heading">
        <div className="container-shell max-w-3xl">
          <h2 id="home-brand-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {SITE_POSITIONING.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400/95 sm:text-lg">{SITE_POSITIONING.subhead}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">{SITE_POSITIONING.problem}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_32px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              {CTA.LISTEN_FREE}
            </Link>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_hero" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 bg-[rgba(12,16,24,0.45)] px-7 py-3 text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:border-accent/35 hover:text-white"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20" aria-labelledby="home-how-heading">
        <div className="container-shell">
          <h2 id="home-how-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            A simple rhythm for real growth
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Discover",
                text: "Browse trusted teachers and topics—curated, not chaotic.",
              },
              { step: "2", title: "Listen", text: "Stream high-quality teaching for free." },
              { step: "3", title: "Save", text: "Keep sermons, notes, and passages in one place." },
              { step: "4", title: "Return", text: "Pick up where you left off and go deeper over time." },
            ].map((s) => (
              <li
                key={s.step}
                className="relative rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.4)] p-6 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.5)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/75">Step {s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400/95">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured content */}
      <section className="border-t border-line/45 bg-[rgba(7,10,16,0.38)] py-16 sm:py-20" aria-labelledby="home-featured-heading">
        <div className="container-shell">
          <div className="mb-10 max-w-2xl">
            <h2 id="home-featured-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Start with what others keep coming back to
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Teaching worth saving—open a card to listen.</p>
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
              {CTA.LISTEN_FREE}
            </Link>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-16 sm:py-20" aria-labelledby="home-diff-heading">
        <div className="container-shell">
          <h2 id="home-diff-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Built for depth, not endless scrolling
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Curated, not chaotic",
              "Scripture-connected, not surface-level",
              "Designed for return, not distraction",
              "Calm by design, but not shallow",
            ].map((t) => (
              <li
                key={t}
                className="flex gap-3 rounded-2xl border border-line/40 bg-[rgba(10,14,20,0.35)] px-5 py-4 text-sm leading-relaxed text-slate-300/95"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Free vs Premium */}
      <section
        className="border-t border-line/50 bg-[rgba(7,10,16,0.45)] py-16 sm:py-20"
        aria-labelledby="home-plans-heading"
      >
        <div className="container-shell">
          <h2 id="home-plans-heading" className="max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Free gets you listening. Premium helps you keep growing.
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-[22px] border border-line/55 bg-[rgba(10,14,20,0.5)] p-8 backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white">Free</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300/95">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Browse teaching
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Listen anytime
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Explore topics
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
                  Keep notes
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
                  Full World Watch digest
                </li>
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-slate-400/95">
                Transformation over time—not a checklist of features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line/55 bg-[rgba(7,10,16,0.55)] py-16 sm:py-20" aria-labelledby="home-final-heading">
        <div className="container-shell text-center">
          <h2 id="home-final-heading" className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start listening for free. Keep what matters when you&apos;re ready.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={"/browse" as Route}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_-12px_rgba(212,175,55,0.5)] transition hover:opacity-95"
            >
              {CTA.LISTEN_FREE}
            </Link>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_footer" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 px-8 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
        </div>
      </section>
    </>
  );
}
