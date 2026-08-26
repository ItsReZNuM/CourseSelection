// src/components/ui/CustomToaster.tsx
"use client";

import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function CustomToaster() {
    
    useEffect(() => {
        const handleToastClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.clickable-toast')) {
                toast.dismiss();
            }
        };
        
        const stopProgressAnimationEnd = (e: AnimationEvent) => {
            if (e.animationName === 'toast-progress') {
                e.stopPropagation(); 
            }
        };

        document.addEventListener('click', handleToastClick);
        window.addEventListener('animationend', stopProgressAnimationEnd, true);

        return () => {
            document.removeEventListener('click', handleToastClick);
            window.removeEventListener('animationend', stopProgressAnimationEnd, true);
        };
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .clickable-toast {
                    position: relative;
                    overflow: hidden;
                }
                
                .clickable-toast::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    width: 100%;
                    background: var(--color-primary);
                    opacity: 0.8;
                    /* زمان دقیقاً ۴.۳ ثانیه تنظیم شد (۴ ثانیه ماندگاری + ۳۰۰ میلی‌ثانیه ورود) */
                    animation: toast-progress 4.3s linear forwards;
                }

                .clickable-toast:hover::after {
                    animation-play-state: paused;
                }

                @keyframes toast-progress {
                    0% { width: 100%; }
                    100% { width: 0%; }
                }
            `}} />

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    className: '!bg-[var(--glass-bg)] !backdrop-blur-2xl !border !border-[var(--border-color)] !text-foreground !shadow-2xl !rounded-2xl !cursor-pointer clickable-toast transition-transform active:scale-[0.98]',
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: '12px 20px',
                        fontFamily: 'var(--font-sans)',
                    }
                }}
            />
        </>
    );
}