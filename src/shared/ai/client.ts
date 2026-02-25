import { GoogleGenAI } from "@google/genai";

const globalForGemini = globalThis as unknown as {
    gemini: InstanceType<typeof GoogleGenAI> | undefined;
};

function createGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY env var");

    return new GoogleGenAI({ apiKey });
}

export const gemini = globalForGemini.gemini ?? createGeminiClient();

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini;

export const DEFAULT_MODEL = "gemini-2.5-flash-lite";
