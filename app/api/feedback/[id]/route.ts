import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { isFeedbackAdminEmail } from "@/lib/env";
import { isFeedbackStatus, parseFeedbackRepliedAtIso } from "@/lib/feedback-shared";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let user;
  try {
    user = await getSessionUser();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    user = null;
  }

  const email = typeof user?.email === "string" ? user.email : null;
  if (!email || !isFeedbackAdminEmail(email)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const allowed = new Set(["status", "admin_note", "reply_sent", "replied_at"]);
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) {
      return NextResponse.json({ error: "Invalid fields in request." }, { status: 400 });
    }
  }

  const patch: Record<string, string | boolean | null> = {};
  if (body.status !== undefined) {
    if (!isFeedbackStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.admin_note !== undefined) {
    if (body.admin_note === null || body.admin_note === "") {
      patch.admin_note = null;
    } else if (typeof body.admin_note === "string") {
      const n = body.admin_note.replace(/\u0000/g, "").trim();
      if (n.length > 2000) {
        return NextResponse.json({ error: "Admin note too long." }, { status: 400 });
      }
      patch.admin_note = n.length ? n : null;
    } else {
      return NextResponse.json({ error: "Invalid admin note." }, { status: 400 });
    }
  }

  if (body.reply_sent !== undefined) {
    if (typeof body.reply_sent !== "boolean") {
      return NextResponse.json({ error: "Invalid reply_sent." }, { status: 400 });
    }
    patch.reply_sent = body.reply_sent;
    if (body.reply_sent) {
      patch.replied_at = parseFeedbackRepliedAtIso(body.replied_at) ?? new Date().toISOString();
    } else {
      patch.replied_at = null;
    }
  } else if (body.replied_at !== undefined) {
    if (body.replied_at === null) {
      patch.replied_at = null;
    } else {
      const iso = parseFeedbackRepliedAtIso(body.replied_at);
      if (!iso) {
        return NextResponse.json({ error: "Invalid replied_at." }, { status: 400 });
      }
      patch.replied_at = iso;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const { data, error } = await admin.from("site_feedback").update(patch as never).eq("id", id).select("id").maybeSingle();

  if (error) {
    console.error("[feedback:patch]", error.message);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
