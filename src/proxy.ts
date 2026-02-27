import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";

// Edge-compatible middleware — CANNOT import Prisma or Node.js modules.
// We create a minimal NextAuth instance with just the JWT secret for token verification.
// The full auth config (Prisma adapter, providers, callbacks) lives in src/lib/auth.ts
// and is used only in Node.js runtime (API routes, Server Components).
const { auth } = NextAuth({
    session: { strategy: "jwt" },
    providers: [],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        authorized({ auth: session, request: { nextUrl } }) {
            const isAuthenticated = !!session?.user;
            const pathname = nextUrl.pathname;

            const publicRoutes = ["/", "/signin", "/signup", "/pricing"];
            const authRoutes = ["/signin", "/signup"];

            // Allow NextAuth API routes, webhooks, and cron routes through
            if (
                pathname.startsWith("/api/auth") ||
                pathname.startsWith("/api/webhooks") ||
                pathname.startsWith("/api/cron")
            ) {
                return true;
            }

            // Redirect authenticated users away from auth pages
            if (isAuthenticated && authRoutes.includes(pathname)) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // Allow public routes
            if (publicRoutes.includes(pathname)) {
                return true;
            }

            // Require auth for everything else
            return isAuthenticated;
        },
    },
    pages: {
        signIn: "/signin",
    },
});

/** Per-user rate limiter for /api/rewrite — 10 req/min. Fails closed when Redis is unavailable. */
async function rateLimitRewrite(req: NextRequest, userId: string): Promise<NextResponse | null> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Skip rate limiting only when Redis is not configured at all
    if (!url || !token) return null;

    const minute = Math.floor(Date.now() / 60_000);
    const key = `rl:${userId}:${minute}`;

    try {
        // Use Upstash REST API directly — avoids importing Node.js-only SDK
        const incrRes = await fetch(`${url}/incr/${key}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!incrRes.ok) {
            // Fail closed: block request when Redis returns errors
            return NextResponse.json(
                { error: "Service temporarily unavailable. Please try again." },
                { status: 503 },
            );
        }

        const { result: count } = (await incrRes.json()) as { result: number };

        // Set TTL on first request in the window
        if (count === 1) {
            await fetch(`${url}/expire/${key}/60`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        if (count > 10) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429 },
            );
        }
    } catch {
        // Fail closed: block request on network errors
        return NextResponse.json(
            { error: "Service temporarily unavailable. Please try again." },
            { status: 503 },
        );
    }

    return null;
}

export default auth(async function middleware(req) {
    // Rate-limit /api/rewrite per authenticated user
    if (req.nextUrl.pathname === "/api/rewrite") {
        const session = req.auth;
        const userId = session?.user?.id;
        if (userId) {
            const limited = await rateLimitRewrite(req, userId);
            if (limited) return limited;
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
