import { NextResponse } from "next/server";
import { runSyncAllWithServiceClient } from "@/lib/ingest/sync-all";
import { getCronSecret } from "@/lib/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Scheduled catalog sync (Vercel Cron). Same logic as POST `/api/sync/all`, authenticated with `CRON_SECRET`.
 * Updates `shows` + `episodes` from `data/source-feeds.ts` (RSS sermons/podcasts + catalog YouTube when API key is set).
 */
export async function GET(request: Request) {
  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runSyncAllWithServiceClient();

  if (result.error === "Database not configured for ingestion") {
    return NextResponse.json(result, { status: 503 });
  }
  if (result.error?.startsWith("RSS sync failed:")) {
    return NextResponse.json(result, { status: 500 });
  }

  const hasErrors = result.errors.length > 0 || !result.ok;
  if (hasErrors) {
    console.warn("[cron/sync-all] partial errors", {
      feedsFailed: result.feedsFailed,
      errorCount: result.errors.length,
    });
  } else {
    console.info("[cron/sync-all] ok", {
      episodesInserted: result.episodesInserted,
      episodesUpdated: result.episodesUpdated,
    });
  }

  return NextResponse.json({
    ok: result.ok,
    feedsAttempted: result.feedsAttempted,
    feedsSucceeded: result.feedsSucceeded,
    feedsFailed: result.feedsFailed,
    episodesInserted: result.episodesInserted,
    episodesUpdated: result.episodesUpdated,
    youtubeSkipped: result.youtubeSkipped,
    errors: result.errors,
    rss: result.rss,
    youtube: result.youtube,
    cycle: result.cycle ?? null,
  });
}
