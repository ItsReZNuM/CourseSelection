// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ابزار انتخاب واحد",
  description: "مدیریت واحد و کمک به برنامه ریزی",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "انتخاب واحد",
  },
  formatDetection: {
    telephone: false,
  },
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