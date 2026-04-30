"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EXERCISES } from "@/lib/exercises-data";
import type { PlanExercise, WorkoutPlan } from "@/lib/workout-plans";

export default function WorkoutBuilderPage() {
  const router = useRouter();
  const [name, setName] = useState("MY CUSTOM PLAN");
  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const filtered = EXERCISES.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  function addExercise(id: string) {
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) return;
    setExercises((prev) => [
      ...prev,
      { exercise_id: ex.id, name: ex.name, sets: 3, reps: "10", rest_seconds: 90, muscle_group: ex.muscle_group, equipment: ex.equipment, icon: ex.icon },
    ]);
    setShowPicker(false);
    setSearch("");
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, field: "sets" | "reps" | "rest_seconds", value: string) {
    setExercises((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: field === "reps" ? value : parseInt(value) || 0 };
      return next;
    });
  }

  function startCustom() {
    const plan: WorkoutPlan = {
      id: "custom-" + Date.now(),
      name,
      type: "custom",
      tag: "CUSTOM",
      days: "Today",
      focus: "CUSTOM",
      accent: false,
      description: "Custom built routine",
      exercises,
    };
    sessionStorage.setItem("active_plan", JSON.stringify(plan));
    router.push("/dashboard/active");
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="border-b-2 border-surface-container-high pb-6 mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard/workouts" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary-container flex items-center gap-1 mb-3 transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span> Back to Hub
          </Link>
          <h1 className="text-4xl font-black italic uppercase text-on-surface tracking-tighter">CUSTOM FORGE</h1>
        </div>
        <button
          onClick={startCustom}
          disabled={exercises.length === 0}
          className="bg-primary-container text-black font-black italic uppercase px-6 py-3 hover:bg-secondary-container transition-colors text-sm tracking-widest disabled:opacity-40 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          Start Workout
        </button>
      </div>

      {/* Plan Name */}
      <div className="mb-8">
        <label className="block font-black text-xs uppercase tracking-widest text-on-surface-variant mb-2">PLAN NAME</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          className="bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-black italic uppercase text-2xl px-4 py-3 w-full transition-colors"
        />
      </div>

      {/* Exercise List */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-black text-xl italic uppercase text-on-surface">EXERCISES ({exercises.length})</h2>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-container text-black font-black uppercase text-xs tracking-widest hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            ADD EXERCISE
          </button>
        </div>

        {/* Exercise picker */}
        {showPicker && (
          <div className="mb-4 bg-surface-container-high border-2 border-primary-container p-4 animate-fade-in">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH EXERCISES..."
              autoFocus
              className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-black uppercase px-4 py-2 mb-3 text-sm"
            />
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex.id)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-primary-container hover:text-black text-on-surface transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base">{ex.icon}</span>
                  <span className="font-black uppercase text-sm">{ex.name}</span>
                  <span className="ml-auto text-xs text-on-surface-variant font-bold uppercase">{ex.muscle_group}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {exercises.length === 0 ? (
          <div className="border-2 border-dashed border-surface-container-high py-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">fitness_center</span>
            <p className="font-black italic uppercase text-on-surface-variant">No exercises yet.</p>
            <p className="text-on-surface-variant text-sm mt-1">Click "Add Exercise" to build your plan.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map((ex, i) => (
              <div key={i} className="bg-surface-container border-2 border-black border-l-4 border-l-primary-container p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-surface-container-highest flex items-center justify-center font-black text-primary-container text-sm">{i + 1}</span>
                    <div>
                      <h4 className="font-black italic uppercase text-on-surface">{ex.name}</h4>
                      <p className="font-black text-xs text-on-surface-variant uppercase">{ex.muscle_group} · {ex.equipment}</p>
                    </div>
                  </div>
                  <button onClick={() => removeExercise(i)} className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "SETS", field: "sets", value: String(ex.sets) },
                    { label: "REPS", field: "reps", value: ex.reps },
                    { label: "REST (S)", field: "rest_seconds", value: String(ex.rest_seconds) },
                  ].map(({ label, field, value }) => (
                    <div key={field}>
                      <label className="block font-black text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateField(i, field as "sets" | "reps" | "rest_seconds", e.target.value)}
                        className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-black text-center text-xl py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
