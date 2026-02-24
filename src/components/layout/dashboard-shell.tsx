"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { RewriteForm } from "@/components/features/rewrite/rewrite-form";
import { parseVariations, StreamingOutput } from "@/components/features/rewrite/streaming-output";
import type { StreamState } from "@/types/components";

interface DashboardShellProps {
    entitlement: "free" | "pro";
    quotaUsed: number;
    quotaLimit: number;
    justUpgraded?: boolean;
}

export function DashboardShell({ entitlement, quotaUsed, quotaLimit, justUpgraded }: DashboardShellProps) {
    const router = useRouter();

    useEffect(() => {
        if (justUpgraded) {
            toast.success("You're on Pro! Enjoy 30 rewrites per month.", { duration: 5000 });
            router.replace("/dashboard", { scroll: false });
        }
    }, [justUpgraded, router]);
    const [stream, setStream] = useState<StreamState>({
        status: "idle",
        text: "",
    });
    const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());

    const handleStreamUpdate = useCallback((state: StreamState) => {
        setStream(state);
        if (state.status === "streaming" && state.text.length < 50) {
            setDeletedIndices((prev) => prev.size > 0 ? new Set() : prev);
        }
    }, []);

    const handleClear = useCallback(() => {
        setStream({ status: "idle", text: "" });
        setDeletedIndices(new Set());
    }, []);

    const handleDeleteCard = useCallback((index: number) => {
        setDeletedIndices((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    }, []);

    const activeVariationsCount = parseVariations(stream.text).filter((_, i) => !deletedIndices.has(i)).length;
    const hasUnsavedResults = stream.status === "done" && activeVariationsCount > 0;

    return (
        <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
            {/* Left Panel: Input */}
            <section className="flex h-full flex-col border-b border-border bg-background lg:border-b-0 lg:border-r">
                <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-6 md:p-8">
                    <RewriteForm
                        entitlement={entitlement}
                        quotaUsed={quotaUsed}
                        quotaLimit={quotaLimit}
                        onStreamUpdate={handleStreamUpdate}
                        hasUnsavedResults={hasUnsavedResults}
                    />
                </div>
            </section>

            {/* Right Panel: Output */}
            <section className="flex h-full flex-col overflow-hidden bg-muted/30">
                <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-6 md:p-8">
                    <StreamingOutput
                        stream={stream}
                        entitlement={entitlement}
                        deletedIndices={deletedIndices}
                        onDeleteCard={handleDeleteCard}
                        onClear={handleClear}
                    />
                </div>
            </section>
        </main>
    );
}
