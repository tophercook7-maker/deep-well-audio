import Link from "next/link";
import type { User } from "@supabase/supabase-js";
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
  "flex min-h-[44px] items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0 sm:px-4";

export function SiteHeader({ user, plan }: { user: User | null; plan: UserPlan }) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-line/80 bg-bg/85 shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-md backdrop-saturate-150"
      style={{ backgroundColor: "rgba(11, 18, 32, 0.94)" }}
    >
      <div className="container-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-5">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
        >
          <DeepWellLogo variant="header" priority />
        </Link>

        <nav className="flex min-w-0 flex-wrap items-center gap-2.5 sm:flex-1 sm:justify-end sm:gap-3" aria-label="Primary">
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
  );
}
