/** Quota cache: stores JSON { used, limit } */
export function quotaCacheKey(userId: string): string {
    return `quota:${userId}`;
}

/** Rewrite cache: stores full rewrite result */
export function rewriteCacheKey(hash: string): string {
    return `cache:rewrite:${hash}`;
}

/** Global daily cap: counter for all rewrites today */
export function globalDailyCapKey(): string {
    const date = new Date().toISOString().slice(0, 10);
    return `global:daily:${date}`;
}

/** TTL constants in seconds */
export const REDIS_TTL = {
    QUOTA_CACHE: 300,
    REWRITE_CACHE: 86_400,
    GLOBAL_DAILY_CAP: 86_400,
} as const;
