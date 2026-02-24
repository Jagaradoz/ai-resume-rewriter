import Link from "next/link";

import { AuthButtons } from "@/components/auth/auth-buttons";

export function Navbar() {
    return (
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-4">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-foreground transition-colors hover:text-brand-orange">
                AI Resume Rewriter
            </Link>
            <div className="flex items-center gap-3">
                <AuthButtons />
            </div>
        </header>
    );
}
