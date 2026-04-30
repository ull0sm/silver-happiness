"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";

interface Props {
  mode: "login" | "signup";
  searchParamsPromise: Promise<{ next?: string; error?: string }>;
}

export function AuthForm({ mode, searchParamsPromise }: Props) {
  const params = use(searchParamsPromise);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(params.error ?? null);
  const [info, setInfo] = useState<string | null>(null);

  const next = params.next ?? "/workouts";

  function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        router.replace(next);
        router.refresh();
      } else {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setInfo("Check your email to confirm your account.");
        }
      }
    });
  }

  async function onGoogle() {
    setError(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <>
      <form onSubmit={onEmailSubmit} className="space-y-stack-md bg-surface-container-low p-8 border-2 border-surface-container-high relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-container -mt-[2px] -ml-[2px]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-container -mb-[2px] -mr-[2px]" />

        <div className="space-y-2 group">
          <label
            className="block font-label-bold text-label-bold text-on-surface-variant uppercase group-focus-within:text-primary-container group-focus-within:italic transition-all duration-200"
            htmlFor="email"
          >
            Operative Identity
          </label>
          <div className="relative">
            <input
              className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-body-lg text-body-lg p-3 outline-none transition-colors placeholder-surface-container-highest"
              id="email"
              type="email"
              placeholder="athlete@irontrack.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Icon
              name="fingerprint"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label
            className="block font-label-bold text-label-bold text-on-surface-variant uppercase group-focus-within:text-primary-container group-focus-within:italic transition-all duration-200"
            htmlFor="password"
          >
            Clearance Code
          </label>
          <div className="relative">
            <input
              className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface font-body-lg text-body-lg p-3 outline-none transition-colors placeholder-surface-container-highest"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
            />
            <Icon
              name="key"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-3 py-2 font-label-bold text-label-bold uppercase">
            {error}
          </div>
        )}
        {info && (
          <div className="bg-primary-container text-black px-3 py-2 font-label-bold text-label-bold uppercase">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary-container text-black font-label-bold text-label-bold uppercase italic font-black py-4 px-6 hover:bg-secondary-container active:bg-inverse-primary transition-colors flex justify-center items-center gap-2 mt-stack-md disabled:opacity-50"
        >
          {pending ? "Working..." : mode === "login" ? "Initiate Sequence" : "Enlist Now"}
          <Icon name="arrow_forward" filled />
        </button>
      </form>

      <div className="flex items-center justify-center gap-4 py-4 opacity-50">
        <div className="h-[2px] w-full bg-surface-container-high" />
        <span className="font-label-bold text-label-bold text-on-surface-variant uppercase whitespace-nowrap">
          External Breach
        </span>
        <div className="h-[2px] w-full bg-surface-container-high" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        className="w-full border-2 border-surface-container-high bg-transparent text-on-surface font-label-bold text-label-bold uppercase italic py-3 flex justify-center items-center gap-2 hover:border-primary-container hover:text-primary-container hover:bg-black transition-all"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
        </svg>
        Continue with Google
      </button>
    </>
  );
}
