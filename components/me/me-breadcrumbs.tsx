"use client";

import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/breadcrumbs";

function itemsForPath(pathname: string): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [{ label: "Home", href: "/" as Route }];
  if (pathname === "/me/notes" || pathname.startsWith("/me/notes/")) {
    return [...base, { label: "Notes" }];
  }
  if (pathname === "/me/bookmarks" || pathname.startsWith("/me/bookmarks/")) {
    return [...base, { label: "Bookmarks" }];
  }
  if (pathname === "/me/highlights" || pathname.startsWith("/me/highlights/")) {
    return [...base, { label: "Highlights" }];
  }
  if (pathname === "/me/reading-history" || pathname.startsWith("/me/reading-history/")) {
    return [...base, { label: "Reading history" }];
  }
  return base;
}

export function MeBreadcrumbs() {
  const pathname = usePathname() ?? "/";
  const items = itemsForPath(pathname);
  if (items.length <= 1) return null;
  return <Breadcrumbs items={items} className="text-[13px]" />;
}
