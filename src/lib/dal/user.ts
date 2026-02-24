import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

export async function getUserByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
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
    const hashedPassword = await bcrypt.hash(password, 12);

    return db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
}
