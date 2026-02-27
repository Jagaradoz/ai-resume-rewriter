"use server";

import { Prisma } from "@/shared/db/client";
import { createUser } from "@/features/auth/auth.dal";
import { signUpSchema } from "@/features/auth/auth.schemas";
import type { AuthActionResult } from "@/features/auth/auth.types";

export async function signUp(formData: FormData): Promise<AuthActionResult> {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return { success: false, error: "Invalid input" };
    }

    const validated = signUpSchema.safeParse({ name, email, password, confirmPassword });
    if (!validated.success) {
        const firstError = validated.error.issues[0]?.message ?? "Invalid input";
        return { success: false, error: firstError };
    }

    try {
        await createUser(validated.data);
        return { success: true };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return { success: false, error: "An account with this email already exists" };
        }
        return { success: false, error: "Something went wrong. Please try again." };
    }
}
