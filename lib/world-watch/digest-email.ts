import { getSafeAbsoluteSiteUrl } from "@/lib/env";
import { digestWeekCampaignKeyUTC } from "@/lib/world-watch/iso-week";

export function worldWatchWeeklySubject(campaignKey: string): string {
  return `World Watch · Deep Well Audio (${campaignKey})`;
}

export function worldWatchWeeklyHtml(params: { campaignKey: string }): string {
  const site = getSafeAbsoluteSiteUrl();
  const path = "/world-watch";
  const url = `${site.replace(/\/$/, "")}${path}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:Georgia,'Times New Roman',serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:#0b1220;border-radius:16px;padding:28px 24px;color:#f8fafc;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#fcd34d;">Deep Well Audio · Premium</p>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;">World Watch</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#cbd5e1;">
          Your weekly briefing for Premium members — a steady read on faith and the public square, without the noise.
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#94a3b8;">
          Week of <strong style="color:#e2e8f0;">${params.campaignKey}</strong> (UTC) — open the full briefing on the site anytime.
        </p>
        <a href="${url}" style="display:inline-block;background:#facc15;color:#0b1220;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;">
          Open World Watch
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
          You receive this because your Deep Well account is on <strong style="color:#94a3b8;">Premium</strong>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function defaultCampaignKeyForSend(now?: Date): string {
  return digestWeekCampaignKeyUTC(now ?? new Date());
}
