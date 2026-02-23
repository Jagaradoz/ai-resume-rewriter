"use client";


import { Trash2, Info } from "lucide-react";
import { OutputCard } from "@/components/output-card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { StreamState } from "@/components/rewrite-form";

interface StreamingOutputProps {
    stream: StreamState;
    entitlement: "free" | "pro";
    deletedIndices: Set<number>;
    onDeleteCard: (index: number) => void;
    onClear: () => void;
}

export function parseVariations(text: string): string[] {
    if (!text.trim()) return [];

    // Parse <result>...</result> tags even if streaming is incomplete
    const matches = [...text.matchAll(/<result>([\s\S]*?)(?:<\/result>|$)/g)];
    const parts = matches.map((m) => m[1].trim()).filter((s) => s.length > 0);

    if (parts.length > 0) return parts;

    // Fallback: If no tags found yet but there's text (e.g. streaming just started),
    // just return the raw text cleaned up
    const cleanedText = text.replace(/<\/?result>/g, "").trim();
    return cleanedText ? [cleanedText] : [];
}

export function StreamingOutput({
    stream,
    entitlement,
    deletedIndices,
    onDeleteCard,
    onClear,
}: StreamingOutputProps) {
    const streamVariations = parseVariations(stream.text);

    // Derive active variations by filtering out deleted ones
    const activeVariations = streamVariations.map((text, index) => ({
        text,
        originalIndex: index,
    })).filter((v) => !deletedIndices.has(v.originalIndex));

    const hasContent = activeVariations.length > 0 || stream.status === "streaming";
    const isIdle = stream.status !== "streaming" && !hasContent;

    return (
        <div className="flex h-full flex-col">
            {/* Section Header */}
            <div className="mb-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Rewritten Results
                    </h2>
                    {hasContent && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                    title="Clear All"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Clear all results?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will clear all results from the screen. Your results are still saved in your history.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Clear All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {/* Free plan info */}
                {entitlement === "free" && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            <strong className="font-bold text-foreground">
                                Free Plan
                            </strong>{" "}
                            — Results saved for 7 days. Upgrade to Pro for
                            365-day history.
                        </span>
                    </div>
                )}
            </div>

            {/* Error */}
            {stream.error && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {stream.error}
                </div>
            )}

            {/* Idle State */}
            {isIdle && (
                <div className="flex flex-1 items-center justify-center">
                    <p className="max-w-xs text-center text-sm text-muted-foreground">
                        Your polished, high-impact resume bullets will appear
                        here after you hit Rewrite.
                    </p>
                </div>
            )}

            {/* Streaming Indicator */}
            {stream.status === "streaming" && activeVariations.length === 0 && (
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-orange" />
                        Generating...
                    </div>
                </div>
            )}

            {/* Results */}
            {hasContent && (
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                    {activeVariations.map(({ text, originalIndex }) => (
                        <OutputCard
                            key={originalIndex}
                            text={text}
                            index={originalIndex}
                            onDelete={() => onDeleteCard(originalIndex)}
                        />
                    ))}

                    {stream.status === "streaming" && (
                        <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-orange" />
                            Streaming...
                        </div>
                    )}

                    {stream.status === "done" && (
                        <p className="px-1 py-2 text-xs text-muted-foreground">
                            ✓ Complete — {activeVariations.length} result
                            {activeVariations.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
