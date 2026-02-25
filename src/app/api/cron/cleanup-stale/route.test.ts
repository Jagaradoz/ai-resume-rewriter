import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/rewrite/rewrite.dal", () => ({
    deleteStaleRewrites: vi.fn(),
}));

import { deleteStaleRewrites } from "@/features/rewrite/rewrite.dal";

import { GET } from "./route";

const CRON_SECRET = "test-cron-secret";

describe("GET /api/cron/cleanup-stale", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 401 without authorization header", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        const req = new Request("http://localhost/api/cron/cleanup-stale");
        const res = await GET(req);

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 with wrong secret", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        const req = new Request("http://localhost/api/cron/cleanup-stale", {
            headers: { authorization: "Bearer wrong-secret" },
        });
        const res = await GET(req);

        expect(res.status).toBe(401);
    });

    it("returns 200 with valid secret and deleted count", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        vi.mocked(deleteStaleRewrites).mockResolvedValue(12);

        const req = new Request("http://localhost/api/cron/cleanup-stale", {
            headers: { authorization: `Bearer ${CRON_SECRET}` },
        });
        const res = await GET(req);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.deletedCount).toBe(12);
        expect(body.timestamp).toBeDefined();
    });

    it("returns 500 when deleteStaleRewrites throws", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        vi.mocked(deleteStaleRewrites).mockRejectedValue(
            new Error("DB error"),
        );

        const req = new Request("http://localhost/api/cron/cleanup-stale", {
            headers: { authorization: `Bearer ${CRON_SECRET}` },
        });
        const res = await GET(req);

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to clean up stale rewrites");
    });
});
