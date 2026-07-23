# Nirmaan - Enterprise Hackathon Evaluation Platform 🚀

Nirmaan is a modern, real-time, enterprise-grade Hackathon Evaluation Platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas**, **Mongoose**, **Socket.io**, **Framer Motion**, and **Zustand**.

---

## 🌟 Key Features

### 1. Futuristic UI & Custom Cursor Engine
- **Glassmorphism Design System**: Dark Slate (`#0F172A`), Deep Blue (`#2563EB`), and Vibrant Orange (`#F97316`) theme with frosted glass cards and glowing borders.
- **Custom Interactive Cursor**: Magnetic button attraction, spotlight glow tracking, color transformations over interactive cards, click ripple effects, and subtle particle trails.
- **Animated Gradient Mesh**: Floating ambient particles and smooth glowing blurs.

### 2. Role-Based Access Control (RBAC) & Security
- **Three Dedicated Portals**:
  1. **Admin (`/admin/*`)**: Complete system monitoring, user & room management, request approval flow, locking/unlocking scoring, and executive exports.
  2. **Jury Panel (`/jury/*`)**: Room-restricted evaluation suite with 5 criteria sliders, auto score totalizer `/100`, remarks, confetti celebrations, and extra selection request popups.
  3. **Student Coordinator (`/coord/*`)**: Room-restricted team management hub for registration, team detail uploads, and attendance tracking.
- **Security Enforcement**: HTTP-only JWT sessions (`nirmaan_token`), bcrypt password hashing, Zod schema validation, and Next.js middleware route protection with room scoping.

### 3. Real-Time Synchronization Engine
- Powered by **Socket.io**:
  - Instant live broadcasts when Coordinators register or modify teams.
  - Immediate leaderboard calculations when Jury panels submit scores.
  - Real-time notification bell alerts when requests are created or approved.

### 4. Zero Demo Data Policy
- Strictly built to render pristine empty states when MongoDB is clean.
- Auto-prompts Super Admin initialization on first run if zero users exist in the database.

### 5. Exports & Analytics
- Multi-sheet Excel Workbooks (`.xlsx`) via `xlsx` library.
- Formatted CSV exports (`.csv`).
- Criteria average breakdown charts and completion metrics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, GSAP, Lucide Icons, Canvas Confetti.
- **Backend**: Next.js Server Actions, API Routes, Custom Node HTTP Server.
- **Real-Time**: Socket.io server and client hooks.
- **Database**: MongoDB Atlas / Local MongoDB via Mongoose ODM.
- **State Management**: Zustand stores (`useAuthStore`, `useNotificationStore`).
- **Auth**: JWT in HTTP-Only Cookies + bcryptjs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x+
- MongoDB instance running locally (`mongodb://127.0.0.1:27017/nirmaan_db`) or MongoDB Atlas connection URI.

### Installation

```bash
# Install all required dependencies
npm install

# Start development server with Socket.io
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Folder Architecture

```
/
├── app/
│   ├── admin/             # Admin Portal Pages (Dashboard, Rooms, Users, Requests, Analytics)
│   ├── jury/              # Jury Panel Portal (Room-restricted scoring & leaderboard)
│   ├── coord/             # Student Coordinator Hub (Team management & attendance)
│   ├── api/               # API Routes (Auth, Rooms, Teams, Evaluations, Requests, Exports)
│   ├── login/             # Login & Super-Admin Bootstrapper
│   ├── globals.css        # Glassmorphism design tokens & styles
│   └── layout.tsx         # Root layout with dark theme
├── components/
│   ├── ui/                # CursorFollower, FuturisticBackground
│   ├── Navbar.tsx         # Sticky header with search, notifications, & role pills
│   ├── AdminSidebar.tsx   # Admin navigation sidebar
│   ├── NotificationBell.tsx # Live notification popover
│   └── GlobalSearchModal.tsx # Cmd+K search Engine
├── hooks/
│   └── useSocket.ts       # Socket.io connection & room join hook
├── lib/
│   ├── db.ts              # Cached Mongoose connection
│   ├── auth.ts            # JWT & bcrypt authentication logic
│   └── socket-emitter.ts  # Server-side Socket broadcaster
├── models/                # Mongoose Models (User, Room, Team, Evaluation, Request, Notification, AuditLog)
├── store/                 # Zustand Stores (Auth, Notifications)
├── types/                 # TypeScript Types & Interfaces
├── server.js              # Custom Node.js HTTP server integrating Next.js + Socket.io
├── tailwind.config.ts     # Brand palette & keyframe animations
└── README.md
```

---

## 🔒 Production Deployment Instructions (Vercel / Node.js)

1. Set Environment Variables in `.env`:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
   NODE_ENV=production
   ```

2. Build and launch:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License

Enterprise Hackathon Evaluation License • Built with Next.js 15 & MongoDB.
