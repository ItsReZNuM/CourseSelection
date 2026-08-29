// src/app/page.tsx
"use client";

import { useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import DesktopGrid from "@/components/course/DesktopGrid";
import CourseForm from "@/components/form/CourseForm";
import MobileTimeline from "@/components/course/MobileTimeline";
import Footer from "@/components/layout/Footer";
import WelcomeModal from "@/components/ui/WelcomeModal";
import ImportSharedModal from "@/components/ui/ImportSharedModal"; // 👈 کامپوننت اشتراک لینک ایمپورت شد
import { useCourseStore } from "@/store/useCourseStore";

export default function Home() {
  const { theme } = useCourseStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <main className="container mx-auto p-4 max-w-7xl relative min-h-screen flex flex-col pb-8">

      <ImportSharedModal />

      <WelcomeModal />
      <Topbar />
      <CourseForm />
      <DesktopGrid />
      <MobileTimeline />

      <div className="flex-1"></div>
      <Footer />

    </main>
  );
}