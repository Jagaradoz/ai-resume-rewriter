import { describe, expect, it } from "vitest";

import { globalDailyCapKey, quotaCacheKey, REDIS_TTL, rewriteCacheKey } from "./keys";

describe("quotaCacheKey", () => {
    it("returns correct key format", () => {
        expect(quotaCacheKey("user-123")).toBe("quota:user-123");
    });
});

describe("rewriteCacheKey", () => {
    it("returns correct key format", () => {
        expect(rewriteCacheKey("abc123")).toBe("cache:rewrite:abc123");
    });
});

describe("globalDailyCapKey", () => {
    it("returns key with today's date in YYYY-MM-DD format", () => {
        const key = globalDailyCapKey();
        const dateStr = new Date().toISOString().slice(0, 10);
        expect(key).toBe(`global:daily:${dateStr}`);
    });

    it("matches the expected pattern", () => {
        const key = globalDailyCapKey();
        expect(key).toMatch(/^global:daily:\d{4}-\d{2}-\d{2}$/);
    });
});

describe("REDIS_TTL", () => {
    it("has correct TTL values", () => {
        expect(REDIS_TTL.QUOTA_CACHE).toBe(300);
        expect(REDIS_TTL.REWRITE_CACHE).toBe(86_400);
        expect(REDIS_TTL.GLOBAL_DAILY_CAP).toBe(86_400);
    });
});
