const steps = [
    {
        number: "01",
        title: "Paste Your Experience",
        description:
            "Drop in your raw bullet points, job responsibilities, or achievements — up to 2,000 characters.",
    },
    {
        number: "02",
        title: "Choose a Tone",
        description:
            "Pick Professional, Confident, or Concise — each optimized for different resume styles and industries.",
    },
    {
        number: "03",
        title: "Get Polished Results",
        description:
            "Watch AI rewrite your text in real-time with streaming output. Copy, export, or save to history.",
    },
];

export function HowItWorks() {
    return (
        <section className="px-6 py-20 md:py-24">
            <div className="mx-auto max-w-4xl">
                <h2 className="text-center text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                    Three Steps
                </h2>
                <div className="mt-12 grid gap-8 sm:grid-cols-3">
                    {steps.map((step) => (
                        <div key={step.number} className="relative">
                            <span className="text-5xl font-black tracking-tighter text-brand-orange sm:text-6xl">
                                {step.number}
                            </span>
                            <h3 className="mt-3 text-sm font-bold uppercase tracking-widest text-foreground">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
