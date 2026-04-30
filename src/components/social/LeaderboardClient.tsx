"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface PublicRow {
  rank: number;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  weekly_volume: number;
}

interface FullRow extends PublicRow {
  is_self: boolean;
}

interface Props {
  top5: PublicRow[];
  full: FullRow[] | null;
  authed: boolean;
  scope: "global" | "friends";
}

export function LeaderboardClient({ top5, full, authed, scope }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  function setScope(s: "global" | "friends") {
    const next = new URLSearchParams(params.toString());
    next.set("scope", s);
    router.push(`/compete?${next.toString()}`);
  }

  // ranks 6+
  const rest = (full ?? []).filter((r) => r.rank > 5);

  return (
    <div className="bg-surface-container border-2 border-surface-variant p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container opacity-10 blur-3xl" />
      <div className="flex justify-between items-end border-b-2 border-surface-variant pb-4 mb-6 relative z-10 gap-2 flex-wrap">
        <h2 className="text-headline-md font-headline-md text-white uppercase italic">
          {scope === "friends" ? "Squad Top" : "Global Top"}
        </h2>
        <div className="flex gap-2">
          {authed && (
            <>
              <button
                onClick={() => setScope("global")}
                className={`text-label-bold font-label-bold uppercase px-3 py-1 border ${
                  scope === "global"
                    ? "bg-primary-container text-black border-primary-container"
                    : "border-surface-variant text-tertiary-fixed-dim hover:border-primary-container hover:text-primary-container"
                }`}
              >
                GLOBAL
              </button>
              <button
                onClick={() => setScope("friends")}
                className={`text-label-bold font-label-bold uppercase px-3 py-1 border ${
                  scope === "friends"
                    ? "bg-primary-container text-black border-primary-container"
                    : "border-surface-variant text-tertiary-fixed-dim hover:border-primary-container hover:text-primary-container"
                }`}
              >
                SQUADS
              </button>
            </>
          )}
          <span className="text-label-bold font-label-bold text-primary-container uppercase bg-on-primary-fixed bg-opacity-30 px-3 py-1 border border-primary-container">
            THIS WEEK
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {top5.length === 0 && (
          <div className="text-tertiary-fixed-dim font-label-bold text-label-bold uppercase py-8 text-center">
            No volume logged this week. Be the first.
          </div>
        )}
        {top5.map((row) => (
          <Row key={row.user_id} row={row} self={false} />
        ))}
        {authed &&
          rest.map((row) => <Row key={row.user_id} row={row} self={row.is_self} />)}
      </div>

      {!authed && (
        <div className="mt-6 flex justify-center">
          <Link
            href="/login?next=/compete"
            className="bg-primary-container text-black font-label-bold text-label-bold uppercase italic px-8 py-4 hover:bg-secondary-container transition-colors border-2 border-black"
          >
            LOGIN TO SEE MORE
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ row, self }: { row: PublicRow & { is_self?: boolean }; self: boolean }) {
  const accent =
    row.rank === 1
      ? "bg-surface-bright border-l-4 border-primary-container text-primary-container"
      : self
        ? "bg-surface-bright border-l-4 border-secondary-container text-secondary-container"
        : "bg-surface-container-high border-l-4 border-surface-variant text-white";
  const name = row.display_name ?? row.username ?? "ATHLETE";

  return (
    <div className={`flex items-center p-3 hover:bg-surface-variant transition-colors group ${accent}`}>
      <div className="w-10 text-center font-headline-md text-headline-md italic">{row.rank}</div>
      <div className="w-12 h-12 bg-black ml-4 border border-surface-variant overflow-hidden flex items-center justify-center text-white font-bold uppercase">
        {row.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.avatar_url}
            alt=""
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
          />
        ) : (
          name.slice(0, 2)
        )}
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <div className="text-white font-label-bold text-label-bold uppercase truncate">{name}</div>
        <div className="text-tertiary text-xs uppercase tracking-widest">
          Volume: {Math.round(row.weekly_volume).toLocaleString()}
        </div>
      </div>
      {row.rank === 1 && (
        <Icon name="local_fire_department" filled className="text-primary-container" />
      )}
      {self && (
        <span className="bg-secondary-container text-black px-2 py-1 text-[10px] uppercase font-bold ml-2">
          YOU
        </span>
      )}
    </div>
  );
}
