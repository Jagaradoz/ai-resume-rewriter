"use server";

import { auth } from "@/lib/auth";
import { deleteRewrite } from "@/lib/dal/rewrite";
import { revalidatePath } from "next/cache";

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
