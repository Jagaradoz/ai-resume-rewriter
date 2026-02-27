/**
 * Upstash Redis client using raw REST API.
 * Consistent with the approach in proxy.ts — no SDK dependency.
 * Works in both Edge Runtime and Node.js.
 *
 * Commands throw RedisError on failure so callers can distinguish
 * "key not found" (null) from "Redis unavailable" (exception).
 */

export class RedisError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RedisError";
    }
}

function getConfig() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    return { url, token };
}

export function isRedisConfigured(): boolean {
    const { url, token } = getConfig();
    return !!url && !!token;
}

async function command<T = unknown>(args: string[]): Promise<T | null> {
    const { url, token } = getConfig();
    if (!url || !token) throw new RedisError("Redis is not configured");

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(args),
        });

        if (!res.ok) {
            throw new RedisError(`Redis request failed with status ${res.status}`);
        }

        const data = (await res.json()) as { result: T };
        return data.result;
    } catch (error) {
        if (error instanceof RedisError) throw error;
        throw new RedisError(
            error instanceof Error ? error.message : "Redis command failed",
        );
    }
}

/** GET key — returns string value or null (null = key not found) */
export async function redisGet(key: string): Promise<string | null> {
    return command<string>(["GET", key]);
}

/** SET key value EX ttlSeconds */
export async function redisSet(
    key: string,
    value: string,
    ttlSeconds: number,
): Promise<boolean> {
    const result = await command<string>(["SET", key, value, "EX", String(ttlSeconds)]);
    return result === "OK";
}

/** DEL key — returns number of keys deleted */
export async function redisDel(key: string): Promise<number> {
    return (await command<number>(["DEL", key])) ?? 0;
}

/** INCR key — returns incremented value */
export async function redisIncr(key: string): Promise<number> {
    const result = await command<number>(["INCR", key]);
    if (result === null) throw new RedisError("INCR returned null");
    return result;
}

/** EXPIRE key ttlSeconds */
export async function redisExpire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await command<number>(["EXPIRE", key, String(ttlSeconds)]);
    return result === 1;
}
