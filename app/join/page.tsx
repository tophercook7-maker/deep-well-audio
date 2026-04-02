import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { JoinListForm } from "@/components/join/join-list-form";

export const metadata = {
  title: "Stay in the loop · Deep Well Audio",
  description:
    "Optional email updates when something meaningful ships. Short notes—no noise, easy to leave.",
};

const whatYoullGet = [
  "Occasional updates when new tools are ready",
  "Early access to features",
  "A clearer sense of where this is going",
];

export default function JoinPage() {
  return (
    <main className="container-shell flex min-h-[min(100vh-8rem,52rem)] flex-col justify-center py-12 sm:py-16">
      <ConversionPageBeacon page="join" />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 border-b border-line/50 pb-4">
          <BackButton fallbackHref="/" label="Back" />
        </div>

        <div className="rounded-2xl border border-line/70 bg-soft/[0.12] p-7 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.55)] sm:p-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
            Stay in the loop
          </h1>
          <div className="mt-5 space-y-3 text-center text-sm leading-relaxed text-slate-400">
            <p>If you want to keep up with what&apos;s being built here, this is the simplest way.</p>
            <p>
              You&apos;ll get short updates when something meaningful is ready.
              <br />
              No noise. No constant emails.
            </p>
          </div>

          <div className="mt-8">
            <JoinListForm />
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
            Most people just listen for free. Some want to stay closer to what&apos;s being built.
          </p>

          <section className="mt-8 border-t border-line/40 pt-6" aria-labelledby="join-what-heading">
            <h2 id="join-what-heading" className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/55">
              What you&apos;ll get
            </h2>
            <ul className="mt-3 space-y-2 text-left text-sm leading-relaxed text-slate-300">
              {whatYoullGet.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-8 text-center">
            <Link
              href={"/" as Route}
              className="text-xs font-medium text-amber-200/75 underline-offset-4 transition hover:text-amber-100/90 hover:underline"
            >
              ← Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
