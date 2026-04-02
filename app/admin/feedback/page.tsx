import Link from "next/link";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { FeedbackAdminPanel, type FeedbackRow } from "@/components/feedback/feedback-admin-panel";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { getFeedbackAdminEmails, isFeedbackAdminEmail } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "Feedback · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
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
        <p className="mt-2 text-sm text-muted">Use an admin account to review feedback.</p>
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
          Set <code className="text-slate-400">FEEDBACK_ADMIN_EMAILS</code> in the server environment (comma-separated), then redeploy.
        </p>
      </main>
    );
  }

  if (!isFeedbackAdminEmail(user.email)) {
    return (
      <main className="container-shell max-w-lg py-16">
        <BackButton fallbackHref="/" label="Home" />
        <h1 className="mt-8 text-xl font-semibold text-white">Access denied</h1>
        <p className="mt-2 text-sm text-muted">This inbox is only for Deep Well operators.</p>
      </main>
    );
  }

  const admin = createServiceClient();
  let rows: FeedbackRow[] = [];

  if (admin) {
    const { data, error } = await admin
      .from("site_feedback")
      .select("id, created_at, category, message, page_url, user_agent, email, user_id, status, admin_note, reply_sent, replied_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[admin/feedback] select", error.message);
    } else {
      rows = (data ?? []) as FeedbackRow[];
    }
  }

  return (
    <main className="container-shell max-w-3xl space-y-10 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>
      <header className="rounded-2xl border border-line/60 bg-soft/10 px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Site feedback</h1>
        <p className="mt-2 max-w-prose text-sm leading-[1.65] text-muted">
          Newest first. Update status and keep internal notes—nothing is emailed from here; submissions stay in this inbox until you change them.
        </p>
      </header>
      {!admin ? (
        <p className="text-sm text-amber-200/90">Service role key missing — cannot load feedback from the database.</p>
      ) : (
        <FeedbackAdminPanel rows={rows} />
      )}
    </main>
  );
}
