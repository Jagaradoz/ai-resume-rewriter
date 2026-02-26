import { describe, expect, it } from "vitest";

import { parseVariations } from "../streaming-output";

describe("parseVariations", () => {
    it("returns empty array for empty string", () => {
        expect(parseVariations("")).toEqual([]);
    });

    it("returns empty array for whitespace only", () => {
        expect(parseVariations("   \n  ")).toEqual([]);
    });

    it("parses complete <result> tags", () => {
        const text =
            "<result>First variation</result><result>Second variation</result>";
        expect(parseVariations(text)).toEqual([
            "First variation",
            "Second variation",
        ]);
    });

    it("parses multiline content inside result tags", () => {
        const text =
            "<result>\n- Led a team of 5\n- Increased revenue by 20%\n</result>";
        expect(parseVariations(text)).toEqual([
            "- Led a team of 5\n- Increased revenue by 20%",
        ]);
    });

    it("handles incomplete stream (no closing tag)", () => {
        const text = "<result>Partial variation still streaming";
        expect(parseVariations(text)).toEqual([
            "Partial variation still streaming",
        ]);
    });

    it("handles mix of complete and incomplete tags", () => {
        const text =
            "<result>Complete one</result><result>Still streaming...";
        const result = parseVariations(text);
        expect(result).toHaveLength(2);
        expect(result[0]).toBe("Complete one");
        expect(result[1]).toBe("Still streaming...");
    });

    it("falls back to raw text when no tags present", () => {
        const text = "Just some plain text without tags";
        expect(parseVariations(text)).toEqual([
            "Just some plain text without tags",
        ]);
    });

    it("trims whitespace from variations", () => {
        const text = "<result>  trimmed  </result>";
        expect(parseVariations(text)).toEqual(["trimmed"]);
    });

    it("filters out empty result tags", () => {
        const text = "<result></result><result>Valid</result>";
        expect(parseVariations(text)).toEqual(["Valid"]);
    });

    it("handles three variations", () => {
        const text =
            "<result>One</result><result>Two</result><result>Three</result>";
        expect(parseVariations(text)).toEqual(["One", "Two", "Three"]);
    });
});
