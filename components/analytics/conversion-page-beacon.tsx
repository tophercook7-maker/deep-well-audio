"use client";

import { useEffect, useRef } from "react";
import type { ConversionBeaconPage } from "@/lib/conversion-beacon";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

type Props = { page: ConversionBeaconPage };

/**
 * Fire once per mount: Vercel custom event + optional Supabase row via API (when service role is configured).
 */
export function ConversionPageBeacon({ page }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackFunnelEvent("conversion_page_view", { page });
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
