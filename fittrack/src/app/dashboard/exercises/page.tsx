"use client";

import { useEffect, useMemo, useState } from "react";
import { type Exercise } from "@/lib/exercises-data";
import { buildExerciseImageUrl, matchesExerciseQuery } from "@/lib/exercise-catalog";
import { ExerciseModal } from "@/components/exercises/ExerciseModal";

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      setLoading(true);

      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error(`Failed to load exercises (${response.status})`);
        }

        const data = (await response.json()) as Exercise[];
        if (!cancelled) {
          setExercises(data);
        }
      } catch {
        if (!cancelled) {
          setExercises([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExercises();

    return () => {
      cancelled = true;
    };
  }, []);

  const muscleGroups = useMemo(() => {
    return ["All", ...Array.from(new Set(exercises.map((exercise) => exercise.muscle_group))).sort()];
  }, [exercises]);

  const equipmentTypes = useMemo(() => {
    return ["All", ...Array.from(new Set(exercises.map((exercise) => exercise.equipment))).sort()];
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch = matchesExerciseQuery(ex, search);
      const matchMuscle = muscle === "All" || ex.muscle_group === muscle;
      const matchEquip  = equipment === "All" || ex.equipment === equipment;
      return matchSearch && matchMuscle && matchEquip;
    });
  }, [exercises, search, muscle, equipment]);

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
        <div className="border-b-2 border-surface-container-high pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-display-xl font-black italic uppercase text-on-background leading-none tracking-tighter">
              ARSENAL
            </h1>
            <p className="font-black text-label-bold text-on-surface-variant uppercase mt-2 tracking-widest italic">
              Browse the full arsenal of movements.
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
            className="w-full bg-black border-b-2 border-surface-container-highest focus:border-primary-container text-on-surface font-label-bold text-label-bold italic uppercase px-6 py-4 placeholder:text-surface-variant transition-colors pr-14"
          />
          <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors text-2xl">
            search
          </span>
        </div>

        {/* ── Muscle Group Filter ───────────────────────── */}
        <div className="mb-4">
          <p className="text-label-bold font-black uppercase tracking-widest text-on-surface-variant mb-3">MUSCLE GROUP</p>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((g) => (
              <button
                key={g}
                onClick={() => { setMuscle(g); setVisibleCount(12); }}
                className={`px-3 py-1 text-label-bold font-black uppercase tracking-widest transition-all ${
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
          <p className="text-label-bold font-black uppercase tracking-widest text-on-surface-variant mb-3">EQUIPMENT</p>
          <div className="flex flex-wrap gap-2">
            {equipmentTypes.map((eq) => (
              <button
                key={eq}
                onClick={() => { setEquipment(eq); setVisibleCount(12); }}
                className={`px-3 py-1 text-label-bold font-black uppercase tracking-widest transition-all ${
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
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-primary-container font-black italic uppercase text-xl animate-pr-pulse mb-4">Loading the full arsenal...</div>
              <p className="text-on-surface-variant text-sm uppercase tracking-widest">Fetching the remote exercise database</p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
            <p className="font-headline-md text-headline-md italic uppercase text-on-surface mb-2">No exercises found</p>
            <p className="text-on-surface-variant text-sm">Try different filters or search terms</p>
            <button onClick={resetFilters} className="mt-6 bg-primary-container text-black font-label-bold text-label-bold italic uppercase px-6 py-3 hover:bg-secondary-container transition-colors tracking-widest">
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
              className="px-10 py-4 border-2 border-surface-variant text-on-surface font-label-bold text-label-bold italic uppercase hover:border-primary-container hover:text-primary-container transition-all tracking-widest"
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
  const previewImage = exercise.images?.[0];
  const previewText = exercise.instruction_steps?.[0] ?? exercise.form_tips;

  return (
    <div
      onClick={onClick}
      className="bg-surface-container border-2 border-black flex flex-col group cursor-pointer hover:border-primary-container transition-all duration-200"
    >
      {/* Visual area */}
      <div className="h-44 bg-surface-container-high border-b-2 border-black relative overflow-hidden">
        {previewImage ? (
          <img
            src={buildExerciseImageUrl(previewImage)}
            alt={exercise.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-7xl text-surface-container-highest group-hover:text-primary-container/60 transition-colors duration-500 relative z-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {exercise.icon}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="bg-primary-container text-black text-[10px] font-black uppercase tracking-widest px-2 py-1">
            {exercise.muscle_group}
          </span>
          <span className="bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 border border-white/20">
            {exercise.equipment}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-label-bold text-label-bold italic uppercase text-on-surface group-hover:text-primary-container transition-colors leading-tight mb-1">
          {exercise.name}
        </h3>

        <p className="text-on-surface-variant text-sm flex-grow line-clamp-3 leading-relaxed mb-3">
          {previewText}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-label-bold font-black uppercase tracking-widest">
          <span className="text-on-surface-variant text-[10px]">
            {exercise.equipment}
          </span>
          <button className="text-on-surface-variant hover:text-primary-container text-[10px] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
      </div>
    </div>
  );
}
