// src/components/ui/ExportModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import {
    X,
    Image as ImageIcon,
    FileText,
    FileJson,
    Upload,
    Loader2,
    Share2,
    ArrowRight,
    Copy,
    Check,
    Link as LinkIcon,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { compressToEncodedURIComponent } from "lz-string";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { toEnglishDigits } from "@/utils/helpers";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: Props) {
    const { courses, importCourses, theme } = useCourseStore();
    const [isCapturing, setIsCapturing] = useState(false);
    const [isPdfRendering, setIsPdfRendering] = useState(false);

    const [isShareView, setIsShareView] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [shortUrl, setShortUrl] = useState("");
    const [directUrl, setDirectUrl] = useState("");
    const [copiedTarget, setCopiedTarget] = useState<"short" | "direct" | null>(null);

    const [siteHost, setSiteHost] = useState("");
    const [todayPersianStr, setTodayPersianStr] = useState("");

    useEffect(() => {
        try {
            setSiteHost(window.location.host);
            const now = new DateObject({ calendar: persian, locale: persian_fa });
            setTodayPersianStr(now.format("DD MMMM YYYY"));
        } catch { }
    }, []);

    const handleCloseModal = () => {
        setIsShareView(false);
        setCopiedTarget(null);
        onClose();
    };

    if (!isOpen && !isCapturing) return null;

    const handleGenerateLinks = async () => {
        if (courses.length === 0) return toast.error("برنامه‌ای برای اشتراک‌گذاری وجود ندارد.");

        setIsGenerating(true);

        const compressed = compressToEncodedURIComponent(JSON.stringify(courses));
        const direct = `${window.location.origin}/?schedule=${compressed}`;
        setDirectUrl(direct);

        try {
            const res = await fetch("/api/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courses }),
            });

            const data = await res.json();

            if (res.ok && data.id) {
                setShortUrl(`${window.location.origin}/?s=${data.id}`);
            } else {
                setShortUrl("");
            }
        } catch {
            setShortUrl("");
            toast("ارتباط با سرور لینک کوتاه برقرار نشد؛ لینک اصلی آماده است.", { icon: "⚠️" });
        } finally {
            setIsGenerating(false);
            setIsShareView(true);
        }
    };

    const handleCopy = async (text: string, target: "short" | "direct") => {
        await navigator.clipboard.writeText(text);
        setCopiedTarget(target);
        toast.success(target === "short" ? "لینک کوتاه کپی شد!" : "لینک اصلی کپی شد!");
        setTimeout(() => setCopiedTarget(null), 2000);
    };

    const handleExportJSON = () => {
        if (courses.length === 0) return toast.error("برنامه‌ای برای خروجی وجود ندارد.");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(courses));
        const link = document.createElement("a");
        link.href = dataStr;
        link.download = "my-course-schedule.json";
        link.click();
        toast.success("فایل JSON دانلود شد.");
        handleCloseModal();
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
                    handleCloseModal();
                } else {
                    throw new Error("Invalid format");
                }
            } catch {
                toast.error("فایل انتخاب شده نامعتبر است.");
            }
        };
        reader.readAsText(file);
    };

    // خروجی تصویر PNG
    const handleExportPNG = async () => {
        if (courses.length === 0) return toast.error("جدول خالی است!");
        setIsCapturing(true);
        onClose();

        await new Promise((r) => setTimeout(r, 100));

        const element = document.getElementById("schedule-grid");
        if (!element) {
            setIsCapturing(false);
            return toast.error("جدول پیدا نشد.");
        }

        const originalCssText = element.style.cssText;
        const isDark = theme === "dark";
        const bgColor = isDark ? "#050507" : "#f5f7fa";

        element.classList.add("export-mode");
        element.style.setProperty("display", "flex", "important");
        element.style.setProperty("flex-direction", "column", "important");
        element.style.setProperty("width", "1050px", "important");
        element.style.setProperty("margin", "0", "important");
        element.style.setProperty("margin-top", "0", "important");
        element.style.setProperty("padding", "24px", "important");
        element.style.setProperty("background-color", bgColor, "important");
        element.style.setProperty("border-radius", "0px", "important");

        await new Promise((r) => setTimeout(r, 350));

        try {
            const dataUrl = await toPng(element, {
                quality: 0.98,
                pixelRatio: 1.5,
                backgroundColor: bgColor,
                style: {
                    margin: "0",
                    marginTop: "0",
                    transform: "none",
                },
                cacheBust: true,
            });

            const link = document.createElement("a");
            link.download = "my-schedule.png";
            link.href = dataUrl;
            link.click();
            toast.success("عکس با موفقیت ذخیره شد.");
        } catch {
            toast.error("خطا در تولید عکس.");
        } finally {
            element.classList.remove("export-mode");
            element.style.cssText = originalCssText;
            setIsCapturing(false);
        }
    };

    // خروجی PDF با رندر تم لایت و صفحه‌بندی منظم
    const handleExportPDF = async () => {
        if (courses.length === 0) return toast.error("جدول خالی است!");

        setIsCapturing(true);
        setIsPdfRendering(true);
        onClose();

        await new Promise((r) => setTimeout(r, 300));

        const element = document.getElementById("pdf-table-export-node");
        if (!element) {
            setIsCapturing(false);
            setIsPdfRendering(false);
            return toast.error("قالب جدول پیدا نشد.");
        }

        try {
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                cacheBust: true,
            });

            const img = new Image();
            img.src = dataUrl;
            await new Promise((r) => (img.onload = r));

            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            const printWidth = pageWidth - margin * 2;
            const printHeight = pageHeight - margin * 2;

            const totalPdfHeight = (img.height * printWidth) / img.width;

            if (totalPdfHeight <= printHeight) {
                pdf.addImage(dataUrl, "PNG", margin, margin, printWidth, totalPdfHeight, undefined, "FAST");
            } else {
                const pxPerPage = Math.floor(img.width * (printHeight / printWidth));
                let yOffset = 0;
                let pageIndex = 0;

                while (yOffset < img.height) {
                    if (pageIndex > 0) pdf.addPage();

                    const currentSliceHeight = Math.min(pxPerPage, img.height - yOffset);
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = currentSliceHeight;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, yOffset, img.width, currentSliceHeight, 0, 0, img.width, currentSliceHeight);

                        const sliceUrl = canvas.toDataURL("image/png");
                        const slicePdfHeight = (currentSliceHeight * printWidth) / img.width;
                        pdf.addImage(sliceUrl, "PNG", margin, margin, printWidth, slicePdfHeight, undefined, "FAST");
                    }

                    yOffset += currentSliceHeight;
                    pageIndex++;
                }
            }

            pdf.save("my-courses-table.pdf");
            toast.success("فایل PDF جدول با موفقیت ذخیره شد.");
        } catch {
            toast.error("خطا در تولید فایل PDF.");
        } finally {
            setIsPdfRendering(false);
            setIsCapturing(false);
        }
    };

    const totalUnits = courses.reduce((sum, c) => sum + (c.units || 0), 0);

    const getExamDay = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const date = new DateObject({ date: dateStr, format: "YYYY/MM/DD", calendar: persian, locale: persian_fa });
            return date.format("dddd");
        } catch {
            return "";
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

            {isOpen && !isCapturing && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={handleCloseModal}></div>

                    <div className="glass-panel p-6 w-full max-w-sm relative z-10 animate-slide-up bg-card/95">
                        <div className="flex items-center justify-between mb-5 border-b border-border pb-2.5">
                            <div className="flex items-center gap-2">
                                {isShareView && (
                                    <button
                                        onClick={() => setIsShareView(false)}
                                        className="p-1 text-muted hover:text-foreground transition-colors"
                                        title="بازگشت به منوی خروجی"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                )}
                                <h3 className="text-base font-bold text-primary">
                                    {isShareView ? "اشتراک‌گذاری برنامه" : "خروجی و اشتراک‌گذاری"}
                                </h3>
                            </div>

                            <button onClick={handleCloseModal} className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full text-muted hover:text-foreground transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {isShareView ? (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                {shortUrl && (
                                    <div className="flex flex-col gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-primary flex items-center gap-1">
                                                <Sparkles size={13} />
                                                لینک اختصاصی (کوتاه)
                                            </span>
                                            <span className="text-[10px] text-muted">حروف و اعداد کوچک</span>
                                        </div>

                                        <input
                                            type="text"
                                            readOnly
                                            value={shortUrl}
                                            className="glass-input font-mono text-xs py-2 px-3 text-left truncate select-all bg-black/10 dark:bg-white/10"
                                            dir="ltr"
                                        />

                                        <button
                                            onClick={() => handleCopy(shortUrl, "short")}
                                            className="glass-btn w-full py-2.5 text-xs font-bold text-primary border-primary/30 bg-primary/10 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            {copiedTarget === "short" ? <Check size={15} /> : <Copy size={15} />}
                                            <span>کپی لینک کوتاه</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-[var(--border-color)]">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-foreground flex items-center gap-1">
                                            <LinkIcon size={13} />
                                            لینک مستقیم (آفلاین)
                                        </span>
                                        <span className="text-[10px] text-muted">بدون نیاز به سرور</span>
                                    </div>

                                    <input
                                        type="text"
                                        readOnly
                                        value={directUrl}
                                        className="glass-input font-mono text-xs py-2 px-3 text-left truncate select-all bg-black/10 dark:bg-white/10 text-muted"
                                        dir="ltr"
                                    />

                                    <button
                                        onClick={() => handleCopy(directUrl, "direct")}
                                        className="glass-btn w-full py-2.5 text-xs font-bold text-muted hover:text-foreground transition-all flex items-center justify-center gap-2"
                                    >
                                        {copiedTarget === "direct" ? <Check size={15} /> : <Copy size={15} />}
                                        <span>کپی لینک اصلی</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleGenerateLinks}
                                    disabled={isGenerating}
                                    className="glass-btn !justify-start !px-5 py-3 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full shadow-primary/20 border-primary/20 text-primary disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <Loader2 size={18} className="animate-spin shrink-0" />
                                    ) : (
                                        <Share2 size={18} className="shrink-0" />
                                    )}
                                    <span className="text-sm font-bold">
                                        {isGenerating ? "در حال ساخت لینک اختصاصی..." : "کپی لینک اشتراک‌گذاری"}
                                    </span>
                                </button>

                                <div className="h-px w-full bg-border my-1"></div>

                                <button onClick={handleExportPNG} className="glass-btn !justify-start !px-5 py-2.5 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                    <ImageIcon size={18} className="text-primary shrink-0" />
                                    <span className="text-sm font-bold">دانلود به صورت عکس (PNG)</span>
                                </button>

                                <button onClick={handleExportPDF} className="glass-btn !justify-start !px-5 py-2.5 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                    <FileText size={18} className="text-danger shrink-0" />
                                    <span className="text-sm font-bold">دانلود جدول دروس (PDF)</span>
                                </button>

                                <div className="h-px w-full bg-border my-1"></div>

                                <button onClick={handleExportJSON} className="glass-btn !justify-start !px-5 py-2.5 gap-4 hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                    <FileJson size={18} className="text-ok shrink-0" />
                                    <span className="text-sm font-bold">خروجی فایل JSON (بکاپ)</span>
                                </button>

                                <label className="glass-btn !justify-start !px-5 py-2.5 gap-4 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 w-full">
                                    <Upload size={18} className="text-muted shrink-0" />
                                    <span className="text-sm font-bold">وارد کردن برنامه (Import)</span>
                                    <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* قالب جدول اختصاصی PDF */}
            {isPdfRendering && (
                <div
                    id="pdf-table-export-node"
                    className="fixed top-0 left-0 z-[50000] p-8 font-sans bg-[#ffffff] text-[#0f172a]"
                    style={{ width: "880px" }}
                    dir="rtl"
                >
                    {/* هدر سند PDF */}
                    <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-5 mb-5">
                        <div>
                            <h1 className="text-xl font-black mb-1 text-[#1877f2]">
                                جدول دروس و برنامه هفتگی
                            </h1>
                            <p className="text-xs text-[#64748b] font-medium">ساخته شده با ابزار انتخاب واحد</p>
                        </div>

                        <div className="flex flex-col items-end text-left" dir="ltr">
                            <span className="font-mono text-xs font-bold text-[#1877f2]">
                                {siteHost}
                            </span>
                            <div className="mt-1 px-3 py-0.5 rounded-full bg-[#1877f2]/10 border border-[#1877f2]/30 text-[#1877f2] text-[11px] font-bold" dir="rtl">
                                {todayPersianStr}
                            </div>
                        </div>
                    </div>

                    {/* خلاصه وضعیت */}
                    <div className="flex items-center gap-4 mb-5 text-xs font-bold">
                        <div className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#334155]">
                            تعداد دروس: <span className="font-mono font-bold text-[#0f172a]">{courses.length}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg border border-[#1877f2]/30 bg-[#1877f2]/10 text-[#1877f2]">
                            مجموع واحدها: <span className="font-mono font-bold">{toEnglishDigits(totalUnits.toString())}</span> واحد
                        </div>
                    </div>

                    {/* جدول دروس */}
                    <table className="w-full text-right border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#f1f5f9] text-[#334155]">
                                <th className="p-3 border border-[#cbd5e1] text-center font-bold w-10">#</th>
                                <th className="p-3 border border-[#cbd5e1] text-center font-bold w-24">کد درس</th>
                                <th className="p-3 border border-[#cbd5e1] font-bold">نام درس</th>
                                <th className="p-3 border border-[#cbd5e1] font-bold w-32">استاد</th>
                                <th className="p-3 border border-[#cbd5e1] text-center font-bold w-14">واحد</th>
                                <th className="p-3 border border-[#cbd5e1] font-bold w-52">جلسات کلاس</th>
                                <th className="p-3 border border-[#cbd5e1] font-bold w-44">امتحان پایان‌ترم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c, i) => (
                                <tr
                                    key={c.id}
                                    className={i % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f8fafc]"}
                                >
                                    <td className="p-3 border border-[#e2e8f0] text-center font-mono font-bold text-[#64748b] align-middle">
                                        {i + 1}
                                    </td>
                                    <td className="p-3 border border-[#e2e8f0] text-center font-mono font-bold text-[#0f172a] align-middle" dir="ltr">
                                        {toEnglishDigits(c.code)}
                                    </td>
                                    <td className="p-3 border border-[#e2e8f0] font-bold text-[#0f172a] align-middle">
                                        {c.name}
                                    </td>
                                    <td className="p-3 border border-[#e2e8f0] text-[#334155] align-middle">
                                        {c.professor || "-"}
                                    </td>
                                    <td className="p-3 border border-[#e2e8f0] text-center font-mono font-bold text-[#0f172a] align-middle">
                                        {toEnglishDigits(c.units.toString())}
                                    </td>

                                    {/* ستون جلسات کلاس: روز در سمت راست و ساعت در سمت چپ دقیقاً روبه‌روی هم در یک خط */}
                                    <td className="p-2.5 border border-[#e2e8f0] text-[#0f172a] align-middle">
                                        <div className="flex flex-col gap-1.5 w-full">
                                            {c.sessions.map((s, sIdx) => (
                                                <div
                                                    key={sIdx}
                                                    className="flex items-center justify-between gap-3 bg-slate-50 px-2.5 py-1 rounded border border-slate-200/70"
                                                >
                                                    <span className="font-bold text-[11px] text-slate-700 shrink-0 whitespace-nowrap">
                                                        {s.day}
                                                    </span>
                                                    <span
                                                        className="font-mono text-[11px] font-semibold text-slate-600 tracking-tight shrink-0 whitespace-nowrap"
                                                        dir="ltr"
                                                    >
                                                        {toEnglishDigits(s.start)} - {toEnglishDigits(s.end)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    {/* ستون امتحان پایان‌ترم: کادربندی مشابه و منظم */}
                                    <td className="p-2.5 border border-[#e2e8f0] text-[#0f172a] align-middle">
                                        {c.exam_date ? (
                                            <div className="flex flex-col gap-1 w-full bg-slate-50 px-2.5 py-1 rounded border border-slate-200/70">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-[11px] text-slate-700 shrink-0 whitespace-nowrap">
                                                        {getExamDay(c.exam_date)}
                                                    </span>
                                                    <span className="font-mono text-[11px] font-bold text-primary shrink-0 whitespace-nowrap" dir="ltr">
                                                        {toEnglishDigits(c.exam_date)}
                                                    </span>
                                                </div>
                                                {c.exam_time && (
                                                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 border-t border-slate-200/60 pt-0.5">
                                                        <span>ساعت امتحان</span>
                                                        <span className="font-mono font-bold text-slate-700" dir="ltr">
                                                            {toEnglishDigits(c.exam_time)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[#94a3b8] text-center block">ندارد</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}