import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db";
import { getCronSecret, isWorldWatchWeeklyDigestEnabled } from "@/lib/env";
import { defaultCampaignKeyForSend } from "@/lib/world-watch/digest-email";
import { runWorldWatchWeeklyDigest } from "@/lib/world-watch/run-weekly-digest";

export const dynamic = "force-dynamic";

function authorizeCron(req: Request): boolean {
  const secret = getCronSecret();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Optional weekly World Watch email for `profiles.plan = 'premium'`.
 * Off by default: set `WORLD_WATCH_WEEKLY_DIGEST_ENABLED=1` plus Resend + `CRON_SECRET` when ready.
 */
export async function GET(req: Request) {
  if (!isWorldWatchWeeklyDigestEnabled()) {
    return NextResponse.json(
      {
        error: "World Watch weekly digest is disabled.",
        hint: "Set WORLD_WATCH_WEEKLY_DIGEST_ENABLED=1 and configure Resend + CRON_SECRET to send.",
        disabled: true,
      },
      { status: 403 }
    );
  }

  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "Service database client not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const override = url.searchParams.get("campaignKey");
  const dryRun = url.searchParams.get("dryRun") === "1";
  const campaignKey =
    override && /^\d{4}-\d{2}-\d{2}$/.test(override) ? override : defaultCampaignKeyForSend();

  const result = await runWorldWatchWeeklyDigest(admin, campaignKey, { dryRun });
  return NextResponse.json(result);
}
