import { db } from "@/lib/db/client";

const QUOTA_LIMITS = { free: 5, pro: 30 } as const;

export function getQuotaLimit(plan: "free" | "pro"): number {
    return QUOTA_LIMITS[plan];
}

/**
 * Atomically checks if the user is under their quota limit and increments.
 * Returns ok=false if quota is already exceeded — no increment performed.
 */
export async function checkAndIncrementQuota(
    userId: string,
    plan: "free" | "pro",
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
    plan: "free" | "pro",
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
