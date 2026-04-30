-- ============================================================================
-- Iron Track — functions, triggers, views
-- ============================================================================

-- ----------------------------------------------------------------------------
-- handle_new_user(): on auth.users insert, create profile + streaks rows
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    -- best-effort username; fall back to user-id-suffix to avoid collision
    coalesce(
      nullif(regexp_replace(lower(coalesce(new.raw_user_meta_data->>'name',
                                            split_part(new.email, '@', 1))),
                            '[^a-z0-9_]', '', 'g'),
             ''),
      'user') || '_' || substr(new.id::text, 1, 6)
  )
  on conflict (id) do nothing;

  insert into public.streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- update_session_volume(): recompute total_volume on workout_sessions
-- ----------------------------------------------------------------------------
create or replace function public.update_session_volume()
returns trigger
language plpgsql
as $$
declare
  v_session_id uuid;
begin
  if tg_op = 'DELETE' then
    select se.session_id into v_session_id
    from public.session_exercises se
    where se.id = old.session_exercise_id;
  else
    select se.session_id into v_session_id
    from public.session_exercises se
    where se.id = new.session_exercise_id;
  end if;

  if v_session_id is not null then
    update public.workout_sessions s
    set total_volume = coalesce((
      select sum(coalesce(ss.weight,0) * coalesce(ss.reps,0))
      from public.session_sets ss
      join public.session_exercises se2 on se2.id = ss.session_exercise_id
      where se2.session_id = v_session_id
        and ss.is_warmup = false
    ), 0)
    where s.id = v_session_id;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists trg_update_session_volume_ins on public.session_sets;
create trigger trg_update_session_volume_ins
  after insert or update or delete on public.session_sets
  for each row execute function public.update_session_volume();

-- ----------------------------------------------------------------------------
-- recompute_streak(p_user_id) : invoke after a workout is finished
-- ----------------------------------------------------------------------------
create or replace function public.recompute_streak(p_user_id uuid)
returns table (current_streak int, longest_streak int, freeze_tokens int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_last  date;
  v_current int;
  v_longest int;
  v_freezes int;
begin
  select last_activity_date, current_streak, longest_streak, freeze_tokens
    into v_last, v_current, v_longest, v_freezes
  from public.streaks
  where user_id = p_user_id;

  if v_last is null then
    v_current := 1;
  elsif v_last = v_today then
    -- already counted today; nothing changes
    null;
  elsif v_last = v_today - interval '1 day' then
    v_current := v_current + 1;
  elsif v_last = v_today - interval '2 day' and v_freezes > 0 then
    -- one-day rest gap absorbed by a freeze token
    v_freezes := v_freezes - 1;
    v_current := v_current + 1;
  else
    v_current := 1;
  end if;

  if v_current > v_longest then v_longest := v_current; end if;

  update public.streaks
  set current_streak = v_current,
      longest_streak = v_longest,
      freeze_tokens  = v_freezes,
      last_activity_date = v_today
  where user_id = p_user_id;

  return query select v_current, v_longest, v_freezes;
end;
$$;

grant execute on function public.recompute_streak(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- suggest_overload(p_user_id, p_exercise_id) : last best set + suggested next
-- ----------------------------------------------------------------------------
create or replace function public.suggest_overload(p_user_id uuid, p_exercise_id uuid)
returns table (last_weight numeric, last_reps int, suggested_weight numeric, suggested_reps int)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_unit text;
  v_inc  numeric;
  v_lw numeric;
  v_lr int;
  v_target int := 8;  -- default rep target
begin
  select weight_unit into v_unit from public.profiles where id = p_user_id;
  v_inc := case when v_unit = 'lb' then 5 else 2.5 end;

  select ss.weight, ss.reps
    into v_lw, v_lr
  from public.session_sets ss
  join public.session_exercises se on se.id = ss.session_exercise_id
  join public.workout_sessions s   on s.id = se.session_id
  where s.user_id = p_user_id
    and se.exercise_id = p_exercise_id
    and ss.is_warmup = false
    and ss.completed_at is not null
  order by ss.completed_at desc, ss.weight desc
  limit 1;

  if v_lw is null then
    return query select null::numeric, null::int, null::numeric, null::int;
    return;
  end if;

  if v_lr >= v_target then
    return query select v_lw, v_lr, v_lw + v_inc, v_target;
  else
    return query select v_lw, v_lr, v_lw, v_lr + 1;
  end if;
end;
$$;

grant execute on function public.suggest_overload(uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- v_weekly_volume: per-user volume for the current ISO week
-- ----------------------------------------------------------------------------
create or replace view public.v_weekly_volume as
select
  s.user_id,
  coalesce(sum(s.total_volume), 0) as weekly_volume,
  count(*)                          as sessions_this_week
from public.workout_sessions s
where s.finished_at is not null
  and s.finished_at >= date_trunc('week', now())
group by s.user_id;

-- ----------------------------------------------------------------------------
-- get_public_top5() : anonymous-callable, returns top 5 weekly volume
-- ----------------------------------------------------------------------------
create or replace function public.get_public_top5()
returns table (
  rank          int,
  user_id       uuid,
  username      text,
  display_name  text,
  avatar_url    text,
  weekly_volume numeric
)
language sql
security definer
stable
set search_path = public
as $$
  select
    row_number() over (order by v.weekly_volume desc)::int as rank,
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    v.weekly_volume
  from public.v_weekly_volume v
  join public.profiles p on p.id = v.user_id
  order by v.weekly_volume desc
  limit 5;
$$;

grant execute on function public.get_public_top5() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- get_full_leaderboard(scope, region) : auth-only, full ranks
-- ----------------------------------------------------------------------------
create or replace function public.get_full_leaderboard(p_scope text default 'global', p_region text default null)
returns table (
  rank          int,
  user_id       uuid,
  username      text,
  display_name  text,
  avatar_url    text,
  weekly_volume numeric,
  is_self       boolean
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_scope = 'friends' then
    -- volume of users in any squad I belong to
    return query
    with my_squads as (
      select squad_id from public.squad_members where user_id = auth.uid()
    ),
    members as (
      select distinct user_id from public.squad_members
      where squad_id in (select squad_id from my_squads)
      union
      select auth.uid() as user_id
    )
    select
      row_number() over (order by v.weekly_volume desc nulls last)::int,
      p.id, p.username, p.display_name, p.avatar_url,
      coalesce(v.weekly_volume, 0),
      (p.id = auth.uid())
    from members m
    join public.profiles p on p.id = m.user_id
    left join public.v_weekly_volume v on v.user_id = m.user_id
    order by coalesce(v.weekly_volume, 0) desc;
  else
    -- global, optionally region-filtered
    return query
    select
      row_number() over (order by v.weekly_volume desc)::int,
      p.id, p.username, p.display_name, p.avatar_url,
      v.weekly_volume,
      (p.id = auth.uid())
    from public.v_weekly_volume v
    join public.profiles p on p.id = v.user_id
    where (p_region is null or p.region = p_region)
    order by v.weekly_volume desc
    limit 100;
  end if;
end;
$$;

grant execute on function public.get_full_leaderboard(text, text) to authenticated;

-- ----------------------------------------------------------------------------
-- get_squad_leaderboard(p_squad_id)
-- ----------------------------------------------------------------------------
create or replace function public.get_squad_leaderboard(p_squad_id uuid)
returns table (
  rank          int,
  user_id       uuid,
  username      text,
  display_name  text,
  avatar_url    text,
  weekly_volume numeric,
  is_self       boolean
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Caller must be a member
  if not exists (
    select 1 from public.squad_members
    where squad_id = p_squad_id and user_id = auth.uid()
  ) then
    raise exception 'Not a squad member';
  end if;

  return query
  select
    row_number() over (order by coalesce(v.weekly_volume,0) desc)::int,
    p.id, p.username, p.display_name, p.avatar_url,
    coalesce(v.weekly_volume,0),
    (p.id = auth.uid())
  from public.squad_members sm
  join public.profiles p on p.id = sm.user_id
  left join public.v_weekly_volume v on v.user_id = sm.user_id
  where sm.squad_id = p_squad_id
  order by coalesce(v.weekly_volume,0) desc;
end;
$$;

grant execute on function public.get_squad_leaderboard(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- finish_session(p_session_id) : marks session finished, updates streak,
-- evaluates badges, updates challenge progress. Returns awarded badge slugs.
-- ----------------------------------------------------------------------------
create or replace function public.finish_session(p_session_id uuid)
returns table (awarded_badges text[])
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_total_vol numeric;
  v_session_count int;
  v_streak int;
  v_lifetime numeric;
  v_awarded text[] := array[]::text[];
  v_inserted int;
begin
  select user_id, total_volume into v_user, v_total_vol
  from public.workout_sessions
  where id = p_session_id;

  if v_user is null then
    raise exception 'Session not found';
  end if;
  if v_user <> auth.uid() then
    raise exception 'Not authorised';
  end if;

  update public.workout_sessions
  set finished_at = coalesce(finished_at, now())
  where id = p_session_id;

  select current_streak into v_streak
  from public.recompute_streak(v_user);

  select count(*) into v_session_count
  from public.workout_sessions
  where user_id = v_user and finished_at is not null;

  if v_session_count >= 1 then
    with ins as (
      insert into public.user_badges (user_id, badge_id)
      select v_user, b.id from public.badges b where b.slug = 'first_workout'
      on conflict do nothing
      returning 1
    ) select count(*) into v_inserted from ins;
    if v_inserted > 0 then v_awarded := array_append(v_awarded, 'first_workout'); end if;
  end if;

  if v_streak >= 7 then
    with ins as (
      insert into public.user_badges (user_id, badge_id)
      select v_user, b.id from public.badges b where b.slug = 'streak_7'
      on conflict do nothing
      returning 1
    ) select count(*) into v_inserted from ins;
    if v_inserted > 0 then v_awarded := array_append(v_awarded, 'streak_7'); end if;
  end if;

  if v_streak >= 30 then
    with ins as (
      insert into public.user_badges (user_id, badge_id)
      select v_user, b.id from public.badges b where b.slug = 'streak_30'
      on conflict do nothing
      returning 1
    ) select count(*) into v_inserted from ins;
    if v_inserted > 0 then v_awarded := array_append(v_awarded, 'streak_30'); end if;
  end if;

  select coalesce(sum(total_volume),0) into v_lifetime
  from public.workout_sessions
  where user_id = v_user and finished_at is not null;

  if v_lifetime >= 10000 then
    with ins as (
      insert into public.user_badges (user_id, badge_id)
      select v_user, b.id from public.badges b where b.slug = 'volume_10000'
      on conflict do nothing
      returning 1
    ) select count(*) into v_inserted from ins;
    if v_inserted > 0 then v_awarded := array_append(v_awarded, 'volume_10000'); end if;
  end if;

  if v_lifetime >= 100000 then
    with ins as (
      insert into public.user_badges (user_id, badge_id)
      select v_user, b.id from public.badges b where b.slug = 'volume_100000'
      on conflict do nothing
      returning 1
    ) select count(*) into v_inserted from ins;
    if v_inserted > 0 then v_awarded := array_append(v_awarded, 'volume_100000'); end if;
  end if;

  -- Update challenge progress for `volume`-metric challenges
  update public.challenge_participants cp
  set progress = progress + coalesce(v_total_vol, 0),
      completed_at = case when cp.progress + coalesce(v_total_vol,0) >= c.target and cp.completed_at is null then now() else cp.completed_at end
  from public.challenges c
  where cp.challenge_id = c.id
    and cp.user_id = v_user
    and c.metric = 'volume'
    and now() between c.starts_at and c.ends_at;

  -- Update challenge progress for `sessions`-metric challenges
  update public.challenge_participants cp
  set progress = progress + 1,
      completed_at = case when cp.progress + 1 >= c.target and cp.completed_at is null then now() else cp.completed_at end
  from public.challenges c
  where cp.challenge_id = c.id
    and cp.user_id = v_user
    and c.metric = 'sessions'
    and now() between c.starts_at and c.ends_at;

  return query select v_awarded;
end;
$$;

grant execute on function public.finish_session(uuid) to authenticated;
