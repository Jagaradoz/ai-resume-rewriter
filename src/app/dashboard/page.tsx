import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/components/auth/auth-buttons";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/signin");
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Simple Nav */}
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <h1 className="text-lg font-bold">AI Resume Rewriter</h1>
                <AuthButtons />
            </header>

            {/* Main */}
            <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
                <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <h2 className="text-2xl font-bold">
                        Welcome, {session.user.name ?? "User"} 👋
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        You&apos;re signed in as{" "}
                        <span className="font-medium text-foreground">
                            {session.user.email}
                        </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Plan:{" "}
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {session.user.entitlement === "pro" ? "Pro" : "Free"}
                        </span>
                    </p>
                    <p className="mt-6 text-sm text-muted-foreground">
                        🚧 Dashboard coming in Phase 4+. This page confirms auth works
                        end-to-end.
                    </p>
                </div>
            </main>
        </div>
    );
}
