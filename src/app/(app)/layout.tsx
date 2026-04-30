import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ?? profile?.username ?? user.email?.split("@")[0] ?? "Athlete";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <TopBar />
      <Sidebar displayName={displayName} avatarUrl={profile?.avatar_url ?? null} />
      <div className="flex-1 mt-16 md:mt-0 md:ml-64 bg-background min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <BottomNav />
      <div className="md:hidden h-16" />
    </div>
  );
}
