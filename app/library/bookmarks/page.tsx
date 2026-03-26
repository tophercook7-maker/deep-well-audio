import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { PremiumFeatureGate } from "@/components/premium/premium-feature-gate";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";
import { EpisodeRow } from "@/components/episode-row";
import { NotebookPen } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { getRecentBookmarkEpisodes } from "@/lib/bookmarks";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "Bookmarks · Library · Deep Well Audio",
};

export default async function LibraryBookmarksPage() {
  let userId: string | null = null;
  let recent: Awaited<ReturnType<typeof getRecentBookmarkEpisodes>> = [];
  try {
    const user = await getSessionUser();
    const plan = await getUserPlan();
    userId = user?.id ?? null;
    if (user && plan === "premium") {
      recent = await getRecentBookmarkEpisodes(user.id, 20);
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  return (
    <main className="container-shell max-w-2xl space-y-8 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/library" label="Library" />
      </div>

      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <NotebookPen className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Premium</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Bookmarks &amp; notes</h1>
          <p className="mt-2 text-sm text-muted">
            Save moments from the player, then manage timestamps and private notes on each episode page.
          </p>
        </div>
      </header>

      <PremiumFeatureGate
        feature="bookmarks"
        fallback={
          <div className="card border-dashed border-line/70 p-8 text-center">
            <p className="text-sm font-medium text-slate-200">Bookmarks &amp; notes are Premium</p>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted">
              Favorites stay on the free plan. Premium adds timestamps and private notes alongside listening.
            </p>
            <PremiumUpgradeActions className="mt-5" />
          </div>
        }
      >
        {userId ? (
          <div className="space-y-6">
            <p className="text-sm text-muted">
              Episodes below have at least one bookmark. Open one to see every timestamp, jump from the player when it&apos;s the active
              track, or add notes.
            </p>
            {recent.length === 0 ? (
              <div className="card border-line/80 p-8 text-center text-sm text-muted">
                No bookmarks yet. Start playing an episode and tap <span className="text-slate-200">Save this moment</span> in the bottom
                player.
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(({ episode: ep, bookmarkCount }) => (
                  <div key={ep.id} className="space-y-1">
                    <p className="text-xs text-amber-200/65">
                      {bookmarkCount} bookmark{bookmarkCount === 1 ? "" : "s"}
                    </p>
                    <EpisodeRow
                      episode={ep}
                      showSlug={ep.show?.slug}
                      showOfficialUrl={ep.show?.official_url}
                      showFavorite={false}
                    />
                  </div>
                ))}
              </div>
            )}
            <Link href={"/explore" as Route} className="inline-block text-sm font-medium text-amber-200/90 hover:underline">
              Explore more episodes →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted">Sign in to load your bookmarks.</p>
        )}
      </PremiumFeatureGate>
    </main>
  );
}
