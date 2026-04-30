"use client";

import { useState, useMemo } from "react";
import { EXERCISES, MUSCLE_GROUPS, EQUIPMENT_TYPES, type Exercise } from "@/lib/exercises-data";
import { ExerciseModal } from "@/components/exercises/ExerciseModal";

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner:     "bg-surface-container-high text-on-surface-variant border border-surface-variant",
  intermediate: "bg-secondary-container/20 text-secondary-container border border-secondary-container",
  advanced:     "bg-primary-container/20 text-primary-container border border-primary-container",
};

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscle === "All" || ex.muscle_group === muscle;
      const matchEquip  = equipment === "All" || ex.equipment === equipment;
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [search, muscle, equipment]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function resetFilters() {
    setSearch("");
    setMuscle("All");
    setEquipment("All");
    setVisibleCount(12);
  }

  const hasActiveFilters = search || muscle !== "All" || equipment !== "All";

  return (
    <>
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}

      <div className="p-6 md:p-10 animate-fade-in">

        {/* ── Page Header ───────────────────────────────── */}
        <div className="border-b-2 border-surface-container-high pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-[clamp(36px,5vw,60px)] font-black italic uppercase text-on-background leading-none tracking-tighter">
              ARSENAL
            </h1>
            <p className="font-black text-sm text-on-surface-variant uppercase mt-2 tracking-widest italic">
              {filtered.length} exercises — filter and find movements to destroy weakness
            </p>
          </div>
        </div>

        {/* ── Search Bar ────────────────────────────────── */}
        <div className="mb-6 relative group">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
            placeholder="SEARCH EXERCISES..."
            className="w-full bg-surface-container-low border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-black italic uppercase text-lg px-6 py-4 placeholder:text-surface-container-highest transition-colors pr-14"
          />
          <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors text-2xl">
            search
          </span>
        </div>

        {/* ── Muscle Group Filter ───────────────────────── */}
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">MUSCLE GROUP</p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => { setMuscle(g); setVisibleCount(12); }}
                className={`px-3 py-1 text-xs font-black uppercase tracking-widest transition-all ${
                  muscle === g
                    ? "bg-primary-container text-black"
                    : "bg-surface-container-high text-on-surface-variant border border-surface-variant hover:border-primary-container hover:text-primary-container"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ── Equipment Filter ──────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">EQUIPMENT</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_TYPES.map((eq) => (
              <button
                key={eq}
                onClick={() => { setEquipment(eq); setVisibleCount(12); }}
                className={`px-3 py-1 text-xs font-black uppercase tracking-widest transition-all ${
                  equipment === eq
                    ? "bg-secondary-container text-black"
                    : "bg-surface-container-high text-on-surface-variant border border-surface-variant hover:border-secondary-container hover:text-secondary-container"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {/* ── Active Filter Pills + Clear ───────────────── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {muscle !== "All" && (
              <span className="flex items-center gap-1 px-3 py-1 bg-primary-container text-black text-xs font-black uppercase">
                {muscle}
                <button onClick={() => setMuscle("All")} className="hover:opacity-70">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
            {equipment !== "All" && (
              <span className="flex items-center gap-1 px-3 py-1 bg-secondary-container text-black text-xs font-black uppercase">
                {equipment}
                <button onClick={() => setEquipment("All")} className="hover:opacity-70">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-3 py-1 bg-surface-container-high text-on-surface text-xs font-black uppercase border border-surface-variant">
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")} className="hover:opacity-70">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            )}
            <button onClick={resetFilters} className="px-3 py-1 border-2 border-surface-variant text-on-surface-variant text-xs font-black uppercase hover:border-primary-container hover:text-primary-container transition-colors">
              CLEAR ALL
            </button>
          </div>
        )}

        {/* ── Exercise Grid ─────────────────────────────── */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
            <p className="font-black italic uppercase text-xl text-on-surface mb-2">No exercises found</p>
            <p className="text-on-surface-variant text-sm">Try different filters or search terms</p>
            <button onClick={resetFilters} className="mt-6 bg-primary-container text-black font-black italic uppercase px-8 py-3 hover:bg-secondary-container transition-colors text-sm tracking-widest">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelected(ex)} />
            ))}
          </div>
        )}

        {/* ── Load More ─────────────────────────────────── */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((c) => c + 12)}
              className="px-10 py-4 border-2 border-surface-variant text-on-surface font-black italic uppercase hover:border-primary-container hover:text-primary-container transition-all text-sm tracking-widest"
            >
              LOAD MORE HEAVY METAL ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Exercise Card ──────────────────────────────────────────── */
function ExerciseCard({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-container-low border-2 border-black border-t-primary-container border-t-4 flex flex-col group cursor-pointer hover:-translate-y-1 hover:border-primary-container transition-all duration-200"
    >
      {/* Visual area */}
      <div className="h-36 bg-surface-container border-b-2 border-surface-variant relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10" />
        {/* Muscle group watermark */}
        <div className="absolute bottom-3 left-3 z-20 text-xs font-black uppercase tracking-widest text-primary-container/60">
          {exercise.muscle_group}
        </div>
        <span
          className="material-symbols-outlined text-7xl text-surface-container-highest group-hover:text-primary-container/30 transition-colors duration-500 relative z-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {exercise.icon}
        </span>
        {/* Difficulty badge */}
        <span className={`absolute top-3 right-3 z-20 text-[10px] font-black uppercase px-2 py-0.5 ${DIFFICULTY_BADGE[exercise.difficulty]}`}>
          {exercise.difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-xl italic uppercase text-on-surface group-hover:text-primary-container transition-colors leading-tight flex-1 pr-2">
            {exercise.name}
          </h3>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container transition-colors shrink-0 text-xl">
            open_in_new
          </span>
        </div>

        {/* Muscle tags */}
        <div className="flex gap-1 flex-wrap mb-3">
          <span className="px-2 py-0.5 bg-surface-container text-on-surface text-[10px] font-black uppercase border border-surface-variant">
            {exercise.muscle_group}
          </span>
          {exercise.secondary_muscles.slice(0, 2).map((m) => (
            <span key={m} className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black uppercase border border-surface-variant">
              {m}
            </span>
          ))}
        </div>

        <p className="text-on-surface-variant text-sm flex-grow line-clamp-2 leading-relaxed">
          {exercise.form_tips}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t-2 border-surface-container flex items-center justify-between">
          <span className="text-on-surface-variant text-xs font-black uppercase tracking-widest">
            {exercise.equipment} · {exercise.category}
          </span>
          <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary-container font-black text-xs uppercase tracking-widest transition-colors">
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            {exercise.swaps.length} swaps
          </button>
        </div>
      </div>
    </div>
  );
}
