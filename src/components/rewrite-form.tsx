"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToneSelector, type Tone } from "@/components/tone-selector";
import { Sparkles } from "lucide-react";
import { ExamplePicker } from "@/components/example-picker";
import { QuotaBar } from "@/components/quota-bar";
import toast from "react-hot-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuotaExceededModal } from "@/components/quota-exceeded-modal";

const MAX_CHARS = 2000;
const MIN_CHARS = 10;

export interface StreamState {
    status: "idle" | "streaming" | "done" | "error";
    text: string;
    error?: string;
}

interface RewriteFormProps {
    entitlement: "free" | "pro";
    quotaUsed: number;
    quotaLimit: number;
    onStreamUpdate: (state: StreamState) => void;
    hasUnsavedResults?: boolean;
}

export function RewriteForm({ entitlement, quotaUsed, quotaLimit, onStreamUpdate, hasUnsavedResults }: RewriteFormProps) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [tone, setTone] = useState<Tone>("professional");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
    const [localQuotaUsed, setLocalQuotaUsed] = useState(quotaUsed);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setLocalQuotaUsed(quotaUsed);
    }, [quotaUsed]);

    const charCount = input.length;
    const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
    const resultsCount = entitlement === "pro" ? 3 : 2;
    const quotaExhausted = localQuotaUsed >= quotaLimit;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isStreaming) return;

        if (quotaExhausted) {
            if (entitlement === "free") {
                setIsQuotaModalOpen(true);
            } else {
                toast.error("You're out of rewrites this month. Your quota resets next cycle.");
            }
            return;
        }

        if (charCount < MIN_CHARS) {
            toast.error(`Input too short. Add at least ${MIN_CHARS} characters to rewrite.`);
            return;
        }

        if (hasUnsavedResults && !isConfirmOpen) {
            setIsConfirmOpen(true);
            return;
        }

        await executeRewrite();
    }

    async function executeRewrite() {
        setIsStreaming(true);
        onStreamUpdate({ status: "streaming", text: "" });
        abortRef.current = new AbortController();

        try {
            const response = await fetch("/api/rewrite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawInput: input, tone }),
                signal: abortRef.current.signal,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data.error ?? `Request failed (${response.status})`,
                );
            }

            if (!response.body) {
                throw new Error("No response stream");
            }

            setLocalQuotaUsed((prev) => prev + 1);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;

                    const json = line.slice(6);
                    try {
                        const parsed = JSON.parse(json);

                        if (parsed.error) {
                            onStreamUpdate({
                                status: "error",
                                text: accumulated,
                                error: parsed.error,
                            });
                            setIsStreaming(false);
                            return;
                        }

                        if (parsed.done) {
                            onStreamUpdate({
                                status: "done",
                                text: accumulated,
                            });
                            setIsStreaming(false);
                            return;
                        }

                        if (parsed.text) {
                            accumulated += parsed.text;
                            onStreamUpdate({
                                status: "streaming",
                                text: accumulated,
                            });
                        }
                    } catch {
                        // Skip malformed JSON lines
                    }
                }
            }

            onStreamUpdate({ status: "done", text: accumulated });
            router.refresh();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                onStreamUpdate({ status: "idle", text: "" });
                setIsStreaming(false);
                return;
            }

            onStreamUpdate({
                status: "error",
                text: "",
                error:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong",
            });
        } finally {
            setIsStreaming(false);
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                    Paste your experience
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Transform your raw bullet points into powerful,
                    results-driven statements.
                </p>
            </div>

            {/* Tone Selector */}
            <div className="mb-6">
                <ToneSelector value={tone} onChange={setTone} />
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-0"
            >
                <div className="relative flex-1">
                    <label className="sr-only" htmlFor="raw-input">
                        Raw Bullet Points
                    </label>
                    <Textarea
                        id="raw-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g. Managed a team of sales people and increased revenue by 20%..."
                        className="h-full min-h-[200px] resize-none text-base leading-relaxed"
                        disabled={isStreaming}
                        maxLength={MAX_CHARS}
                    />
                    <span
                        className={`absolute bottom-3 right-3 font-mono text-xs ${charCount > MAX_CHARS
                            ? "text-destructive"
                            : "text-muted-foreground"
                            }`}
                    >
                        {charCount} / {MAX_CHARS}
                    </span>
                </div>

                {/* Quota + action row */}
                <div className="flex flex-col gap-3 pt-6 w-full">
                    <QuotaBar used={localQuotaUsed} limit={quotaLimit} entitlement={entitlement} />
                    <div className="flex items-stretch gap-3 justify-end">
                        <ExamplePicker onSelect={setInput} disabled={isStreaming} />
                        <Button
                            type="submit"
                            disabled={isStreaming}
                            className="h-14 flex-col items-center gap-1.5 bg-brand-orange px-8 text-xs font-bold uppercase tracking-widest text-brand-orange-foreground hover:bg-brand-orange/90 disabled:opacity-50"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className={`h-4 w-4 ${isStreaming ? "animate-pulse" : ""}`} />
                                {isStreaming ? "Rewriting..." : "Rewrite"}
                            </div>
                            <span className="text-[10px] font-medium opacity-90">
                                {resultsCount} Results ({entitlement === "pro" ? "Pro" : "Free"})
                            </span>
                        </Button>
                    </div>
                </div>
            </form>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start a new rewrite?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Starting a new rewrite will clear the current results from view. Your previous results are already saved to history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeRewrite} className="bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90">
                            Continue Rewriting
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <QuotaExceededModal
                open={isQuotaModalOpen}
                onOpenChange={setIsQuotaModalOpen}
                limit={quotaLimit}
            />
        </div>
    );
}
