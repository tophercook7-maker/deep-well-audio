"use client";

import type { Route } from "next";
import { FunnelLink } from "@/components/analytics/funnel-link";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function FooterJoinLink({ className, children }: Props) {
  return (
    <FunnelLink href={"/join" as Route} funnelEvent="join_list_click" className={className}>
      {children}
    </FunnelLink>
  );
}
