import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { getCronSecret } from "@/lib/env";
import { ingestWorldWatchRssFeeds } from "@/lib/world-watch/ingest-rss";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isLocalhostRequest(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host.trim());
}

export async function GET(request: Request) {
  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const allowManual = url.searchParams.get("manual") === "1";
  const manualOk =
    allowManual && (isLocalhostRequest(request) || process.env.NODE_ENV !== "production");

  if (!manualOk) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Service database client not configured" }, { status: 503 });
  }

  try {
    const result = await ingestWorldWatchRssFeeds(admin);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[world-watch-ingest]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
