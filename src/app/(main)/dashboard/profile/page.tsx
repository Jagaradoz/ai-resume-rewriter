import { redirect } from "next/navigation";

import { auth } from "@/features/auth/auth.config";
import { derivePlan, getSubscription, getUserQuota } from "@/features/billing/billing.dal";
import { getUserProviders, getTotalRewriteCount } from "@/features/dashboard/dashboard.dal";
import { PLAN_CONFIG } from "@/shared/config/plan-config";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/signin");
    }

    const userId = session.user.id;

    const [subscription, providers, totalRewrites] = await Promise.all([
        getSubscription(userId),
        getUserProviders(userId),
        getTotalRewriteCount(userId),
    ]);

    const plan = derivePlan(subscription?.status);
    const { used: quotaUsed, limit: quotaLimit } = await getUserQuota(userId, plan);
    const retentionDays = PLAN_CONFIG[plan].retentionDays;

    return (
        <div className="mx-auto max-w-2xl p-6 md:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Your account details and usage.
            </p>

            <div className="mt-8 space-y-6">
                {/* Account Info */}
                <section className="rounded-lg border border-border p-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Account
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Name</dt>
                            <dd className="font-medium text-foreground">{session.user.name ?? "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Email</dt>
                            <dd className="font-medium text-foreground">{session.user.email ?? "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Providers</dt>
                            <dd className="font-medium capitalize text-foreground">
                                {providers.length > 0 ? providers.join(", ") : "Credentials"}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Plan Info */}
                <section className="rounded-lg border border-border p-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Plan
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Current Plan</dt>
                            <dd className="font-bold uppercase text-foreground">{plan}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Monthly Quota</dt>
                            <dd className="font-medium text-foreground">{quotaUsed} / {quotaLimit}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">History Retention</dt>
                            <dd className="font-medium text-foreground">{retentionDays} days</dd>
                        </div>
                    </dl>
                </section>

                {/* Usage */}
                <section className="rounded-lg border border-border p-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Usage
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Total Rewrites</dt>
                            <dd className="font-medium text-foreground">{totalRewrites}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    );
}
