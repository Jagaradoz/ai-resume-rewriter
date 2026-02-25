import { NextResponse } from "next/server";

import { resetMonthlyQuotas } from "@/features/billing/billing.dal";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const resetCount = await resetMonthlyQuotas();

        console.log(`[cron:reset-quotas] Reset ${resetCount} user(s)`);

        return NextResponse.json({
            ok: true,
            resetCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[cron:reset-quotas] Failed:", error);
        return NextResponse.json(
            { error: "Failed to reset quotas" },
            { status: 500 },
        );
    }
}
