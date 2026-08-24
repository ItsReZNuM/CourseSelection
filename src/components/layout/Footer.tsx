// src/components/layout/Footer.tsx
"use client";

export default function Footer() {
    return (
        <footer className="mt-12 mb-2 flex flex-col items-center justify-center gap-5 w-full relative z-[60]">

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
                <a
                    href="https://github.com/ItsReZNuM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn p-3 text-muted hover:text-foreground hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                    aria-label="GitHub"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                </a>

                <a
                    href="https://www.instagram.com/itsreznum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn p-3 text-muted hover:text-[#E1306C] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E1306C]/20 transition-all duration-300"
                    aria-label="Instagram"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                </a>

                <a
                    href="https://t.me/ItsReZNuM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn p-3 text-muted hover:text-[#229ED9] hover:-translate-y-1 hover:shadow-lg hover:shadow-[#229ED9]/20 transition-all duration-300"
                    aria-label="Telegram"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                        <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
                    </svg>
                </a>
            </div>

            {/* Signature Texts */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-5 text-[11px] md:text-xs font-bold text-muted/80 bg-black/5 dark:bg-white/5 px-6 py-2.5 rounded-2xl border border-[var(--border-color)] backdrop-blur-sm">

                <span className="flex items-center gap-1.5">
                    ساخته شده با <span className="text-danger animate-heartbeat text-sm md:text-base">❤️</span> توسط رضا محمدنیا
                </span>

                <span className="hidden md:block w-1 h-1 rounded-full bg-border"></span>

                <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                    Made with <span className="text-danger animate-heartbeat text-sm md:text-base">❤️</span> By ItsReZNuM
                </span>

            </div>
        </footer>
    );
}