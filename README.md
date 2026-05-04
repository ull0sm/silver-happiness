# FitTrack — Silver Happiness

FitTrack is a fitness app prototype built with Next.js, React and Supabase. It focuses on workout creation, active workout logging, exercise library management, and social leaderboard features.
Repository layout (top-level):

- `app/` — Next.js app routes and pages
- `src/components/` — React components
Quick links:

- QUICKSTART: `QUICKSTART.md`
- Contributing guidelines: `CONTRIBUTING.md`
## Features

- Workout builder and plans
- Active workout logging
## Tech stack

- Next.js 16 (App Router)
- React 19
## Local development

1. Copy the environment template into `.env.local` and provide your Supabase keys (see `QUICKSTART.md`).
2. Install dependencies:
3. Run the dev server:

```bash
npm run dev
```
Open http://localhost:3000 in your browser.

Available npm scripts (from `package.json`):
- `npm run dev` — start development server
- `npm run build` — build for production
## Database & Supabase

The `supabase/schema.sql` file contains the project's database schema. To use Supabase with this project, create a project at https://app.supabase.com and set the following environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
## Deployment

This project deploys easily to Vercel or any platform that supports Next.js. Ensure environment variables are set in your deployment target.
## Where to start working

- UI components: `src/components/`
- App routes and pages: `app/` and `src/app/`
For more setup and quick commands, see `QUICKSTART.md`. To contribute, read `CONTRIBUTING.md`.

---
If you'd like, I can also add a short example `.env.local` template or set up a PR template next.
# FitTrack — Silver Happiness

FitTrack is a fitness app prototype built with Next.js, React and Supabase. It focuses on workout creation, active workout logging, exercise library management, and social leaderboard features.

Repository layout (top-level):

- `app/` — Next.js app routes and pages
- `src/components/` — React components
- `src/lib/` — app logic, actions and helpers
- `supabase/` — database schema and migrations
- `public/` — static assets

Quick links:

- QUICKSTART: `QUICKSTART.md`
- Contributing guidelines: `CONTRIBUTING.md`

## Features

- Workout builder and plans
- Active workout logging
- Exercise library and design preview
- Progress analytics and charts
- Social leaderboard and sharing

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (auth + database)
- Recharts for analytics

## Local development

1. Copy the environment template into `.env.local` and provide your Supabase keys (see `QUICKSTART.md`).
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Available npm scripts (from `package.json`):

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Database & Supabase

The `supabase/schema.sql` file contains the project's database schema. To use Supabase with this project, create a project at https://app.supabase.com and set the following environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only for server-side operations; keep secret)

## Deployment

This project deploys easily to Vercel or any platform that supports Next.js. Ensure environment variables are set in your deployment target.

## Where to start working

- UI components: `src/components/`
- App routes and pages: `app/` and `src/app/`
- Shared logic: `src/lib/`

For more setup and quick commands, see `QUICKSTART.md`. To contribute, read `CONTRIBUTING.md`.

---
If you'd like, I can also add a short example `.env.local` template or set up a PR template next.
