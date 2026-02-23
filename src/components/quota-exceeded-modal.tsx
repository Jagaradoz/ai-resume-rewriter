"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Target, Palette } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/billing-actions";
import { useTransition } from "react";

interface QuotaExceededModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    limit: number;
}

const benefits = [
    {
        icon: Sparkles,
        title: "30 rewrites per month",
        description: "Generate bullet points without worrying about limits.",
    },
    {
        icon: Target,
        title: "3 variations per rewrite",
        description: "More options to find the perfect wording.",
    },
    {
        icon: Palette,
        title: "365-day history",
        description: "Access your past rewrites anytime.",
    },
];

export function QuotaExceededModal({ open, onOpenChange, limit }: QuotaExceededModalProps) {
    const [isPending, startTransition] = useTransition();

    function handleUpgrade() {
        startTransition(async () => {
            await createCheckoutSession();
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <DialogTitle className="text-xl font-extrabold tracking-tight">
                        Monthly Limit Reached
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        You&apos;ve used all{" "}
                        <span className="font-semibold text-foreground">{limit} free rewrites</span>{" "}
                        this month. Upgrade to keep going.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                    {benefits.map((b) => (
                        <div key={b.title} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
                                <b.icon className="h-3 w-3 text-brand-orange" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{b.title}</p>
                                <p className="text-xs text-muted-foreground">{b.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    <Button
                        onClick={handleUpgrade}
                        disabled={isPending}
                        className="h-11 w-full bg-brand-orange text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                    >
                        {isPending ? "Redirecting..." : "Upgrade to Pro"}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 w-full text-xs text-muted-foreground"
                    >
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
