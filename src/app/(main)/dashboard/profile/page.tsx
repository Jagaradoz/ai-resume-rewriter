import { ArrowLeft, Calendar, Crown, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getUserWithSubscription } from "@/features/auth/auth.dal";
import { derivePlan, getQuotaLimit } from "@/features/billing/billing.dal";
import { QuotaBar } from "@/features/billing/components/quota-bar";
import { getTotalRewriteCount, getUserProviders } from "@/features/dashboard/dashboard.dal";
import { PLAN_CONFIG } from "@/shared/config/plan-config";
import { requireAuth } from "@/shared/helpers/require-auth";
import { Navbar } from "@/shared/layout/navbar";

export const metadata: Metadata = {
    title: "Profile",
    robots: { index: false },
};

export default async function ProfilePage() {
    const session = await requireAuth();

    const userId = session.user.id;

    const [user, providers, totalRewrites] = await Promise.all([
        getUserWithSubscription(userId),
        getUserProviders(userId),
        getTotalRewriteCount(userId),
    ]);

    if (!user) {
        redirect("/signin");
    }

    const entitlement = derivePlan(user.subscription?.status);
    const quotaLimit = getQuotaLimit(entitlement);
    const retentionDays = PLAN_CONFIG[entitlement].retentionDays;
    const hasPassword = !!user.password;

    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />

            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl space-y-8 p-6 md:p-8">
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Dashboard
                        </Link>
                        <h1 className="mt-3 text-lg font-extrabold tracking-tight text-foreground">
                            Profile
                        </h1>
                    </div>

                    {/* User Info */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            Account
                        </h2>
                        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt=""
                                        className="h-12 w-12 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                        {(session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-foreground">
                                        {session.user.name ?? "—"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Shield className="h-4 w-4" />
                                    <span>
                                        Connected via:{" "}
                                        {[
                                            ...providers.map((p) => p.charAt(0).toUpperCase() + p.slice(1)),
                                            ...(hasPassword ? ["Email"] : []),
                                        ].join(", ") || "—"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        Joined{" "}
                                        {new Intl.DateTimeFormat("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        }).format(user.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Plan & Usage */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            Plan & Usage
                        </h2>
                        <div className="rounded-lg border border-border bg-card p-5 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Crown className={`h-5 w-5 ${entitlement === "pro" ? "text-brand-orange" : "text-muted-foreground"}`} />
                                    <span className="font-bold text-foreground">
                                        {entitlement === "pro" ? "Pro Plan" : "Free Plan"}
                                    </span>
                                </div>
                                {entitlement === "pro" && user.subscription && (
                                    <span className="text-xs text-muted-foreground">
                                        Renews{" "}
                                        {new Intl.DateTimeFormat("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        }).format(user.subscription.currentPeriodEnd)}
                                    </span>
                                )}
                            </div>

                            {/* Quota bar */}
                            <QuotaBar
                                used={user.quotaUsed}
                                limit={quotaLimit}
                                entitlement={entitlement}
                            />

                            {/* Quick stats */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="rounded-md border border-border p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Total Rewrites
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-foreground">
                                        {totalRewrites}
                                    </p>
                                </div>
                                <div className="rounded-md border border-border p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Quota Resets
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-foreground">
                                        {new Intl.DateTimeFormat("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        }).format(user.quotaResetAt)}
                                    </p>
                                </div>
                                <div className="rounded-md border border-border p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Results per Rewrite
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-foreground">
                                        {entitlement === "pro" ? "3" : "2"}
                                    </p>
                                </div>
                                <div className="rounded-md border border-border p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        History Retention
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-foreground">
                                        {retentionDays} days
                                    </p>
                                </div>
                            </div>

                            {entitlement === "free" && (
                                <div className="rounded-md border border-brand-orange/30 bg-brand-orange/5 p-4">
                                    <p className="text-sm font-medium text-foreground">
                                        Upgrade to Pro — $3/mo
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        30 rewrites/month, 3 results per rewrite, 365-day history.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
