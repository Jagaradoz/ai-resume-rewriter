import { z } from "zod";

export const toneSchema = z.enum(["professional", "action-oriented", "executive"]);

export const rewriteInputSchema = z.object({
    rawInput: z
        .string()
        .min(10, "Input must be at least 10 characters")
        .max(2000, "Input must be 2000 characters or less"),
    tone: toneSchema.default("professional"),
});
