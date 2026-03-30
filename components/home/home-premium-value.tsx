import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Globe } from "lucide-react";
import { FunnelLink } from "@/components/analytics/funnel-link";

const bullets: { text: string; icon: "check" | "globe" }[] = [
  { text: "Bookmarks at the moments you want to return to", icon: "check" },
  { text: "Notes beside episodes while you listen", icon: "check" },
  { text: "Guided topic packs on hubs with curated tracks", icon: "check" },
  { text: "Deeper filters and scoring on Explore", icon: "check" },
  { text: "World Watch — calm reads on faith and public life", icon: "globe" },
];

/**
 * Restrained Premium explanation for the homepage—not a hard sell.
 */
export function HomePremiumValue() {
  return (
    <section className="container-shell section-divider py-12 sm:py-14" aria-labelledby="home-premium-heading">
      <div className="card border-line/90 bg-gradient-to-br from-accent/[0.05] via-soft/15 to-transparent p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Premium</p>
            <h2 id="home-premium-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Same listening—optional depth when you want it
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-[1.65] text-muted sm:text-base">
              The catalog stays free to hear and browse. If you want structure—a way to hold onto what mattered, see clearer paths through hard
              topics, and read World Watch inside Deep Well—Premium adds that layer without another app or a louder feed.
            </p>
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
          <ul className="space-y-3.5 text-sm leading-snug text-slate-200/95">
            {bullets.map((row) => (
              <li key={row.text} className="flex gap-3">
                {row.icon === "globe" ? (
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                )}
                <span>{row.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
