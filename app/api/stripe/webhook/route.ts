import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/env";
import { createServiceClient } from "@/lib/db";
import { getStripe } from "@/lib/stripe-server";
import {
  profileFindUserIdByStripeCustomer,
  profileSetFreeCanceled,
  profileSetFreeCanceledByStripeCustomer,
  profileSetPremiumActive,
} from "@/lib/stripe-profile";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    console.error("[stripe:webhook] missing stripe or webhook secret");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
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

  const admin = createServiceClient();
  if (!admin) {
    console.error("[stripe:webhook] no service client");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.user_id ?? null;
        const customerRaw = session.customer;
        const customerId = typeof customerRaw === "string" ? customerRaw : customerRaw?.id ?? null;

        if (!userId || !customerId) {
          console.error("[stripe:webhook] checkout.session.completed missing user_id or customer");
          break;
        }

        await profileSetPremiumActive(admin, userId, customerId);
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
          await profileSetPremiumActive(admin, userId, customerId);
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
          await profileSetFreeCanceled(admin, userId);
        } else if (customerId) {
          await profileSetFreeCanceledByStripeCustomer(admin, customerId);
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
