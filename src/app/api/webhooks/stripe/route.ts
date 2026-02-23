import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
    upsertSubscription,
    updateSubscriptionStatus,
    updateSubscriptionPeriod,
} from "@/lib/dal/subscription";
import { eventExists, createEvent } from "@/lib/dal/subscription-event";
import type { SubscriptionStatus } from "@/generated/prisma/client";
import type Stripe from "stripe";

/**
 * Map Stripe subscription status string to our SubscriptionStatus enum.
 */
function mapStripeStatus(status: string): SubscriptionStatus {
    const map: Record<string, SubscriptionStatus> = {
        active: "ACTIVE",
        trialing: "TRIALING",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        incomplete: "INCOMPLETE",
    };
    return map[status] ?? "INCOMPLETE";
}

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events with:
 * - Signature verification via STRIPE_WEBHOOK_SECRET
 * - Idempotency via stripeEventId unique check
 * - 5 event types: checkout.session.completed, invoice.paid,
 *   invoice.payment_failed, customer.subscription.updated,
 *   customer.subscription.deleted
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 },
        );
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Unknown verification error";
        console.error(`Webhook signature verification failed: ${message}`);
        return NextResponse.json(
            { error: `Webhook Error: ${message}` },
            { status: 400 },
        );
    }

    // Idempotency check — skip if already processed
    if (await eventExists(event.id)) {
        return NextResponse.json({ received: true, duplicate: true });
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
                // Log unknown events but don't act on them
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error(`Error processing webhook ${event.type}:`, err);
        // Return 200 to prevent Stripe from retrying — log for manual investigation
        return NextResponse.json({ received: true, error: "Processing failed" });
    }

    return NextResponse.json({ received: true });
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    eventId: string,
) {
    const userId = session.metadata?.userId;
    if (!userId || !session.subscription) return;

    const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

    // Fetch the full subscription from Stripe (authoritative source)
    const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);

    const subscription = await upsertSubscription({
        userId,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: stripeSub.items.data[0]?.price.id ?? "",
        status: mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(stripeSub.items.data[0].current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.items.data[0].current_period_end * 1000),
    });

    // Update Stripe customer ID on user if not set
    await db.user.update({
        where: { id: userId },
        data: {
            stripeCustomerId:
                typeof session.customer === "string"
                    ? session.customer
                    : session.customer?.id,
        },
    });

    await createEvent({
        subscriptionId: subscription.id,
        stripeEventId: eventId,
        eventType: "checkout.session.completed",
        payload: { sessionId: session.id, stripeSubscriptionId: stripeSub.id },
    });
}

async function handleInvoicePaid(
    invoice: Stripe.Invoice,
    eventId: string,
) {
    // In Stripe SDK v20, subscription is nested in parent.subscription_details
    const rawSubId = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof rawSubId === "string" ? rawSubId : rawSubId?.id ?? null;
    if (!subscriptionId) return;

    // Fetch the full subscription to get updated period end
    const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);

    await updateSubscriptionPeriod(
        subscriptionId,
        new Date(stripeSub.items.data[0].current_period_end * 1000),
    );

    const dbSub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
    });

    if (dbSub) {
        await createEvent({
            subscriptionId: dbSub.id,
            stripeEventId: eventId,
            eventType: "invoice.paid",
            payload: { invoiceId: invoice.id },
        });
    }
}

async function handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
    eventId: string,
) {
    const rawSubId = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof rawSubId === "string" ? rawSubId : rawSubId?.id ?? null;
    if (!subscriptionId) return;

    await updateSubscriptionStatus(subscriptionId, "PAST_DUE");

    const dbSub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
    });

    if (dbSub) {
        await createEvent({
            subscriptionId: dbSub.id,
            stripeEventId: eventId,
            eventType: "invoice.payment_failed",
            payload: { invoiceId: invoice.id },
        });
    }
}

async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    eventId: string,
) {
    const dbSub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSub) return;

    await upsertSubscription({
        userId: dbSub.userId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id ?? dbSub.stripePriceId,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
        canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
    });

    await createEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "customer.subscription.updated",
        payload: { status: subscription.status },
    });
}

async function handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    eventId: string,
) {
    const dbSub = await db.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSub) return;

    await updateSubscriptionStatus(
        subscription.id,
        "CANCELED",
        new Date(),
    );

    await createEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "customer.subscription.deleted",
        payload: { status: "canceled" },
    });
}
