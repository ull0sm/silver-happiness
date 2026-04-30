// Hand-maintained Supabase types. Regenerate with `supabase gen types typescript --project-id <ref>`
// once you connect your project.

export type WeightUnit = "kg" | "lb";
export type WorkoutTemplateType = "curated" | "custom";
export type WorkoutSplit = "PPL" | "Bro" | "FullBody" | "UpperLower" | "Other";
export type ChallengeMetric = "volume" | "reps" | "sessions" | "streak";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  weight_unit: WeightUnit;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string | null;
  category: string | null;
  level: string | null;
  force: string | null;
  mechanic: string | null;
  instructions: string[];
  image_urls: string[];
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  type: WorkoutTemplateType;
  split: WorkoutSplit | null;
  days_per_week: number | null;
  owner_id: string | null;
  created_at: string;
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  day_index: number;
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  total_volume: number;
  notes: string | null;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  position: number;
}

export interface SessionSet {
  id: string;
  session_exercise_id: string;
  set_index: number;
  weight: number;
  reps: number;
  is_warmup: boolean;
  rpe: number | null;
  completed_at: string | null;
}

export interface BodyStat {
  id: string;
  user_id: string;
  recorded_on: string;
  weight: number | null;
  body_fat: number | null;
  measurements: Record<string, number>;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  freeze_tokens: number;
  last_activity_date: string | null;
}

export interface Squad {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface SquadMember {
  squad_id: string;
  user_id: string;
  joined_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  metric: ChallengeMetric;
  target: number;
  exercise_id: string | null;
  starts_at: string;
  ends_at: string;
  badge_slug: string | null;
}

export interface ChallengeParticipant {
  challenge_id: string;
  user_id: string;
  progress: number;
  completed_at: string | null;
  joined_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: Record<string, unknown>;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ExerciseFavorite {
  user_id: string;
  exercise_id: string;
  created_at: string;
}

// RPC return shapes
export interface LeaderboardRow {
  rank: number;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  weekly_volume: number;
  is_self?: boolean;
}

export interface OverloadSuggestion {
  last_weight: number | null;
  last_reps: number | null;
  suggested_weight: number | null;
  suggested_reps: number | null;
}
