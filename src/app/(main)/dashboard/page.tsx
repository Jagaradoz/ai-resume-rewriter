import { redirect } from "next/navigation";

import { auth } from "@/features/auth/auth.config";
import { derivePlan, getSubscription, getUserQuota } from "@/features/billing/billing.dal";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { Navbar } from "@/shared/layout/navbar";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ upgraded?: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

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
