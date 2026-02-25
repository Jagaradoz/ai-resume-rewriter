import { NextResponse } from "next/server";

import { deleteStaleRewrites } from "@/features/rewrite/rewrite.dal";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const deletedCount = await deleteStaleRewrites();

        console.log(`[cron:cleanup-stale] Deleted ${deletedCount} stale rewrite(s)`);

        return NextResponse.json({
            ok: true,
            deletedCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[cron:cleanup-stale] Failed:", error);
        return NextResponse.json(
            { error: "Failed to clean up stale rewrites" },
            { status: 500 },
        );
    }
}
