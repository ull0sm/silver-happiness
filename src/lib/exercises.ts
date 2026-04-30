"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteExercise(exerciseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("exercise_favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("exercise_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId);
  } else {
    await supabase.from("exercise_favorites").insert({
      user_id: user.id,
      exercise_id: exerciseId,
    });
  }
  revalidatePath("/exercises");
}

export async function createCustomExercise(input: {
  name: string;
  primary_muscle: string;
  equipment?: string;
  instructions?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = `custom-${user.id.slice(0, 8)}-${Date.now()}-${input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30)}`;

  const { error } = await supabase.from("exercises").insert({
    slug,
    name: input.name,
    primary_muscles: [input.primary_muscle],
    equipment: input.equipment ?? null,
    instructions: input.instructions ? [input.instructions] : [],
    is_custom: true,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/exercises");
}

/** Returns up to 3 swap suggestions for the same primary muscle group. */
export async function getSwapSuggestions(exerciseId: string) {
  const supabase = await createClient();
  const { data: ex } = await supabase
    .from("exercises")
    .select("primary_muscles")
    .eq("id", exerciseId)
    .single();
  if (!ex) return [];
  const muscle = ex.primary_muscles?.[0];
  if (!muscle) return [];
  const { data } = await supabase
    .from("exercises")
    .select("id, name, primary_muscles, equipment")
    .neq("id", exerciseId)
    .contains("primary_muscles", [muscle])
    .limit(3);
  return data ?? [];
}
