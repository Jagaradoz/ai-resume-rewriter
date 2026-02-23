import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { DashboardShell } from "@/components/dashboard-shell";
import { getUserQuota } from "@/lib/dal/quota";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    const entitlement = session.user.entitlement ?? "free";
    const plan = entitlement === "pro" ? "pro" : "free";

    // Read quota fresh from DB on every page load — JWT is stale after rewrites
    const { used: quotaUsed, limit: quotaLimit } = await getUserQuota(
        session.user.id,
        plan,
    );

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
                <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                    AI Resume Rewriter
                </h1>
                <div className="flex items-center gap-3">
                    <AuthButtons />
                </div>
            </header>

            {/* Two-Panel Dashboard */}
            <DashboardShell
                entitlement={entitlement}
                quotaUsed={quotaUsed}
                quotaLimit={quotaLimit}
            />
        </div>
    );
}
