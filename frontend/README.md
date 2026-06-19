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
## API Endpoints

The project references the following endpoints and routes (examples found in the repository). Replace the host/base path as appropriate for your deployment.

Frontend routes:

- `GET /` — Landing
- `GET /login` — Login
- `GET /dashboard` — Dashboard
- `GET /upload` — Upload
- `GET /results/:id` — Results (e.g. `/results/demo`)
- `GET /history` — History
- `GET /reports` — Reports
- `GET /settings` — Settings

Server API endpoints (documented examples):

- `POST /api/auth` — Authentication (login token)
- `GET /api/users` — List users (supports pagination and filters)
- `POST /api/users` — Create user
- `GET /api/users/{id}` — Get user
- `PUT /api/users/{id}` — Replace user
- `PATCH /api/users/{id}` — Update user fields
- `DELETE /api/users/{id}` — Delete user
- `GET /api/users/{id}/orders` — List user's orders
- `POST /api/users/{id}/orders` — Create order for user
- `POST /api/users/batch` — Batch create users
- `POST /api/createUser` — Example RPC-style create
- `POST /api/getUserById` — Example RPC-style get
- `POST /api/deleteUser` — Example RPC-style delete
- `GET /api/orders` — List orders
- `POST /api/orders` — Create order
- `GET /api/orders/{id}` — Get order
- `GET /api/products` — List products

Common query params used in examples: `page`, `page_size`, `limit`, `cursor`, `search`/`q`, `sort`, `fields`, `status`, `role`.

Notes: many of these endpoints are documented in `skills/api-design-principles/` as examples and templates — treat them as reference for a backend implementation.

Recommended analysis & processing endpoints (suggested for backend teams):

- `POST /api/analyses` — Upload dataset / create new analysis (multipart/form-data). Returns `{ "analysis_id": "..." }` and `202 Accepted`.
- `GET /api/analyses` — List analyses (supports `page`, `page_size`, `status` filters).
- `GET /api/analyses/{id}` — Get analysis metadata and summary (status, created_at, parameters).
- `POST /api/analyses/{id}/start` — Start processing for an analysis (optional override params).
- `GET /api/analyses/{id}/status` — Poll processing status (queued, running, completed, failed).
- `GET /api/analyses/{id}/results` — Retrieve final results JSON (metrics, confidence scores, findings).
- `GET /api/analyses/{id}/graphs` — Return structured data for charts/graphs used in the UI (timeseries, histograms, breakdowns).
- `GET /api/analyses/{id}/graphs/{graphId}` — Single graph data (for lazy loading large visualizations).
- `POST /api/analyses/{id}/recompute` — Re-run processing with modified parameters.
- `GET /api/analyses/{id}/report` — Download report (PDF/HTML) for the analysis.

These recommended endpoints align with the frontend flow (upload → process → results → charts → reports). If you want, I can add example request/response schemas for each endpoint into the README or generate an OpenAPI snippet.

## Screenshots
A small gallery of the main pages (stored in `docs/screenshots/`):

### Landing
![Landing](docs/screenshots/1-landing_page.png)

### Dashboard
![Dashboard](docs/screenshots/2-dashboard.png)

### Analysis
![Analysis](docs/screenshots/3-analysis.png)

### Results
![Results](docs/screenshots/7-Result.png)

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
