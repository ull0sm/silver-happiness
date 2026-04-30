import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Heatmap } from "@/components/analytics/Heatmap";
import { StreakCard } from "@/components/analytics/StreakCard";
import { BodyStatsPanel } from "@/components/analytics/BodyStatsPanel";
import { BadgeGrid } from "@/components/analytics/BadgeGrid";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Analytics — IRON TRACK" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    { data: sessions },
    { data: streak },
    { data: bodyStats },
    { data: badges },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("started_at, total_volume")
      .eq("user_id", user.id)
      .not("finished_at", "is", null)
      .gte("started_at", monthStart.toISOString())
      .lte("started_at", monthEnd.toISOString())
      .order("started_at", { ascending: true }),
    supabase
      .from("streaks")
      .select("current_streak, longest_streak, freeze_tokens, last_activity_date")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("body_stats")
      .select("recorded_on, weight, body_fat, measurements")
      .eq("user_id", user.id)
      .order("recorded_on", { ascending: true })
      .limit(60),
    supabase
      .from("user_badges")
      .select("earned_at, badges(slug, name, description, icon)")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false }),
    supabase.from("profiles").select("weight_unit").eq("id", user.id).single(),
  ]);

  const allBadges = (await supabase.from("badges").select("slug, name, description, icon")).data ?? [];
  const earnedSlugs = new Set(
    (badges ?? [])
      .map((r) => (r.badges as unknown as { slug: string } | null)?.slug)
      .filter(Boolean) as string[],
  );

  return (
    <div className="p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-xl font-display-xl text-white uppercase italic tracking-tighter">
          ANALYTICS BATTLEGROUND
        </h1>
        <p className="text-body-lg font-body-lg text-tertiary uppercase tracking-widest border-l-2 border-primary-container pl-4">
          Measure the suffering. Track the gains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4">
          <StreakCard
            current={streak?.current_streak ?? 0}
            longest={streak?.longest_streak ?? 0}
            freezeTokens={streak?.freeze_tokens ?? 0}
            lastActivity={streak?.last_activity_date ?? null}
          />
        </div>
        <div className="md:col-span-8">
          <Heatmap sessions={sessions ?? []} year={today.getFullYear()} month={today.getMonth()} />
        </div>

        <div className="md:col-span-12">
          <BodyStatsPanel
            initial={(bodyStats ?? []).map((b) => ({
              recorded_on: b.recorded_on,
              weight: b.weight !== null ? Number(b.weight) : null,
              body_fat: b.body_fat !== null ? Number(b.body_fat) : null,
              measurements: (b.measurements as Record<string, number>) ?? {},
            }))}
            weightUnit={(profile?.weight_unit as "kg" | "lb") ?? "kg"}
          />
        </div>

        <div className="md:col-span-12">
          <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-stack-sm">
            <h2 className="font-label-bold text-label-bold uppercase text-white tracking-widest flex items-center gap-2">
              <Icon name="military_tech" className="text-primary-container" />
              ACHIEVEMENTS
            </h2>
            <BadgeGrid all={allBadges} earnedSlugs={earnedSlugs} />
          </div>
        </div>
      </div>
    </div>
  );
}
