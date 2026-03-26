"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserPlan } from "@/lib/permissions";
import { UpgradeModal } from "@/components/premium/upgrade-modal";

export type AccountPlanContextValue = {
  plan: UserPlan;
  openUpgradeModal: () => void;
};

const PlanContext = createContext<AccountPlanContextValue | null>(null);

export function useAccountPlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("useAccountPlan must be used within AccountPlanProvider");
  return ctx;
}

export function useAccountPlanOptional() {
  return useContext(PlanContext);
}

export function AccountPlanProvider({ initialPlan, children }: { initialPlan: UserPlan; children: ReactNode }) {
  const [plan, setPlan] = useState<UserPlan>(initialPlan);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  const openUpgradeModal = useCallback(() => setUpgradeOpen(true), []);

  const value = useMemo(
    () => ({
      plan,
      openUpgradeModal,
    }),
    [plan, openUpgradeModal]
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </PlanContext.Provider>
  );
}
