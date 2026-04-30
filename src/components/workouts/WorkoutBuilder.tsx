"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@/components/ui/Icon";
import { saveCustomTemplate } from "@/lib/workouts";
import { createClient } from "@/lib/supabase/client";

interface PoolExercise {
  id: string;
  name: string;
  primary_muscles: string[];
  category: string | null;
}

interface RoutineExercise {
  exercise_id: string;
  name: string;
  primary_muscles: string[];
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
}

interface Props {
  initialPool: PoolExercise[];
  initialTemplate: {
    id: string;
    name: string;
    description: string | null;
    split: string | null;
  } | null;
  initialExercises: RoutineExercise[];
}

const MUSCLE_TAGS = ["chest", "back", "legs", "shoulders", "arms", "core"];

export function WorkoutBuilder({ initialPool, initialTemplate, initialExercises }: Props) {
  const router = useRouter();
  const [pool, setPool] = useState<PoolExercise[]>(initialPool);
  const [routine, setRoutine] = useState<RoutineExercise[]>(initialExercises);
  const [name, setName] = useState(initialTemplate?.name ?? "Untitled Workout");
  const [description, setDescription] = useState(initialTemplate?.description ?? "");
  const [search, setSearch] = useState("");
  const [activeMuscle, setActiveMuscle] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredPool = useMemo(() => {
    let xs = pool;
    if (search.trim()) {
      const q = search.toLowerCase();
      xs = xs.filter((e) => e.name.toLowerCase().includes(q));
    }
    if (activeMuscle) {
      xs = xs.filter((e) =>
        e.primary_muscles.some((m) => m.toLowerCase().includes(activeMuscle)),
      );
    }
    return xs;
  }, [pool, search, activeMuscle]);

  async function searchRemote(q: string) {
    setSearch(q);
    if (q.length < 2) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("exercises")
      .select("id, name, primary_muscles, category")
      .ilike("name", `%${q}%`)
      .limit(40);
    if (data) {
      // Merge new results with existing pool, keeping uniqueness
      setPool((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const e of data) {
          if (!ids.has(e.id)) merged.push(e as PoolExercise);
        }
        return merged;
      });
    }
  }

  function addToRoutine(ex: PoolExercise) {
    if (routine.find((r) => r.exercise_id === ex.id)) return;
    setRoutine((r) => [
      ...r,
      {
        exercise_id: ex.id,
        name: ex.name,
        primary_muscles: ex.primary_muscles,
        target_sets: 3,
        target_reps: "8-12",
        rest_seconds: 90,
      },
    ]);
  }

  function removeFromRoutine(id: string) {
    setRoutine((r) => r.filter((x) => x.exercise_id !== id));
  }

  function updateRoutine(id: string, patch: Partial<RoutineExercise>) {
    setRoutine((r) => r.map((x) => (x.exercise_id === id ? { ...x, ...patch } : x)));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setRoutine((items) => {
      const oldIdx = items.findIndex((x) => x.exercise_id === active.id);
      const newIdx = items.findIndex((x) => x.exercise_id === over.id);
      if (oldIdx < 0 || newIdx < 0) return items;
      return arrayMove(items, oldIdx, newIdx);
    });
  }

  function onSave() {
    setSaved(false);
    startTransition(async () => {
      try {
        const res = await saveCustomTemplate({
          name,
          description,
          templateId: initialTemplate?.id,
          exercises: routine.map((r, i) => ({
            exercise_id: r.exercise_id,
            position: i,
            target_sets: r.target_sets,
            target_reps: r.target_reps,
            rest_seconds: r.rest_seconds,
          })),
        });
        setSaved(true);
        if (!initialTemplate) {
          router.replace(`/workouts/builder?id=${res.templateId}`);
        }
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Pool */}
      <div className="lg:col-span-5 bg-surface-container-high border-2 border-black p-4 flex flex-col h-[600px]">
        <input
          className="w-full bg-black border-b-2 border-surface-container-highest focus:border-primary-container focus:ring-0 text-white font-label-bold text-label-bold uppercase italic py-3 px-4 transition-colors placeholder:text-surface-variant outline-none"
          placeholder="SEARCH EXERCISES..."
          value={search}
          onChange={(e) => searchRemote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 my-4">
          {MUSCLE_TAGS.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMuscle((cur) => (cur === m ? null : m))}
              className={`font-label-bold text-label-bold px-3 py-1 uppercase transition-colors ${
                activeMuscle === m
                  ? "bg-primary-container text-black"
                  : "bg-surface-variant text-white hover:bg-primary-container hover:text-black"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto pr-2 flex-1">
          {filteredPool.length === 0 ? (
            <div className="text-center text-tertiary-fixed-dim py-8 uppercase font-label-bold text-label-bold">
              No matches.
            </div>
          ) : (
            filteredPool.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addToRoutine(ex)}
                className="bg-black border-l-4 border-surface-variant p-3 flex items-center justify-between cursor-pointer hover:border-primary-container transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon name="drag_indicator" className="text-surface-variant group-hover:text-primary-container" />
                  <div>
                    <div className="font-label-bold text-label-bold text-white uppercase">
                      {ex.name}
                    </div>
                    <div className="font-body-md text-xs text-tertiary-fixed-dim uppercase">
                      {ex.category ?? "MOVEMENT"} • {(ex.primary_muscles[0] ?? "").toUpperCase()}
                    </div>
                  </div>
                </div>
                <Icon name="add" className="text-surface-variant group-hover:text-primary-container" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-7 bg-surface-container-highest border-2 border-primary-container p-6 flex flex-col h-[600px] relative shadow-[inset_0_0_20px_rgba(230,0,0,0.1)]">
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <input
              className="bg-transparent border-none text-white font-headline-md text-headline-md uppercase italic p-0 focus:ring-0 w-full placeholder:text-surface-variant outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="bg-transparent border-none text-tertiary-fixed-dim text-sm uppercase tracking-wide w-full mt-1 outline-none"
              value={description}
              placeholder="ADD A DESCRIPTION..."
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="font-label-bold text-label-bold text-primary mt-1">
              {routine.length} EXERCISES • {routine.reduce((a, r) => a + r.target_sets, 0)} SETS
            </div>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={pending || routine.length === 0}
            className="bg-primary-container text-black font-label-bold text-label-bold px-6 py-3 uppercase italic hover:bg-secondary-container transition-colors disabled:opacity-50"
          >
            {pending ? "SAVING..." : saved ? "SAVED" : "SAVE"}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          {routine.length === 0 ? (
            <div className="h-full border-2 border-dashed border-surface-variant bg-black/50 flex flex-col items-center justify-center p-8 text-center">
              <Icon name="downloading" className="text-[48px] text-surface-variant mb-4" />
              <div className="font-headline-md text-headline-md text-surface-variant uppercase italic">
                CLICK EXERCISES TO ADD
              </div>
              <div className="font-body-md text-body-md text-tertiary-fixed-dim mt-2 uppercase">
                Build your routine set by set
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={routine.map((r) => r.exercise_id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {routine.map((ex) => (
                    <SortableRow
                      key={ex.exercise_id}
                      ex={ex}
                      onRemove={() => removeFromRoutine(ex.exercise_id)}
                      onUpdate={(patch) => updateRoutine(ex.exercise_id, patch)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableRow({
  ex,
  onRemove,
  onUpdate,
}: {
  ex: RoutineExercise;
  onRemove: () => void;
  onUpdate: (patch: Partial<RoutineExercise>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ex.exercise_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-black border-l-4 border-primary-container p-3 flex items-center justify-between gap-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-tertiary-fixed-dim hover:text-primary-container"
        aria-label="Reorder"
      >
        <Icon name="drag_indicator" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-label-bold text-label-bold text-white uppercase truncate">{ex.name}</div>
        <div className="text-xs text-tertiary-fixed-dim uppercase">
          {(ex.primary_muscles[0] ?? "Movement").toUpperCase()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-tertiary-fixed-dim uppercase">SETS</label>
        <input
          type="number"
          min={1}
          max={20}
          value={ex.target_sets}
          onChange={(e) => onUpdate({ target_sets: Math.max(1, Number(e.target.value) || 1) })}
          className="w-12 bg-surface-container border border-surface-variant text-white text-center py-1 font-label-bold"
        />
        <label className="text-[10px] text-tertiary-fixed-dim uppercase">REPS</label>
        <input
          type="text"
          value={ex.target_reps}
          onChange={(e) => onUpdate({ target_reps: e.target.value })}
          className="w-16 bg-surface-container border border-surface-variant text-white text-center py-1 font-label-bold"
        />
        <label className="text-[10px] text-tertiary-fixed-dim uppercase">REST</label>
        <input
          type="number"
          min={0}
          max={600}
          step={15}
          value={ex.rest_seconds}
          onChange={(e) => onUpdate({ rest_seconds: Math.max(0, Number(e.target.value) || 0) })}
          className="w-16 bg-surface-container border border-surface-variant text-white text-center py-1 font-label-bold"
        />
      </div>
      <button
        onClick={onRemove}
        className="text-tertiary-fixed-dim hover:text-error transition-colors"
        aria-label="Remove"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}
