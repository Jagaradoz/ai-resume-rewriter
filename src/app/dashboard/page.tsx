import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { DashboardShell } from "@/components/dashboard-shell";
import { getUserQuota } from "@/lib/dal/quota";
import Link from "next/link";
import { Zap, Sparkles } from "lucide-react";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ upgraded?: string }>;
}) {
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

    const { upgraded } = await searchParams;
    const justUpgraded = upgraded === "true";

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
                <h1 className="text-lg font-extrabold tracking-tight text-foreground">
                    AI Resume Rewriter
                </h1>
                <div className="flex items-center gap-3">
                    {/* Credit Count Badge */}
                    <div className="hidden items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 sm:inline-flex">
                        <Sparkles className="h-3 w-3 text-brand-orange" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {Math.max(0, quotaLimit - quotaUsed)}/{quotaLimit} left
                        </span>
                    </div>

                    {/* Plan Badge + Upgrade/Manage Link */}
                    {entitlement === "pro" ? (
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 rounded-md bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange transition-colors hover:bg-brand-orange/20"
                        >
                            <Zap className="h-3 w-3" />
                            Pro · Manage
                        </Link>
                    ) : (
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-brand-orange hover:text-brand-orange"
                        >
                            Free · Upgrade
                        </Link>
                    )}
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

