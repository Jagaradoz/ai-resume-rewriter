import { db } from "@/lib/db/client";

interface CreateRewriteParams {
    userId: string;
    rawInput: string;
    variations: string[];
    tone: string;
    tokenCount: number;
    model: string;
    durationMs: number;
}

export async function createRewrite(params: CreateRewriteParams) {
    return db.rewrite.create({
        data: {
            userId: params.userId,
            rawInput: params.rawInput,
            variations: params.variations,
            tone: params.tone,
            tokenCount: params.tokenCount,
            model: params.model,
            durationMs: params.durationMs,
        },
    });
}

export async function getUserRewrites(
    userId: string,
    {
        cursor,
        limit = 10,
        retentionDays,
    }: {
        cursor?: string;
        limit?: number;
        retentionDays: number;
    },
) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    return db.rewrite.findMany({
        where: {
            userId,
            createdAt: { gte: cutoff },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor
            ? {
                  cursor: { id: cursor },
                  skip: 1,
              }
            : {}),
        select: {
            id: true,
            rawInput: true,
            variations: true,
            tone: true,
            createdAt: true,
        },
    });
}

export async function getRewriteById(id: string, userId: string) {
    return db.rewrite.findFirst({
        where: { id, userId },
    });
}

export async function deleteRewrite(id: string, userId: string) {
    const rewrite = await db.rewrite.findFirst({
        where: { id, userId },
        select: { id: true },
    });

    if (!rewrite) return null;

    return db.rewrite.delete({
        where: { id: rewrite.id },
    });
}
