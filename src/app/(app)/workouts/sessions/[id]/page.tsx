import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActiveWorkout, type ActiveExercise } from "@/components/workouts/ActiveWorkout";

export const metadata = { title: "Active Workout — IRON TRACK" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ActiveSessionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, name, started_at, finished_at, total_volume, user_id, template_id")
    .eq("id", id)
    .single();
  if (!session || session.user_id !== user.id) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_unit")
    .eq("id", user.id)
    .single();

  const { data: rows } = await supabase
    .from("session_exercises")
    .select(
      "id, position, exercise_id, exercises(name, primary_muscles, category), session_sets(id, set_index, weight, reps, is_warmup, completed_at)",
    )
    .eq("session_id", id)
    .order("position", { ascending: true });

  // Fetch overload suggestions for each exercise (in parallel)
  const overloadEntries = await Promise.all(
    (rows ?? []).map(async (row) => {
      const { data } = await supabase.rpc("suggest_overload", {
        p_user_id: user.id,
        p_exercise_id: row.exercise_id,
      });
      return [row.exercise_id, data?.[0] ?? null] as const;
    }),
  );
  const overloadMap = Object.fromEntries(overloadEntries);

  const exercises: ActiveExercise[] = (rows ?? []).map((r) => {
    const ex = r.exercises as unknown as { name: string; primary_muscles: string[]; category: string | null } | null;
    const sets = (r.session_sets ?? []).slice().sort((a, b) => a.set_index - b.set_index);
    return {
      session_exercise_id: r.id,
      exercise_id: r.exercise_id,
      name: ex?.name ?? "Exercise",
      primary_muscles: ex?.primary_muscles ?? [],
      category: ex?.category ?? null,
      sets: sets.map((s) => ({
        id: s.id,
        set_index: s.set_index,
        weight: Number(s.weight),
        reps: s.reps,
        is_warmup: s.is_warmup,
        completed: !!s.completed_at,
      })),
      overload: overloadMap[r.exercise_id]
        ? {
            last_weight: Number(overloadMap[r.exercise_id]!.last_weight) || null,
            last_reps: overloadMap[r.exercise_id]!.last_reps ?? null,
            suggested_weight:
              Number(overloadMap[r.exercise_id]!.suggested_weight) || null,
            suggested_reps: overloadMap[r.exercise_id]!.suggested_reps ?? null,
          }
        : null,
    };
  });

  return (
    <ActiveWorkout
      session={{
        id: session.id,
        name: session.name,
        started_at: session.started_at,
        finished_at: session.finished_at,
        total_volume: Number(session.total_volume) || 0,
      }}
      exercises={exercises}
      weightUnit={(profile?.weight_unit as "kg" | "lb") ?? "kg"}
    />
  );
}
