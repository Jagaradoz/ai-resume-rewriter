import "@/features/auth/auth.types";

import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { getUserByEmail, getUserWithSubscription } from "@/features/auth/auth.dal";
import { derivePlan } from "@/features/billing/billing.dal";
import { db } from "@/shared/db/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: {
        ...PrismaAdapter(db),
        linkAccount: async (data: Record<string, unknown>) => {
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
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;

                if (typeof email !== "string" || typeof password !== "string") return null;
                if (!email || !password) return null;

                const user = await getUserByEmail(email);
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

            if (!token.userId) return token;

            if (trigger === "signIn" || !token.entitlement) {
                const dbUser = await getUserWithSubscription(token.userId as string);

                if (dbUser) {
                    token.entitlement = derivePlan(dbUser.subscription?.status);
                    token.quotaUsed = dbUser.quotaUsed;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (!token.userId) {
                return session;
            }
            session.user.id = token.userId as string;
            session.user.entitlement =
                (token.entitlement as "free" | "pro") ?? "free";
            session.user.quotaUsed = token.quotaUsed as number | undefined;
            return session;
        },
    },
});
