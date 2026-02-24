import { auth } from "@/features/auth/auth.config";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export async function protectedAction<T>(
    fn: (userId: string) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const data = await fn(session.user.id);
        return { data };
    } catch {
        return { error: "Something went wrong. Please try again." };
    }
}
