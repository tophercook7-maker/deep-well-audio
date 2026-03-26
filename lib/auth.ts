import { createClient } from "@/lib/supabase/server";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import type { UserPlan } from "@/lib/permissions";

export async function getSessionUser() {
  try {
    const supabase = await createClient();
    if (!supabase) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("auth getSessionUser:", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Production tier for gating: guest (no session), free (signed in, not premium), or premium.
 * Missing or malformed `profiles` row → treat as free. Never throws for bad data.
 */
export async function getUserPlan(): Promise<UserPlan> {
  const user = await getSessionUser();
  if (!user) return "guest";

  try {
    const supabase = await createClient();
    if (!supabase) return "free";

    const { data, error } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();

    if (error) {
      console.error("getUserPlan:", error.message);
      return "free";
    }

    if (!data) return "free";

    const raw = typeof data.plan === "string" ? data.plan.trim().toLowerCase() : "";
    if (raw === "premium") return "premium";
    return "free";
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("getUserPlan:", e instanceof Error ? e.message : e);
    return "free";
  }
}

export type { UserPlan } from "@/lib/permissions";
