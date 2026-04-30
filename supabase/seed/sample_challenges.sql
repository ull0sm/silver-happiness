-- Optional: weekly sample challenges. Run any time you want fresh content.
insert into public.challenges (title, description, metric, target, starts_at, ends_at, badge_slug)
values
  ('Hell Week: 100K Volume',
   'Lift 100,000 kg total volume this week.',
   'volume', 100000,
   date_trunc('week', now()),
   date_trunc('week', now()) + interval '7 days',
   null),
  ('Iron Five',
   'Complete 5 workouts this week.',
   'sessions', 5,
   date_trunc('week', now()),
   date_trunc('week', now()) + interval '7 days',
   null),
  ('Streak Holder',
   'Reach a 14-day streak.',
   'streak', 14,
   now(),
   now() + interval '60 days',
   'streak_30')
on conflict do nothing;
