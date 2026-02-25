import { checkAndIncrementQuota } from "@/features/billing/billing.dal";
import { derivePlan, getSubscription } from "@/features/billing/billing.dal";
import { createRewrite } from "@/features/rewrite/rewrite.dal";
import { buildSystemPrompt, buildUserPrompt } from "@/features/rewrite/rewrite.prompts";
import type { RewriteInput } from "@/features/rewrite/rewrite.types";
import { DEFAULT_MODEL, openai } from "@/shared/ai/client";
import { GLOBAL_DAILY_CAP, PLAN_CONFIG } from "@/shared/config/plan-config";
import { redisDel, redisExpire, redisGet, redisIncr, redisSet } from "@/shared/redis/client";
import { hashRewriteInput } from "@/shared/redis/hash";
import { globalDailyCapKey, quotaCacheKey, rewriteCacheKey, REDIS_TTL } from "@/shared/redis/keys";

export async function executeRewrite(
    userId: string,
    input: RewriteInput,
): Promise<ReadableStream> {
    const { rawInput, tone } = input;

    // ─── 1. Global daily cap ─────────────────────────────────────────────
    const dailyCapReached = await checkGlobalDailyCap();
    if (dailyCapReached) {
        throw new GlobalCapExceededError();
    }

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
        throw new QuotaExceededError(quota.limit);
    }

    // Invalidate quota cache since we just incremented
    await redisDel(quotaCacheKey(userId));

    // ─── 5. Increment global daily counter ───────────────────────────────
    await incrementGlobalDailyCap();

    // ─── 6. Stream from OpenAI ───────────────────────────────────────────
    const startTime = Date.now();
    let fullText = "";
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                const openaiStream = await openai.chat.completions.create({
                    model: DEFAULT_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: buildSystemPrompt(variationCount, tone),
                        },
                        { role: "user", content: buildUserPrompt(rawInput) },
                    ],
                    stream: true,
                    stream_options: { include_usage: true },
                });

                for await (const chunk of openaiStream) {
                    if (chunk.usage) {
                        totalPromptTokens = chunk.usage.prompt_tokens;
                        totalCompletionTokens = chunk.usage.completion_tokens;
                    }

                    const text = chunk.choices[0]?.delta?.content ?? "";
                    if (text) {
                        fullText += text;
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ text })}\n\n`,
                            ),
                        );
                    }
                }

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
                await cacheRewrite(inputHash, fullText);
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
            }
        },
    });
}

// ─── Global daily cap helpers ────────────────────────────────────────────────

async function checkGlobalDailyCap(): Promise<boolean> {
    const key = globalDailyCapKey();
    const countStr = await redisGet(key);
    if (countStr === null) return false;
    return parseInt(countStr, 10) >= GLOBAL_DAILY_CAP;
}

async function incrementGlobalDailyCap(): Promise<void> {
    const key = globalDailyCapKey();
    const count = await redisIncr(key);
    if (count === 1) {
        await redisExpire(key, REDIS_TTL.GLOBAL_DAILY_CAP);
    }
}

// ─── Rewrite cache helpers ───────────────────────────────────────────────────

async function getCachedRewrite(hash: string): Promise<string | null> {
    const key = rewriteCacheKey(hash);
    return redisGet(key);
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
    constructor(public readonly limit: number) {
        super(`You've used all ${limit} rewrites this month. Upgrade to Pro to get 30 rewrites/month.`);
        this.name = "QuotaExceededError";
    }
}

export class GlobalCapExceededError extends Error {
    constructor() {
        super("Our service is experiencing high demand. Please try again tomorrow.");
        this.name = "GlobalCapExceededError";
    }
}
