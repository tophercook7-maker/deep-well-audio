import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: Route;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
  /** Higher-contrast trail for Bible routes (solid links, no washed opacity). */
  tone?: "default" | "bible";
};

export function Breadcrumbs({ items, className = "", tone = "default" }: Props) {
  if (items.length === 0) return null;

  const bible = tone === "bible";

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol
        className={
          bible
            ? "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-stone-500"
            : "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-slate-500"
        }
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <ChevronRight
                  className={
                    bible ? "h-3.5 w-3.5 shrink-0 text-stone-600" : "h-3.5 w-3.5 shrink-0 text-slate-600"
                  }
                  aria-hidden
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={
                    bible
                      ? "font-medium text-amber-200 transition hover:text-amber-100 hover:underline"
                      : "text-amber-200/85 transition hover:text-amber-100 hover:underline"
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? bible
                        ? "font-medium text-stone-100"
                        : "font-medium text-slate-300"
                      : bible
                        ? "text-stone-500"
                        : "text-slate-500"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
