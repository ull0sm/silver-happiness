"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function upsertBodyStat(input: {
  recorded_on: string; // YYYY-MM-DD
  weight?: number | null;
  body_fat?: number | null;
  measurements?: Record<string, number>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("body_stats").upsert(
    {
      user_id: user.id,
      recorded_on: input.recorded_on,
      weight: input.weight ?? null,
      body_fat: input.body_fat ?? null,
      measurements: input.measurements ?? {},
    },
    { onConflict: "user_id,recorded_on" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/analytics");
}

export async function deleteBodyStat(recordedOn: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("body_stats")
    .delete()
    .eq("user_id", user.id)
    .eq("recorded_on", recordedOn);
  if (error) throw new Error(error.message);
  revalidatePath("/analytics");
}

export async function consumeFreezeToken() {
  // Optional manual freeze token usage (otherwise the streak fn auto-consumes).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: streak } = await supabase
    .from("streaks")
    .select("freeze_tokens")
    .eq("user_id", user.id)
    .single();
  if (!streak || streak.freeze_tokens <= 0) return;

  await supabase
    .from("streaks")
    .update({ freeze_tokens: streak.freeze_tokens - 1 })
    .eq("user_id", user.id);
  revalidatePath("/analytics");
}
