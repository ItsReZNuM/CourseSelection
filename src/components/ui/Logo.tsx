"use client";

import React from "react";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary, #5b8def)" />
                    <stop offset="100%" stopColor="#1877f2" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1877f2" floodOpacity="0.3" />
                </filter>
            </defs>

            <path
                d="M50 15L85 32.5L50 50L15 32.5L50 15Z"
                fill="url(#logo-grad)"
                filter="url(#glow)"
            />
            <path
                d="M25 43.5V65C25 75 35 83 50 83C65 83 75 75 75 65V43.5L50 56L25 43.5Z"
                fill="url(#logo-grad)"
                opacity="0.85"
            />
            <path
                d="M50 56L80 41V68L50 83V56Z"
                fill="#ffffff"
                opacity="0.15"
            />
        </svg>
    );
}