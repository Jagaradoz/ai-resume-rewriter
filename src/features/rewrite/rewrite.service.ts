import { checkAndIncrementQuota, decrementQuota } from "@/features/billing/billing.dal";
import { derivePlan, getSubscription } from "@/features/billing/billing.dal";
import { createRewrite } from "@/features/rewrite/rewrite.dal";
import { buildSystemPrompt, buildUserPrompt } from "@/features/rewrite/rewrite.prompts";
import type { RewriteInput } from "@/features/rewrite/rewrite.types";
import { DEFAULT_MODEL, gemini } from "@/shared/ai/client";
import { GLOBAL_DAILY_CAP, PLAN_CONFIG } from "@/shared/config/plan-config";
import { RedisError } from "@/shared/redis/client";
import { redisDel, redisExpire, redisGet, redisIncr, redisSet } from "@/shared/redis/client";
import { hashRewriteInput } from "@/shared/redis/hash";
import { globalDailyCapKey, quotaCacheKey, rewriteCacheKey, REDIS_TTL } from "@/shared/redis/keys";

export async function executeRewrite(
    userId: string,
    input: RewriteInput,
): Promise<ReadableStream> {
    const { rawInput, tone } = input;

    // ─── 1. Global daily cap (atomic: INCR then check) ────────────────────
    await checkAndIncrementGlobalDailyCap();

    // ─── 2. Resolve plan + variation count ───────────────────────────────
    const subscription = await getSubscription(userId);
    const plan = derivePlan(subscription?.status);
    const variationCount = PLAN_CONFIG[plan].variationCount;

    // ─── 3. Check rewrite cache ──────────────────────────────────────────
    const inputHash = await hashRewriteInput(rawInput, tone, variationCount);
    const cached = await getCachedRewrite(inputHash);
    if (cached) {
        return buildCachedStream(cached);
    }

    // ─── 4. Quota check (atomic DB) ─────────────────────────────────────
    const quota = await checkAndIncrementQuota(userId, plan);
    if (!quota.ok) {
        throw new QuotaExceededError(quota.limit, plan);
    }

    // Invalidate quota cache since we just incremented
    try { await redisDel(quotaCacheKey(userId)); } catch { /* non-critical */ }

    // ─── 5. Stream from Gemini ───────────────────────────────────────────
    const startTime = Date.now();
    let fullText = "";
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let streamSucceeded = false;

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                const geminiStream = await gemini.models.generateContentStream({
                    model: DEFAULT_MODEL,
                    contents: buildUserPrompt(rawInput),
                    config: {
                        systemInstruction: buildSystemPrompt(variationCount, tone),
                    },
                });

                for await (const chunk of geminiStream) {
                    if (chunk.usageMetadata) {
                        totalPromptTokens = chunk.usageMetadata.promptTokenCount ?? 0;
                        totalCompletionTokens = chunk.usageMetadata.candidatesTokenCount ?? 0;
                    }

                    const text = chunk.text ?? "";
                    if (text) {
                        fullText += text;
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ text })}\n\n`,
                            ),
                        );
                    }
                }

                // Guard against empty AI response
                if (!fullText.trim()) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: "AI returned an empty response. Please try again." })}\n\n`,
                        ),
                    );
                    controller.close();
                    return;
                }

                streamSucceeded = true;

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`),
                );
                controller.close();

                const durationMs = Date.now() - startTime;

                const matches = [...fullText.matchAll(/<result>([\s\S]*?)(?:<\/result>|$)/g)];
                let variations = matches.map((m) => m[1].trim()).filter(Boolean);

                if (variations.length === 0) {
                    variations = [fullText.trim()];
                }

                await createRewrite({
                    userId,
                    rawInput,
                    variations,
                    tone,
                    tokenCount: totalPromptTokens + totalCompletionTokens,
                    model: DEFAULT_MODEL,
                    durationMs,
                });

                // Cache the result for future identical requests
                try { await cacheRewrite(inputHash, fullText); } catch { /* non-critical */ }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to generate rewrite";

                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ error: message })}\n\n`,
                    ),
                );
                controller.close();
            } finally {
                // Refund quota if stream failed (AI error, network timeout, etc.)
                if (!streamSucceeded) {
                    try { await decrementQuota(userId); } catch { /* best-effort */ }
                    try { await redisDel(quotaCacheKey(userId)); } catch { /* non-critical */ }
                }
            }
        },
    });
}

// ─── Global daily cap helpers ────────────────────────────────────────────────

/**
 * Atomically increment + check the global daily cap using a single INCR.
 * Throws GlobalCapExceededError if cap is reached.
 * Fails closed: if Redis is unavailable, the cap blocks requests.
 */
async function checkAndIncrementGlobalDailyCap(): Promise<void> {
    try {
        const key = globalDailyCapKey();
        const count = await redisIncr(key);
        if (count === 1) {
            await redisExpire(key, REDIS_TTL.GLOBAL_DAILY_CAP);
        }
        if (count > GLOBAL_DAILY_CAP) {
            throw new GlobalCapExceededError();
        }
    } catch (error) {
        if (error instanceof GlobalCapExceededError) throw error;
        if (error instanceof RedisError) {
            // Fail closed: deny request when Redis is down
            throw new GlobalCapExceededError();
        }
        throw error;
    }
}

// ─── Rewrite cache helpers ───────────────────────────────────────────────────

async function getCachedRewrite(hash: string): Promise<string | null> {
    try {
        const key = rewriteCacheKey(hash);
        return await redisGet(key);
    } catch {
        return null;
    }
}

async function cacheRewrite(hash: string, fullText: string): Promise<void> {
    const key = rewriteCacheKey(hash);
    await redisSet(key, fullText, REDIS_TTL.REWRITE_CACHE);
}

function buildCachedStream(cachedText: string): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        start(controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: cachedText })}\n\n`),
            );
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`),
            );
            controller.close();
        },
    });
}

// ─── Error classes ───────────────────────────────────────────────────────────

export class QuotaExceededError extends Error {
    constructor(
        public readonly limit: number,
        plan: string,
    ) {
        const msg = plan === "pro"
            ? `You've used all ${limit} rewrites this month. Your quota resets next cycle.`
            : `You've used all ${limit} rewrites this month. Upgrade to Pro to get 30 rewrites/month.`;
        super(msg);
        this.name = "QuotaExceededError";
    }
}

export class GlobalCapExceededError extends Error {
    constructor() {
        super("Our service is experiencing high demand. Please try again tomorrow.");
        this.name = "GlobalCapExceededError";
    }
}
