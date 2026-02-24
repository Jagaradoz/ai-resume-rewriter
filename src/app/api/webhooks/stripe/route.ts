import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/features/billing/billing.client";
import { eventExists } from "@/features/billing/billing.dal";
import {
    handleCheckoutCompleted,
    handleInvoicePaid,
    handleInvoicePaymentFailed,
    handleSubscriptionDeleted,
    handleSubscriptionUpdated,
} from "@/features/billing/billing.webhooks";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 },
        );
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 },
        );
    }

    // Idempotency check
    if (await eventExists(event.id)) {
        return NextResponse.json({ received: true, skipped: true });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(
                    event.data.object as Stripe.Checkout.Session,
                    event.id,
                );
                break;

            case "invoice.paid":
                await handleInvoicePaid(
                    event.data.object as Stripe.Invoice,
                    event.id,
                );
                break;

            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(
                    event.data.object as Stripe.Invoice,
                    event.id,
                );
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(
                    event.data.object as Stripe.Subscription,
                    event.id,
                );
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(
                    event.data.object as Stripe.Subscription,
                    event.id,
                );
                break;

            default:
                console.log(`[stripe] Unhandled event: ${event.type}`);
        }
    } catch (error) {
        console.error(`[stripe] Error processing ${event.type}:`, error);
        return NextResponse.json(
            { error: "Webhook handler error" },
            { status: 500 },
        );
    }

    return NextResponse.json({ received: true });
}
