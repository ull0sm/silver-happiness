## Quickstart — FitTrack (Silver Happiness)

This file provides the minimal steps to get the app running locally.

Prerequisites

- Node.js 18+ (or compatible with Next.js 16)
- npm (or yarn / pnpm)

Clone and install

```bash
git clone https://github.com/ull0sm/silver-happiness
cd silver-happiness
npm install
```

Environment variables

Create a `.env.local` file at the project root. At minimum set the Supabase keys:

```env
# Supabase Project (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App URL (change to your domain in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

```

If you plan to use Supabase locally or run migrations, follow Supabase's docs to apply `supabase/schema.sql` to your project.

Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Build & serve production

```bash
npm run build
npm run start
```

Linting

```bash
npm run lint
```

Notes

- The database schema is in `supabase/schema.sql`.
- If you add or change environment variables, restart the dev server.
- For deployment, set the same environment variables in your hosting provider (Vercel, etc.).
- **License**: Anyone can feel free to use this. See the [LICENSE](LICENSE) file for more info.
