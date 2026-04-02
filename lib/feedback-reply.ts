import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedbackReplyEmailPayload = {
  to: string;
  subject: string;
  bodyText: string;
  feedbackId: string;
};

/**
 * Outbound feedback replies (e.g. Resend). Not required for launch.
 *
 * When you add a provider: implement sending here, then call `recordFeedbackReplySent` after success.
 * Until then this always returns `sent: false` so callers can no-op safely.
 */
export async function sendFeedbackReplyEmailIfEnabled(payload: FeedbackReplyEmailPayload): Promise<{
  sent: boolean;
  reason?: string;
}> {
  void payload;
  // TODO: e.g. if trimStr(process.env.RESEND_API_KEY) and FEEDBACK_REPLY_FROM, send via Resend and return { sent: true }.
  return { sent: false, reason: "outbound_not_configured" };
}

/** Persist send completion (automated or after you confirm a manual Gmail send). */
export async function recordFeedbackReplySent(
  admin: SupabaseClient,
  feedbackId: string,
  repliedAtIso: string = new Date().toISOString()
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("site_feedback")
    .update({ reply_sent: true, replied_at: repliedAtIso })
    .eq("id", feedbackId);

  if (error) {
    console.error("[feedback-reply] recordFeedbackReplySent", error.message);
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Single entry point for a future “Send reply” action: loads row, sends if provider configured, records timestamps.
 * Safe to call today — returns quickly with `sent: false` when email is not wired.
 */
export async function attemptAutomatedFeedbackReply(
  admin: SupabaseClient,
  feedbackId: string
): Promise<{ sent: boolean; reason: string }> {
  const { data, error } = await admin
    .from("site_feedback")
    .select("email, admin_note, reply_sent")
    .eq("id", feedbackId)
    .maybeSingle();

  if (error) {
    console.error("[feedback-reply] attemptAutomatedFeedbackReply select", error.message);
    return { sent: false, reason: "db_error" };
  }

  const email = data && typeof data.email === "string" ? data.email.trim() : "";
  const note = data && typeof data.admin_note === "string" ? data.admin_note.trim() : "";
  const already = data && data.reply_sent === true;

  if (!email) return { sent: false, reason: "no_recipient" };
  if (!note) return { sent: false, reason: "no_reply_draft" };
  if (already) return { sent: false, reason: "already_sent" };

  const send = await sendFeedbackReplyEmailIfEnabled({
    to: email,
    subject: "Re: your feedback",
    bodyText: note,
    feedbackId,
  });

  if (!send.sent) {
    return { sent: false, reason: send.reason ?? "send_skipped" };
  }

  const rec = await recordFeedbackReplySent(admin, feedbackId);
  if (rec.error) return { sent: false, reason: "record_failed" };

  return { sent: true, reason: "ok" };
}
