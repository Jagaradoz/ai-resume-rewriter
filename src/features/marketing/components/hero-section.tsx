"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

export function HeroSection() {
    return (
        <section className="relative flex flex-col items-center px-6 pb-24 pt-20 md:pb-32 md:pt-28">
            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-3 border-2 border-foreground bg-background px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-foreground"
            >
                <div className="h-2 w-2 animate-pulse rounded-sm bg-brand-orange" />
                AI Resume Rewriter
            </motion.div>

            {/* Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-10 text-center text-6xl font-black leading-[1.1] tracking-tighter text-foreground sm:text-7xl xl:text-8xl"
            >
                NO MORE <br />
                <span className="text-muted-foreground">FLUFF.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 max-w-md border-l-4 border-brand-orange pl-4 text-center text-xl font-medium leading-relaxed text-muted-foreground sm:text-left sm:text-2xl"
            >
                Paste your raw experience. Get polished, impact-driven resume
                bullets powered by AI — in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
                <Button
                    asChild
                    className="h-12 bg-brand-orange px-8 text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90"
                >
                    <Link href="/signup">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="outline"
                    className="h-12 border-brand-blue px-8 text-xs font-bold uppercase tracking-widest text-brand-blue"
                >
                    <Link href="/pricing">View Pricing</Link>
                </Button>
            </motion.div>

            {/* ATS badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-16 space-y-3 text-center"
            >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Optimized for modern tracking systems
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-[11px] font-extrabold uppercase tracking-widest">
                    {["Workday", "Greenhouse", "Lever", "Taleo"].map(
                        (system) => (
                            <span
                                key={system}
                                className="border-b-2 border-foreground pb-1"
                            >
                                {system}
                            </span>
                        ),
                    )}
                </div>
            </motion.div>
        </section>
    );
}
