export default function RootLoading() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Navbar skeleton */}
            <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            </header>

            {/* Content skeleton */}
            <main className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xl space-y-4 p-6">
                    <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="mt-8 h-40 animate-pulse rounded-lg bg-muted" />
                </div>
            </main>
        </div>
    );
}
