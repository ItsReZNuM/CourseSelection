import type { Metadata, Viewport } from "next";
import CustomToaster from "@/components/ui/CustomToaster"; 
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
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        {children}

        <CustomToaster />

      </body>
    </html>
  );
}