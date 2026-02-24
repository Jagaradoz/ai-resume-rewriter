import { DEFAULT_MODEL,openai } from "@/lib/ai/client";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { auth } from "@/lib/auth/config";
import { checkAndIncrementQuota } from "@/lib/dal/quota";
import { createRewrite } from "@/lib/dal/rewrite";
import { derivePlan,getSubscription } from "@/lib/dal/subscription";
import { rewriteInputSchema } from "@/lib/validations/rewrite-schemas";

export const maxDuration = 30;

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate input
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = rewriteInputSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 },
        );
    }

    const { rawInput, tone } = parsed.data;

    // Read plan fresh from DB — JWT entitlement can be stale after webhook updates
    const subscription = await getSubscription(session.user.id);
    const plan = derivePlan(subscription?.status);
    const variationCount = plan === "pro" ? 3 : 2;

    // --- Server-side quota enforcement ---
    const quota = await checkAndIncrementQuota(session.user.id, plan);
    if (!quota.ok) {
        return Response.json(
            {
                error: `You've used all ${quota.limit} rewrites this month. Upgrade to Pro to get 30 rewrites/month.`,
                code: "QUOTA_EXCEEDED",
            },
            { status: 429 },
        );
    }

    // Track timing
    const startTime = Date.now();

    // Accumulate full response for DB save
    let fullText = "";
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
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
                    // Capture usage from the final chunk
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

                // Send done signal
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`),
                );
                controller.close();

                // Save to DB for all users
                const durationMs = Date.now() - startTime;

                // Parse <result> tags for database insertion
                const matches = [...fullText.matchAll(/<result>([\s\S]*?)(?:<\/result>|$)/g)];
                let variations = matches.map((m) => m[1].trim()).filter(Boolean);

                if (variations.length === 0) {
                    variations = [fullText.trim()];
                }

                await createRewrite({
                    userId: session.user.id,
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

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
