export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="grid min-h-screen lg:grid-cols-[1.5fr_1fr]">
            {/* Left Brand Panel — desktop only */}
            <section className="hidden bg-muted/30 border-r-2 border-border p-12 lg:flex flex-col justify-between">
                <div>
                    <div className="inline-flex items-center gap-3 border-2 border-foreground bg-background px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground">
                        <div className="h-2 w-2 bg-brand-orange rounded-sm animate-pulse" />
                        AI RESUME REWRITER
                    </div>
                    <div className="mt-24 space-y-6">
                        <h1 className="text-6xl font-black leading-[1.1] tracking-tighter xl:text-7xl">
                            NO MORE <br />
                            <span className="text-muted-foreground">FLUFF.</span>
                        </h1>
                        <p className="max-w-md text-lg font-medium text-muted-foreground leading-relaxed border-l-4 border-brand-orange pl-4">
                            Raw, unfiltered AI analysis. Transform your resume into an undeniable career asset.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Trusted implicitly by engineers at
                    </p>
                    <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-widest font-extrabold pb-8">
                        {["Google", "Amazon", "Stripe", "Netflix"].map((company) => (
                            <span
                                key={company}
                                className="border-b-2 border-foreground pb-1"
                            >
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Form Panel */}
            <section className="flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background">
                {children}
            </section>
        </main>
    );
}
