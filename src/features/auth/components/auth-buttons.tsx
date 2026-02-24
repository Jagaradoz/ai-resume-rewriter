"use client";

import { Crown, History, LogIn, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return "?";
}

export function AuthButtons() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
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

    const entitlement = session.user.entitlement ?? "free";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="size-8">
                        {session.user.image && (
                            <AvatarImage
                                src={session.user.image}
                                alt={session.user.name ?? "User"}
                            />
                        )}
                        <AvatarFallback>
                            {getInitials(session.user.name, session.user.email)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none">
                            {session.user.name ?? "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard/history")}>
                        <History className="mr-2 h-4 w-4" />
                        History
                    </DropdownMenuItem>
                    {entitlement === "free" && (
                        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                            <Crown className="mr-2 h-4 w-4 text-brand-orange" />
                            <span className="text-brand-orange font-medium">Upgrade to Pro</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
