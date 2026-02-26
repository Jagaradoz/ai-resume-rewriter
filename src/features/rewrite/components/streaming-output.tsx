"use client";

import { Info, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ExportButtons } from "@/features/rewrite/components/export-buttons";
import { OutputCard } from "@/features/rewrite/components/output-card";
import type { StreamState } from "@/features/rewrite/rewrite.types";

const CHARS_PER_FRAME = 30;

function useTypingEffect(fullText: string, isStreaming: boolean): string {
    const [displayed, setDisplayed] = useState("");
    const rafRef = useRef<number>(0);
    const indexRef = useRef(0);

    useEffect(() => {
        if (!isStreaming) {
            setDisplayed(fullText);
            indexRef.current = fullText.length;
            return;
        }

        function tick() {
            const target = fullText;
            if (indexRef.current < target.length) {
                indexRef.current = Math.min(
                    indexRef.current + CHARS_PER_FRAME,
                    target.length,
                );
                setDisplayed(target.slice(0, indexRef.current));
            }
            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [fullText, isStreaming]);

    // Reset when a new stream starts
    useEffect(() => {
        if (isStreaming && fullText === "") {
            indexRef.current = 0;
            setDisplayed("");
        }
    }, [isStreaming, fullText]);

    return displayed;
}
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
} from "@/shared/ui/alert-dialog";

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
    const isStreaming = stream.status === "streaming";
    const displayedText = useTypingEffect(stream.text, isStreaming);
    const streamVariations = parseVariations(displayedText);

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
                    <div className="flex items-center gap-1">
                        {stream.status === "done" && stream.rawInput && stream.tone && (
                            <ExportButtons
                                variations={activeVariations.map((v) => v.text)}
                                rawInput={stream.rawInput}
                                tone={stream.tone}
                            />
                        )}
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
