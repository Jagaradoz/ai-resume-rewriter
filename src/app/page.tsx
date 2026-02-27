import type { Metadata } from "next";

import { CtaSection } from "@/features/marketing/components/cta-section";
import { FeaturesGrid } from "@/features/marketing/components/features-grid";
import { Footer } from "@/features/marketing/components/footer";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { Navbar } from "@/shared/layout/navbar";

export const metadata: Metadata = {
    title: "AI Resume Rewriter | Transform Bullets into Impact Statements",
    description:
        "AI-powered resume rewriting with Gemini. Paste your experience, get polished, impact-driven bullet points in seconds. Free tier available.",
    keywords: [
        "resume",
        "AI",
        "rewriter",
        "job search",
        "Gemini",
        "bullet points",
        "career",
    ],
    openGraph: {
        title: "AI Resume Rewriter",
        description:
            "Transform your resume bullets into impact-driven statements with AI",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Resume Rewriter",
        description:
            "Transform your resume bullets into impact-driven statements with AI",
    },
};

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                <HeroSection />
                <FeaturesGrid />
                <HowItWorks />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
}
