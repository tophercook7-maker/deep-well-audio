import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { CTA } from "@/lib/site-messaging";
import { DEFAULT_TOPIC_HUB_CTA_HEADING, DEFAULT_TOPIC_HUB_CTA_SUPPORT } from "@/lib/topics";

type Props = {
  heading?: string;
  supportLine?: string;
  showPremiumLink?: boolean;
};

export function TopicSeoCta({
  heading = DEFAULT_TOPIC_HUB_CTA_HEADING,
  supportLine,
  showPremiumLink = true,
}: Props) {
  const body = supportLine?.trim() || DEFAULT_TOPIC_HUB_CTA_SUPPORT;

  return (
    <section
      className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.45)] p-6 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8"
      aria-labelledby="topic-seo-cta-heading"
    >
      <h2 id="topic-seo-cta-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {heading}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400/95">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={"/browse" as Route}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
        >
          {CTA.LISTEN_FREE}
        </Link>
        {showPremiumLink ? (
          <FunnelLink
            href={"/pricing" as Route}
            funnelEvent="view_plans_click"
            funnelData={{ placement: "topic_hub_footer" }}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
          >
            {CTA.SEE_PREMIUM}
          </FunnelLink>
        ) : null}
      </div>
      {showPremiumLink ? (
        <p className="mt-4 text-xs text-slate-500">
          Premium helps you keep favorites, notes, Scripture, listens, rewatches, and study in one calm library—optional, not required for free Browse.
        </p>
      ) : null}
    </section>
  );
}
