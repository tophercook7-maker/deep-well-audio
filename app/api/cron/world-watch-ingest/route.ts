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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Service database client not configured" }, { status: 503 });
  }

  try {
    const result = await ingestWorldWatchRssFeeds(admin);
    const hasErrors = result.errors.length > 0;
    if (hasErrors) {
      console.warn("[world-watch-ingest] route partial errors", { count: result.errors.length });
    } else {
      console.info("[world-watch-ingest] route ok", { inserted: result.inserted, durationMs: result.durationMs });
    }
    return NextResponse.json({
      ok: true,
      hasErrors,
      feedsAttempted: result.feedsAttempted,
      itemsScanned: result.itemsScanned,
      inserted: result.inserted,
      skippedDuplicates: result.skippedDuplicates,
      errors: result.errors,
      durationMs: result.durationMs,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[world-watch-ingest] route fatal", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
