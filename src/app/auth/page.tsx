"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Authentication failed. Please try again." : null
  );
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account, then come back and log in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleGoogleAuth() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-surface font-lexend min-h-screen flex flex-col">
      <Link
        href="/"
        className="fixed top-6 left-6 z-30 inline-flex items-center gap-2 bg-black/90 border-2 border-surface-container-high px-4 py-2 font-black uppercase italic tracking-widest text-xs text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors"
      >
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
          arrow_back
        </span>
        Home
      </Link>
      <main className="flex-grow flex flex-col md:flex-row w-full relative overflow-hidden">

        {/* ── Left Hero (Desktop only) ───────────────────── */}
        <section className="hidden md:flex md:w-1/2 relative bg-surface-container-lowest border-r-2 border-surface-container-high">
          <div className="absolute inset-0 z-0">
            {/* Brutalist abstract bg */}
            <div className="w-full h-full bg-gradient-to-b from-black via-surface-container to-black opacity-100" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-16 left-8 w-64 h-2 bg-primary-container opacity-80" />
              <div className="absolute top-24 left-8 w-32 h-2 bg-primary-container opacity-40" />
              <div className="absolute bottom-48 right-8 w-48 h-2 bg-secondary-container opacity-60" />
              <div className="absolute bottom-40 right-8 w-24 h-2 bg-secondary-container opacity-30" />
              <div className="absolute top-1/3 left-0 w-full h-px bg-surface-container-high" />
              <div className="absolute top-2/3 left-0 w-full h-px bg-surface-container-high" />
            </div>
          </div>

          <div className="relative z-20 w-full h-full flex flex-col justify-end p-margin-desktop pb-24 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="border-l-4 border-primary-container pl-6">
              <h1 className="font-black text-[72px] leading-none text-on-surface uppercase italic mb-stack-sm tracking-tighter">
                Forge
                <br />
                <span className="text-primary-container">Iron.</span>
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-md">
                The Performance Lab demands everything. Enter your credentials to access elite training protocols and analytics.
              </p>
            </div>
          </div>
        </section>

        {/* ── Right Form ────────────────────────────────── */}
        <section className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop relative z-20">
          <div className="w-full max-w-md space-y-stack-md">

            {/* Header */}
            <div className="text-center mb-stack-lg">
              <h2 className="font-black text-headline-lg text-primary-container uppercase italic tracking-tighter">
                FITTRACK
              </h2>
              <h3 className="font-black text-headline-md text-on-surface uppercase mt-stack-sm">
                {mode === "login" ? "Identify" : "Enlist"}
              </h3>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="bg-error-container border-2 border-error text-on-error-container px-4 py-3 text-sm font-bold uppercase tracking-wide">
                ⚠ {error}
              </div>
            )}
            {success && (
              <div className="bg-surface-container-high border-2 border-primary-container text-primary-container px-4 py-3 text-sm font-bold uppercase tracking-wide">
                ✓ {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-stack-md bg-surface-container-low p-8 border-2 border-surface-container-high relative">
              {/* Brutalist corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-container -mt-[2px] -ml-[2px]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-container -mb-[2px] -mr-[2px]" />

              {/* Display Name (signup only) */}
              {mode === "signup" && (
                <div className="space-y-2 group">
                  <label className="block font-black text-label-bold text-on-surface-variant uppercase group-focus-within:text-primary-container group-focus-within:italic transition-all duration-200" htmlFor="displayName">
                    Operative Name
                  </label>
                  <div className="relative">
                    <input
                      id="displayName"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. IRON MIKE"
                      className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface text-body-lg p-3 transition-colors placeholder:text-surface-container-highest uppercase"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors">
                      person
                    </span>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2 group">
                <label className="block font-black text-label-bold text-on-surface-variant uppercase group-focus-within:text-primary-container group-focus-within:italic transition-all duration-200" htmlFor="email">
                  Operative Identity
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@fittrack.net"
                    className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface text-body-lg p-3 transition-colors placeholder:text-surface-container-highest"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors">
                    fingerprint
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <label className="block font-black text-label-bold text-on-surface-variant uppercase group-focus-within:text-primary-container group-focus-within:italic transition-all duration-200" htmlFor="password">
                  Clearance Code
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border-b-2 border-surface-container-high focus:border-primary-container text-on-surface text-body-lg p-3 transition-colors placeholder:text-surface-container-highest"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-surface-container-highest group-focus-within:text-primary-container transition-colors">
                    key
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-black font-black uppercase italic py-4 px-6 hover:bg-secondary-container active:bg-inverse-primary transition-colors flex justify-center items-center gap-2 mt-stack-md disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-widest"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">autorenew</span>
                    PROCESSING...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Initiate Sequence" : "Enlist Now"}
                    <span className="material-symbols-outlined font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center justify-center gap-4 py-4 opacity-50">
              <div className="h-[2px] w-full bg-surface-container-high" />
              <span className="font-black text-label-bold text-on-surface-variant uppercase whitespace-nowrap tracking-widest text-xs">
                External Breach
              </span>
              <div className="h-[2px] w-full bg-surface-container-high" />
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full border-2 border-surface-container-high bg-transparent text-on-surface font-black uppercase italic py-3 flex justify-center items-center gap-3 hover:border-primary-container hover:text-primary-container hover:bg-black transition-all text-sm tracking-widest disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Continue with Google
            </button>

            {/* Toggle mode */}
            <div className="text-center mt-stack-lg">
              <p className="text-on-surface-variant text-base">
                {mode === "login" ? "Unregistered entity?" : "Already enlisted?"}
                <button
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
                  className="text-primary-container uppercase font-black italic hover:text-inverse-primary border-b-2 border-transparent hover:border-inverse-primary transition-all ml-2 text-sm tracking-widest"
                >
                  {mode === "login" ? "Enlist Now" : "Log In"}
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-black border-t-2 border-surface-container-high">
        <div className="text-primary-container font-black text-xs uppercase tracking-widest italic">
          © 2025 FITTRACK PERFORMANCE LAB. NO WEAKNESS.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {["PRIVACY", "TERMS OF BATTLE", "SUPPORT"].map((l) => (
            <a key={l} href="#" className="text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:text-on-surface transition-opacity">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-primary-container font-black italic text-2xl uppercase">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
