import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border px-6 py-6">
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    AI Resume Rewriter
                </p>
                <nav className="flex gap-6">
                    <Link
                        href="/pricing"
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/signin"
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Sign In
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
