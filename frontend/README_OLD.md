# NeuralSight AI Platform - Frontend

A cutting-edge AI analysis platform built with React 19, TypeScript, and modern web technologies. Dark glassmorphism UI with advanced animations and real-time data visualization.

## ?? Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

**Dev Server**: http://localhost:5175/

---

## ?? Quick Links

| Page | URL |
|------|-----|
| Dashboard | http://localhost:5175/dashboard |
| Upload | http://localhost:5175/upload |
| Results | http://localhost:5175/results/demo |
| History | http://localhost:5175/history |
| Reports | http://localhost:5175/reports |
| Settings | http://localhost:5175/settings |
| Landing | http://localhost:5175/ |
| Login | http://localhost:5175/login |

---

## ?? Screenshots

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/1-dashboard.jpg" alt="Dashboard" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">Dashboard</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/2-upload.jpg" alt="Upload" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">Upload</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/3-results.jpg" alt="Results" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">Results</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/4-history.jpg" alt="History" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">History</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/5-reports.jpg" alt="Reports" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">Reports</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="docs/screenshots/6-settings.jpg" alt="Settings" width="100%" style="max-width: 280px;" />
    <figcaption style="margin-top: 8px; font-size: 13px;">Settings</figcaption>
  </figure>
</div>

---

## ?? Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript 5.6 |
| **Build** | Vite 5.4 with SWC |
| **Styling** | Tailwind CSS 4.0 |
| **Components** | Radix UI (52 components) |
| **Animations** | framer-motion 11.15.0 |
| **Data Viz** | Recharts 2.x |
| **Forms** | react-hook-form + Zod |
| **Icons** | lucide-react (400+) |
| **Routing** | wouter 3.3.5 |
| **State** | React Query 5.64.1 |

---

## ? Features

- **Dashboard**: Real-time stats, AreaChart, active queue, timeline
- **Upload**: 3-step multi-stage form with validation
- **Results**: Circular confidence, performance metrics, BarChart, insights
- **History**: Sortable table, filters, confidence bars
- **Reports**: Carousel interface with preview/download
- **Settings**: Profile, password, notifications, API keys
- **Dark Theme**: Glassmorphism with violet/cyan/emerald accents
- **Smooth Animations**: framer-motion with staggered transitions
- **Responsive**: Mobile-first design
- **Accessible**: Radix UI built-in ARIA

---

## ?? Color Palette

- Primary: #7c3aed (Violet)
- Secondary: #06b6d4 (Cyan)
- Success: #10b981 (Emerald)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)

---

## ?? Project Structure

\\\
src/
+-- pages/
�   +-- Dashboard.tsx
�   +-- Upload.tsx
�   +-- Results.tsx
�   +-- History.tsx
�   +-- Reports.tsx
�   +-- Settings.tsx
�   +-- Landing.tsx
�   +-- Login.tsx
+-- components/ui/
+-- App.tsx
+-- main.tsx

docs/screenshots/
+-- 1-dashboard.jpg
+-- 2-upload.jpg
+-- 3-results.jpg
+-- 4-history.jpg
+-- 5-reports.jpg
+-- 6-settings.jpg
\\\

---

## ?? Notes

- All pages fully functional with mock data
- Form validation ready (react-hook-form + Zod)
- React Query integration ready
- Optimized animations for smooth 60 FPS
- Build output: 873 KB ? 254 KB gzipped

---

## ?? License

MIT
