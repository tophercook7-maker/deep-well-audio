import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { ingestWorldWatchRssFeeds } from "@/lib/world-watch/ingest-rss";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  // TEMP: allow manual ingest via ?manual=1
  const url = new URL(request.url);
  const allowManual = url.searchParams.get("manual") === "1";

  if (!allowManual) {
    const auth = request.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (!auth || auth !== expected) {
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
