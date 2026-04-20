import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export type PremiumRouteOk = { supabase: SupabaseClient; user: User };

/**
 * Auth + Premium plan check for mutation APIs (bookmarks, notes).
 */
export async function requirePremiumSupabase(): Promise<PremiumRouteOk | { error: NextResponse }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Server misconfigured" }, { status: 503 }) };
  }

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }

  const plan = await getUserPlan();
  if (plan !== "premium") {
    return {
      error: NextResponse.json({ error: "Premium required", code: "premium_required" }, { status: 403 }),
    };
  }

  return { supabase, user };
}

export function isPremiumRouteError(
  x: PremiumRouteOk | { error: NextResponse }
): x is { error: NextResponse } {
  return "error" in x;
}

export type SignedInRouteOk = { supabase: SupabaseClient; user: User; plan: Awaited<ReturnType<typeof getUserPlan>> };

/**
 * Auth for routes that allow free + premium (e.g. curated library study tools).
 */
export async function requireSignedInSupabase(): Promise<SignedInRouteOk | { error: NextResponse }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Server misconfigured" }, { status: 503 }) };
  }

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }

  const plan = await getUserPlan();
  if (plan === "guest") {
    return { error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  }

  return { supabase, user, plan };
}

export function isSignedInRouteError(x: SignedInRouteOk | { error: NextResponse }): x is { error: NextResponse } {
  return "error" in x;
}

/** Signed-in premium only: curated saves, notes, and progress APIs (playback/embeds stay open to everyone). */
export async function requireCuratedLibraryRoute(): Promise<SignedInRouteOk | { error: NextResponse }> {
  const gate = await requireSignedInSupabase();
  if (isSignedInRouteError(gate)) return gate;
  if (!canUseFeature("curated_library", gate.plan)) {
    return {
      error: NextResponse.json(
        { error: "Curated saves and notes are part of Deep Well Premium.", code: "premium_required" },
        { status: 403 },
      ),
    };
  }
  return gate;
}
