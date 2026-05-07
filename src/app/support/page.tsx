"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileWidgetKey((value) => value + 1);
  }

  const handleTurnstileError = useCallback(() => {
    setStatus("error");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!turnstileToken) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    const token = turnstileToken;
    resetTurnstile();

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, turnstileToken: token }),
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-background text-on-background font-lexend min-h-screen px-margin-mobile md:px-margin-desktop py-24">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black italic mb-6">Support</h1>

        <p className="text-on-surface-variant mb-6">Have feedback, found a bug, or want to suggest a feature? Send us a message and we&apos;ll review it.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="font-bold">Name (optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-3 bg-surface-container border-2 border-black" />
          </label>

          <label className="flex flex-col text-sm">
            <span className="font-bold">Email</span>
            <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 p-3 bg-surface-container border-2 border-black" />
          </label>

          <label className="flex flex-col text-sm">
            <span className="font-bold">Message</span>
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-2 p-3 bg-surface-container border-2 border-black" />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-black text-xs uppercase tracking-widest text-on-surface-variant">Human Verification</span>
              <button
                type="button"
                onClick={resetTurnstile}
                className="text-xs font-black uppercase tracking-widest text-primary-container hover:text-inverse-primary transition-colors"
              >
                Refresh
              </button>
            </div>
            <TurnstileWidget
              key={turnstileWidgetKey}
              siteKey={turnstileSiteKey}
              action="support"
              resetKey={turnstileWidgetKey}
              onTokenChange={setTurnstileToken}
              onError={handleTurnstileError}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-primary-container text-black font-black italic uppercase px-6 py-3 border-4 border-black hover:bg-secondary-container transition-colors"
              disabled={status === "sending" || !turnstileToken}
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
            {status === "sent" && <div className="text-primary-container font-bold">Thanks — message saved.</div>}
            {status === "error" && <div className="text-red-500 font-bold">Error sending. Try again later.</div>}
          </div>
        </form>

        <div className="mt-12">
          <Link href="/" className="text-primary-container font-bold">Back to home</Link>
        </div>
      </main>
    </div>
  );
}
