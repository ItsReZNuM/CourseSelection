"use client";

import { useState, useEffect } from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { Plus, Save, X, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { Session } from "@/types";
import { DAYS } from "../course/DesktopGrid";
import { parseTimeToMinutes, overlap, toEnglishDigits } from "@/utils/helpers";
import AnimatedCheckbox from "../ui/AnimatedCheckbox";
import WheelTimePicker from "../ui/WheelTimePicker";
import InstallAppBtn from "../ui/InstallAppBtn";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";

const initialSession: Session = { day: DAYS[0], start: "", end: "" };

export default function CourseForm() {
    const { courses, addCourse, updateCourse, selectedCourseId, setSelectedCourseId, theme } = useCourseStore();

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [professor, setProfessor] = useState("");
    const [units, setUnits] = useState("");

    const [noExam, setNoExam] = useState(false);
    const [examDate, setExamDate] = useState<string>("");
    const [examTime, setExamTime] = useState<string>("");
    const [sessions, setSessions] = useState<Session[]>([{ ...initialSession }]);

    useEffect(() => {
        if (selectedCourseId) {
            const course = courses.find((c) => c.id === selectedCourseId);
            if (course) {
                setCode(course.code);
                setName(course.name);
                setProfessor(course.professor || "");
                setUnits(course.units ? course.units.toString() : "");
                setNoExam(course.exam_date === null);
                setExamDate(course.exam_date || "");
                setExamTime(course.exam_time || "");
                setSessions(JSON.parse(JSON.stringify(course.sessions)));
            }
        } else {
            setCode(""); setName(""); setProfessor(""); setUnits("");
            setNoExam(false); setExamDate(""); setExamTime("");
            setSessions([{ ...initialSession }]);
        }
    }, [selectedCourseId, courses]);

    const updateSession = (index: number, field: keyof Session, value: string) => {
        const newSessions = [...sessions];
        newSessions[index][field] = value;
        setSessions(newSessions);
    };

    const addSessionRow = () => setSessions([...sessions, { ...initialSession }]);
    const removeSessionRow = (index: number) => {
        if (sessions.length > 1) setSessions(sessions.filter((_, i) => i !== index));
    };

    const checkConflict = (newSessions: Session[], ignoreId: number | null) => {
        for (const newSess of newSessions) {
            if (!newSess.start || !newSess.end) continue;
            const st = parseTimeToMinutes(newSess.start);
            const en = parseTimeToMinutes(newSess.end);

            for (const course of courses) {
                if (course.id === ignoreId) continue;
                for (const existSess of course.sessions) {
                    if (
                        existSess.day === newSess.day &&
                        overlap(st, en, parseTimeToMinutes(existSess.start), parseTimeToMinutes(existSess.end))
                    ) {
                        return course.name;
                    }
                }
            }
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !code) return toast.error("نام و کد درس الزامی است.");

        for (let i = 0; i < sessions.length; i++) {
            const s = sessions[i];
            if (!s.start || !s.end) return toast.error(`ساعت شروع و پایان جلسه ${i + 1} الزامی است.`);
            if (parseTimeToMinutes(s.start) >= parseTimeToMinutes(s.end)) {
                return toast.error(`در جلسه ${i + 1}، ساعت پایان باید بعد از شروع باشد.`);
            }
        }

        const conflict = checkConflict(sessions, selectedCourseId);
        if (conflict) return toast.error(`تداخل زمانی با درس "${conflict}"!`);

        const courseData = {
            code,
            name,
            professor,
            units: parseFloat(units) || 0,
            exam_date: noExam ? null : examDate,
            exam_time: noExam ? null : examTime,
            sessions,
        };

        if (selectedCourseId) {
            updateCourse(selectedCourseId, courseData);
            toast.success("درس با موفقیت ویرایش شد.");
            setSelectedCourseId(null);
        } else {
            addCourse({ id: Date.now(), ...courseData });
            toast.success("درس با موفقیت به برنامه اضافه شد.");
            setCode(""); setName(""); setProfessor(""); setUnits("");
            setNoExam(false); setExamDate(""); setExamTime("");
            setSessions([{ ...initialSession }]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel p-4 md:p-6 mb-6 overflow-visible relative z-[60]">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <h2 className="text-lg font-bold text-primary">
                    {selectedCourseId ? "ویرایش درس" : "افزودن درس جدید"}
                </h2>
                {selectedCourseId && (
                    <button type="button" onClick={() => setSelectedCourseId(null)} className="text-xs text-danger hover:underline">
                        لغو ویرایش
                    </button>
                )}
            </div>

            <InstallAppBtn className="flex md:hidden w-full py-3 mb-5 text-sm" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-xs text-muted mb-1.5 ml-1">کد درس</label>
                    <input
                        value={code}
                        onChange={e => setCode(toEnglishDigits(e.target.value))}
                        className="glass-input font-mono text-left"
                        placeholder="e.g: 40123"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1.5 ml-1">نام درس</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="glass-input"
                        placeholder="مثال: برنامه‌نویسی پیشرفته"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1.5 ml-1">نام استاد</label>
                    <input
                        value={professor}
                        onChange={e => setProfessor(e.target.value)}
                        className="glass-input"
                        placeholder="دکتر ...."
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted mb-1.5 ml-1">تعداد واحد</label>
                    <input
                        value={units}
                        onChange={e => setUnits(toEnglishDigits(e.target.value))}
                        type="number"
                        step="0.01"
                        min="0"
                        className="glass-input font-mono text-center"
                        placeholder="3"
                    />
                </div>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border mb-6 relative">
                <div className="mb-5">
                    <AnimatedCheckbox checked={noExam} onChange={setNoExam} label="این درس امتحان ندارد" />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${noExam ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col">
                        <label className="block text-xs text-muted mb-1.5 ml-1">تاریخ امتحان</label>
                        <DatePicker
                            calendar={persian}
                            locale={persian_fa}
                            value={examDate}
                            onChange={(date) => setExamDate(date?.format("YYYY/MM/DD") || "")}
                            inputClass="glass-input font-sans w-full text-center"
                            containerClassName="w-full"
                            placeholder="انتخاب تاریخ"
                            calendarPosition="bottom-right"
                            fixMainPosition={true}
                            className={theme === "dark" ? "bg-dark" : ""}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="block text-xs text-muted mb-1.5 ml-1">ساعت امتحان</label>
                        <WheelTimePicker
                            value={examTime}
                            onChange={setExamTime}
                            placeholder="انتخاب ساعت امتحان"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 relative">
                <h3 className="text-sm font-bold mb-3 border-b border-border pb-2">جلسات کلاس</h3>
                <div className="flex flex-col gap-3">
                    {sessions.map((session, index) => (
                        <div key={index} className="grid grid-cols-2 md:flex md:flex-nowrap items-end gap-3 p-3 md:p-0 bg-black/5 md:bg-transparent rounded-xl border border-border md:border-transparent">
                            <div className="col-span-2 md:col-span-1 md:w-48 shrink-0">
                                <label className="block text-[10px] md:text-xs text-muted mb-1">روز هفته</label>
                                <select value={session.day} onChange={e => updateSession(index, 'day', e.target.value)} className="glass-input h-[42px] cursor-pointer">
                                    {DAYS.map(d => <option key={d} value={d} style={{ backgroundColor: 'var(--card)', color: 'var(--text)' }}>{d}</option>)}
                                </select>
                            </div>
                            <div className="col-span-1 md:flex-1 flex flex-col">
                                <label className="block text-[10px] md:text-xs text-muted mb-1">ساعت شروع</label>
                                <WheelTimePicker
                                    value={session.start}
                                    onChange={(val) => updateSession(index, 'start', val)}
                                    placeholder="شروع"
                                    className="h-[42px]"
                                />
                            </div>
                            <div className="col-span-1 md:flex-1 flex flex-col">
                                <label className="block text-[10px] md:text-xs text-muted mb-1">ساعت پایان</label>
                                <WheelTimePicker
                                    value={session.end}
                                    onChange={(val) => updateSession(index, 'end', val)}
                                    placeholder="پایان"
                                    className="h-[42px]"
                                />
                            </div>
                            {sessions.length > 1 && (
                                <button type="button" onClick={() => removeSessionRow(index)} className="col-span-2 md:col-span-1 glass-btn p-2.5 text-danger border-danger/20 hover:bg-danger/10 h-[42px] shrink-0 mt-2 md:mt-0">
                                    <X size={16} className="mx-auto" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addSessionRow} className="mt-4 md:mt-3 text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors px-2 py-1">
                    <Plus size={14} /> افزودن جلسه دیگر برای این درس
                </button>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-border">
                <button
                    type="submit"
                    className="group relative z-10 flex w-full md:w-auto items-center justify-center gap-2 overflow-hidden rounded-xl border border-border px-8 py-2.5 font-bold shadow-lg transition-all active:scale-95"
                >
                    <div className="absolute inset-0 -z-20 bg-[var(--glass-bg)] backdrop-blur-md"></div>
                    <div className="absolute -left-full top-1/2 -z-10 aspect-square w-full -translate-y-1/2 rounded-full bg-primary transition-all duration-700 ease-out group-hover:left-0 group-hover:scale-150"></div>

                    <span className="relative z-10 text-foreground transition-colors duration-300 group-hover:text-white">
                        {selectedCourseId ? "ثبت تغییرات" : "ذخیره درس"}
                    </span>

                    <div className="relative z-10 flex items-center justify-center rounded-full border border-border bg-black/5 dark:bg-white/5 p-1.5 transition-all duration-300 group-hover:border-transparent group-hover:bg-white/20 text-foreground group-hover:text-white">
                        {selectedCourseId ? <Edit2 size={18} /> : <Save size={18} />}
                    </div>
                </button>
            </div>
        </form>
    );
}