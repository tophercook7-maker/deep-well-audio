import Link from "next/link";
import type { Route } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";
import { BackButton } from "@/components/buttons/back-button";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { safeInternalNext } from "@/lib/nav-utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawNext = typeof sp.next === "string" ? sp.next : undefined;
  const next = safeInternalNext(rawNext, "/library");
  const signupHref = `/signup?next=${encodeURIComponent(next)}`;
  const authAvailable = hasPublicSupabaseEnv();

  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>
      <div className="mx-auto mt-8 max-w-xl card p-8 sm:p-10">
        <DeepWellLogo variant="inline" className="mb-7" />
        <span className="tag">Members</span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-4 leading-relaxed text-muted">
          Welcome back. Use the email and password you registered with—we&apos;ll return you to your library or the page you were on.
        </p>
        <LoginForm authAvailable={authAvailable} />
        <p className="mt-6 text-sm text-muted">
          Need an account?{" "}
          <Link href={signupHref as Route} className="text-amber-200 hover:text-white">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
