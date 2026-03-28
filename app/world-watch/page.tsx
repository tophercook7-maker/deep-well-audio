import { Globe } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchTeaser } from "@/components/world-watch/world-watch-teaser";
import { getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "World Watch",
  description: "A weekly briefing on faith and the public square for Deep Well Premium members.",
};

export default async function WorldWatchPage() {
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const premium = canUseFeature("world_watch", plan);

  return (
    <main className="container-shell max-w-3xl space-y-10 py-12 sm:py-16">
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
            Calm context on faith and the world—written for listeners who already care about serious Bible teaching and want{" "}
            <span className="text-slate-300">one steady briefing</span> instead of another noisy timeline.
          </p>
        </div>
      </header>

      {premium ? <WorldWatchPremium /> : <WorldWatchTeaser />}
    </main>
  );
}
