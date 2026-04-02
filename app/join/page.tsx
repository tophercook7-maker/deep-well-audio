import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { BackButton } from "@/components/buttons/back-button";
import { JoinListForm } from "@/components/join/join-list-form";

export const metadata = {
  title: "Updates · Deep Well Audio",
  description: "Short updates. No noise. Your email stays private.",
};

export default function JoinPage() {
  return (
    <main className="container-shell flex min-h-[min(100vh-8rem,52rem)] flex-col justify-center py-12 sm:py-16">
      <ConversionPageBeacon page="join" />
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 border-b border-line/50 pb-4">
          <BackButton fallbackHref="/" label="Back" />
        </div>

        <div className="rounded-2xl border border-line/50 bg-soft/[0.14] p-7 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.38)] backdrop-blur-md backdrop-saturate-125 sm:p-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
            Short updates. No noise.
          </h1>
          <p className="mt-4 text-center text-sm text-slate-400">Your email stays private.</p>

          <div className="mt-8">
            <JoinListForm />
          </div>

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
