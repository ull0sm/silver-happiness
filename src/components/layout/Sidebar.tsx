"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { href: "/workouts", icon: "fitness_center", label: "Workouts" },
  { href: "/exercises", icon: "menu_book", label: "Library" },
  { href: "/analytics", icon: "leaderboard", label: "Analytics" },
  { href: "/compete", icon: "groups", label: "Compete" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

interface Props {
  displayName: string;
  rank?: string;
  avatarUrl: string | null;
}

export function Sidebar({ displayName, rank = "ATHLETE", avatarUrl }: Props) {
  const path = usePathname();
  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-zinc-900 border-r-2 border-zinc-800">
      <div className="p-6 border-b-2 border-zinc-800 bg-black flex items-center justify-center h-20">
        <Link
          href="/workouts"
          className="text-3xl font-black italic text-red-600 uppercase tracking-tighter w-full text-left"
        >
          IRON TRACK
        </Link>
      </div>
      <div className="p-6 border-b-2 border-zinc-800 flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-800 border-2 border-red-600 overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-label-bold text-label-bold text-white uppercase truncate max-w-[8rem]">
            {displayName}
          </div>
          <div className="text-red-600 text-xs uppercase tracking-widest mt-1">{rank}</div>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-4 px-6 py-4 font-black italic uppercase transition-colors",
                active
                  ? "bg-red-600 text-black border-l-4 border-white"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800",
              ].join(" ")}
            >
              <Icon name={item.icon} filled={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <form action="/auth/signout" method="POST" className="p-6 border-t-2 border-zinc-800">
        <button
          type="submit"
          className="w-full text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-2 font-label-bold text-label-bold uppercase italic"
        >
          <Icon name="logout" />
          Sign Out
        </button>
      </form>
    </nav>
  );
}
