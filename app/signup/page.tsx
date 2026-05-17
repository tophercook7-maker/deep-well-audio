import { redirect } from "next/navigation";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { safeInternalNext } from "@/lib/nav-utils";

/**
 * Public sign-up is retired in favor of Premium checkout.
 * Old links continue to resolve here, but logged-in users should never feel sent back into sign-up.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = safeInternalNext(typeof sp.next === "string" ? sp.next : null);
  const user = await getSessionUser();

  if (user) {
    const plan = await getUserPlan();
    if (plan === "premium") {
      redirect(next && next !== "/" ? next : "/library");
    }
    const qs = new URLSearchParams();
    qs.set("from", "signup");
    qs.set("status", "signed-in");
    if (next && next !== "/") qs.set("next", next);
    redirect(`/pricing?${qs.toString()}`);
  }

  const qs = new URLSearchParams();
  qs.set("from", "signup");
  if (next && next !== "/") qs.set("next", next);
  redirect(`/pricing?${qs.toString()}`);
}
