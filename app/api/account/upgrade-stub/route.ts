import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { allowStubPremiumUpgrade } from "@/lib/env";

/**
 * Temporary: sets `profiles.plan = 'premium'` for the signed-in user. Replace with Stripe webhooks later.
 */
export async function POST() {
  if (!allowStubPremiumUpgrade()) {
    return NextResponse.json({ error: "Stub upgrade is disabled in this environment." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const { error } = await supabase.from("profiles").update({ plan: "premium" }).eq("id", user.id);

  if (error) {
    console.error("upgrade-stub:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan: "premium" });
}
