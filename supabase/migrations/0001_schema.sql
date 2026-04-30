-- ============================================================================
-- Iron Track — initial schema
-- ============================================================================
-- All tables live in `public`. RLS is enabled in 0002_rls.sql.

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,
  weight_unit   text not null default 'kg' check (weight_unit in ('kg','lb')),
  region        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles(username);

-- ----------------------------------------------------------------------------
-- exercises (master library, plus user custom exercises)
-- ----------------------------------------------------------------------------
create table if not exists public.exercises (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  name                text not null,
  primary_muscles     text[] not null default '{}',
  secondary_muscles   text[] not null default '{}',
  equipment           text,
  category            text,            -- 'compound' | 'isolation' | ...
  level               text,            -- 'beginner' | 'intermediate' | 'expert'
  force               text,            -- 'push' | 'pull' | 'static'
  mechanic            text,            -- 'compound' | 'isolation'
  instructions        text[] not null default '{}',
  image_urls          text[] not null default '{}',
  is_custom           boolean not null default false,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now()
);

create index if not exists exercises_primary_muscles_idx on public.exercises using gin(primary_muscles);
create index if not exists exercises_equipment_idx on public.exercises(equipment);
create index if not exists exercises_name_idx on public.exercises(lower(name));

-- ----------------------------------------------------------------------------
-- workout_templates  (curated and user-built)
-- ----------------------------------------------------------------------------
create table if not exists public.workout_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  type            text not null default 'custom' check (type in ('curated','custom')),
  split           text check (split in ('PPL','Bro','FullBody','UpperLower','Other') or split is null),
  days_per_week   int default 1,
  owner_id        uuid references public.profiles(id) on delete cascade, -- null for curated/global
  created_at      timestamptz not null default now()
);

create index if not exists workout_templates_owner_idx on public.workout_templates(owner_id);
create index if not exists workout_templates_type_idx on public.workout_templates(type);

-- ----------------------------------------------------------------------------
-- template_exercises (ordered list per template; day_index for multi-day plans)
-- ----------------------------------------------------------------------------
create table if not exists public.template_exercises (
  id              uuid primary key default gen_random_uuid(),
  template_id     uuid not null references public.workout_templates(id) on delete cascade,
  day_index       int not null default 0,
  exercise_id     uuid not null references public.exercises(id) on delete restrict,
  position        int not null default 0,
  target_sets     int not null default 3,
  target_reps     text not null default '8-12',
  rest_seconds    int not null default 90
);

create index if not exists template_exercises_template_idx on public.template_exercises(template_id, day_index, position);

-- ----------------------------------------------------------------------------
-- workout_sessions
-- ----------------------------------------------------------------------------
create table if not exists public.workout_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  template_id   uuid references public.workout_templates(id) on delete set null,
  name          text not null default 'Untitled Workout',
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  total_volume  numeric not null default 0,
  notes         text
);

create index if not exists workout_sessions_user_idx on public.workout_sessions(user_id, started_at desc);

-- ----------------------------------------------------------------------------
-- session_exercises
-- ----------------------------------------------------------------------------
create table if not exists public.session_exercises (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id   uuid not null references public.exercises(id) on delete restrict,
  position      int not null default 0
);

create index if not exists session_exercises_session_idx on public.session_exercises(session_id, position);

-- ----------------------------------------------------------------------------
-- session_sets
-- ----------------------------------------------------------------------------
create table if not exists public.session_sets (
  id                    uuid primary key default gen_random_uuid(),
  session_exercise_id   uuid not null references public.session_exercises(id) on delete cascade,
  set_index             int not null,
  weight                numeric not null default 0,
  reps                  int not null default 0,
  is_warmup             boolean not null default false,
  rpe                   numeric,
  completed_at          timestamptz
);

create index if not exists session_sets_se_idx on public.session_sets(session_exercise_id, set_index);

-- ----------------------------------------------------------------------------
-- body_stats
-- ----------------------------------------------------------------------------
create table if not exists public.body_stats (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  recorded_on   date not null default current_date,
  weight        numeric,
  body_fat      numeric,
  measurements  jsonb not null default '{}'::jsonb,
  unique (user_id, recorded_on)
);

create index if not exists body_stats_user_date_idx on public.body_stats(user_id, recorded_on desc);

-- ----------------------------------------------------------------------------
-- streaks (1 row per user)
-- ----------------------------------------------------------------------------
create table if not exists public.streaks (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  current_streak       int not null default 0,
  longest_streak       int not null default 0,
  freeze_tokens        int not null default 1,
  last_activity_date   date
);

-- ----------------------------------------------------------------------------
-- squads
-- ----------------------------------------------------------------------------
create table if not exists public.squads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  invite_code   text unique not null default substr(md5(random()::text), 1, 8),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table if not exists public.squad_members (
  squad_id   uuid not null references public.squads(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (squad_id, user_id)
);

create index if not exists squad_members_user_idx on public.squad_members(user_id);

-- ----------------------------------------------------------------------------
-- challenges
-- ----------------------------------------------------------------------------
create table if not exists public.challenges (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  metric        text not null check (metric in ('volume','reps','sessions','streak')),
  target        numeric not null,
  exercise_id   uuid references public.exercises(id) on delete set null,
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz not null,
  badge_slug    text
);

create index if not exists challenges_active_idx on public.challenges(ends_at);

create table if not exists public.challenge_participants (
  challenge_id   uuid not null references public.challenges(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  progress       numeric not null default 0,
  completed_at   timestamptz,
  joined_at      timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- ----------------------------------------------------------------------------
-- badges
-- ----------------------------------------------------------------------------
create table if not exists public.badges (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  icon          text,                       -- material symbol name
  criteria      jsonb not null default '{}'::jsonb
);

create table if not exists public.user_badges (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   uuid not null references public.badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists user_badges_user_idx on public.user_badges(user_id);

-- ----------------------------------------------------------------------------
-- favorites (favorited exercises per user)
-- ----------------------------------------------------------------------------
create table if not exists public.exercise_favorites (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

-- ----------------------------------------------------------------------------
-- Curated workout plans (seed)
-- ----------------------------------------------------------------------------
insert into public.workout_templates (id, name, description, type, split, days_per_week, owner_id)
values
  ('00000000-0000-0000-0000-000000000001'::uuid,
   'Push Pull Legs',
   'The foundation of raw mass. Isolate and destroy muscle groups systematically.',
   'curated', 'PPL', 3, null),
  ('00000000-0000-0000-0000-000000000002'::uuid,
   'Bro Split',
   'One muscle group per day. Maximum volume, maximum pump, maximum recovery.',
   'curated', 'Bro', 5, null),
  ('00000000-0000-0000-0000-000000000003'::uuid,
   'Full Body Heavy',
   'Compound movements only. High frequency, heavy loads. Not for the weak.',
   'curated', 'FullBody', 4, null)
on conflict (id) do nothing;

-- Seed core badges
insert into public.badges (slug, name, description, icon, criteria) values
  ('first_workout','First Blood','Complete your very first workout.','bolt','{"type":"sessions","count":1}'),
  ('streak_7','One Week Iron','Maintain a 7-day streak.','local_fire_department','{"type":"streak","days":7}'),
  ('streak_30','Forged In Fire','Maintain a 30-day streak.','local_fire_department','{"type":"streak","days":30}'),
  ('volume_10000','10K Club','Lift 10,000 kg total volume.','monitoring','{"type":"total_volume","value":10000}'),
  ('volume_100000','Hundred-K Hammer','Lift 100,000 kg total volume.','trophy','{"type":"total_volume","value":100000}'),
  ('first_pr','Personal Record','Hit your first PR on any exercise.','military_tech','{"type":"first_pr"}')
on conflict (slug) do nothing;
