"use client";

import { useState, useRef, useEffect, UIEvent } from "react";
import { createPortal } from "react-dom"; 
import { Clock, Check, X } from "lucide-react";

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

    useEffect(() => {
        setMounted(true);
    }, []);

    // قفل کردن اسکرول صفحه وقتی پنل باز است
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (value && value.includes(":")) {
                const [h, m] = value.split(":");
                setSelectedHour(h.padStart(2, "0"));
                const snappedMinute = MINUTES.includes(m) ? m : "00";
                setSelectedMinute(snappedMinute);
            }
        }
    }, [value, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const hIndex = HOURS.indexOf(selectedHour);
                const mIndex = MINUTES.indexOf(selectedMinute);
                if (hourRef.current && hIndex !== -1) {
                    hourRef.current.scrollTop = hIndex * ITEM_HEIGHT;
                }
                if (minuteRef.current && mIndex !== -1) {
                    minuteRef.current.scrollTop = mIndex * ITEM_HEIGHT;
                }
            }, 10);
        }
    }, [isOpen]);

    // هندل کردن اسکرولِ موس در دسکتاپ
    useEffect(() => {
        const hRef = hourRef.current;
        const mRef = minuteRef.current;

        const handleWheel = (e: WheelEvent, ref: HTMLDivElement | null, maxItems: number) => {
            if (!ref) return;
            e.preventDefault();
            const currentIndex = Math.round(ref.scrollTop / ITEM_HEIGHT);
            let nextIndex = currentIndex + Math.sign(e.deltaY);
            nextIndex = Math.max(0, Math.min(nextIndex, maxItems - 1));
            ref.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: 'smooth' });
        };

        const onHourWheel = (e: WheelEvent) => handleWheel(e, hRef, HOURS.length);
        const onMinuteWheel = (e: WheelEvent) => handleWheel(e, mRef, MINUTES.length);

        hRef?.addEventListener("wheel", onHourWheel, { passive: false });
        mRef?.addEventListener("wheel", onMinuteWheel, { passive: false });

        return () => {
            hRef?.removeEventListener("wheel", onHourWheel);
            mRef?.removeEventListener("wheel", onMinuteWheel);
        };
    }, [isOpen]);

    // هندل کردن اسکرول در موبایل
    const handleHourScroll = (e: UIEvent<HTMLDivElement>) => {
        const index = Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT);
        if (HOURS[index] && HOURS[index] !== selectedHour) {
            setSelectedHour(HOURS[index]);
        }
    };

    const handleMinuteScroll = (e: UIEvent<HTMLDivElement>) => {
        const index = Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT);
        if (MINUTES[index] && MINUTES[index] !== selectedMinute) {
            setSelectedMinute(MINUTES[index]);
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

                    <div className="relative w-full md:w-[340px] mt-auto md:mt-0 bg-[var(--card)]/95 backdrop-blur-3xl border-t md:border border-[var(--border-color)] rounded-t-[32px] md:rounded-3xl p-6 pb-10 md:pb-6 shadow-2xl animate-slide-up flex flex-col items-center">

                        <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-6 shrink-0 md:hidden"></div>

                        <h4 className="text-lg font-bold text-primary mb-6">انتخاب ساعت</h4>

                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-3xl p-3 border border-[var(--border-color)]">

                            <div className="flex w-full justify-around mb-2 px-6 z-20" dir="ltr">
                                <span className="text-[12px] font-bold text-muted w-full text-center">ساعت</span>
                                <span className="text-[12px] font-bold text-muted w-full text-center">دقیقه</span>
                            </div>

                            <div className="relative w-full flex items-center justify-center gap-2 h-[180px] overflow-hidden" dir="ltr">

                                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] bg-primary/20 rounded-xl border border-primary/40 pointer-events-none z-0"></div>

                                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[var(--card)] to-transparent pointer-events-none z-20"></div>
                                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[var(--card)] to-transparent pointer-events-none z-20"></div>

                                <div className="flex flex-col items-center flex-1 h-full z-10">
                                    <div
                                        ref={hourRef}
                                        onScroll={handleHourScroll}
                                        className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth flex flex-col items-center"
                                        style={{ paddingTop: '68px', paddingBottom: '68px' }}
                                    >
                                        {HOURS.map((hour) => (
                                            <div
                                                key={`h-${hour}`}
                                                className={`h-[44px] shrink-0 snap-center flex items-center justify-center font-mono text-xl transition-all duration-200 cursor-pointer w-full select-none ${selectedHour === hour ? "text-primary font-bold scale-110" : "text-muted/60 hover:text-foreground"
                                                    }`}
                                                onClick={() => {
                                                    hourRef.current?.scrollTo({ top: HOURS.indexOf(hour) * ITEM_HEIGHT, behavior: 'smooth' });
                                                }}
                                            >
                                                {hour}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center h-full z-10 pb-1">
                                    <span className="text-2xl font-mono font-bold text-primary/70 animate-pulse">:</span>
                                </div>

                                <div className="flex flex-col items-center flex-1 h-full z-10">
                                    <div
                                        ref={minuteRef}
                                        onScroll={handleMinuteScroll}
                                        className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth flex flex-col items-center"
                                        style={{ paddingTop: '68px', paddingBottom: '68px' }}
                                    >
                                        {MINUTES.map((minute) => (
                                            <div
                                                key={`m-${minute}`}
                                                className={`h-[44px] shrink-0 snap-center flex items-center justify-center font-mono text-xl transition-all duration-200 cursor-pointer w-full select-none ${selectedMinute === minute ? "text-primary font-bold scale-110" : "text-muted/60 hover:text-foreground"
                                                    }`}
                                                onClick={() => {
                                                    minuteRef.current?.scrollTo({ top: MINUTES.indexOf(minute) * ITEM_HEIGHT, behavior: 'smooth' });
                                                }}
                                            >
                                                {minute}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="glass-btn flex-1 py-3.5 text-sm text-danger border-danger/20 bg-danger/5 hover:bg-danger hover:text-white font-bold transition-all"
                            >
                                <X size={18} className="inline mr-2" />
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="glass-btn flex-1 py-3.5 text-sm bg-primary text-white border-transparent hover:bg-primary/90 font-bold shadow-md shadow-primary/20 transition-all"
                            >
                                <Check size={18} className="inline mr-2" />
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