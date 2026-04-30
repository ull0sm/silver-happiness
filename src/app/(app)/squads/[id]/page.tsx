import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/Icon";
import { LeaveSquadButton } from "@/components/social/LeaveSquadButton";

export const metadata = { title: "Squad — IRON TRACK" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SquadDetail({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: squad } = await supabase
    .from("squads")
    .select("id, name, invite_code, owner_id, created_at")
    .eq("id", id)
    .single();
  if (!squad) notFound();

  const { data: ranks } = await supabase.rpc("get_squad_leaderboard", { p_squad_id: id });
  const ranksTyped = (ranks ?? []) as Array<{
    rank: number;
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    weekly_volume: number;
    is_self: boolean;
  }>;

  return (
    <div className="p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-surface-variant pb-stack-md">
        <div>
          <h1 className="font-display-xl text-display-xl text-white uppercase italic">{squad.name}</h1>
          <p className="font-body-lg text-body-lg text-tertiary-fixed-dim mt-2 uppercase tracking-wide flex items-center gap-2">
            <Icon name="vpn_key" /> Invite code:{" "}
            <code className="font-mono text-primary-container">{squad.invite_code}</code>
          </p>
        </div>
        <LeaveSquadButton squadId={squad.id} />
      </div>

      <div className="bg-surface-container border-2 border-surface-variant p-6">
        <div className="flex justify-between items-end border-b-2 border-surface-variant pb-2 mb-4">
          <h2 className="font-headline-md text-headline-md text-white uppercase italic">
            Squad Leaderboard
          </h2>
          <span className="font-label-bold text-label-bold text-primary-container uppercase">
            THIS WEEK
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {ranksTyped.map((r) => {
            const accent =
              r.rank === 1
                ? "bg-surface-bright border-l-4 border-primary-container"
                : r.is_self
                  ? "bg-surface-bright border-l-4 border-secondary-container"
                  : "bg-surface-container-high border-l-4 border-surface-variant";
            const name = r.display_name ?? r.username ?? "ATHLETE";
            return (
              <div key={r.user_id} className={`flex items-center p-3 ${accent}`}>
                <div className="w-10 text-center font-headline-md text-headline-md italic text-white">
                  {r.rank}
                </div>
                <div className="w-12 h-12 bg-black ml-4 border border-surface-variant flex items-center justify-center text-white font-bold uppercase overflow-hidden">
                  {r.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    name.slice(0, 2)
                  )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="text-white font-label-bold text-label-bold uppercase truncate">
                    {name}
                  </div>
                  <div className="text-tertiary text-xs uppercase tracking-widest">
                    Volume: {Math.round(Number(r.weekly_volume)).toLocaleString()}
                  </div>
                </div>
                {r.is_self && (
                  <span className="bg-secondary-container text-black px-2 py-1 text-[10px] uppercase font-bold">
                    YOU
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
