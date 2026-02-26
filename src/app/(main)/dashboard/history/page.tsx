import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthButtons } from "@/features/auth/components/auth-buttons";
import { HistoryList } from "@/features/dashboard/components/history-list";
import { getUserRewrites } from "@/features/rewrite/rewrite.dal";
import { PLAN_CONFIG } from "@/shared/config/plan-config";
import { requireAuth } from "@/shared/helpers/require-auth";

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
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                        Rewrite History
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {entitlement === "pro" ? "Pro" : "Free"}
                    </span>
                    <AuthButtons />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl p-6 md:p-8">
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground">
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
