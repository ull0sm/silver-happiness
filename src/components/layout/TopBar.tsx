import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-black border-b-2 border-zinc-800 md:hidden">
      <Link href="/workouts" className="text-2xl font-black italic text-red-600 uppercase tracking-tighter">
        IRON TRACK
      </Link>
      <div className="flex items-center gap-2 text-zinc-400">
        <Link href="/analytics" className="p-2 hover:text-red-500">
          <Icon name="notifications" />
        </Link>
        <Link href="/settings" className="p-2 hover:text-red-500">
          <Icon name="account_circle" />
        </Link>
      </div>
    </header>
  );
}
