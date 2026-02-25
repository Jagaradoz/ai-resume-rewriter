import type { Metadata } from "next";

import { derivePlan, getSubscription, getUserQuota } from "@/features/billing/billing.dal";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { requireAuth } from "@/shared/helpers/require-auth";
import { Navbar } from "@/shared/layout/navbar";

export const metadata: Metadata = {
    title: "Dashboard",
    robots: { index: false },
};

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ upgraded?: string }>;
}) {
    const session = await requireAuth();

    // Read plan fresh from DB — JWT entitlement can be stale after webhook updates
    const subscription = await getSubscription(session.user.id);
    const plan = derivePlan(subscription?.status);
    const entitlement = plan;

    // Read quota fresh from DB on every page load — JWT is stale after rewrites
    const { used: quotaUsed, limit: quotaLimit } = await getUserQuota(
        session.user.id,
        plan,
    );

    const { upgraded } = await searchParams;
    const justUpgraded = upgraded === "true";

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />
            {/* Two-Panel Dashboard */}
            <DashboardShell
                entitlement={entitlement}
                quotaUsed={quotaUsed}
                quotaLimit={quotaLimit}
                justUpgraded={justUpgraded}
            />
        </div>
    );
}
