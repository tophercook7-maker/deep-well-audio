import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Globe, Headphones, Library, NotebookPen, Radar } from "lucide-react";
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

export const metadata = {
  title: "Your Home",
  description:
    "Your listening rhythm—continue where you left off, return to saved teaching, Scripture in the reader, notes, and World Watch.",
};

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

  const [favCount, growthStats] = await Promise.all([
    countUserFavoriteEpisodes(user.id),
    getUserLibraryGrowthStats(user.id),
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

  return (
    <main className="container-shell space-y-10 py-10 sm:space-y-14 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Premium</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your Home</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Where you return—listening, Scripture in the reader, notes, and World Watch in one calm rhythm.
        </p>
      </header>

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
      <RecentlyPlayedSection enabled={showSessionListening} />

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
