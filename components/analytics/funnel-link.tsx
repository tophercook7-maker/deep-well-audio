"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps } from "react";
import { trackFunnelEvent } from "@/lib/funnel-analytics";
import type { FunnelEventName } from "@/lib/funnel-events";

export type FunnelLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: Route;
  funnelEvent: FunnelEventName;
  funnelData?: Record<string, string | number | boolean>;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function hrefTargetsPricing(href: Route): boolean {
  const s = String(href);
  return s === "/pricing" || s.startsWith("/pricing?");
}

export function FunnelLink({ funnelEvent, funnelData, onClick, href, ...props }: FunnelLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          if (hrefTargetsPricing(href)) {
            trackFunnelEvent("pricing_click", funnelData);
          }
          trackFunnelEvent(funnelEvent, funnelData);
        }
      }}
    />
  );
}
