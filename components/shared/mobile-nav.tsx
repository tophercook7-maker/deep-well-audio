"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleDollarSign,
  Globe,
  Headphones,
  Home,
  Library,
  Menu,
  ScrollText,
  Search,
  X,
} from "lucide-react";
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

const rowClass =
  "flex min-h-[48px] items-center gap-3 rounded-xl border border-line/55 bg-[rgba(10,14,22,0.65)] px-4 py-3 text-base text-slate-100 transition hover:border-accent/35";

export function MobileNav({
  pathname,
  signedIn,
}: {
  pathname: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-line/80 bg-soft/30 text-slate-100 md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="Site navigation">
          <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-line/60 bg-[rgba(11,16,26,0.97)] shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-line/50 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</span>
              <button
                type="button"
                className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/65">Main</p>
              <ul className="space-y-1">
                {PRIMARY_NAV.map((item) => {
                  const Icon = primaryIcon[item.href] ?? BookOpen;
                  const active = isNavActive(pathname, item.href);
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href as Route}
                        className={[rowClass, active ? "border-accent/40 bg-accent/[0.1]" : ""].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-amber-200/85" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {signedIn ? (
                <>
                  <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/65">Your study</p>
                  <ul className="space-y-1">
                    {ME_NAV.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      return (
                        <li key={item.key}>
                          <Link
                            href={item.href as Route}
                            className={[rowClass, active ? "border-accent/35 bg-soft/30" : ""].join(" ")}
                            aria-current={active ? "page" : undefined}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
              <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Listen &amp; library</p>
              <ul className="space-y-1">
                {SECONDARY_NAV.map((item) => {
                  const Icon = secondaryIcon[item.href] ?? Headphones;
                  const active = isNavActive(pathname, item.href);
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href as Route}
                        className={[rowClass, active ? "border-line/80 bg-soft/20" : ""].join(" ")}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
