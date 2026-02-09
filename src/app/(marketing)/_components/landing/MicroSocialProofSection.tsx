'use client';

const COMPANIES = [
  { name: 'Northwind', style: 'font-bold tracking-tight text-[16px]' },
  { name: 'Meridian', style: 'font-extrabold tracking-tighter text-[17px]' },
  { name: 'Fieldstone', style: 'font-semibold italic text-[15px]' },
  { name: 'Atlas', style: 'font-bold tracking-[0.2em] uppercase text-[11px]' },
  { name: 'Lattice', style: 'font-semibold tracking-tight text-[16px]' },
  { name: 'Rampart', style: 'font-bold text-[15px]' },
  { name: 'Vercel', style: 'font-extrabold tracking-tighter text-[17px]' },
  { name: 'Notion', style: 'font-bold tracking-wide text-[15px]' },
  { name: 'Linear', style: 'font-semibold tracking-[0.15em] uppercase text-[11px]' },
  { name: 'Coda', style: 'font-extrabold tracking-tight text-[18px]' },
];

function LogoTile({ name, style }: { name: string; style: string }) {
  return (
    <div className="flex h-[68px] items-center justify-center">
      <span className={`select-none text-slate-400/80 transition-colors duration-300 hover:text-slate-600 ${style}`}>
        {name}
      </span>
    </div>
  );
}

export function MicroSocialProofSection() {
  return (
    <div>
      <div className="text-center">
        <h2 className="text-[2.75rem] font-medium tracking-tight text-slate-900 sm:text-[3.25rem]">
          Teams that{' '}
          <span className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text text-transparent">
            refuse to ship blind
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-relaxed text-slate-500">
          From compliance to content to code — the best teams enforce their standards before anything goes live.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-[900px]">
        <p className="mb-5 text-center text-[12px] font-medium tracking-widest uppercase text-slate-300">
          Trusted across industries
        </p>
        <div
          className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] grid-rows-2 gap-x-2 gap-y-0 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-5 lg:grid-rows-2 lg:overflow-visible lg:pb-0"
          aria-label="Company logos"
        >
          {COMPANIES.map((c) => (
            <LogoTile key={c.name} name={c.name} style={c.style} />
          ))}
        </div>
      </div>
    </div>
  );
}
