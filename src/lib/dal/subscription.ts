import { db } from "@/lib/db";
import type { SubscriptionStatus } from "@/generated/prisma/client";

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
