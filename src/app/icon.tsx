import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "transparent",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Simplified pixel-perfect replica of the logo for 32x32 viewports */}
                <svg viewBox="0 0 100 100" width="32" height="32" fill="none">
                    <path d="M50 15L85 32.5L50 50L15 32.5L50 15Z" fill="#1877f2" />
                    <path d="M25 43.5V65C25 75 35 83 50 83C65 83 75 75 75 65V43.5L50 56L25 43.5Z" fill="#1877f2" opacity="0.85" />
                </svg>
            </div>
        ),
        { ...size }
    );
}