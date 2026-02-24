"use client";

import { motion } from "framer-motion";
import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

interface OutputCardProps {
    text: string;
    index: number;
    onRegenerate?: () => void;
    onDelete?: () => void;
}

function formatBulletText(text: string) {
    const lines = text.split("\n").filter((l) => l.trim());
    const bullets: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (/^[-•*]\s/.test(trimmed)) {
            bullets.push(trimmed.replace(/^[-•*]\s*/, ""));
        }
    }

    if (bullets.length === 0) {
        return <p className="text-base leading-relaxed text-foreground">{text}</p>;
    }

    return (
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-foreground">
            {bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
            ))}
        </ul>
    );
}

export function OutputCard({ text, index, onRegenerate, onDelete }: OutputCardProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API not available
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: index * 0.1,
            }}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-brand-orange/30"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">{formatBulletText(text)}</div>
                <div className="flex flex-col gap-1">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand-blue"
                        title="Copy"
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </button>
                    {onRegenerate && (
                        <button
                            type="button"
                            onClick={onRegenerate}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand-orange"
                            title="Regenerate"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
