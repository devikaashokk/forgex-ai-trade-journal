# ForgeX — AI Forex Trade Journal & Analytics Platform

> A production-grade fintech SaaS MVP built with React, Node.js, Prisma, PostgreSQL & Groq AI.

![ForgeX](https://img.shields.io/badge/ForgeX-AI%20Trade%20Journal-00D4AA?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)

---

## 🚀 What is ForgeX?

**ForgeX** is an AI-powered forex trading journal that helps traders:
- Log and analyze every trade with emotion tracking
- Visualize performance via equity curve & analytics charts
- Get AI-driven coaching from Google Groq on trading behavior
- Identify emotional trading patterns and discipline gaps

---

## 🏗️ Project Structure

```
forex-journal/
├── client/          # React + TypeScript + Vite frontend
├── server/          # Node.js + Express + Prisma backend
├── shared/          # Shared TypeScript types
├── .env.example     # Environment variable template
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| AI | Google Groq 1.5 Flash |
| Auth | JWT (access + refresh tokens) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/forex-journal.git
cd forex-journal

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
# In project root
cp .env.example .env.local

# Fill in:
# DATABASE_URL=postgresql://user:password@localhost:5432/forgex
# JWT_SECRET=your-super-secret-key-min-32-chars
# CLIENT_URL=http://localhost:5173
```

### 3. Database Setup

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm run start`
5. Add environment variables from `.env.example`
6. Add PostgreSQL database on Render (free tier)

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set root directory: `client`
3. Add `VITE_API_URL=https://your-render-backend.onrender.com`
4. Deploy

---

## 🧠 AI Features (Groq)

ForgeX uses **Grok 1.5 Flash** to:
- Analyze trade notes for emotional patterns
- Detect overtrading, revenge trading, FOMO
- Generate personalized discipline feedback
- Suggest concrete improvement strategies

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/prisma/schema.prisma` | Database schema |
| `server/src/features/auth/` | JWT auth logic |
| `server/src/features/trades/` | CRUD + analytics |
| `server/src/features/ai/` | Groq integration |
| `client/src/store/` | Zustand state |
| `client/src/features/` | Feature modules |
| `client/src/components/` | Shared UI components |

---

## 👤 Author

**[Your Name]** — BCA (AI) Graduate | Forex Trader  
Built as a portfolio project demonstrating full-stack AI integration.

---

## 📄 License

MIT
