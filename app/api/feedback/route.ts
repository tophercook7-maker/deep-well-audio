import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  isFeedbackCategory,
  sanitizeFeedbackMessage,
  sanitizeOptionalEmail,
  sanitizeOptionalUrl,
  sanitizeUserAgent,
} from "@/lib/feedback-shared";
import { createServiceClient } from "@/lib/db";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const category = body.category;
  if (!isFeedbackCategory(category)) {
    return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
  }

  const message = sanitizeFeedbackMessage(body.message);
  if (!message) {
    return NextResponse.json({ error: "Please enter a message (up to 8,000 characters)." }, { status: 400 });
  }

  const pageUrl = sanitizeOptionalUrl(body.page_url, 2048);
  const userAgent = sanitizeUserAgent(body.user_agent);

  let userId: string | null = null;
  let email: string | null = null;

  try {
    const user = await getSessionUser();
    if (user) {
      userId = user.id;
      email = typeof user.email === "string" ? user.email.trim().toLowerCase() || null : null;
    }
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const guestEmail = sanitizeOptionalEmail(body.email);
  if (!email && guestEmail) {
    email = guestEmail;
  }

  if (!userId && !email) {
    return NextResponse.json(
      { error: "Add an email so I can follow up if needed, or sign in—your choice." },
      { status: 400 }
    );
  }

  if (body.status !== undefined || body.admin_note !== undefined) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    console.error("[feedback] service client unavailable");
    return NextResponse.json({ error: "Feedback is not available right now. Please try again later." }, { status: 503 });
  }

  const { error } = await admin.from("site_feedback").insert({
    category,
    message,
    page_url: pageUrl,
    user_agent: userAgent,
    user_id: userId,
    email,
    status: "new",
  });

  if (error) {
    const code = error.code ?? "";
    const msg = (error.message ?? "").toLowerCase();
    if (code === "42P01" || (msg.includes("relation") && msg.includes("site_feedback"))) {
      console.error("[feedback] table missing — run site_feedback migration");
      return NextResponse.json({ error: "Feedback storage is not set up yet." }, { status: 503 });
    }
    console.error("[feedback] insert failed", error.message);
    return NextResponse.json({ error: "Could not save feedback. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
