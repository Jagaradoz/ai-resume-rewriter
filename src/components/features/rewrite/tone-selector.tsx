"use client";

import { Briefcase, Star,Zap } from "lucide-react";

const TONES = [
    { value: "professional", label: "Professional", icon: Briefcase },
    { value: "action-oriented", label: "Action-Oriented", icon: Zap },
    { value: "executive", label: "Executive", icon: Star },
] as const;

export type Tone = (typeof TONES)[number]["value"];

interface ToneSelectorProps {
    value: Tone;
    onChange: (tone: Tone) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {TONES.map(({ value: tone, label, icon: Icon }) => {
                const isSelected = tone === value;
                return (
                    <button
                        key={tone}
                        type="button"
                        onClick={() => onChange(tone)}
                        className={`group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${isSelected
                                ? "border-brand-orange bg-brand-orange/10 text-foreground"
                                : "border-border bg-card text-muted-foreground hover:border-brand-orange/50 hover:text-foreground"
                            }`}
                    >
                        <Icon
                            className={`h-4 w-4 ${isSelected
                                    ? "text-brand-orange"
                                    : "text-muted-foreground group-hover:text-brand-orange"
                                } transition-colors`}
                        />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
