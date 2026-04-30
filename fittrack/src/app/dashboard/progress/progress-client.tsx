"use client";

import { useState, useTransition } from "react";
import { logBodyStats, useFreeze } from "@/lib/actions";

type Session = { started_at: string; total_volume_kg: number | null; duration_seconds: number | null; name: string | null };
type BodyStat = { logged_at: string; weight_kg: number | null; body_fat_pct: number | null; chest_cm?: number | null; waist_cm?: number | null; arms_cm?: number | null };
type Streak = { current_streak: number; longest_streak: number; freeze_tokens: number; last_workout_date: string | null };

const HEATMAP_COLORS = ["#1c1b1b", "#410000", "#93000a", "#e60000", "#ff5625"];

function getHeatColor(volume: number | null, max: number) {
  if (!volume || volume === 0) return HEATMAP_COLORS[0];
  const pct = volume / max;
  if (pct < 0.2) return HEATMAP_COLORS[1];
  if (pct < 0.5) return HEATMAP_COLORS[2];
  if (pct < 0.8) return HEATMAP_COLORS[3];
  return HEATMAP_COLORS[4];
}

function CalendarHeatmap({ sessions }: { sessions: Session[] }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const monthName = target.toLocaleString("default", { month: "long" });

  // Map sessions to dates
  const volumeMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = new Date(s.started_at).toISOString().split("T")[0];
    volumeMap[d] = (volumeMap[d] ?? 0) + (s.total_volume_kg ?? 0);
  });
  const maxVol = Math.max(1, ...Object.values(volumeMap));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const adjustedFirst = (firstDow === 0 ? 6 : firstDow - 1); // Mon=0

  const cells = [];
  for (let i = 0; i < adjustedFirst; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = now.toISOString().split("T")[0];

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4 md:col-span-8">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          VOLUME HEATMAP
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setMonthOffset((o) => o + 1)} className="text-on-surface-variant hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <span className="font-black text-sm text-on-surface uppercase tracking-widest">{monthName} {year}</span>
          <button onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} disabled={monthOffset === 0} className="text-on-surface-variant hover:text-primary-container disabled:opacity-30 transition-colors">
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {["MON","TUE","WED","THU","FRI","SAT","SUN"].map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-on-surface-variant uppercase py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const vol = volumeMap[dateStr] ?? 0;
          const color = getHeatColor(vol || null, maxVol);
          const isToday = dateStr === today;
          return (
            <div
              key={dateStr}
              title={vol ? `${day}: ${vol.toFixed(0)}kg volume` : `${day}: Rest`}
              className="aspect-square flex items-center justify-center text-[10px] font-black border border-black hover:border-primary-container transition-colors cursor-pointer relative"
              style={{ backgroundColor: color }}
            >
              <span className={vol > 0 ? "text-white" : "text-on-surface-variant"}>{day}</span>
              {isToday && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] font-black text-on-surface-variant uppercase">
        <span>REST</span>
        {HEATMAP_COLORS.map((c) => (
          <div key={c} className="w-3 h-3 border border-black" style={{ backgroundColor: c }} />
        ))}
        <span>WAR</span>
      </div>
    </div>
  );
}

function StreakCard({ streak, onFreeze }: { streak: Streak | null; onFreeze: () => void }) {
  const days = ["M","T","W","T","F","S","S"];
  const currentStreak = streak?.current_streak ?? 0;
  const filledDays = Math.min(7, currentStreak);

  return (
    <div className="bg-surface-container-low border-2 border-black border-t-4 border-t-primary-container p-6 flex flex-col gap-4 md:col-span-4 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          ACTIVE STREAK
        </h2>
        {(streak?.freeze_tokens ?? 0) > 0 && (
          <button
            onClick={onFreeze}
            className="flex items-center gap-1 bg-primary-container text-black text-[10px] font-black uppercase px-2 py-1 hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
            {streak?.freeze_tokens} FREEZE
          </button>
        )}
      </div>
      <div className="flex flex-col items-center py-4">
        <div className="text-[80px] font-black italic text-on-surface leading-none" style={{ textShadow: "0 0 30px rgba(230,0,0,0.4)" }}>
          {currentStreak}
        </div>
        <div className="font-black text-xs text-on-surface-variant uppercase tracking-widest mt-1">DAYS UNBROKEN</div>
      </div>
      {/* Week bar */}
      <div className="flex gap-1 h-3">
        {days.map((_, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: i < filledDays ? "#e60000" : "#2a2a2a" }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-black text-on-surface-variant">
        {days.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="border-t-2 border-surface-container-high pt-3 flex justify-between">
        <div className="text-center">
          <div className="font-black text-xl italic text-on-surface">{streak?.longest_streak ?? 0}</div>
          <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">BEST EVER</div>
        </div>
        <div className="text-center">
          <div className="font-black text-xl italic text-on-surface">{streak?.freeze_tokens ?? 0}</div>
          <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">FREEZE TOKENS</div>
        </div>
      </div>
    </div>
  );
}

function BodyStatsChart({ bodyStats }: { bodyStats: BodyStat[] }) {
  if (bodyStats.length < 2) {
    return (
      <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4 md:col-span-12">
        <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_weight</span>
          PHYSIQUE METRICS
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">show_chart</span>
          <p className="font-black italic uppercase text-on-surface-variant">Log body stats below to see trend lines</p>
        </div>
      </div>
    );
  }

  const weights = bodyStats.map((s) => s.weight_kg ?? 0).filter(Boolean);
  const fats = bodyStats.map((s) => s.body_fat_pct ?? 0).filter(Boolean);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const minF = Math.min(...fats) - 1;
  const maxF = Math.max(...fats) + 1;

  const toPoints = (vals: number[], minVal: number, maxVal: number) =>
    vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * 100;
      const y = 100 - ((v - minVal) / (maxVal - minVal)) * 80 - 10;
      return `${x},${y}`;
    }).join(" ");

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4 md:col-span-12">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_weight</span>
          PHYSIQUE METRICS
        </h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary-container" />
            <span className="text-[10px] font-black uppercase text-on-surface-variant">WEIGHT (KG)</span>
          </div>
          {fats.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-outline-variant border-t border-dashed border-outline" />
              <span className="text-[10px] font-black uppercase text-on-surface-variant">BODY FAT %</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative h-56 border-l-2 border-b-2 border-surface-container-high mt-4 ml-10">
        {/* Y axis labels */}
        <div className="absolute -left-10 inset-y-0 flex flex-col justify-between text-[10px] font-black text-on-surface-variant pb-1">
          <span>{maxW.toFixed(0)}</span>
          <span>{((maxW + minW) / 2).toFixed(0)}</span>
          <span>{minW.toFixed(0)}</span>
        </div>

        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#2a2a2a" strokeDasharray="2 2" strokeWidth="0.5" />
          ))}
          {/* Weight line */}
          {weights.length > 1 && (
            <>
              <polyline fill="none" points={toPoints(weights, minW, maxW)} stroke="#e60000" strokeWidth="2" />
              {weights.map((v, i) => {
                const x = (i / (weights.length - 1)) * 100;
                const y = 100 - ((v - minW) / (maxW - minW)) * 80 - 10;
                return <circle key={i} cx={x} cy={y} r="2" fill="#131313" stroke="#e60000" strokeWidth="1.5" />;
              })}
            </>
          )}
          {/* Body fat line */}
          {fats.length > 1 && (
            <polyline fill="none" points={toPoints(fats, minF, maxF)} stroke="#5f3f3a" strokeDasharray="4 4" strokeWidth="2" />
          )}
        </svg>

        {/* X axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-black text-on-surface-variant px-1">
          {bodyStats.filter((_, i) => i === 0 || i === bodyStats.length - 1 || i === Math.floor(bodyStats.length / 2)).map((s, i) => (
            <span key={i}>{new Date(s.logged_at).toLocaleString("default", { month: "short" })}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BodyStatsForm() {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({ weight_kg: "", body_fat_pct: "", chest_cm: "", waist_cm: "", arms_cm: "" });
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await logBodyStats({
        weight_kg:    parseFloat(values.weight_kg)    || undefined,
        body_fat_pct: parseFloat(values.body_fat_pct) || undefined,
        chest_cm:     parseFloat(values.chest_cm)     || undefined,
        waist_cm:     parseFloat(values.waist_cm)     || undefined,
        arms_cm:      parseFloat(values.arms_cm)      || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  const fields = [
    { key: "weight_kg",    label: "WEIGHT",   unit: "KG" },
    { key: "body_fat_pct", label: "BODY FAT", unit: "%" },
    { key: "chest_cm",     label: "CHEST",    unit: "CM" },
    { key: "waist_cm",     label: "WAIST",    unit: "CM" },
    { key: "arms_cm",      label: "ARMS",     unit: "CM" },
  ] as const;

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4 md:col-span-12">
      <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
        LOG TODAY&apos;S STATS
      </h2>
      {success && (
        <div className="bg-surface-container-high border-2 border-primary-container text-primary-container px-4 py-2 text-xs font-black uppercase tracking-widest animate-fade-in">
          ✓ Stats logged for today
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {fields.map(({ key, label, unit }) => (
            <div key={key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                {label} ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="—"
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-black text-center text-xl py-2 transition-colors"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-container text-black font-black italic uppercase px-8 py-3 hover:bg-secondary-container transition-colors text-sm tracking-widest disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? (
            <><span className="material-symbols-outlined animate-spin text-base">autorenew</span> SAVING...</>
          ) : (
            <><span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>save</span> LOG STATS</>
          )}
        </button>
      </form>
    </div>
  );
}

function VolumeBar({ weeklyVolume }: { weeklyVolume: { started_at: string; total_volume_kg: number | null }[] }) {
  const weeks: Record<string, number> = {};
  weeklyVolume.forEach((s) => {
    const d = new Date(s.started_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    weeks[key] = (weeks[key] ?? 0) + (s.total_volume_kg ?? 0);
  });

  const entries = Object.entries(weeks).sort().slice(-4);
  const maxVol = Math.max(1, ...entries.map(([, v]) => v));

  const muscleGroups = [
    { label: "CHEST", pct: 30 }, { label: "BACK", pct: 25 },
    { label: "LEGS", pct: 20 }, { label: "ARMS", pct: 15 }, { label: "CORE", pct: 10 },
  ];
  const barColors = ["#e60000", "#93000a", "#5f3f3a", "#353534", "#1c1b1b"];

  return (
    <div className="md:col-span-6 bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4">
      <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
        WEEKLY VOLUME (KG)
      </h2>
      {entries.length === 0 ? (
        <div className="flex items-end gap-2 h-32">
          {[60, 80, 45, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-surface-container-highest" style={{ height: `${h}%`, opacity: 0.3 }} />
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-2 h-32">
          {entries.map(([key, vol]) => (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-primary-container">{vol.toFixed(0)}</span>
              <div
                className="w-full bg-primary-container transition-all duration-500"
                style={{ height: `${(vol / maxVol) * 100}%` }}
              />
              <span className="text-[10px] font-black text-on-surface-variant uppercase">W{entries.indexOf(entries.find(e => e[0] === key)!) + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MuscleDistribution() {
  const groups = [
    { label: "CHEST", pct: 30 }, { label: "BACK", pct: 25 },
    { label: "LEGS", pct: 20 }, { label: "ARMS", pct: 15 }, { label: "CORE", pct: 10 },
  ];
  const colors = ["#e60000", "#93000a", "#5f3f3a", "#353534", "#1c1b1b"];

  return (
    <div className="md:col-span-6 bg-surface-container-low border-2 border-black p-6 flex flex-col gap-4">
      <h2 className="font-black text-xs uppercase tracking-widest text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-base" style={{ fontVariationSettings: "'FILL' 1" }}>accessibility_new</span>
        MUSCLE DISTRIBUTION
      </h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {groups.map((g, i) => (
          <div key={g.label} className="font-black text-xs px-3 py-1.5 uppercase" style={{ backgroundColor: colors[i], color: i < 2 ? "#000" : "#e5e2e1" }}>
            {g.label} ({g.pct}%)
          </div>
        ))}
      </div>
      <div className="flex h-4 w-full">
        {groups.map((g, i) => (
          <div key={g.label} className="transition-all" style={{ width: `${g.pct}%`, backgroundColor: colors[i] }} />
        ))}
      </div>
    </div>
  );
}

export function ProgressClient({ streak, sessions, bodyStats, weeklyVolume }: {
  streak: Streak | null;
  sessions: Session[];
  bodyStats: BodyStat[];
  weeklyVolume: { started_at: string; total_volume_kg: number | null }[];
}) {
  const [, startTransition] = useTransition();

  function handleFreeze() {
    startTransition(async () => {
      await useFreeze();
    });
  }

  const totalVolume = sessions.reduce((s, x) => s + (x.total_volume_kg ?? 0), 0);
  const totalMinutes = sessions.reduce((s, x) => s + Math.floor((x.duration_seconds ?? 0) / 60), 0);

  return (
    <div className="p-6 md:p-10 animate-fade-in">
      {/* Page header */}
      <div className="border-b-2 border-surface-container-high pb-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
        <h1 className="text-[clamp(36px,5vw,60px)] font-black italic uppercase text-on-background leading-none tracking-tighter relative z-10">
          ANALYTICS BATTLEGROUND
        </h1>
        <p className="font-black text-sm text-on-surface-variant uppercase mt-2 tracking-widest italic relative z-10">
          Measure the suffering. Track the gains.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sessions",   value: sessions.length,             icon: "fitness_center",     accent: true },
          { label: "Total Volume",     value: `${(totalVolume/1000).toFixed(1)}t`, icon: "monitor_weight", accent: false },
          { label: "Total Time",       value: `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`, icon: "timer", accent: false },
          { label: "Current Streak",   value: `${streak?.current_streak ?? 0}d`, icon: "local_fire_department", accent: false },
        ].map((stat, i) => (
          <div key={i} className={`${stat.accent ? "bg-primary-container text-black" : "bg-surface-container-high text-on-surface border-2 border-black"} p-5 flex flex-col gap-2`}>
            <span className="material-symbols-outlined text-xl opacity-70" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            <div className="text-3xl font-black italic leading-none">{stat.value}</div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${stat.accent ? "text-black/70" : "text-on-surface-variant"}`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <StreakCard streak={streak} onFreeze={handleFreeze} />
        <CalendarHeatmap sessions={sessions} />
        <BodyStatsChart bodyStats={bodyStats} />
        <VolumeBar weeklyVolume={weeklyVolume} />
        <MuscleDistribution />
        <BodyStatsForm />
      </div>
    </div>
  );
}
