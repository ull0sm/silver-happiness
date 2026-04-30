import { createClient } from "@/lib/supabase/server";
import { SocialClient } from "./social-client";

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Weekly volume leaderboard
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("user_id, total_volume_kg, profiles(display_name, username, id)")
    .gte("started_at", weekAgo)
    .limit(500);

  // Aggregate volume per user
  const volumeMap: Record<string, { volume: number; name: string; uid: string }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sessions ?? []).forEach((s: any) => {
    const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const name = p?.display_name || p?.username || "ANON";
    if (!volumeMap[s.user_id]) volumeMap[s.user_id] = { volume: 0, name, uid: s.user_id };
    volumeMap[s.user_id].volume += s.total_volume_kg ?? 0;
  });
  const leaderboard = Object.values(volumeMap)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .map((v, i) => ({ rank: i + 1, name: v.name, score: Math.round(v.volume), uid: v.uid }));

  // User's squad
  const { data: squadMembership } = await supabase
    .from("squad_members")
    .select("squads(id, name, invite_code), role")
    .eq("user_id", user?.id)
    .limit(1)
    .maybeSingle();

  let squadMembers: { name: string; score: number; rank: number }[] = [];
  const squad = (squadMembership as { squads: { id: string; name: string; invite_code: string } | null; role: string } | null)?.squads ?? null;

  if (squad) {
    const { data: members } = await supabase
      .from("squad_members")
      .select("user_id, profiles(display_name, username)")
      .eq("squad_id", squad.id);

    const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
    if (memberIds.length > 0) {
      const { data: mSessions } = await supabase
        .from("workout_sessions")
        .select("user_id, total_volume_kg")
        .in("user_id", memberIds)
        .gte("started_at", weekAgo);

      const mVolume: Record<string, number> = {};
      (mSessions ?? []).forEach((s: { user_id: string; total_volume_kg: number | null }) => {
        mVolume[s.user_id] = (mVolume[s.user_id] ?? 0) + (s.total_volume_kg ?? 0);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    squadMembers = (members ?? [])
        .map((m: any) => ({
          name: (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles)?.display_name
             || (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles)?.username
             || "ANON",
          score: Math.round(mVolume[m.user_id] ?? 0),
          uid: m.user_id,
        }))
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .map((m: { name: string; score: number }, i: number) => ({ ...m, rank: i + 1 }));
    }
  }

  // Active challenges (static for now)
  const challenges = [
    { id: "1", title: "HELL WEEK: 10T LIFTED", metric: "volume", target: 10000, current: 0, ends: "Sunday" },
    { id: "2", title: "7-DAY STREAK", metric: "streak", target: 7, current: 0, ends: "Sunday" },
    { id: "3", title: "20 SESSIONS MONTH", metric: "sessions", target: 20, current: 0, ends: "May 31" },
  ];

  return (
    <SocialClient
      leaderboard={leaderboard}
      currentUserId={user?.id ?? ""}
      squad={squad}
      squadMembers={squadMembers}
      challenges={challenges}
    />
  );
}
