import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { LoginForm } from "@/components/auth/login-form";
import { BackButton } from "@/components/buttons/back-button";
import { hasPublicSupabaseEnv } from "@/lib/env";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  const authAvailable = hasPublicSupabaseEnv();

  return (
    <main className="container-shell py-12 sm:py-16">
      <ConversionPageBeacon page="login" />
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>
      <div className="card card-dense mx-auto mt-8 max-w-xl p-8 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Your personal Deep Well</h1>
        <p className="mt-4 leading-relaxed text-slate-200/95">
          Sign in with the email you used for Premium. You&apos;ll pick up saved teaching, notes, and full World Watch where you left off.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Listen freely without an account on{" "}
          <Link href="/browse" className="font-medium text-amber-200/90 underline-offset-2 hover:underline">
            Browse
          </Link>
          . Subscribe to unlock your personal library and tools.
        </p>
        <LoginForm authAvailable={authAvailable} />
        <p className="mt-8 text-sm text-slate-400">
          Not subscribed yet?{" "}
          <Link href={"/pricing" as Route} className="font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline">
            View Premium
          </Link>
        </p>
      </div>
    </main>
  );
}
