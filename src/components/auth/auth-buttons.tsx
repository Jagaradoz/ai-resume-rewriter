"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export function AuthButtons() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
        );
    }

    if (!session) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
            >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
                {session.user.name ?? session.user.email}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
    );
}
