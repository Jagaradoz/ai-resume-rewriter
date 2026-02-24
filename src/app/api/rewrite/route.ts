import { NextResponse } from "next/server";

import { auth } from "@/features/auth/auth.config";
import { rewriteInputSchema } from "@/features/rewrite/rewrite.schemas";
import { executeRewrite, QuotaExceededError } from "@/features/rewrite/rewrite.service";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = rewriteInputSchema.safeParse(body);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
        return NextResponse.json({ error: firstError }, { status: 400 });
    }

    try {
        const stream = await executeRewrite(session.user.id, parsed.data);

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        if (error instanceof QuotaExceededError) {
            return NextResponse.json({ error: error.message }, { status: 429 });
        }
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}
