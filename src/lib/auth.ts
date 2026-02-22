import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";
import "@/types/auth-types";

function CustomPrismaAdapter() {
    const adapter = PrismaAdapter(db);
    return {
        ...adapter,
        linkAccount: async (data: Record<string, unknown>) => {
            // Prisma Client v7 uses camelCase accessors, but Auth.js sends snake_case OAuth fields
            const mapped = {
                userId: data.userId,
                type: data.type,
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                refreshToken: (data.refresh_token ?? data.refreshToken) as string | null,
                accessToken: (data.access_token ?? data.accessToken) as string | null,
                expiresAt: (data.expires_at ?? data.expiresAt) as number | null,
                tokenType: (data.token_type ?? data.tokenType) as string | null,
                scope: data.scope as string | null,
                idToken: (data.id_token ?? data.idToken) as string | null,
                sessionState: (data.session_state ?? data.sessionState) as string | null,
            };
            await db.account.create({ data: mapped as never });
        },
    };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: CustomPrismaAdapter(),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials.email as string;
                const password = credentials.password as string;

                if (!email || !password) return null;

                const user = await db.user.findUnique({ where: { email } });
                if (!user?.password) return null;

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.userId = user.id;
            }

            // Enrich token on sign-in or when requested
            if (trigger === "signIn" || !token.entitlement) {
                const dbUser = await db.user.findUnique({
                    where: { id: token.userId as string },
                    include: { subscription: true },
                });

                if (dbUser) {
                    token.entitlement = deriveEntitlement(dbUser);
                    token.quotaUsed = dbUser.quotaUsed;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            session.user.entitlement =
                (token.entitlement as "free" | "pro") ?? "free";
            return session;
        },
    },
});

function deriveEntitlement(
    user: User & { subscription: { status: string } | null },
): "free" | "pro" {
    if (!user.subscription) return "free";
    return user.subscription.status === "ACTIVE" ? "pro" : "free";
}
