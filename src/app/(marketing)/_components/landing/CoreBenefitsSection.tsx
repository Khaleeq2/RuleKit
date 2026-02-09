'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Mail, Rocket } from 'lucide-react';

interface UseCase {
  id: string;
  icon: React.ReactNode;
  label: string;
  headline: string;
  sub: string;
  outcomes: string[];
  bg: string;
  ruleSetName: string;
  rules: string[];
}

const USE_CASES: UseCase[] = [
  {
    id: 'invoices',
    icon: <FileText className="h-5 w-5" />,
    label: 'Invoice & Expense Validation',
    headline: 'Stop audit surprises before they start',
    sub: 'Every expense report checked against your policy — automatically, every time.',
    outcomes: [
      'Missing receipts flagged before reimbursement',
      'Unapproved vendors caught instantly',
      'Over-budget items surfaced with exact amounts',
    ],
    bg: 'from-[#3b7dd8] to-[#5ba3e6]',
    ruleSetName: 'Expense Policy',
    rules: [
      'Every expense over $25 must include a receipt',
      'Vendor must appear on the approved vendor list',
      'Total must not exceed department budget limit',
      'Requires manager sign-off for amounts over $500',
    ],
  },
  {
    id: 'content',
    icon: <Mail className="h-5 w-5" />,
    label: 'Newsletter & Content QC',
    headline: 'Never send broken content again',
    sub: 'Catch the mistakes your team misses — before your audience sees them.',
    outcomes: [
      'Broken links caught across every URL',
      'Subject lines validated against best practices',
      'Spelling and grammar issues flagged with context',
    ],
    bg: 'from-[#2fb6c6] to-[#5dd5c2]',
    ruleSetName: 'Content Standards',
    rules: [
      'Subject line must be under 60 characters',
      'All links must resolve without errors',
      'Body must contain at least one call-to-action',
      'No spelling or grammar errors in visible copy',
    ],
  },
  {
    id: 'launch',
    icon: <Rocket className="h-5 w-5" />,
    label: 'Launch Asset QA',
    headline: 'Ship with confidence, not crossed fingers',
    sub: 'Gate every launch asset so nothing goes live with placeholder text or missing metadata.',
    outcomes: [
      'Lorem ipsum and TODO text caught automatically',
      'Missing alt text flagged on every image',
      'Page load and accessibility checks in seconds',
    ],
    bg: 'from-[#4d77d9] to-[#7c9be6]',
    ruleSetName: 'Launch Checklist',
    rules: [
      'No placeholder text (lorem ipsum, TBD, TODO)',
      'All images must have descriptive alt text',
      'Headline must be between 40–70 characters',
      'Page must load in under 3 seconds',
    ],
  },
];

function RulePreview({ name, rules }: { name: string; rules: string[] }) {
  return (
    <div className="w-full max-w-[360px] rounded-2xl bg-white/95 px-6 py-5 shadow-[0_8px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[var(--brand)]" />
        <p className="text-[12px] font-semibold tracking-wide uppercase text-slate-400">{name}</p>
      </div>
      <div className="mt-4 space-y-3">
        {rules.map((rule, i) => (
          <div key={rule} className="flex items-start gap-3">
            <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-400">
              {i + 1}
            </span>
            <p className="text-[13px] leading-snug text-slate-600">
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoreBenefitsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % USE_CASES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = window.setInterval(advance, 8000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, advance]);

  const current = USE_CASES[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-[520px]">
        <h2 className="text-[3.25rem] font-medium leading-[1.05] tracking-tight text-slate-900">
          One platform.{' '}
          <span className="bg-gradient-to-r from-[#2b4c7e] via-[#3d6bab] to-[#4a7bc7] bg-clip-text italic text-transparent">
            Every standard.
          </span>
        </h2>
        <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-slate-500">
          Expenses, newsletters, launch assets — whatever your team reviews, RuleKit checks it with evidence, not opinions.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-[24px]">
        <div
          key={current.id}
          className={`relative bg-gradient-to-br ${current.bg} px-8 py-10 sm:px-12 sm:py-14 transition-colors duration-500`}
        >
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="text-white">
              <h3 className="text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.25rem]">
                {current.headline}
              </h3>
              <p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-white/70">
                {current.sub}
              </p>

              <ul className="mt-6 space-y-3">
                {current.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-[13.5px] text-white/90">
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-white/70" />
                    <span className="leading-snug">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center lg:justify-end">
              <RulePreview name={current.ruleSetName} rules={current.rules} />
            </div>
          </div>

        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {USE_CASES.map((uc, i) => (
          <button
            key={uc.id}
            type="button"
            onClick={() => setActive(i)}
            className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left transition-all duration-300 ${
              i === active
                ? 'bg-white shadow-sm ring-1 ring-slate-900/[0.06]'
                : 'bg-white/40 hover:bg-white/70'
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
              i === active
                ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
            }`}>
              {uc.icon}
            </div>
            <div>
              <p className={`text-[15px] font-semibold leading-snug transition-colors duration-300 ${
                i === active ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'
              }`}>
                {uc.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
