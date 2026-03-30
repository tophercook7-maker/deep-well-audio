import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePublicSiteUrlStrict } from "@/lib/env";
import { getStripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

/** Safe for JSON responses — no secrets. */
const CHECKOUT_UNAVAILABLE =
  "We couldn't open secure checkout right now. Please try again in a moment.";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
  }

  const siteUrl = resolvePublicSiteUrlStrict();
  if (!siteUrl) {
    return NextResponse.json(
      { error: "Checkout redirects are not configured yet. Set NEXT_PUBLIC_SITE_URL in production." },
      { status: 503 }
    );
  }

  // TEMP: hardcoded Stripe test prices to verify checkout flow ($9/mo, $90/yr)
  const priceMonthly = "price_1TG3MX2LVfewrTUsepuRzk33";
  const priceYearly = "price_1TG76I2LVfewrTUslk95dddk";
  if (!priceMonthly || !priceYearly) {
    return NextResponse.json(
      {
        error: !priceMonthly ? "The monthly plan is not configured yet." : "The yearly plan is not configured yet.",
        debug: {
          hasMonthly: Boolean(priceMonthly),
          hasYearly: Boolean(priceYearly),
          monthlyPrefix: priceMonthly ? priceMonthly.slice(0, 8) : null,
          yearlyPrefix: priceYearly ? priceYearly.slice(0, 8) : null,
        },
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { price?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const priceType = body.price === "yearly" ? "yearly" : "monthly";
  const priceId = priceType === "yearly" ? priceYearly : priceMonthly;

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

  const customerId =
    profile && typeof profile.stripe_customer_id === "string" ? profile.stripe_customer_id.trim() || null : null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/library?upgraded=true`,
      cancel_url: `${siteUrl}/pricing`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      ...(customerId
        ? { customer: customerId }
        : user.email
          ? { customer_email: user.email }
          : {}),
    });

    if (!session.url) {
      return NextResponse.json({ error: CHECKOUT_UNAVAILABLE }, { status: 502 });
    }

    console.info(
      "[stripe:create-checkout-session] session created",
      session.id,
      priceType,
      `user=${user.id.slice(0, 8)}…`
    );

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe:create-checkout-session]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: CHECKOUT_UNAVAILABLE }, { status: 502 });
  }
}
