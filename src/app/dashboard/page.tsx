import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { DashboardShell } from "@/components/dashboard-shell";
import { getUserQuota } from "@/lib/dal/quota";
import { getSubscription, derivePlan } from "@/lib/dal/subscription";
import Link from "next/link";

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
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
                <Link href="/" className="text-lg font-extrabold tracking-tight text-foreground transition-colors hover:text-brand-orange">
                    AI Resume Rewriter
                </Link>
                <div className="flex items-center gap-3">
                    <AuthButtons />
                </div>
            </header>

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

