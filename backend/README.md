# Tourist Safety Backend 🖥️

The core API service for the Tourist Safety Monitoring System, built with Express.js, Prisma, and Socket.IO.

## 🚀 Deployment
[https://tourist-safety-monitoring-system.onrender.com](https://tourist-safety-monitoring-system.onrender.com)

---

## 🛠️ Tech Stack
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Real-time**: Socket.IO
- **Validation**: TypeScript
- **Security**: Helmet, CORS, BCryptJS

---

## 📂 Features & Logic

### 1. Hierarchical Auth & Management
- Supports roles: `L1` (District), `L2` (Division), `L3` (State), `L4` (National).
- Custom middleware for regional RBAC.
- Hierarchical restrictions for `Create/Update/Delete` operations.

### 2. Live Incident Engine
- Real-time event broadcasting via Socket.IO.
- Structured incident lifecycle management.

---

## 📡 API Endpoints (Samples)

### Users
- `GET /api/users`: List users (filtered by requester hierarchy).
- `POST /api/users`: Create new officer (hierarchical check).
- `PATCH /api/users/:id`: Update officer profile.
- `DELETE /api/users/:id`: Remove officer from system.

### Incidents
- `GET /api/incidents`: Fetch incidents within officer's region.
- `POST /api/incidents`: Report new incident.
- `PATCH /api/incidents/:id`: Update incident status.

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Create a `.env` file in the root of the backend directory:
```env
DATABASE_URL=postgresql://user:password@host:port/db
PORT=5000
```

### 2. Commands
- `npm install`: Install dependencies.
- `npm run build`: Compile TypeScript and generate Prisma client.
- `npm start`: Run the compiled production server.
- `npm run dev`: Start working with live reload (Nodemon + ts-node).
- `npx prisma db push`: Sync schema to database.
- `npx prisma db seed`: Populate initial roles, regions (Maharashtra), and users.

---

## 📁 Folder Structure
- `/src/features`: Modular feature-based structure (users, incidents, analytics, map).
- `/src/shared`: Shared utilities, database client, and region assistants.
- `/prisma`: Schema definition and seeding scripts.
