import Link from "next/link";

import { Navbar } from "@/shared/layout/navbar";
import { Button } from "@/shared/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex flex-1 flex-col items-center justify-center px-6">
                <span className="text-6xl font-black tracking-tighter text-brand-orange sm:text-8xl">
                    404
                </span>
                <h1 className="mt-4 text-2xl font-extrabold uppercase tracking-tight text-foreground">
                    Page Not Found
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or has
                    been moved.
                </p>
                <Button
                    asChild
                    className="mt-8 h-11 bg-brand-orange px-8 text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                >
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </main>
        </div>
    );
}
