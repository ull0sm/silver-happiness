import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata = { title: "Settings — IRON TRACK" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, weight_unit, region, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-margin-mobile md:p-margin-desktop flex flex-col gap-stack-lg max-w-2xl">
      <div className="border-b-2 border-surface-variant pb-stack-md">
        <h1 className="font-display-xl text-display-xl text-white uppercase italic">SETTINGS</h1>
        <p className="font-body-lg text-body-lg text-tertiary-fixed-dim mt-2 uppercase tracking-wide">
          Configure your operative profile.
        </p>
      </div>
      <SettingsForm
        email={user.email ?? ""}
        initial={{
          display_name: profile?.display_name ?? "",
          username: profile?.username ?? "",
          weight_unit: (profile?.weight_unit as "kg" | "lb") ?? "kg",
          region: profile?.region ?? "",
        }}
      />
    </div>
  );
}
