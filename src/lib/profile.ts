"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(input: {
  display_name?: string;
  username?: string;
  weight_unit?: "kg" | "lb";
  region?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.display_name !== undefined) patch.display_name = input.display_name;
  if (input.username !== undefined) patch.username = input.username;
  if (input.weight_unit !== undefined) patch.weight_unit = input.weight_unit;
  if (input.region !== undefined) patch.region = input.region;

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
