/**
 * Client-visible checks only — the checkout API still validates Stripe + price IDs server-side.
 * Avoids enabling buttons when publishable key or public site URL is missing from the bundle.
 */
export function isClientCheckoutConfigured(): boolean {
  const pub = trimStr(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const site = trimStr(process.env.NEXT_PUBLIC_SITE_URL);
  return Boolean(pub && site);
}

function trimStr(v: string | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}
