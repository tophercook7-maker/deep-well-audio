"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { BookOpen, CircleDollarSign, Globe, Headphones, Home, Library, ScrollText, Search } from "lucide-react";
import { ME_NAV, PRIMARY_NAV, SECONDARY_NAV, isNavActive } from "@/components/shared/nav-config";

const primaryIcon: Record<string, LucideIcon> = {
  "/": Home,
  "/bible": BookOpen,
  "/studies": ScrollText,
  "/search": Search,
};

const secondaryIcon: Record<string, LucideIcon> = {
  "/browse": Headphones,
  "/world-watch": Globe,
  "/library": Library,
  "/pricing": CircleDollarSign,
};

const linkBase =
  "flex min-h-[40px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 sm:min-h-0 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm";

const mobileRailLinkBase =
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-2 py-0 text-[11px] font-medium leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45";

/** Single-row primary shortcuts for closed mobile header (overflow scroll). Secondary + ME stay in drawer. */
export function SiteNavMobileRail({ pathname }: { pathname: string }) {
  return (
    <nav
      className={[
        "max-lg:flex lg:hidden",
        "h-10 max-h-10 min-h-0 w-full max-w-full flex-row flex-nowrap items-center gap-1 overflow-y-hidden overflow-x-auto overscroll-x-contain whitespace-nowrap [-webkit-overflow-scrolling:touch]",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      ].join(" ")}
      aria-label="Primary shortcuts"
    >
      {PRIMARY_NAV.map((item) => {
        const Icon = primaryIcon[item.href] ?? BookOpen;
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={`rail-${item.key}`}
            href={item.href as Route}
            className={[
              mobileRailLinkBase,
              active
                ? "border-accent/45 bg-accent/[0.12] text-amber-50 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]"
                : "border-line/65 text-muted hover:border-accent/30 hover:text-text",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3 w-3 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteNavDesktop({
  pathname,
  signedIn,
}: {
  pathname: string;
  signedIn: boolean;
}) {
  return (
    <div className="hidden min-w-0 flex-1 flex-col gap-2 lg:flex">
      <div className="flex flex-wrap items-center justify-end gap-1.5 lg:gap-2">
        <span className="sr-only">Primary</span>
        {PRIMARY_NAV.map((item) => {
          const Icon = primaryIcon[item.href] ?? BookOpen;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Route}
              className={[
                linkBase,
                active
                  ? "border-accent/45 bg-accent/[0.12] font-medium text-amber-50 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]"
                  : "border-line/70 text-muted hover:border-accent/35 hover:text-text",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
              {item.label}
            </Link>
          );
        })}
        {signedIn
          ? ME_NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href as Route}
                  className={[
                    linkBase,
                    active
                      ? "border-accent/40 bg-soft/40 font-medium text-amber-50"
                      : "border-line/60 text-muted hover:border-accent/30 hover:text-text",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })
          : null}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-line/40 pt-2 lg:gap-2">
        <span className="sr-only">More</span>
        {SECONDARY_NAV.map((item) => {
          const Icon = secondaryIcon[item.href] ?? Headphones;
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href as Route}
              className={[
                linkBase,
                active ? "border-line/90 bg-soft/25 text-text" : "border-line/55 text-muted hover:border-accent/30 hover:text-text",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80 sm:h-4 sm:w-4" strokeWidth={2.25} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
