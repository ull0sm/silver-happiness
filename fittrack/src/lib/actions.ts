"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type SetEntry = {
  exercise_id: string;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
};

type SaveSessionInput = {
  plan_name: string;
  duration_seconds: number;
  sets: SetEntry[];
};

export async function saveWorkoutSession(input: SaveSessionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Calculate total volume
  const totalVolume = input.sets.reduce((sum, s) => {
    return sum + (s.weight_kg ?? 0) * (s.reps ?? 0);
  }, 0);

  // Insert session
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      name: input.plan_name,
      started_at: new Date(Date.now() - input.duration_seconds * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: input.duration_seconds,
      total_volume_kg: totalVolume,
    })
    .select("id")
    .single();

  if (sessionError || !session) return { error: sessionError?.message ?? "Failed to save session" };

  // Insert sets
  const setsToInsert = input.sets.map((s) => ({
    session_id: session.id,
    exercise_id: s.exercise_id || null,
    set_number: s.set_number,
    weight_kg: s.weight_kg,
    reps: s.reps,
  }));

  const { error: setsError } = await supabase
    .from("session_sets")
    .insert(setsToInsert);

  if (setsError) return { error: setsError.message };

  // Update streak
  await updateStreak(supabase, user.id);

  revalidatePath("/dashboard");
  return { success: true, sessionId: session.id };
}

async function updateStreak(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      freeze_tokens: 3,
      last_workout_date: today,
    });
    return;
  }

  const lastDate = existing.last_workout_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = existing.current_streak;
  if (lastDate === today) return; // Already logged today
  if (lastDate === yesterday) {
    newStreak = existing.current_streak + 1;
  } else {
    newStreak = 1; // Streak broken
  }

  await supabase.from("streaks").update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, existing.longest_streak),
    last_workout_date: today,
  }).eq("user_id", userId);
}

export async function getExerciseHistory(exerciseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("session_sets")
    .select(`
      weight_kg, reps, is_pr, logged_at,
      workout_sessions!inner(user_id, started_at, name)
    `)
    .eq("workout_sessions.user_id", user.id)
    .eq("exercise_id", exerciseId)
    .order("logged_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function logBodyStats(stats: {
  weight_kg?: number;
  body_fat_pct?: number;
  chest_cm?: number;
  waist_cm?: number;
  arms_cm?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("body_stats")
    .upsert({ user_id: user.id, ...stats, logged_at: new Date().toISOString().split("T")[0] },
             { onConflict: "user_id,logged_at" });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/progress");
  return { success: true };
}

export async function useFreeze() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!streak || streak.freeze_tokens < 1) return { error: "No freeze tokens available" };

  const today = new Date().toISOString().split("T")[0];
  await supabase.from("streaks").update({
    freeze_tokens: streak.freeze_tokens - 1,
    last_workout_date: today, // Treat freeze as "worked out today"
  }).eq("user_id", user.id);

  revalidatePath("/dashboard/progress");
  return { success: true };
}
