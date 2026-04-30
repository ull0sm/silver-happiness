"use client";

import { useTransition } from "react";
import { leaveSquad } from "@/lib/social";

export function LeaveSquadButton({ squadId }: { squadId: string }) {
  const [pending, startTx] = useTransition();
  return (
    <button
      onClick={() => {
        if (!confirm("Leave this squad?")) return;
        startTx(async () => {
          await leaveSquad(squadId);
        });
      }}
      disabled={pending}
      className="border-2 border-error text-error font-label-bold text-label-bold uppercase italic px-4 py-2 hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
    >
      {pending ? "LEAVING..." : "LEAVE SQUAD"}
    </button>
  );
}
