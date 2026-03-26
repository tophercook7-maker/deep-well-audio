import Link from "next/link";
import type { Route } from "next";
import { Bell } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { JoinListForm } from "@/components/join/join-list-form";

export const metadata = {
  title: "Join the Deep Well list",
  description:
    "Thoughtful updates when Premium opens, study tools ship, and the library grows. No spam—only from Deep Well Audio.",
};

const benefits = [
  "Early word when Premium opens or pricing changes",
  "New topic packs and study tools as they go live",
  "Quiet, curated notes as the directory improves",
];

export default function JoinPage() {
  return (
    <main className="container-shell flex min-h-[min(100vh-8rem,52rem)] flex-col justify-center py-14 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 border-b border-line/50 pb-5">
          <BackButton fallbackHref="/" label="Back" />
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-accent/20 bg-gradient-to-b from-[#0f172a]/95 via-[#0b1220] to-[#0b1220] p-8 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.65)] sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/[0.07] blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">
              Deep Well Audio
            </p>
            <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Join the Deep Well list
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted">
              Stay in the loop on Premium, new study tools, and meaningful updates to this library—without inbox noise.
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-muted/92">
              We only email when something is worth your time. No spam, no clutter, no unrelated promos—just Deep Well Audio.
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

            <p className="mt-6 text-center text-xs leading-relaxed text-muted">
              Add your email below—one step, no account. We only send mail when there&apos;s something worth opening.
            </p>

            <div className="mt-5">
              <JoinListForm />
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
              Your email stays private: never sold or shown publicly. Only Deep Well Audio—unsubscribe anytime.
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
