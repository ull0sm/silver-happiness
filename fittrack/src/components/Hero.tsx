import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-margin-mobile md:px-margin-desktop pt-24 pb-32 min-h-screen flex items-center">
      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <div className="col-span-1 md:col-span-7 flex flex-col gap-stack-lg z-10 animate-fade-in">
          <div className="flex flex-col gap-stack-sm">
            <span className="font-black text-label-bold text-primary-container uppercase tracking-widest italic">
              No Weakness
            </span>
            <h1 className="text-[clamp(48px,8vw,80px)] font-black leading-none uppercase italic text-on-background tracking-tight">
              Evolve Your
              <br />
              <span className="text-primary-container">Performance</span>
            </h1>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Track your reps, analyze your power output, and dominate live leaderboards. Built for athletes who view fitness as a battle.
          </p>
          <div>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-primary-container text-black font-black italic uppercase px-12 py-6 hover:bg-secondary-container transition-colors duration-150 text-sm tracking-widest"
            >
              Start Your Transformation
              <span className="material-symbols-outlined font-black">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Hero image block */}
        <div className="col-span-1 md:col-span-5 relative mt-12 md:mt-0">
          <div className="absolute inset-0 bg-surface-container border-2 border-surface-variant translate-x-4 translate-y-4 z-0" />
          <div className="relative z-10 border-2 border-black bg-surface-container-lowest h-[min(50vh,560px)] w-full overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, #201f1f 0%, #0e0e0e 100%)`,
              }}
            >
              <div className="w-full h-full flex flex-col gap-4 p-8 opacity-85">
                <div className="h-2 bg-primary-container w-3/4" />
                <div className="flex gap-4 flex-1">
                  <div className="flex-1 bg-surface-container-high border border-surface-variant flex flex-col gap-3 p-4">
                    <div className="text-primary-container font-black italic uppercase text-xs tracking-widest">BENCH PRESS</div>
                    <div className="text-4xl font-black italic text-on-surface">120<span className="text-primary-container text-lg">KG</span></div>
                    <div className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">↑ 5KG FROM LAST SESSION</div>
                    <div className="flex gap-1 mt-auto">
                      {[1,1,1,0.6,0.3].map((o,i) => (
                        <div key={i} className="flex-1 h-16 bg-primary-container" style={{opacity: o}} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex-1 bg-surface-container-high border border-surface-variant p-4">
                      <div className="text-xs text-primary-container font-black italic uppercase tracking-widest mb-1">STREAK</div>
                      <div className="text-3xl font-black italic text-on-surface">28<span className="text-sm text-on-surface-variant"> DAYS</span></div>
                    </div>
                    <div className="flex-1 bg-surface-container-high border border-surface-variant p-4">
                      <div className="text-xs text-on-surface-variant font-black italic uppercase tracking-widest mb-1">VOLUME</div>
                      <div className="text-2xl font-black italic text-on-surface">12.4<span className="text-sm text-primary-container">T</span></div>
                    </div>
                    <div className="flex-1 bg-primary-container border-2 border-black p-4 flex items-center justify-center">
                      <div className="text-black font-black italic uppercase text-sm tracking-widest text-center">NEW PR!</div>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-surface-container-high w-1/2" />
              </div>
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(230,0,0,0.15)] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
