<div align="center">


  # 🎓 University Course Planner
  
  <p>A modern, premium, and feature-rich course planning and schedule management web application.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://zustand-demo.pmnd.rs/)

</div>

---

## ✨ Features

* 🌓 **Glassmorphism UI & Theme Engine:** Gorgeous dark and light theme toggle powered by the native View Transitions API.
* 🖥️ **Interactive Desktop Grid:** A comprehensive weekly timetable grid (Saturday to Thursday, 08:00 to 19:00) with automatic time-overlap detection.
* 📱 **Responsive Mobile Timeline & Bottom Sheet:** Tailored mobile experience featuring horizontal day tabs, chronological timelines, and interactive bottom sheets for course details, editing, and safe deletion.
* ⏰ **Custom Wheel Time Picker:** An iOS-style smooth scroll wheel time picker supporting 24-hour formats and 15-minute intervals.
* 📅 **Persian Calendar & Exam Tracker:** Built-in Jalali calendar integration for managing exam dates, days, and times seamlessly.
* 📥📤 **Advanced Export & Backup:** Export your schedule instantly as a high-resolution PNG image, a formatted PDF document, or a portable JSON backup file, with support for schedule importing.
* 🛡️ **Smart Validation & Confirmations:** Intelligent conflict prevention mechanisms and custom glassmorphism modal dialogs for critical actions.

---

## 🖼️ Previews

### 🌙 Dark Mode
![Dark Mode](dark.png)

### ☀️ Light Mode
![Light Mode](light.png)

---

## 🚀 Tech Stack

* **Framework:** Next.js 16 (App Router)
* **UI Library:** React 19
* **Styling:** Tailwind CSS v4
* **Language:** TypeScript
* **State Management:** Zustand (with local storage persistence middleware)
* **Icons:** Lucide React
* **Calendar & Dates:** React Multi Date Picker & React Date Object (Jalali support)
* **Export Utilities:** html-to-image and jsPDF

---

## 🛠️ Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites

Ensure you have Node.js installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/ItsReZNuM/CourseSelection.git](https://github.com/ItsReZNuM/CourseSelection.git)
   ```

2. Navigate to the project directory:
   ```bash
   cd CourseSelection
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Scripts

* `npm run dev` — Starts the development server.
* `npm run build` — Builds the application for production.
* `npm run start` — Starts the production server.
* `npm run lint` — Runs ESLint to check for code quality.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).