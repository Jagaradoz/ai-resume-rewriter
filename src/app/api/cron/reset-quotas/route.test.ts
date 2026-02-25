import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/billing/billing.dal", () => ({
    resetMonthlyQuotas: vi.fn(),
}));

import { resetMonthlyQuotas } from "@/features/billing/billing.dal";

import { GET } from "./route";

const CRON_SECRET = "test-cron-secret";

describe("GET /api/cron/reset-quotas", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 401 without authorization header", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        const req = new Request("http://localhost/api/cron/reset-quotas");
        const res = await GET(req);

        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 with wrong secret", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        const req = new Request("http://localhost/api/cron/reset-quotas", {
            headers: { authorization: "Bearer wrong-secret" },
        });
        const res = await GET(req);

        expect(res.status).toBe(401);
    });

    it("returns 200 with valid secret and reset count", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        vi.mocked(resetMonthlyQuotas).mockResolvedValue(5);

        const req = new Request("http://localhost/api/cron/reset-quotas", {
            headers: { authorization: `Bearer ${CRON_SECRET}` },
        });
        const res = await GET(req);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.resetCount).toBe(5);
        expect(body.timestamp).toBeDefined();
    });

    it("returns 500 when resetMonthlyQuotas throws", async () => {
        vi.stubEnv("CRON_SECRET", CRON_SECRET);
        vi.mocked(resetMonthlyQuotas).mockRejectedValue(new Error("DB error"));

        const req = new Request("http://localhost/api/cron/reset-quotas", {
            headers: { authorization: `Bearer ${CRON_SECRET}` },
        });
        const res = await GET(req);

        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to reset quotas");
    });
});
