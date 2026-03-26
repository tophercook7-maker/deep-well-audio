import Link from "next/link";
import type { Route } from "next";
import { Headphones, Heart, ListMusic, LockKeyhole, NotebookPen, UserRound } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getLibraryFavorites, getLibrarySavedShows } from "@/lib/queries";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { FavoritesList } from "@/components/library/favorites-list";
import { SavedShowsList } from "@/components/library/saved-shows-list";
import { BackButton } from "@/components/buttons/back-button";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";

export default async function LibraryPage() {
  const authConfigured = hasPublicSupabaseEnv();
  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    user = null;
  }

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

        <ContinueListeningSection />
        <RecentlyPlayedSection />

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
                  {authConfigured ? "Create account" : "Browse directory"}
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
  try {
    [favoriteRows, savedRows] = await Promise.all([getLibraryFavorites(user.id), getLibrarySavedShows(user.id)]);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page library lists:", e instanceof Error ? e.message : e);
  }

  return (
    <main className="container-shell space-y-12 py-12 sm:py-14">
      <div className="flex flex-col gap-4 border-b border-line/50 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <ContinueListeningSection />
      <RecentlyPlayedSection />

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
      </div>

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
