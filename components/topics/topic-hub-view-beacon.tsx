"use client";

import { useEffect, useRef } from "react";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

export function TopicHubViewBeacon({ slug }: { slug: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackFunnelEvent("topic_hub_view", { slug });
  }, [slug]);
  return null;
}
