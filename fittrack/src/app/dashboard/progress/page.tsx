import { createClient } from "@/lib/supabase/server";
import { ProgressClient } from "./progress-client";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Streak data
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Last 6 months of sessions for heatmap
  const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("started_at, total_volume_kg, duration_seconds, name")
    .eq("user_id", user?.id)
    .gte("started_at", sixMonthsAgo)
    .order("started_at", { ascending: true });

  // Body stats (last 12 entries)
  const { data: bodyStats } = await supabase
    .from("body_stats")
    .select("*")
    .eq("user_id", user?.id)
    .order("logged_at", { ascending: true })
    .limit(12);

  // Weekly volume (last 4 weeks)
  const { data: weeklyVolume } = await supabase
    .from("workout_sessions")
    .select("started_at, total_volume_kg")
    .eq("user_id", user?.id)
    .gte("started_at", new Date(Date.now() - 28 * 86400000).toISOString())
    .order("started_at");

  return (
    <ProgressClient
      streak={streak}
      sessions={sessions ?? []}
      bodyStats={bodyStats ?? []}
      weeklyVolume={weeklyVolume ?? []}
    />
  );
}
