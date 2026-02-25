/**
 * Generate a deterministic SHA-256 hash for rewrite cache keys.
 * Uses the Web Crypto API (available in both Edge and Node.js).
 */
export async function hashRewriteInput(
    rawInput: string,
    tone: string,
    variationCount: number,
): Promise<string> {
    const payload = JSON.stringify({ rawInput, tone, variationCount });
    const encoded = new TextEncoder().encode(payload);
    const buffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
