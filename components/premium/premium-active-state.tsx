"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";

const btnNav =
  "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45";

type Props = {
  className?: string;
  align?: "center" | "start";
};

/**
 * Shown when `profiles.plan` is premium: no subscribe CTAs, calm confirmation + navigation.
 */
export function PremiumActiveState({ className = "", align = "center" }: Props) {
  const justify = align === "center" ? "justify-center" : "justify-start";
  const blockAlign = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={className.trim()}>
      <h2 className={`text-xl font-semibold text-white sm:text-2xl ${blockAlign} max-w-lg`}>You&apos;re Premium</h2>
      <p className={`mt-2 text-sm font-medium text-slate-200 ${blockAlign} max-w-lg`}>Premium is active on this account.</p>
      <p className={`mt-2 text-sm leading-relaxed text-muted ${blockAlign} max-w-prose`}>
        World Watch and study tools are already unlocked.
      </p>

      <div className={`mt-6 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap ${justify}`}>
        <FunnelLink
          href={"/world-watch" as Route}
          funnelEvent="premium_feature_click"
          funnelData={{ intent: "premium_nav", target: "world_watch" }}
          className={btnNav}
        >
          World Watch
        </FunnelLink>
        <FunnelLink
          href={"/library" as Route}
          funnelEvent="premium_feature_click"
          funnelData={{ intent: "premium_nav", target: "library" }}
          className={btnNav}
        >
          Library
        </FunnelLink>
        <FunnelLink
          href={"/explore" as Route}
          funnelEvent="premium_feature_click"
          funnelData={{ intent: "premium_nav", target: "explore" }}
          className={btnNav}
        >
          Explore catalog
        </FunnelLink>
      </div>

      <p className={`mt-5 text-xs leading-relaxed text-slate-400 ${blockAlign} max-w-lg`}>
        Need billing help? Use the link in your Stripe receipt or contact us.
      </p>
    </div>
  );
}
