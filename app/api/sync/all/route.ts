import { NextResponse } from "next/server";
import { runSyncAllWithServiceClient } from "@/lib/ingest/sync-all";
import { requireSyncSecret } from "@/lib/sync-guard";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

  const result = await runSyncAllWithServiceClient({
    slugFilter,
  });

  if (result.error === "Database not configured for ingestion") {
    return NextResponse.json(result, { status: 503 });
  }
  if (result.error?.startsWith("RSS sync failed:")) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
