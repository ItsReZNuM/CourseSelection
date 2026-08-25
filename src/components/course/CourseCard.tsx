// src/components/course/CourseCard.tsx
"use client";

import { Course, Session } from "@/types";
import { parseTimeToMinutes, colorFor } from "@/utils/helpers";
import { START_HOUR, PX_PER_MIN, TOP_OFFSET, DAYS } from "./DesktopGrid";
import { useCourseStore } from "@/store/useCourseStore";
import { User, BookOpen, CalendarDays, Clock } from "lucide-react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface Props {
    course: Course;
    session: Session;
    dayIndex: number;
}

export default function CourseCard({ course, session, dayIndex }: Props) {
    const { selectedCourseId, setSelectedCourseId } = useCourseStore();
    const isSelected = selectedCourseId === course.id;

    const startMin = parseTimeToMinutes(session.start);
    const endMin = parseTimeToMinutes(session.end);

    const durationMin = endMin - startMin;

    const top = TOP_OFFSET + (startMin - START_HOUR * 60) * PX_PER_MIN + 3;
    const height = Math.max(durationMin * PX_PER_MIN - 6, 15);

    const widthPct = 100 / DAYS.length;
    const baseColor = colorFor(course.name);
    const glassBg = baseColor.replace('hsl', 'hsla').replace(')', ', 0.15)');
    const borderColor = baseColor.replace('hsl', 'hsla').replace(')', ', 0.3)');

    const midMin = (startMin + endMin) / 2;
    const isLate = midMin >= 13.5 * 60;
    const isLeftEdge = dayIndex >= 3;

    const yPosition = isLate ? "bottom-full mb-2" : "top-full mt-2";
    const xPosition = isLeftEdge ? "left-0" : "right-0";
    const transformOrigin = `origin-${isLate ? "bottom" : "top"}-${isLeftEdge ? "left" : "right"}`;

    const getExamDay = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const date = new DateObject({ date: dateStr, format: "YYYY/MM/DD", calendar: persian, locale: persian_fa });
            return date.format("dddd");
        } catch (e) {
            return "";
        }
    };

    return (
        <div
            onClick={() => setSelectedCourseId(course.id)}
            // FIXED: Replaced transition-all with specific transitions to make z-index update INSTANTLY!
            className={`absolute p-1.5 md:p-2 rounded-xl shadow-sm overflow-visible group cursor-pointer transition-transform transition-colors transition-shadow duration-300 hover:scale-[1.02] hover:shadow-lg hover:z-[70] backdrop-blur-md ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--bg)] z-[55]" : "z-10"
                }`}
            style={{
                top: `${top}px`,
                height: `${height}px`,
                right: `calc(${dayIndex * widthPct}% + 4px)`,
                width: `calc(${widthPct}% - 8px)`,
                backgroundColor: glassBg,
                border: `1px solid ${borderColor}`,
                borderRight: `4px solid ${baseColor}`,
            }}
        >
            <div className="h-full w-full flex flex-col items-center justify-center text-center overflow-hidden text-foreground">
                <span className="font-bold text-[10px] md:text-[13px] leading-snug line-clamp-2 px-1 shrink-0">
                    {course.name}
                </span>
                <span className="font-mono text-[9px] md:text-[11px] opacity-80 mt-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md shrink-0">
                    {session.start} - {session.end}
                </span>

                {course.exam_date && durationMin >= 85 && (
                    <div className="flex flex-col items-center mt-1.5 w-full px-1 shrink-0">
                        <div className="flex items-center justify-center gap-1 text-[8px] md:text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded w-full overflow-hidden">
                            <span className="shrink-0">{getExamDay(course.exam_date)}</span>
                            <span dir="ltr" className="truncate font-mono">{course.exam_date}</span>
                        </div>
                        {course.exam_time && (
                            <span className="text-[8px] md:text-[9px] font-mono font-bold text-primary mt-0.5 shrink-0" dir="ltr">
                                {course.exam_time}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop Hover Tooltip */}
            <div className={`hidden md:flex absolute flex-col opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out z-[9999] w-72 pointer-events-none bg-card/95 backdrop-blur-3xl border border-border shadow-2xl rounded-2xl p-4 gap-2.5 ${yPosition} ${xPosition} ${transformOrigin}`}>
                <div>
                    <h3 className="font-bold text-primary text-base mb-0.5">{course.name}</h3>
                    <p className="font-mono text-xs text-muted">{course.code}</p>
                </div>

                <div className="h-px w-full bg-border my-1"></div>

                <div className="flex flex-col gap-2 text-sm text-foreground">
                    <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                            <User size={14} />
                            <span>استاد</span>
                        </div>
                        <span className="font-bold text-xs">{course.professor || "نامشخص"}</span>
                    </div>

                    <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                        <div className="flex items-center gap-1.5 text-muted text-xs">
                            <BookOpen size={14} />
                            <span>تعداد واحد</span>
                        </div>
                        <span className="font-mono text-xs font-bold">{course.units}</span>
                    </div>

                    {course.exam_date ? (
                        <>
                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                <div className="flex items-center gap-1.5 text-muted text-xs">
                                    <CalendarDays size={14} />
                                    <span>روز امتحان</span>
                                </div>
                                <span className="text-xs font-bold text-primary">{getExamDay(course.exam_date)}</span>
                            </div>

                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                <div className="flex items-center gap-1.5 text-muted text-xs">
                                    <CalendarDays size={14} />
                                    <span>تاریخ امتحان</span>
                                </div>
                                <span className="font-mono text-xs text-primary font-bold" dir="ltr">{course.exam_date}</span>
                            </div>

                            {course.exam_time && (
                                <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                    <div className="flex items-center gap-1.5 text-muted text-xs">
                                        <Clock size={14} />
                                        <span>ساعت امتحان</span>
                                    </div>
                                    <span className="font-mono text-xs text-primary font-bold" dir="ltr">{course.exam_time}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                            <div className="flex items-center gap-1.5 text-muted text-xs">
                                <CalendarDays size={14} />
                                <span>امتحان</span>
                            </div>
                            <span className="text-xs text-muted/80">ندارد</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}