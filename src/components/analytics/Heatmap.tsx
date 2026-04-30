import { Icon } from "@/components/ui/Icon";

interface Session {
  started_at: string;
  total_volume: number;
}

interface Props {
  sessions: Session[];
  year: number;
  month: number; // 0-indexed
}

export function Heatmap({ sessions, year, month }: Props) {
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" }).toUpperCase();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First weekday: 0=Sun (we want Monday-first)
  const firstDow = new Date(year, month, 1).getDay();
  const offset = (firstDow + 6) % 7; // Monday = 0

  // Aggregate volume per day
  const byDay = new Map<number, number>();
  for (const s of sessions) {
    const dt = new Date(s.started_at);
    if (dt.getFullYear() === year && dt.getMonth() === month) {
      const d = dt.getDate();
      byDay.set(d, (byDay.get(d) ?? 0) + (Number(s.total_volume) || 0));
    }
  }

  function tone(volume: number) {
    if (volume <= 0) return "bg-[#2a2a2a] text-zinc-600";
    if (volume < 2000) return "bg-[#410000] text-white";
    if (volume < 6000) return "bg-[#93000a] text-white";
    if (volume < 12000) return "bg-[#e60000] text-white shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]";
    return "bg-[#ff5625] text-black font-black shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]";
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-stack-md h-full">
      <div className="flex justify-between items-center">
        <h2 className="font-label-bold text-label-bold uppercase text-white tracking-widest flex items-center gap-2">
          <Icon name="calendar_month" className="text-primary-container" />
          VOLUME HEATMAP
        </h2>
        <span className="font-label-bold text-white uppercase">
          {monthName} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-[150px]">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
          <div key={d} className="text-center text-xs font-label-bold text-tertiary-fixed-dim py-1">
            {d}
          </div>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <div key={`e-${i}`} className="bg-transparent" />
          ) : (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center text-xs border border-black hover:border-primary-container transition-colors ${tone(
                byDay.get(d) ?? 0,
              )}`}
              title={`${d}: ${(byDay.get(d) ?? 0).toLocaleString()} volume`}
            >
              {d}
            </div>
          ),
        )}
      </div>
      <div className="flex items-center justify-end gap-2 text-xs font-label-bold text-tertiary-fixed-dim uppercase mt-2">
        <span>REST</span>
        <div className="w-3 h-3 bg-[#2a2a2a] border border-black" />
        <div className="w-3 h-3 bg-[#410000] border border-black" />
        <div className="w-3 h-3 bg-[#93000a] border border-black" />
        <div className="w-3 h-3 bg-[#e60000] border border-black" />
        <div className="w-3 h-3 bg-[#ff5625] border border-black" />
        <span>WAR</span>
      </div>
    </div>
  );
}
