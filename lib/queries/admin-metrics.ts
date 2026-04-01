import { createServiceClient } from "@/lib/db";
import { isConversionBeaconPage, type ConversionBeaconPage } from "@/lib/conversion-beacon";

export type AdminMetricsBeaconRow = { page: ConversionBeaconPage; count: number };

export type AdminMetrics = {
  configured: boolean;
  profilesTotal: number | null;
  profilesNew7d: number | null;
  premiumTotal: number | null;
  waitlistTotal: number | null;
  waitlistNew7d: number | null;
  beaconByPage7d: AdminMetricsBeaconRow[];
  beaconByPageAll: AdminMetricsBeaconRow[];
};

function iso7dAgo(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString();
}

function rollupBeacon(rows: { page: string }[] | null): AdminMetricsBeaconRow[] {
  const counts = new Map<ConversionBeaconPage, number>();
  for (const r of rows ?? []) {
    if (!isConversionBeaconPage(r.page)) continue;
    counts.set(r.page, (counts.get(r.page) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const admin = createServiceClient();
  if (!admin) {
    return {
      configured: false,
      profilesTotal: null,
      profilesNew7d: null,
      premiumTotal: null,
      waitlistTotal: null,
      waitlistNew7d: null,
      beaconByPage7d: [],
      beaconByPageAll: [],
    };
  }

  const since = iso7dAgo();

  const [profilesTotalRes, profilesNewRes, premiumRes, waitlistTotalRes, waitlistNewRes, beacon7dRes, beaconAllRes] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "premium"),
      admin.from("premium_waitlist").select("id", { count: "exact", head: true }),
      admin.from("premium_waitlist").select("id", { count: "exact", head: true }).gte("created_at", since),
      admin.from("conversion_beacon_events").select("page").gte("created_at", since),
      admin.from("conversion_beacon_events").select("page"),
    ]);

  if (beacon7dRes.error) {
    console.warn("[admin-metrics] beacon 7d:", beacon7dRes.error.message);
  }
  if (beaconAllRes.error) {
    console.warn("[admin-metrics] beacon all:", beaconAllRes.error.message);
  }

  return {
    configured: true,
    profilesTotal: profilesTotalRes.count ?? null,
    profilesNew7d: profilesNewRes.count ?? null,
    premiumTotal: premiumRes.count ?? null,
    waitlistTotal: waitlistTotalRes.count ?? null,
    waitlistNew7d: waitlistNewRes.count ?? null,
    beaconByPage7d: beacon7dRes.error ? [] : rollupBeacon(beacon7dRes.data),
    beaconByPageAll: beaconAllRes.error ? [] : rollupBeacon(beaconAllRes.data),
  };
}
