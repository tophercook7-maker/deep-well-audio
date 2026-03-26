"use client";

import { track } from "@vercel/analytics";
import type { FunnelEventName } from "@/lib/funnel-events";

export type { FunnelEventName };

export function trackFunnelEvent(
  name: FunnelEventName,
  data?: Record<string, string | number | boolean>
) {
  const payload = data && Object.keys(data).length > 0 ? data : undefined;
  track(name, payload);
}
