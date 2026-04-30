"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PREDEFINED_PLANS, type WorkoutPlan } from "@/lib/workout-plans";
import { EXERCISES } from "@/lib/exercises-data";

export default function WorkoutsPage() {
  const router = useRouter();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  function startWorkout(plan: WorkoutPlan) {
    // Store selected plan in sessionStorage so active page can pick it up
    sessionStorage.setItem("active_plan", JSON.stringify(plan));
    router.push("/dashboard/active");
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="border-b-2 border-surface-container-high pb-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
        <h1 className="text-[clamp(36px,5vw,60px)] font-black italic uppercase text-on-background leading-none tracking-tighter relative z-10">
          THE HUB
        </h1>
        <p className="font-black text-sm text-on-surface-variant uppercase mt-2 tracking-widest italic relative z-10">
          Select your weapon. Build your arsenal.
        </p>
      </div>

      {/* ── Curated Plans ─────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-6">
          <h2 className="font-black text-3xl italic uppercase text-primary">CURATED PLANS</h2>
          <span className="font-black text-xs text-on-surface-variant uppercase tracking-widest">PRE-BUILT DESTRUCTION</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PREDEFINED_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              expanded={expandedPlan === plan.id}
              onToggle={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              onStart={() => startWorkout(plan)}
            />
          ))}
        </div>
      </section>

      {/* ── Custom Builder CTA ────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-6">
          <h2 className="font-black text-3xl italic uppercase text-on-surface">CUSTOM FORGE</h2>
          <span className="font-black text-xs text-on-surface-variant uppercase tracking-widest">BUILD YOUR OWN</span>
        </div>

        <div className="bg-surface-container-high border-2 border-black p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary-container transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-surface-variant border-2 border-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                build
              </span>
            </div>
            <div>
              <h3 className="font-black italic uppercase text-xl text-on-surface">Build Custom Routine</h3>
              <p className="text-on-surface-variant text-sm mt-1">
                Pick exercises from the library, set your own sets / reps / rest time, drag to reorder.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/workouts/builder")}
            className="shrink-0 bg-primary-container text-black font-black italic uppercase px-8 py-4 hover:bg-secondary-container transition-colors text-sm tracking-widest flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Workout
          </button>
        </div>
      </section>

      {/* ── Quick Start (empty session) ───────────────── */}
      <section>
        <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-2 mb-6">
          <h2 className="font-black text-3xl italic uppercase text-on-surface">QUICK DEPLOY</h2>
          <span className="font-black text-xs text-on-surface-variant uppercase tracking-widest">NO PLAN NEEDED</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("active_plan"); router.push("/dashboard/active"); }}
          className="w-full border-2 border-dashed border-surface-container-highest text-on-surface-variant font-black italic uppercase py-8 flex items-center justify-center gap-3 hover:border-primary-container hover:text-primary-container transition-all text-lg tracking-widest"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_circle
          </span>
          Start Empty Session
        </button>
      </section>
    </div>
  );
}

/* ── Plan Card ──────────────────────────────────────────────── */
function PlanCard({ plan, expanded, onToggle, onStart }: {
  plan: WorkoutPlan;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  return (
    <div className={`bg-surface-container-high border-2 border-black flex flex-col relative group overflow-hidden transition-all duration-300 ${
      plan.accent ? "border-t-primary-container border-t-4" : "border-t-surface-variant border-t-4"
    }`}>
      {/* Image area */}
      <div className="h-52 relative overflow-hidden bg-surface-container">
        {/* Brutalist pattern bg */}
        <div className="absolute inset-0 flex flex-col gap-3 p-4 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-1.5 bg-on-surface" style={{ width: `${40 + i * 10}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <span className="material-symbols-outlined text-[120px] text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
            fitness_center
          </span>
        </div>
        {plan.accent && (
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(230,0,0,0.15)" }} />
        )}
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex gap-2 mb-3">
            <span className={`text-xs font-black uppercase px-2 py-1 ${plan.accent ? "bg-primary-container text-black" : "bg-surface-variant text-on-surface"}`}>
              {plan.tag}
            </span>
            <span className="text-xs font-black uppercase px-2 py-1 bg-black text-primary-container border border-primary-container">
              {plan.focus}
            </span>
          </div>
          <h3 className="font-black text-2xl italic uppercase text-on-surface group-hover:text-primary transition-colors">
            {plan.name}
          </h3>
          <p className="text-on-surface-variant text-xs mt-1 font-bold uppercase tracking-widest">{plan.days}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-grow flex flex-col gap-4">
        <p className="text-on-surface-variant text-sm leading-relaxed">{plan.description}</p>

        {/* Exercise count */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-black uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">list_alt</span>
          {plan.exercises.length} exercises
        </div>

        {/* Expand exercises */}
        {expanded && (
          <div className="flex flex-col gap-2 border-t-2 border-surface-container pt-3 animate-fade-in">
            {plan.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-black border-l-2 border-surface-variant">
                <span className="material-symbols-outlined text-on-surface-variant text-base">
                  {ex.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface font-black uppercase text-xs truncate">{ex.name}</p>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase">{ex.sets} × {ex.reps} reps</p>
                </div>
                <span className="text-on-surface-variant text-[10px] font-black uppercase shrink-0">{ex.rest_seconds}s rest</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onToggle}
          className="text-on-surface-variant hover:text-primary-container text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{expanded ? "expand_less" : "expand_more"}</span>
          {expanded ? "Hide exercises" : "Preview exercises"}
        </button>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t-2 border-surface-container">
          <button
            onClick={onStart}
            className="flex-1 bg-primary-container text-black font-black italic uppercase py-3 hover:bg-secondary-container transition-colors text-sm tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            START
          </button>
          <button className="px-4 border-2 border-surface-container-highest text-on-surface-variant hover:border-primary-container hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-base">bookmark</span>
          </button>
        </div>
      </div>
    </div>
  );
}
