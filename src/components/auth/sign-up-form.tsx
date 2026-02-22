"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signUp, type AuthActionResult } from "@/lib/actions/auth-actions";

export function SignUpForm() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result: AuthActionResult = await signUp(formData);

            if (!result.success) {
                setError(result.error ?? "Something went wrong");
                setIsLoading(false);
                return;
            }

            // Auto sign-in after successful sign-up
            await signIn("credentials", {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                redirectTo: "/dashboard",
            });
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[420px]">
            <div className="space-y-12">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">Create account</h2>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest">
                        <Link
                            href="/signin"
                            className="text-muted-foreground hover:text-foreground transition-colors pb-1"
                        >
                            Sign in
                        </Link>
                        <span className="text-muted-foreground/30">/</span>
                        <span className="text-foreground border-b-2 border-foreground pb-1">Create account</span>
                    </div>
                </div>

                {/* Sign-Up Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <label className="block group">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 group-focus-within:text-foreground transition-colors">Full name</span>
                            <input
                                name="name"
                                type="text"
                                placeholder="Jane Doe"
                                required
                                minLength={2}
                                disabled={isLoading}
                                className="w-full bg-transparent border-b-2 border-border/50 py-2 text-lg font-medium focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/30 rounded-none disabled:opacity-50"
                            />
                        </label>

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

                        <label className="block group">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 group-focus-within:text-foreground transition-colors">Confirm password</span>
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Repeat password"
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
                            className="w-full bg-foreground text-background hover:bg-brand-orange hover:text-white rounded-none h-14 text-xs font-bold tracking-widest uppercase transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>

                        {error && (
                            <div className="border-l-4 border-destructive pl-4 py-1 text-sm text-destructive font-bold">
                                {error}
                            </div>
                        )}
                    </div>
                </form>

                <div className="text-center pt-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        By creating an account you agree to terms.
                    </p>
                </div>
            </div>
        </div>
    );
}
