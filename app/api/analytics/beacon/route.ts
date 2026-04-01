import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { isConversionBeaconPage } from "@/lib/conversion-beacon";
import { hasServiceSupabaseEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Records a first-party page beacon (for /admin/metrics). Intentionally anonymous; no cookies.
 * Fails open: returns 204 even when storage is unavailable so the UI never breaks.
 */
export async function POST(req: Request) {
  let page: unknown;
  try {
    const body = (await req.json()) as { page?: unknown };
    page = body.page;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isConversionBeaconPage(page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  if (!hasServiceSupabaseEnv()) {
    return new NextResponse(null, { status: 204 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await admin.from("conversion_beacon_events").insert({ page });
  if (error) {
    console.warn("[analytics/beacon]", error.message);
  }
  return new NextResponse(null, { status: 204 });
}
