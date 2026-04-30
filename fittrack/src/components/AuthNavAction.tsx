"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthNavAction() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setIsLoggedIn(Boolean(data.session));
      setReady(true);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsLoggedIn(Boolean(session));
      setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <>
        <div className="hidden md:block w-28 h-10 bg-surface-container-high animate-pulse border-2 border-surface-variant" aria-hidden="true" />
        <div className="md:hidden w-20 h-6 bg-surface-container-high animate-pulse border-2 border-surface-variant" aria-hidden="true" />
      </>
    );
  }

  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/dashboard"
          className="hidden md:inline-flex items-center justify-center w-11 h-11 bg-primary-container text-black border-2 border-black hover:bg-secondary-container transition-colors duration-150"
          aria-label="Open dashboard"
          title="Dashboard"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="md:hidden inline-flex items-center justify-center w-9 h-9 text-primary-container hover:text-secondary-container transition-colors duration-150"
          aria-label="Open dashboard"
          title="Dashboard"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth"
        className="hidden md:inline-flex bg-primary-container text-black px-6 py-2 font-black italic uppercase tracking-tighter hover:bg-secondary-container transition-colors duration-150 text-sm"
      >
        JOIN THE BATTLE
      </Link>
      <Link
        href="/auth"
        className="md:hidden text-primary-container font-black italic uppercase text-sm"
      >
        LOGIN
      </Link>
    </>
  );
}