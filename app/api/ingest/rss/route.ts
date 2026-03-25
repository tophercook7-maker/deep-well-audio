import { NextResponse } from "next/server";
import { sourceFeeds } from "@/data/source-feeds";
import { createServiceClient } from "@/lib/db";
import { syncRssSeeds } from "@/lib/ingest/rss-sync";
import { requireSyncSecret } from "@/lib/sync-guard";

export async function POST(request: Request) {
  const denied = requireSyncSecret(request);
  if (denied) return denied;

  let slugFilter: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    slugFilter = typeof body?.slug === "string" ? body.slug : undefined;
  } catch {
    slugFilter = undefined;
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("ingest rss: service Supabase not configured");
    return NextResponse.json({ error: "Database not configured for ingestion" }, { status: 503 });
  }

  try {
    const summary = await syncRssSeeds(supabase, sourceFeeds, {
      maxItems: 50,
      slugFilter,
    });

    if (summary.totalFeedsAttempted === 0) {
      console.warn("ingest rss: no active RSS sources matched filters");
      return NextResponse.json({ error: "No active RSS sources matched" }, { status: 400 });
    }

    return NextResponse.json(summary);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("ingest rss: fatal", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
