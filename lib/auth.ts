import { createClient } from "@/lib/supabase/server";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

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
