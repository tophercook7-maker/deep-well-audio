import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { typescript: true });
  }
  return stripeSingleton;
}
