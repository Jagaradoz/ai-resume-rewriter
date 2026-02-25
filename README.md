# AI Resume Rewriter

> Transform your resume bullets into impact-driven statements with AI.

A single-purpose web tool where users paste raw experience text and get polished, results-driven resume bullets via GPT-4o-mini in real-time. Not a resume builder — just the rewriting engine.

---

## Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 16 (App Router)        |
| Language  | TypeScript                     |
| Styling   | Tailwind 4 + Shadcn/UI        |
| Database  | Neon PostgreSQL + Prisma 7     |
| Auth      | NextAuth 5 (Google, GitHub, Email) |
| AI        | OpenAI (GPT-4o-mini)           |
| Payments  | Stripe                         |
| Cache     | Upstash Redis                  |
| Deploy    | Vercel                         |

## Features

- AI-powered resume rewriting with real-time SSE streaming
- Multiple variations per rewrite (Free: 2, Pro: 3)
- Copy to clipboard, PDF/DOCX export
- Rewrite history with 7-day (Free) or 365-day (Pro) retention
- Monthly quota enforcement (Free: 5, Pro: 30)
- Stripe billing ($3/mo Pro plan) with customer portal
- Global daily cap (500 rewrites/day) and rate limiting
- Background jobs: monthly quota reset, weekly stale cleanup

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or [Neon](https://neon.tech))
- [OpenAI API key](https://platform.openai.com)
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

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command                              | Description                  |
| ------------------------------------ | ---------------------------- |
| `npm run dev`                        | Start dev server             |
| `npm run build`                      | Production build             |
| `npm start`                          | Start production server      |
| `npm run lint`                       | Run ESLint                   |
| `npm test`                           | Run tests (Vitest)           |
| `npm run test:ui`                    | Run tests with browser UI    |
| `npm run test:coverage`              | Run tests with coverage      |
| `npx prisma studio`                  | Open Prisma Studio (DB GUI)  |
| `npx prisma migrate dev --name <n>`  | Create a migration           |

---

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
    ai/                   # OpenAI client + prompt
    redis/                # Upstash Redis client, keys, hash
prisma/schema/            # Split Prisma schema files
.docs/                    # Project documentation
```

---

## Deployment

### Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Post-Deploy

- **Stripe Webhooks**: Add your Vercel URL + `/api/webhooks/stripe` to Stripe webhook endpoints
- **Vercel Cron**: Already configured in `vercel.json` (quota reset monthly, stale cleanup weekly)
- **CRON_SECRET**: Set in Vercel environment variables for cron job authorization

---

## Documentation

- [ARCHITECTURE.md](.docs/ARCHITECTURE.md) — System design, data model, caching strategy
- [PRODUCT.md](.docs/PRODUCT.md) — Features, pricing, build plan
- [DESIGN.md](.docs/DESIGN.md) — Design system, color palette, typography

---

## License

MIT
