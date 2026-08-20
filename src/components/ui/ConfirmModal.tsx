"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    courseName: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, courseName }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="glass-panel p-6 w-full max-w-xs relative z-10 animate-slide-up bg-[var(--card)]/95 flex flex-col items-center text-center">

                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4 border border-danger/20">
                    <AlertTriangle size={28} className="text-danger" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">حذف درس</h3>

                <p className="text-sm text-muted mb-8 leading-relaxed">
                    آیا مطمئن هستید که می‌خواهید درس <br />
                    <span className="font-bold text-primary">«{courseName}»</span> <br />
                    را حذف کنید؟
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between w-full gap-3">
                    <button
                        onClick={onClose}
                        className="glass-btn flex-1 py-3 text-sm text-muted hover:text-foreground font-bold transition-all"
                    >
                        انصراف
                    </button>
                    <button
                        onClick={onConfirm}
                        className="glass-btn flex-1 py-3 text-sm bg-danger text-white border-transparent hover:bg-danger/90 font-bold shadow-md shadow-danger/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        حذف
                    </button>
                </div>
            </div>
        </div>
    );
}