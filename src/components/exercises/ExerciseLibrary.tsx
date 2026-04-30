"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import {
  toggleFavoriteExercise,
  createCustomExercise,
  getSwapSuggestions,
} from "@/lib/exercises";

interface ExerciseRow {
  id: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string | null;
  category: string | null;
  image_urls: string[];
  is_custom: boolean;
  is_favorite: boolean;
}

interface Props {
  exercises: ExerciseRow[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    muscle: string | null;
    equipment: string | null;
    q: string;
  };
}

const MUSCLES = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
];

const EQUIPMENT = ["barbell", "dumbbell", "cable", "machine", "body only", "kettlebells", "bands"];

export function ExerciseLibrary({ exercises, total, page, pageSize, filters }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [swapFor, setSwapFor] = useState<ExerciseRow | null>(null);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/exercises?${next.toString()}`);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header */}
      <div className="mb-stack-lg border-b-2 border-surface-variant pb-stack-md flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-background uppercase italic">
            Exercise Library
          </h1>
          <p className="font-body-lg text-body-lg text-outline mt-2">
            Filter and find movements to destroy weakness. {total.toLocaleString()} exercises in the arsenal.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-container text-black font-label-bold text-label-bold uppercase italic hover:bg-secondary-container transition-colors"
          >
            <Icon name="add" /> Custom
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar initial={filters.q} onSubmit={(q) => setParam("q", q || null)} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-stack-md">
        <ChipGroup
          options={MUSCLES}
          active={filters.muscle}
          onSelect={(v) => setParam("muscle", v)}
        />
        <ChipGroup
          options={EQUIPMENT}
          active={filters.equipment}
          onSelect={(v) => setParam("equipment", v)}
        />
        {(filters.muscle || filters.equipment || filters.q) && (
          <button
            onClick={() => router.push("/exercises")}
            className="px-3 py-1 border-2 border-surface-variant text-outline font-label-bold text-xs uppercase hover:border-primary hover:text-primary transition-colors"
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            onSwap={async () => setSwapFor(ex)}
          />
        ))}
        {exercises.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 border-2 border-dashed border-surface-variant p-12 text-center text-tertiary-fixed-dim uppercase">
            No exercises match. Try clearing filters or seeding the library:{" "}
            <code className="font-mono">npm run seed</code>.
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination total={total} page={page} pageSize={pageSize} />

      {showCustomModal && <CustomExerciseModal onClose={() => setShowCustomModal(false)} />}
      {swapFor && <SwapModal target={swapFor} onClose={() => setSwapFor(null)} />}
    </div>
  );
}

function SearchBar({ initial, onSubmit }: { initial: string; onSubmit: (s: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="mb-stack-md flex gap-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="SEARCH EXERCISES..."
        className="flex-1 bg-black border-b-2 border-surface-container-high focus:border-primary-container text-white font-label-bold text-label-bold uppercase italic py-3 px-4 outline-none"
      />
      <button
        type="submit"
        className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-6 py-3 hover:bg-secondary-container transition-colors"
      >
        SEARCH
      </button>
    </form>
  );
}

function ChipGroup({
  options,
  active,
  onSelect,
}: {
  options: string[];
  active: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <>
      {options.map((opt) => {
        const on = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(on ? null : opt)}
            className={`px-3 py-1 font-label-bold text-[12px] uppercase flex items-center gap-1 cursor-pointer transition-colors ${
              on
                ? "bg-primary-container text-black hover:bg-secondary-container"
                : "border-2 border-surface-variant text-outline hover:border-primary hover:text-primary"
            }`}
          >
            {opt}
            {on && <Icon name="close" className="text-[14px]" />}
          </button>
        );
      })}
    </>
  );
}

function ExerciseCard({ ex, onSwap }: { ex: ExerciseRow; onSwap: () => void }) {
  const [pending, startTx] = useTransition();
  const [fav, setFav] = useState(ex.is_favorite);

  function toggleFav() {
    startTx(async () => {
      setFav((f) => !f);
      try {
        await toggleFavoriteExercise(ex.id);
      } catch {
        setFav(ex.is_favorite);
      }
    });
  }

  return (
    <div
      className={`bg-surface-container-low border-2 border-black relative group overflow-hidden flex flex-col h-full ${
        ex.is_custom ? "border-t-secondary-container" : "border-t-primary-container"
      }`}
    >
      <div className="h-44 bg-surface-container relative border-b-2 border-surface-variant p-4 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent z-10" />
        {ex.image_urls?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ex.image_urls[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        )}
        <div className="relative z-20 text-center">
          <Icon
            name="fitness_center"
            filled
            className="text-5xl text-primary-container opacity-80"
          />
        </div>
        {ex.is_custom && (
          <span className="absolute top-2 left-2 z-20 bg-secondary-container text-black px-2 py-1 text-[10px] font-bold uppercase">
            CUSTOM
          </span>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-md text-2xl uppercase italic text-on-background leading-tight">
            {ex.name}
          </h3>
          <button
            onClick={toggleFav}
            disabled={pending}
            className={`transition-colors ${fav ? "text-primary-container" : "text-outline hover:text-primary"}`}
            aria-label={fav ? "Unfavorite" : "Favorite"}
          >
            <Icon name={fav ? "favorite" : "favorite_border"} filled={fav} />
          </button>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          {ex.primary_muscles.slice(0, 3).map((m) => (
            <span
              key={m}
              className="px-2 py-1 bg-surface-container text-on-surface font-label-bold text-[10px] uppercase border border-surface-variant"
            >
              {m}
            </span>
          ))}
          {ex.equipment && (
            <span className="px-2 py-1 bg-surface-container text-on-surface font-label-bold text-[10px] uppercase border border-surface-variant">
              {ex.equipment}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4 border-t-2 border-surface-container">
          <button
            onClick={onSwap}
            className="w-full py-2 border-2 border-outline-variant text-outline hover:border-primary hover:text-primary font-label-bold text-sm uppercase italic transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="swap_horiz" /> Swap Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ total, page, pageSize }: { total: number; page: number; pageSize: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function go(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/exercises?${next.toString()}`);
  }

  return (
    <div className="mt-stack-lg flex justify-center gap-2 items-center">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="px-4 py-2 border-2 border-surface-variant text-on-surface hover:border-primary-container hover:text-primary-container disabled:opacity-30 font-label-bold text-label-bold uppercase italic"
      >
        PREV
      </button>
      <span className="font-label-bold text-label-bold uppercase text-tertiary-fixed-dim">
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
        className="px-4 py-2 border-2 border-surface-variant text-on-surface hover:border-primary-container hover:text-primary-container disabled:opacity-30 font-label-bold text-label-bold uppercase italic"
      >
        NEXT
      </button>
    </div>
  );
}

function CustomExerciseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("chest");
  const [equipment, setEquipment] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pending, startTx] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTx(async () => {
      try {
        await createCustomExercise({
          name,
          primary_muscle: muscle,
          equipment: equipment || undefined,
          instructions: instructions || undefined,
        });
        onClose();
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-surface-container-low border-2 border-primary-container p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="font-headline-md text-headline-md text-white uppercase italic">
          New Custom Exercise
        </h2>
        <label className="flex flex-col gap-1">
          <span className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase">Primary Muscle</span>
          <select
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
          >
            {MUSCLES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase">Equipment</span>
          <input
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
            placeholder="optional"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase">Instructions</span>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="bg-black border-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
            placeholder="optional"
          />
        </label>
        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-surface-variant text-on-surface px-4 py-2 font-label-bold text-label-bold uppercase italic"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="bg-primary-container text-black px-4 py-2 font-label-bold text-label-bold uppercase italic hover:bg-secondary-container disabled:opacity-50"
          >
            {pending ? "Saving..." : "Forge It"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SwapModal({ target, onClose }: { target: ExerciseRow; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<{ id: string; name: string; primary_muscles: string[] }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getSwapSuggestions(target.id);
      if (!cancelled) {
        setList(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [target.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-low border-2 border-primary-container p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="font-headline-md text-headline-md text-white uppercase italic">
          Swap for {target.name}
        </h2>
        <p className="text-tertiary-fixed-dim font-body-md">Same primary muscle. Pick a sub.</p>
        {loading ? (
          <div className="text-tertiary-fixed-dim uppercase">Searching...</div>
        ) : list.length === 0 ? (
          <div className="text-tertiary-fixed-dim uppercase">No alternatives found.</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((s) => (
              <li
                key={s.id}
                className="bg-black border-l-4 border-primary-container px-3 py-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-label-bold text-label-bold text-white uppercase">
                    {s.name}
                  </div>
                  <div className="text-xs text-tertiary-fixed-dim uppercase">
                    {s.primary_muscles.join(" • ")}
                  </div>
                </div>
                <Icon name="swap_horiz" className="text-primary-container" />
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="border-2 border-surface-variant text-on-surface px-4 py-2 font-label-bold text-label-bold uppercase italic"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
