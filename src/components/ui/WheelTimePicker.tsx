// src/components/ui/WheelTimePicker.tsx
"use client";

import { useState, useRef, useEffect, UIEvent } from "react";
import { createPortal } from "react-dom";
import { Clock, Check, X, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
    value: string;
    onChange: (time: string) => void;
    placeholder?: string;
    className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];
const ITEM_HEIGHT = 44;

export default function WheelTimePicker({ value, onChange, placeholder = "--:--", className = "" }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [selectedHour, setSelectedHour] = useState("08");
    const [selectedMinute, setSelectedMinute] = useState("00");

    const hourRef = useRef<HTMLDivElement>(null);
    const minuteRef = useRef<HTMLDivElement>(null);

    const targetHourIndex = useRef(8);
    const targetMinuteIndex = useRef(0);
    const isAutoScrolling = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            let targetHour = "08";
            let targetMinute = "00";

            if (value && value.includes(":")) {
                const [h, m] = value.split(":");
                targetHour = h.padStart(2, "0");
                targetMinute = MINUTES.includes(m) ? m : "00";
            }

            const hIdx = HOURS.indexOf(targetHour) !== -1 ? HOURS.indexOf(targetHour) : 8;
            const mIdx = MINUTES.indexOf(targetMinute) !== -1 ? MINUTES.indexOf(targetMinute) : 0;

            setSelectedHour(targetHour);
            setSelectedMinute(targetMinute);
            targetHourIndex.current = hIdx;
            targetMinuteIndex.current = mIdx;

            isAutoScrolling.current = true;

            setTimeout(() => {
                if (hourRef.current) hourRef.current.scrollTop = 0;
                if (minuteRef.current) minuteRef.current.scrollTop = 0;

                setTimeout(() => {
                    hourRef.current?.scrollTo({ top: hIdx * ITEM_HEIGHT, behavior: "smooth" });
                    minuteRef.current?.scrollTo({ top: mIdx * ITEM_HEIGHT, behavior: "smooth" });

                    setTimeout(() => {
                        isAutoScrolling.current = false;
                    }, 450);
                }, 40);
            }, 80);

        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen, value]);

    // مدیریت چرخ موس
    useEffect(() => {
        if (!isOpen) return;

        const hRef = hourRef.current;
        const mRef = minuteRef.current;

        let isThrottledH = false;
        let isThrottledM = false;

        const onHourWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isThrottledH || isAutoScrolling.current) return;
            isThrottledH = true;

            const direction = Math.sign(e.deltaY);
            const nextIdx = Math.max(0, Math.min(targetHourIndex.current + direction, HOURS.length - 1));
            targetHourIndex.current = nextIdx;
            setSelectedHour(HOURS[nextIdx]);
            hRef?.scrollTo({ top: nextIdx * ITEM_HEIGHT, behavior: "smooth" });

            setTimeout(() => { isThrottledH = false; }, 120);
        };

        const onMinuteWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isThrottledM || isAutoScrolling.current) return;
            isThrottledM = true;

            const direction = Math.sign(e.deltaY);
            const nextIdx = Math.max(0, Math.min(targetMinuteIndex.current + direction, MINUTES.length - 1));
            targetMinuteIndex.current = nextIdx;
            setSelectedMinute(MINUTES[nextIdx]);
            mRef?.scrollTo({ top: nextIdx * ITEM_HEIGHT, behavior: "smooth" });

            setTimeout(() => { isThrottledM = false; }, 120);
        };

        hRef?.addEventListener("wheel", onHourWheel, { passive: false });
        mRef?.addEventListener("wheel", onMinuteWheel, { passive: false });

        return () => {
            hRef?.removeEventListener("wheel", onHourWheel);
            mRef?.removeEventListener("wheel", onMinuteWheel);
        };
    }, [isOpen]);

    const handleHourScroll = (e: UIEvent<HTMLDivElement>) => {
        if (isAutoScrolling.current) return;
        const index = Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT);
        targetHourIndex.current = index;
        if (HOURS[index] && HOURS[index] !== selectedHour) {
            setSelectedHour(HOURS[index]);
        }
    };

    const handleMinuteScroll = (e: UIEvent<HTMLDivElement>) => {
        if (isAutoScrolling.current) return;
        const index = Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT);
        targetMinuteIndex.current = index;
        if (MINUTES[index] && MINUTES[index] !== selectedMinute) {
            setSelectedMinute(MINUTES[index]);
        }
    };

    const stepHour = (direction: number) => {
        const nextIndex = Math.max(0, Math.min(targetHourIndex.current + direction, HOURS.length - 1));
        if (nextIndex !== targetHourIndex.current) {
            targetHourIndex.current = nextIndex;
            setSelectedHour(HOURS[nextIndex]);
            hourRef.current?.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: "smooth" });
        }
    };

    const stepMinute = (direction: number) => {
        const nextIndex = Math.max(0, Math.min(targetMinuteIndex.current + direction, MINUTES.length - 1));
        if (nextIndex !== targetMinuteIndex.current) {
            targetMinuteIndex.current = nextIndex;
            setSelectedMinute(MINUTES[nextIndex]);
            minuteRef.current?.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: "smooth" });
        }
    };

    const handleConfirm = () => {
        onChange(`${selectedHour}:${selectedMinute}`);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`glass-input flex items-center justify-between text-center cursor-pointer transition-all ${className}`}
            >
                <Clock size={16} className="text-muted shrink-0" />
                <span className={value ? "text-foreground font-bold font-mono w-full" : "text-muted/60 font-sans w-full"}>
                    {value || placeholder}
                </span>
                <div className="w-4 shrink-0"></div>
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed top-0 left-0 w-full h-[100dvh] z-[999999] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl md:bg-black/20 md:backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}></div>

                    <div className="relative w-full md:w-[360px] mt-auto md:mt-0 bg-[var(--card)]/95 backdrop-blur-3xl border-t md:border border-[var(--border-color)] rounded-t-[32px] md:rounded-3xl p-6 pb-8 md:pb-6 shadow-2xl animate-slide-up flex flex-col items-center">
                        <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-4 shrink-0 md:hidden"></div>

                        <h4 className="text-base font-bold text-primary mb-5">تنظیم ساعت</h4>

                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-3xl p-4 border border-[var(--border-color)] flex items-center justify-center gap-3" dir="ltr">

                            {/* ستون ساعت */}
                            <div className="flex-1 flex flex-col items-center">
                                <span className="text-xs font-bold text-muted mb-2.5">ساعت</span>

                                <button
                                    type="button"
                                    onClick={() => stepHour(-1)}
                                    className="w-16 h-8 mb-2.5 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary/20 hover:text-primary border border-[var(--border-color)] text-muted transition-all active:scale-90 cursor-pointer shadow-sm"
                                    aria-label="ساعت قبلی"
                                >
                                    <ChevronUp size={18} />
                                </button>

                                <div
                                    className="relative w-full h-[132px] rounded-2xl overflow-hidden bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--border-color)]/70"
                                    style={{
                                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                                        maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)"
                                    }}
                                >
                                    <div className="absolute inset-x-1.5 top-[44px] h-[44px] bg-primary/15 dark:bg-primary/25 rounded-xl border border-primary/30 pointer-events-none z-0"></div>

                                    <div
                                        ref={hourRef}
                                        onScroll={handleHourScroll}
                                        className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory flex flex-col items-center relative z-10"
                                        style={{ paddingTop: "44px", paddingBottom: "44px" }}
                                    >
                                        {HOURS.map((hour) => (
                                            <div
                                                key={`h-${hour}`}
                                                className={`h-[44px] shrink-0 snap-center flex items-center justify-center font-mono text-xl transition-all duration-200 cursor-pointer w-full select-none ${selectedHour === hour ? "text-primary font-black scale-110" : "text-muted/40 hover:text-foreground"}`}
                                                onClick={() => {
                                                    const idx = HOURS.indexOf(hour);
                                                    targetHourIndex.current = idx;
                                                    setSelectedHour(hour);
                                                    hourRef.current?.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
                                                }}
                                            >
                                                {hour}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => stepHour(1)}
                                    className="w-16 h-8 mt-2.5 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary/20 hover:text-primary border border-[var(--border-color)] text-muted transition-all active:scale-90 cursor-pointer shadow-sm"
                                    aria-label="ساعت بعدی"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>

                            {/* جداکننده دو نقطه */}
                            <div className="flex flex-col items-center justify-center shrink-0 pt-6">
                                <span className="text-2xl font-mono font-bold text-primary/70 animate-pulse">:</span>
                            </div>

                            {/* ستون دقیقه */}
                            <div className="flex-1 flex flex-col items-center">
                                <span className="text-xs font-bold text-muted mb-2.5">دقیقه</span>

                                <button
                                    type="button"
                                    onClick={() => stepMinute(-1)}
                                    className="w-16 h-8 mb-2.5 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary/20 hover:text-primary border border-[var(--border-color)] text-muted transition-all active:scale-90 cursor-pointer shadow-sm"
                                    aria-label="دقیقه قبلی"
                                >
                                    <ChevronUp size={18} />
                                </button>

                                <div
                                    className="relative w-full h-[132px] rounded-2xl overflow-hidden bg-black/[0.03] dark:bg-white/[0.04] border border-[var(--border-color)]/70"
                                    style={{
                                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
                                        maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)"
                                    }}
                                >
                                    <div className="absolute inset-x-1.5 top-[44px] h-[44px] bg-primary/15 dark:bg-primary/25 rounded-xl border border-primary/30 pointer-events-none z-0"></div>

                                    <div
                                        ref={minuteRef}
                                        onScroll={handleMinuteScroll}
                                        className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory flex flex-col items-center relative z-10"
                                        style={{ paddingTop: "44px", paddingBottom: "44px" }}
                                    >
                                        {MINUTES.map((minute) => (
                                            <div
                                                key={`m-${minute}`}
                                                className={`h-[44px] shrink-0 snap-center flex items-center justify-center font-mono text-xl transition-all duration-200 cursor-pointer w-full select-none ${selectedMinute === minute ? "text-primary font-black scale-110" : "text-muted/40 hover:text-foreground"}`}
                                                onClick={() => {
                                                    const idx = MINUTES.indexOf(minute);
                                                    targetMinuteIndex.current = idx;
                                                    setSelectedMinute(minute);
                                                    minuteRef.current?.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
                                                }}
                                            >
                                                {minute}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => stepMinute(1)}
                                    className="w-16 h-8 mt-2.5 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-primary/20 hover:text-primary border border-[var(--border-color)] text-muted transition-all active:scale-90 cursor-pointer shadow-sm"
                                    aria-label="دقیقه بعدی"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="glass-btn flex-1 py-3 text-sm text-danger border-danger/20 bg-danger/5 hover:bg-danger hover:text-white font-bold transition-all"
                            >
                                <X size={17} className="inline mr-1.5" />
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="glass-btn flex-1 py-3 text-sm bg-primary text-white border-transparent hover:bg-primary/90 font-bold shadow-md shadow-primary/20 transition-all"
                            >
                                <Check size={17} className="inline mr-1.5" />
                                تأیید
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}