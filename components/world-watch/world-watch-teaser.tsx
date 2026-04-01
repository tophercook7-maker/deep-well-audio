import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

/** Lead block: “Clarity without the noise” — reusable on /world-watch (mobile places this above the lens). */
export function WorldWatchTeaserLead({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "flex shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent",
          compact ? "h-9 w-9 sm:h-11 sm:w-11" : "h-11 w-11",
        ].join(" ")}
      >
        <Globe className={compact ? "h-[1.05rem] w-[1.05rem] sm:h-5 sm:w-5" : "h-5 w-5"} aria-hidden />
      </div>
      <div>
        <p
          className={[
            "font-semibold uppercase tracking-[0.28em] text-amber-200/75",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          ].join(" ")}
        >
          World Watch
        </p>
        <h2
          className={[
            "font-semibold text-white",
            compact ? "mt-0.5 text-lg sm:mt-1 sm:text-xl lg:text-2xl" : "mt-1 text-xl sm:text-2xl",
          ].join(" ")}
        >
          Read the moment with Scripture—not with panic
        </h2>
        <p
          className={[
            "max-w-prose leading-relaxed text-slate-400",
            compact
              ? "mt-2 line-clamp-4 text-[11px] sm:mt-3 sm:line-clamp-none sm:text-sm"
              : "mt-3 text-sm",
          ].join(" ")}
        >
          What happened, what God is saying through his Word about it, and what a steady Christian does next—not performance, not despair. The full
          written digest is <span className="text-slate-300">Premium only</span>: slow where it should be slow, blunt where spin has to break.
        </p>
      </div>
    </div>
  );
}

export function WorldWatchTeaserDetails({
  tight = false,
  /** Mobile stack below Video Lens: tighter list; third bullet from `md` up. */
  condense = false,
}: {
  tight?: boolean;
  condense?: boolean;
}) {
  const listMargin = condense ? "mt-3 pt-3" : tight ? "mt-4 pt-4 sm:mt-6 sm:pt-6" : "mt-6 pt-6";

  return (
    <>
      <ul
        className={[
          "border-t border-line/50 text-slate-300/95",
          listMargin,
          condense
            ? "space-y-2 text-xs leading-snug sm:space-y-3 sm:text-sm sm:leading-[1.65]"
            : "space-y-3 text-sm leading-[1.65]",
        ].join(" ")}
      >
        <li className="flex gap-2 sm:gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
          <span>Truth about what happened—and what love, truth, and prayer demand of you now.</span>
        </li>
        <li className="flex gap-2 sm:gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
          <span>Links chosen to inform, not enrage; read, then think, then act like a Christian.</span>
        </li>
        <li className={condense ? "hidden gap-2 sm:gap-2.5 md:flex" : "flex gap-2.5"}>
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
          <span>Carry the week with the same seriousness you bring to the pulpit in your earbuds.</span>
        </li>
      </ul>
      <p
        className={
          condense
            ? "mt-3 max-w-prose text-[11px] leading-relaxed text-slate-400 sm:mt-5 sm:text-xs"
            : "mt-4 max-w-prose text-xs leading-relaxed text-slate-400 sm:mt-5"
        }
      >
        Something missing or unclear?{" "}
        <Link href={"/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline">
          Send feedback
        </Link>
        —we read every note.
      </p>
    </>
  );
}

export function WorldWatchTeaserUpgrade({ tight = false, condense = false }: { tight?: boolean; condense?: boolean }) {
  return (
    <section
      className={[
        "card border-accent/25 bg-gradient-to-br from-accent/[0.06] via-soft/15 to-transparent",
        tight ? "p-4 sm:p-8" : "p-6 sm:p-8",
        condense ? "max-md:rounded-xl max-md:p-3.5" : "",
      ].join(" ")}
      aria-labelledby="ww-upgrade-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Member access</p>
      <h2
        id="ww-upgrade-heading"
        className={condense ? "mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-xl" : "mt-2 text-lg font-semibold text-white sm:text-xl"}
      >
        Premium is not extra content—it is a straighter mind
      </h2>
      <p className={condense ? "mt-2 max-w-prose text-xs leading-relaxed text-slate-400 sm:mt-3 sm:text-sm" : "mt-3 max-w-prose text-sm leading-relaxed text-slate-400"}>
        Full World Watch written briefings, every lens clip, bookmarks, notes, guided topic paths, and filters that reward discernment—not one more
        subscription bolted on the side. One account. One commitment: teaching and news that do not make a fool of your conscience.{" "}
        <FunnelLink
          href={"/pricing" as Route}
          funnelEvent="view_plans_click"
          funnelData={{ placement: "world_watch_teaser_body" }}
          className="font-medium text-amber-200/90 underline-offset-2 hover:text-amber-100 hover:underline"
        >
          View plans
        </FunnelLink>{" "}
        when you&apos;re ready.
      </p>
      <PremiumUpgradeActions
        className={condense ? "mt-4 sm:mt-6" : "mt-5 sm:mt-6"}
        align="start"
        showJoinLink={false}
        analyticsPlacement="world_watch_teaser"
      />
      <p className={condense ? "mt-3 max-w-prose text-[11px] leading-relaxed text-slate-400 sm:mt-5 sm:text-xs" : "mt-4 max-w-prose text-xs leading-relaxed text-slate-400 sm:mt-5"}>
        Cancel anytime through Stripe—billing links are in your Stripe receipts, or contact us if you need a hand.
      </p>
    </section>
  );
}

/**
 * Shown to guests and free accounts. PremiumUpgradeActions already links to checkout and /pricing#subscribe.
 * For a slimmer mobile /world-watch layout, use `WorldWatchTeaserLead` + `WorldWatchMemberStudyCue` earlier on the page and pass `omitLead`.
 */
export function WorldWatchTeaser({ omitLead = false }: { omitLead?: boolean }) {
  return (
    <div className={omitLead ? "space-y-4 sm:space-y-10 lg:space-y-12" : "space-y-8 sm:space-y-10 lg:space-y-12"}>
      {!omitLead ? (
        <section className="card border-line/80 p-6 sm:p-8">
          <WorldWatchTeaserLead />
          <WorldWatchTeaserDetails />
        </section>
      ) : (
        <section className="card border-line/80 p-3.5 sm:p-8 max-md:rounded-xl">
          <WorldWatchTeaserDetails tight condense />
        </section>
      )}

      <WorldWatchTeaserUpgrade tight={omitLead} condense={omitLead} />
    </div>
  );
}
