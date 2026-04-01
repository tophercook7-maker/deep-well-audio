/** Keys sent from ConversionPageBeacon and stored in conversion_beacon_events.page */
export const CONVERSION_BEACON_PAGES = [
  "pricing",
  "join",
  "world_watch",
  "login",
  "signup",
] as const;

export type ConversionBeaconPage = (typeof CONVERSION_BEACON_PAGES)[number];

export function isConversionBeaconPage(value: unknown): value is ConversionBeaconPage {
  return typeof value === "string" && (CONVERSION_BEACON_PAGES as readonly string[]).includes(value);
}
