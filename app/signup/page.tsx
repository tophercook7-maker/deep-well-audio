import { redirect } from "next/navigation";

/**
 * Public sign-up is retired in favor of Premium checkout (Stripe creates subscriber access).
 * Old links continue to resolve here and forward to pricing.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  const qs = new URLSearchParams();
  qs.set("from", "signup");
  if (next.startsWith("/")) qs.set("next", next);
  redirect(`/pricing?${qs.toString()}`);
}
