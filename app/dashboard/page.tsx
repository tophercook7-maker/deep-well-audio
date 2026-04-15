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

export const metadata = {
  title: "Your Deep Well",
  description: "Saved teaching, notes, listening progress, and full World Watch for subscribers.",
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
    <main className="container-shell space-y-14 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Premium</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your personal Deep Well</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Continuity for your listening—saved teaching, notes, and the full World Watch feed in one calm place.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Dashboard sections">
        <a href="#library" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          My Library
        </a>
        <a href="#continue" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Continue listening
        </a>
        <a href="#notes" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Notes
        </a>
        <a href="#following" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Following
        </a>
        <a href="#world-watch" className="rounded-full border border-line/80 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white">
          Full World Watch
        </a>
      </nav>

      <section id="library" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Library className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">My Library</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Saved episodes and programs you want to return to.
            </p>
            <Link
              href={"/library" as Route}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
            >
              Open library
            </Link>
          </div>
        </div>
      </section>

      <div id="continue" className="scroll-mt-28">
        <ContinueListeningSection enabled={showSessionListening} />
      </div>
      <RecentlyPlayedSection enabled={showSessionListening} />
      <section id="notes" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <NotebookPen className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Notes</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Private notes stay attached to episodes you care about. Manage them alongside bookmarks from your library.
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

      <section id="following" className="scroll-mt-28 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Headphones className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Following</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Topic follows help you stay close to themes you&apos;re walking through. We&apos;re expanding this—use topic hubs on Browse for now.
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
        <div className="flex flex-wrap items-start gap-4 rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
            <Globe className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-white">Full World Watch</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              The complete digest—written context, Scripture, and a steadier read on public life.
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
              Latest from your feed
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {wwItems.slice(0, 4).map((item) => (
                <WorldWatchItemCard key={item.id} item={item} maxSummaryParagraphs={2} showReflection={false} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">New digest entries will show here when published.</p>
        )}
      </section>
    </main>
  );
}
