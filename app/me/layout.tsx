import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { MeBreadcrumbs } from "@/components/me/me-breadcrumbs";

const links: { href: Route; label: string }[] = [
  { href: "/me/notes" as Route, label: "Notes" },
  { href: "/me/highlights" as Route, label: "Highlights" },
  { href: "/me/bookmarks" as Route, label: "Bookmarks" },
  { href: "/me/reading-history" as Route, label: "History" },
];

export default function MeLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container-shell py-10 sm:py-12">
      <div className="mb-6 space-y-2 border-b border-line/50 pb-5">
        <MeBreadcrumbs />
      </div>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Notes and saved reading">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-line/60 bg-soft/20 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
