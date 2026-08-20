"use client";

import { useState } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { X, Image as ImageIcon, FileText, FileJson, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: Props) {
    const { courses, importCourses } = useCourseStore();
    const [isCapturing, setIsCapturing] = useState(false);

    if (!isOpen && !isCapturing) return null;

    const handleExportJSON = () => {
        if (courses.length === 0) return toast.error("برنامه‌ای برای خروجی وجود ندارد.");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(courses));
        const link = document.createElement("a");
        link.href = dataStr;
        link.download = "my-course-schedule.json";
        link.click();
        toast.success("فایل JSON دانلود شد.");
        onClose();
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (Array.isArray(data)) {
                    importCourses(data);
                    toast.success("برنامه با موفقیت وارد شد!");
                    onClose();
                } else {
                    throw new Error("Invalid format");
                }
            } catch (err) {
                toast.error("فایل انتخاب شده نامعتبر است.");
            }
        };
        reader.readAsText(file);
    };

    const captureGrid = async (asJpeg = false) => {
        setIsCapturing(true);
        onClose(); 

        await new Promise(r => setTimeout(r, 100));

        const element = document.getElementById("schedule-grid");
        if (!element) throw new Error("جدول پیدا نشد.");

        const originalCssText = element.style.cssText;
        const isDark = document.documentElement.classList.contains('dark');

        element.style.setProperty('display', 'flex', 'important');
        element.style.setProperty('width', '1000px', 'important'); 
        element.style.setProperty('padding', '24px', 'important');
        element.style.setProperty('background-color', isDark ? '#050507' : '#f5f7fa', 'important');
        element.style.setProperty('border-radius', '16px', 'important');

        await new Promise(r => setTimeout(r, 150));

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        const options = {
            quality: 0.9,
            pixelRatio: 1.5,
            style: { margin: '0' },
            cacheBust: true,
        };

        const dataUrl = asJpeg ? await toJpeg(element, options) : await toPng(element, options);

        element.style.cssText = originalCssText;
        setIsCapturing(false);

        return { dataUrl, width, height };
    };

    const handleExportPNG = async () => {
        if (courses.length === 0) return toast.error("جدول خالی است!");
        try {
            const { dataUrl } = await captureGrid(false); 
            const link = document.createElement("a");
            link.download = "my-schedule.png";
            link.href = dataUrl;
            link.click();
            toast.success("عکس با موفقیت ذخیره شد.");
        } catch (error) {
            console.error("PNG rendering error:", error);
            setIsCapturing(false);
            toast.error("خطا در تولید عکس.");
        }
    };

    const handleExportPDF = async () => {
        if (courses.length === 0) return toast.error("جدول خالی است!");
        try {
            const { dataUrl, width, height } = await captureGrid(true);

            if (isNaN(width) || isNaN(height) || width === 0) throw new Error("Invalid dimensions");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (height * pdfWidth) / width;

            pdf.addImage(dataUrl, "JPEG", 0, 10, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save("my-schedule.pdf");
            toast.success("فایل PDF با موفقیت ذخیره شد.");
        } catch (error) {
            console.error("PDF rendering error:", error);
            setIsCapturing(false);
            toast.error("خطا در تولید PDF.");
        }
    };

    return (
        <>

            {isCapturing && (
                <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl transition-all">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-primary animate-pulse">در حال آماده‌سازی خروجی...</h2>
                    <p className="text-sm text-muted mt-2">لطفاً چند لحظه صبر کنید</p>
                </div>
            )}

            {/* مودال انتخاب فرمت خروجی */}
            {isOpen && !isCapturing && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

                    <div className="glass-panel p-6 w-full max-w-sm relative z-10 animate-slide-up bg-card/95">
                        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/5 dark:bg-white/10 rounded-full text-muted hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-primary mb-6 border-b border-border pb-2 pr-1">خروجی و اشتراک‌گذاری</h3>

                        <div className="flex flex-col gap-4">
                            <button onClick={handleExportPNG} className="glass-btn !justify-start !px-5 py-3 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                <ImageIcon size={18} className="text-primary shrink-0" />
                                <span className="text-sm font-bold">دانلود به صورت عکس (PNG)</span>
                            </button>

                            <button onClick={handleExportPDF} className="glass-btn !justify-start !px-5 py-3 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                <FileText size={18} className="text-danger shrink-0" />
                                <span className="text-sm font-bold">دانلود به صورت فایل PDF</span>
                            </button>

                            <div className="h-px w-full bg-border my-1"></div>

                            <button onClick={handleExportJSON} className="glass-btn !justify-start !px-5 py-3 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                <FileJson size={18} className="text-ok shrink-0" />
                                <span className="text-sm font-bold">خروجی فایل JSON (بکاپ)</span>
                            </button>

                            <label className="glass-btn !justify-start !px-5 py-3 gap-4 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                <Upload size={18} className="text-muted shrink-0" />
                                <span className="text-sm font-bold">وارد کردن برنامه (Import)</span>
                                <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}