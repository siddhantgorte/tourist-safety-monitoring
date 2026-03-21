# Tourist Safety Dashboard 🎨

A high-performance, real-time administrative interface for the Tourist Safety Monitoring System, built with Next.js, Shadcn UI, Recharts, and Leaflet.

## 🚀 Deployment
[https://tourist-safety-monitoring-system.vercel.app/](https://tourist-safety-monitoring-system.vercel.app/)

---

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Analytics**: Recharts
- **Maps**: React-Leaflet
- **Icons**: Lucide React
- **State**: Jotai (Global User Atom)
- **Data Fetching**: React Query (TanStack Query)

---

## 📂 Features & Design

### 1. Interactive Analytics
- **Live Visuals**: PieCharts for incident categorization and AreaCharts for weekly trends.
- **Premium Design**: Vibrant HSL color palettes, glassmorphism KPI cards, and smooth hover effects.
- **Visibility**: High-contrast, whitish axis labels and legends optimized for dark themes.

### 2. Live Mapping
- **District Highlighting**: GeoJSON-based coloring of Maharashtra's 36 districts.
- **Role-Based Focus**: Automatically focuses the map on the officer's administrative region.
- **Marker Clustering**: Individual tourist markers with real-time positional updates.

### 3. User Management
- **Persona Switcher**: Quick-toggle between L1-L4 roles for demonstration.
- **Subordinate Views**: Only lists officers within the user's geographic and hierarchical scope.

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create a `.env.local` file in the root of the dashboard directory:
```env
NEXT_PUBLIC_API_URL=https://tourist-safety-monitoring-system.onrender.com/api
```

### 2. Commands
- `npm install`: Install dependencies.
- `npm run dev`: Launch the development server.
- `npm run build`: Create a production-optimized build.
- `npm start`: Run the production server.

---

## 📁 Folder Structure
- `/app`: Next.js page routing and layout.
- `/features`: Feature-based components (analytics, map, users, incidents).
- `/components/ui`: Shadcn UI reusable components.
- `/lib`: API client (Axios) and shared utilities.
