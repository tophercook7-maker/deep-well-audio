import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";

function BulletList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={["space-y-2.5 text-sm leading-relaxed text-slate-200", className].filter(Boolean).join(" ")}>
      {items.map((text) => (
        <li key={text} className="flex gap-2.5">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

export function WorldWatchTeaserWhatThisIs({ condense = false }: { condense?: boolean }) {
  return (
    <section className="card border-line/65 p-5 sm:p-8" aria-labelledby="ww-what-heading">
      <h2 id="ww-what-heading" className="text-lg font-semibold text-white sm:text-xl">
        What this is
      </h2>
      <BulletList
        className={condense ? "mt-4 text-xs sm:text-sm" : "mt-4"}
        items={[
          "A weekly way to step back from the noise",
          "A place to think before reacting",
          "A steady voice when everything else is loud",
        ]}
      />
    </section>
  );
}

export function WorldWatchTeaserWhatItsNot({ condense = false }: { condense?: boolean }) {
  return (
    <section className="card border-line/65 p-5 sm:p-8" aria-labelledby="ww-not-heading">
      <h2 id="ww-not-heading" className="text-lg font-semibold text-white sm:text-xl">
        What it&apos;s not
      </h2>
      <BulletList
        className={condense ? "mt-4 text-xs sm:text-sm" : "mt-4"}
        items={["Not breaking news", "Not commentary for its own sake", "Not built to keep you scrolling"]}
      />
    </section>
  );
}

export function WorldWatchTeaserUpgrade({ tight = false, condense = false }: { tight?: boolean; condense?: boolean }) {
  return (
    <section
      className={[
        "card border-accent/25 bg-gradient-to-br from-accent/[0.06] via-soft/15 to-transparent",
        tight ? "p-4 sm:p-8" : "p-5 sm:p-8",
        condense ? "max-md:rounded-xl max-md:p-4" : "",
      ].filter(Boolean).join(" ")}
      aria-labelledby="ww-upgrade-heading"
    >
      <h2
        id="ww-upgrade-heading"
        className={condense ? "text-base font-semibold text-white sm:text-xl" : "text-lg font-semibold text-white sm:text-xl"}
      >
        Member access
      </h2>
      <p className={condense ? "mt-2 max-w-prose text-xs leading-relaxed text-slate-300/95 sm:mt-3 sm:text-sm" : "mt-3 max-w-prose text-sm leading-relaxed text-slate-300/95"}>
        The public view shows a portion.
      </p>
      <p className={condense ? "mt-3 text-xs text-slate-300/95 sm:text-sm" : "mt-3 text-sm text-slate-300/95"}>
        Members get the full digest for each story:
      </p>
      <BulletList
        className={condense ? "mt-3 text-xs sm:text-sm" : "mt-4"}
        items={[
          "Clear written summaries",
          "Scripture tied directly to the moment",
          "Notes to help you think, not react",
          "Takeaways you can carry into real life",
        ]}
      />
      <FunnelLink
        href={"/pricing" as Route}
        funnelEvent="view_plans_click"
        funnelData={{ placement: "world_watch_teaser_body" }}
        className={
          condense
            ? "mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            : "mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        }
      >
        View plans
      </FunnelLink>
      <p className={condense ? "mt-4 max-w-prose text-[11px] leading-relaxed text-slate-400/95 sm:mt-5 sm:text-xs" : "mt-5 max-w-prose text-xs leading-relaxed text-slate-400/95"}>
        Cancel anytime through Stripe—billing links are in your Stripe receipts, or contact us if you need a hand.
      </p>
    </section>
  );
}

export function WorldWatchTeaser({ omitLead = false }: { omitLead?: boolean }) {
  const condense = omitLead;
  return (
    <div className={omitLead ? "space-y-4 sm:space-y-8 lg:space-y-10" : "space-y-6 sm:space-y-8 lg:space-y-10"}>
      <WorldWatchTeaserWhatThisIs condense={condense} />
      <WorldWatchTeaserWhatItsNot condense={condense} />
      <WorldWatchTeaserUpgrade tight={omitLead} condense={omitLead} />
    </div>
  );
}
