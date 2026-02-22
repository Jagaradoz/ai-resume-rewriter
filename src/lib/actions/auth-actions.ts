"use server";

import { signUpSchema } from "@/lib/validations/auth-schemas";
import { getUserByEmail, createUser } from "@/lib/dal/user";

export type AuthActionResult = {
    success: boolean;
    error?: string;
};

export async function signUp(formData: FormData): Promise<AuthActionResult> {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const validated = signUpSchema.safeParse(rawData);
    if (!validated.success) {
        const firstError = validated.error.issues[0]?.message ?? "Invalid input";
        return { success: false, error: firstError };
    }

    const { name, email, password } = validated.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { success: false, error: "An account with this email already exists" };
    }

    try {
        await createUser({ name, email, password });
        return { success: true };
    } catch {
        return { success: false, error: "Something went wrong. Please try again." };
    }
}
