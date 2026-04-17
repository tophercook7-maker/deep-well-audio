import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Sparkles } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { BackButton } from "@/components/buttons/back-button";
import { StudyDashboardSection } from "@/components/study/study-dashboard-section";
import { CTA } from "@/lib/site-messaging";
import { SignedInHabitBand } from "@/components/retention/signed-in-habit-band";
import { fetchWorldWatchTeaserForRetention } from "@/lib/world-watch/teaser-for-retention";
import { PremiumValueStrip } from "@/components/monetization/premium-value-strip";
import { LibraryBuildingUpsell } from "@/components/monetization/library-building-upsell";
import { PremiumLibraryPreviewStrip } from "@/components/monetization/premium-library-preview-strip";
import { countUserFavoriteEpisodes, getUserLibraryGrowthStats } from "@/lib/queries";
import { LibraryGrowingModule } from "@/components/retention/library-growing-module";

export const metadata = {
  title: "Library",
  description: "Your library of saved teaching, notes, and study—everything worth returning to in one place.",
};

export default async function LibraryPage() {
  const user = await getSessionUser();
  const plan = await getUserPlan();
  const [wwTeaser, favCount, growthStats] = await Promise.all([
    user ? fetchWorldWatchTeaserForRetention() : Promise.resolve(null),
    user ? countUserFavoriteEpisodes(user.id) : Promise.resolve(0),
    user && plan === "premium" ? getUserLibraryGrowthStats(user.id) : Promise.resolve(null),
  ]);

  return (
    <main className="container-shell space-y-10 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Library</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your library of what mattered</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Everything you&apos;ve saved, studied, and returned to—listening progress, bookmarks, notes, and Scripture in one calm hub.
        </p>
      </header>

      {user ? (
        <SignedInHabitBand
          plan={plan}
          worldWatchLatest={
            wwTeaser
              ? { id: wwTeaser.id, title: wwTeaser.title, slug: wwTeaser.slug, published_at: wwTeaser.published_at }
              : null
          }
          showContinueModule
          hidePickUpContinueRow
        />
      ) : null}

      {!user ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Continue listening</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sign in to resume episodes and build continuity across devices.
            </p>
            <Link
              href={"/login?next=/library" as Route}
              className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </div>
          <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Save teachings &amp; notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Premium keeps sermons, passages, and notes in one library so nothing that shaped you gets lost.
            </p>
            <Link
              href={"/pricing" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              {CTA.SEE_PREMIUM}
            </Link>
          </div>
          <div className="rounded-[22px] border border-dashed border-line/45 bg-[rgba(8,11,16,0.35)] p-8 md:col-span-2">
            <p className="text-sm leading-relaxed text-muted">
              New here?{" "}
              <Link href={"/signup?next=/library" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
                {CTA.CREATE_FREE_ACCOUNT}
              </Link>{" "}
              to sync saves when you&apos;re ready—or stay signed out and keep listening from Browse.
            </p>
          </div>
        </div>
      ) : plan !== "premium" ? (
        <div className="space-y-6">
          <PremiumValueStrip placement="library" savedTeachingCount={favCount} />
          <LibraryBuildingUpsell />
          <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Preview what Premium keeps</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              You&apos;re signed in. Upgrade to save teachings, keep notes across episodes and verses, follow topics, resume listening, and
              unlock the full World Watch digest—one library that lasts.
            </p>
            <Link
              href={"/pricing" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              {CTA.SEE_PREMIUM}
            </Link>
            <Link
              href={"/browse" as Route}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
            >
              {CTA.LISTEN_FREE}
            </Link>
          </div>
          <PremiumLibraryPreviewStrip />
          <div className="rounded-[22px] border border-line/40 bg-[rgba(8,11,16,0.3)] p-6">
            <p className="text-sm text-muted">
              <span className="font-medium text-slate-300/95">Bible Study</span> and basic reading stay open to everyone; your saved passages
              and synced notes unlock with Premium alongside this hub.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {growthStats ? (
            <div className="md:col-span-2">
              <LibraryGrowingModule stats={growthStats} />
            </div>
          ) : null}
          <div className="md:col-span-2">
            <PremiumValueStrip
              placement="library"
              savedTeachingCount={favCount}
              showPricingLink={false}
            />
          </div>
          <Link
            href={"/dashboard" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-accent/35"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Your Home</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Continue listening, notes, bookmarks, World Watch, and account tools—your rhythm in one place.
            </p>
            <span className="mt-5 text-sm font-medium text-amber-200/85 group-hover:underline">Open Your Home</span>
          </Link>

          <Link
            href={"/library#bible-study" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-sky-400/35"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/[0.1] text-sky-100">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Bible Study</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Saved Scripture and verse-linked notes from the reader.</p>
            <span className="mt-5 text-sm font-medium text-sky-200/85 group-hover:underline">Jump to Bible Study</span>
          </Link>

          <Link
            href={"/dashboard#notes" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-accent/35 md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-white">Bookmarks &amp; episode notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Tied to the teachings you saved—edit and revisit from Your Home.</p>
            <span className="mt-4 text-sm font-medium text-amber-200/85 group-hover:underline">Go to notes</span>
          </Link>

          <div className="md:col-span-2">
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Passages you save from Study appear below—the same private list as on{" "}
              <Link href={"/dashboard#saved-passages" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
                Your Home
              </Link>
              .
            </p>
            <StudyDashboardSection />
          </div>
        </div>
      )}
    </main>
  );
}
