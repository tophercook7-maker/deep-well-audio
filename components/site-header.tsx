"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { Globe, Headphones, Home, Library, Search, Tags } from "lucide-react";
import { AuthMenu } from "@/components/auth/auth-menu";
import type { UserPlan } from "@/lib/permissions";

type NavItem =
  | { href: "/explore" | "/library" | "/world-watch"; label: string; icon: typeof Search | typeof Library | typeof Globe }
  | { href: string; label: string; icon: typeof Headphones | typeof Tags; hash: true };

const nav: NavItem[] = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/#topics", label: "Topics", icon: Tags, hash: true },
  { href: "/library", label: "Library", icon: Library },
  { href: "/world-watch", label: "World Watch", icon: Globe },
  { href: "/#featured", label: "Featured", icon: Headphones, hash: true },
];

const linkClass =
  "flex min-h-[44px] items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] max-md:min-h-[40px] max-md:gap-1.5 max-md:px-2.5 max-md:py-1.5 max-md:text-[13px] sm:min-h-0 sm:px-4 sm:text-sm";

/** Tailwind `md` is 768px — scroll behavior and fixed header apply below this width only. */
const MOBILE_HEADER_MQ = "(max-width: 767px)";

export function SiteHeader({ user, plan }: { user: User | null; plan: UserPlan }) {
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const lastScrollY = useRef(0);
  const wasMobileLayout = useRef<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_HEADER_MQ);
    const apply = () => {
      const next = mq.matches;
      const prev = wasMobileLayout.current;
      wasMobileLayout.current = next;
      setIsMobileLayout(next);
      if (next && prev === false) setHeaderVisible(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSpacerHeight(el.offsetHeight);
    });
    ro.observe(el);
    setSpacerHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [isMobileLayout, user, plan]);

  useEffect(() => {
    if (!isMobileLayout) return;
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < 20) {
        setHeaderVisible(true);
      } else {
        const delta = y - lastScrollY.current;
        if (delta > 8) setHeaderVisible(false);
        else if (delta < -8) setHeaderVisible(true);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobileLayout]);

  const scrollHiddenMobile = isMobileLayout && !headerVisible;

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "z-50 border-b border-line/75 bg-bg/55 shadow-[0_8px_28px_rgba(0,0,0,0.18)] backdrop-blur-md backdrop-saturate-150 max-md:border-line/55 max-md:shadow-[0_4px_22px_rgba(0,0,0,0.16)]",
          "md:sticky md:top-0 md:translate-y-0",
          "max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:w-full",
          "max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
          scrollHiddenMobile ? "max-md:-translate-y-full" : "max-md:translate-y-0",
        ].join(" ")}
        style={{ backgroundColor: "rgba(11, 18, 32, 0.72)" }}
      >
        <div className="container-shell flex flex-col gap-2 max-md:gap-1.5 max-md:py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:py-[1.125rem]">
          <Link
            href="/"
            aria-label="Deep Well Audio — Home"
            className="flex shrink-0 flex-col items-start gap-0 rounded-lg pr-1 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:pr-2"
          >
            <DeepWellLogo
              variant="header"
              priority
              showWordmark
              className="max-md:!max-h-10"
              brandClassName="max-md:w-[min(92vw,15.5rem)] max-md:gap-0.5"
              wordmarkClassName="max-md:!text-base max-md:!leading-tight"
            />
          </Link>

          <nav className="flex min-w-0 flex-wrap items-center gap-1.5 max-md:pt-0.5 sm:flex-1 sm:justify-end sm:gap-2.5 sm:pt-0 md:gap-3" aria-label="Primary">
            <Link href="/" className={linkClass}>
              <Home className="h-4 w-4 shrink-0" aria-hidden />
              Home
            </Link>
            {nav.map((item) => {
              const Icon = item.icon;
              if ("hash" in item) {
                return (
                  <a key={item.href} href={item.href} className={linkClass}>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </a>
                );
              }
              return (
                <Link key={item.href} href={item.href} className={linkClass}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <div className="sm:ml-1 sm:border-l sm:border-line/80 sm:pl-4">
              <AuthMenu user={user} plan={plan} />
            </div>
          </nav>
        </div>
      </header>
      {/* Reserves space when the header is fixed on mobile so content does not jump under the bar. */}
      <div
        aria-hidden
        className="shrink-0 md:hidden"
        style={{ height: isMobileLayout ? spacerHeight : 0 }}
      />
    </>
  );
}
