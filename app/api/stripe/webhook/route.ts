import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/env";
import { getStripe } from "@/lib/stripe-server";
import {
  profileFindUserIdByStripeCustomer,
  profileSetFreeCanceled,
  profileSetFreeCanceledByStripeCustomer,
  profileSetPremiumActive,
} from "@/lib/stripe-profile";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    console.error("[stripe:webhook] misconfigured", {
      hasStripeSecret: Boolean(stripe),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const body = await request.text();
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    console.error("[stripe:webhook] signature verify failed", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  console.info("[stripe:webhook] event", event.type, event.id);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[stripe:webhook] no service client");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId =
          (typeof session.metadata?.user_id === "string" && session.metadata.user_id.trim()) ||
          (typeof session.client_reference_id === "string" && session.client_reference_id.trim()) ||
          null;
        const customerRaw = session.customer;
        const customerId = typeof customerRaw === "string" ? customerRaw : customerRaw?.id ?? null;

        if (!userId || !customerId) {
          console.error("[stripe:webhook] checkout.session.completed missing user_id or customer");
          break;
        }

        const { error: profErr } = await profileSetPremiumActive(admin, userId, customerId);
        if (profErr) {
          console.error("[stripe:webhook] checkout.session.completed profile update failed");
          return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
        }
        console.info("[stripe:webhook] checkout.session.completed profile premium ok", userId.slice(0, 8));
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.subscription;
        const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id ?? null;
        const custRef = invoice.customer;
        const customerId = typeof custRef === "string" ? custRef : custRef?.id ?? null;

        if (!customerId) break;

        let userId = subscriptionId
          ? ((await stripe.subscriptions.retrieve(subscriptionId)).metadata?.user_id ?? null)
          : null;

        if (!userId) {
          userId = await profileFindUserIdByStripeCustomer(admin, customerId);
        }

        if (userId) {
          const { error: profErr } = await profileSetPremiumActive(admin, userId, customerId);
          if (profErr) {
            console.error("[stripe:webhook] invoice.payment_succeeded profile update failed");
            return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
          }
          console.info("[stripe:webhook] invoice.payment_succeeded profile premium ok", userId.slice(0, 8));
        } else {
          console.error("[stripe:webhook] invoice.payment_succeeded could not resolve user_id");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id ?? null;
        const custRef = subscription.customer;
        const customerId = typeof custRef === "string" ? custRef : custRef?.id ?? null;

        if (userId) {
          const { error: profErr } = await profileSetFreeCanceled(admin, userId);
          if (profErr) {
            console.error("[stripe:webhook] subscription.deleted profile update failed (by user)");
            return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
          }
          console.info("[stripe:webhook] subscription.deleted profile free ok", userId.slice(0, 8));
        } else if (customerId) {
          const { error: profErr } = await profileSetFreeCanceledByStripeCustomer(admin, customerId);
          if (profErr) {
            console.error("[stripe:webhook] subscription.deleted profile update failed (by customer)");
            return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
          }
          console.info("[stripe:webhook] subscription.deleted profile free ok (customer)", customerId.slice(0, 8));
        } else {
          console.error("[stripe:webhook] subscription.deleted missing user and customer");
        }
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("[stripe:webhook] handler error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
