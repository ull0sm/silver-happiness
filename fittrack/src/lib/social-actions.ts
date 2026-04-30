"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSquad(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: squad, error } = await supabase
    .from("squads")
    .insert({ name: name.toUpperCase(), created_by: user.id })
    .select("id, invite_code")
    .single();

  if (error) return { error: error.message };

  // Auto-join as owner
  await supabase.from("squad_members").insert({
    squad_id: squad.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/dashboard/social");
  return { success: true, inviteCode: squad.invite_code };
}

export async function joinSquad(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: squad, error } = await supabase
    .from("squads")
    .select("id, name")
    .eq("invite_code", inviteCode.toUpperCase())
    .single();

  if (error || !squad) return { error: "Invalid invite code" };

  const { error: joinError } = await supabase
    .from("squad_members")
    .upsert({ squad_id: squad.id, user_id: user.id, role: "member" },
             { onConflict: "squad_id,user_id" });

  if (joinError) return { error: joinError.message };

  revalidatePath("/dashboard/social");
  return { success: true, squadName: squad.name };
}

export async function getLeaderboard(metric: "volume" | "streak" | "sessions" = "volume") {
  const supabase = await createClient();

  if (metric === "streak") {
    const { data } = await supabase
      .from("streaks")
      .select("current_streak, user_id, profiles(display_name, username)")
      .order("current_streak", { ascending: false })
      .limit(10);
    return data ?? [];
  }

  if (metric === "sessions") {
    // Count sessions per user this week
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data } = await supabase
      .from("workout_sessions")
      .select("user_id, profiles(display_name, username)")
      .gte("started_at", weekAgo)
      .limit(100);

    if (!data) return [];
    const counts: Record<string, { count: number; name: string }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((s: any) => {
      const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
      const name = p?.display_name || p?.username || "ANON";
      if (!counts[s.user_id]) counts[s.user_id] = { count: 0, name };
      counts[s.user_id].count++;
    });
    return Object.entries(counts)
      .map(([uid, v]) => ({ user_id: uid, score: v.count, name: v.name }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  // Default: weekly volume
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data } = await supabase
    .from("workout_sessions")
    .select("user_id, total_volume_kg, profiles(display_name, username)")
    .gte("started_at", weekAgo)
    .limit(500);

  if (!data) return [];
  const volumes: Record<string, { volume: number; name: string }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((s: any) => {
    const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const name = p?.display_name || p?.username || "ANON";
    if (!volumes[s.user_id]) volumes[s.user_id] = { volume: 0, name };
    volumes[s.user_id].volume += s.total_volume_kg ?? 0;
  });
  return Object.entries(volumes)
    .map(([uid, v]) => ({ user_id: uid, score: Math.round(v.volume), name: v.name }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
