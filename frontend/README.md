# NeuralSight AI Platform - Frontend

A cutting-edge AI analysis platform built with React 19, TypeScript, and modern web technologies. Dark glassmorphism UI with advanced animations and real-time data visualization.

## Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

**Dev Server**: http://localhost:5175/

---

## Quick Links

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
## Screenshots
A small gallery of the main pages (stored in `docs/screenshots/`):

### Landing
![Landing](docs/screenshots/1-landing_page.png)

### Dashboard
![Dashboard](docs/screenshots/2-dashboard.png)

### Results
![Results](docs/screenshots/3-analysis.png)

### History
![History](docs/screenshots/4-history.png)

### Reports
![Reports](docs/screenshots/5-reports.png)

### Settings
![Settings](docs/screenshots/6-settings.png)

---
## Tech Stack


| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript 5.6 |
| Build | Vite 5.4 with SWC |
| Styling | Tailwind CSS 4.0 |
| Components | Radix UI (52 components) |
| Animations | framer-motion 11.15.0 |
| Data Viz | Recharts 2.x |
| Forms | react-hook-form + Zod |
| Icons | lucide-react (400+) |
| Routing | wouter 3.3.5 |
| State | React Query 5.64.1 |

---

## Features

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

## Color Palette

- Primary: #7c3aed (Violet)
- Secondary: #06b6d4 (Cyan)
- Success: #10b981 (Emerald)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)

---

## Project Structure

```
src/
├── pages/
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   ├── Results.tsx
│   ├── History.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   ├── Landing.tsx
│   └── Login.tsx
├── components/ui/
├── App.tsx
└── main.tsx

docs/screenshots/
├── 1-dashboard.png
├── 2-upload.png
├── 3-results.png
├── 4-history.png
├── 5-reports.png
└── 6-settings.png
```

---

## Notes

- All pages fully functional with mock data
- Form validation ready (react-hook-form + Zod)
- React Query integration ready
- Optimized animations for smooth 60 FPS
- Build output: 873 KB → 254 KB gzipped

---

## License

MIT
