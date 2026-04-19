"use client";

import Link from "next/link";
import type { Route } from "next";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { LogIn } from "lucide-react";
import { AuthMenu } from "@/components/auth/auth-menu";
import { MobileNav } from "@/components/shared/mobile-nav";
import { SiteNavDesktop } from "@/components/shared/site-nav";
import type { UserPlan } from "@/lib/permissions";
import { CTA } from "@/lib/site-messaging";

const ctaSignupClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.4)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 max-md:min-h-[40px] max-md:px-3 max-md:text-[13px]";

const MOBILE_HEADER_MQ = "(max-width: 767px)";

export function SiteHeader({ user, plan }: { user: User | null; plan: UserPlan }) {
  const pathname = usePathname() ?? "/";
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
  const signedIn = Boolean(user);

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "z-50 border-b border-line/70 bg-transparent shadow-[0_8px_28px_rgba(0,0,0,0.14)] backdrop-blur-md backdrop-saturate-125 max-md:border-line/50 max-md:shadow-[0_4px_22px_rgba(0,0,0,0.12)]",
          "md:sticky md:top-0 md:translate-y-0",
          "max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:w-full",
          "max-md:transition-transform max-md:duration-300 max-md:ease-in-out",
          scrollHiddenMobile ? "max-md:-translate-y-full" : "max-md:translate-y-0",
        ].join(" ")}
        style={{ backgroundColor: "rgba(11, 18, 32, 0.38)" }}
      >
        <div className="container-shell py-2 md:py-[1.125rem]">
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-3">
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
            <SiteNavDesktop pathname={pathname} signedIn={signedIn} />
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <MobileNav pathname={pathname} signedIn={signedIn} />
              {!user ? (
                <>
                  <Link
                    href={"/login" as Route}
                    className="hidden min-h-[40px] items-center rounded-full border border-line/80 px-3 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-text sm:inline-flex"
                  >
                    <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
                    Sign In
                  </Link>
                  <Link href={"/signup" as Route} className={ctaSignupClass}>
                    {CTA.CREATE_FREE_ACCOUNT}
                  </Link>
                </>
              ) : null}
              <div className="border-l border-line/80 pl-2 md:pl-4">
                <AuthMenu user={user} plan={plan} />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div aria-hidden className="shrink-0 md:hidden" style={{ height: isMobileLayout ? spacerHeight : 0 }} />
    </>
  );
}
