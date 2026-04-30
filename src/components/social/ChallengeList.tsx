"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinChallenge } from "@/lib/social";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  metric: string;
  target: number;
  starts_at: string;
  ends_at: string;
}

interface Props {
  challenges: Challenge[];
  myProgress: Record<string, number>;
  authed: boolean;
}

export function ChallengeList({ challenges, myProgress, authed }: Props) {
  const router = useRouter();
  const [pending, startTx] = useTransition();

  if (challenges.length === 0) {
    return (
      <p className="text-tertiary-fixed-dim text-sm uppercase">
        No active directives. Check back soon.
      </p>
    );
  }

  function join(id: string) {
    startTx(async () => {
      try {
        await joinChallenge(id);
        router.refresh();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {challenges.map((c) => {
        const progress = myProgress[c.id];
        const joined = progress !== undefined;
        const pct = joined ? Math.min(100, Math.round((progress! / c.target) * 100)) : 0;
        return (
          <div key={c.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white text-sm uppercase font-bold">{c.title}</span>
              {joined ? (
                <span className="text-primary-container text-xs">{pct}%</span>
              ) : authed ? (
                <button
                  onClick={() => join(c.id)}
                  disabled={pending}
                  className="text-xs bg-primary-container text-black px-2 py-1 uppercase font-bold hover:bg-secondary-container disabled:opacity-50"
                >
                  JOIN
                </button>
              ) : (
                <Link
                  href="/login?next=/compete"
                  className="text-xs border border-primary-container text-primary-container px-2 py-1 uppercase font-bold"
                >
                  LOGIN
                </Link>
              )}
            </div>
            <div className="text-xs text-tertiary-fixed-dim mb-2 uppercase tracking-wide">
              {c.metric}: {c.target.toLocaleString()}
            </div>
            <div className="h-2 bg-surface-container-high border border-black flex">
              <div
                className="bg-primary-container h-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
