"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-tight text-foreground">
                Something Went Wrong
            </h1>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
                An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
                <p className="mt-1 text-xs text-muted-foreground/60">
                    Reference: {error.digest}
                </p>
            )}
            <div className="mt-8 flex items-center gap-4">
                <Button
                    onClick={reset}
                    className="h-11 bg-brand-orange px-8 text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                >
                    Try Again
                </Button>
                <Button
                    asChild
                    variant="outline"
                    className="h-11 px-8 text-xs font-bold uppercase tracking-widest"
                >
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
