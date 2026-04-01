import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import type { UserPlan } from "@/lib/permissions";
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
              {plan === "guest" ? "Join the Deep Well Library" : "Go deeper when you’re ready"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
              {plan === "guest" ? (
                <>
                  Join to unlock deeper access to the library, expanded World Watch content, and a more personalized experience.{" "}
                  <span className="text-slate-300">Premium</span> adds written World Watch digests, bookmarks, notes, and richer study tools
                  when you want that layer.
                </>
              ) : (
                <>
                  You&apos;re signed in. Upgrade when you want the full{" "}
                  <span className="text-slate-300">World Watch</span> digest, bookmarks, and notes—we&apos;ll keep the tone steady and
                  content-first.
                </>
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
                  Join free
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
                View Premium
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
