"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSquad(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!name.trim()) throw new Error("Name required");

  const { data: squad, error } = await supabase
    .from("squads")
    .insert({ name: name.trim(), owner_id: user.id })
    .select("id")
    .single();
  if (error || !squad) throw new Error(error?.message ?? "Failed");

  await supabase.from("squad_members").insert({ squad_id: squad.id, user_id: user.id });
  revalidatePath("/squads");
  redirect(`/squads/${squad.id}`);
}

export async function joinSquadByCode(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = inviteCode.trim().toLowerCase();
  if (!code) throw new Error("Code required");

  const { data: squad } = await supabase
    .from("squads")
    .select("id")
    .eq("invite_code", code)
    .single();
  if (!squad) throw new Error("Invalid invite code");

  await supabase
    .from("squad_members")
    .insert({ squad_id: squad.id, user_id: user.id })
    .select();
  // ignore unique-violation duplicate joins silently
  revalidatePath("/squads");
  redirect(`/squads/${squad.id}`);
}

export async function leaveSquad(squadId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("squad_members")
    .delete()
    .eq("squad_id", squadId)
    .eq("user_id", user.id);
  revalidatePath("/squads");
  redirect("/squads");
}

export async function joinChallenge(challengeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("challenge_participants")
    .insert({ challenge_id: challengeId, user_id: user.id })
    .select();
  revalidatePath("/compete");
}
