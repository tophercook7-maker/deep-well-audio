import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/env";
import { getAggregatedCuratedYoutubeItems } from "@/lib/curated-teachings/aggregate";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Warms server-side Next fetch caches for curated YouTube aggregation (Data API + RSS fallbacks).
 * Schedule via Vercel Cron or any job runner with `Authorization: Bearer ${CRON_SECRET}`.
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

  try {
    const items = await getAggregatedCuratedYoutubeItems({
      limit: 24,
      maxTotal: 80,
      /** Align with default site ingest so `unstable_cache` warms the same key as homepage / curated pages. */
      maxPerSource: 24,
    });
    return NextResponse.json({
      ok: true,
      count: items.length,
      newestPublishedAt: items[0]?.publishedAt ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[curated-youtube cron]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
