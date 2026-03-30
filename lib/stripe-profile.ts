import type { SupabaseClient } from "@supabase/supabase-js";

export async function profileSetPremiumActive(
  admin: SupabaseClient,
  userId: string,
  stripeCustomerId: string
): Promise<{ error: string | null }> {
  const { data, error } = await admin
    .from("profiles")
    .update({
      plan: "premium",
      subscription_status: "active",
      stripe_customer_id: stripeCustomerId,
    })
    .eq("id", userId)
    .select("id, plan, subscription_status, stripe_customer_id");

  if (error) {
    console.error("[stripe-profile] profileSetPremiumActive failed", error.message, `user=${userId.slice(0, 8)}…`);
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    console.error("[stripe-profile] profileSetPremiumActive updated 0 rows", `user=${userId.slice(0, 8)}…`);
    return { error: "No profile row matched this user id." };
  }

  console.info("[stripe-profile] profileSetPremiumActive ok", `user=${userId.slice(0, 8)}…`);
  return { error: null };
}

export async function profileSetFreeCanceled(admin: SupabaseClient, userId: string): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "canceled",
    })
    .eq("id", userId);

  if (error) {
    console.error("[stripe-profile] profileSetFreeCanceled failed", error.message, `user=${userId.slice(0, 8)}…`);
    return { error: error.message };
  }
  console.info("[stripe-profile] profileSetFreeCanceled ok", `user=${userId.slice(0, 8)}…`);
  return { error: null };
}

export async function profileSetFreeCanceledByStripeCustomer(
  admin: SupabaseClient,
  stripeCustomerId: string
): Promise<{ error: string | null }> {
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "canceled",
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("[stripe-profile] profileSetFreeCanceledByStripeCustomer failed", error.message, `cust=${stripeCustomerId.slice(0, 8)}…`);
    return { error: error.message };
  }
  console.info("[stripe-profile] profileSetFreeCanceledByStripeCustomer ok", `cust=${stripeCustomerId.slice(0, 8)}…`);
  return { error: null };
}

export async function profileFindUserIdByStripeCustomer(
  admin: SupabaseClient,
  stripeCustomerId: string
): Promise<string | null> {
  const { data, error } = await admin.from("profiles").select("id").eq("stripe_customer_id", stripeCustomerId).maybeSingle();

  if (error) {
    console.error("[stripe-profile] profileFindUserIdByStripeCustomer", error.message);
    return null;
  }
  return data?.id ?? null;
}
