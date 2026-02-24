export const PLAN_CONFIG = {
    free: { quotaLimit: 5, variationCount: 2, retentionDays: 7 },
    pro: { quotaLimit: 30, variationCount: 3, retentionDays: 365 },
} as const;

export type Plan = keyof typeof PLAN_CONFIG;

export const BCRYPT_ROUNDS = 12;
export const DEFAULT_PAGE_SIZE = 10;
