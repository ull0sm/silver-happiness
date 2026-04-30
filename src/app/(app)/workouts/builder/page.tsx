import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutBuilder } from "@/components/workouts/WorkoutBuilder";

export const metadata = { title: "Custom Forge — IRON TRACK" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function BuilderPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Initial exercise pool — preload first 60 exercises; client can search the rest.
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, primary_muscles, category")
    .order("name")
    .limit(60);

  let initialTemplate: { id: string; name: string; description: string | null; split: string | null } | null = null;
  let initialExercises: {
    exercise_id: string;
    name: string;
    primary_muscles: string[];
    target_sets: number;
    target_reps: string;
    rest_seconds: number;
  }[] = [];

  if (id) {
    const { data: tpl } = await supabase
      .from("workout_templates")
      .select("id, name, description, split")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (tpl) {
      initialTemplate = tpl;
      const { data: tex } = await supabase
        .from("template_exercises")
        .select("exercise_id, position, target_sets, target_reps, rest_seconds, exercises(name, primary_muscles)")
        .eq("template_id", tpl.id)
        .order("position", { ascending: true });
      initialExercises = (tex ?? []).map((t) => {
        const ex = t.exercises as unknown as { name: string; primary_muscles: string[] } | null;
        return {
          exercise_id: t.exercise_id,
          name: ex?.name ?? "Exercise",
          primary_muscles: ex?.primary_muscles ?? [],
          target_sets: t.target_sets,
          target_reps: t.target_reps,
          rest_seconds: t.rest_seconds,
        };
      });
    }
  }

  return (
    <div className="p-6 md:p-margin-desktop">
      <div className="border-b-2 border-surface-container-high pb-stack-md mb-stack-md">
        <h1 className="font-display-xl text-display-xl text-white uppercase italic">CUSTOM FORGE</h1>
        <p className="font-body-lg text-body-lg text-tertiary-fixed-dim mt-2 uppercase tracking-wide">
          Drag & drop. Build your routine set by set.
        </p>
      </div>
      <WorkoutBuilder
        initialPool={(exercises ?? []).map((e) => ({
          id: e.id,
          name: e.name,
          primary_muscles: e.primary_muscles ?? [],
          category: e.category,
        }))}
        initialTemplate={initialTemplate}
        initialExercises={initialExercises}
      />
    </div>
  );
}
