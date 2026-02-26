import { Clock, Layers, Sparkles } from "lucide-react";

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Rewriting",
        description:
            "GPT-4o-mini transforms your raw experience into polished, results-driven bullet points that hiring managers notice.",
    },
    {
        icon: Layers,
        title: "Multiple Variations",
        description:
            "Get 2–3 unique variations per rewrite. Pick the one that fits your target role, or mix and match.",
    },
    {
        icon: Clock,
        title: "Smart History",
        description:
            "Every rewrite is saved automatically. Come back anytime to copy, export, or refine your best bullets.",
    },
];

export function FeaturesGrid() {
    return (
        <section className="border-t border-border bg-muted/30 px-6 py-20 md:py-24">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-center text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                    How It Works
                </h2>
                <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
                    Three steps. Zero fluff. Resume bullets that actually land
                    interviews.
                </p>
                <div className="mt-12 grid gap-8 sm:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-lg border border-border bg-card p-6"
                        >
                            <feature.icon className="h-6 w-6 text-brand-orange" />
                            <h3 className="mt-4 text-sm font-bold uppercase tracking-widest text-foreground">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
