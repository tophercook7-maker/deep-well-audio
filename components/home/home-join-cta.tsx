import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import type { UserPlan } from "@/lib/permissions";
import { CTA } from "@/lib/site-messaging";
import { ArrowRight, Library } from "lucide-react";

export function HomeJoinCta({ plan }: { plan: UserPlan }) {
  if (plan === "premium") return null;

  return (
    <section
      className="container-shell section-divider py-9 sm:py-10"
      aria-labelledby="home-join-cta-heading"
    >
      <div className="card relative overflow-hidden border-accent/25 bg-gradient-to-br from-accent/[0.07] via-soft/12 to-bg/92 p-6 sm:p-8 shadow-[0_28px_64px_-40px_rgba(0,0,0,0.65)]">
        <div
          className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-accent/[0.07] blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Library</p>
            <h2 id="home-join-cta-heading" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Saved teaching, in one place
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
              {plan === "guest" ? (
                <>Create a free account to save favorites and programs.</>
              ) : (
                <>Premium adds tools to stay with what you hear.</>
              )}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            {plan === "guest" ? (
              <>
                <Link
                  href={"/signup?next=/library" as Route}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.45)] transition hover:opacity-90"
                >
                  {CTA.CREATE_FREE_ACCOUNT}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href={"/login?next=/library" as Route}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <FunnelLink
                href={"/pricing" as Route}
                funnelEvent="view_plans_click"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                {CTA.SEE_PREMIUM}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </FunnelLink>
            )}
            <Link
              href={"/library" as Route}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line/80 px-4 py-2.5 text-sm text-muted transition hover:border-accent/30 hover:text-white"
            >
              <Library className="h-4 w-4" aria-hidden />
              Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
