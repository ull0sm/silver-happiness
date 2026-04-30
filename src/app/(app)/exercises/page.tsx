import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";

export const metadata = { title: "Exercise Library — IRON TRACK" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ muscle?: string; equipment?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export default async function ExercisesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("exercises")
    .select("id, name, primary_muscles, secondary_muscles, equipment, category, image_urls, is_custom", {
      count: "exact",
    })
    .order("is_custom", { ascending: false })
    .order("name", { ascending: true })
    .range(from, to);

  if (params.muscle) q = q.contains("primary_muscles", [params.muscle.toLowerCase()]);
  if (params.equipment) q = q.eq("equipment", params.equipment);
  if (params.q) q = q.ilike("name", `%${params.q}%`);

  const { data: exercises, count } = await q;

  const { data: favs } = await supabase
    .from("exercise_favorites")
    .select("exercise_id")
    .eq("user_id", user.id);
  const favSet = new Set((favs ?? []).map((f) => f.exercise_id));

  return (
    <ExerciseLibrary
      exercises={(exercises ?? []).map((e) => ({
        ...e,
        is_favorite: favSet.has(e.id),
      }))}
      total={count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      filters={{
        muscle: params.muscle ?? null,
        equipment: params.equipment ?? null,
        q: params.q ?? "",
      }}
    />
  );
}
