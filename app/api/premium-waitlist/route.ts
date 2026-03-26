import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { isNonProductionDeploy } from "@/lib/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUniqueViolation(err: { code?: string | null; message?: string | null; details?: string | null }): boolean {
  if (err.code === "23505") return true;
  const msg = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();
  return msg.includes("duplicate key") || msg.includes("unique constraint") || msg.includes("already exists");
}

function logWaitlistInsertError(err: {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}): void {
  console.error("[premium-waitlist] insert failed", {
    code: err.code ?? null,
    message: err.message ?? null,
    details: err.details ?? null,
    hint: err.hint ?? null,
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = typeof body === "object" && body !== null && "email" in body ? (body as { email: unknown }).email : null;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  const sourceRaw =
    typeof body === "object" && body !== null && "source" in body ? (body as { source: unknown }).source : null;
  const source = sourceRaw === "join_page" ? "join_page" : "pricing_notify";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = createServiceClient();
  if (!admin) {
    console.error("[premium-waitlist] createServiceClient returned null (check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL)");
    return NextResponse.json({ error: "Waitlist is not configured on the server." }, { status: 503 });
  }

  const { error } = await admin.from("premium_waitlist").insert({
    email,
    source,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    logWaitlistInsertError(error);

    const msg = (error.message ?? "").toLowerCase();
    const code = error.code ?? "";

    const schemaMismatch =
      msg.includes('column "source"') ||
      msg.includes("column source") ||
      (msg.includes("column") && msg.includes("does not exist"));

    if (schemaMismatch) {
      return NextResponse.json(
        {
          error: "Waitlist table is outdated. Re-run the latest Premium waitlist migration in Supabase (needs email, source, created_at).",
          ...(isNonProductionDeploy() ? { debugCode: code, debugMessage: error.message ?? null } : {}),
        },
        { status: 503 }
      );
    }

    if (
      msg.includes("does not exist") ||
      code === "42P01" ||
      (msg.includes("relation") && msg.includes("premium_waitlist"))
    ) {
      return NextResponse.json(
        {
          error: "The waitlist isn’t set up yet. Run the premium_waitlist migration in Supabase.",
          ...(isNonProductionDeploy() ? { debugCode: code } : {}),
        },
        { status: 503 }
      );
    }

    if (
      code === "42501" ||
      msg.includes("row-level security") ||
      msg.includes("permission denied") ||
      msg.includes("rls")
    ) {
      return NextResponse.json(
        {
          error:
            "Server can’t write to the waitlist. Confirm SUPABASE_SERVICE_ROLE_KEY is the service_role secret from Supabase Dashboard (not the anon key).",
          ...(isNonProductionDeploy() ? { debugCode: code } : {}),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Could not save your email right now.",
        ...(isNonProductionDeploy() ? { debugCode: code || null, debugMessage: error.message ?? null } : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
