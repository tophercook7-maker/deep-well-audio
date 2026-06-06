/**
 * Display-only pricing copy — amounts shown in UI.
 * Stripe charges whatever is on `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`; keep env Price IDs in sync after changes.
 */

export const PREMIUM_MONTHLY_DISPLAY = "$1.99";
export const PREMIUM_MONTHLY_LABEL = `${PREMIUM_MONTHLY_DISPLAY}/month`;

/** Matches annual Price in Stripe (`STRIPE_PRICE_YEARLY`). */
export const PREMIUM_YEARLY_DISPLAY = "$20";
export const PREMIUM_YEARLY_LABEL = `${PREMIUM_YEARLY_DISPLAY}/year`;

/** Approximate savings vs twelve monthly payments at list display rate ($1.99 × 12 ≈ $23.88). */
export const PREMIUM_YEARLY_SAVINGS_NOTE = "Save about $4 compared to twelve monthly payments.";

/**
 * FUTURE: Foundation Plan (~$5/mo) — lower-friction support tier.
 * Do not surface in public checkout until `STRIPE_PRICE_FOUNDATION` (or equivalent) exists in billing.
 */
