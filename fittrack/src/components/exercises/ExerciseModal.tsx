"use client";

import { Exercise } from "@/lib/exercises-data";
import { buildExerciseImageUrl } from "@/lib/exercise-catalog";

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     "bg-surface-container-high text-on-surface-variant",
  intermediate: "bg-secondary-container text-black",
  advanced:     "bg-primary-container text-black",
};

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  if (!exercise) return null;

  const primaryImage = exercise.images?.[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border-2 border-surface-container-high w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-surface-container-high border-b-2 border-black p-6 flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-container" />
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="bg-primary-container text-black text-xs font-black uppercase px-2 py-1 tracking-widest">
                {exercise.muscle_group}
              </span>
              <span className="bg-surface-variant text-on-surface text-xs font-black uppercase px-2 py-1 tracking-widest">
                {exercise.category}
              </span>
              <span className={`text-xs font-black uppercase px-2 py-1 tracking-widest ${DIFFICULTY_COLOR[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
            </div>
            <h2 className="text-3xl font-black italic uppercase text-on-surface leading-tight">
              {exercise.name}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1 font-bold uppercase tracking-widest">
              {exercise.equipment}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary-container transition-colors ml-4 shrink-0"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {primaryImage && (
            <div className="overflow-hidden border-2 border-surface-container-high bg-black">
              <img
                src={buildExerciseImageUrl(primaryImage)}
                alt={exercise.name}
                className="h-72 w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {exercise.primary_muscles?.length ? (
              exercise.primary_muscles.map((muscle) => (
                <span key={muscle} className="px-2 py-1 bg-surface-container-high border border-surface-variant text-on-surface text-xs font-black uppercase tracking-widest">
                  {muscle}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-surface-container-high border border-surface-variant text-on-surface text-xs font-black uppercase tracking-widest">
                {exercise.muscle_group}
              </span>
            )}
            {exercise.force && (
              <span className="px-2 py-1 bg-surface-container border border-surface-variant text-on-surface-variant text-xs font-black uppercase tracking-widest">
                {exercise.force}
              </span>
            )}
            {exercise.mechanic && (
              <span className="px-2 py-1 bg-surface-container border border-surface-variant text-on-surface-variant text-xs font-black uppercase tracking-widest">
                {exercise.mechanic}
              </span>
            )}
            {exercise.level && (
              <span className="px-2 py-1 bg-surface-container border border-surface-variant text-on-surface-variant text-xs font-black uppercase tracking-widest">
                {exercise.level}
              </span>
            )}
          </div>

          {/* Secondary muscles */}
          {exercise.secondary_muscles.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                Secondary Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.secondary_muscles.map((m) => (
                  <span key={m} className="px-2 py-1 bg-surface-container border border-surface-variant text-on-surface text-xs font-black uppercase">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-container mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
              INSTRUCTIONS
            </h3>
            {exercise.instruction_steps?.length ? (
              <ol className="space-y-3 border-l-4 border-primary-container pl-4">
                {exercise.instruction_steps.map((step, index) => (
                  <li key={`${exercise.id}-${index}`} className="text-on-surface text-base leading-relaxed">
                    <span className="font-black text-primary-container mr-2">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-on-surface text-base leading-relaxed border-l-4 border-primary-container pl-4">
                {exercise.instructions}
              </p>
            )}
          </div>

          {/* Form tips */}
          <div className="bg-surface-container border-2 border-surface-container-high p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              QUICK TIP
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {exercise.form_tips}
            </p>
          </div>

          {/* Swap suggestions */}
          {exercise.swaps.length > 0 && (
            <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              SWAP SUGGESTIONS
            </h3>
            <div className="flex flex-col gap-2">
              {exercise.swaps.map((swap) => (
                <div key={swap} className="flex items-center gap-3 p-3 border-l-2 border-surface-variant hover:border-primary-container transition-colors bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">swap_horiz</span>
                  <span className="text-on-surface font-black uppercase text-sm tracking-wide">{swap}</span>
                </div>
              ))}
            </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2 border-t-2 border-surface-container-high">
            <button className="flex-1 bg-primary-container text-black font-black italic uppercase py-4 hover:bg-secondary-container transition-colors text-sm tracking-widest flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Add to Workout
            </button>
            <button
              onClick={onClose}
              className="px-6 border-2 border-surface-container-high text-on-surface-variant font-black italic uppercase hover:border-primary-container hover:text-primary-container transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
