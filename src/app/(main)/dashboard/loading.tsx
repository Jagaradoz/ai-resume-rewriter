export default function DashboardLoading() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Navbar skeleton */}
            <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </header>

            {/* Two-panel skeleton */}
            <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
                {/* Left panel */}
                <section className="flex h-full flex-col border-b border-border bg-background p-6 md:p-8 lg:border-b-0 lg:border-r">
                    <div className="mx-auto w-full max-w-3xl space-y-6">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
                        <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                        <div className="flex justify-end">
                            <div className="h-14 w-36 animate-pulse rounded-lg bg-muted" />
                        </div>
                    </div>
                </section>

                {/* Right panel */}
                <section className="flex h-full flex-col bg-muted/30 p-6 md:p-8">
                    <div className="mx-auto w-full max-w-3xl space-y-4">
                        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
                        <div className="h-32 w-full animate-pulse rounded-lg bg-muted/60" />
                        <div className="h-32 w-full animate-pulse rounded-lg bg-muted/60" />
                    </div>
                </section>
            </main>
        </div>
    );
}
