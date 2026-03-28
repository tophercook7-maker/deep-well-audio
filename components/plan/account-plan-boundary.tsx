import { getUserPlan } from "@/lib/auth";
import { AccountPlanProvider } from "@/components/plan/plan-context";
import type { ReactNode } from "react";

export async function AccountPlanBoundary({ children }: { children: ReactNode }) {
  const plan = await getUserPlan();

  return <AccountPlanProvider initialPlan={plan}>{children}</AccountPlanProvider>;
}
