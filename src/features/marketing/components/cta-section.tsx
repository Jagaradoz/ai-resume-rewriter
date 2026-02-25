import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

export function CtaSection() {
    return (
        <section className="border-t border-border bg-muted/30 px-6 py-20 md:py-24">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                    Ready to Rewrite?
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                    5 free rewrites per month. No credit card required.
                </p>
                <Button
                    asChild
                    className="mt-8 h-12 bg-brand-orange px-8 text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                >
                    <Link href="/signup">
                        Start Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </section>
    );
}
