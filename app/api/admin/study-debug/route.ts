import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { fetchStudyDebugSnapshot } from "@/lib/admin/study-debug-data";
import { isFeedbackAdminEmail } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.email || !isFeedbackAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const result = await fetchStudyDebugSnapshot(admin);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
