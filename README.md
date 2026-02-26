# AI Resume Rewriter

> Transform your resume bullets into impact-driven statements with AI.

A single-purpose web tool where users paste raw experience text and get polished, results-driven resume bullets via Gemini in real-time. Not a resume builder — just the rewriting engine.

## Features

- AI-powered resume rewriting with real-time SSE streaming
- Multiple variations per rewrite (Free: 2, Pro: 3)
- Copy to clipboard, PDF/DOCX export
- Rewrite history with 7-day (Free) or 365-day (Pro) retention
- Monthly quota enforcement (Free: 5, Pro: 30)
- Stripe billing ($3/mo Pro plan) with customer portal
- Global daily cap (500 rewrites/day) and rate limiting
- Background jobs: monthly quota reset, weekly stale cleanup

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router)            |
| Language  | TypeScript                         |
| Styling   | Tailwind 4 + Shadcn/UI             |
| Database  | PostgreSQL + Prisma 7              |
| Auth      | NextAuth 5 (Google, GitHub, Email) |
| AI        | Google Gemini                      |
| Payments  | Stripe                             |
| Cache     | Upstash Redis                      |
| Deploy    | Vercel                             |

## Project Structure

```
src/
  app/                    # Next.js App Router
    api/rewrite/          # AI rewrite endpoint (SSE streaming)
    api/cron/             # Vercel Cron jobs (quota reset, cleanup)
    api/webhooks/stripe/  # Stripe webhook handler
    (auth)/               # Sign in, sign up pages
    (main)/dashboard/     # Dashboard, history, profile
    (marketing)/pricing/  # Pricing page
  features/               # Feature modules
    auth/                 # Auth config, forms, DAL
    billing/              # Stripe integration, pricing cards, DAL
    dashboard/            # Dashboard shell, history list
    rewrite/              # Rewrite form, output, export utils
    marketing/            # Landing page components
  shared/                 # Cross-cutting concerns
    ui/                   # Shadcn components
    layout/               # Navbar, providers
    config/               # Plan config, constants
    helpers/              # requireAuth, utilities
    db/                   # Prisma client
    ai/                   # Gemini client + prompt
    redis/                # Upstash Redis client, keys, hash
prisma/schema/            # Split Prisma schema files
.docs/                    # Project documentation
```

## Routes & API Endpoints

### Frontend Routes
- `/` - Landing page
- `/signin` - User login
- `/signup` - User registration
- `/pricing` - Pricing and plans
- `/dashboard` - Main workspace for resume rewriting
- `/dashboard/history` - Past rewrite results
- `/dashboard/profile` - User settings and billing management

### Backend API Endpoints
- `POST /api/rewrite` - AI rewrite streaming (SSE)
- `GET /api/cron/reset-quotas` - Monthly quota reset (Cron)
- `GET /api/cron/cleanup-stale` - Stale history cleanup (Cron)
- `POST /api/webhooks/stripe` - Stripe event processing
- `GET /api/session` - User session caching/retrieval
- `POST /api/auth/*` - NextAuth.js authentication endpoints

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or [Neon](https://neon.tech))
- [Gemini API key](https://aistudio.google.com/app/apikey)
- [Stripe account](https://stripe.com) (test mode)
- [Upstash Redis](https://upstash.com) instance (optional — caching is fail-open)

### Installation

```bash
git clone https://github.com/your-username/ai-resume-rewriter.git
cd ai-resume-rewriter
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

Fill in the values — see [.env.example](.env.example) for all required and optional variables.

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Run

```bash
npm run dev
```

---

## Scripts

| Command                             | Description                 |
| ----------------------------------- | --------------------------- |
| `npm run dev`                       | Start dev server            |
| `npm run build`                     | Production build            |
| `npm start`                         | Start production server     |
| `npm run lint`                      | Run ESLint                  |
| `npm test`                          | Run tests (Vitest)          |
| `npm run test:ui`                   | Run tests with browser UI   |
| `npm run test:coverage`             | Run tests with coverage     |
| `npx prisma studio`                 | Open Prisma Studio (DB GUI) |
| `npx prisma migrate dev --name <n>` | Create a migration          |
