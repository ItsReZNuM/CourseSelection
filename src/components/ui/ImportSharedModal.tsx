"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from "lz-string";
import { useCourseStore } from "@/store/useCourseStore";
import { Course } from "@/types";
import { AlertTriangle, Download, X, BookOpen, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

function ModalContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { courses, importCourses } = useCourseStore();

    const [sharedData, setSharedData] = useState<Course[] | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const data = searchParams.get("schedule");

        if (data) {
            try {
                const json = decompressFromEncodedURIComponent(data);
                if (json) {
                    const parsed = JSON.parse(json);
                    if (Array.isArray(parsed)) {
                        setSharedData(parsed);
                        setIsOpen(true);
                    }
                }
            } catch (e) {
                toast.error("لینک اشتراک‌گذاری نامعتبر یا منقضی شده است.");
                closeAndCleanURL();
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    const handleConfirm = () => {
        if (sharedData) {
            importCourses(sharedData);
            toast.success("برنامه با موفقیت جایگزین شد!");
        }
        closeAndCleanURL();
    };

    const handleBackupLink = () => {
        if (courses.length === 0) {
            return toast("برنامه فعلی شما خالی است، نیازی به بکاپ نیست!", { icon: 'ℹ️' });
        }
        const compressedData = compressToEncodedURIComponent(JSON.stringify(courses));
        const shareUrl = `${window.location.origin}/?schedule=${compressedData}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("لینک برنامه فعلی شما کپی شد!");
    };

    const closeAndCleanURL = () => {
        setIsOpen(false);
        router.replace("/");
    };

    if (!isOpen || !mounted || !sharedData) return null;

    const totalUnits = sharedData.reduce((sum, c) => sum + (c.units || 0), 0);

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"></div>

            <div className="glass-panel p-6 w-full max-w-sm relative z-10 animate-slide-up bg-[var(--card)]/95 flex flex-col items-center">

                <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-3 border border-danger/20 shrink-0">
                    <AlertTriangle size={28} className="text-danger animate-pulse" />
                </div>

                <h3 className="text-lg font-bold text-danger mb-1 text-center">هشدار جایگزینی!</h3>
                <p className="text-xs text-muted text-center leading-relaxed mb-5">
                    در صورت تایید، <strong className="text-foreground">برنامه فعلی شما کاملاً پاک خواهد شد</strong> و این برنامه جایگزین آن می‌شود.
                </p>

                <div className="w-full bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--border-color)] overflow-hidden flex flex-col max-h-48 mb-6">
                    <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 border-b border-[var(--border-color)] shrink-0">
                        <div className="flex items-center gap-1.5">
                            <BookOpen size={16} className="text-primary" />
                            <span className="text-xs font-bold text-foreground">{sharedData.length} درس</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {totalUnits} واحد
                        </div>
                    </div>

                    <div className="p-3 overflow-y-auto no-scrollbar flex flex-col gap-2">
                        {sharedData.map((course, i) => (
                            <div key={i} className="text-xs text-foreground font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0"></span>
                                <span className="truncate">{course.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col w-full gap-3 shrink-0">
                    <div className="flex items-center justify-between w-full gap-3">
                        <button onClick={closeAndCleanURL} className="glass-btn flex-1 py-3.5 text-sm text-muted hover:text-foreground font-bold transition-all">
                            <X size={16} className="inline mr-1.5" />
                            لغو
                        </button>
                        <button onClick={handleConfirm} className="glass-btn flex-1 py-3.5 text-sm bg-danger text-white border-transparent hover:bg-danger/90 font-bold shadow-md shadow-danger/20 transition-all">
                            <Download size={16} className="inline mr-1.5" />
                            تایید و دریافت
                        </button>
                    </div>

                    <button onClick={handleBackupLink} className="glass-btn w-full py-3 text-sm text-primary border-primary/20 hover:bg-primary hover:text-white font-bold transition-all">
                        <LinkIcon size={14} className="inline mr-2" />
                        لینک برنامه قبلی منو کپی کن !
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function ImportSharedModal() {
    return (
        <Suspense fallback={null}>
            <ModalContent />
        </Suspense>
    );
}