"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { createSquad, joinSquadByCode } from "@/lib/social";

export function SquadActions() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTx] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTx(async () => {
      try {
        await createSquad(name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTx(async () => {
      try {
        await joinSquadByCode(code);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <form
        onSubmit={onCreate}
        className="bg-surface-container border-2 border-primary-container p-6 flex flex-col gap-3"
      >
        <h2 className="font-headline-md text-2xl text-white uppercase italic flex items-center gap-2">
          <Icon name="groups" filled className="text-primary-container" /> Create Squad
        </h2>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Blood Pact Name"
          className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none uppercase font-label-bold"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-4 py-2 hover:bg-secondary-container disabled:opacity-50"
        >
          {pending ? "FORGING..." : "FORGE"}
        </button>
      </form>

      <form
        onSubmit={onJoin}
        className="bg-surface-container border-2 border-surface-variant p-6 flex flex-col gap-3"
      >
        <h2 className="font-headline-md text-2xl text-white uppercase italic flex items-center gap-2">
          <Icon name="vpn_key" /> Join with code
        </h2>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="INVITE CODE"
          className="bg-black border-b-2 border-surface-variant focus:border-primary-container py-2 px-3 text-white outline-none uppercase font-label-bold tracking-widest"
        />
        <button
          type="submit"
          disabled={pending}
          className="border-2 border-primary-container text-primary-container font-label-bold text-label-bold uppercase italic px-4 py-2 hover:bg-primary-container hover:text-black disabled:opacity-50"
        >
          {pending ? "JOINING..." : "JOIN"}
        </button>
      </form>

      {error && (
        <div className="md:col-span-2 bg-error-container text-on-error-container px-3 py-2 font-label-bold text-label-bold uppercase">
          {error}
        </div>
      )}
    </div>
  );
}
