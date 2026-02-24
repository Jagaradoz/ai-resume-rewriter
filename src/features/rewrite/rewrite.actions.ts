"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/auth.config";
import { deleteRewrite } from "@/features/rewrite/rewrite.dal";

export async function deleteRewriteAction(rewriteId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const deleted = await deleteRewrite(rewriteId, session.user.id);
    if (!deleted) {
        return { error: "Rewrite not found" };
    }

    revalidatePath("/dashboard/history");
    return { success: true };
}
