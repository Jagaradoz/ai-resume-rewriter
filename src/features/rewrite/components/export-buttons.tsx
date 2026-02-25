"use client";

import { FileDown, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { exportToDOCX, exportToPDF } from "@/features/rewrite/export.utils";

interface ExportButtonsProps {
    variations: string[];
    rawInput: string;
    tone: string;
}

export function ExportButtons({ variations, rawInput, tone }: ExportButtonsProps) {
    function handlePDF() {
        try {
            exportToPDF(variations, rawInput, tone);
            toast.success("PDF downloaded.");
        } catch {
            toast.error("Failed to export PDF.");
        }
    }

    async function handleDOCX() {
        try {
            await exportToDOCX(variations, rawInput, tone);
            toast.success("DOCX downloaded.");
        } catch {
            toast.error("Failed to export DOCX.");
        }
    }

    if (variations.length === 0) return null;

    return (
        <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={handlePDF}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Export as PDF"
            >
                <FileText className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={handleDOCX}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Export as DOCX"
            >
                <FileDown className="h-4 w-4" />
            </button>
        </div>
    );
}
