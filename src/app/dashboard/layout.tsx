"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",           icon: "home",           label: "HOME" },
  { href: "/dashboard/workouts",  icon: "fitness_center", label: "WORKOUTS" },
  { href: "/dashboard/exercises", icon: "sports_gymnastics", label: "EXERCISES" },
  { href: "/dashboard/active",    icon: "play_circle",    label: "ACTIVE" },
  { href: "/dashboard/progress",  icon: "monitoring",     label: "PROGRESS" },
  { href: "/dashboard/social",    icon: "groups",         label: "COMPETE" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="bg-background text-on-surface font-lexend min-h-screen flex">

      {/* ── Sidebar (Desktop) ───────────────────────────── */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 bg-surface-container-lowest border-r-2 border-surface-container-high">

        {/* Brand */}
        <div className="p-6 border-b-2 border-surface-container-high bg-black flex items-center h-20">
          <span className="text-2xl font-black italic text-primary-container uppercase tracking-tighter">
            FITTRACK
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex flex-col mt-4 flex-grow overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 font-black italic uppercase text-sm tracking-wider transition-all duration-150 ${
                  active
                    ? "bg-primary-container text-black border-l-4 border-black"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-4 border-transparent"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-6 border-t-2 border-surface-container-high">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors font-black italic uppercase text-sm tracking-wider"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* ── Mobile Header ─────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-black border-b-2 border-surface-container-high">
        <span className="text-xl font-black italic text-primary-container uppercase tracking-tighter">FITTRACK</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-on-surface-variant hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">{mobileOpen ? "close" : "menu"}</span>
        </button>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-surface-container-lowest border-r-2 border-surface-container-high flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b-2 border-surface-container-high h-16 flex items-center">
              <span className="text-xl font-black italic text-primary-container uppercase tracking-tighter">FITTRACK</span>
            </div>
            <div className="flex flex-col mt-4 flex-grow">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 font-black italic uppercase text-sm tracking-wider transition-all duration-150 ${
                      active
                        ? "bg-primary-container text-black border-l-4 border-black"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l-4 border-transparent"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-6 border-t-2 border-surface-container-high">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors font-black italic uppercase text-sm"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────── */}
      <main className="flex-1 md:ml-64 mt-16 md:mt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
