"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveWorkoutSession } from "@/lib/actions";
import { PREDEFINED_PLANS, type WorkoutPlan, type PlanExercise } from "@/lib/workout-plans";
import { EXERCISES } from "@/lib/exercises-data";

type SetLog = {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  isPR: boolean;
};

type ExerciseLog = {
  exercise: PlanExercise;
  sets: SetLog[];
};

function useElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return { elapsed, display: `${mm}:${ss}` };
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);
  const pct = ((seconds - remaining) / seconds) * 100;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-surface-container-lowest border-2 border-primary-container p-5 w-48 glow-crimson animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-widest text-primary-container">REST</span>
        <button onClick={onDone} className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      <div className="text-4xl font-black italic text-on-surface text-center mb-3">{remaining}s</div>
      <div className="h-1.5 bg-surface-container-high w-full">
        <div className="h-full bg-primary-container transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <button onClick={onDone} className="w-full mt-3 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors">
        Skip Rest
      </button>
    </div>
  );
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const { elapsed, display: timerDisplay } = useElapsedTimer();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 });
  const [finishing, setFinishing] = useState(false);

  // Load plan from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem("active_plan");
    if (raw) {
      const p: WorkoutPlan = JSON.parse(raw);
      setPlan(p);
      setLogs(p.exercises.map((ex) => ({
        exercise: ex,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: "",
          reps: ex.reps,
          completed: false,
          isPR: false,
        })),
      })));
    } else {
      // Empty session — add exercises manually (simplified: start with 3 default exercises)
      const defaults = EXERCISES.slice(0, 3).map((ex) => ({
        exercise_id: ex.id,
        name: ex.name,
        sets: 3,
        reps: "10",
        rest_seconds: 90,
        muscle_group: ex.muscle_group,
        equipment: ex.equipment,
        icon: ex.icon,
      }));
      setLogs(defaults.map((ex) => ({
        exercise: ex,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: "",
          reps: ex.reps,
          completed: false,
          isPR: false,
        })),
      })));
    }
  }, []);

  function updateSet(exIdx: number, setIdx: number, field: "weight" | "reps", value: string) {
    setLogs((prev) => {
      const next = structuredClone(prev);
      next[exIdx].sets[setIdx][field] = value;
      return next;
    });
  }

  function completeSet(exIdx: number, setIdx: number) {
    setLogs((prev) => {
      const next = structuredClone(prev);
      const s = next[exIdx].sets[setIdx];
      s.completed = !s.completed;
      return next;
    });
    // Start rest timer if completing (not un-completing)
    if (!logs[exIdx]?.sets[setIdx]?.completed) {
      const rest = logs[exIdx]?.exercise?.rest_seconds ?? 90;
      setRestTimer({ active: true, seconds: rest });
    }
  }

  function addSet(exIdx: number) {
    setLogs((prev) => {
      const next = structuredClone(prev);
      const sets = next[exIdx].sets;
      sets.push({ setNumber: sets.length + 1, weight: "", reps: next[exIdx].exercise.reps, completed: false, isPR: false });
      return next;
    });
  }

  async function finishWorkout() {
    setFinishing(true);
    const completedSetEntries = logs.flatMap((log) =>
      log.sets
        .filter((s) => s.completed)
        .map((s) => ({
          exercise_id: log.exercise.exercise_id,
          set_number: s.setNumber,
          weight_kg: parseFloat(s.weight) || null,
          reps: parseInt(s.reps) || null,
        }))
    );

    try {
      await saveWorkoutSession({
        plan_name: plan?.name ?? "Custom Session",
        duration_seconds: elapsed,
        sets: completedSetEntries,
      });
    } catch {
      // Graceful fallback if Supabase not configured yet
    }
    sessionStorage.removeItem("active_plan");
    router.push("/dashboard");
  }

  const currentLog = logs[currentIdx];
  const completedSets = logs.reduce((n, l) => n + l.sets.filter((s) => s.completed).length, 0);
  const totalSets = logs.reduce((n, l) => n + l.sets.length, 0);

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="text-primary-container font-black italic uppercase text-xl animate-pr-pulse mb-4">Loading session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-7xl mx-auto">

      {/* ── Rest Timer ────────────────────────────────── */}
      {restTimer.active && (
        <RestTimer seconds={restTimer.seconds} onDone={() => setRestTimer({ active: false, seconds: 0 })} />
      )}

      {/* ── Session Header ────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-surface-container-high pb-6 mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary-container italic mb-1">ACTIVE SESSION</p>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase text-on-surface tracking-tighter leading-none">
            {plan?.name ?? "CUSTOM SESSION"}
          </h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mt-1">
            {completedSets}/{totalSets} sets completed
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-4 bg-surface-container-high border-2 border-surface-variant px-5 py-3 shrink-0">
          <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            timer
          </span>
          <div>
            <div className="text-4xl font-black italic text-on-surface leading-none">{timerDisplay}</div>
            <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant mt-0.5">ELAPSED</div>
          </div>
        </div>

        <button
          onClick={finishWorkout}
          disabled={finishing}
          className="bg-primary-container text-black font-black italic uppercase px-8 py-4 hover:bg-secondary-container transition-colors border-2 border-transparent hover:border-black w-full md:w-auto text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {finishing ? (
            <><span className="material-symbols-outlined animate-spin text-base">autorenew</span> SAVING...</>
          ) : (
            <><span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> FINISH WORKOUT</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Current Exercise ─────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Exercise selector tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {logs.map((log, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`shrink-0 px-4 py-2 font-black italic uppercase text-xs tracking-widest border-2 transition-all ${
                  i === currentIdx
                    ? "bg-primary-container text-black border-black"
                    : "border-surface-container-high text-on-surface-variant hover:border-primary-container hover:text-primary-container"
                }`}
              >
                {log.exercise.name.split(" ")[0]}
                {log.sets.every((s) => s.completed) && (
                  <span className="ml-1 text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>

          {currentLog && (
            <div className="bg-surface-container border-2 border-black p-6">
              {/* Exercise info */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-primary-container text-black px-2 py-1 font-black text-xs uppercase">
                      {currentLog.exercise.muscle_group}
                    </span>
                    <span className="bg-surface-variant text-on-surface px-2 py-1 font-black text-xs uppercase">
                      {currentLog.exercise.equipment}
                    </span>
                  </div>
                  <h2 className="font-black text-2xl uppercase italic text-on-surface">
                    {currentLog.exercise.name}
                  </h2>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">
                  {currentLog.exercise.icon}
                </span>
              </div>

              {/* Sets table */}
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-surface-variant font-black text-xs text-on-surface-variant uppercase tracking-widest">
                  <div className="col-span-1 text-center">SET</div>
                  <div className="col-span-4 text-center">PREVIOUS</div>
                  <div className="col-span-3 text-center">KG</div>
                  <div className="col-span-3 text-center">REPS</div>
                  <div className="col-span-1 text-center">✓</div>
                </div>

                {currentLog.sets.map((set, si) => (
                  <SetRow
                    key={si}
                    set={set}
                    exIdx={currentIdx}
                    setIdx={si}
                    onUpdate={updateSet}
                    onComplete={completeSet}
                  />
                ))}

                {/* Add set */}
                <button
                  onClick={() => addSet(currentIdx)}
                  className="mt-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-surface-variant text-on-surface-variant hover:border-on-surface-variant hover:text-on-surface transition-colors font-black text-xs uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  ADD SET
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar ────────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Overload Target */}
          <div className="bg-surface-container-high p-5 border-t-4 border-primary-container border-x-2 border-b-2 border-x-black border-b-black">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs uppercase tracking-widest text-on-surface-variant">OVERLOAD TARGET</h3>
              <span className="material-symbols-outlined text-primary-container animate-pr-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-surface p-3 border-2 border-surface-variant">
                <p className="font-black text-xs text-on-surface-variant uppercase mb-1">LAST SESSION</p>
                <p className="font-black text-xl italic text-on-surface">
                  {currentLog?.exercise.reps ?? "—"} reps
                </p>
              </div>
              <div className="flex justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">arrow_downward</span>
              </div>
              <div className="bg-primary-container p-3">
                <p className="font-black text-xs text-black/80 uppercase mb-1">SUGGESTED TODAY</p>
                <p className="font-black text-xl italic text-black">+2.5kg or +1 rep</p>
                <p className="text-black/80 text-xs mt-1 border-t border-black/20 pt-1">
                  Progressive overload: micro-load each session
                </p>
              </div>
            </div>
          </div>

          {/* On Deck */}
          <div className="bg-surface-container p-5 border-2 border-black flex-1">
            <h3 className="font-black text-xs uppercase tracking-widest text-on-surface-variant mb-4">ON DECK</h3>
            {logs.length > 1 ? (
              <ul className="flex flex-col gap-2">
                {logs.slice(currentIdx + 1, currentIdx + 4).map((log, i) => (
                  <li
                    key={i}
                    onClick={() => setCurrentIdx(currentIdx + 1 + i)}
                    className="flex items-center gap-3 p-3 border-l-2 border-surface-variant hover:bg-surface-container-high hover:border-primary-container transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-surface-variant flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base">{log.exercise.icon}</span>
                    </div>
                    <div>
                      <p className="font-black uppercase text-sm text-on-surface">{log.exercise.name}</p>
                      <p className="font-black text-xs text-on-surface-variant">{log.exercise.sets} × {log.exercise.reps} REPS</p>
                    </div>
                  </li>
                ))}
                {logs.length - currentIdx - 1 > 3 && (
                  <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest text-center mt-2">
                    +{logs.length - currentIdx - 4} more exercises
                  </p>
                )}
              </ul>
            ) : (
              <p className="text-on-surface-variant text-sm">Last exercise!</p>
            )}
          </div>

          {/* Progress bar */}
          <div className="bg-surface-container-high p-4 border-2 border-black">
            <div className="flex justify-between mb-2">
              <span className="font-black text-xs uppercase tracking-widest text-on-surface-variant">PROGRESS</span>
              <span className="font-black text-xs text-primary-container">{completedSets}/{totalSets}</span>
            </div>
            <div className="h-3 bg-surface-container-highest flex gap-0.5">
              {Array.from({ length: totalSets }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 transition-colors duration-300"
                  style={{ backgroundColor: i < completedSets ? "#e60000" : "#353534" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Set Row Component ──────────────────────────────────────── */
function SetRow({ set, exIdx, setIdx, onUpdate, onComplete }: {
  set: SetLog;
  exIdx: number;
  setIdx: number;
  onUpdate: (e: number, s: number, f: "weight" | "reps", v: string) => void;
  onComplete: (e: number, s: number) => void;
}) {
  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 border-l-4 transition-all relative overflow-hidden ${
      set.completed
        ? "border-surface-variant opacity-60 bg-surface-container-high"
        : "border-primary-container bg-surface-container-highest glow-crimson"
    }`}>
      {set.completed && !set.isPR && (
        <div className="absolute inset-0 bg-primary-container opacity-5 pointer-events-none" />
      )}
      {/* Set number */}
      <div className={`col-span-1 text-center font-black text-sm ${set.completed ? "text-on-surface-variant" : "text-primary-container"}`}>
        {set.setNumber}
      </div>
      {/* Previous */}
      <div className="col-span-4 text-center font-black text-xs text-on-surface-variant uppercase">
        — kg × {set.reps}
      </div>
      {/* Weight */}
      <div className="col-span-3">
        <input
          type="number"
          value={set.weight}
          onChange={(e) => onUpdate(exIdx, setIdx, "weight", e.target.value)}
          placeholder="0"
          disabled={set.completed}
          className="w-full bg-surface-dim border-b-2 border-primary-container text-center font-black text-xl py-1 text-on-surface focus:border-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {/* Reps */}
      <div className="col-span-3">
        <input
          type="number"
          value={set.reps}
          onChange={(e) => onUpdate(exIdx, setIdx, "reps", e.target.value)}
          placeholder="0"
          disabled={set.completed}
          className="w-full bg-surface-dim border-b-2 border-primary-container text-center font-black text-xl py-1 text-on-surface focus:border-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {/* Complete */}
      <div className="col-span-1 flex justify-center">
        <button
          onClick={() => onComplete(exIdx, setIdx)}
          className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
            set.completed
              ? "bg-surface-variant text-on-surface border-transparent"
              : "bg-primary-container text-black border-transparent hover:bg-secondary-container"
          }`}
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            {set.completed ? "check" : "check"}
          </span>
        </button>
      </div>
    </div>
  );
}
