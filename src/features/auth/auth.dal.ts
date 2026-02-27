import bcrypt from "bcryptjs";

import { BCRYPT_ROUNDS } from "@/shared/config/plan-config";
import { db } from "@/shared/db/client";

export async function getUserByEmail(email: string) {
    return db.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function getUserById(userId: string) {
    return db.user.findUnique({ where: { id: userId } });
}

export async function getUserWithSubscription(userId: string) {
    return db.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
    });
}

export async function createUser({
    name,
    email,
    password,
}: {
    name: string;
    email: string;
    password: string;
}) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    return db.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        },
    });
}

export async function updateStripeCustomerId(userId: string, stripeCustomerId: string) {
    return db.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
    });
}
