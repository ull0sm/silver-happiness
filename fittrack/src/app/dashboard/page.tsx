import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "ATHLETE";

  // Stats queries (safe defaults if tables don't exist yet)
  const { count: totalSessions } = await supabase
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("user_id", user?.id)
    .single();

  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("id, name, started_at, duration_seconds, total_volume_kg")
    .eq("user_id", user?.id)
    .order("started_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-6 md:p-margin-desktop animate-fade-in">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="border-b-2 border-surface-container-high pb-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
        <p className="font-black text-label-bold text-primary-container uppercase tracking-widest italic mb-1">
          Welcome back
        </p>
        <h1 className="text-[clamp(36px,5vw,60px)] font-black italic uppercase text-on-background leading-none tracking-tighter">
          {displayName.toUpperCase()}
        </h1>
      </div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-8">
        {[
          { label: "Total Sessions", value: totalSessions ?? 0, icon: "fitness_center", accent: true },
          { label: "Current Streak", value: `${streak?.current_streak ?? 0}d`, icon: "local_fire_department", accent: false },
          { label: "Best Streak",    value: `${streak?.longest_streak ?? 0}d`, icon: "emoji_events", accent: false },
          { label: "Freeze Tokens",  value: "3",   icon: "ac_unit", accent: false },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.accent ? "bg-primary-container text-black" : "bg-surface-container-high border-2 border-black text-on-surface"} p-6 flex flex-col gap-2`}
          >
            <span className="material-symbols-outlined text-xl opacity-70" style={{ fontVariationSettings: "'FILL' 1" }}>
              {stat.icon}
            </span>
            <div className="text-3xl font-black italic leading-none">{stat.value}</div>
            <div className={`text-xs font-black italic uppercase tracking-widest ${stat.accent ? "text-black/70" : "text-on-surface-variant"}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-black text-2xl italic uppercase text-on-surface mb-4 border-b-2 border-surface-container-high pb-2">
          QUICK DEPLOY
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Link
            href="/dashboard/workouts"
            className="group bg-surface-container-high border-2 border-black border-t-primary-container border-t-4 p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_circle
            </span>
            <div>
              <h3 className="font-black italic uppercase text-on-background text-lg">Start Workout</h3>
              <p className="text-on-surface-variant text-sm mt-1">Pick a plan or build your own routine</p>
            </div>
            <span className="material-symbols-outlined text-primary-container group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>

          <Link
            href="/dashboard/exercises"
            className="group bg-surface-container-high border-2 border-black p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_gymnastics
            </span>
            <div>
              <h3 className="font-black italic uppercase text-on-background text-lg">Exercise Library</h3>
              <p className="text-on-surface-variant text-sm mt-1">Browse 500+ exercises with form tips</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all">arrow_forward</span>
          </Link>

          <Link
            href="/dashboard/progress"
            className="group bg-surface-container-high border-2 border-black p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
            <div>
              <h3 className="font-black italic uppercase text-on-background text-lg">View Progress</h3>
              <p className="text-on-surface-variant text-sm mt-1">Calendar, streaks, body stats & charts</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* ── Recent Sessions ─────────────────────────────── */}
      <div>
        <div className="flex items-end justify-between border-b-2 border-surface-container-high pb-2 mb-4">
          <h2 className="font-black text-2xl italic uppercase text-on-surface">RECENT CARNAGE</h2>
          <Link href="/dashboard/workouts" className="text-primary-container font-black text-xs italic uppercase tracking-widest hover:text-on-surface transition-colors">
            VIEW ALL
          </Link>
        </div>

        {recentSessions && recentSessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentSessions.map((session) => {
              const date = new Date(session.started_at);
              const durMin = session.duration_seconds ? Math.round(session.duration_seconds / 60) : null;
              return (
                <div
                  key={session.id}
                  className="bg-black border-2 border-surface-container-high p-4 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-primary-container transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container-high border-2 border-black flex flex-col items-center justify-center text-center shrink-0">
                      <span className="font-black text-2xl text-primary-container leading-none">{date.getDate()}</span>
                      <span className="font-black text-[10px] text-on-surface-variant uppercase leading-none mt-1">
                        {date.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-xl italic uppercase text-on-surface group-hover:text-primary-container transition-colors">
                        {session.name || "WORKOUT SESSION"}
                      </h4>
                      <div className="font-black text-xs text-on-surface-variant uppercase mt-1 tracking-wide">
                        {session.total_volume_kg ? <><span className="text-on-surface">VOL:</span> {session.total_volume_kg}KG</> : ""}
                        {durMin ? <><span className="mx-2">•</span><span className="text-on-surface">TIME:</span> {durMin}M</> : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 md:mt-0">
                    {[1, 1, 1, 0.4, 0.2].map((o, i) => (
                      <div key={i} className="w-2 h-6 bg-primary-container" style={{ opacity: o }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-high border-2 border-dashed border-surface-container-highest p-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">fitness_center</span>
            <p className="font-black italic uppercase text-on-surface-variant text-lg">No sessions yet.</p>
            <p className="text-on-surface-variant text-sm mt-2">Start your first workout to track your progress.</p>
            <Link
              href="/dashboard/workouts"
              className="mt-6 bg-primary-container text-black font-black italic uppercase px-8 py-3 hover:bg-secondary-container transition-colors text-sm tracking-widest"
            >
              Start Workout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
