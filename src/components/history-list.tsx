"use client";

import { useState } from "react";
import { Copy, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteRewriteAction } from "@/lib/actions/rewrite-actions";
import Link from "next/link";
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

interface HistoryItem {
    id: string;
    rawInput: string;
    variations: unknown;
    tone: string;
    createdAt: Date;
}

interface HistoryListProps {
    items: HistoryItem[];
    nextCursor?: string;
}

const TONE_LABELS: Record<string, string> = {
    professional: "Professional",
    "action-oriented": "Action-Oriented",
    executive: "Executive",
};

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function HistoryCard({ item }: { item: HistoryItem }) {
    const [expanded, setExpanded] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const variations = Array.isArray(item.variations)
        ? (item.variations as string[])
        : [];

    async function handleCopy(text: string, index: number) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            // Clipboard API not available
        }
    }

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteRewriteAction(item.id);
        if (result.error) {
            setIsDeleting(false);
            return;
        }
        setIsDeleted(true);
    }

    if (isDeleted) return null;

    return (
        <div className="rounded-lg border border-border bg-card transition-colors">
            {/* Header — always visible */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left"
            >
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                        {item.rawInput.slice(0, 120)}
                        {item.rawInput.length > 120 ? "…" : ""}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                        </span>
                        <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {TONE_LABELS[item.tone] ?? item.tone}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {variations.length} result{variations.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                    {/* Original input */}
                    <div className="mb-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Original Input
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {item.rawInput}
                        </p>
                    </div>

                    {/* Variations */}
                    <div className="space-y-3">
                        {variations.map((text, i) => (
                            <div
                                key={i}
                                className="group rounded-md border border-border bg-muted/30 p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 text-sm text-foreground whitespace-pre-wrap">
                                        {text}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(text, i);
                                        }}
                                        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-brand-blue"
                                        title="Copy"
                                    >
                                        {copiedIndex === i ? (
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delete */}
                    <div className="mt-4 flex justify-end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this rewrite?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove this rewrite from your history.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HistoryList({ items, nextCursor }: HistoryListProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">
                    No rewrites yet. Head to the{" "}
                    <Link href="/dashboard" className="text-brand-blue hover:underline">
                        dashboard
                    </Link>{" "}
                    to create your first one.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <HistoryCard key={item.id} item={item} />
            ))}

            {nextCursor && (
                <div className="flex justify-center pt-4">
                    <Link
                        href={`/dashboard/history?cursor=${nextCursor}`}
                        className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        Load More
                    </Link>
                </div>
            )}
        </div>
    );
}
