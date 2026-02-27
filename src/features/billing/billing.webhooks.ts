import type Stripe from "stripe";

import { updateStripeCustomerId } from "@/features/auth/auth.dal";
import { getStripe } from "@/features/billing/billing.client";
import {
    createEvent,
    getSubscriptionByStripeId,
    tryCreateEvent,
    updateSubscriptionPeriod,
    updateSubscriptionStatus,
    upsertSubscription,
} from "@/features/billing/billing.dal";
import type { SubscriptionStatus } from "@/shared/db/client";
import { redisDel } from "@/shared/redis/client";
import { quotaCacheKey } from "@/shared/redis/keys";

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

export async function handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    eventId: string,
) {
    const userId = session.metadata?.userId;
    if (!userId || !session.subscription) {
        throw new Error(`[checkout] Missing userId or subscription in session ${session.id}`);
    }

    const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

    const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);

    const customerId =
        typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

    // Upsert subscription and update customer ID together
    const subscription = await upsertSubscription({
        userId,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: stripeSub.items.data[0]?.price.id ?? "",
        status: mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(stripeSub.items.data[0].current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.items.data[0].current_period_end * 1000),
    });

    if (customerId) {
        await updateStripeCustomerId(userId, customerId);
    }

    try { await redisDel(quotaCacheKey(userId)); } catch { /* non-critical */ }

    await createEvent({
        subscriptionId: subscription.id,
        stripeEventId: eventId,
        eventType: "checkout.session.completed",
        payload: { sessionId: session.id, stripeSubscriptionId: stripeSub.id },
    });
}

export async function handleInvoicePaid(
    invoice: Stripe.Invoice,
    eventId: string,
) {
    const rawSubId = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof rawSubId === "string" ? rawSubId : rawSubId?.id ?? null;
    if (!subscriptionId) return;

    const dbSub = await getSubscriptionByStripeId(subscriptionId);
    if (!dbSub) {
        // Subscription not yet in DB (checkout event may arrive later).
        // Return without recording event so Stripe will retry.
        throw new Error(`[invoice.paid] Subscription ${subscriptionId} not in DB yet — will retry`);
    }

    const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);

    await updateSubscriptionPeriod(
        subscriptionId,
        new Date(stripeSub.items.data[0].current_period_end * 1000),
    );

    await createEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "invoice.paid",
        payload: { invoiceId: invoice.id },
    });
}

export async function handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
    eventId: string,
) {
    const rawSubId = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof rawSubId === "string" ? rawSubId : rawSubId?.id ?? null;
    if (!subscriptionId) return;

    // Check subscription exists before updating
    const dbSub = await getSubscriptionByStripeId(subscriptionId);
    if (!dbSub) return;

    await updateSubscriptionStatus(subscriptionId, "PAST_DUE");

    // Record event atomically — if it already exists, skip (idempotent)
    await tryCreateEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "invoice.payment_failed",
        payload: { invoiceId: invoice.id },
    });
}

export async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    eventId: string,
) {
    const dbSub = await getSubscriptionByStripeId(subscription.id);
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

    try { await redisDel(quotaCacheKey(dbSub.userId)); } catch { /* non-critical */ }

    await createEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "customer.subscription.updated",
        payload: { status: subscription.status },
    });
}

export async function handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    eventId: string,
) {
    const dbSub = await getSubscriptionByStripeId(subscription.id);
    if (!dbSub) return;

    await updateSubscriptionStatus(
        subscription.id,
        "CANCELED",
        new Date(),
    );

    try { await redisDel(quotaCacheKey(dbSub.userId)); } catch { /* non-critical */ }

    await createEvent({
        subscriptionId: dbSub.id,
        stripeEventId: eventId,
        eventType: "customer.subscription.deleted",
        payload: { status: "canceled" },
    });
}
