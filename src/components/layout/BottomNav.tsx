"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { href: "/workouts", icon: "fitness_center", label: "Workouts" },
  { href: "/exercises", icon: "menu_book", label: "Library" },
  { href: "/analytics", icon: "leaderboard", label: "Analytics" },
  { href: "/compete", icon: "groups", label: "Compete" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black border-t-2 border-zinc-800 flex justify-around items-center h-16">
      {NAV.map((item) => {
        const active = path === item.href || path.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${active ? "text-red-600" : "text-zinc-500"}`}
          >
            <Icon name={item.icon} filled={active} />
            <span className="text-[10px] font-bold mt-1 uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
