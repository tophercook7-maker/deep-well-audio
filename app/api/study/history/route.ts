import { NextResponse } from "next/server";
import { requirePremiumSupabase, isPremiumRouteError } from "@/lib/premium-route";
import { STUDY_PREMIUM_UPGRADE } from "@/lib/study/copy";
import { isStudyTranslationId } from "@/lib/study/bible-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) {
    const status = gate.error.status;
    if (status === 403) {
      return NextResponse.json({ error: STUDY_PREMIUM_UPGRADE, code: "premium_required" }, { status: 403 });
    }
    return gate.error;
  }

  let body: { passage_ref?: string; translation_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const passageRef = typeof body.passage_ref === "string" ? body.passage_ref.trim().slice(0, 256) : "";
  const translationId =
    typeof body.translation_id === "string" && isStudyTranslationId(body.translation_id) ? body.translation_id : "web";

  if (!passageRef) {
    return NextResponse.json({ error: "passage_ref required" }, { status: 400 });
  }

  const { error } = await gate.supabase.from("study_history").insert({
    user_id: gate.user.id,
    passage_ref: passageRef,
    translation_id: translationId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
