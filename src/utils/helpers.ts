
import { Course, Session } from "../types";

export function normalizeTimeStr(t: string | number): string {
    let str = (t || "").toString().trim();
    if (!str) return "";
    let hh = "00", mm = "00";
    if (str.includes(":")) [hh, mm] = str.split(":");
    else if (str.includes(".")) [hh, mm] = str.split(".");
    else { hh = str; mm = "00"; }

    hh = hh.padStart(2, "0");
    if (mm.length === 1) {
        const m = Math.round(parseFloat("0." + mm) * 60) || 0;
        mm = String(m);
    }
    mm = (mm + "00").slice(0, 2);
    return `${hh}:${mm}`;
}

export function parseTimeToMinutes(t: string): number {
    const n = normalizeTimeStr(t);
    const [h, m] = n.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return NaN;
    return h * 60 + m;
}

export function overlap(a1: number, a2: number, b1: number, b2: number): boolean {
    return Math.max(a1, b1) < Math.min(a2, b2);
}

export function colorForCourse(courseId: number, courses: Course[]): string {
    const sortedIds = [...courses].map(c => c.id).sort((a, b) => a - b);
    let index = sortedIds.indexOf(courseId);
    
    if (index === -1) index = 0;

    const hue = (210 + (index * 137.5)) % 360;
    return `hsl(${hue}, 85%, 60%)`;
}

export function toEnglishDigits(str: string): string {
    if (!str) return "";
    return str
        .replace(/[۰-۹]/g, (w) => String(['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'].indexOf(w)))
        .replace(/[٠-٩]/g, (w) => String(['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'].indexOf(w)));
}