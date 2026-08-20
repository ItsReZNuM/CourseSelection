import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ابزار انتخاب واحد",
  description: "مدیریت واحد و کمک به برنامه ریزی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="min-h-screen flex flex-col font-sans">
        {children}

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: '!bg-[var(--glass-bg)] !backdrop-blur-2xl !border !border-[var(--border-color)] !text-foreground !shadow-2xl !rounded-2xl',
            style: {
              background: 'transparent',
              boxShadow: 'none',
              padding: '12px 20px',
              fontFamily: 'var(--font-sans)',
            }
          }}
        />
      </body>
    </html>
  );
}