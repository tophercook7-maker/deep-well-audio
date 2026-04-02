"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import type { FeatureKey } from "@/lib/permissions";
import { canUseFeature } from "@/lib/permissions";
import { useAccountPlanOptional } from "@/components/plan/plan-context";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

type Props = {
  feature: FeatureKey;
  children: ReactNode;
  /** Shown when plan cannot use feature */
  fallback?: ReactNode;
};

/**
 * Renders `children` when the current plan may use `feature`; otherwise `fallback` or a minimal locked prompt.
 */
export function PremiumFeatureGate({ feature, children, fallback }: Props) {
  const ctx = useAccountPlanOptional();
  const plan = ctx?.plan ?? "guest";
  const ok = canUseFeature(feature, plan);

  if (ok) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="rounded-2xl border border-dashed border-line/70 bg-soft/15 p-6 text-center">
      <Lock className="mx-auto h-8 w-8 text-amber-200/50" aria-hidden />
      <p className="mt-3 text-sm font-medium text-slate-200">Premium tool</p>
      <p className="mt-2 text-xs text-muted">Premium adds tools to stay with what you hear.</p>
      <PremiumUpgradeActions className="mt-5" />
    </div>
  );
}
