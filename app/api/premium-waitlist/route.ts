import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = typeof body === "object" && body !== null && "email" in body ? (body as { email: unknown }).email : null;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Waitlist is not configured on the server." }, { status: 503 });
  }

  const { error } = await admin.from("premium_waitlist").insert({
    email,
    source: "pricing_notify",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("premium-waitlist:", error.message);
    return NextResponse.json({ error: "Could not save your email right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
