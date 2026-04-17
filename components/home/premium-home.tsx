import Link from "next/link";
import type { Route } from "next";
import { Fragment } from "react";
import { ArrowRight, BookMarked, Check, Globe2, Headphones, Library, Sparkles } from "lucide-react";
import type { EpisodeWithShow, ShowWithMeta } from "@/lib/types";
import type { UserPlan } from "@/lib/permissions";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { CTA } from "@/lib/site-messaging";
import { RemoteArtwork } from "@/components/artwork/remote-artwork";
import { WorldWatchItemCard } from "@/components/world-watch/world-watch-item-card";
import { getShowDisplayLabel } from "@/lib/display";
import { HOME_START_HERE_CARDS } from "@/lib/home-start-here-cards";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export type PremiumHomeProps = {
  plan: UserPlan;
  featuredShows: ShowWithMeta[];
  savedEpisodeSamples: EpisodeWithShow[];
  worldWatchItems: WorldWatchItemPublic[];
  episodeCount: number;
  /** Active synced ministries (`getActiveShowCount`). */
  showCount: number;
};

function formatMinistriesLine(count: number) {
  if (count <= 0) return "Trusted ministries";
  if (count === 1) return "1 trusted ministry";
  return `${count.toLocaleString()} trusted ministries`;
}

function formatTeachingsLine(count: number) {
  if (count >= 1000) return "1,000+ teachings";
  if (count > 0) return `${count.toLocaleString()}+ teachings`;
  return "1,000+ teachings";
}

function firstSummaryLine(summary: string) {
  const t = summary.trim();
  if (!t) return "";
  const para = t.split(/\n+/).map((p) => p.trim()).filter(Boolean)[0] ?? "";
  if (para.length > 120) return `${para.slice(0, 117)}…`;
  return para;
}

function PremiumHero({
  savedEpisodeSamples,
  featuredShows,
  worldWatchLead,
}: {
  savedEpisodeSamples: EpisodeWithShow[];
  featuredShows: ShowWithMeta[];
  worldWatchLead: WorldWatchItemPublic | null;
}) {
  const samples =
    savedEpisodeSamples.length > 0
      ? savedEpisodeSamples.slice(0, 3).map((ep) => ep.title)
      : [
          "Christ’s care when the noise won’t stop",
          "Psalms for the anxious heart",
          "Faithful shepherds, faithful words",
        ];

  const ministries =
    featuredShows.length > 0
      ? featuredShows.slice(0, 4).map((s) => getShowDisplayLabel(s.title, s.slug))
      : ["Trusted expository ministry", "Reformed teaching", "Careful apologetics", "Historic faithfulness"];

  const wwLine = worldWatchLead
    ? worldWatchLead.title
    : "Fewer stories—held still long enough to think biblically.";

  return (
    <section
      className="relative overflow-hidden border-b border-line/60"
      aria-labelledby="premium-home-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(212,175,55,0.09),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_20%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(120,90,180,0.04),transparent_45%)]"
        aria-hidden
      />
      <div className="container-shell relative py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">
              Trusted, Scripture-grounded teaching
            </p>
            <h1
              id="premium-home-hero-heading"
              className="mt-4 max-w-[22ch] text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.15rem]"
            >
              Stop wasting hours searching for solid Bible teaching.
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-snug text-slate-100/95 sm:text-xl">
              Deep Well filters out the noise so you can focus on truth that actually helps you grow.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={"/signup?next=/library" as Route}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_32px_-10px_rgba(212,175,55,0.5)] transition hover:opacity-95"
              >
                Start Your Personal Library
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <FunnelLink
                href={"/explore" as Route}
                funnelEvent="explore_teaching_click"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[22px] border border-line/90 bg-[rgba(12,16,24,0.35)] px-6 py-3 text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:border-accent/35 hover:text-white"
              >
                Browse Trusted Teaching
              </FunnelLink>
            </div>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-300/95">
              Listen without an account. Sign in when you want your saved teaching and notes to stay with you.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/[0.07] via-transparent to-sky-500/[0.04] blur-2xl"
              aria-hidden
            />
            <div className="relative space-y-4">
              <div className="translate-x-0 translate-y-0 rounded-[24px] border border-white/[0.08] bg-[rgba(10,14,22,0.55)] p-5 shadow-[0_0_0_1px_rgba(212,175,55,0.06),0_24px_56px_-28px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-line/50 pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <BookMarked className="h-4 w-4 text-accent" aria-hidden />
                    Saved Teaching
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Library</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {samples.map((title) => (
                    <li
                      key={title}
                      className="flex items-start gap-3 rounded-2xl border border-line/40 bg-[rgba(6,9,14,0.45)] px-3 py-2.5"
                    >
                      <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" aria-hidden />
                      <span className="text-[0.9375rem] leading-snug text-slate-100/95">{title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="translate-x-2 rounded-[24px] border border-white/[0.07] bg-[rgba(10,14,22,0.48)] p-5 shadow-[0_20px_48px_-30px_rgba(0,0,0,0.55)] backdrop-blur-md sm:translate-x-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-line/45 pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                    Trusted Ministries
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ministries.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-line/55 bg-[rgba(8,11,18,0.55)] px-3 py-1.5 text-xs font-medium text-slate-200/95"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="translate-x-1 rounded-[24px] border border-accent/20 bg-gradient-to-br from-[rgba(18,24,36,0.85)] to-[rgba(8,10,16,0.72)] p-5 shadow-[0_20px_50px_-32px_rgba(212,175,55,0.35)] backdrop-blur-md sm:-translate-x-1 sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-line/40 pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Globe2 className="h-4 w-4 text-accent" aria-hidden />
                    World Watch
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Digest</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-200/95">{wwLine}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar({ episodeCount, showCount }: { episodeCount: number; showCount: number }) {
  const items = [
    formatMinistriesLine(showCount),
    formatTeachingsLine(episodeCount),
    "Scripture-grounded curation",
    "World Watch digest",
  ];
  return (
    <div className="border-b border-line/55 bg-[rgba(7,10,16,0.55)] py-4 backdrop-blur-sm">
      <div className="container-shell">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[13px] font-medium text-slate-300/95 sm:text-sm">
          {items.map((label, i) => (
            <Fragment key={label}>
              {i > 0 ? (
                <span className="text-slate-600" aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="whitespace-nowrap">{label}</span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  const cards = [
    {
      title: "Endless sermons and conflicting voices",
      body: "The internet never runs out of takes. Clarity is the scarce part.",
    },
    {
      title: "No clear place to start",
      body: "Without a path, you drift—or burn out trying to keep up.",
    },
    {
      title: "No easy way to keep what mattered",
      body: "Truth slips unless you have a quiet place to return to it.",
    },
  ];
  return (
    <section className="bg-[rgba(9,12,18,0.35)] py-16 sm:py-20" aria-labelledby="premium-problem-heading">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="premium-problem-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
            The problem isn’t lack of content. It’s too much of it.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
            Too many voices. Too much noise. Too little staying power.
            <br className="hidden sm:inline" /> Most people spend more time searching than actually growing.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="rounded-[22px] border border-line/55 bg-[rgba(12,16,24,0.45)] p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <h3 className="text-lg font-semibold text-white">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "We curate",
      body: "Only trusted, biblically sound voices.",
    },
    {
      n: "2",
      title: "You explore",
      body: "No algorithm wall. Just thoughtful, ordered teaching.",
    },
    {
      n: "3",
      title: "You save",
      body: "Keep teachings, topics, and notes in one place.",
    },
    {
      n: "4",
      title: "You grow",
      body: "Come back to what God is teaching you without losing it.",
    },
  ];
  return (
    <section className="section-divider py-16 sm:py-20" aria-labelledby="premium-how-heading">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="premium-how-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
            How Deep Well works
          </h2>
          <p className="mt-4 text-base text-slate-300/95 sm:text-[1.0625rem]">
            A calmer path from searching to staying with what matters.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-[22px] border border-line/50 bg-[rgba(11,15,22,0.4)] p-6 backdrop-blur-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/[0.09] text-sm font-semibold text-amber-100/95">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustedVoices({ shows }: { shows: ShowWithMeta[] }) {
  return (
    <section
      className="border-t border-line/50 bg-[rgba(8,11,17,0.42)] py-16 sm:py-20"
      aria-labelledby="premium-voices-heading"
    >
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="premium-voices-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
            Built on trusted voices
          </h2>
          <p className="mt-4 text-base text-slate-300/95 sm:text-[1.0625rem]">
            Not a random feed. A carefully selected library shaped by ministries we trust.
          </p>
        </div>
        {shows.length > 0 ? (
          <div className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-3.5">
            {shows.map((show) => {
              const label = getShowDisplayLabel(show.title, show.slug);
              return (
                <Link
                  key={show.id}
                  href={`/shows/${show.slug}` as Route}
                  className="group flex max-w-[min(100%,280px)] items-center gap-2.5 rounded-full border border-line/55 bg-[rgba(10,14,20,0.5)] py-1.5 pl-1.5 pr-4 text-left text-sm font-medium text-slate-100 backdrop-blur-sm transition hover:border-accent/35 hover:text-white"
                >
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line/50 bg-soft/40">
                    <RemoteArtwork
                      src={show.artwork_url}
                      alt=""
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="min-w-0 truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-lg text-center text-sm text-slate-400">
            Ministries appear here as your directory syncs. Explore the{" "}
            <Link href={"/explore" as Route} className="font-medium text-amber-200/90 underline-offset-2 hover:underline">
              teaching catalog
            </Link>{" "}
            anytime.
          </p>
        )}
      </div>
    </section>
  );
}

function StartHerePaths() {
  return (
    <section className="section-divider py-16 sm:py-20" aria-labelledby="premium-start-heading">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="premium-start-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
            Start with what you need today
          </h2>
          <p className="mt-4 text-base text-slate-300/95 sm:text-[1.0625rem]">
            You do not have to take everything in at once.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {HOME_START_HERE_CARDS.map((card) => (
            <FunnelLink
              key={card.slug}
              href={`/paths/${card.slug}` as Route}
              funnelEvent="guided_path_click"
              funnelData={{ slug: card.slug }}
              className="group flex min-h-[8.5rem] flex-col justify-between rounded-[24px] border border-line/55 bg-[rgba(11,15,22,0.42)] p-6 text-left shadow-[0_18px_44px_-32px_rgba(0,0,0,0.55)] backdrop-blur-md transition hover:border-accent/35 hover:bg-accent/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-50">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.description}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-amber-200/90 transition group-hover:text-amber-100">
                Explore path
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </FunnelLink>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorldWatchSection({
  items,
  plan,
}: {
  items: WorldWatchItemPublic[];
  plan: UserPlan;
}) {
  const [lead, support] = items;
  const bullets = [
    "Fewer stories, chosen carefully",
    "Clear framing, not panic",
    "A calmer way to stay informed",
  ];

  return (
    <section
      className="border-t border-line/50 bg-[rgba(9,12,18,0.38)] py-16 sm:py-20"
      aria-labelledby="premium-ww-heading"
    >
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="premium-ww-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Pay attention without getting pulled in
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              World Watch slows the noise down and helps you think clearly about public life through a biblical lens.
            </p>
            {plan !== "premium" ? (
              <p className="mt-4 text-sm text-slate-500">Members see the full written digest; previews below stay readable for everyone.</p>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            {lead ? (
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8">
                  <WorldWatchItemCard item={lead} variant="featured" maxSummaryParagraphs={2} showReflection={false} />
                </div>
                <div className="flex flex-col gap-6 lg:col-span-4">
                  {support ? (
                    <WorldWatchItemCard item={support} maxSummaryParagraphs={1} showReflection={false} />
                  ) : null}
                  <div className="rounded-[22px] border border-line/50 bg-[rgba(10,14,20,0.55)] p-6 backdrop-blur-md">
                    <ul className="space-y-3 text-sm leading-relaxed text-slate-300/95">
                      {bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-line/55 bg-[rgba(10,14,20,0.45)] p-8 text-center text-slate-400">
                <p>
                  <Link href={"/world-watch" as Route} className="font-medium text-amber-200/90 underline-offset-2 hover:underline">
                    Open World Watch
                  </Link>{" "}
                  for the latest digest when it&apos;s live.
                </p>
              </div>
            )}
            <div className="mt-8">
              <Link
                href={"/world-watch" as Route}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
              >
                Explore World Watch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LibrarySaveSection({ plan }: { plan: UserPlan }) {
  return (
    <section className="section-divider py-16 sm:py-20" aria-labelledby="premium-library-heading">
      <div className="container-shell">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 id="premium-library-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Save what mattered. Come back to it.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300/95 sm:text-[1.0625rem]">
              Create a free account to keep sermons, teaching, and notes in one quiet place.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate-300/95">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Save teachings worth revisiting
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Organize around topics that matter to you
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Keep your listening from getting lost
              </li>
            </ul>
            <div className="mt-8">
              {plan === "guest" ? (
                <Link
                  href={"/signup?next=/library" as Route}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-accent px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
                >
                  Create Free Account
                </Link>
              ) : (
                <FunnelLink
                  href={"/library" as Route}
                  funnelEvent="explore_teaching_click"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-line/90 px-7 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
                >
                  Open your library
                </FunnelLink>
              )}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gradient-to-tr from-accent/[0.08] via-transparent to-sky-500/[0.05] blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[26px] border border-line/50 bg-[rgba(9,12,18,0.65)] shadow-[0_28px_64px_-36px_rgba(0,0,0,0.65)] backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-line/45 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" aria-hidden />
                  <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Library</span>
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <div className="flex items-center gap-3 rounded-[18px] border border-line/45 bg-[rgba(6,9,14,0.55)] p-4">
                    <Library className="h-5 w-5 text-accent" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-white">Saved teaching</p>
                      <p className="text-xs text-slate-500">Picks that stay with you</p>
                    </div>
                  </div>
                  <div className="h-24 rounded-[18px] border border-dashed border-line/40 bg-[rgba(5,8,12,0.4)]" />
                  <div className="rounded-[18px] border border-line/40 bg-[rgba(6,9,14,0.45)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {firstSummaryLine(
                        "A quiet line of thought—tied to what you heard, not lost in another app."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CredibilitySection() {
  return (
    <section className="border-t border-line/50 bg-[rgba(8,11,17,0.4)] py-14 sm:py-16" aria-labelledby="premium-cred-heading">
      <div className="container-shell">
        <h2 id="premium-cred-heading" className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Made for people who want depth, not noise.
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <blockquote className="rounded-[22px] border border-line/50 bg-[rgba(11,15,22,0.45)] p-6 text-sm leading-relaxed text-slate-300/95 backdrop-blur-sm">
            <p>&ldquo;I finally stopped bouncing between random sermons and started staying with what mattered.&rdquo;</p>
          </blockquote>
          <blockquote className="rounded-[22px] border border-line/50 bg-[rgba(11,15,22,0.45)] p-6 text-sm leading-relaxed text-slate-300/95 backdrop-blur-sm">
            <p>&ldquo;Deep Well feels calm, clear, and actually useful.&rdquo;</p>
          </blockquote>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
          Curated with care for serious listening, reflection, and growth.
        </p>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="section-divider py-14 sm:py-16" aria-labelledby="premium-price-heading">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl rounded-[26px] border border-line/50 bg-[rgba(10,14,20,0.45)] p-8 text-center shadow-[0_24px_56px_-36px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-10">
          <h2 id="premium-price-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Free to start. Helpful when you are ready for more.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Listen freely. Upgrade when you want a more permanent place to save, return, and stay with what matters.
          </p>
          <div className="mt-8">
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_pricing_teaser" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-line/90 px-7 py-3 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-line/55 bg-[rgba(7,10,16,0.55)] py-16 sm:py-20" aria-labelledby="premium-final-heading">
      <div className="container-shell text-center">
        <h2 id="premium-final-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
          Build a library that helps you grow.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-300/95">
          A calmer place to return to teaching, notes, and Scripture—without the scroll.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href={"/signup?next=/library" as Route}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[22px] bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_-12px_rgba(212,175,55,0.5)] transition hover:opacity-95"
          >
            {CTA.CREATE_FREE_ACCOUNT}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate-500">
          <FunnelLink
            href={"/join" as Route}
            funnelEvent="join_list_click"
            funnelData={{ placement: "home_footer" }}
            className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            Short updates. No spam.
          </FunnelLink>
          <span className="text-slate-600"> · </span>
          <span>Your email stays private.</span>
        </p>
      </div>
    </section>
  );
}

export function PremiumHome({
  plan,
  featuredShows,
  savedEpisodeSamples,
  worldWatchItems,
  episodeCount,
  showCount,
}: PremiumHomeProps) {
  const chipShows = featuredShows.slice(0, 24);
  const wwLead = worldWatchItems[0] ?? null;

  return (
    <>
      <PremiumHero
        savedEpisodeSamples={savedEpisodeSamples}
        featuredShows={featuredShows}
        worldWatchLead={wwLead}
      />
      <TrustBar episodeCount={episodeCount} showCount={showCount} />
      <RevealOnScroll>
        <ProblemSection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={40}>
        <HowItWorks />
      </RevealOnScroll>
      <RevealOnScroll delayMs={60}>
        <TrustedVoices shows={chipShows} />
      </RevealOnScroll>
      <RevealOnScroll delayMs={80}>
        <StartHerePaths />
      </RevealOnScroll>
      <RevealOnScroll delayMs={100}>
        <WorldWatchSection items={worldWatchItems} plan={plan} />
      </RevealOnScroll>
      <RevealOnScroll delayMs={120}>
        <LibrarySaveSection plan={plan} />
      </RevealOnScroll>
      <RevealOnScroll delayMs={140}>
        <CredibilitySection />
      </RevealOnScroll>
      <RevealOnScroll delayMs={160}>
        <PricingTeaser />
      </RevealOnScroll>
      <RevealOnScroll delayMs={180}>
        <FinalCta />
      </RevealOnScroll>
    </>
  );
}
