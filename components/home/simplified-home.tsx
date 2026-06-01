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
      : "Curated sources · Listen free · Build your library when you are ready";

  return (
    <>
      {/* Hero */}
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
            className="mt-4 max-w-[28ch] font-serif text-[1.9rem] font-normal leading-[1.15] tracking-tight text-white sm:text-[2.25rem]"
          >
            {sessionUser ? "Welcome back to your library" : "Stop losing the teaching that shaped you"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400/95">
            {sessionUser
              ? "Pick up where you left off. Your saved teachings, notes, Scripture, and World Watch reflections stay together so you can return when life gets loud."
              : "Listen free. Explore trusted Christian teaching. Then become a member when you want one quiet place that remembers the sermons, Scripture, notes, and reflections you actually want to return to."}
          </p>
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
              funnelData={{ placement: "home_top_hero" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-line/90 bg-[rgba(12,16,24,0.45)] px-7 py-3 text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:border-accent/35 hover:text-white"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
          <p className="mt-5 text-sm text-slate-500">{statsLine}</p>
          <div className="mt-10 max-w-2xl">
            <HomeDailyScriptureRitual />
          </div>
        </div>
      </section>

      {/* Secondary links */}
      <section className="border-b border-line/40 bg-[rgba(7,10,16,0.32)] py-10 sm:py-12" aria-labelledby="home-more-heading">
        <div className="container-shell">
          <h2 id="home-more-heading" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Start here
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            <li>
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/50 bg-[rgba(9,12,18,0.35)] px-4 py-2.5 text-sm font-medium text-amber-100/90 transition hover:border-accent/28"
              >
                <Headphones className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Listen free
              </Link>
            </li>
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
            Most Christian content disappears right after it helps you.
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "You hear a sermon you need, then cannot find it later",
              "Your notes live in one place while the teaching lives somewhere else",
              "You want a steadier walk, but your spiritual inputs are scattered",
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
            Deep Well fixes the part after listening: saving, returning, taking notes, following topics, and keeping Scripture beside what shaped you.
          </p>
        </div>
      </section>

      {/* Brand line */}
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
              funnelData={{ placement: "home_positioning" }}
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
            A simple path from listening to lasting growth
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Discover",
                text: "Browse trusted teachers, topics, studies, and World Watch reflections without the noise.",
              },
              { step: "2", title: "Listen free", text: "Start with audio and curated video teaching before you ever pay." },
              { step: "3", title: "Save what hits", text: "Upgrade when you want bookmarks, notes, topics, Scripture, and progress held together." },
              { step: "4", title: "Return", text: "Open your library and pick up the thread instead of starting from zero again." },
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
              Start with teaching worth saving
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">Open a card, listen free, and notice what you would want to keep.</p>
          </div>
          {row.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {row.map((ep) => (
                <HomeStartListeningCard key={ep.id} episode={ep} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line/60 bg-soft/15 px-5 py-6 text-sm text-muted">
              Content will appear here after your catalog syncs. {" "}
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
            Built for return, not endless scrolling
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Free discovery without another noisy feed",
              "Premium memory for sermons, Scripture, notes, and topics",
              "World Watch for grounded reflection on current events",
              "A calm library that helps you come back to what mattered",
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
            Listen for free. Pay when you want Deep Well to remember for you.
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-[22px] border border-line/55 bg-[rgba(10,14,20,0.5)] p-8 backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white">Free discovery</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300/95">
                {[
                  "Browse trusted audio and curated video",
                  "Listen without creating an account",
                  "Explore topics, studies, Scripture, and World Watch previews",
                ].map((text) => (
                  <li key={text} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[22px] border border-accent/25 bg-gradient-to-br from-[rgba(24,32,48,0.75)] to-[rgba(8,11,18,0.88)] p-8 shadow-[0_24px_56px_-36px_rgba(212,175,55,0.15)] backdrop-blur-md sm:p-9">
              <h3 className="text-xl font-semibold text-white">Premium memory — $9/month</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200/95">
                {[
                  "One personal library for teachings, video, Scripture, notes, and bookmarks",
                  "Resume where life interrupted you",
                  "Follow topics and seasons you are walking through",
                  "Keep private study notes beside the teaching that sparked them",
                  "Unlock the full World Watch digest",
                ].map((text) => (
                  <li key={text} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-slate-400/95">
                Upgrade when you catch yourself thinking: I need to come back to this.
              </p>
              <div className="mt-7">
                <FunnelLink
                  href={"/pricing#premium" as Route}
                  funnelEvent="view_plans_click"
                  funnelData={{ placement: "home_plan_comparison" }}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                >
                  {CTA.SEE_PREMIUM}
                </FunnelLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line/55 bg-[rgba(7,10,16,0.55)] py-16 sm:py-20" aria-labelledby="home-final-heading">
        <div className="container-shell text-center">
          <h2 id="home-final-heading" className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start free. Keep what matters when you are ready.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400/95">
            Deep Well is free to explore. Premium is for the teaching, Scripture, notes, and reflections you do not want to lose.
          </p>
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
