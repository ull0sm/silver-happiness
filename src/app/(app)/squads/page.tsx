import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/Icon";
import { SquadActions } from "@/components/social/SquadActions";

export const metadata = { title: "Squads — IRON TRACK" };
export const dynamic = "force-dynamic";

export default async function SquadsIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("squad_members")
    .select("squads(id, name, invite_code, owner_id, created_at)")
    .eq("user_id", user.id);

  const squads = (rows ?? [])
    .map((r) => r.squads as unknown as { id: string; name: string; invite_code: string; owner_id: string; created_at: string } | null)
    .filter(Boolean) as Array<{ id: string; name: string; invite_code: string; owner_id: string; created_at: string }>;

  return (
    <div className="p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg">
      <div className="border-b-2 border-surface-variant pb-stack-md">
        <h1 className="font-display-xl text-display-xl text-white uppercase italic">SQUADS</h1>
        <p className="font-body-lg text-body-lg text-tertiary-fixed-dim mt-2 uppercase tracking-wide">
          Forge a blood pact. Compete privately.
        </p>
      </div>

      <SquadActions />

      {squads.length === 0 ? (
        <div className="border-2 border-dashed border-surface-variant p-12 text-center text-tertiary-fixed-dim uppercase">
          You haven&apos;t joined a squad yet. Create one or use an invite code above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {squads.map((sq) => (
            <Link
              key={sq.id}
              href={`/squads/${sq.id}`}
              className="bg-surface-container border-2 border-surface-variant p-6 hover:border-primary-container transition-colors flex flex-col gap-2 group"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-headline-md text-2xl text-white uppercase italic group-hover:text-primary transition-colors">
                  {sq.name}
                </h3>
                {sq.owner_id === user.id && (
                  <span className="text-xs bg-primary-container text-black px-2 py-1 uppercase font-bold">
                    OWNER
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-tertiary-fixed-dim text-sm">
                <Icon name="vpn_key" />
                <code className="font-mono uppercase">{sq.invite_code}</code>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
