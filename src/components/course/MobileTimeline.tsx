"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { Course } from "@/types";
import { DAYS } from "./DesktopGrid";
import { colorFor, parseTimeToMinutes } from "@/utils/helpers";
import BottomSheet from "../ui/BottomSheet";

export default function MobileTimeline() {
    const courses = useCourseStore((state) => state.courses);
    const [activeDay, setActiveDay] = useState<string>(DAYS[0]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    // Extract all sessions for the currently selected day
    const daySessions = courses.flatMap((course) => {
        const sessionsForDay = course.sessions.filter((s) => s.day === activeDay);
        return sessionsForDay.map((session) => ({ course, session }));
    });

    // Sort sessions by start time
    daySessions.sort((a, b) => parseTimeToMinutes(a.session.start) - parseTimeToMinutes(b.session.start));

    return (
        <div className="md:hidden flex flex-col mt-4 pb-10">
            {/* Horizontal Scrollable Tabs for Days */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 px-1 py-1">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeDay === day
                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                : "glass-btn text-muted hover:text-foreground"
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Timeline List */}
            <div className="flex flex-col gap-4">
                {daySessions.length === 0 ? (
                    <div className="glass-panel p-8 text-center text-muted flex flex-col items-center justify-center border-dashed border-2">
                        <span className="text-4xl mb-3">😴</span>
                        <p className="font-bold">کلاسی در این روز نداری!</p>
                    </div>
                ) : (
                    daySessions.map(({ course, session }, index) => {
                        const baseColor = colorFor(course.name);
                        const glassBg = baseColor.replace('hsl', 'hsla').replace(')', ', 0.1)');
                        const borderColor = baseColor.replace('hsl', 'hsla').replace(')', ', 0.3)');

                        return (
                            <div
                                key={`${course.id}-${index}`}
                                onClick={() => setSelectedCourse(course)}
                                className="relative flex items-stretch gap-4 cursor-pointer group active:scale-[0.98] transition-transform"
                            >
                                {/* Time Column */}
                                <div className="flex flex-col items-center shrink-0 w-14">
                                    <span className="font-mono text-xs font-bold text-foreground bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg">
                                        {session.start}
                                    </span>
                                    {/* Timeline line */}
                                    <div className="w-px h-full bg-border my-1"></div>
                                    <span className="font-mono text-[10px] text-muted">
                                        {session.end}
                                    </span>
                                </div>

                                {/* Course Card (Glassmorphism) */}
                                <div
                                    className="flex-1 rounded-2xl p-4 shadow-sm border backdrop-blur-md"
                                    style={{
                                        backgroundColor: glassBg,
                                        border: `1px solid ${borderColor}`,
                                        borderRight: `4px solid ${baseColor}`,
                                    }}
                                >
                                    <h3 className="font-bold text-sm mb-1 text-foreground leading-snug">
                                        {course.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-muted">استاد: {course.professor || "-"}</span>
                                        <span className="font-mono text-[10px] bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-muted">
                                            {course.code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Mobile Bottom Sheet (Modal) */}
            <BottomSheet
                course={selectedCourse}
                onClose={() => setSelectedCourse(null)}
            />
        </div>
    );
}