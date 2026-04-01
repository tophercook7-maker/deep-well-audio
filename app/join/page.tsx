import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { JoinListForm } from "@/components/join/join-list-form";

export const metadata = {
  title: "Join the Deep Well list",
  description:
    "Thoughtful updates when Premium opens, study tools ship, and the library grows. No spam—only from Deep Well Audio.",
};

const benefits = [
  "A short note when Premium or pricing changes—no surprise clutter",
  "Heads-up as topic packs and study tools go live",
  "Occasional directory updates when we add meaningful teaching sources",
];

export default function JoinPage() {
  return (
    <main className="container-shell flex min-h-[min(100vh-8rem,52rem)] flex-col justify-center py-14 sm:py-20">
      <ConversionPageBeacon page="join" />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/" label="Back" />
        </div>

        <div className="card card-dense relative overflow-hidden rounded-[1.75rem] border-accent/25 p-8 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.65)] sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/[0.07] blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <div className="flex justify-center">
              <DeepWellLogo variant="inline" brandClassName="items-center mx-auto" />
            </div>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Get notified about Premium &amp; new tools
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed text-slate-300">
              Join the list for calm updates when study features ship or the library grows. One short field below—no account required.
            </p>

            <ul className="mt-6 space-y-2.5 border-y border-line/35 py-6 text-left text-sm leading-relaxed text-slate-200/95">
              {benefits.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <JoinListForm />
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
              Used only for this list—never sold or shown publicly. From Deep Well Audio only; unsubscribe anytime.
            </p>

            <p className="mt-6 text-center">
              <Link
                href={"/" as Route}
                className="text-sm font-medium text-amber-200/80 underline-offset-4 transition hover:text-amber-100 hover:underline"
              >
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
