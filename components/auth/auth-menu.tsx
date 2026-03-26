import Link from "next/link";
import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/logout-button";
import type { UserPlan } from "@/lib/permissions";

const subtleLink =
  "rounded-full border border-line/80 px-3 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-white";

export function AuthMenu({ user, plan }: { user: User | null; plan: UserPlan }) {
  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <FunnelLink href={"/pricing" as Route} funnelEvent="view_plans_click" className={subtleLink}>
          Pricing
        </FunnelLink>
        <Link
          href="/login"
          className="rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
        >
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {plan === "premium" ? (
        <Link
          href={"/pricing" as Route}
          className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-amber-100/90 transition hover:border-accent/55 hover:bg-accent/15"
        >
          Premium
        </Link>
      ) : plan === "free" ? (
        <FunnelLink
          href={"/pricing" as Route}
          funnelEvent="view_plans_click"
          className="rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-xs font-semibold text-amber-100/90 transition hover:border-accent/50 hover:bg-accent/15"
        >
          Upgrade
        </FunnelLink>
      ) : null}
      <span className="hidden max-w-[10rem] truncate text-sm text-muted md:inline">{user.email}</span>
      <Link href="/library" className="text-sm text-amber-200 hover:text-white">
        Library
      </Link>
      <LogoutButton />
    </div>
  );
}
