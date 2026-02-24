import { checkAndIncrementQuota } from "@/features/billing/billing.dal";
import { derivePlan, getSubscription } from "@/features/billing/billing.dal";
import { createRewrite } from "@/features/rewrite/rewrite.dal";
import { buildSystemPrompt, buildUserPrompt } from "@/features/rewrite/rewrite.prompts";
import type { RewriteInput } from "@/features/rewrite/rewrite.types";
import { DEFAULT_MODEL, openai } from "@/shared/ai/client";
import { PLAN_CONFIG } from "@/shared/config/plan-config";

export async function executeRewrite(
    userId: string,
    input: RewriteInput,
): Promise<ReadableStream> {
    const { rawInput, tone } = input;

    const subscription = await getSubscription(userId);
    const plan = derivePlan(subscription?.status);
    const variationCount = PLAN_CONFIG[plan].variationCount;

    const quota = await checkAndIncrementQuota(userId, plan);
    if (!quota.ok) {
        throw new QuotaExceededError(quota.limit);
    }

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

export class QuotaExceededError extends Error {
    constructor(public readonly limit: number) {
        super(`You've used all ${limit} rewrites this month. Upgrade to Pro to get 30 rewrites/month.`);
        this.name = "QuotaExceededError";
    }
}
