import Link from "next/link";
import Hero from "@/components/Hero";
import AuthNavAction from "@/components/AuthNavAction";

export default function HomePage() {
  return (
    <div className="bg-background text-on-background font-lexend overflow-x-hidden min-h-screen">
      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-black border-b-2 border-surface-container-high">
        <div className="text-2xl font-black italic text-primary-container tracking-tighter uppercase">
          FITTRACK
        </div>
        <div className="hidden md:flex items-center gap-8 font-black italic uppercase tracking-tighter text-sm">
          <a href="#features" className="text-on-surface-variant hover:text-primary-container transition-colors duration-150">WORKOUTS</a>
          <a href="#features" className="text-on-surface-variant hover:text-primary-container transition-colors duration-150">METRICS</a>
          <a href="#features" className="text-on-surface-variant hover:text-primary-container transition-colors duration-150">COMPETE</a>
        </div>
        <AuthNavAction />
      </nav>

      <main className="mt-20 flex flex-col">

        {/* ── Hero ──────────────────────────────────────────── */}
        <Hero />

        {/* ── Features Strip ───────────────────────────────── */}
        <section id="features" className="px-margin-mobile md:px-margin-desktop bg-surface-container-lowest py-24 border-y-2 border-surface-variant">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
              {[
                { icon: "radar", title: "Smart Tracking", desc: "Auto-detect sets, reps, and rest periods with military precision." },
                { icon: "assignment", title: "Curated Plans", desc: "Push/Pull/Legs, Bro Split, Full Body — ready to start instantly." },
                { icon: "emoji_events", title: "Live Leaderboards", desc: "Bleed for your rank. Compare volume against athletes worldwide." },
                { icon: "monitoring", title: "Body Analytics", desc: "Visualize your progress with heatmaps, streak counters and trend charts." },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`bg-surface-container border-2 border-black ${i === 0 ? "border-t-primary-container border-t-4" : ""} p-8 flex flex-col gap-stack-md hover:-translate-y-2 transition-transform duration-300`}
                >
                  <div className={`w-12 h-12 ${i === 0 ? "bg-primary-container" : "bg-surface-variant border-2 border-primary-container"} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-on-background uppercase italic mb-2">{f.title}</h3>
                    <p className="text-on-surface-variant text-base">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop py-32">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-[clamp(36px,6vw,64px)] font-black italic uppercase text-on-background">The Protocol</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-16 justify-between items-start relative">
              <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-surface-variant z-0" />
              {[
                { n: "1", title: "Pick a Plan", desc: "Select from brutal pre-built regimens or forge your own custom routine." },
                { n: "2", title: "Log Your Sets", desc: "Input weight and reps between sets. The interface stays out of your way." },
                { n: "3", title: "Break Records", desc: "Analyze the carnage. Adjust volume. Destroy your previous best.", active: true },
              ].map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3 group">
                  <div className={`w-32 h-32 bg-black border-2 ${step.active ? "border-primary-container glow-crimson" : "border-surface-variant group-hover:border-primary-container"} flex items-center justify-center mb-8 transition-colors duration-300`}>
                    <span className={`text-[60px] font-black italic leading-none ${step.active ? "text-primary-container" : "text-stroke-crimson"}`}>{step.n}</span>
                  </div>
                  <h3 className="font-black text-2xl text-on-background uppercase italic mb-4">{step.title}</h3>
                  <p className="text-on-surface-variant text-base max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof Bar ─────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop py-12 bg-primary-container flex flex-col items-center justify-center gap-8 border-y-2 border-black">
          <h3 className="font-black text-2xl text-black uppercase italic text-center">Joined by 50,000+ athletes worldwide</h3>
          <div className="flex flex-wrap justify-center gap-12 opacity-80">
            {["IRON", "GRIT", "APEX", "FORCE"].map((w) => (
              <div key={w} className="text-4xl text-black font-black italic tracking-widest uppercase">{w}</div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop py-32 text-center flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-surface-container to-background z-0" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-[clamp(36px,6vw,72px)] font-black italic uppercase text-on-background max-w-4xl leading-none">
              Ready to outwork
              <br />
              <span className="text-primary-container">your yesterday?</span>
            </h2>
            <Link
              href="/auth"
              className="bg-primary-container text-black font-black italic uppercase px-16 py-8 mt-8 border-4 border-black hover:bg-secondary-container transition-colors text-2xl tracking-tight"
            >
              Join Now
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-black border-t-2 border-surface-container-high">
        <div className="text-lg font-black italic text-primary-container tracking-tighter">
          ©2025 FITTRACK PERFORMANCE LAB. NO WEAKNESS.
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-bold uppercase text-xs tracking-widest">
          {["PRIVACY", "TERMS", "COACHING", "SUPPORT"].map((l) => (
            <a key={l} href="#" className="text-on-surface-variant hover:text-on-surface transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
