export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-black/5 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-ardoise">Star Luxury Group</span>
          <span className="text-xs text-slate-ardoise/80">Monaco · 57 Rue Grimaldi</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-ardoise/80">© {year} · Outil interne Stars</span>
      </div>
    </footer>
  );
}
