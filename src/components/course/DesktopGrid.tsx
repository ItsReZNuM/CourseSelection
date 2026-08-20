"use client";

import { useCourseStore } from "@/store/useCourseStore";
import CourseCard from "./CourseCard";

export const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
export const START_HOUR = 8;
export const END_HOUR = 19;
export const PX_PER_MIN = 1.3;
export const TOP_OFFSET = 40;

export default function DesktopGrid() {
    const courses = useCourseStore((state) => state.courses);

    const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
    const totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

    return (
        <div id="schedule-grid" className="hidden md:flex glass-panel overflow-hidden w-full relative mt-4">
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
    );
}