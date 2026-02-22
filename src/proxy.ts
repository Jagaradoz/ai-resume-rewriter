import NextAuth from "next-auth";

// Edge-compatible middleware — CANNOT import Prisma or Node.js modules.
// We create a minimal NextAuth instance with just the JWT secret for token verification.
// The full auth config (Prisma adapter, providers, callbacks) lives in src/lib/auth.ts
// and is used only in Node.js runtime (API routes, Server Components).
const { auth } = NextAuth({
    session: { strategy: "jwt" },
    providers: [],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        authorized({ auth: session, request: { nextUrl } }) {
            const isAuthenticated = !!session?.user;
            const pathname = nextUrl.pathname;

            const publicRoutes = ["/", "/signin", "/signup"];
            const authRoutes = ["/signin", "/signup"];

            // Allow NextAuth API routes and webhooks through
            if (
                pathname.startsWith("/api/auth") ||
                pathname.startsWith("/api/webhooks")
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

export default auth;

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
