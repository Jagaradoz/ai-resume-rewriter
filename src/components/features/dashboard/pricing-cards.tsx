"use client";

import { Check, Zap } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCheckoutSession, createPortalSession } from "@/lib/actions/billing-actions";

interface PricingCardsProps {
    currentPlan: "free" | "pro";
    isAuthenticated: boolean;
}

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "/month",
        description: "Get started with AI resume rewriting",
        features: [
            "5 rewrites per month",
            "2 variations per rewrite",
            "7-day history",
            "GPT-4o-mini powered",
        ],
        cta: "Current Plan",
        planKey: "free" as const,
    },
    {
        name: "Pro",
        price: "$3",
        period: "/month",
        description: "Unlock the full potential of your resume",
        features: [
            "30 rewrites per month",
            "3 variations per rewrite",
            "365-day history",
            "GPT-4o-mini powered",
            "Stripe billing portal",
        ],
        cta: "Upgrade to Pro",
        planKey: "pro" as const,
    },
];

export function PricingCards({ currentPlan, isAuthenticated }: PricingCardsProps) {
    const [isPending, startTransition] = useTransition();

    function handleUpgrade() {
        startTransition(async () => {
            await createCheckoutSession();
        });
    }

    function handleManage() {
        startTransition(async () => {
            await createPortalSession();
        });
    }

    return (
        <div className="mt-12 grid w-full gap-8 sm:grid-cols-2">
            {plans.map((plan) => {
                const isCurrentPlan = plan.planKey === currentPlan;
                const isPro = plan.planKey === "pro";

                return (
                    <Card
                        key={plan.planKey}
                        className={`relative flex flex-col ${isPro
                                ? "border-2 border-brand-orange shadow-md"
                                : "border border-border"
                            }`}
                    >
                        {isPro && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange-foreground">
                                    <Zap className="h-3 w-3" />
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <CardHeader className="pb-4 pt-8">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                {plan.name}
                            </CardTitle>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-black tracking-tighter text-foreground">
                                    {plan.price}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {plan.period}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {plan.description}
                            </p>
                        </CardHeader>

                        <CardContent className="flex flex-1 flex-col">
                            <ul className="flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-2.5 text-sm text-foreground"
                                    >
                                        <Check className="h-4 w-4 shrink-0 text-brand-orange" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                {!isAuthenticated ? (
                                    <Button
                                        asChild
                                        className={`h-11 w-full text-xs font-bold uppercase tracking-widest ${isPro
                                                ? "bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
                                                : ""
                                            }`}
                                        variant={isPro ? "default" : "outline"}
                                    >
                                        <a href="/signin">
                                            Sign in to {isPro ? "Upgrade" : "Start"}
                                        </a>
                                    </Button>
                                ) : isCurrentPlan && isPro ? (
                                    <Button
                                        onClick={handleManage}
                                        disabled={isPending}
                                        variant="outline"
                                        className="h-11 w-full text-xs font-bold uppercase tracking-widest"
                                    >
                                        {isPending
                                            ? "Loading..."
                                            : "Manage Subscription"}
                                    </Button>
                                ) : isCurrentPlan ? (
                                    <Button
                                        disabled
                                        variant="outline"
                                        className="h-11 w-full text-xs font-bold uppercase tracking-widest"
                                    >
                                        Current Plan
                                    </Button>
                                ) : isPro ? (
                                    <Button
                                        onClick={handleUpgrade}
                                        disabled={isPending}
                                        className="h-11 w-full bg-brand-orange text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                                    >
                                        {isPending
                                            ? "Redirecting..."
                                            : "Upgrade to Pro"}
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-11 w-full text-xs font-bold uppercase tracking-widest"
                                    >
                                        <a href="/dashboard">Go to Dashboard</a>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
