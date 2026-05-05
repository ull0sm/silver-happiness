# FitTrack — Silver Happiness

FitTrack is a fitness app prototype built with Next.js, React, and Supabase. It focuses on workout creation, active workout logging, exercise library management, and social leaderboard features.

Repository layout (top-level):

- `src/app/` — Next.js app routes and pages
- `src/components/` — React components
- `src/lib/` — App logic, actions and helpers
- `supabase/` — Database schema and migrations
- `public/` — Static assets

## Quick Links

- [Quickstart Guide](QUICKSTART.md) — Learn how to set up the project locally.
- [Contributing Guidelines](CONTRIBUTING.md) — Learn how to contribute to this project.
- [Design Details](front%20end%20design/crimson_fury/DESIGN.md) — Read more about our design philosophy.
- [License](LICENSE) — MIT License (open source, anyone can use, feel free).

## Features

- **Workout Builder & Plans**: Create and manage custom workout routines.
- **Active Workout Logging**: Track sets, reps, and weights during a session.
- **Exercise Library**: Explore supported exercises and variations.
- **Progress Analytics**: Beautiful charts using Recharts to visualize your fitness journey.
- **Social Leaderboard**: Share progress and compete with others.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase
- **Charts**: Recharts

## Getting Started

Check out the [QUICKSTART.md](QUICKSTART.md) file for comprehensive setup instructions, including installing dependencies, setting up Supabase, and starting the local development server.

## Deployment

This project deploys easily to Vercel or any platform that supports Next.js. Simply link your repository and ensure your environment variables (like Supabase URLs and keys) are set in your platform's configuration dashboard.

## Where to Start Working

- **UI Components**: `src/components/`
- **Pages / Routes**: `src/app/`
- **Shared Code / API Logic**: `src/lib/`

To contribute, check out [CONTRIBUTING.md](CONTRIBUTING.md). We welcome community pull requests!

