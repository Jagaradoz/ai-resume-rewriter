"use client";

import Link from "next/link";

interface QuotaBarProps {
    used: number;
    limit: number;
    entitlement: "free" | "pro";
}

export function QuotaBar({ used, limit, entitlement }: QuotaBarProps) {
    const pct = Math.min((used / limit) * 100, 100);
    const remaining = Math.max(0, limit - used);
    const exhausted = remaining === 0;

    return (
        <div className="flex flex-col gap-1.5">
            {/* Labels */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Monthly Rewrites
                </span>
                <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${exhausted ? "text-destructive" : "text-muted-foreground"
                        }`}
                >
                    {used} / {limit}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${exhausted ? "bg-destructive" : "bg-brand-orange"
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Upgrade CTA when exhausted */}
            {exhausted && entitlement === "free" && (
                <p className="text-[10px] font-bold tracking-wide text-destructive">
                    No rewrites left.{" "}
                    <Link
                        href="/pricing"
                        className="text-brand-blue underline underline-offset-2 hover:text-brand-blue/80"
                    >
                        Upgrade to Pro
                    </Link>{" "}
                    for 30/month.
                </p>
            )}
        </div>
    );
}
