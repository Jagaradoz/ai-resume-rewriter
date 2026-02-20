"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
            {/* Header */}
            <div className="rounded-t-2xl border-b border-border px-6 py-4">
                <h2 className="text-3xl font-bold">Create account</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start rewriting your resume with AI-powered suggestions.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="border-b border-border bg-muted p-2">
                <div className="grid grid-cols-2 rounded-lg text-sm">
                    <Link
                        href="/signin"
                        className="flex items-center justify-center rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign in
                    </Link>
                    <button className="rounded-lg border border-border bg-background px-4 py-2 font-medium">
                        Create account
                    </button>
                </div>
            </div>

            {/* Sign-Up Form */}
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <label className="block space-y-2">
                    <span className="text-sm font-medium">Full name</span>
                    <Input
                        name="name"
                        type="text"
                        placeholder="Jane Doe"
                        required
                        minLength={2}
                        disabled={isLoading}
                    />
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium">Work email</span>
                    <Input
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        disabled={isLoading}
                    />
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium">Password</span>
                    <Input
                        name="password"
                        type="password"
                        placeholder="8+ characters"
                        required
                        minLength={8}
                        disabled={isLoading}
                    />
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium">Confirm password</span>
                    <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        required
                        minLength={8}
                        disabled={isLoading}
                    />
                </label>

                <Button
                    type="submit"
                    className="w-full bg-orange-500 text-white font-bold uppercase tracking-wide hover:bg-orange-600"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating account..." : "Create account"}
                </Button>
            </form>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4">
                <p className="text-center text-xs text-muted-foreground">
                    By creating an account you agree to terms and privacy.
                </p>
            </div>
        </div>
    );
}
