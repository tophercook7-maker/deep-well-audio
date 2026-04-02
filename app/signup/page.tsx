import Link from "next/link";
import type { Route } from "next";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { SignupForm } from "@/components/auth/signup-form";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { BackButton } from "@/components/buttons/back-button";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { safeInternalNext } from "@/lib/nav-utils";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawNext = typeof sp.next === "string" ? sp.next : undefined;
  const next = safeInternalNext(rawNext, "/library");
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const authAvailable = hasPublicSupabaseEnv();

  return (
    <main className="container-shell py-12 sm:py-16">
      <ConversionPageBeacon page="signup" />
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>
      <div className="card card-dense mx-auto mt-8 max-w-xl p-8 sm:p-10">
        <DeepWellLogo variant="inline" brandClassName="mb-6 sm:mb-7" />
        <span className="tag">Members</span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">Create your account</h1>
        <p className="mt-4 leading-relaxed text-slate-200/95">
          Deep Well Audio uses Supabase for secure sign-in. Pick a strong password; if your project requires email confirmation, you&apos;ll
          get a link from Supabase before your first login.
        </p>
        <SignupForm authAvailable={authAvailable} nextHref={next} />
        <p className="mt-6 text-sm text-slate-200/95">
          Already registered?{" "}
          <Link href={loginHref as Route} className="font-medium text-amber-200/90 underline-offset-2 transition hover:text-amber-100 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
