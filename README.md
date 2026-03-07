# AI Resume Rewriter

> Transform your resume bullets into impact-driven statements with AI.

A single-purpose web tool where users paste raw experience text and get polished, results-driven resume bullets via Gemini in real-time. Not a resume builder — just the rewriting engine.

## Table of Contents

- [AI Resume Rewriter](#ai-resume-rewriter)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Routes \& API Endpoints](#routes--api-endpoints)
    - [Frontend Routes](#frontend-routes)
    - [Backend API Endpoints](#backend-api-endpoints)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Scripts](#scripts)
  - [Deployment](#deployment)

## Features

- **AI-powered resume rewriting**: Real-time SSE streaming.
- **Multiple variations**: Per rewrite (Free: 2, Pro: 3).
- **Export options**: Copy to clipboard, PDF/DOCX export.
- **Rewrite history**: 7-day (Free) or 365-day (Pro) retention.
- **Monthly quota enforcement**: Free: 5, Pro: 30.
- **Stripe billing**: $3/mo Pro plan with customer portal.
- **Global limits**: Global daily cap (500 rewrites/day) and rate limiting.
- **Background jobs**: Monthly quota reset, weekly stale cleanup.

## Tech Stack

| Technology    | Role                         |
| ------------- | ---------------------------- |
| Next.js 16    | Framework (App Router)       |
| TypeScript    | Language                     |
| Tailwind 4    | Styling (with Shadcn/UI)     |
| PostgreSQL    | Database                     |
| Prisma 7      | ORM                          |
| NextAuth 5    | Auth (Google, GitHub, Email) |
| Google Gemini | AI Rewriting Engine          |
| Stripe        | Payments                     |
| Upstash Redis | Cache & Rate Limiting        |
| Vercel        | Deploy & Hosting             |

## Project Structure

```
src/
├── app/                            # Next.js App Router
│   ├── api/rewrite/                # AI rewrite endpoint (SSE streaming)
│   ├── api/cron/                   # Vercel Cron jobs (quota reset, cleanup)
│   ├── api/webhooks/stripe/        # Stripe webhook handler
│   ├── (auth)/                     # Sign in, sign up pages
│   ├── (main)/dashboard/           # Dashboard, history, profile
│   └── (marketing)/pricing/        # Pricing page
├── features/                       # Feature modules
│   ├── auth/                       # Auth config, forms, DAL
│   ├── billing/                    # Stripe integration, pricing cards, DAL
│   ├── dashboard/                  # Dashboard shell, history list
│   ├── rewrite/                    # Rewrite form, output, export utils
│   └── marketing/                  # Landing page components
├── shared/                         # Cross-cutting concerns
│   ├── ui/                         # Shadcn components
│   ├── layout/                     # Navbar, providers
│   ├── config/                     # Plan config, constants
│   ├── helpers/                    # requireAuth, utilities
│   ├── db/                         # Prisma client
│   ├── ai/                         # Gemini client + prompt
│   └── redis/                      # Upstash Redis client, keys, hash
├── prisma/schema/                  # Split Prisma schema files
└── .docs/                          # Project documentation
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

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ai-resume-rewriter.git
   cd ai-resume-rewriter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Setup the database:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Environment Variables

| Variable                 | Description                  | Example / Default                              |
| ------------------------ | ---------------------------- | ---------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string | `postgresql://user:password@localhost:5432/db` |
| `GEMINI_API_KEY`         | Google Gemini API key        | `AIzaSy...`                                    |
| `STRIPE_SECRET_KEY`      | Stripe Test API key          | `sk_test_...`                                  |
| `NEXTAUTH_SECRET`        | NextAuth secret for JWT      | `long-random-string`                           |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL (Optional)    | `https://...`                                  |

> See `.env.example` for all required and optional variables.

### Scripts

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

## Deployment

This app can be deployed on [Vercel](https://vercel.com/new). Make sure to set the following production environment variables:

```env
DATABASE_URL=postgresql://production_db_url
GEMINI_API_KEY=your_production_gemini_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```