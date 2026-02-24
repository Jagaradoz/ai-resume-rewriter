import { PLAN_CONFIG } from "@/shared/config/plan-config";
import type { Plan } from "@/shared/config/plan-config";
import { db, type Prisma, type SubscriptionStatus } from "@/shared/db/client";

// ─── Plan Derivation ─────────────────────────────────────────────────────────

/**
 * Derive plan from subscription status.
 * ACTIVE, TRIALING, PAST_DUE → pro; everything else → free.
 */
export function derivePlan(
    status: SubscriptionStatus | null | undefined,
): Plan {
    if (!status) return "free";
    const proStatuses: SubscriptionStatus[] = ["ACTIVE", "TRIALING", "PAST_DUE"];
    return proStatuses.includes(status) ? "pro" : "free";
}

// ─── Subscription ────────────────────────────────────────────────────────────

export async function getSubscription(userId: string) {
    return db.subscription.findUnique({ where: { userId } });
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return db.subscription.findUnique({ where: { stripeSubscriptionId } });
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

// ─── Quota ────────────────────────────────────────────────────────────────────

export function getQuotaLimit(plan: Plan): number {
    return PLAN_CONFIG[plan].quotaLimit;
}

/**
 * Atomically checks if the user is under their quota limit and increments.
 * Returns ok=false if quota is already exceeded — no increment performed.
 */
export async function checkAndIncrementQuota(
    userId: string,
    plan: Plan,
): Promise<{ ok: boolean; used: number; limit: number }> {
    const limit = getQuotaLimit(plan);

    const result = await db.$queryRaw<{ quota_used: number }[]>`
        UPDATE users
        SET quota_used = quota_used + 1
        WHERE id = ${userId} AND quota_used < ${limit}
        RETURNING quota_used
    `;

    if (result.length === 0) {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { quotaUsed: true },
        });
        return { ok: false, used: user?.quotaUsed ?? limit, limit };
    }

    return { ok: true, used: result[0].quota_used, limit };
}

/**
 * Reads current quota without modifying it. Used by dashboard/QuotaBar.
 */
export async function getUserQuota(
    userId: string,
    plan: Plan,
): Promise<{ used: number; limit: number }> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { quotaUsed: true },
    });
    return { used: user?.quotaUsed ?? 0, limit: getQuotaLimit(plan) };
}

/**
 * Bulk-resets quotaUsed for all users due for a monthly reset.
 * Called by Vercel Cron on the 1st of each month.
 */
export async function resetMonthlyQuotas(): Promise<number> {
    const result = await db.$executeRaw`
        UPDATE users
        SET quota_used    = 0,
            quota_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        WHERE quota_reset_at < DATE_TRUNC('month', NOW())
    `;
    return result;
}

// ─── Subscription Events ─────────────────────────────────────────────────────

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
