import type { SupabaseClient } from "@supabase/supabase-js";
import { getResendApiKey, getResendFromWorldWatch } from "@/lib/env";
import { worldWatchWeeklyHtml, worldWatchWeeklySubject } from "@/lib/world-watch/digest-email";
import { sendResendEmail } from "@/lib/world-watch/send-resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WeeklyDigestRunResult = {
  campaignKey: string;
  configured: boolean;
  skippedReason?: string;
  recipientCount: number;
  sent: number;
  skippedAlreadySent: number;
  failed: number;
  errors: string[];
};

async function duplicateSendRowExists(
  admin: SupabaseClient,
  campaignKey: string,
  userId: string
): Promise<{ status: "ok"; exists: boolean } | { status: "error"; message: string }> {
  const { data, error } = await admin
    .from("world_watch_digest_sends")
    .select("id")
    .eq("campaign_key", campaignKey)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[world-watch-digest] duplicate check failed", error.message);
    return { status: "error", message: error.message };
  }
  return { status: "ok", exists: Boolean(data) };
}

export async function runWorldWatchWeeklyDigest(
  admin: SupabaseClient,
  campaignKey: string,
  options?: { dryRun?: boolean }
): Promise<WeeklyDigestRunResult> {
  const apiKey = getResendApiKey();
  const from = getResendFromWorldWatch();

  if (!apiKey || !from) {
    return {
      campaignKey,
      configured: false,
      skippedReason: "RESEND_API_KEY or RESEND_FROM_WORLD_WATCH not set",
      recipientCount: 0,
      sent: 0,
      skippedAlreadySent: 0,
      failed: 0,
      errors: [],
    };
  }

  const { data: rows, error: listError } = await admin
    .from("profiles")
    .select("id, email")
    .eq("plan", "premium");

  if (listError) {
    console.error("[world-watch-digest] profile list failed", listError.message);
    return {
      campaignKey,
      configured: true,
      skippedReason: `premium_profile_list_failed: ${listError.message}`,
      recipientCount: 0,
      sent: 0,
      skippedAlreadySent: 0,
      failed: 0,
      errors: [listError.message],
    };
  }

  const recipients = (rows ?? [])
    .map((r) => ({
      userId: String(r.id),
      email: typeof r.email === "string" ? r.email.trim().toLowerCase() : "",
    }))
    .filter((r) => r.email.length > 0 && EMAIL_RE.test(r.email));

  const subject = worldWatchWeeklySubject(campaignKey);
  const html = worldWatchWeeklyHtml({ campaignKey });

  let sent = 0;
  let skippedAlreadySent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const r of recipients) {
    const dup = await duplicateSendRowExists(admin, campaignKey, r.userId);
    if (dup.status === "error") {
      failed += 1;
      errors.push(`${r.userId}: duplicate check: ${dup.message}`);
      continue;
    }
    if (dup.exists) {
      skippedAlreadySent += 1;
      continue;
    }

    if (options?.dryRun) {
      sent += 1;
      continue;
    }

    const result = await sendResendEmail({
      apiKey,
      from,
      to: r.email,
      subject,
      html,
    });

    if (!result.ok) {
      failed += 1;
      const msg = `${r.email}: ${result.error}`;
      errors.push(msg);
      console.error("[world-watch-digest] send failed", msg);
      continue;
    }

    const { error: insErr } = await admin.from("world_watch_digest_sends").insert({
      campaign_key: campaignKey,
      user_id: r.userId,
      email: r.email,
      provider_message_id: result.messageId,
    });

    if (insErr) {
      failed += 1;
      const msg = `${r.email}: persist ${insErr.message}`;
      errors.push(msg);
      console.error("[world-watch-digest] insert failed", insErr.message);
      continue;
    }

    sent += 1;
  }

  return {
    campaignKey,
    configured: true,
    recipientCount: recipients.length,
    sent,
    skippedAlreadySent,
    failed,
    errors: errors.slice(0, 25),
  };
}
