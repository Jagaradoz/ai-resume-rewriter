import { Redis } from "@upstash/redis";

// Edge-compatible singleton. Reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN from env.
// Falls back gracefully when env vars are absent (local dev without Redis configured).
let redis: Redis | null = null;

if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
) {
    redis = Redis.fromEnv();
}

export { redis };
