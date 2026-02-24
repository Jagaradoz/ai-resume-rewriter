import { ArrowLeft, Calendar, Crown, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthButtons } from "@/components/auth/auth-buttons";
import { QuotaBar } from "@/components/features/dashboard/quota-bar";
import { auth } from "@/lib/auth";
import { getUserWithSubscription } from "@/lib/dal/user";
import { db } from "@/lib/db";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/signin");
    }

    const user = await getUserWithSubscription(session.user.id);
    if (!user) redirect("/signin");

    const entitlement = session.user.entitlement ?? "free";
    const quotaLimit = entitlement === "pro" ? 30 : 5;
    const retentionDays = entitlement === "pro" ? 365 : 7;

    // Get connected providers
    const accounts = await db.account.findMany({
        where: { userId: session.user.id },
        select: { provider: true },
    });
    const providers = accounts.map((a) => a.provider);
    const hasPassword = !!user.password;

    const totalRewrites = await db.rewrite.count({
        where: { userId: session.user.id }
    });

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
                        Profile
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
                <div className="mx-auto max-w-xl space-y-8 p-6 md:p-8">
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
