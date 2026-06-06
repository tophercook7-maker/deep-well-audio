"use client";

import { useEffect, useRef } from "react";
import type { ConversionBeaconPage } from "@/lib/conversion-beacon";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

type Props = { page: ConversionBeaconPage };

const PAGE_VISIT_EVENTS: Partial<Record<ConversionBeaconPage, "homepage_visit" | "pricing_page_visit">> = {
  home: "homepage_visit",
  pricing: "pricing_page_visit",
};

/**
 * Fire once per mount: Vercel custom event + optional Supabase row via API (when service role is configured).
 */
export function ConversionPageBeacon({ page }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackFunnelEvent("conversion_page_view", { page });
    const visitEvent = PAGE_VISIT_EVENTS[page];
    if (visitEvent) {
      trackFunnelEvent(visitEvent);
    }
    void fetch("/api/analytics/beacon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
      keepalive: true,
    }).catch(() => {
      /* ignore */
    });
  }, [page]);

  return null;
}
