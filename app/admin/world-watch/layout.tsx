import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { getSessionUser } from "@/lib/auth";
import { getFeedbackAdminEmails, isFeedbackAdminEmail } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "World Watch · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminWorldWatchLayout({ children }: { children: ReactNode }) {
  let user = null;
  try {
    user = await getSessionUser();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  if (!user?.email) {
    return (
      <main className="container-shell max-w-lg py-16">
        <BackButton fallbackHref="/" label="Home" />
        <h1 className="mt-8 text-xl font-semibold text-white">Sign in required</h1>
        <p className="mt-2 text-sm text-muted">Operators only.</p>
        <Link href={"/login" as Route} className="mt-4 inline-block text-sm font-medium text-amber-200/90 hover:underline">
          Sign in →
        </Link>
      </main>
    );
  }

  if (!getFeedbackAdminEmails().length) {
    return (
      <main className="container-shell max-w-lg py-16">
        <BackButton fallbackHref="/" label="Home" />
        <h1 className="mt-8 text-xl font-semibold text-white">Not configured</h1>
        <p className="mt-2 text-sm text-muted">
          Set <code className="text-slate-400">FEEDBACK_ADMIN_EMAILS</code> in the server environment, then redeploy.
        </p>
      </main>
    );
  }

  if (!isFeedbackAdminEmail(user.email)) {
    return (
      <main className="container-shell max-w-lg py-16">
        <BackButton fallbackHref="/" label="Home" />
        <h1 className="mt-8 text-xl font-semibold text-white">Access denied</h1>
        <p className="mt-2 text-sm text-muted">This area is only for Deep Well operators.</p>
      </main>
    );
  }

  return <>{children}</>;
}
