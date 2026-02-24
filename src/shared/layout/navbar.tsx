import Link from "next/link";

import { AuthButtons } from "@/features/auth/components/auth-buttons";

export function Navbar() {
    return (
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
            <Link href="/dashboard" className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                AI Resume Rewriter
            </Link>
            <AuthButtons />
        </header>
    );
}
