"use client";

import type { ReactNode } from "react";
import { useAccountPlanOptional } from "@/components/plan/plan-context";

type Props = {
  children?: ReactNode;
  className?: string;
};

export function OpenUpgradeButton({ children = "Upgrade to Premium", className }: Props) {
  const ctx = useAccountPlanOptional();

  if (ctx?.plan === "premium") return null;

  return (
    <button
      type="button"
      onClick={() => ctx?.openUpgradeModal()}
      className={
        className ??
        "mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      }
    >
      {children}
    </button>
  );
}
