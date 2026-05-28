import { ReactNode } from 'react';

type Tab = 'generator' | 'tracker';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  labels: { generator: string; tracker: string; appName: string };
  rightSlot?: ReactNode;
}

export function Header({ active, onChange, labels, rightSlot }: Props) {
  const link = (t: Tab, text: string) =>
    <button onClick={() => onChange(t)}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active === t ? 'border-gold text-ink' : 'border-transparent text-slate-ardoise hover:border-gold/40 hover:text-ink'
      }`}>{text}</button>;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex shrink-0 items-center gap-3">
          <img src="/star-logo.png" alt="Stars" className="h-9 w-9 object-contain" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-ardoise">Star Luxury Group</span>
            <span className="text-sm font-semibold tracking-wide text-ink">{labels.appName}</span>
          </span>
        </a>
        <nav className="flex items-end gap-1">
          {link('generator', labels.generator)}
          {link('tracker', labels.tracker)}
        </nav>
        <div className="ml-auto">{rightSlot}</div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </header>
  );
}
