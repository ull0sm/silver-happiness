import Link from "next/link";

export default function ExerciseLibraryDesign() {
  return (
    <div className="bg-background text-on-background font-lexend min-h-screen">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-black border-b-2 border-surface-container-high">
        <div className="text-2xl font-black italic text-primary-container tracking-tighter uppercase">IRON TRACK</div>
        <Link href="/" className="bg-primary-container text-black px-6 py-2 font-black italic uppercase">HOME</Link>
      </nav>

      <main className="pt-28 p-margin-mobile md:p-margin-desktop">
        <header className="mb-8">
          <h1 className="text-display-xl font-black leading-none uppercase italic">Exercise Library - Iron Track</h1>
          <p className="text-on-surface-variant mt-2">Browse the full arsenal of movements.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-surface-container border-2 border-black p-4">
              <div className="h-40 bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-7xl text-surface-container-highest">sports_handball</span>
              </div>
              <h3 className="font-black uppercase mt-3">Exercise {i + 1}</h3>
              <p className="text-on-surface-variant text-sm mt-1">Form tips and cues go here.</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
