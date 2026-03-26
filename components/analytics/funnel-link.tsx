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

export function FunnelLink({ funnelEvent, funnelData, onClick, ...props }: FunnelLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          trackFunnelEvent(funnelEvent, funnelData);
        }
      }}
    />
  );
}
