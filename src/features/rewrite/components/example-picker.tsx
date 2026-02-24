"use client";

import { Dices } from "lucide-react";

import { samples } from "@/features/rewrite/rewrite.samples";

interface ExamplePickerProps {
    onSelect: (input: string) => void;
    disabled?: boolean;
}

export function ExamplePicker({ onSelect, disabled }: ExamplePickerProps) {
    function pickRandom() {
        const random = samples[Math.floor(Math.random() * samples.length)];
        if (random) onSelect(random.input);
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={pickRandom}
            title="Random example"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
            <Dices size={24} />
        </button>
    );
}
