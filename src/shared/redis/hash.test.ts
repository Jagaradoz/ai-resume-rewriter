import { describe, expect, it } from "vitest";

import { hashRewriteInput } from "./hash";

describe("hashRewriteInput", () => {
    it("returns a 64-character hex string", async () => {
        const hash = await hashRewriteInput("test input", "professional", 2);
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("is deterministic for same input", async () => {
        const a = await hashRewriteInput("same text", "concise", 3);
        const b = await hashRewriteInput("same text", "concise", 3);
        expect(a).toBe(b);
    });

    it("produces different hashes for different rawInput", async () => {
        const a = await hashRewriteInput("input A", "professional", 2);
        const b = await hashRewriteInput("input B", "professional", 2);
        expect(a).not.toBe(b);
    });

    it("produces different hashes for different tone", async () => {
        const a = await hashRewriteInput("same", "professional", 2);
        const b = await hashRewriteInput("same", "confident", 2);
        expect(a).not.toBe(b);
    });

    it("produces different hashes for different variationCount", async () => {
        const a = await hashRewriteInput("same", "professional", 2);
        const b = await hashRewriteInput("same", "professional", 3);
        expect(a).not.toBe(b);
    });
});
