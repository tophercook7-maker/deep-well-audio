import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";

/**
 * Calm Premium note on the homepage.
 */
export function HomePremiumValue() {
  return (
    <section className="container-shell section-divider py-12 sm:py-14" aria-labelledby="home-premium-heading">
      <div className="card border-line/90 bg-gradient-to-br from-accent/[0.05] via-soft/15 to-transparent p-8 sm:p-10">
        <div className="max-w-2xl">
          <h2 id="home-premium-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Premium adds tools to stay with what you hear.
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/55 hover:bg-accent/[0.14]"
            >
              View plans
            </FunnelLink>
            <Link
              href={"/world-watch" as Route}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/85 px-5 py-2.5 text-sm text-muted transition hover:border-accent/35 hover:text-white"
            >
              Open World Watch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
