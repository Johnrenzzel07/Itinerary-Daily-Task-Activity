# Daily Work Itinerary Management System

An enterprise-style web application for managing and publishing daily work itineraries. Employees use a protected admin dashboard to log activities; guests can view the public itinerary page without logging in.

## Features

### Public Guest Page (`/`)
- Employee name and position display
- Activity table with date, time, activity, status, and remarks
- Date browsing: Today, Yesterday, This Week, This Month, All Time, custom date/range
- Search and status filters
- Export to PDF / Excel and print
- High-contrast black & white design for readability

### Admin Dashboard (protected)
- **Dashboard** — stats cards, charts, recent activities
- **Activities** — full CRUD with search, filters, sorting, pagination
- **Status Manager** — create, edit, delete activity statuses with colors
- **Profile** — update name, position, avatar
- **Settings** — dark mode toggle, preferences
- **Command palette** — `Ctrl + K` quick navigation
- **AI writing tools** — Fix Grammar & Paraphrase (Groq AI) in activity form
- **Themes**
  - Light mode: colorful indigo/violet admin UI
  - Dark mode: black & white only

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4, Radix UI |
| Database | MongoDB + Prisma 5 |
| Auth | NextAuth v5 (credentials) |
| Charts | Recharts |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Validation | Zod |

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas cluster (or local MongoDB)
- Groq API key (optional, for AI grammar/paraphrase)

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Itinerary
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string (must include database name, e.g. `/itinerary`) |
| `AUTH_SECRET` | Random secret for NextAuth — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for local dev) |
| `GROQ_API_KEY` | Groq API key from [console.groq.com](https://console.groq.com) |

Example `DATABASE_URL`:

```
mongodb+srv://user:pass@cluster.mongodb.net/itinerary?retryWrites=true&w=majority
```

### 3. Set up the database

```bash
npm run db:setup
```

This runs `prisma db push` and seeds default statuses, an admin user, and sample activities.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@company.com` |
| Password | `admin123` |

Change the password after first login in production.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to MongoDB |
| `npm run db:seed` | Seed database |
| `npm run db:setup` | Push schema + seed |

## Project Structure

```
Itinerary/
├── app/
│   ├── page.tsx                 # Public guest itinerary
│   ├── login/page.tsx           # Admin login
│   ├── (admin)/                 # Protected admin routes
│   │   ├── dashboard/
│   │   ├── activities/
│   │   ├── status/
│   │   ├── profile/
│   │   └── settings/
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth handler
│       └── ai/text/             # Groq grammar & paraphrase API
├── actions/                     # Server actions (CRUD)
├── components/                  # React components
├── lib/                         # Utilities, auth, Groq, export
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── types/                       # Shared TypeScript types
```

## AI Grammar Fixer & Paraphraser

Available in the **Create / Edit Activity** form (admin only):

- **Fix Grammar** — corrects spelling, grammar, and punctuation
- **Paraphrase** — rewrites text while keeping the same meaning

Requires `GROQ_API_KEY` in `.env`. The key is used server-side only and never exposed to the browser.

## Security Notes

- Never commit `.env` to version control
- Rotate API keys if they are exposed
- Use a strong `AUTH_SECRET` in production
- Update default admin credentials before deploying

## Deploying to Vercel

### Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `mongodb+srv://.../itinerary?retryWrites=true&w=majority` |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `GROQ_API_KEY` | Optional — AI grammar/paraphrase |

### Root Directory

If Vercel shows a plain **404: NOT_FOUND** page (white box, no app styling), check:

1. **Root Directory** is set to the project folder (where `package.json` lives), not a parent folder
2. **Framework Preset** is **Next.js**
3. The latest deployment **Build** step succeeded (not just "Deploying outputs")
4. `NEXTAUTH_URL` matches your live Vercel URL exactly

After pushing fixes, trigger a **Redeploy** from the Vercel dashboard.


Private project — all rights reserved.
