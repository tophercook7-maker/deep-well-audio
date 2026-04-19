import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";

const shellDefault =
  "group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-line/80 bg-soft/30 px-4 py-2 text-sm font-medium text-amber-100/90 shadow-[0_1px_0_rgba(255,255,255,0.04)] transition hover:border-accent/35 hover:bg-accent/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0";

/** Opaque chrome for Bible routes — avoids translucent “soft” over bright atmosphere. */
const shellBible =
  "group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border border-stone-600 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-100 shadow-md transition hover:border-stone-500 hover:bg-stone-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10] sm:min-h-0";

type Props = {
  href: Route;
  label: string;
  className?: string;
  tone?: "default" | "bible";
};

/** Structural parent link — does not use browser history. */
export function SectionBackLink({ href, label, className, tone = "default" }: Props) {
  const shell = tone === "bible" ? shellBible : shellDefault;
  return (
    <Link href={href} className={className ? `${shell} ${className}` : shell}>
      <ArrowLeft className="h-4 w-4 shrink-0 transition group-hover:-translate-x-0.5" aria-hidden />
      {label}
    </Link>
  );
}
