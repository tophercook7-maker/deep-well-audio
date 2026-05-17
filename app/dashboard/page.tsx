import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { BookOpen, CalendarDays, Compass, Globe, Headphones, Library, NotebookPen, Radar, Sparkles } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { BackButton } from "@/components/buttons/back-button";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";
import { canUseFeature } from "@/lib/permissions";
import { createServiceClient } from "@/lib/db";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import { WorldWatchItemCard } from "@/components/world-watch/world-watch-item-card";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { StudyDashboardSection } from "@/components/study/study-dashboard-section";
import { SignedInHabitBand } from "@/components/retention/signed-in-habit-band";
import { PremiumValueStrip } from "@/components/monetization/premium-value-strip";
import { LibraryBuildingMilestone } from "@/components/monetization/library-building-milestone";
import { countUserFavoriteEpisodes, getUserLibraryGrowthStats } from "@/lib/queries";
import { LibraryGrowingModule } from "@/components/retention/library-growing-module";
import { ReturnToThisModule } from "@/components/retention/return-to-this-module";
import { getRecentSavedMoments } from "@/lib/bookmarks";

export const metadata = {
  title: "Your Home",
  description:
    "Your listening rhythm—continue where you left off, return to saved teaching, Scripture in the reader, notes, and World Watch.",
};

function firstNameFromEmail(email: string | undefined | null) {
  if (!email) return "friend";
  const name = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!name) return "friend";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMomentTime(seconds: number) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function normalizeTheme(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return text
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function deriveThemes(moments: Awaited<ReturnType<typeof getRecentSavedMoments>>) {
  const counts = new Map<string, number>();
  for (const moment of moments) {
    const direct = normalizeTheme(moment.topic);
    if (direct) {
      counts.set(direct, (counts.get(direct) ?? 0) + 2);
      continue;
    }

    const haystack = `${moment.label ?? ""} ${moment.quote ?? ""} ${moment.note ?? ""} ${moment.episode.title ?? ""}`.toLowerCase();
    const inferred = [
      ["Peace", /peace|anx|fear|worry|rest/],
      ["Prayer", /pray|prayer|intercede|ask/],
      ["Faith", /faith|trust|believe|doubt/],
      ["Purpose", /purpose|calling|mission|work/],
      ["Grace", /grace|mercy|forgive|forgiveness/],
      ["Waiting", /wait|waiting|patience|delay/],
      ["Courage", /courage|bold|strength|stand/],
    ] as const;

    for (const [theme, pattern] of inferred) {
      if (pattern.test(haystack)) counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([theme, count]) => ({ theme, count }));
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const plan = await getUserPlan();
  if (plan !== "premium") {
    redirect("/pricing?intent=subscriber");
  }

  const showSessionListening = canUseFeature("continue_listening", plan);

  const [favCount, growthStats, savedMoments] = await Promise.all([
    countUserFavoriteEpisodes(user.id),
    getUserLibraryGrowthStats(user.id),
    getRecentSavedMoments(user.id, 8),
  ]);

  let wwItems: Awaited<ReturnType<typeof fetchPublishedWorldWatchItems>> = [];
  try {
    const admin = createServiceClient();
    if (admin) {
      wwItems = await fetchPublishedWorldWatchItems(admin, 6, { audience: "premium" });
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("dashboard world watch:", e instanceof Error ? e.message : e);
  }

  const displayName = firstNameFromEmail(user.email);
  const latestWorldWatch = wwItems[0] ?? null;
  const themes = deriveThemes(savedMoments);
  const featuredMoment = savedMoments[0] ?? null;

  return (
    <main className="container-shell space-y-10 py-10 sm:space-y-14 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <section className="relative overflow-hidden rounded-[30px] border border-accent/20 bg-gradient-to-br from-[rgba(24,32,48,0.72)] via-[rgba(10,14,22,0.58)] to-[rgba(7,10,16,0.82)] p-6 shadow-[0_30px_78px_-48px_rgba(212,175,55,0.32)] backdrop-blur-md sm:p-8 lg:p-10" aria-labelledby="dashboard-welcome-heading">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/[0.08] blur-3xl" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100/85">
              Welcome back
            </p>
            <h1 id="dashboard-welcome-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {displayName}, your Deep Well is ready.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300/95">
              Pick up where life interrupted, return to what you saved, and keep this week&apos;s study rhythm from scattering.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#continue"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
              >
                Continue listening
              </a>
              <a
                href="#library"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                Open your library
              </a>
            </div>
          </div>

          <div className="rounded-[24px] border border-line/55 bg-[rgba(7,10,16,0.46)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4 text-amber-200/85" aria-hidden />
              This week in your Deep Well
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-line/45 bg-[rgba(5,8,14,0.42)] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Saved</p>
                <p className="mt-1 text-sm font-semibold text-white">{favCount.toLocaleString()} teachings</p>
              </div>
              <div className="rounded-2xl border border-line/45 bg-[rgba(5,8,14,0.42)] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Moments</p>
                <p className="mt-1 text-sm font-semibold text-white">{savedMoments.length ? `${savedMoments.length} recent` : "Ready"}</p>
              </div>
              <div className="rounded-2xl border border-line/45 bg-[rgba(5,8,14,0.42)] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">World Watch</p>
                <p className="mt-1 text-sm font-semibold text-white">{latestWorldWatch ? "New digest" : "Quiet for now"}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              This is the beginning of your weekly recap: listening, saved teaching, Scripture, notes, and current events in one calm rhythm.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]" aria-labelledby="themes-heading">
        <div className="rounded-[24px] border border-accent/20 bg-[rgba(10,14,20,0.5)] p-6 shadow-[0_24px_58px_-40px_rgba(212,175,55,0.3)] backdrop-blur-md sm:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="h-4 w-4 text-amber-200/85" aria-hidden />
            <span id="themes-heading">Themes you&apos;re returning to</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400/95">
            Deep Well is beginning to notice what you keep saving, revisiting, and carrying forward.
          </p>
          {themes.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {themes.map((item) => (
                <span key={item.theme} className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100/85">
                  {item.theme} · {item.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-line/45 bg-[rgba(8,11,16,0.35)] p-4 text-sm leading-relaxed text-muted">
              Save moments while listening and this space will start surfacing the themes that keep showing up.
            </p>
          )}
        </div>

        <div className="rounded-[24px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_20px_48px_-34px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-amber-200/85" aria-hidden />
            Moment worth revisiting
          </div>
          {featuredMoment ? (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {formatMomentTime(featuredMoment.seconds)} · {featuredMoment.episode.show?.title ?? "Saved teaching"}
              </p>
              <h3 className="mt-2 text-base font-semibold text-white">{featuredMoment.episode.title}</h3>
              {featuredMoment.quote || featuredMoment.label ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-300/95">“{featuredMoment.quote ?? featuredMoment.label}”</p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-400/95">
                  You saved this timestamp. Add a note later to remember why it mattered.
                </p>
              )}
              {featuredMoment.scripture_ref || featuredMoment.topic ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredMoment.scripture_ref ? <span className="rounded-full border border-line/55 px-3 py-1 text-xs text-slate-300">{featuredMoment.scripture_ref}</span> : null}
                  {featuredMoment.topic ? <span className="rounded-full border border-line/55 px-3 py-1 text-xs text-slate-300">{featuredMoment.topic}</span> : null}
                </div>
              ) : null}
              <Link
                href={`/episodes/${featuredMoment.episode.id}` as Route}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                Return to this moment
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              When you save a timestamp from the player, Deep Well will bring one back here so it doesn&apos;t disappear.
            </p>
          )}
        </div>
      </section>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Your Home sections">
        <a href="#continue" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Continue listening
        </a>
        <a href="#recent" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Recently played
        </a>
        <a href="#library" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Your Library
        </a>
        <a href="#bible-study" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Saved Scripture
        </a>
        <a href="#notes" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Bookmarks &amp; notes
        </a>
        <a href="#following" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Following
        </a>
        <a href="#world-watch" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          World Watch
        </a>
      </nav>

      <div className="space-y-4">
        <PremiumValueStrip placement="dashboard" savedTeachingCount={favCount} showPricingLink={false} />
        <LibraryBuildingMilestone savedCount={favCount} />
        <LibraryGrowingModule stats={growthStats} />
        <ReturnToThisModule />
      </div>

      <div id="continue" className="scroll-mt-28">
        <ContinueListeningSection enabled={showSessionListening} />
      </div>
      <div id="recent" className="scroll-mt-28">
        <RecentlyPlayedSection enabled={showSessionListening} />
      </div>

      <SignedInHabitBand
        plan={plan}
        worldWatchLatest={null}
        showContinueModule={false}
        hidePickUpContinueRow
        omitActivityStrip
        omitWorldWatchNudge
      />

      <section id="library" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Library className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">Library</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Your Library</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Saved episodes and programs you want to return to—same collection as the Library page.
            </p>
            <Link
              href={"/library" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              Open Your Library
            </Link>
          </div>
        </div>
      </section>

      <StudyDashboardSection />

      <section id="notes" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8">
        <div className="mb-6">
          <PremiumValueStrip placement="notes" showPricingLink={false} />
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <NotebookPen className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">Notes</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Your notes</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300/95">A record of what stood out to you.</p>
            <p className="mt-2 max-w-xl text-xs text-slate-500">This is where your growth becomes visible.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Episode notes stay with the teachings you saved. Review and edit them alongside bookmarks in Your Library.
            </p>
            <Link
              href={"/library/bookmarks" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              Bookmarks &amp; notes
            </Link>
          </div>
        </div>
      </section>

      <section id="following" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Headphones className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">Browse</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Following</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Topic follows keep themes you care about close. We&apos;re expanding this—use topic hubs on Browse in the meantime.
            </p>
            <Link
              href={"/browse" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              Browse topics
            </Link>
          </div>
        </div>
      </section>

      <section id="world-watch" className="scroll-mt-28 space-y-6">
        <div className="flex flex-wrap items-start gap-4 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Globe className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/65">World Watch</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Digest &amp; feed</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Full written context, biblical framing, and a steadier read on public life—beyond the homepage snapshot.
            </p>
            <Link
              href={"/world-watch" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              Open World Watch
            </Link>
          </div>
        </div>

        {wwItems.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Radar className="h-4 w-4 text-rose-200/70" aria-hidden />
              Latest in World Watch
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {wwItems.slice(0, 4).map((item) => (
                <WorldWatchItemCard key={item.id} item={item} maxSummaryParagraphs={2} showReflection={false} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line/45 bg-[rgba(8,11,16,0.35)] p-6 text-sm leading-relaxed text-muted">
            <p className="font-medium text-slate-300/95">No new digest items yet</p>
            <p className="mt-2">
              When editors publish, the latest World Watch entries will appear here so you can read without leaving Your Home.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
