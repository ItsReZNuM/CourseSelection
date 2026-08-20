"use client";

import { useEffect, useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { Course } from "@/types";
import { X, Clock, CalendarDays, User, BookOpen, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface Props {
    course: Course | null;
    onClose: () => void;
}

export default function BottomSheet({ course, onClose }: Props) {
    const { setSelectedCourseId, deleteCourse } = useCourseStore();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (course) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setIsConfirmOpen(false);
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [course]);

    if (!course) return null;

    const handleEdit = () => {
        setSelectedCourseId(course.id);
        onClose();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = () => {
        setIsConfirmOpen(true);
    };

    const executeDelete = () => {
        deleteCourse(course.id);
        toast.success("درس با موفقیت حذف شد.");
        setIsConfirmOpen(false);
        onClose();
    };

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
        <>
            <div className="fixed inset-0 z-[99999] flex flex-col justify-end md:hidden">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

                <div className="relative bg-card/95 backdrop-blur-3xl border-t border-[var(--border-color)] rounded-t-[32px] p-6 pb-8 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
                    <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-6 shrink-0"></div>

                    <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-black/5 dark:bg-white/10 rounded-full text-muted hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>

                    <div className="pr-2 mb-6 shrink-0">
                        <h2 className="text-xl font-bold text-primary mb-1">{course.name}</h2>
                        <p className="font-mono text-sm text-muted">{course.code}</p>
                    </div>

                    <div className="flex flex-col gap-3 overflow-y-auto mb-6 no-scrollbar shrink">
                        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                            <div className="flex items-center gap-2 text-muted">
                                <User size={18} />
                                <span className="text-sm">استاد</span>
                            </div>
                            <span className="font-bold text-sm">{course.professor || "نامشخص"}</span>
                        </div>

                        <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                            <div className="flex items-center gap-2 text-muted">
                                <BookOpen size={18} />
                                <span className="text-sm">تعداد واحد</span>
                            </div>
                            <span className="font-mono bg-black/5 dark:bg-white/10 px-3 py-1 rounded-lg font-bold">
                                {course.units}
                            </span>
                        </div>

                        {course.exam_date ? (
                            <>
                                <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 text-muted">
                                        <CalendarDays size={18} />
                                        <span className="text-sm">روز امتحان</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                                        {getExamDay(course.exam_date)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                    <div className="flex items-center gap-2 text-muted">
                                        <CalendarDays size={18} />
                                        <span className="text-sm">تاریخ امتحان</span>
                                    </div>
                                    <span className="font-mono text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-bold" dir="ltr">
                                        {course.exam_date}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-muted">
                                    <CalendarDays size={18} />
                                    <span className="text-sm">امتحان</span>
                                </div>
                                <span className="text-xs text-muted/80 bg-black/5 dark:bg-white/5 px-2 py-1 rounded">ندارد</span>
                            </div>
                        )}

                        {course.exam_time && (
                            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-muted">
                                    <Clock size={18} />
                                    <span className="text-sm">ساعت امتحان</span>
                                </div>
                                <span className="font-mono text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-bold">
                                    {course.exam_time}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)] shrink-0">
                        <button onClick={handleEdit} className="glass-btn flex-1 py-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center gap-2">
                            <Edit2 size={18} />
                            <span className="font-bold">ویرایش</span>
                        </button>

                        <button onClick={handleDeleteClick} className="glass-btn flex-1 py-3 bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white flex items-center justify-center gap-2">
                            <Trash2 size={18} />
                            <span className="font-bold">حذف</span>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeDelete}
                courseName={course.name}
            />
        </>
    );
}