import { z } from "zod";

import { rewriteInputSchema, toneSchema } from "@/lib/validations/rewrite-schemas";

export type Tone = z.infer<typeof toneSchema>;

export type RewriteInput = z.infer<typeof rewriteInputSchema>;

export interface StreamState {
    status: "idle" | "streaming" | "done" | "error";
    text: string;
    error?: string;
}
