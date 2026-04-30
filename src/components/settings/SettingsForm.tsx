"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/profile";

interface Props {
  email: string;
  initial: {
    display_name: string;
    username: string;
    weight_unit: "kg" | "lb";
    region: string;
  };
}

export function SettingsForm({ email, initial }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.display_name);
  const [username, setUsername] = useState(initial.username);
  const [unit, setUnit] = useState<"kg" | "lb">(initial.weight_unit);
  const [region, setRegion] = useState(initial.region);
  const [pending, startTx] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    startTx(async () => {
      try {
        await updateProfile({
          display_name: displayName,
          username,
          weight_unit: unit,
          region: region || null,
        });
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <form onSubmit={submit} className="bg-surface-container-low border-2 border-surface-container-high p-6 flex flex-col gap-4">
      <Field label="Email">
        <input
          disabled
          value={email}
          className="bg-black border-b-2 border-surface-variant py-2 px-3 text-tertiary-fixed-dim opacity-60 cursor-not-allowed"
        />
      </Field>
      <Field label="Display Name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
        />
      </Field>
      <Field label="Username (lowercase, leaderboard tag)">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none uppercase"
          placeholder="iron_beast"
        />
      </Field>
      <Field label="Weight Unit">
        <div className="flex gap-2">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-6 py-2 font-label-bold text-label-bold uppercase italic border-2 ${
                unit === u
                  ? "bg-primary-container text-black border-primary-container"
                  : "bg-transparent text-on-surface border-surface-variant hover:border-primary-container"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Region (for leaderboard filter)">
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none"
          placeholder="e.g. NA, EU, IN"
        />
      </Field>
      {error && (
        <div className="bg-error-container text-on-error-container px-3 py-2 font-label-bold text-label-bold uppercase">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-primary-container text-black px-3 py-2 font-label-bold text-label-bold uppercase">
          Profile saved.
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-6 py-3 hover:bg-secondary-container disabled:opacity-50"
        >
          {pending ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-label-bold text-label-bold text-tertiary-fixed-dim uppercase">{label}</span>
      {children}
    </label>
  );
}
