import Link from "next/link";
import { Headphones, Home, Library, Search } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthMenu } from "@/components/auth/auth-menu";

type NavItem =
  | { href: "/explore" | "/library"; label: string; icon: typeof Search | typeof Library | typeof Headphones }
  | { href: string; label: string; icon: typeof Headphones; hash: true };

const nav: NavItem[] = [
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/#featured", label: "Featured", icon: Headphones, hash: true },
];

const linkClass =
  "flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-text sm:px-4";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header
      className="sticky top-0 z-50 border-b border-line/80 bg-bg/85 backdrop-blur"
      style={{ backgroundColor: "rgba(11, 18, 32, 0.92)" }}
    >
      <div className="container-shell flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Headphones className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Deep Well Audio</p>
            <p className="truncate text-sm text-muted">Curated Bible teaching worth hearing</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end">
          <Link href="/" className={linkClass}>
            <Home className="h-4 w-4" />
            Home
          </Link>
          {nav.map((item) => {
            const Icon = item.icon;
            if ("hash" in item) {
              return (
                <a key={item.href} href={item.href} className={linkClass}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={linkClass}>
                <Icon className="h-4 w-4" />
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
