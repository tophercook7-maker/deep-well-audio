import Link from "next/link";
import type { Route } from "next";
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
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>
      <div className="mx-auto mt-8 max-w-xl card p-8 sm:p-10">
        <DeepWellLogo variant="inline" className="mb-7" />
        <span className="tag">Members</span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-4 leading-relaxed text-muted">
          Deep Well Audio uses Supabase for secure sign-in. Pick a strong password; if your project requires email confirmation, you&apos;ll
          get a link from Supabase before your first login.
        </p>
        <SignupForm authAvailable={authAvailable} />
        <p className="mt-6 text-sm text-muted">
          Already registered?{" "}
          <Link href={loginHref as Route} className="text-amber-200 hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
