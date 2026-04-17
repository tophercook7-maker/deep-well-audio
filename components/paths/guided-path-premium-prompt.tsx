import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { CTA } from "@/lib/site-messaging";

export function GuidedPathPremiumPrompt() {
  return (
    <p className="mt-4 max-w-md text-[10px] leading-snug text-slate-500/75">
      Premium helps you stay with this{" "}
      <FunnelLink
        href={"/pricing" as Route}
        funnelEvent="view_plans_click"
        funnelData={{ placement: "guided_path" }}
        className="whitespace-nowrap text-slate-400/85 underline decoration-white/10 underline-offset-[3px] transition hover:text-slate-300 hover:decoration-white/20"
      >
        {CTA.SEE_PREMIUM} →
      </FunnelLink>
    </p>
  );
}
