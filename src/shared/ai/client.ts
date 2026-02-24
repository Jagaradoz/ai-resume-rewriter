import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
    openai: OpenAI | undefined;
};

function createOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var");

    return new OpenAI({ apiKey });
}

export const openai = globalForOpenAI.openai ?? createOpenAIClient();

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export const DEFAULT_MODEL = "gpt-4o-mini";
