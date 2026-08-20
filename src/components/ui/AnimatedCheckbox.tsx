"use client";

import React from "react";

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}

export default function AnimatedCheckbox({ checked, onChange, label }: Props) {
    return (
        <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <svg viewBox="0 0 64 64" className="w-6 h-6 overflow-visible">
                    <path
                        d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                        className="fill-none stroke-muted group-hover:stroke-primary stroke-[5px]"
                        style={{
                            /* Inline styles guarantee the animation runs regardless of Tailwind compiler limits */
                            transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease, stroke 0.3s ease",
                            strokeDasharray: checked ? "70.51 9999999" : "241 9999999",
                            strokeDashoffset: checked ? -262.27 : 0,
                            stroke: checked ? "var(--color-primary)" : "",
                        }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <span className="text-sm text-foreground transition-colors group-hover:text-primary">
                {label}
            </span>
        </label>
    );
}