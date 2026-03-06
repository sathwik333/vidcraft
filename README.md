# VidCraft

AI-powered photo-to-video SaaS. Upload a photo, choose from 11 state-of-the-art video models, and generate cinematic videos in seconds.

## Tech Stack

**Frontend** — Vite + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui + Zustand + Framer Motion
**Backend** — Express.js v5 + TypeScript (ES modules) + Zod
**Auth** — Clerk
**Database & Storage** — Supabase (PostgreSQL + object storage)
**Payments** — Stripe
**AI** — Kie.ai (aggregates Google Veo, Runway, Kling, Hailuo, Sora, and more)
**Email** — Resend

## AI Models

| Model | Quality | Audio | Credits |
|---|---|---|---|
| Google Veo 3.1 | 1080p | ✅ | 1–3 |
| Sora 2 | 1080p | ✅ | 3–10 |
| Kling 3.0 | Pro | ✅ | 3–8 |
| Wan 2.6 | 1080p | ✅ | 2 |
| Grok Imagine | 480p | ✅ | 3–5 |
| Runway Gen-4 Turbo | 1080p | — | 2–4 |
| Runway Aleph | 1080p | — | 3–5 |
| Kling 2.1 | 1080p | — | 2–3 |
| Kling 2.5 Turbo | 720p | — | 2 |
| Hailuo 2.3 | 768p | — | 2 |
| Bytedance Seedance | 720p | — | 2 |

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Clerk application
- A Stripe account
- A Kie.ai API key
- A Resend account (for email)

### 1. Clone and install

```bash
git clone https://github.com/your-username/vidcraft.git
cd vidcraft

cd client && npm install
cd ../server && npm install
```

### 2. Set up environment variables

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env.local
```

Fill in both files with your credentials. See the example files for descriptions of each variable.

### 3. Set up the database

Run the SQL schema in your Supabase project:

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste and run the contents of `server/supabase-schema.sql`

This creates all tables, indexes, storage buckets, and RLS settings.

### 4. Run locally

```bash
# Terminal 1 — backend (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client && npm run dev
```

The Vite dev server proxies `/api` requests to the Express server automatically.

### 5. Configure Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copy the webhook signing secret printed by the CLI into `server/.env` as `STRIPE_WEBHOOK_SECRET`.

## Project Structure

```
vidcraft/
├── client/                  # Vite + React frontend
│   ├── src/
│   │   ├── components/      # UI components by feature
│   │   │   ├── animation/   # Framer Motion components
│   │   │   ├── dashboard/   # Dashboard widgets
│   │   │   ├── gallery/     # Video gallery
│   │   │   ├── generate/    # Generation workflow
│   │   │   ├── landing/     # Landing page sections
│   │   │   ├── layout/      # Navbar, Sidebar, Footer
│   │   │   ├── shared/      # Cross-feature components
│   │   │   └── ui/          # Shadcn/ui primitives
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, constants, utils
│   │   ├── pages/           # Route-level page components
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript declarations
│   └── .env.example
│
└── server/                  # Express.js backend
    ├── src/
    │   ├── config/          # Env validation, Stripe, Supabase init
    │   ├── middleware/       # Auth, rate limiting, error handling
    │   ├── routes/          # API route handlers
    │   ├── services/        # Business logic (credits, generation, storage)
    │   ├── types/           # TypeScript types and DB schema types
    │   └── utils/           # Logger, model config
    ├── supabase-schema.sql  # Database schema (run once in Supabase)
    └── .env.example
```

## Scripts

| Directory | Command | Description |
|---|---|---|
| `client` | `npm run dev` | Start Vite dev server |
| `client` | `npm run build` | Production build |
| `client` | `npm run lint` | ESLint |
| `server` | `npm run dev` | Start server with hot reload (tsx watch) |
| `server` | `npm run build` | Compile TypeScript |
| `server` | `npm start` | Run compiled output |

## Pricing

| Plan | Credits | Price |
|---|---|---|
| Free | 1 (on signup) | — |
| Basic | 10 | $10 |
| Pro | 30 | $25 |
