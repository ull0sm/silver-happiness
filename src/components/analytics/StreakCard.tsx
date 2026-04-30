import { Icon } from "@/components/ui/Icon";

interface Props {
  current: number;
  longest: number;
  freezeTokens: number;
  lastActivity: string | null;
}

export function StreakCard({ current, longest, freezeTokens, lastActivity }: Props) {
  // Last 7 days indicator (simplified): if last activity was today/yesterday, fill bars
  const today = new Date();
  const days: { label: string; lit: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    days.push({
      label: labels[d.getDay()],
      lit: lastActivity ? d.toISOString().slice(0, 10) <= lastActivity && i < current : false,
    });
  }

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-stack-md relative overflow-hidden h-full">
      <div className="absolute inset-0 border-t-2 border-primary-container opacity-50 pointer-events-none" />
      <div className="flex justify-between items-start z-10">
        <h2 className="font-label-bold text-label-bold uppercase text-white tracking-widest flex items-center gap-2">
          <Icon name="local_fire_department" className="text-primary-container" filled />
          ACTIVE STREAK
        </h2>
        <div className="bg-primary-container text-black font-label-bold text-xs px-2 py-1 uppercase flex items-center gap-1">
          <Icon name="ac_unit" className="text-[14px]" /> {freezeTokens} FREEZE
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-4 z-10">
        <div className="font-display-xl text-display-xl text-white italic drop-shadow-[0_0_15px_rgba(230,0,0,0.5)]">
          {current}
        </div>
        <div className="font-body-md text-body-md text-tertiary-fixed-dim uppercase tracking-widest">
          DAYS UNBROKEN
        </div>
        <div className="font-label-bold text-xs text-tertiary-fixed-dim uppercase tracking-widest mt-2">
          Longest: {longest}
        </div>
      </div>
      <div className="w-full flex gap-1 h-3 z-10">
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex-1 ${d.lit ? "bg-primary-container" : "bg-surface-container-highest"}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs font-label-bold text-tertiary-fixed-dim z-10">
        {days.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
