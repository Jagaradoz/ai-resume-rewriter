import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/db/client", () => ({
    db: {},
}));

import { derivePlan, getQuotaLimit } from "./billing.dal";

describe("derivePlan", () => {
    it("returns 'pro' for ACTIVE status", () => {
        expect(derivePlan("ACTIVE")).toBe("pro");
    });

    it("returns 'pro' for TRIALING status", () => {
        expect(derivePlan("TRIALING")).toBe("pro");
    });

    it("returns 'pro' for PAST_DUE status", () => {
        expect(derivePlan("PAST_DUE")).toBe("pro");
    });

    it("returns 'free' for CANCELED status", () => {
        expect(derivePlan("CANCELED")).toBe("free");
    });

    it("returns 'free' for INCOMPLETE status", () => {
        expect(derivePlan("INCOMPLETE")).toBe("free");
    });

    it("returns 'free' for null", () => {
        expect(derivePlan(null)).toBe("free");
    });

    it("returns 'free' for undefined", () => {
        expect(derivePlan(undefined)).toBe("free");
    });
});

describe("getQuotaLimit", () => {
    it("returns 5 for free plan", () => {
        expect(getQuotaLimit("free")).toBe(5);
    });

    it("returns 30 for pro plan", () => {
        expect(getQuotaLimit("pro")).toBe(30);
    });
});
