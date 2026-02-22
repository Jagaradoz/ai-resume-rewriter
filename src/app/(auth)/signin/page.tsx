import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
    title: "Sign In — AI Resume Rewriter",
    description: "Sign in to access your AI-powered resume rewriting dashboard.",
};

export default function SignInPage() {
    return <SignInForm />;
}
