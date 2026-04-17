import { createServiceClient } from "@/lib/db";
import { fetchPublishedWorldWatchItems, type WorldWatchItemPublic } from "@/lib/world-watch/items";

/** Single latest item for home / library / dashboard retention surfaces. */
export async function fetchWorldWatchTeaserForRetention(): Promise<WorldWatchItemPublic | null> {
  const admin = createServiceClient();
  if (!admin) return null;
  const items = await fetchPublishedWorldWatchItems(admin, 1, { audience: "teaser" });
  return items[0] ?? null;
}
