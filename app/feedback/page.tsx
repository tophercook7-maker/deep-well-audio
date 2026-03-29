import { BackButton } from "@/components/buttons/back-button";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { getSessionUser } from "@/lib/auth";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const metadata = {
  title: "Send feedback",
  description:
    "If something feels broken, confusing, or missing, let me know. I’m improving this every day, and your feedback helps shape what this becomes.",
};

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  let user = null;
  try {
    user = await getSessionUser();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const signedIn = Boolean(user);
  const email = typeof user?.email === "string" ? user.email : null;

  return (
    <main className="container-shell max-w-xl space-y-8 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Deep Well</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Send feedback</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          If something feels broken, confusing, or missing, let me know. I&apos;m improving this every day, and your feedback helps shape what this becomes.
        </p>
      </header>
      <FeedbackForm signedIn={signedIn} defaultEmail={email} />
    </main>
  );
}
