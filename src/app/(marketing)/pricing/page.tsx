import { PricingCards } from "@/components/features/dashboard/pricing-cards";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@/lib/auth/config";
import { derivePlan, getSubscription } from "@/lib/dal/subscription";

export default async function PricingPage() {
    const session = await auth();
    let currentPlan: "free" | "pro" = "free";

    if (session?.user?.id) {
        const subscription = await getSubscription(session.user.id);
        currentPlan = derivePlan(subscription?.status);
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            {/* Content */}
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-16">
                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                    Simple, transparent pricing
                </h1>
                <p className="mt-3 text-center text-muted-foreground">
                    Start free. Upgrade when you need more.
                </p>

                <PricingCards
                    currentPlan={currentPlan}
                    isAuthenticated={!!session?.user}
                />
            </div>
        </div>
    );
}