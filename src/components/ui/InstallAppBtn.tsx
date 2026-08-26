// src/components/ui/InstallAppBtn.tsx
"use client";

import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    className?: string;
}

export default function InstallAppBtn({ className = "" }: Props) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsInstalled(true);
        }

        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            setIsIOS(true);
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsInstalled(true);
            }
        } else if (isIOS) {
            toast(
                (t) => (
                    <div className="flex flex-col gap-2 text-sm font-bold text-center leading-relaxed">
                        <span className="text-primary mb-1">نصب در آیفون (iOS) 🍏</span>
                        <span className="text-xs font-normal text-muted">۱. در نوار پایین مرورگر، دکمه <b>Share</b> (مربع با فلش رو به بالا) را بزنید.</span>
                        <span className="text-xs font-normal text-muted">۲. گزینه <b>Add to Home Screen</b> (علامت +) را انتخاب کنید.</span>
                        <button onClick={() => toast.dismiss(t.id)} className="mt-3 w-full bg-primary/10 text-primary border border-primary/20 rounded-lg py-1.5 transition-colors hover:bg-primary hover:text-white">متوجه شدم</button>
                    </div>
                ),
                { duration: 8000 }
            );
        } else {
            toast("اپلیکیشن قبلاً نصب شده یا مرورگر شما از این قابلیت پشتیبانی نمی‌کند.", { icon: '📱' });
        }
    };

    if (isInstalled) return null;
    if (!deferredPrompt && !isIOS) return null;

    return (
        <button
            type="button"
            onClick={handleInstall}
            className={`glass-btn flex items-center justify-center gap-1.5 md:gap-2 text-ok border-ok/20 bg-ok/5 hover:bg-ok hover:text-white transition-colors shrink-0 animate-pulse shadow-[0_0_15px_rgba(66,183,42,0.3)] ${className}`}
            title="نصب اپلیکیشن"
        >
            <Smartphone className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="text-xs md:text-sm font-bold mt-0.5">نصب اپلیکیشن</span>
        </button>
    );
}