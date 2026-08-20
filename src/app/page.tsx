"use client";

import { useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import DesktopGrid from "@/components/course/DesktopGrid";
import CourseForm from "@/components/form/CourseForm";
import MobileTimeline from "@/components/course/MobileTimeline";
import { useCourseStore } from "@/store/useCourseStore";

export default function Home() {
  const { theme } = useCourseStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <main className="container mx-auto p-4 max-w-7xl relative pb-20">
      {/* نوار ابزار بالا */}
      <Topbar />

      {/* فرم افزودن درس */}
      <CourseForm />

      {/* جدول مخصوص دسکتاپ (در موبایل مخفی است) */}
      <DesktopGrid />

      {/* تایم‌لاین مخصوص موبایل (در دسکتاپ مخفی است) */}
      <MobileTimeline />

    </main>
  );
}