export function Footer() {
  return (
    <footer className="hidden md:flex w-full py-8 px-12 bg-black border-t-2 border-zinc-800 flex-col md:flex-row justify-between items-center gap-4">
      <span className="text-red-600 text-xs font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} IRON TRACK INDUSTRIAL FITNESS. NO WEAKNESS.
      </span>
      <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-zinc-600">
        <a className="hover:text-white transition-opacity" href="#">PRIVACY</a>
        <a className="hover:text-white transition-opacity" href="#">TERMS</a>
        <a className="hover:text-white transition-opacity" href="#">SUPPORT</a>
      </div>
    </footer>
  );
}
