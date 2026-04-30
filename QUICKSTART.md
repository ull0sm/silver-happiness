# IRON TRACK — Quickstart

Get the app running locally in ~5 minutes.

## 0. Prerequisites

- **Node.js 20+** (or 22) and npm
- A free **Supabase** project — create one at https://supabase.com/dashboard
- (Optional) A Google Cloud OAuth client — only if you want Google sign-in

## 1. Clone & install

```bash
git clone <your-fork-url>
cd silver-happiness
npm install
```

## 2. Configure environment variables

Copy the example and fill in your Supabase keys:

```bash
cp .env.example .env.local      # macOS / Linux
copy .env.example .env.local    # Windows PowerShell
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # required only for the seed script
```

You'll find these in **Supabase dashboard → Project settings → API**.

> The service-role key is **server-only**. Never expose it to the browser. It's used only by `scripts/seed-exercises.ts`.

## 3. Run the database migrations

The simplest path (no Supabase CLI required):

1. Open **Supabase dashboard → SQL Editor → New query**
2. Paste the contents of these files in order, running each:
   - [`supabase/migrations/0001_schema.sql`](./supabase/migrations/0001_schema.sql)
   - [`supabase/migrations/0002_rls.sql`](./supabase/migrations/0002_rls.sql)
   - [`supabase/migrations/0003_functions_triggers.sql`](./supabase/migrations/0003_functions_triggers.sql)
3. (Optional) Paste [`supabase/seed/sample_challenges.sql`](./supabase/seed/sample_challenges.sql) for some active community challenges.

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) configured:

```bash
supabase link --project-ref YOUR-PROJECT-REF
supabase db push
```

## 4. Seed the exercise library

This downloads ~870 exercises from `free-exercise-db` and upserts them via the service role:

```bash
npm run seed
```

The dataset is cached at `supabase/seed/_exercises.cache.json` so re-runs are fast.

## 5. Enable Google OAuth (optional but recommended)

1. **Google Cloud Console → APIs & Services → Credentials**: create an OAuth 2.0 Client ID (type: Web application).
2. Set the **Authorized redirect URI** to:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
3. **Supabase dashboard → Authentication → Providers → Google**: paste the client ID and secret, then **Save**.
4. **Supabase dashboard → Authentication → URL Configuration**: add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   ```
   And in production:
   ```
   https://your-domain.com/auth/callback
   ```

That's it — the "Continue with Google" button on `/login` and `/signup` will now work.

> Email/password works out-of-the-box (no extra config). Email confirmation is enabled by default; users will see a "Check your email" message until they click the confirmation link. To disable confirmations during development, go to **Authentication → Providers → Email** and turn off "Confirm email".

## 6. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

- `/` — public landing page
- `/login`, `/signup` — auth
- `/compete` — public top-5 leaderboard (full ranks after login)
- After signing in: `/workouts`, `/workouts/builder`, `/workouts/sessions/[id]`, `/exercises`, `/analytics`, `/squads`, `/settings`

## 7. Production build

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` to your production URL before building so OAuth redirects resolve correctly.

---

## Common pitfalls

| Symptom | Fix |
|---|---|
| `Authentication required` from `get_full_leaderboard` | You're calling it without a logged-in session. The page handles this, but if you're testing the RPC directly, sign in first. |
| Empty exercise library | You skipped step 4. Run `npm run seed`. |
| Google OAuth opens but redirects to `/login?error=...` | Your **Redirect URL** in Supabase Auth doesn't include `<SITE_URL>/auth/callback`. |
| `permission denied for table profiles` | Migrations didn't apply. Re-run `0002_rls.sql`. |
| Streak doesn't update after finishing a workout | `finish_session` runs `recompute_streak`. Check that `0003_functions_triggers.sql` was applied successfully. |
| New users have no profile row | The `handle_new_user()` trigger on `auth.users` is missing. Re-run `0003_functions_triggers.sql`. |

---

## Project scripts

```bash
npm run dev       # Next.js dev server (with hot reload)
npm run build     # Production build
npm run start     # Run the production build
npm run lint      # ESLint
npm run seed      # Seed/refresh exercise library from free-exercise-db
```
