import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HistoryList } from "@/features/dashboard/components/history-list";
import { getUserRewrites } from "@/features/rewrite/rewrite.dal";
import { PLAN_CONFIG } from "@/shared/config/plan-config";
import { requireAuth } from "@/shared/helpers/require-auth";
import { Navbar } from "@/shared/layout/navbar";

export const metadata: Metadata = {
    title: "History",
    robots: { index: false },
};

interface HistoryPageProps {
    searchParams: Promise<{ cursor?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    const session = await requireAuth();

    const { cursor } = await searchParams;
    const entitlement = session.user.entitlement ?? "free";
    const retentionDays = PLAN_CONFIG[entitlement].retentionDays;
    const limit = 10;

    const rewrites = await getUserRewrites(session.user.id, {
        cursor,
        limit,
        retentionDays,
    });

    const hasMore = rewrites.length > limit;
    const rewriteItems = hasMore ? rewrites.slice(0, limit) : rewrites;
    const nextCursor = hasMore ? rewriteItems[rewriteItems.length - 1].id : undefined;

    const items = rewriteItems.map((r) => ({
        ...r,
        variations: r.variations as string[],
    }));

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl p-6 md:p-8">
                    <div className="mb-6 text-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Dashboard
                        </Link>
                        <h1 className="mt-3 text-lg font-extrabold tracking-tight text-foreground">
                            Rewrite History
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {entitlement === "pro"
                                ? "Your rewrites are kept for 365 days."
                                : "Your rewrites are kept for 7 days. Upgrade to Pro for 365-day retention."}
                        </p>
                    </div>

                    <HistoryList
                        items={items}
                        nextCursor={nextCursor}
                    />
                </div>
            </main>
        </div>
    );
}
