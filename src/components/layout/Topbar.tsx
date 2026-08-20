"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { Plus, Trash2, Download, Copy } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "../ui/ThemeToggle";
import ExportModal from "../ui/ExportModal";
import Logo from "../ui/Logo";
import ConfirmModal from "../ui/ConfirmModal";

export default function Topbar() {
    const { courses, selectedCourseId, deleteCourse, setSelectedCourseId } = useCourseStore();
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const totalUnits = courses.reduce((sum, course) => sum + (course.units || 0), 0);
    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    const handleDeleteClick = () => {
        if (!selectedCourseId) {
            toast.error("ابتدا یک درس را از جدول انتخاب کنید.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executeDelete = () => {
        if (selectedCourseId) {
            deleteCourse(selectedCourseId);
            toast.success("درس با موفقیت حذف شد.");
        }
        setIsConfirmOpen(false);
    };

    const handleCopyCodes = () => {
        if (courses.length === 0) return toast.error("درسی برای کپی وجود ندارد.");
        const codes = courses.map((c) => `${c.code} - ${c.name}`).join("\n");
        navigator.clipboard.writeText(codes);
        toast.success("کد دروس در کلیپ‌بورد کپی شد.");
    };

    return (
        <>
            <header className="glass-panel flex items-center justify-between p-2 md:p-4 mb-4 md:mb-6 sticky top-2 md:top-4 z-[70]">

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <Logo className="w-9 h-9 md:w-11 md:h-11 shrink-0" />

                    <div className="flex flex-col justify-center">
                        <h1 className="text-base md:text-xl font-bold text-foreground leading-tight whitespace-nowrap mb-1 md:mb-1.5">
                            ابزار انتخاب واحد                        </h1>

                        <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                                <span className="text-[9px] md:text-[11px] text-muted font-bold">دروس:</span>
                                <span className="text-[10px] md:text-xs font-mono font-bold text-foreground">{courses.length}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                <span className="text-[9px] md:text-[11px] text-primary font-bold">واحد:</span>
                                <span className="text-[10px] md:text-xs font-mono font-bold text-primary">{totalUnits}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-3 shrink-0 py-3 px-2 -my-3 -mx-2">
                    <button
                        onClick={() => setSelectedCourseId(null)}
                        className="glass-btn px-2 py-1.5 md:px-4 md:py-2 flex gap-1 md:gap-2 text-primary border-primary/20 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline text-xs md:text-sm font-bold mt-0.5">افزودن درس</span>
                    </button>

                    <button
                        onClick={handleDeleteClick}
                        className="glass-btn px-2 py-1.5 md:px-4 md:py-2 flex gap-1 md:gap-2 text-danger border-danger/20 hover:bg-danger hover:text-white dark:hover:bg-danger transition-colors"
                    >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline text-xs md:text-sm font-bold mt-0.5">حذف</span>
                    </button>

                    <div className="hidden sm:block w-px h-6 md:h-8 bg-border mx-0.5 md:mx-1"></div>

                    <button onClick={handleCopyCodes} className="glass-btn p-1.5 md:p-2 hover:bg-black/10 dark:hover:bg-white/10" aria-label="Copy Codes">
                        <Copy className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <button onClick={() => setIsExportMenuOpen(true)} className="glass-btn p-1.5 md:p-2 hover:bg-black/10 dark:hover:bg-white/10" aria-label="Download Menu">
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <div className="w-px h-6 md:h-8 bg-border mx-0.5 md:mx-1"></div>
                    <ThemeToggle />
                </div>
            </header>

            <ExportModal isOpen={isExportMenuOpen} onClose={() => setIsExportMenuOpen(false)} />

            {/* فراخوانی کامپوننت تاییدیه */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeDelete}
                courseName={selectedCourse?.name || "انتخاب شده"}
            />
        </>
    );
}