import { Globe } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchTeaser } from "@/components/world-watch/world-watch-teaser";
import { getUserPlan } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { canUseFeature } from "@/lib/permissions";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "World Watch",
  description:
    "Thoughtful context on faith and public life—calm, scripturally grounded member access on Deep Well Audio.",
};

export const dynamic = "force-dynamic";

export default async function WorldWatchPage() {
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const premium = canUseFeature("world_watch", plan);

  let worldWatchItems: Awaited<ReturnType<typeof fetchPublishedWorldWatchItems>> = [];
  if (premium) {
    const admin = createServiceClient();
    if (admin) {
      worldWatchItems = await fetchPublishedWorldWatchItems(admin);
    } else {
      console.warn("[world-watch] service role unavailable — premium feed empty");
    }
  }

  return (
    <main className="container-shell max-w-3xl space-y-12 py-12 sm:space-y-14 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Globe className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Premium</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">World Watch</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
            {premium ? (
              <>
                A quiet corner for you—reflective context on faith and public life, grounded in Scripture, with clarity instead of alarm. One steady
                place to read, pray, and return when the headlines feel loud.
              </>
            ) : (
              <>
                Reflective context on faith and public life—scripturally grounded and calm instead of loud. The full edition is{" "}
                <span className="text-slate-300">for Premium members</span>; below is a thoughtful preview of what&apos;s included and how to join
                when you&apos;re ready.
              </>
            )}
          </p>
        </div>
      </header>

      {premium ? <WorldWatchPremium items={worldWatchItems} /> : <WorldWatchTeaser />}
    </main>
  );
}
