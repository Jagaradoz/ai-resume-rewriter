import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";
import "@/types/auth-types";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
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
