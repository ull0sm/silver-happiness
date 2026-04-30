import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { LeaderboardClient } from "@/components/social/LeaderboardClient";
import { ChallengeList } from "@/components/social/ChallengeList";

export const metadata = { title: "Battleground — IRON TRACK" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ scope?: "global" | "friends"; region?: string }>;
}

export default async function ComputePage({ searchParams }: Props) {
  const params = await searchParams;
  const scope = params.scope === "friends" ? "friends" : "global";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Public top-5 (anon-callable)
  const { data: top5 } = await supabase.rpc("get_public_top5");

  // 2. Full leaderboard if authed
  let full: Array<{
    rank: number;
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    weekly_volume: number;
    is_self: boolean;
  }> | null = null;
  if (user) {
    const { data } = await supabase.rpc("get_full_leaderboard", {
      p_scope: scope,
      p_region: params.region ?? null,
    });
    full = (data ?? []) as typeof full;
  }

  // 3. Active challenges + my participation
  const now = new Date().toISOString();
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, description, metric, target, starts_at, ends_at")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("ends_at", { ascending: true });

  let myProgress: Record<string, number> = {};
  if (user) {
    const { data: cps } = await supabase
      .from("challenge_participants")
      .select("challenge_id, progress")
      .eq("user_id", user.id);
    myProgress = Object.fromEntries((cps ?? []).map((c) => [c.challenge_id, Number(c.progress)]));
  }

  // 4. Squads (only if authed)
  let mySquads: { id: string; name: string }[] = [];
  if (user) {
    const { data: rows } = await supabase
      .from("squad_members")
      .select("squads(id, name)")
      .eq("user_id", user.id);
    mySquads = (rows ?? [])
      .map((r) => r.squads as unknown as { id: string; name: string } | null)
      .filter(Boolean) as { id: string; name: string }[];
  }

  // Profile for sidebar
  let profile: { display_name: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, username")
      .eq("id", user.id)
      .single();
    profile = data
      ? { display_name: data.display_name ?? data.username, avatar_url: data.avatar_url }
      : null;
  }

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Athlete";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {user ? (
        <>
          <TopBar />
          <Sidebar displayName={displayName} avatarUrl={profile?.avatar_url ?? null} />
        </>
      ) : (
        <PublicTopBar />
      )}
      <div className={`flex-1 ${user ? "mt-16 md:mt-0 md:ml-64" : "mt-20"} bg-background min-h-screen flex flex-col`}>
        <main className="flex-1 p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg">
          <div className="flex flex-col gap-2">
            <h1 className="text-display-xl font-display-xl text-white uppercase italic tracking-tighter">
              BATTLEGROUND
            </h1>
            <p className="text-body-lg font-body-lg text-tertiary uppercase tracking-widest border-l-2 border-primary-container pl-4">
              Prove your worth. Crush the weak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Leaderboard column */}
            <div className="md:col-span-8">
              <LeaderboardClient
                top5={(top5 ?? []) as never}
                full={full}
                authed={!!user}
                scope={scope}
              />
            </div>

            {/* Squads + Challenges */}
            <div className="md:col-span-4 flex flex-col gap-gutter">
              {/* Squads */}
              <div className="bg-surface-container border-2 border-surface-variant p-6 flex flex-col gap-stack-sm">
                <div className="flex justify-between items-end border-b-2 border-surface-variant pb-2">
                  <h3 className="text-body-lg font-body-lg text-white uppercase italic">SQUADS</h3>
                  <Icon name="groups" className="text-tertiary" />
                </div>
                {user ? (
                  mySquads.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {mySquads.map((sq) => (
                        <li key={sq.id}>
                          <Link
                            href={`/squads/${sq.id}`}
                            className="block bg-surface-bright p-2 border-l-2 border-primary-container text-white uppercase font-label-bold text-label-bold hover:bg-surface-variant transition-colors"
                          >
                            {sq.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-tertiary-fixed-dim text-sm uppercase">
                      You haven&apos;t joined a squad yet.
                    </p>
                  )
                ) : (
                  <p className="text-tertiary-fixed-dim text-sm uppercase">
                    Login to join or create a squad.
                  </p>
                )}
                {user && (
                  <Link
                    href="/squads"
                    className="mt-2 border-2 border-primary-container text-primary-container font-label-bold text-label-bold uppercase py-2 text-center hover:bg-primary-container hover:text-black transition-colors"
                  >
                    MANAGE SQUADS
                  </Link>
                )}
              </div>

              {/* Challenges */}
              <div className="bg-surface-container border-2 border-surface-variant p-6">
                <div className="flex justify-between items-end border-b-2 border-surface-variant pb-2 mb-4">
                  <h3 className="text-body-lg font-body-lg text-white uppercase italic">
                    ACTIVE DIRECTIVES
                  </h3>
                  <Icon name="military_tech" className="text-tertiary" />
                </div>
                <ChallengeList
                  challenges={(challenges ?? []).map((c) => ({
                    ...c,
                    target: Number(c.target),
                  }))}
                  myProgress={myProgress}
                  authed={!!user}
                />
              </div>
            </div>
          </div>
        </main>
        {user && <Footer />}
      </div>
      {user && <BottomNav />}
      {user && <div className="md:hidden h-16" />}
    </div>
  );
}

function PublicTopBar() {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-20 bg-black border-b-2 border-zinc-900">
      <Link href="/" className="text-2xl font-black italic text-red-600 tracking-tighter">
        IRON TRACK
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/login"
          className="text-zinc-400 font-bold uppercase italic tracking-tighter hover:text-red-500"
        >
          LOGIN
        </Link>
        <Link
          href="/signup"
          className="bg-red-600 text-black px-6 py-2 font-black italic uppercase tracking-tighter hover:bg-red-500"
        >
          ENLIST
        </Link>
      </div>
    </nav>
  );
}
