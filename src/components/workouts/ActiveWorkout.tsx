"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { addExerciseToSession, finishSession, upsertSet } from "@/lib/workouts";
import { createClient } from "@/lib/supabase/client";

export interface ActiveSet {
  id?: string;
  set_index: number;
  weight: number;
  reps: number;
  is_warmup: boolean;
  completed: boolean;
}

export interface ActiveExercise {
  session_exercise_id: string;
  exercise_id: string;
  name: string;
  primary_muscles: string[];
  category: string | null;
  sets: ActiveSet[];
  overload: {
    last_weight: number | null;
    last_reps: number | null;
    suggested_weight: number | null;
    suggested_reps: number | null;
  } | null;
}

interface Props {
  session: {
    id: string;
    name: string;
    started_at: string;
    finished_at: string | null;
    total_volume: number;
  };
  exercises: ActiveExercise[];
  weightUnit: "kg" | "lb";
}

function formatElapsed(startedAtIso: string, finishedAtIso: string | null) {
  const start = new Date(startedAtIso).getTime();
  const end = finishedAtIso ? new Date(finishedAtIso).getTime() : Date.now();
  const sec = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ActiveWorkout({ session, exercises, weightUnit }: Props) {
  const router = useRouter();
  const isFinished = !!session.finished_at;
  const [, startTx] = useTransition();
  const [activeIdx, setActiveIdx] = useState(0);
  const active = exercises[activeIdx];

  const [elapsed, setElapsed] = useState(() => formatElapsed(session.started_at, session.finished_at));
  useEffect(() => {
    if (isFinished) return;
    const t = setInterval(
      () => setElapsed(formatElapsed(session.started_at, session.finished_at)),
      1000,
    );
    return () => clearInterval(t);
  }, [session.started_at, session.finished_at, isFinished]);

  function handleSet(input: { id?: string; index: number; weight: number; reps: number; completed: boolean }) {
    if (!active) return;
    startTx(async () => {
      try {
        await upsertSet({
          id: input.id,
          session_exercise_id: active.session_exercise_id,
          set_index: input.index,
          weight: input.weight,
          reps: input.reps,
          completed: input.completed,
          sessionId: session.id,
        });
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  function handleFinish() {
    startTx(async () => {
      try {
        const { awarded } = await finishSession(session.id);
        if (awarded.length > 0) {
          alert(`Badges unlocked: ${awarded.join(", ")}`);
        }
        router.replace("/workouts");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to finish");
      }
    });
  }

  return (
    <main className="p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md border-b-2 border-surface-variant pb-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg uppercase italic text-primary-container tracking-tighter">
            {session.name}
          </h1>
          <p className="font-body-lg text-body-lg text-tertiary mt-2 uppercase">
            {isFinished
              ? "FINISHED"
              : `IN PROGRESS • VOL ${Math.round(session.total_volume).toLocaleString()} ${weightUnit.toUpperCase()}`}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-high border-2 border-surface-variant px-6 py-4">
          <Icon name="timer" filled className="text-primary-container text-4xl" />
          <div className="flex flex-col">
            <span className="font-display-xl text-5xl text-on-surface">{elapsed}</span>
            <span className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest mt-1">
              ELAPSED
            </span>
          </div>
        </div>
        {!isFinished && (
          <button
            onClick={handleFinish}
            className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-8 py-4 hover:bg-secondary-container transition-colors w-full md:w-auto"
          >
            FINISH WORKOUT
          </button>
        )}
      </header>

      {exercises.length === 0 && (
        <AddExerciseSection sessionId={session.id} compact={false} />
      )}

      {/* Exercise tab strip */}
      {exercises.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {exercises.map((ex, i) => (
            <button
              key={ex.session_exercise_id}
              onClick={() => setActiveIdx(i)}
              className={`whitespace-nowrap font-label-bold text-label-bold uppercase italic px-4 py-2 border-2 ${
                i === activeIdx
                  ? "bg-primary-container text-black border-primary-container"
                  : "bg-black text-tertiary-fixed-dim border-surface-variant hover:border-primary-container hover:text-primary"
              }`}
            >
              {i + 1}. {ex.name}
            </button>
          ))}
          <AddExerciseSection sessionId={session.id} compact />
        </div>
      )}

      {/* Active exercise */}
      {active && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col gap-stack-md bg-surface-container p-6 border-2 border-black">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex gap-2 mb-2">
                  {active.primary_muscles.slice(0, 2).map((m) => (
                    <span
                      key={m}
                      className="bg-primary-container text-black px-2 py-1 font-label-bold text-xs uppercase"
                    >
                      {m}
                    </span>
                  ))}
                  {active.category && (
                    <span className="bg-surface-variant text-on-surface px-2 py-1 font-label-bold text-xs uppercase">
                      {active.category}
                    </span>
                  )}
                </div>
                <h2 className="font-headline-md text-headline-md uppercase text-on-surface">
                  {active.name}
                </h2>
              </div>
              <Icon name="fitness_center" className="text-surface-variant text-6xl" />
            </div>

            {/* Set rows */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-surface-variant font-label-bold text-label-bold text-tertiary uppercase tracking-widest">
                <div className="col-span-2 text-center">SET</div>
                <div className="col-span-4 text-center">PREVIOUS</div>
                <div className="col-span-2 text-center">{weightUnit.toUpperCase()}</div>
                <div className="col-span-2 text-center">REPS</div>
                <div className="col-span-2 text-center">DONE</div>
              </div>

              <SetRows
                exercise={active}
                isFinished={isFinished}
                onSet={handleSet}
                weightUnit={weightUnit}
              />
            </div>
          </div>

          {/* Overload widget */}
          <div className="lg:col-span-4 flex flex-col gap-stack-md">
            <div className="bg-surface-container-high p-6 border-t-4 border-primary-container border-x-2 border-b-2 border-x-black border-b-black relative">
              <div className="absolute top-4 right-4 text-primary-container animate-pulse">
                <Icon name="bolt" filled />
              </div>
              <h3 className="font-label-bold text-label-bold text-tertiary uppercase tracking-widest mb-4">
                OVERLOAD TARGET
              </h3>
              {active.overload && active.overload.last_weight !== null ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-surface p-4 border-2 border-surface-variant">
                    <p className="font-body-md text-body-md text-tertiary mb-1">LAST SESSION</p>
                    <p className="font-headline-md text-headline-md text-on-surface">
                      {active.overload.last_weight}
                      {weightUnit} × {active.overload.last_reps}
                    </p>
                  </div>
                  <div className="flex justify-center items-center">
                    <Icon name="arrow_downward" className="text-surface-variant" />
                  </div>
                  <div className="bg-primary-container p-4">
                    <p className="font-body-md text-body-md text-black opacity-80 mb-1 font-bold">
                      SUGGESTED TODAY
                    </p>
                    <p className="font-headline-md text-headline-md text-black italic font-black">
                      {active.overload.suggested_weight}
                      {weightUnit} × {active.overload.suggested_reps}
                    </p>
                    <p className="font-body-md text-sm text-black opacity-90 mt-2 border-t border-black pt-2">
                      Progressive overload nudge.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-tertiary-fixed-dim font-body-md">
                  No prior data. This is your baseline.
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function SetRows({
  exercise,
  isFinished,
  onSet,
  weightUnit,
}: {
  exercise: ActiveExercise;
  isFinished: boolean;
  onSet: (input: { id?: string; index: number; weight: number; reps: number; completed: boolean }) => void;
  weightUnit: "kg" | "lb";
}) {
  const lastDisplay = useMemo(() => {
    if (!exercise.overload?.last_weight) return "—";
    return `${exercise.overload.last_weight}${weightUnit} × ${exercise.overload.last_reps}`;
  }, [exercise.overload, weightUnit]);

  const maxIndex = exercise.sets.reduce((a, s) => Math.max(a, s.set_index), -1);
  const placeholderRows: ActiveSet[] = [];
  // Always render at least 3 rows or one beyond what's saved
  const baseCount = Math.max(3, maxIndex + 2);
  for (let i = 0; i < baseCount; i++) {
    const existing = exercise.sets.find((s) => s.set_index === i);
    placeholderRows.push(
      existing ?? {
        set_index: i,
        weight: 0,
        reps: 0,
        is_warmup: false,
        completed: false,
      },
    );
  }

  return (
    <>
      {placeholderRows.map((row) => (
        <SetRow
          key={`${exercise.session_exercise_id}-${row.set_index}`}
          row={row}
          lastDisplay={lastDisplay}
          isFinished={isFinished}
          suggestion={exercise.overload}
          onSubmit={onSet}
          weightUnit={weightUnit}
        />
      ))}
    </>
  );
}

function SetRow({
  row,
  lastDisplay,
  suggestion,
  isFinished,
  onSubmit,
  weightUnit,
}: {
  row: ActiveSet;
  lastDisplay: string;
  suggestion: ActiveExercise["overload"];
  isFinished: boolean;
  onSubmit: (input: { id?: string; index: number; weight: number; reps: number; completed: boolean }) => void;
  weightUnit: "kg" | "lb";
}) {
  const initialWeight =
    row.weight ||
    (row.set_index === 0 ? suggestion?.suggested_weight ?? 0 : 0) ||
    0;
  const initialReps =
    row.reps || (row.set_index === 0 ? suggestion?.suggested_reps ?? 0 : 0) || 0;
  const [w, setW] = useState<number>(initialWeight);
  const [r, setR] = useState<number>(initialReps);
  const completed = row.completed;

  const tone = completed
    ? "bg-surface-container-high border-l-4 border-surface-variant opacity-70"
    : row.id
      ? "bg-surface-container-highest p-2 border-l-4 border-primary-container relative overflow-hidden"
      : "border-l-4 border-transparent";

  return (
    <div className={`grid grid-cols-12 gap-2 items-center p-2 ${tone}`}>
      {!completed && row.id && (
        <div className="absolute inset-0 bg-primary-container opacity-5 pointer-events-none" />
      )}
      <div className="col-span-2 text-center font-label-bold text-label-bold">
        {row.set_index + 1}
      </div>
      <div className="col-span-4 text-center font-body-md text-body-md text-tertiary">
        {lastDisplay}
      </div>
      <div className="col-span-2">
        <input
          type="number"
          min={0}
          step={0.5}
          disabled={completed || isFinished}
          value={w || ""}
          onChange={(e) => setW(Number(e.target.value) || 0)}
          placeholder="-"
          className="w-full bg-surface-dim border-b-2 border-primary-container text-center font-headline-md text-2xl py-2 text-on-surface focus:outline-none focus:border-secondary-container disabled:border-surface-variant disabled:text-tertiary disabled:bg-transparent transition-colors"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          min={0}
          step={1}
          disabled={completed || isFinished}
          value={r || ""}
          onChange={(e) => setR(Number(e.target.value) || 0)}
          placeholder="-"
          className="w-full bg-surface-dim border-b-2 border-primary-container text-center font-headline-md text-2xl py-2 text-on-surface focus:outline-none focus:border-secondary-container disabled:border-surface-variant disabled:text-tertiary disabled:bg-transparent transition-colors"
        />
      </div>
      <div className="col-span-2 flex justify-center">
        {completed ? (
          <button
            disabled
            className="w-10 h-10 bg-surface-variant text-on-surface flex items-center justify-center"
            aria-label="Completed"
          >
            <Icon name="check" filled />
          </button>
        ) : (
          <button
            disabled={isFinished || (w === 0 && r === 0)}
            onClick={() =>
              onSubmit({
                id: row.id,
                index: row.set_index,
                weight: w,
                reps: r,
                completed: true,
              })
            }
            className="w-12 h-12 bg-primary-container text-black flex items-center justify-center hover:bg-secondary-container transition-colors disabled:opacity-30"
            aria-label="Mark complete"
          >
            <Icon name="check" />
          </button>
        )}
      </div>
      <span className="hidden">{weightUnit}</span>
    </div>
  );
}

function AddExerciseSection({ sessionId, compact }: { sessionId: string; compact: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [pending, startTx] = useTransition();

  async function search(term: string) {
    setQ(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("exercises")
      .select("id, name")
      .ilike("name", `%${term}%`)
      .limit(20);
    setResults(data ?? []);
  }

  function add(exId: string) {
    startTx(async () => {
      try {
        await addExerciseToSession(sessionId, exId);
        setOpen(false);
        setQ("");
        setResults([]);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  if (compact) {
    return (
      <button
        onClick={() => setOpen((v) => !v)}
        className="whitespace-nowrap font-label-bold text-label-bold uppercase italic px-4 py-2 border-2 border-dashed border-surface-variant text-tertiary hover:border-primary-container hover:text-primary-container relative"
      >
        + ADD EXERCISE
        {open && (
          <Picker q={q} results={results} onSearch={search} onPick={add} pending={pending} />
        )}
      </button>
    );
  }

  return (
    <div className="border-2 border-dashed border-surface-variant p-12 flex flex-col items-center justify-center gap-4">
      <Icon name="add_box" className="text-5xl text-surface-variant" />
      <div className="font-headline-md text-headline-md text-tertiary uppercase italic">
        Add your first exercise
      </div>
      <Picker
        q={q}
        results={results}
        onSearch={search}
        onPick={add}
        pending={pending}
        inline
      />
    </div>
  );
}

function Picker({
  q,
  results,
  onSearch,
  onPick,
  pending,
  inline,
}: {
  q: string;
  results: { id: string; name: string }[];
  onSearch: (s: string) => void;
  onPick: (id: string) => void;
  pending: boolean;
  inline?: boolean;
}) {
  return (
    <div
      className={
        inline
          ? "w-full max-w-md"
          : "absolute top-full left-0 mt-2 w-72 bg-black border-2 border-surface-variant z-30 p-2"
      }
    >
      <input
        autoFocus
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="SEARCH EXERCISES..."
        className="w-full bg-surface-container-low border-b-2 border-surface-container-high focus:border-primary-container text-white py-2 px-3 outline-none uppercase font-label-bold text-label-bold"
      />
      <div className="mt-2 max-h-72 overflow-y-auto flex flex-col">
        {results.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            disabled={pending}
            className="text-left text-white px-3 py-2 hover:bg-surface-container-high font-label-bold text-label-bold uppercase truncate disabled:opacity-50"
          >
            {r.name}
          </button>
        ))}
        {q.length >= 2 && results.length === 0 && (
          <div className="text-tertiary-fixed-dim text-xs uppercase px-3 py-2">No matches.</div>
        )}
      </div>
    </div>
  );
}
