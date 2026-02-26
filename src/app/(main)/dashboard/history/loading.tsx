export default function HistoryLoading() {
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            {/* Header skeleton */}
            <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </header>

            {/* List skeleton */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-3 p-6 md:p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border border-border bg-card p-4"
                        >
                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
