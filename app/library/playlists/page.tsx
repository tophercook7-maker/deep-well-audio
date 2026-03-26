import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { PremiumFeatureGate } from "@/components/premium/premium-feature-gate";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";
import { ListMusic } from "lucide-react";

export const metadata = {
  title: "Playlists · Library · Deep Well Audio",
};

export default function LibraryPlaylistsPage() {
  return (
    <main className="container-shell max-w-2xl space-y-8 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/library" label="Library" />
      </div>

      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
          <ListMusic className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Premium</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Study playlists</h1>
          <p className="mt-2 text-sm text-muted">
            Queue episodes in an order you choose—great for themes or long commutes.
          </p>
        </div>
      </header>

      <PremiumFeatureGate
        feature="playlists"
        fallback={
          <div className="card border-dashed border-line/70 p-8 text-center">
            <p className="text-sm font-medium text-slate-200">Playlists are a Premium feature</p>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted">
              Listening everywhere stays free. Upgrade when you want ordered study lists.
            </p>
            <PremiumUpgradeActions className="mt-5" />
          </div>
        }
      >
        <div className="card border-line/80 p-8 text-sm text-muted">
          <p className="font-medium text-slate-200">Coming soon</p>
          <p className="mt-2 leading-relaxed">
            Playlist editing will connect to your account here. For now, this page confirms your plan can access
            the feature.
          </p>
          <Link href={"/explore" as Route} className="mt-4 inline-block text-amber-200/90 hover:underline">
            Explore episodes →
          </Link>
        </div>
      </PremiumFeatureGate>
    </main>
  );
}
