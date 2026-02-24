import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata = {
    title: "Create Account — AI Resume Rewriter",
    description: "Create an account to start rewriting your resume with AI.",
};

export default function SignUpPage() {
    return <SignUpForm />;
}
