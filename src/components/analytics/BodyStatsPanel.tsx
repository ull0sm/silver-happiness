"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/Icon";
import { upsertBodyStat, deleteBodyStat } from "@/lib/analytics";

interface BodyStat {
  recorded_on: string;
  weight: number | null;
  body_fat: number | null;
  measurements: Record<string, number>;
}

interface Props {
  initial: BodyStat[];
  weightUnit: "kg" | "lb";
}

export function BodyStatsPanel({ initial, weightUnit }: Props) {
  const router = useRouter();
  const [stats] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [pending, startTx] = useTransition();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");

  const chartData = useMemo(
    () =>
      stats.map((s) => ({
        date: s.recorded_on.slice(5),
        weight: s.weight,
        body_fat: s.body_fat,
      })),
    [stats],
  );

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTx(async () => {
      try {
        await upsertBodyStat({
          recorded_on: date,
          weight: weight ? Number(weight) : null,
          body_fat: bodyFat ? Number(bodyFat) : null,
        });
        setEditing(false);
        setWeight("");
        setBodyFat("");
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function remove(d: string) {
    if (!confirm(`Remove entry for ${d}?`)) return;
    startTx(async () => {
      await deleteBodyStat(d);
      router.refresh();
    });
  }

  return (
    <div className="bg-surface-container-low border-2 border-black p-6 flex flex-col gap-stack-md relative">
      <div className="flex justify-between items-center z-10">
        <h2 className="font-label-bold text-label-bold uppercase text-white tracking-widest flex items-center gap-2">
          <Icon name="monitor_weight" className="text-primary-container" />
          PHYSIQUE METRICS
        </h2>
        <button
          onClick={() => setEditing((v) => !v)}
          className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-4 py-2 hover:bg-secondary-container transition-colors flex items-center gap-2"
        >
          <Icon name={editing ? "close" : "add"} />
          {editing ? "CANCEL" : "LOG ENTRY"}
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <label className="flex flex-col gap-1 text-tertiary-fixed-dim uppercase text-xs">
            DATE
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-tertiary-fixed-dim uppercase text-xs">
            WEIGHT ({weightUnit.toUpperCase()})
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-tertiary-fixed-dim uppercase text-xs">
            BODY FAT %
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic py-2 px-4 hover:bg-secondary-container disabled:opacity-50"
          >
            {pending ? "SAVING..." : "SAVE"}
          </button>
        </form>
      )}

      <div className="flex gap-4 text-xs font-label-bold uppercase text-tertiary-fixed-dim">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-primary-container" />
          <span>WEIGHT ({weightUnit.toUpperCase()})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-outline-variant" />
          <span>BODY FAT %</span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#2a2a2a" strokeDasharray="2 2" />
              <XAxis dataKey="date" stroke="#5f3f3a" tick={{ fill: "#e9bcb5", fontSize: 11 }} />
              <YAxis
                yAxisId="weight"
                stroke="#5f3f3a"
                tick={{ fill: "#e9bcb5", fontSize: 11 }}
              />
              <YAxis
                yAxisId="bf"
                orientation="right"
                stroke="#5f3f3a"
                tick={{ fill: "#e9bcb5", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0e0e0e",
                  border: "2px solid #e60000",
                  borderRadius: 0,
                  color: "#e5e2e1",
                  fontSize: 12,
                  textTransform: "uppercase",
                }}
              />
              <Legend wrapperStyle={{ display: "none" }} />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke="#e60000"
                strokeWidth={2}
                dot={{ stroke: "#e60000", fill: "#131313", strokeWidth: 1.5, r: 3 }}
                connectNulls
              />
              <Line
                yAxisId="bf"
                type="monotone"
                dataKey="body_fat"
                stroke="#5f3f3a"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="border-2 border-dashed border-surface-variant p-12 text-center text-tertiary-fixed-dim uppercase">
          No body stats yet. Log your first entry above.
        </div>
      )}

      {stats.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-label-bold text-tertiary-fixed-dim uppercase text-xs">
              <tr className="border-b-2 border-surface-variant">
                <th className="py-2 px-2">DATE</th>
                <th className="py-2 px-2">WEIGHT ({weightUnit.toUpperCase()})</th>
                <th className="py-2 px-2">BODY FAT %</th>
                <th className="py-2 px-2 text-right">{""}</th>
              </tr>
            </thead>
            <tbody>
              {stats
                .slice()
                .reverse()
                .slice(0, 10)
                .map((s) => (
                  <tr key={s.recorded_on} className="border-b border-surface-container-high">
                    <td className="py-2 px-2 font-label-bold uppercase text-white">{s.recorded_on}</td>
                    <td className="py-2 px-2 text-tertiary-fixed-dim">
                      {s.weight !== null ? `${s.weight} ${weightUnit}` : "—"}
                    </td>
                    <td className="py-2 px-2 text-tertiary-fixed-dim">
                      {s.body_fat !== null ? `${s.body_fat}%` : "—"}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => remove(s.recorded_on)}
                        className="text-tertiary-fixed-dim hover:text-error"
                        aria-label="Delete"
                      >
                        <Icon name="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
