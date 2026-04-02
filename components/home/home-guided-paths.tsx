import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { HOME_GUIDED_PATH_ENTRIES } from "@/lib/home-guided-path-entries";

export function HomeGuidedPaths() {
  return (
    <section className="container-shell section-divider py-10 sm:py-12" aria-labelledby="home-guided-paths-heading">
      <div className="max-w-2xl">
        <h2 id="home-guided-paths-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Walk through something that matters
        </h2>
        <p className="mt-4 text-base leading-[1.65] text-slate-200/95">
          Start with a focused path instead of jumping between messages.
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_GUIDED_PATH_ENTRIES.map((item) => (
          <FunnelLink
            key={item.slug}
            href={`/paths/${item.slug}` as Route}
            funnelEvent="guided_path_click"
            funnelData={{ slug: item.slug }}
            className="group flex min-h-[3.25rem] items-center rounded-2xl border border-line/80 bg-[rgba(15,20,28,0.42)] px-4 py-3.5 no-underline outline-none transition duration-200 hover:border-accent/40 hover:bg-accent/[0.06] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <span className="font-medium text-white group-hover:text-amber-100/95">{item.label}</span>
          </FunnelLink>
        ))}
      </div>
    </section>
  );
}
