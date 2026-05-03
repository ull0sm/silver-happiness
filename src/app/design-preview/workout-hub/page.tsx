import Link from "next/link";

export default function WorkoutHubDesign() {
  return (
    <div className="bg-background text-on-background font-lexend min-h-screen">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-black border-b-2 border-surface-container-high">
        <div className="text-2xl font-black italic text-primary-container tracking-tighter uppercase">IRON TRACK</div>
        <Link href="/" className="bg-primary-container text-black px-6 py-2 font-black italic uppercase">HOME</Link>
      </nav>

      <main className="pt-28 p-margin-mobile md:p-margin-desktop">
        <header className="mb-8">
          <h1 className="text-display-xl font-black leading-none uppercase italic">Workout Hub</h1>
          <p className="text-on-surface-variant mt-2">Select your weapon. Build your arsenal.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-container-high border-2 border-black p-6 flex flex-col">
              <div className="h-40 bg-surface-variant flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-6xl text-primary-container">fitness_center</span>
              </div>
              <h3 className="font-black uppercase">Plan {i + 1}</h3>
              <p className="text-on-surface-variant text-sm mt-2 flex-1">A brutal preset to push limits.</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-primary-container text-black font-black uppercase py-2">Start</button>
                <button className="px-4 border-2 border-surface-container-highest">Save</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
