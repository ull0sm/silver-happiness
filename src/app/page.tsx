import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function LandingPage() {
  return (
    <>
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-8 h-20 bg-black border-b-2 border-zinc-900">
        <Link href="/" className="text-2xl font-black italic text-red-600 tracking-tighter">
          IRON TRACK
        </Link>
        <div className="hidden md:flex items-center gap-8 font-black italic uppercase tracking-tighter">
          <a className="text-red-600 border-b-2 border-red-600 pb-1" href="#features">
            WORKOUTS
          </a>
          <a className="text-zinc-400 hover:text-red-500 transition-colors" href="#analytics">
            METRICS
          </a>
          <a className="text-zinc-400 hover:text-red-500 transition-colors" href="#compete">
            COMPETE
          </a>
          <Link className="text-zinc-400 hover:text-red-500 transition-colors" href="/login">
            LOGIN
          </Link>
        </div>
        <Link
          href="/signup"
          className="hidden md:block bg-red-600 text-black px-6 py-2 font-black italic uppercase tracking-tighter hover:bg-red-500 transition-colors"
        >
          JOIN THE BATTLE
        </Link>
        <Link href="/login" className="md:hidden text-zinc-400">
          <Icon name="menu" className="text-3xl" />
        </Link>
      </nav>

      <main className="mt-20 flex flex-col gap-[120px] pb-32">
        {/* Hero */}
        <section className="px-margin-mobile md:px-margin-desktop pt-24 min-h-[700px] flex items-center">
          <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="col-span-1 md:col-span-7 flex flex-col gap-stack-lg z-10">
              <div className="flex flex-col gap-stack-sm">
                <span className="font-label-bold text-label-bold text-primary-container uppercase tracking-widest italic">
                  No Weakness
                </span>
                <h1 className="font-display-xl text-display-xl text-on-background uppercase italic break-words leading-none">
                  Evolve Your
                  <br />
                  <span className="text-primary-container">Performance</span>
                </h1>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                Track your reps, analyze your power output, and dominate live leaderboards. Built for athletes who view fitness as a battle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="brutalist-button bg-primary-container text-black font-label-bold text-label-bold italic uppercase px-12 py-6 inline-flex items-center gap-2"
                >
                  Start Your Transformation
                  <Icon name="arrow_forward" />
                </Link>
                <Link
                  href="/compete"
                  className="brutalist-button border-2 border-primary-container text-primary-container font-label-bold text-label-bold italic uppercase px-12 py-6 inline-flex items-center gap-2 hover:bg-primary-container hover:text-black"
                >
                  See Leaderboard
                </Link>
              </div>
            </div>
            <div className="col-span-1 md:col-span-5 relative mt-16 md:mt-0">
              <div className="absolute inset-0 bg-surface-container border-2 border-surface-variant translate-x-4 translate-y-4 z-0" />
              <div className="relative z-10 border-2 border-black bg-surface-container-lowest h-[500px] md:h-[600px] w-full overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAzECCzbJHZrrxdgQSDSmAUdLIIgTbii_Rr2pdSWNeb1RxpyvaKedqZtpmDOWJJy4H-gsTAq9BGu1J-F1Ol85IAfIUz-SmHkA9o3o-MbF-3D1ZvHZugKXiHG1m5TWbSa_S5UgSZkv73Ty4tmuXokSiyZKGeYM0X50M-Q21SNpL6RsOTgQze-BWRswJtw7y-GnZdVAUJXsAA7hVIc2JJV1w2AoFRyGCkG9qQbul3cVk5E30pTUSdJ6fEmOuNX5zyQ95JWWGKReFWf4sy')",
                  }}
                />
                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(230,0,0,0.15)] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section
          id="features"
          className="px-margin-mobile md:px-margin-desktop bg-surface-container-lowest py-24 border-y-2 border-surface-variant"
        >
          <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {[
              {
                icon: "radar",
                title: "Smart Tracking",
                copy: "Auto-suggest the next weight via progressive overload after every set.",
                accent: true,
              },
              {
                icon: "assignment",
                title: "Curated Plans",
                copy: "PPL, Bro Split, Full Body — engineered to start instantly.",
              },
              {
                icon: "trophy",
                title: "Live Leaderboards",
                copy: "Bleed for your rank. Compare weekly volume against athletes worldwide.",
              },
              {
                icon: "monitoring",
                title: "Body Analytics",
                copy: "Heatmap calendars, streaks, body stats. See what you’re becoming.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className={`bg-surface-container border-2 border-black ${c.accent ? "border-t-primary-container" : ""} p-8 flex flex-col gap-stack-md hover:-translate-y-2 transition-transform duration-300`}
              >
                <div
                  className={`w-12 h-12 ${c.accent ? "bg-primary-container" : "bg-surface-variant border-2 border-primary-container"} flex items-center justify-center`}
                >
                  <Icon
                    name={c.icon}
                    filled
                    className={c.accent ? "text-black" : "text-primary-container"}
                  />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background uppercase italic mb-2">
                    {c.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{c.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="analytics"
          className="px-margin-mobile md:px-margin-desktop py-24"
        >
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="flex flex-col md:flex-row gap-16 justify-between items-start relative">
              <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-surface-variant z-0" />
              {[
                { n: 1, title: "Pick a Plan", copy: "Curated splits or your own routine forged in the builder." },
                { n: 2, title: "Log Your Sets", copy: "Tap weight, reps, done. Overload widget tells you what to lift." },
                { n: 3, title: "Break Records", copy: "Streaks, PRs, badges. Climb the global ladder." },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3 group"
                >
                  <div className="w-32 h-32 bg-black border-2 border-surface-variant flex items-center justify-center mb-8 group-hover:border-primary-container transition-colors duration-300">
                    <span
                      className={`font-display-xl text-display-xl ${s.n === 3 ? "text-primary-container" : "text-stroke"} italic`}
                    >
                      {s.n}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background uppercase italic mb-4">
                    {s.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{s.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="compete"
          className="px-margin-mobile md:px-margin-desktop py-32 text-center flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-container to-background z-0" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="font-display-xl text-display-xl text-on-background uppercase italic max-w-4xl leading-none">
              Ready to outwork your yesterday?
            </h2>
            <Link
              href="/signup"
              className="brutalist-button bg-primary-container text-black font-headline-md text-headline-md italic uppercase px-16 py-8 mt-8 border-4 border-black"
            >
              Join Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-black border-t-2 border-zinc-900">
        <div className="text-lg font-black italic text-red-600">
          ©{new Date().getFullYear()} IRON TRACK. NO WEAKNESS.
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-bold uppercase text-xs tracking-widest">
          <a className="text-zinc-500 hover:text-white transition-colors" href="#">PRIVACY</a>
          <a className="text-zinc-500 hover:text-white transition-colors" href="#">TERMS</a>
          <Link className="text-zinc-500 hover:text-white transition-colors" href="/compete">COMPETE</Link>
          <a className="text-zinc-500 hover:text-white transition-colors" href="#">SUPPORT</a>
        </div>
      </footer>
    </>
  );
}
