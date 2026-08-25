// src/components/ui/WelcomeModal.tsx
"use client";

import { useState, useEffect, useRef, UIEvent } from "react";
import { createPortal } from "react-dom";
import { Plus, CalendarDays, Edit2, Download, Palette, Sparkles, MessageSquareHeart } from "lucide-react";

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const hasSeen = localStorage.getItem("hasSeenWelcome");
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                if (contentRef.current) {
                    if (contentRef.current.scrollHeight <= contentRef.current.clientHeight + 10) {
                        setIsAtBottom(true);
                    }
                }
            }, 300);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 30) {
            setIsAtBottom(true);
        }
    };

    const handleClose = () => {
        localStorage.setItem("hasSeenWelcome", "true");
        setIsOpen(false);
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"></div>

            <div className="glass-panel w-full max-w-lg relative z-10 animate-slide-up bg-[var(--card)]/95 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* هدر */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4 shrink-0 relative border-b border-border/50">
                    <div className="text-5xl md:text-6xl mb-4 origin-bottom animate-[wave_2s_ease-in-out_infinite]">👋</div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-primary px-4 text-center leading-tight">
                        به راهنمای انتخاب واحد <br className="md:hidden" /> خوش اومدی! 🎉
                    </h2>
                </div>

                {/* محتوای اسکرول‌خور */}
                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8"
                >
                    <p className="text-base text-foreground/90 leading-relaxed font-bold text-center">
                        سلام! اینجا همه‌چیز برای راحتی تو طراحی شده تا بدون سردرد یه برنامه هفتگی بی‌نقص بچینی. بیا تا سریع بهت بگم سایت چطوری کار می‌کنه:
                    </p>

                    <div className="flex gap-4 md:gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mt-1 shadow-inner">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-foreground mb-1.5 text-base md:text-lg">افزودن درس؛ هوشمند و ضد تداخل ➕</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                از نوار بالا روی دکمه «افزودن» کلیک کن. سیستم ما به قدری باهوشه که اگه ساعت کلاست با یه کلاس دیگه حتی یک دقیقه تداخل داشته باشه، مچت رو می‌گیره و اخطار میده! 🕵️‍♂️✨
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-ok/10 flex items-center justify-center text-ok border border-ok/20 mt-1 shadow-inner">
                            <CalendarDays size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-foreground mb-1.5 text-base md:text-lg">نمایش بی‌نقص در هر دستگاه 📅</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                توی کامپیوتر یه جدولِ عریض و حرفه‌ای داری، اما توی موبایل یه تایم‌لاینِ عمودیِ شیک و مدرن طراحی کردیم که کار کردن باهاش با یک دست، لذت‌بخش‌ترین کار دنیاست! 📱💻
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mt-1 shadow-inner">
                            <Edit2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-foreground mb-1.5 text-base md:text-lg">مدیریت آسان؛ ویرایش و حذف ✏️</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                روی هر درس که بزنی اطلاعات کاملش تو یه پنل شیشه‌ای باز میشه. راحت ویرایشش کن یا حذفش کن. نگران نباش، قبل از حذف قطعی حتماً ازت تاییدیه می‌گیریم تا زحماتت پاک نشه. 🛡️👌
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mt-1 shadow-inner">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-foreground mb-1.5 text-base md:text-lg">خروجی گرفتن و بکاپ 📸</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                برنامه‌ات که کامل شد، از منوی بالا روی دانلود کلیک کن. می‌تونی از برنامه‌ات یه عکس خوشگل (PNG) یا فایل PDF بگیری. حتی می‌تونی از کل اطلاعاتت یه فایل پشتیبان (JSON) بگیری. 🚀📂
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 md:gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-danger/10 flex items-center justify-center text-danger border border-danger/20 mt-1 shadow-inner">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-foreground mb-1.5 text-base md:text-lg">جادوی تم‌ها 🎨</h3>
                            <p className="text-sm text-muted leading-relaxed">
                                چشمات خسته شده؟ با دکمه تغییر تم، رنگ‌بندی سایت رو عوض کن! ما عاشق دارک‌مودیم، ولی تم روشنمون هم بدجوری دلبری می‌کنه! انیمیشن تغییر تم رو دیدی؟ ✨🌗
                            </p>
                        </div>
                    </div>

                    {/* باکس ارتباط با ادمین */}
                    <div className="mt-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border shadow-inner flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground mb-3">
                            <MessageSquareHeart size={20} />
                        </div>
                        <h3 className="font-extrabold text-foreground mb-2 text-sm md:text-base">پیشنهادی داری؟ باگی پیدا کردی؟ 🐞</h3>
                        <p className="text-xs md:text-sm text-muted leading-relaxed mb-4">
                            اگه جایی از سایت مشکلی داشت یا ایده‌ای برای بهتر شدنش داری، حتماً بهم بگو. از طریق لینک‌های زیر می‌تونی مستقیم باهام در ارتباط باشی:
                        </p>

                        <div className="flex items-center gap-3">
                            <a href="https://github.com/ItsReZNuM" target="_blank" rel="noopener noreferrer" className="glass-btn p-2.5 text-muted hover:text-foreground transition-all duration-300 hover:-translate-y-1" aria-label="GitHub">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                            </a>
                            <a href="https://www.instagram.com/itsreznum/" target="_blank" rel="noopener noreferrer" className="glass-btn p-2.5 text-muted hover:text-[#E1306C] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E1306C]/20" aria-label="Instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                            </a>
                            <a href="https://t.me/ItsReZNuM" target="_blank" rel="noopener noreferrer" className="glass-btn p-2.5 text-muted hover:text-[#229ED9] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#229ED9]/20" aria-label="Telegram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5"><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg>
                            </a>
                        </div>
                    </div>

                    <div className="h-6"></div>
                </div>

                {/* دکمه انتهای فرم */}
                <div className="p-4 md:p-5 border-t border-[var(--border-color)] bg-black/5 dark:bg-white/5 shrink-0">
                    <button
                        onClick={handleClose}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-base transition-all duration-300 shadow-md ${isAtBottom
                                ? "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
                                : "bg-black/10 dark:bg-white/10 text-muted hover:text-foreground hover:bg-black/20 dark:hover:bg-white/20"
                            }`}
                    >
                        {isAtBottom ? (
                            <>
                                بااااااوشه دمت گرم ! <Sparkles size={20} />
                            </>
                        ) : (
                            "نخوندم بابا خودم بلدم 🙄"
                        )}
                    </button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                    60%, 100% { transform: rotate(0deg); }
                }
            `}} />
        </div>,
        document.body
    );
}