import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

function getFilename(ext: string): string {
    const date = new Date().toISOString().slice(0, 10);
    return `resume-rewrite-${date}.${ext}`;
}

export function exportToPDF(
    variations: string[],
    rawInput: string,
    tone: string,
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AI Resume Rewriter — Results", margin, y);
    y += 10;

    // Date & tone
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(
        `Generated ${new Date().toLocaleDateString("en-US")} · Tone: ${tone}`,
        margin,
        y,
    );
    y += 12;

    // Original input
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text("ORIGINAL INPUT", margin, y);
    y += 6;
    doc.setTextColor(80);
    doc.setFontSize(10);
    const inputLines = doc.splitTextToSize(rawInput, maxWidth);
    doc.text(inputLines, margin, y);
    y += inputLines.length * 5 + 10;

    // Variations
    doc.setTextColor(0);
    variations.forEach((text, i) => {
        // Check if we need a new page
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Variation ${i + 1}`, margin, y);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 10;
    });

    doc.save(getFilename("pdf"));
}

export async function exportToDOCX(
    variations: string[],
    rawInput: string,
    tone: string,
) {
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "AI Resume Rewriter — Results",
                                bold: true,
                                size: 32,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Generated ${new Date().toLocaleDateString("en-US")} · Tone: ${tone}`,
                                size: 18,
                                color: "888888",
                            }),
                        ],
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "ORIGINAL INPUT",
                                bold: true,
                                size: 18,
                                color: "666666",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: rawInput,
                                size: 20,
                                color: "444444",
                            }),
                        ],
                        spacing: { after: 300 },
                    }),
                    ...variations.flatMap((text, i) => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Variation ${i + 1}`,
                                    bold: true,
                                    size: 22,
                                }),
                            ],
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text,
                                    size: 20,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                    ]),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, getFilename("docx"));
}
