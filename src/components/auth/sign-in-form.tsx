"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

    async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await signIn("credentials", {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleOAuthSignIn(provider: string) {
        setIsOAuthLoading(provider);
        signIn(provider, { callbackUrl: "/dashboard" });
    }

    return (
        <div className="w-full max-w-[420px]">
            <div className="space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">Sign in</h2>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest">
                        <span className="text-foreground border-b-2 border-foreground pb-1">Sign in</span>
                        <span className="text-muted-foreground/30">/</span>
                        <Link
                            href="/signup"
                            className="text-muted-foreground hover:text-foreground transition-colors pb-1"
                        >
                            Create account
                        </Link>
                    </div>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleCredentialsSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <label className="block group">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 group-focus-within:text-foreground transition-colors">Email</span>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@company.com"
                                required
                                disabled={isLoading}
                                className="w-full bg-transparent border-b-2 border-border/50 py-2 text-lg font-medium focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/30 rounded-none disabled:opacity-50"
                            />
                        </label>

                        <label className="block group">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 group-focus-within:text-foreground transition-colors">Password</span>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={8}
                                disabled={isLoading}
                                className="w-full bg-transparent border-b-2 border-border/50 py-2 text-lg font-medium focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/30 rounded-none disabled:opacity-50"
                            />
                        </label>
                    </div>

                    <div className="space-y-8">
                        <Button
                            type="submit"
                            className="w-full bg-foreground text-background hover:bg-brand-orange hover:text-white rounded-none h-14 text-xs font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Continue"}
                        </Button>

                        {error && (
                            <div className="border-l-4 border-destructive pl-4 py-1 text-sm text-destructive font-bold">
                                {error}
                            </div>
                        )}
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                        <span className="bg-background px-4 text-muted-foreground">Or</span>
                    </div>
                </div>

                {/* OAuth */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-none h-14 border-2 hover:border-foreground hover:bg-transparent transition-colors text-xs font-bold uppercase tracking-wider"
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={!!isOAuthLoading}
                    >
                        {isOAuthLoading === "google" ? (
                            "..."
                        ) : (
                            <>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Google
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-none h-14 border-2 hover:border-foreground hover:bg-transparent transition-colors text-xs font-bold uppercase tracking-wider"
                        onClick={() => handleOAuthSignIn("github")}
                        disabled={!!isOAuthLoading}
                    >
                        {isOAuthLoading === "github" ? (
                            "..."
                        ) : (
                            <>
                                <svg
                                    className="mr-2 h-4 w-4 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </>
                        )}
                    </Button>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        By continuing you agree to terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
