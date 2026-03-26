import Link from "next/link";
import Image from "next/image";
import { Headphones, Home, Library, Search } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthMenu } from "@/components/auth/auth-menu";

type NavItem =
  | { href: "/explore" | "/library"; label: string; icon: typeof Search | typeof Library }
  | { href: string; label: string; icon: typeof Headphones; hash: true };

const nav: NavItem[] = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/#featured", label: "Featured", icon: Headphones, hash: true },
];

const linkClass =
  "flex min-h-[44px] items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0 sm:px-4";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header
      className="sticky top-0 z-50 border-b border-line/80 bg-bg/85 backdrop-blur"
      style={{ backgroundColor: "rgba(11, 18, 32, 0.92)" }}
    >
      <div className="container-shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:gap-3"
        >
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 sm:hidden"
            priority
            unoptimized
          />
          <Image
            src="/brand/logo-wordmark.svg"
            alt="Deep Well Audio"
            width={268}
            height={46}
            className="hidden h-9 w-auto max-w-[240px] shrink-0 sm:block md:max-w-[280px] md:h-10"
            priority
            unoptimized
          />
          <span className="flex min-w-0 flex-col sm:hidden">
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Deep Well
            </span>
            <span className="truncate text-sm font-semibold tracking-wide text-amber-100/90">Audio</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end" aria-label="Primary">
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
          <div className="sm:ml-1 sm:border-l sm:border-line/80 sm:pl-3">
            <AuthMenu user={user} />
          </div>
        </nav>
      </div>
    </header>
  );
}
