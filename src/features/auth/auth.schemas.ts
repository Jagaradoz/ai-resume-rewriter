import { z } from "zod";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number");

export const signInSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").trim(),
        email: z.email("Please enter a valid email address").transform((e) => e.toLowerCase()),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
