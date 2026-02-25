import { redirect } from "next/navigation";

import { auth } from "@/features/auth/auth.config";

/**
 * Requires an authenticated session or redirects to /signin.
 * Returns a guaranteed session with user.id — no optional chaining needed.
 * Use in Server Components (pages/layouts). For Server Actions, use protectedAction().
 */
export async function requireAuth() {
    const session = await auth();
    if (!session?.user?.id) redirect("/signin");
    return session;
}
