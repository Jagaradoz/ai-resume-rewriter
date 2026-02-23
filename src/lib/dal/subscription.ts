import { db } from "@/lib/db";
import type { SubscriptionStatus } from "@/generated/prisma/client";

/**
 * Derive plan from subscription status.
 * ACTIVE, TRIALING, PAST_DUE → pro; everything else → free.
 */
export function derivePlan(
    status: SubscriptionStatus | null | undefined,
): "free" | "pro" {
    if (!status) return "free";
    const proStatuses: SubscriptionStatus[] = ["ACTIVE", "TRIALING", "PAST_DUE"];
    return proStatuses.includes(status) ? "pro" : "free";
}

export async function getSubscription(userId: string) {
    return db.subscription.findUnique({ where: { userId } });
}

export async function upsertSubscription(data: {
    userId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    canceledAt?: Date | null;
}) {
    return db.subscription.upsert({
        where: { userId: data.userId },
        create: data,
        update: {
            stripeSubscriptionId: data.stripeSubscriptionId,
            stripePriceId: data.stripePriceId,
            status: data.status,
            currentPeriodStart: data.currentPeriodStart,
            currentPeriodEnd: data.currentPeriodEnd,
            canceledAt: data.canceledAt,
        },
    });
}

export async function updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    canceledAt?: Date | null,
) {
    return db.subscription.update({
        where: { stripeSubscriptionId },
        data: {
            status,
            ...(canceledAt !== undefined && { canceledAt }),
        },
    });
}

export async function updateSubscriptionPeriod(
    stripeSubscriptionId: string,
    currentPeriodEnd: Date,
) {
    return db.subscription.update({
        where: { stripeSubscriptionId },
        data: { currentPeriodEnd },
    });
}
