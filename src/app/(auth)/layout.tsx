export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="grid min-h-screen lg:grid-cols-[1.2fr_1fr]">
            {/* Left Brand Panel — desktop only */}
            <section className="hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-r border-border p-10 lg:flex">
                <div className="mx-auto flex h-full max-w-lg flex-col justify-between">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            <svg
                                className="h-4 w-4 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
                                />
                            </svg>
                            AI RESUME REWRITER
                        </p>
                        <h1 className="mt-8 text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                            A calmer sign-in for serious career moves.
                        </h1>
                        <p className="mt-5 max-w-md text-muted-foreground leading-relaxed">
                            New interface, cleaner components, and faster access to
                            AI-powered rewrite sessions.
                        </p>
                    </div>
                    <div className="space-y-3 rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Trusted by applicants from
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {["Google", "Amazon", "Stripe", "Notion"].map((company) => (
                                <span
                                    key={company}
                                    className="rounded-lg border border-border bg-background px-3 py-1 font-medium"
                                >
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Form Panel */}
            <section className="flex items-center justify-center px-4 py-10 sm:px-6">
                {children}
            </section>
        </main>
    );
}
