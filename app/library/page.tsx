import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { CheckCircle2, Headphones, Heart, ListMusic, LockKeyhole, NotebookPen, Sparkles, UserRound } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { UpgradeCard } from "@/components/premium/upgrade-card";
import { getLibraryFavorites, getLibrarySavedShows } from "@/lib/queries";
import { getRecentBookmarkEpisodes } from "@/lib/bookmarks";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { FavoritesList } from "@/components/library/favorites-list";
import { SavedShowsList } from "@/components/library/saved-shows-list";
import { EpisodeRow } from "@/components/episode-row";
import { BackButton } from "@/components/buttons/back-button";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";
import { LibraryCheckoutSuccess } from "@/components/library/library-checkout-success";
import { FunnelLink } from "@/components/analytics/funnel-link";

export default async function LibraryPage() {
  const authConfigured = hasPublicSupabaseEnv();
  let user = null;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    [user, plan] = await Promise.all([getSessionUser(), getUserPlan()]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    user = null;
    plan = "guest";
  }
  const showSessionListening = canUseFeature("continue_listening", plan);

  const features = [
    { icon: Heart, title: "Favorites", text: "Episodes you want one tap away." },
    { icon: ListMusic, title: "Saved shows", text: "Series you follow week by week." },
    { icon: NotebookPen, title: "Notes", text: "Space reserved for reflections later." },
    { icon: UserRound, title: "Profile", text: "Your listening home stays with your account." },
  ];

  if (!user) {
    return (
      <main className="container-shell space-y-8 py-12 sm:py-14">
        <div className="border-b border-line/50 pb-5">
          <BackButton fallbackHref="/" label="Back" />
        </div>

        <Suspense fallback={null}>
          <LibraryCheckoutSuccess />
        </Suspense>

        {!authConfigured ? (
          <div className="card border-amber-400/25 bg-amber-500/5 p-5 text-sm leading-7 text-amber-100/90">
            <p className="font-medium text-white">Sign-in isn&apos;t connected yet</p>
            <p className="mt-2 text-muted">
              Your library will appear here once Supabase environment variables are set and the app is restarted. Everything else on the site
              stays available to read.
            </p>
          </div>
        ) : null}

        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <span className="tag">Library</span>
              <h1 className="mt-4 text-4xl font-semibold">Save what you want to hear again</h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Create a free account to favorite episodes and save whole programs. Your library stays in sync with this same dark, quiet
                layout—made for long listening sessions, not distraction.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={authConfigured ? ("/signup?next=/library" as Route) : ("/explore" as Route)}
                  className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950"
                >
                  {authConfigured ? "Create account" : "Explore"}
                </Link>
                {authConfigured ? (
                  <Link
                    href={"/login?next=/library" as Route}
                    className="inline-flex items-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-white"
                  >
                    Sign in
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-accent/25 bg-accent/10 p-6">
              <div className="flex items-center gap-3 text-amber-200">
                <LockKeyhole className="h-5 w-5" />
                <p className="font-medium">{authConfigured ? "Sign-in required" : "Setup required"}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Every page of the directory stays public. You only need an account when you want to keep personal lists.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </main>
    );
  }

  let favoriteRows: Awaited<ReturnType<typeof getLibraryFavorites>> = [];
  let savedRows: Awaited<ReturnType<typeof getLibrarySavedShows>> = [];
  let recentBookmarkEpisodes: Awaited<ReturnType<typeof getRecentBookmarkEpisodes>> = [];
  try {
    [favoriteRows, savedRows, recentBookmarkEpisodes] = await Promise.all([
      getLibraryFavorites(user.id),
      getLibrarySavedShows(user.id),
      plan === "premium" ? getRecentBookmarkEpisodes(user.id, 6) : Promise.resolve([]),
    ]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page library lists:", e instanceof Error ? e.message : e);
  }

  return (
    <main className="container-shell space-y-12 py-12 sm:py-14">
      <div className="flex flex-col gap-4 border-b border-line/50 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <Suspense fallback={null}>
        <LibraryCheckoutSuccess />
      </Suspense>

      <ContinueListeningSection enabled={showSessionListening} />
      <RecentlyPlayedSection enabled={showSessionListening} />

      {!authConfigured ? (
        <div className="card border-amber-400/25 bg-amber-500/5 p-5 text-sm text-amber-100/90">
          Saved items below may not update until Supabase is configured. If something looks wrong, check your environment and refresh.
        </div>
      ) : null}

      <div>
        <span className="tag">Signed in</span>
        <h1 className="mt-4 text-4xl font-semibold">Your library</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Favorites and saved shows stay here. Remove items from these cards or from individual show pages.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link
            href={"/library/playlists" as Route}
            className="rounded-full border border-line/85 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white"
          >
            Playlists
          </Link>
          <Link
            href={"/library/bookmarks" as Route}
            className="rounded-full border border-line/85 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white"
          >
            Bookmarks &amp; notes
          </Link>
          <FunnelLink
            href={"/pricing" as Route}
            funnelEvent="view_plans_click"
            className="rounded-full border border-accent/30 px-4 py-2 text-amber-100/85 transition hover:border-accent/45"
          >
            View plans
          </FunnelLink>
        </div>
      </div>

      {plan === "free" ? (
        <section className="space-y-4" aria-labelledby="library-upgrade-prompt">
          <div>
            <h2 id="library-upgrade-prompt" className="text-lg font-semibold text-white sm:text-xl">
              Want more control over your study?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Premium adds bookmarks for key moments, notes on episodes, structured topic packs, and advanced filters—only if you want that
              layer on top of listening.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <FunnelLink
                href={"/pricing" as Route}
                funnelEvent="view_plans_click"
                className="rounded-full border border-accent/35 px-4 py-2 font-medium text-amber-100/90 transition hover:border-accent/50"
              >
                View plans
              </FunnelLink>
              <FunnelLink
                href={"/join" as Route}
                funnelEvent="join_list_click"
                className="rounded-full border border-line/85 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white"
              >
                Join the Deep Well list
              </FunnelLink>
            </div>
          </div>
          <UpgradeCard showJoinLink={false} />
        </section>
      ) : null}

      {plan === "premium" ? (
        <section
          className="card border-accent/30 bg-accent/[0.04] p-6 sm:p-7"
          aria-labelledby="library-premium-state"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Premium</p>
              <h2 id="library-premium-state" className="mt-1 text-lg font-semibold text-white">
                Your study tools are unlocked
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Bookmarks, notes, topic packs, playlists, and advanced filters are included on your plan—same calm player, more structure when
                you need it.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Topic packs on each hub that has a curated track
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                  Meaty score and deeper filters on Explore
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  href={"/library/playlists" as Route}
                  className="rounded-full border border-line/85 px-4 py-2 text-amber-100/90 transition hover:border-accent/40"
                >
                  Playlists
                </Link>
                <Link
                  href={"/library/bookmarks" as Route}
                  className="rounded-full border border-line/85 px-4 py-2 text-amber-100/90 transition hover:border-accent/40"
                >
                  Bookmarks
                </Link>
                <FunnelLink
                  href={"/pricing" as Route}
                  funnelEvent="view_plans_click"
                  className="rounded-full border border-line/85 px-4 py-2 text-muted transition hover:border-accent/35 hover:text-white"
                >
                  View plans
                </FunnelLink>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {plan === "premium" && recentBookmarkEpisodes.length > 0 ? (
        <section className="space-y-4" aria-labelledby="library-recent-bookmarks-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/70">Premium</p>
              <h2 id="library-recent-bookmarks-heading" className="mt-1 text-xl font-semibold text-white">
                Recently bookmarked
              </h2>
              <p className="mt-1 text-sm text-muted">Open an episode to jump to saved times or add notes.</p>
            </div>
            <Link
              href={"/library/bookmarks" as Route}
              className="text-sm font-medium text-amber-200/85 hover:text-amber-100 hover:underline"
            >
              Bookmarks hub →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookmarkEpisodes.map(({ episode: ep }) => (
              <EpisodeRow
                key={ep.id}
                episode={ep}
                showSlug={ep.show?.slug}
                showOfficialUrl={ep.show?.official_url}
                showFavorite={false}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-semibold">Favorite episodes</h2>
        </div>
        <FavoritesList rows={favoriteRows as never} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Headphones className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-semibold">Saved shows</h2>
        </div>
        <SavedShowsList rows={savedRows as never} />
      </section>
    </main>
  );
}
