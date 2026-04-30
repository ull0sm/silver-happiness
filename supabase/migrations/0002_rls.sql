-- ============================================================================
-- Iron Track — Row-Level Security policies
-- ============================================================================

alter table public.profiles               enable row level security;
alter table public.exercises              enable row level security;
alter table public.workout_templates      enable row level security;
alter table public.template_exercises     enable row level security;
alter table public.workout_sessions       enable row level security;
alter table public.session_exercises      enable row level security;
alter table public.session_sets           enable row level security;
alter table public.body_stats             enable row level security;
alter table public.streaks                enable row level security;
alter table public.squads                 enable row level security;
alter table public.squad_members          enable row level security;
alter table public.challenges             enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.badges                 enable row level security;
alter table public.user_badges            enable row level security;
alter table public.exercise_favorites     enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
drop policy if exists "profiles read public" on public.profiles;
create policy "profiles read public"
  on public.profiles for select
  using (true);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles insert self" on public.profiles;
create policy "profiles insert self"
  on public.profiles for insert
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- exercises
-- ----------------------------------------------------------------------------
drop policy if exists "exercises read all" on public.exercises;
create policy "exercises read all"
  on public.exercises for select
  using (true);

drop policy if exists "exercises insert own custom" on public.exercises;
create policy "exercises insert own custom"
  on public.exercises for insert
  with check (is_custom = true and created_by = auth.uid());

drop policy if exists "exercises update own custom" on public.exercises;
create policy "exercises update own custom"
  on public.exercises for update
  using (is_custom = true and created_by = auth.uid())
  with check (is_custom = true and created_by = auth.uid());

drop policy if exists "exercises delete own custom" on public.exercises;
create policy "exercises delete own custom"
  on public.exercises for delete
  using (is_custom = true and created_by = auth.uid());

-- ----------------------------------------------------------------------------
-- workout_templates
-- ----------------------------------------------------------------------------
drop policy if exists "templates read curated or own" on public.workout_templates;
create policy "templates read curated or own"
  on public.workout_templates for select
  using (type = 'curated' or owner_id = auth.uid());

drop policy if exists "templates insert own" on public.workout_templates;
create policy "templates insert own"
  on public.workout_templates for insert
  with check (owner_id = auth.uid() and type = 'custom');

drop policy if exists "templates update own" on public.workout_templates;
create policy "templates update own"
  on public.workout_templates for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "templates delete own" on public.workout_templates;
create policy "templates delete own"
  on public.workout_templates for delete
  using (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- template_exercises (inherit perms from parent template)
-- ----------------------------------------------------------------------------
drop policy if exists "te read if can read template" on public.template_exercises;
create policy "te read if can read template"
  on public.template_exercises for select
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = template_exercises.template_id
        and (t.type = 'curated' or t.owner_id = auth.uid())
    )
  );

drop policy if exists "te mutate if owns template" on public.template_exercises;
create policy "te mutate if owns template"
  on public.template_exercises for all
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = template_exercises.template_id
        and t.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_templates t
      where t.id = template_exercises.template_id
        and t.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- workout_sessions / session_exercises / session_sets — owner only
-- ----------------------------------------------------------------------------
drop policy if exists "sessions own" on public.workout_sessions;
create policy "sessions own"
  on public.workout_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "se own" on public.session_exercises;
create policy "se own"
  on public.session_exercises for all
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_exercises.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_exercises.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "sets own" on public.session_sets;
create policy "sets own"
  on public.session_sets for all
  using (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions s on s.id = se.session_id
      where se.id = session_sets.session_exercise_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.session_exercises se
      join public.workout_sessions s on s.id = se.session_id
      where se.id = session_sets.session_exercise_id and s.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- body_stats / streaks / favorites — owner only
-- ----------------------------------------------------------------------------
drop policy if exists "body_stats own" on public.body_stats;
create policy "body_stats own"
  on public.body_stats for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "streaks read own" on public.streaks;
create policy "streaks read own"
  on public.streaks for select
  using (user_id = auth.uid());

drop policy if exists "streaks update own" on public.streaks;
create policy "streaks update own"
  on public.streaks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "favorites own" on public.exercise_favorites;
create policy "favorites own"
  on public.exercise_favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- squads
-- ----------------------------------------------------------------------------
drop policy if exists "squads read members" on public.squads;
create policy "squads read members"
  on public.squads for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.squad_members m
      where m.squad_id = squads.id and m.user_id = auth.uid()
    )
  );

drop policy if exists "squads insert own" on public.squads;
create policy "squads insert own"
  on public.squads for insert
  with check (owner_id = auth.uid());

drop policy if exists "squads update own" on public.squads;
create policy "squads update own"
  on public.squads for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "squads delete own" on public.squads;
create policy "squads delete own"
  on public.squads for delete
  using (owner_id = auth.uid());

-- squad_members: members can read, only owners can manage
drop policy if exists "sm read same squad" on public.squad_members;
create policy "sm read same squad"
  on public.squad_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.squad_members me
      where me.squad_id = squad_members.squad_id and me.user_id = auth.uid()
    )
  );

drop policy if exists "sm join self" on public.squad_members;
create policy "sm join self"
  on public.squad_members for insert
  with check (user_id = auth.uid());

drop policy if exists "sm leave self" on public.squad_members;
create policy "sm leave self"
  on public.squad_members for delete
  using (user_id = auth.uid()
         or exists (select 1 from public.squads s
                    where s.id = squad_members.squad_id and s.owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- challenges (public read, no client mutation)
-- ----------------------------------------------------------------------------
drop policy if exists "challenges read all" on public.challenges;
create policy "challenges read all"
  on public.challenges for select
  using (true);

drop policy if exists "cp read own" on public.challenge_participants;
create policy "cp read own"
  on public.challenge_participants for select
  using (user_id = auth.uid());

drop policy if exists "cp join self" on public.challenge_participants;
create policy "cp join self"
  on public.challenge_participants for insert
  with check (user_id = auth.uid());

drop policy if exists "cp update own" on public.challenge_participants;
create policy "cp update own"
  on public.challenge_participants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- badges (public read), user_badges (own read; awarded by SECURITY DEFINER fn)
-- ----------------------------------------------------------------------------
drop policy if exists "badges read all" on public.badges;
create policy "badges read all"
  on public.badges for select
  using (true);

drop policy if exists "user_badges read own" on public.user_badges;
create policy "user_badges read own"
  on public.user_badges for select
  using (user_id = auth.uid());
