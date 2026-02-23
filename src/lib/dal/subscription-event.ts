import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Check if a Stripe event has already been processed (idempotency).
 */
export async function eventExists(stripeEventId: string): Promise<boolean> {
    const event = await db.subscriptionEvent.findUnique({
        where: { stripeEventId },
        select: { id: true },
    });
    return !!event;
}

/**
 * Log a Stripe webhook event for audit purposes.
 */
export async function createEvent(data: {
    subscriptionId: string;
    stripeEventId: string;
    eventType: string;
    payload: Prisma.InputJsonValue;
}) {
    return db.subscriptionEvent.create({ data });
}
