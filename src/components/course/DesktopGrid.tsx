// src/components/course/DesktopGrid.tsx
"use client";

import { useEffect, useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import CourseCard from "./CourseCard";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
export const START_HOUR = 8;
export const END_HOUR = 19;
export const PX_PER_MIN = 1.3;
export const TOP_OFFSET = 40;

export default function DesktopGrid() {
    const courses = useCourseStore((state) => state.courses);
    const [siteHost, setSiteHost] = useState("");
    const [todayPersianStr, setTodayPersianStr] = useState("");

    useEffect(() => {
        try {
            setSiteHost(window.location.host);
            const now = new DateObject({ calendar: persian, locale: persian_fa });
            setTodayPersianStr(now.format("DD MMMM YYYY"));
        } catch { }
    }, []);

    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
    const totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

    return (
        <div id="schedule-grid" className="hidden md:flex flex-col glass-panel overflow-hidden w-full relative mt-4">

            {/* هدر داینامیک خروجی تصویر هماهنگ با ساختار هدر PDF */}
            <div className="export-header hidden items-start justify-between px-6 pt-5 pb-4 border-b border-border/50 mb-3 w-full" dir="rtl">
                <div className="flex flex-col text-right">
                    <h2 className="text-base md:text-lg font-black text-primary mb-0.5 tracking-wide">
                        جدول دروس و برنامه هفتگی
                    </h2>
                    <p className="text-xs text-muted font-medium">
                        ساخته شده با ابزار انتخاب واحد
                    </p>
                </div>

                <div className="flex flex-col items-end text-left" dir="ltr">
                    <span className="font-mono text-xs font-bold text-primary">
                        {siteHost}
                    </span>
                    <div className="mt-1 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold shadow-sm" dir="rtl">
                        {todayPersianStr}
                    </div>
                </div>
            </div>

            {/* بدنه جدول هفتگی دسکتاپ */}
            <div className="flex w-full relative">
                <div className="w-16 border-l border-border bg-black/5 dark:bg-white/5 shrink-0 z-10">
                    <div className="h-12 border-b border-border"></div>
                    <div className="relative" style={{ height: `${totalHeight + TOP_OFFSET + 40}px` }}>
                        {hours.map((h) => (
                            <div
                                key={h}
                                className="absolute right-0 w-full text-center text-[11px] font-mono text-muted -translate-y-1/2"
                                style={{ top: `${TOP_OFFSET + (h - START_HOUR) * 60 * PX_PER_MIN}px` }}
                            >
                                {h.toString().padStart(2, "0")}:00
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col relative">
                    <div className="flex h-12 border-b border-border bg-black/5 dark:bg-white/5 z-10">
                        {DAYS.map((day) => (
                            <div key={day} className="flex-1 flex items-center justify-center text-sm font-bold text-muted border-l border-border last:border-l-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="relative w-full overflow-hidden" style={{ height: `${totalHeight + TOP_OFFSET + 40}px` }}>
                        {hours.map((h) => (
                            <div key={`h-${h}`} className="absolute w-full border-t border-dashed border-border opacity-40" style={{ top: `${TOP_OFFSET + (h - START_HOUR) * 60 * PX_PER_MIN}px` }}></div>
                        ))}

                        <div className="absolute inset-0 flex pointer-events-none">
                            {DAYS.map((_, i) => (
                                <div key={`v-${i}`} className="flex-1 border-l border-border opacity-40 last:border-l-0"></div>
                            ))}
                        </div>

                        {courses.map((course) =>
                            course.sessions.map((session, index) => {
                                const dayIndex = DAYS.indexOf(session.day);
                                if (dayIndex === -1) return null;

                                return (
                                    <CourseCard
                                        key={`${course.id}-${index}`}
                                        course={course}
                                        session={session}
                                        dayIndex={dayIndex}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}