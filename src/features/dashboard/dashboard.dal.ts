import { db } from "@/shared/db/client";

export async function getUserProviders(userId: string): Promise<string[]> {
    const accounts = await db.account.findMany({
        where: { userId },
        select: { provider: true },
    });
    return accounts.map((a) => a.provider);
}

export async function getTotalRewriteCount(userId: string): Promise<number> {
    return db.rewrite.count({ where: { userId } });
}
