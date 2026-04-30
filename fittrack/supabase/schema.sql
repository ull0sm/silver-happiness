-- ============================================================
-- FITTRACK — Supabase Database Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── Stage 1: Profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Stage 2: Exercise Library ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[],
  equipment TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT CHECK (category IN ('compound', 'isolation', 'cardio', 'plyometric')),
  form_tips TEXT,
  instructions TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public exercises are viewable by everyone"
  ON public.exercises FOR SELECT
  USING (is_public = TRUE);

-- ── Stage 3: Workout Plans & Sessions ──────────────────────
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('predefined', 'custom')) DEFAULT 'custom',
  description TEXT,
  plan_data JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own plans"
  ON public.workout_plans FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  total_volume_kg NUMERIC DEFAULT 0,
  notes TEXT
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  set_number INT NOT NULL,
  weight_kg NUMERIC,
  reps INT,
  rpe INT CHECK (rpe BETWEEN 1 AND 10),
  is_pr BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sets"
  ON public.session_sets FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id FROM public.workout_sessions WHERE id = session_id
    )
  );

-- ── Stage 5: Body Stats & Streaks ──────────────────────────
CREATE TABLE IF NOT EXISTS public.body_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at DATE DEFAULT CURRENT_DATE,
  weight_kg NUMERIC,
  body_fat_pct NUMERIC,
  chest_cm NUMERIC,
  waist_cm NUMERIC,
  hips_cm NUMERIC,
  arms_cm NUMERIC,
  notes TEXT
);

ALTER TABLE public.body_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own body stats"
  ON public.body_stats FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  freeze_tokens INT DEFAULT 3,
  last_workout_date DATE
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streaks"
  ON public.streaks FOR ALL
  USING (auth.uid() = user_id);

-- ── Stage 6: Social ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view squads"
  ON public.squads FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Users create own squads"
  ON public.squads FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE TABLE IF NOT EXISTS public.squad_members (
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (squad_id, user_id)
);

ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad members visible to authenticated users"
  ON public.squad_members FOR SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Users manage own squad memberships"
  ON public.squad_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT CHECK (metric IN ('volume_kg', 'reps', 'streak', 'sessions')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_community BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  badge_key TEXT
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone authenticated"
  ON public.challenges FOR SELECT
  TO authenticated USING (TRUE);

CREATE TABLE IF NOT EXISTS public.challenge_entries (
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (challenge_id, user_id)
);

ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenge entries"
  ON public.challenge_entries FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, badge_key)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own achievements"
  ON public.achievements FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Achievements viewable by authenticated users"
  ON public.achievements FOR SELECT
  TO authenticated USING (TRUE);
