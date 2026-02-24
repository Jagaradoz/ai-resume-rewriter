"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { deleteRewriteAction } from "@/features/rewrite/rewrite.actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface RewriteItem {
    id: string;
    rawInput: string;
    variations: string[];
    tone: string;
    createdAt: Date;
}

interface HistoryListProps {
    items: RewriteItem[];
    nextCursor?: string;
}

export function HistoryList({ items, nextCursor }: HistoryListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleToggle(id: string) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteRewriteAction(id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Rewrite deleted.");
            }
            setDeleteId(null);
        });
    }

    async function handleCopy(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied!");
        } catch {
            toast.error("Failed to copy.");
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-12 text-center text-muted-foreground">
                <p>No rewrites yet. Go to the dashboard to create your first one.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((r) => {
                const isExpanded = expandedId === r.id;
                return (
                    <div key={r.id} className="rounded-lg border border-border bg-card">
                        <button
                            type="button"
                            onClick={() => handleToggle(r.id)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {r.rawInput.slice(0, 80)}
                                    {r.rawInput.length > 80 ? "…" : ""}
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {r.tone} · {r.variations.length} result{r.variations.length !== 1 ? "s" : ""} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {isExpanded ? (
                                <ChevronUp className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                        </button>

                        {isExpanded && (
                            <div className="space-y-3 border-t border-border px-4 py-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Original Input
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                                        {r.rawInput}
                                    </p>
                                </div>
                                {r.variations.map((v, i) => (
                                    <div key={i} className="group rounded-md border border-border bg-muted/30 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-foreground">
                                                {v}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(v)}
                                                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
                                                title="Copy"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteId(r.id)}
                                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this rewrite?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The rewrite and all its variations will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
