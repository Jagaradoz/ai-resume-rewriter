import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        entitlement?: "free" | "pro";
        quotaUsed?: number;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            entitlement: "free" | "pro";
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        entitlement?: "free" | "pro";
        quotaUsed?: number;
    }
}
