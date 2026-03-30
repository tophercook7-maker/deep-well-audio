import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { getCronSecret } from "@/lib/env";
import { ingestWorldWatchRssFeeds } from "@/lib/world-watch/ingest-rss";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
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
